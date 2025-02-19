# Cesium

## 坐标变换

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
// 此变换矩阵将模型原点变换到指定的经纬度
// 原模型坐标系的 x, y, z 对应到新坐标系的东、北、天
function getTransform (lon, lat, height = 0, scale = 1) {
  const m = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(lon, lat, height))
  const s = Cesium.Matrix4.fromScale(new Cesium.Cartesian3(scale, scale, scale))
  Cesium.Matrix4.multiplyTransformation(m, s, m)
  return Array.from(m)
}
const m = getTransform(116, 39, 0, 0.001)
// [-0.0008987940462991669, -0.0004383711467890776, 0, 0,
// 0.000275875901522268, -0.0005656294206902574, 0.0007771459614569709, 0,
// -0.0003406783663463926, 0.0006984941632629673, 0.0006293203910498374, 0,
// -2175779.497312825, 4461009.061769954, 3992317.0227517267, 1]

// 验证: 两个计算结果应该相同
console.log(
  Cesium.Matrix4.multiplyByPoint(
    Cesium.Matrix4.fromArray(m),
    new Cesium.Cartesian3(),
    new Cesium.Cartesian3()
  ),
  Cesium.Cartesian3.fromDegrees(116, 39, 0),
)
```

## 载入

### 3dtiles

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

### Entity

```
viewer.entities.add({
  name: 'point',
  position,
  point: {
    pixelSize: 10,
    color: Cesium.Color.YELLOW,
  },
});

viewer.entities.add({
  name: 'rectangle',
  rectangle: {
    coordinates: new Cesium.Rectangle(west, south, east, north),
    material: Cesium.Color.WHITE,
  },
})

viewer.entities.add({
  name: 'box',
  position: Cesium.Cartesian3.fromDegrees(110, 24),
  box: {
    dimensions: new Cesium.Cartesian3(1000, 1000, 1000),
    fill: true,
    material: Cesium.Color.WHITE,
    outline: true,
  },
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
    //     length: 400000.0,
    //     topRadius: 0.0,
    //     bottomRadius: 200000.0,
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
