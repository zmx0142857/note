# Cesium

3D geospatial visualization for the web

## 入门

    $ npm i cesium

`index.html`
```html
<!DOCTYPE html>
<head>
  <title>Cesium Demo</title>
  <meta charset="utf-8" />
  <script src="./node_modules/cesium/Build/Cesium/Cesium.js"></script>
  <link href="./node_modules/cesium/Build/Cesium/Widgets/widgets.css" rel="stylesheet" />
  <style>
    html,
    body,
    #cesiumContainer {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div id="cesiumContainer"></div>
  <script>
    var viewer = new Cesium.Viewer("cesiumContainer");
  </script>
</body>
```

## 案例

### 坐标变换

乘变换矩阵
```js
function transformModelMatrix(mat, { translate = [], rotate = [], scale = [] }) {
  const transform = Cesium.Matrix4.fromTranslationQuaternionRotationScale(
    new Cesium.Cartesian3(...translate), // 3. 平移
    new Cesium.Quaternion(...rotate), // 2. 旋转
    new Cesium.Cartesian3(...scale), // 1. 缩放
   )
   Cesium.Matrix4.multiplyTransformation(mat, transform, mat)
}
const angle = Math.PI / 3
transformModelMatrix(model.modelMatrix, {
  translate: [10, 20, 30],
  rotate: [0, 0, Math.sin(angle / 2), Math.cos(angle / 2)],
  scale: [1, 1, 1],
})
```

生成变换矩阵 `root.transform`
```js
const vec3 = Cesium.Cartesian3

// 此变换矩阵将模型原点变换到指定的经纬度
// 原模型坐标系的 x, y, z 对应到新坐标系的东、北、天
function getTransform (lon, lat, height = 0, scale = 1) {
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(vec3.fromDegrees(lon, lat, height))
  const s = Cesium.Matrix4.fromScale(new vec3(scale, scale, scale))
  Cesium.Matrix4.multiplyTransformation(m, s, m)
  return Array.from(m)
}
const m = getTransform(116, 39, 0, 0.001)
// [-0.0008987940462991669, -0.0004383711467890776, 0, 0,
// 0.000275875901522268, -0.0005656294206902574, 0.0007771459614569709, 0,
// -0.0003406783663463926, 0.0006984941632629673, 0.0006293203910498374, 0,
// -2175779.497312825, 4461009.061769954, 3992317.0227517267, 1]

// 验证: 计算结果应该相同
console.log(
  Cesium.Matrix4.multiplyByPoint(
    Cesium.Matrix4.fromArray(m),
    new vec3(),
    new vec3()
  ),
  new vec3(...m.slice(12, 15)),
  vec3.fromDegrees(116, 39, 0),
)
```

### 相机

```js
const vec3 = Cesium.Cartesian3

// 设置相机位置
camera.setView({
  // camera.positionWC
  destination: new vec3(-2181968.8903, 4385313.1784, 4072712.8241),
  orientation: {
    heading: 3.1756, // camera.heading
    pitch: -0.3715, // camera.pitch
    roll: 0, // camera.roll
  }
})

// 让相机对准模型
// 一个副作用是, 调用此函数后, 左键操作变成旋转, 而 ctrl-左键失效.
const position = new vec3(...Array.from(modelMatrix).slice(12, 15))
camera.viewBoundingSphere(
  new Cesium.BoundingSphere(position, 300),
  new Cesium.HeadingPitchRange(Math.PI / 4, -Math.PI / 4)
)

// 让相机对准模型, 优化版本
const setView = (camera, { position, modelMatrix, distance = 100, heading = 0, pitch = 0, roll = 0 } = {}) => {
  position ||= new vec3(...Array.from(modelMatrix).slice(12, 15))
  const offset = new vec3(0, -distance, 0)
  const rotation = mat3.fromHeadingPitchRoll(new Cesium.HeadingPitchRoll(heading, roll, pitch))
  mat3.multiplyByVector(rotation, offset, offset)
  const trans = Cesium.Transforms.eastNorthUpToFixedFrame(position)
  mat4.multiplyByPoint(trans, offset, offset)
  camera.setView({
    destination: offset,
    orientation: {
      heading,
      pitch,
      roll,
    }
  })
}
```

### Entity

entity 不好用... 比如没有 onLoad 事件.  但 debug 时用 entity 画一些简单图形还是很实用的

```js
viewer.entities.add({
  name: 'point',
  position,
  point: {
    pixelSize: 10,
    color: Cesium.Color.YELLOW,
    disableDepthTestDistance: Infinity, // 一直显示不被遮挡
  },
});

viewer.entities.add({
  name: 'rectangle',
  rectangle: {
    coordinates: Cesium.Rectangle.fromDegrees(west, south, east, north),
    material: Cesium.Color.WHITE.withAlpha(0.5),
  },
})

viewer.entities.add({
  name: 'box',
  position: Cesium.Cartesian3.fromDegrees(110, 24),
  box: {
    dimensions: new Cesium.Cartesian3(1000, 1000, 1000),
    fill: true,
    material: Cesium.Color.WHITE.withAlpha(0.5),
    outline: true,
  },
})
```

[禁用深度检测](https://community.cesium.com/t/disable-depth-test-for-polylines-and-polygons/7312/4)
```js
// Modify polylines so that their depth test is always disabled.
var oldPolylineUpdate = Cesium.PolylineCollection.prototype.update;
Cesium.PolylineCollection.prototype.update = function(frameState) {
  var oldMorphTime = frameState.morphTime;
  frameState.morphTime = 0.0;
  oldPolylineUpdate.call(this, frameState);
  frameState.morphTime = oldMorphTime;
};

// Modify polygons (and all other primitive objects) so that their depth test is always disabled.
var oldPrimitiveUpdate = Cesium.Primitive.prototype.update;
Cesium.Primitive.prototype.update = function (frameState) {
this.appearance._renderState.depthTest.enabled = false;
  oldPrimitiveUpdate.call(this, frameState);
};
```

### Primitive

用长方形铺满地球表面
```js
const createPrimitive = ({ instance, appearance = {}, ...options } = {}) => {
  const geometryInstances = instance.map(({
    id,
    geometry,
    modelMatrix,
    color = Cesium.Color.WHITE,
    ...attrs
  }) => new Cesium.GeometryInstance({
    id,
    geometry: new Cesium[geometry.type](geometry),
    modelMatrix,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(color),
      ...attrs,
    },
  }))
  return new Cesium.Primitive({
    geometryInstances,
    appearance: new Cesium[appearance.type || 'PerInstanceColorAppearance'](appearance),
    ...options,
  })
}

const instance = []
for (let lon = -180; lon < 180; lon += 5) {
  for (let lat = -90; lat < 90; lat += 5) {
    instance.push({
      geometry: {
        type: 'RectangleGeometry',
        rectangle: Cesium.Rectangle.fromDegrees(lon, lat, lon + 5, lat + 5),
      },
      color: Cesium.Color.fromRandom({ alpha: 0.5 })
    })
  }
}

viewer.scene.primitives.add(
  createPrimitive({ instance })
)
```

### 背景透明

```js
const viewer = new Cesium.Viewer('container', {
  orderIndependentTranslucency: false,
  contextOptions: {
    webgl: {
      alpha: true,
    },
  },
})

viewer.scene.skyBox.show = false
viewer.scene.backgroundColor = new Cesium.Color(0, 0, 0, 0)
viewer.scene.globe.translucency.backFaceAlpha = 0.5
viewer.scene.globe.translucency.enabled = true
viewer.scene.globe.undergroundColor = undefined
viewer.scene.globe.showGroundAtmosphere = false
viewer.scene.globe.baseColor = Cesium.Color.TRANSPARENT
viewer.scene.sun.show = false
viewer.scene.moon.show = false
viewer.scene.skyAtmosphere.show = false
```

### 地表半透明

```js
viewer.scene.globe.baseColor = MathUtils.rgba(maskColor);
viewer.scene.globe.translucency.backFaceAlpha = 0.5;
viewer.scene.globe.translucency.enabled = true;
viewer.imageryLayers._layers.forEach(layer => {
  // layer.show = false;
  layer.alpha = 0.3;
});
```

### 抗锯齿 fxaa

```
if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
  viewer.resolutionScale = window.devicePixelRatio
}
viewer.scene.postProcessStages.fxaa.enabled = true
```

### 帧率

```js
viewer.scene.debugShowFramesPerSecond = true
```

### 坐标拾取 pick

```js
/**
 * 获取物体坐标
 * @param {number} type 0: 求与地形的交点, 1: 求与场景/模型的交点, 2: 和 1 相同, 是一种兼容模式
 * @returns {Cartesian3}
 *
 * picking 是基于深度缓冲的
 * 注意, 若鼠标点击的物体禁用了深度缓冲 (如 disableDepthTestDistance: Infinity), 则取不到坐标.
 * 设置 scene.pickTranslucentDepth = true 后, 可以取到透明物体的坐标, 但会增加性能负担.
 */
function pick (e, type = 0) {
  const ray = viewer.camera.getPickRay(e.position || e.endPosition);
  if (type === 0) {
    return viewer.scene.globe.pick(ray, viewer.scene);
  } else if (type === 1) {
    // pickFromRay 是 scene 的一个方法, 不在官方文档里
    return viewer.scene.pickFromRay(ray)?.position;
  } else if (type === 2) {
    // 也是一种方法, 但它有时取不到坐标
    return viewer.scene.pickPosition(e.position || e.endPosition);
  }
}
```

### 遍历 traverse

遍历场景
```js
function traverseScene(callback, { type = 'gltf' }) {
  if (type === 'gltf') {
    return Promise.all(viewer.scene.primitives._primitives.filter(v => v.type === 'GLTF').map(callback))
  } else if (type === '3dtiles') {
    return Promise.all(viewer.scene.primitives._primitives.filter(v => v.isCesium3DTileset).map(callback))
  } else if (type === 'entity') {
    return Promise.all(viewer.entities._entities._array.map(callback))
  }
}
```

遍历 gltf
```js
// 数组形式
model.pickIds

// 或者树形结构
model.loader?.components?.scene?.nodes
```

遍历 3dtiles
```js
function getContents (root) {
  const res = []
  const traverse = (node) => {
    res.push(node.content)
    if (node.content._contents) {
      res.push(...node.content._contents)
    }
    node.children?.forEach(traverse)
  }
  traverse(root)
  return res
}

function getFeatures (content) {
  const res = []
  for (let i = 0; i < content.featuresLength; ++i) {
    res.push(content.getFeature(i))
  }
  return res
}

// 隐藏构件
getContents(tileset.root).forEach(c => getFeatures(c).forEach(f => f.show = false))
```

## 常见模型类型

### ShapeFile (shp)

shape file 由三个或更多文件组成:
- shp: 几何形状信息
- shx: 几何体位置索引, 记录几何体在 shp 文件中的位置
- dbf: 几何体属性数据
这三个文件都是二进制格式. 其他文件都是可选的.

### gltf

[gltf 格式说明](markdown.html#man/format/gltf.md)

### 3dtiles

[3dtiles 格式说明](markdown.html#man/format/3dtiles.md)

显示模型包围盒
```js
// Cesium
const showBoundingBox = (tileset) => {
  tileset.debugShowBoundingVolume = true // 显示包围盒线框

  const { center, halfAxes } = tileset.root._boundingVolume._orientedBoundingBox // 获取 root 包围盒
  const vec3 = (...args) = new Cesium.Cartesian3(...args)

  // 绘制包围盒各顶点
  const points = [
    vec3(1, 1, 1),
    vec3(1, -1, 1),
    vec3(-1, -1, 1),
    vec3(-1, 1, 1),
    vec3(1, 1, -1),
    vec3(1, -1, -1),
    vec3(-1, -1, -1),
    vec3(-1, 1, -1),
  ]
  points.forEach((p) => {
    const offset = Cesium.Matrix3.multiplyByVector(halfAxes, p, vec3())
    const position = Cesium.Cartesian3.add(center, offset, vec3())
    viewer.entities.add({
      position,
      point: {
        pixelSize: 10,
        color: Cesium.Color.RED,
      },
    })
  })
}
```

tileset style
```js
// Apply a red style and then manually set random colors for every other feature when the tile becomes visible.
tileset.style = new Cesium.Cesium3DTileStyle({
  color : 'color("red")'
});
tileset.tileVisible.addEventListener(function(tile) {
  const content = tile.content;
  const featuresLength = content.featuresLength;
  for (let i = 0; i < featuresLength; i+=2) {
    content.getFeature(i).color = Cesium.Color.fromRandom();
  }
});
```

对单个 feature 进行特效处理
```js
const tileset = viewer.scene.primitives._primitives.find(v => v.isCesium3DTileset);
tileset.customShader = new Cesium.CustomShader({
  lightingModel: Cesium.LightingModel.UNLIT,
  fragmentShaderText: `
  void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
    int featureId = fsInput.featureIds.SELECTED_FEATURE_ID;
    if (featureId == 2) {
      material.diffuse = vec3(1.0, 0.5, 0.1);
    }
  }
  `
});
```


### GeoJSON

- [geojson.io: GeoJSON 在线可视化](geojson.io)
- geojson.io for vscode extension

载入
```js
Cesium.GeoJsonDataSource.load('/models/geojson/geo.json', {
  stroke: Cesium.Color.YELLOW,
  fill: Cesium.Color.TRANSPARENT,
  strokeWidth: 3,
  // clampToGround: true, // 有地形时, clampToGround 可能会导致 polygon 边界不显示
}).then(dataSource => {
  return viewer.dataSources.add(dataSource)
}).then(data => {
  console.log(data)
})
```

#### 数据源

[datav geo tools](https://datav.aliyun.com/portal/school/atlas/area_selector): 省市边界数据. 下载后, 一般要进行地图坐标转化, 再把 MultiPolygon 转换为 MultiLineString.

```js
function convertGeojson (geojson) {
  const features = geojson.features.map(feature => {
    let { coordinates } = feature.geometry
    if (feature.geometry.type === 'MultiPolygon') {
      coordinates = coordinates.map(v => v[0])
    }
    // coordinates = [ [[lon, lat], [lon, lat], ...] ]
    coordinates = coordinates.map(v => v.map(lonlat => convertCoord(lonlat)))
    return {
      geometry: {
        type: 'MultiLineString',
        coordinates,
      },
      properties: {
        ...feature.properties,
        center: convertCoord(feature.properties.center),
        centroid: convertCoord(feature.properties.centroid),
      },
    }
  })
  return { ...geojson, features }
}
```

#### 文件结构

Geometry: 在地图上呈现的 7 种几何形状.
```js
// 点
{
  "type": "Point",
  "coordinates": [30, 10] // longitude, latitude[, height]
}

{
  "type": "MultiPoint", 
  "coordinates": [ 
    [10, 40], [40, 30], [20, 20], [30, 10] 
  ] 
}

// 折线
{
  "type": "LineString", 
  "coordinates": [ 
    [30, 10], [10, 30], [40, 40] 
  ] 
}

{
  "type": "MultiLineString", 
  "coordinates": [ 
    [[10, 10], [20, 20], [10, 40]], 
    [[40, 40], [30, 30], [40, 20], [30, 10]] 
  ] 
}

// 多边形
{
  "type": "Polygon", 
  "coordinates": [
    [[35, 10], [45, 45], [15, 40], [10, 20], [35, 10]], // 外边界
    [[20, 30], [35, 35], [30, 20], [20, 30]] // 洞
  ]
}

{
  "type": "MultiPolygon", 
  "coordinates": [
    [
      [[30, 20], [45, 40], [10, 40], [30, 20]] // 第一个多边形
    ], 
    [
      [[15, 5], [40, 10], [10, 20], [5, 10], [15, 5]] // 第二个多边形
    ]
  ]
}

// 形状集合
{
  "type": "GeometryCollection", 
  "geometries": [...]
}
```

Feature: 特征/构件
```js
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [125.6，10.1]
  },
  "properties": {
    "name": "Dinagat Islands"
  }
}

{
  "type": "FeatureCollection",
  "bbox": [100.0, 0.0, 105.0, 1.0], // bounding box
  "features": [...]
}
```

#### 案例: 地图遮罩

[来自右弦 GISer](https://blog.csdn.net/weixin_45782925/article/details/124450047)
```js
vec3 = Cesium.Cartesian3

/**
 * 地图遮罩 (基于 entity)
 * @param {vec3[][]} polygons
 */
const mapMaskEntity = (polygons) => {
  console.log(polygons)
  viewer.entities.add({
    polygon: {
      hierarchy: {
        // 覆盖 1/4 个地球 (设置为 180 会报错)
        positions: vec3.fromDegreesArray([0, 0, 0, 90, 179, 90, 179, 0]),
        // 或者只覆盖国内
        // positions: vec3.fromDegreesArray([73, 90, 73, 0, 135, 0, 135, 90]),
        // 把待突出显示的区域挖空
        holes: polygons.map(positions => ({ positions })),
      },
      material: new Cesium.Color(15 / 255, 38 / 255, 84 / 255, 0.7),
    }
  })
  const lines = polygons.map(positions => new Cesium.Entity({
    polyline: {
      positions,
      width: 4,
      material: Cesium.Color.YELLOW,
    }
  }))
  lines.forEach(line => viewer.entities.add(line))
  viewer.flyTo(lines[0])
}

/**
 * 地图遮罩 (基于 primitive)
 * @param {vec3[][]} polygons
 */
const mapMaskPrimitive = (polygons) => {
  viewer.scene.primitives.add(createPrimitive([
    {
      geometry: {
        type: 'PolygonGeometry',
        polygonHierarchy: new Cesium.PolygonHierarchy(
          vec3.fromDegreesArray([73, 90, 73, 0, 135, 0, 135, 90]),
          polygons.map(hole => new Cesium.PolygonHierarchy(hole)),
        ),
      },
      color: Cesium.Color.BLACK.withAlpha(0.5),
    },
    ...[
      [-180, -90, 73, 90],
      [135, -90, 180, 90],
      [73, -90, 135, 0],
    ].map(rect => ({
      geometry: {
          type: 'RectangleGeometry',
          rectangle: Cesium.Rectangle.fromDegrees(...rect),
      },
      color: Cesium.Color.BLACK.withAlpha(0.5),
    }))
  ], {
    appearance: {
      flat: true,
      translucent: false,
    }
  }))
  const lines = createPrimitive(polygons.map(positions => ({
    geometry: {
      type: 'PolylineGeometry',
      positions,
      vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT,
      width: 4,
    },
    color: Cesium.Color.YELLOW,
  })), {
    appearance: {
      type: 'PolylineColorAppearance'
    }
  })
  lines.readyPromise.then(() => {
    viewer.camera.flyToBoundingSphere(lines._boundingSpheres[0])
  })
  viewer.scene.primitives.add(lines)
  viewer.scene.requestRender()
}

fetch('/models/geojson/geo.json').then(res => res.json()).then(json => {
  const polygons = json.features.map(feature => feature.geometry.coordinates).flat().map(polygon => vec3.fromDegreesArray(polygon.flat()))
  console.log(polygons)
  mapMaskEntity(polygons)
})
```

## Shader

### Fabric API

```js
const customPrimitive = ({
  id,
  position,
  geometry,
  uniforms,
  shader: {
    material,
    vertex,
    fragment,
  },
}) => {
  const { viewer } = window;
  const geometryInstances = new Cesium.GeometryInstance({ id, geometry })
  const appearance = new Cesium.MaterialAppearance({
    material: new Cesium.Material({
      translucent: false, // 不透明
      fabric: {
        uniforms,
        source: `czm_material czm_getMaterial(czm_materialInput materialInput) {
          czm_material material = czm_getDefaultMaterial(materialInput);
          ${material}
          return material;
        }`,
      }
    }),
    vertexShaderSource: vertex,
    fragmentShaderSource: fragment,
  });

  viewer.scene.primitives.add(new Cesium.Primitive({
    geometryInstances,
    appearance,
    releaseGeometryInstances: false,
    compressVertices: false,
    modelMatrix: position ? Cesium.Transforms.eastNorthUpToFixedFrame(position) : undefined,
  }));
}

const testShader = () => customPrimitive({
  geometry: new Cesium.CircleGeometry({
    center: Cesium.Cartesian3.fromDegrees(119.3077, 26.0541, 10),
    radius: 100000,
  }),
  // position: Cesium.Cartesian3.fromDegrees(119.3077, 26.0541, 10000),
  // geometry: new Cesium.CylinderGeometry({
  //   length: 400000.0,
  //   topRadius: 0.0,
  //   bottomRadius: 200000.0,
  // }),
  uniforms: {
    fillColor: Cesium.Color.RED,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 0.1,
  },
  shader: {
    material: `
    // 谁说我 shader 有问题?
    // material.diffuse = vec3(1.0, 0.0, 1.0);

    // 灰白棋盘格
    // vec2 xy = step(fract(materialInput.st * 10.0), vec2(0.5));
    // float strip = 2.0 * fract(0.5 * (xy.x + xy.y));
    // material.diffuse = mix(vec3(0.8), vec3(1.0), strip);

    // 带描边的圆盘
    float dist = length(materialInput.st * 2.0 - 1.0);
    material.diffuse = mix(outlineColor.rgb, fillColor.rgb, step(dist, 1.0 - outlineWidth));
  `,
  },
});
```

### Custom Shader

https://github.com/CesiumGS/cesium/tree/main/Documentation/CustomShaderGuide

```js
const shader = new Cesium.CustomShader({
  lightingModel: Cesium.LightingModel.PBR, // 或 UNLIT
  uniforms: {
    u_colors: {
      type: Cesium.UniformType.SAMPLER_2D,
      value: Cesium.TextureUniform({
        typedArray: new Float32Array(arr),
        width: arr.length / 4,
        height: 1,
        pixelFormat: Cesium.PixelFormat.RGBA,
        pixelDataType: Cesium.PixelDataType.UNSIGNED_BYTE,
      }),
    }
  },
  vertexShaderText: `
    void vertexMain (VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
      ...
    }
  `,
  fragmentShaderText: `
    void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
      material.diffuse = vec3(1.0, 0.0, 1.0);
    }
  `,
})

shader.setUniform('u_colors', colors)

const model = await Cesium.Model.fromGltfAsync({
  url,
  modelMatrix,
  colorBlendMode: Cesium.ColorBlendMode.MIX,
  customShader: shader,
})
```

手动 PBR
```glsl
czm_pbrParameters pbrParameters;
pbrParameters.diffuseColor = material.diffuse;
pbrParameters.f0 = material.specular;
pbrParameters.roughness = material.roughness;
material.diffuse = czm_pbrLighting(
  fsInput.attributes.positionEC,
  material.normalEC,
  czm_lightDirectionEC,
  czm_lightColorHdr,
  pbrParameters
);
```


## 3dtiles 指南

### gltf 转 3dtiles - 使用 3d-tiles-tools

- gltf 转为 glb
  ```
  $ npx gltf-pipeline -i model.gltf -o model.glb
  ```
- 生成 tileset.json.  3dtiles 1.1 标准下, 不再需要把 glb 转为 b3dm, 直接输入 glb 文件即可:
  ```
  $ git clone https://github.com/CesiumGS/3d-tiles-tools --depth=1
  $ cd 3d-tiles-tools && npm i
  $ ls tmp/
  1.glb 2.glb 3.glb
  $ npx ts-node ./src/cli/main.ts createTilesetJson -i ./tmp/ -o ./tmp/tileset.json
  ```
- 坐标转换. 在浏览器 console 输入下面代码, 得到转换矩阵
  ```js
  function getTransform (lon, lat, height = 0, scale = 1) {
    const m = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(lon, lat, height))
    const s = Cesium.Matrix4.fromScale(new Cesium.Cartesian3(scale, scale, scale))
    Cesium.Matrix4.multiplyTransformation(m, s, m)
    return Array.from(m)
  }
  getTransform(116.43329620361327, 39.916698455810547, 0, 0.001)
  ```
  打开 `tmp/tileset.json`, 将得到的矩阵添加到 `root.transform` 属性:
  ```
  "transform": [-0.0008954532188864411, -0.0004451556276022032, 0, 0, 0.00028564443128200093, -0.0005745883227989291, 0.000766978173210096, 0, -0.00034142465005253155, 0.0006867930740166228, 0.0006416731892632761, 0, -2180660.625191009, 4386509.919338025, 4070895.8858232796, 1]
  ```
- 最后, 用 cesium 载入 3dtiles 模型
  ```
  Cesium.Cesium3DTileset.fromUrl('/model/tileset.json', {
    maximumScreenSpaceError: 2, // 很关键, 若不指定, 模型可能会看不见
  }).then(model => {
    viewer.scene.primitives.add(model)
    viewer.camera.flyToBoundingSphere(model.boundingSphere)
  })
  ```

> 评价：由于该 3dtiles 是由输入的少量 glb 组成的, 所以没有真正做到切片优化

### gltf 转 3dtiles - 使用 gltf-to-3d-tiles.py

[dreamergz/gltf-to-3d-tiles](https://github.com/dreamergz/gltf-to-3d-tiles)

- 安装 python >= 3.7 <= 3.10
- `cd gltf-to-3d-tiles && python -m pip install -r requirements.txt`
- `python main.py tileset --up z input.gltf [outputdir]`
- 坐标转换步骤同上

> 评价:
> - 该工具只支持 gltf 输入, 不支持 glb
> - 瓦片的 boundingBox 可能有问题，在特定相机角度下无法显示. 建议用 3d-tiles-tools 重新生成 tileset.json
> - 生成的碎片文件有点太多了，反而减慢了模型载入速度. 建议用 [cmpt.js](./cmpt.js) 合成为单个 cmpt 模型
>   ```
>   node cmpt.js make [outputdir]
>   ```
>   注：CesiumGS/3d-tiles-tools 也可以拆分 cmpt，但似乎没有合成的功能

### revit 模型转 3dtiles - 以 Bim Angle 为例

可以考虑的工具有 [CesiumLab](www.cesiumlab.com) 和 [Bim Angle](https://github.com/bimangle/forge-engine-samples)。这两个软件都是收费的，但 Bim Angle 有半个月免费试用期。

下载 [Bim Angle](https://github.com/bimangle/forge-engine-samples/releases)，打开网页后，选择最新的 BimAngle_Engine_RVT。

安装 Bim Angle，需要先安装 revit 2023（Bim Angle 不支持低版本 revit 如2021）。

使用 Bim Angle：
  - 选择 revit 源文件
  - 选择 3dtiles 选项卡
  - 选择输出路径
  - 如果需要支持模型贴图, 则选择视觉样式为「纹理」。否则选择「着色」即可
  - 勾选「支持构件属性」
  - 点击运行后，会打开一个命令行，然后自动启动 revit 并打开模型进行转换。

输出的目录结构如下:
```text
0/                 # b3dm 模型
info/              # 构件信息
instances/
textures/
bimangle-latest.js # 示例代码
index.html
index-online.html
model.sdb          # sqlite3 数据库
tileset.json       # 3dtiles 入口文件
```

或者用下面的脚本使模型转换自动化:

`bim-angle.bat`
```bat
@echo off
chcp 936
setlocal enabledelayedexpansion

set DIR=%~f1
set BIM_ANGLE="C:\ProgramData\Bimangle\Bimangle.ForgeEngine.Revit\CLI\ForgeEngineRvtCLI.exe"
set BAT_DIR=%~f0
:: %A:B=C% 是指把 A 中的 B 换成 C
set PATH=%PATH%;%BAT_DIR:bim-angle.bat=%

if not defined DIR (
    echo usage: bim-angle.bat PATH
    :: exit batch script with error level = 1
    pause
    exit /b 1
)

:: for each .rvt file in current directory, make new directory with the same name
for %%i in (%DIR%\*.rvt) do (
    set RVT=%%i
    set RVT_DIR=!RVT:.rvt=!
    md "!RVT_DIR!"
    echo [converting] "!RVT!"
    %BIM_ANGLE% --features UseBasicRenderColor,ExcludeLines,ExcludePoints,UseGoogleDraco,GenerateModelsDb,EnableTextureWebP --format 3dtiles --georeferenced eyJNb2RlIjozLCJBdXRvIjp7Ik9yaWdpbiI6NH0sIkVudSI6bnVsbCwiTG9jYWwiOm51bGwsIlByb2oiOm51bGx9 --input "!RVT!" --levelofdetail 6 --output "!RVT_DIR!" --visualstyle Textured
    if !errorlevel! neq 0 (
        echo bim angle exited with error level !errorlevel!
        exit /b !errorlevel!
    )
    cd "!RVT_DIR!"
    zip -r 1.zip *
    move 1.zip "!RVT_DIR!.zip"
)
```

### python 判断 revit 模型版本

https://thebuildingcoder.typepad.com/blog/2017/06/determining-rvt-file-version-using-python.html

```py
# pip install olefile
# python revit-version.py ??.rvt
import os.path as op
import olefile
import re
import sys

def get_rvt_file_version(rvt_file):
  print('rvt_file', rvt_file)
  if op.exists(rvt_file):
    if olefile.isOleFile(rvt_file):
      rvt_ole = olefile.OleFileIO(rvt_file)
      bfi = rvt_ole.openstream("BasicFileInfo")
      file_info = bfi.read().decode("utf-16le", "ignore")
      pattern = re.compile(r"\d{4}")
      rvt_file_version = re.search(pattern, file_info)[0]
      return rvt_file_version
    else:
      print("file does not apper to be an ole file: {}".format(rvt_file))
  else:
    print("file not found: {}".format(rvt_file))

version = get_rvt_file_version(sys.argv[1])
print(version)
```

### 在 Cesium 中载入 3dtiles

实际在 Cesium 中使用时，用鼠标选取构件得到 feature，用 `feature.getProperty('DbId')` 得到构件的 DbId，DbId 除以 100 取整得到文件名 `filename`，然后再到 `info/filename.json` 中读取该构件的信息。这些 json 文件的结构比较复杂，而且含有许多用不到的信息，可以考虑把需要的信息（如楼层）提取出来单独存为一个文件，可以减少查询构件信息时的网络请求数。

运行下面的脚本生成 `info.csv` 文件:

`info-csv.js`
```
const fs = require('fs').promises
const path = require('path')

const floorKeys = '标高,参照标高,明细表标高,底部标高,底部约束,Level,Base Constraint'.split(',')

const findFloor = (categories = [], store) => {
  const constraint = categories.find(v => v.name === '约束')?.props
  let floor = null
  constraint?.names?.some((v, i) => {
    if (floorKeys.includes(v)) {
      floor = constraint?.values?.[i] ?? null
      return true
    }
    return false
  })
  if (floor) return floor
  const ref = categories.find(v => v.name === '__internalref__')?.props
  ref?.names?.some((v, i) => {
    if (floorKeys.includes(v)) {
      const refId = ref?.values?.[i]
      floor = store[refId]?.name ?? null
      return !!floor
    }
    return false
  })
  return floor
}

const findBimCode = (categories = []) => {
  const props = categories.find(v => v.name === '标识数据')?.props
  if (!props) return null
  const index = props.names.indexOf('注释')
  if (index === -1) return null
  return props.values[index]
}

const writeCsv = (dir) => {
  const dataKeys = ['dbId', 'category', 'externalId', 'name', 'parentId', 'type']
  const otherKeys = ['floor', 'bimCode']
  const buf = [[...dataKeys, ...otherKeys].join(',')]
  const store = {}

  fs.readdir(dir).then(async filenames => {
    await Promise.all(filenames.filter(filename => /^\d+\.json$/.test(filename)).map(async filename => {
      const str = await fs.readFile(path.join(dir, filename), 'utf-8')
      const res = JSON.parse(str)
      Object.assign(store, res.data)
    }))
    Object.entries(store).forEach(([id, data]) => {
      const floor = findFloor(data?.categories, store)
      const bimCode = findBimCode(data?.categories)
      const row = dataKeys.map(key => data?.[key] ?? null).join(',') + ',' + floor + ',' + bimCode
      buf.push(row)
    })
    fs.writeFile(path.join(dir, 'info.csv'), buf.join('\n'))
    console.log(path.join(dir, 'info.csv'), 'is written')
  })
}

const readCsv = async (dir) => {
  const res = await fs.readFile(dir, 'utf-8')
  let data = res.split('\n')
  const keys = data[0].split(',')
  data = data.slice(1)
  const info = Object.fromEntries(data.map(row => {
    row = row.split(',')
    const record = Object.fromEntries(keys.map((key, index) => [key, row[index]]))
    return [record.dbId, record]
  }))
  console.log(info)
}

const main = () => {
  const { argv } = process
  const command = argv[2]
  if (command === 'w') {
    writeCsv(argv[3] || '.')
  } else if (command === 'r') {
    readCsv(argv[3] || './info.csv')
  } else {
    console.log(`usage: node info-csv.js <command> [path]

command:
  w    write info.csv
  r    read info.csv

path:
  default to current path '.'
`)
  }
}

main()
```

    $ node info-csv.js w tileset/info/ # 指定工作目录，默认为当前目录

读取构件信息，为构件着色:
```js
tileset.style = new Cesium.Cesium3DTileStyle({
  color: {
    evaluateColor(feature) {
      const dbId = feature.getProperty('DbId');
      if (tileset.floorDict) {
        const floor = tileset.floorDict[dbId];
        if (floor === '5F') {
          return Cesium.Color.RED
        }
      }
      return feature.color;
    },
  },
});
```

## 常见问题

- gltf 模型颜色不丰富, 没有立体感: 可能是模型未添加法线. 可用 blender 导入模型, 再重新导出 gltf/glb,
  导出时需要勾选 normals 和 custom properties.

## 参考链接

### 教程

- [Cesium 中文教程](https://zhuanlan.zhihu.com/p/493029015)

### 模型转换工具

- blender: 强大的开源建模软件, 模型格式转换的多面手
- [CesiumLab](www.cesiumlab.com)
  - revit 模型转 3dtiles: revit -> clm -> cesiumlab 通用切片 (会员功能)
  - 多个 3dtiles 模型合并: 倾斜模型切片 -> 合并多块索引
  - CesiumLab 不支持 gltf 转 3dtiles
  - CesiumLab 的 fbx 转 3dtiles 效果不理想
- [Bim Angle](https://github.com/bimangle/forge-engine-samples): 用于 revit 模型转 3dtiles, 效果拔群, 但是 15 天试用
- gltf 转 3dtiles
  - [nxddsnc/gltf-to-3dtiles](https://github.com/nxddsnc/gltf-to-3dtiles)
  - [fanvanzh/3dtiles](https://github.com/fanvanzh/3dtiles): 用 rust 编写, 号称世上最快, 但不支持 gltf 转 3dtiles
- cesium 3dtiles tools:
  - install: `pnpm i 3d-tiles-tools`
  - glb to b3dm: `npx 3d-tiles-tools glbToB3dm -i test.gltf -o test.b3dm`
  - merge 3dtiles: `npx 3d-tiles-tools merge -i tileset1 -i tileset2 -o output`
  - create tileset.json (详见 gltf 转 3dtiles 一节)
- 3dtiles 模型合并: [py3dtiles_merger](https://github.com/Tofull/py3dtiles_merger)
- gltf-pipeline: `npx gltf-pipeline -i model.gltf -o model.glb`
- gltf-pack: gltf 模型有损压缩, 效果拔群
- assimp: 通用模型格式转换

### 点云

- CloudCompare
- MeshLab
- PCL
- Blender Sensor Simulation
- [revit 转 obj](https://zhuanlan.zhihu.com/p/670651367), [revit 转 obj2](https://blog.csdn.net/Alert_feng/article/details/119462984)

### 天空盒

- [球面全景图转天空盒](https://jaxry.github.io/panorama-to-cubemap/)
- [球面全景图转天空盒2](https://www.360toolkit.co/convert-spherical-equirectangular-tocubemap.html)
- [playcanvas HDRI 转天空盒](https://playcanvas.com/texture-tool)
- [HDRI 转天空盒](https://matheowis.github.io/HDRI-to-CubeMap/)
- [cmftStudio 天空盒工具](https://github.com/dariomanesku/cmftStudio)
- [天空盒资源 polyhaven](https://polyhaven.com/)
- [天空盒资源](http://www.custommapmakers.org/skyboxes.php)

### 模型渲染

- 3dtiles 是 cesium 官方格式, 渲染当然是用 cesium
- 用 threejs 渲染 3dtiles? https://github.com/NASA-AMMOS/3DTilesRendererJS

### 第三方库

- [gcoord](https://www.npmjs.com/package/gcoord): 地图坐标系转换, 支持 geojson

### 案例

- [d3kit](https://github.com/zhangti0708/cesium-d3kit): cesium 二次封装库
- [wmts 裁剪](https://github.com/aparshin/leaflet-boundary-canvas): 案例只适用于 leaflet. Cesium 需要研究 ImageryLayer 源码的 rectangle 参数
- [Cesium 案例一](http://211.149.185.229:8080/basiccategorylist)
- [Cesium 案例二](http://mapgl.com/shareCode/#/domestic)
- [threehub: 热力图案例](https://threehub.cn/#/codeMirror?navigation=CesiumJS&classify=expand&id=heatMap)
- [d3 地图流体案例](https://github.com/byrd-polar/fluid-earth/)

### 更多

- [3dtiles 标准](https://www.ogc.org/standard/3dtiles/)
- [cesium custom shader guide](https://github.com/CesiumGS/cesium/tree/main/Documentation/CustomShaderGuide)
- [gltf、3d场景编辑器](https://gltf.nsdt.cloud)
- [地理坐标系转换](https://github.com/wandergis/coordtransform/blob/master/index.js)

## Trouble Shooting

- this object is destroyed.
  - 可能原因: 检查代码中是否将 dataSource 重复添加到 viewer 中:
    ```js
    // 错误写法
    const ds = new Cesium.CustomDataSource()
    ds.add(entity1)
    viewer.dataSources.add(ds)
    ds.add(entity2)
    viewer.dataSources.add(ds)
    ```
- 使用 Cartesian3 时, 得到一个 undefined
  - 可能原因: `Cesium.Cartesian3()` 漏掉了 `new`
