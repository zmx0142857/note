# Three.js

web 端流行的 3d 库.

**教程**

- [threejs 官方教程](https://threejs.org/manual/)
- [threejs-tutorial](https://github.com/puxiao/threejs-tutorial): 来自 github
- [threejs | sbcode.net](https://sbcode.net/threejs/)
- [threejs 中文网](http://www.webgl3d.cn/pages/aac9ab/)
- [discover threejs 电子书](https://discoverthreejs.com/tips-and-tricks/): 总结了许多 three.js 常用技巧
- [webgl fundamentals](https://webglfundamentals.org/): webgl 入门教程
- [the book of shaders](https://thebookofshaders.com/): shader 入门教程
- [shadertoy](https://www.shadertoy.com/)
- [iq 大佬的图形学 blog](https://www.iquilezles.org/)

**工具**

- [gltf viewer](https://gltf-viewer.donmccurdy.com/): gltf 在线查看
- 3D 查看器: win10 自带, 也可以查看 gltf 模型
- [gltfpack](https://www.npmjs.com/package/gltfpack): gltf 模型压缩 (命令行工具)
- [gltf pipeline](https://www.npmjs.com/package/gltf-pipeline): gltf 处理命令行工具, cesium 团队出品
- [gltf editor](https://www.gltfeditor.com): gltf 在线编辑器
- [shadow editor](https://tengge1.github.io/ShadowEditor-examples/): 一款 threejs 在线编辑器. [查看源码](https://github.com/tengge1/ShadowEditor)
- [blender](https://www.blender.org): 一款 3d 建模开源软件

**源码**

- three.js 官方 shader: three/src/renderers/shaders/ShaderChunk

## 入门

准备工作

    $ mkdir three-demo && cd three-demo
    $ pnpm i three@0.170.0

`index.html`
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Three Demo</title>
<style>
body {
  margin: 0;
  height: 100vh;
}
canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
</head>
<body>
<script type="module" src="index.js"></script>
</body>
</html>
```

### 案例一: 基本场景

`index.js`
```js
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const width = window.innerWidth
const height = window.innerHeight

// 场景、相机和渲染器是 three.js 的三要素

// 场景
const scene = new THREE.Scene()
// 相机
const camera = new THREE.PerspectiveCamera(
  75,             // 视角大小 FOV
  width / height, // 宽高比 aspect ratio
  0.1, 1000       // 景物的远近范围
)
camera.position.z = 5 // 设置相机坐标
// 渲染器
const renderer = new THREE.WebGLRenderer()
renderer.setSize(width, height)
document.body.appendChild(renderer.domElement)

// 绘制图形
const geometry = new THREE.BoxGeometry(1, 1, 1) // 长方体
const material = new THREE.MeshPhongMaterial({ color: 0xccddee }) // 材质
const cube = new THREE.Mesh(geometry, material) // 网格
scene.add(cube) // 添加对象到原点

// 环境光
const ambient = new THREE.AmbientLight(0x444444, 1)
scene.add(ambient)

// 平行光
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(1, 2, 3)
scene.add(light)

// 控制器: 左键拖动旋转, 按住 ctrl 拖动平移, 滚轮缩放
const controls = new OrbitControls(camera, renderer.domElement)

// 动画循环
const animate = () => {
  requestAnimationFrame(animate)
  cube.rotation.y += 0.01
  controls.update()
  renderer.render(scene, camera)
}
animate()
```

### 案例二: 3js

使用自己封装的 `3js` 库重新实现基本场景.

```js
import * as THREE from 'three'
import createApp from './3js/app.js'

const app = createApp({
  camera: {
    angle: 75,
    distance: 5,
  }
})

const cube = app.mesh({
  name: 'cube',
  geometry: {
    type: 'box',
    x: 1,
    y: 1,
    z: 1,
  },
  material: {
    type: 'MeshPhongMaterial',
    color: 0xccddee,
    // 贴图
    // map: app.texture({
    //   url: '',
    // }),
    // alphaTest: 0.1,
  },
  update () {
    cube.rotation.y += 0.01
  },
})
app.add(cube)

app.ambient() // 环境光
app.sun() // 平行光
app.orbitControl() // 控制器
app.needsUpdate.push(cube) // 需要更新的对象

// 动画循环
app.animate(() => {
  // cube.rotation.y += 0.01
})

// debug
window.THREE = THREE
window.app = app
console.log('children', app.scene.children) // 场景子元素
```

### 案例三: gltf 模型

> 注意: 模型文件放在 `public/models` 目录下

复制 draco/gltf 目录, 重命名为 draco:

    $ cp -r node_modules/three/examples/jsm/libs/draco/gltf/ public/draco

```js
import createApp from '@/3js/app.js'
import Progress from '@/addin/progress'
import Stats from '@/addin/stats'
import * as THREE from 'three'

const app = createApp()
const progress = Progress(app)

const loadModel = async () => {
  await app.load.setDracoLoader('/draco/') // 载入 draco 插件, 用于解压 draco 压缩格式的模型
  const scale = 0.001 // revit 产生的模型单位为 mm, 而 threejs 单位为 m. 因此载入模型后, 将它缩小 1000 倍
  const model = await app.load({
    name: 'model',
    type: 'gltf',
    url: '/models/vew/power/power-plant.draco.glb',
    onProgress: progress.onProgress,
    scale,
  })
  progress.end()
  app.scene.add(model)

  // 计算模型包围球, 并更新相机位置
  const sphere = app.mesh.boundingSphere(model)
  sphere.radius *= scale
  sphere.center.scale(scale)
  app.camera.position.fromSphere(sphere)
  app.orbitControl({ target: sphere.center, damping: true })

  const box = app.mesh.boundingBox(model)
  box.max.scale(scale)
  box.min.scale(scale)

  // 绘制包围球与包围盒
  app.add(app.mesh.sphere(sphere))
  app.add(app.mesh.box(box))
  console.log(box, sphere)
}

loadModel()

app.ambient()
app.sun()
app.animate()

Stats(app)

window.app = app
window.THREE = THREE
```

### 案例四: 3dtiles

用 three.js 载入 3dtiles

    $ pnpm i 3d-tiles-renderer@0.4.5

```js
// https://github.com/NASA-AMMOS/3DTilesRendererJS
import * as THREE from 'three'
import createApp from '../3js/app.js'
import Tileset from '@/addin/tileset.js'
import Stats from '@/addin/stats.js'

const models = [
  {
    name: 'bangonglou',
    url: '/models/bangonglou/tileset/tileset.json',
    scale: 1,
  },
  {
    name: 'gltf-to-3d-tiles',
    url: '/models/gltf-to-3d-tiles/output/tileset.json',
    scale: 0.001,
  },
  {
    name: '404',
    url: '/models/404/tileset.json'
  },
]

const loadTileset = async (app, index) => {
  const config = models[index || 0]
  const { scale } = config
  const tileset = await app.load.tileset(config)
  tileset.group.scale.fill(config.scale)
  app.add(tileset.group)

  const sphere = new THREE.Sphere()
  tileset.getBoundingSphere(sphere)
  sphere.radius *= scale
  sphere.center.scale(scale)
  app.camera.position.fromSphere(sphere)
  app.orbitControl({ target: sphere.center, damping: true })

  const box = new THREE.Box3()
  tileset.getBoundingBox(box)
  box.max.scale(scale)
  box.min.scale(scale)

  app.add(app.mesh.box(box))
  app.add(app.mesh.sphere(sphere))
  console.log(box, sphere)
}

const main = async () => {
  const app = createApp({
    renderer: { antialias: true },
  })
  app.renderer.outputColorSpace = THREE.SRGBColorSpace
  app.ambient()
  app.sun()

  await Tileset(app, { dracoPath: '/draco/' }) // 载入 tileset 插件
  loadTileset(app, 0)

  app.animate()
  Stats(app)
  window.app = app
  window.THREE = THREE
}

main()
```

### 线条

three.js 线条分为普通线与粗线. 在 3js 库中它们被封装为同一个函数, 如果 `linewidth` 不是 `undefined` 就使用粗线.
```js
const line = app.mesh.line({
  positions: [
    [-5, 0, -5],
    [-5, 20, -5],
  ],
  material: {
    dashed: true,
    linewidth: 4,
    dashSize: 0.2,
    gapSize: 0.2,
  },
})
```

### 射线拾取

判断 sprite 是否被遮挡 (有性能问题, 可以用 three-mesh-bvh 加速)
```js
sprites.forEach((sprite) => {
  sprite.getWorldPosition(spriteWorldPosition)
  const vector = spriteWorldPosition.project(camera)
  raycaster.setFromCamera(new THREE.Vector2(vector.x, vector.y), camera)
  const intersects = raycaster.intersectObject(group, true)
  if (intersects.length > 0 && intersects[0].object === sprite) {
    // occluded = false
  } else {
    // occluded = true
  }
})
```

把 sprite 被遮挡部分渲染为半透明, 渲染两次的 trick:
[codepen](https://codepen.io/boytchev/pen/QWJOBrL?editors=0010)
```js
function animateLoop () {
  // render scene + all sprites as transparent
  spriteMaterial.opacity = 0.2
  spriteMaterial.depthTest = false
  renderer.autoClear = true
  renderer.render(scene, camera)

  // render only front sprites
  spriteMaterial.opacity = 1
  spriteMaterial.depthTest = true
  renderer.autoClear = false
  renderer.render(spriteGroup, camera)
}
```

### 实例化、批量化

- InstancedMesh: 用于渲染大量相同材质与相同几何体, 但空间变换不同的物体
- BatchedMash: 用于渲染大量相同材质, 但几何体与空间变换不同的物体

## 插件

这里的插件是指除了 `import * as THREE from 'three'` 之外, 需要单独引入的文件.

### 控制器 controls

- OrbitControls: 最常用的控制器, 相机绕一个固定中心旋转, 且保持向上方向不变. 左键: 旋转, ctrl+左键: 平移屏幕空间, 滚轮缩放.
- MapControls: 与 Cesium 地图模式类似. 左键: 平移 xOz 平面, ctrl+左键: 旋转, 滚轮缩放. OrbitControls 经过一定配置可以达到 MapControls 的效果.
- PointerLockControls: 第一人称射击游戏常用的控制器 (注意, 不是 FirstPersonControls, 后者视线容易飘动令人头晕).
- TransformControls: 提供三维编辑器常用的平移、旋转、缩放功能, 类似 Blender 风格.

### 图形界面 dat.gui
```js
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js' // 引入 three.js 自带的 dat.gui
// import { GUI } from 'dat.gui' // 也可以用 npm 单独安装

const gui = new GUI()

const axes = app.axes()
gui.add(axes.position, 'x', -30, 30, 0.1) // obj, key, min, max, step
gui.add(axes.position, 'y', -30, 30, 0.1)
gui.add(axes.position, 'z', -30, 30, 0.1)

const obj = {
  weight: 0,
}
gui.add(obj, 'weight', 0, 1).name('变胖').onChange(v => {
  mesh.morphTargetInfluences[0] = v
})
```

### 补间动画 tween.js
```js
import TWEEN from 'three/examples/jsm/libs/tween.module.js' // 引入 three.js 自带的 tween.js
// import TWEEN from '@tweenjs/tween.js' 也可以用 npm 单独安装

// 注册 TWEEN
app.needsUpdate.push({ update: () => TWEEN.update() })

// 播放动画
new TWEEN.Tween(mesh.position).to({ x: 100, y: 50 }, 2000).start()
```

### three-mesh-bvh 场景层次树

可以用于加速射线拾取、碰撞检测、可视查询等

```js
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'

// Add the extension functions
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

// ... and when you load your meshes:
mesh.geometry.computeBoundsTree()
```

## 常见问题

- 页面一片漆黑, 看不见模型:
  - 试着将背景色改为白色 `renderer.setClearColor(0xffffff)`, 如能看见模型的黑影, 说明光照有问题.
  - 模型可能不在视角内, 尝试计算模型包围球并可视化.
  - 模型太远或太近, 尝试 `camera.near = 0.1, camera.far = 1e6`.
  - 模型太大, 尝试 `model.scale.set(0.001, 0.001, 0.001)`.
  - 模型的位置或变换矩阵无效 (比如, 含有 NaN).
- 已经添加了环境光, 但模型仍是黑色的. 解决: 给 `material.metalness` 设置一个小于 1 的值;
- 已经添加了点光源, 但模型仍是黑色的. 解决: 增大 `intensity` 或减小 `decay`. 检查 `distance` 的值 (0 表示不限制点光源距离)
- 升级到新版 three.js 后, 模型颜色很暗淡.
  - 一个原因是色彩空间发生了变化, 解决方案是:
    ```js
    renderer.outputColorSpace = THREE.SRGBColorSpace

    // MeshBasicMaterial
    material.color = Number(THREE.REVISION) < 155 ? new THREE.Color(0x102040).convertSRGBToLinear() : 0x102040
    ```
  - 另一个原因: 从 r155 开始, three.js 的光照模型依循国际单位, 而 legacyLights 被弃用.
    对于环境光和平行光, 可以简单地将光照强度乘以 `Math.PI`, 以达到旧版的视觉效果,
    其它类型的光照则没有简单的迁移方法. 详情阅读: [Updates to lighting in three.js r155](https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733).
- 透明背景:

  方法1:
  ```js
  const renderer = new THREE.WebGLRenderer({ alpha: true })
  ```
  方法2:
  ```js
  renderer.setClearAlpha(0)
  ```
- 设置背景颜色及透明度:

  方法1:
  ```js
  renderer.setClearColor(0x0a1030, 0.5)
  ```

  方法2, 只能设置颜色:
  ```js
  scene.background = new THREE.Color(0x0a1030)
  ```
- 贴图的颜色不够鲜艳. 解决:
  ```js
  texture.colorSpace = THREE.SRGBColorSpace
  ```
- 半透明材质:
  ```js
  material.transparent = true // 开启透明支持
  material.opacity = 0.5
  ```
- 半透明贴图:
  ```js
  material.transparent = true // 开启透明支持
  material.alphaTest = 0.1 // 丢弃透明度低于 0.1 的部分, 避免贴图异常
  ```
- 半透明物体渲染时, 后面的另一个半透明物体突然消失.

  原因: threejs 先渲染了前面的物体, 轮到后面物体渲染时, 由于被遮挡, 像素直接被丢弃了.

  方法1:
  ```js
  renderer.sortObjects = true // 这是默认值
  backObj.renderOrder = 0 // 后面物体先渲染 (这是默认值)
  frontObj.renderOrder = 1 // 前面物体后渲染
  ```

  方法2:
  ```js
  frontObj.material.depthWrite = false // 不写入深度缓冲的效果就是, 前面的物体不会挡住后面的物体
  frontObj.material.opacity += 0.1 // 适当提高不透明度, 减缓后面物体对前面物体颜色的影响
  ```
- 如何让半透明物体 (如告警点位) 清晰可见, 即使它被其它半透明物体挡住:
  ```js
  mesh.material.depthWrite = false
  mesh.renderOrder = 2 // 后渲染
  ```
- 两个模型十分接近时, 出现面片闪烁 (z-fighting):
  - 方法1: 手动调整模型位置, 让它们分开一点 (比如 0.05 米)
  - 方法2: `material.depthWrite = false`
- 查看渲染状态信息
  ```js
  renderer.info
  ```
- 虚线不生效, 仍然显示为实线. 解决:
  ```js
  line.computeLineDistances()
  ```
- linewidth 设置不生效.

  原因: [LineBasicMaterial](https://threejs.org/docs/index.html?q=linebasic#api/en/materials/LineBasicMaterial) 的限制: 大多数 webgl 平台只支持线宽为 1
  > Due to limitations of the OpenGL Core Profile with the WebGL renderer on most platforms linewidth will always be 1 regardless of the set value.

  解决: [粗线条绘制案例](https://threejs.org/examples/#webgl_lines_fat)
  ```js
  import { Line2, LineGeometry, LineMaterial } from 'three/examples/jsm/Addons.js'
  const geometry = new LineGeometry()
  geometry.setPositions(positions.map(v => v.toArray()).flat())
  const material = new LineMaterial({
    color: 0x04b6f4,
    linewidth: 10,
  })
  const line = new Line2(geometry, material)
  ```
- r145: `line.geometry.setFromPoints` 更新线条几何体后, 在某些视角下线条不可见.

  方法1:
  ```js
  line.geometry.setFromPoints([...]) // 更新几何顶点
  line.geometry.computeBoundingSphere() // 更新包围球
  ```
  方法2:
  ```js
  line.frustumCulled = false // 禁用视锥剔除
  ```
  此问题在新版 (r170) 已经修复
- 用 canvas 绘制的 texture 没有显示. 解决:
  ```js
  const texture = new THREE.Texture(canvas)
  texture.needsUpdate = true
  ```
- THREE.DRACOLoader: Unexpected geometry type. 解决:
  - 检查 DRACOLoader 的版本与 threejs 是否匹配
  - 检查 DRACOLoader 的 decoderPath 是否有效
- [来自 threejs 论坛](https://discourse.threejs.org/t/close-the-object-and-the-frame-rate-decreases/28691) 相机拉近物体时为什么帧率会下降?
  - 原因: 使用 PBR 材质 (MeshStandardMaterial) 时, 屏幕上的片元 (像素) 越多, 渲染越慢
  - 解决: 可以改为 MeshPhongMaterial (光滑材质) 或 MeshLambertMaterial (粗糙材质)
- 修改个别 gltf 模型材质 `mesh.material = new THREE.MeshStandMaterial(...)` 后, 模型不受平行光照的影响或出现异常黑色闪烁.
  - 原因: 该 gltf 模型不带法线. 猜测是 three.js 在载入不带法线的模型时会计算一次法线, 但修改材质导致法线信息丢失.
  - 方法1: 用 blender 给模型加上法线
  - 方法2: 仅给 material 的属性赋值, 不去修改 material:
    ```js
    material.color.set(0x04b6f4)
    material.transparent = true
    material.opacity = 0.5
    ```
  - 方法3: 重新计算法线
    ```js
    geometry.computeVertexNormals()
    ```
    > 注意: 实测 draco 压缩的未带法线模型, 在修改材质 `material.transparent = true` 后渲染帧率下降, 但未压缩的模型、带法线的模型都不受影响
- Sprite 无法旋转: 设置 `sprite.rotation.z` 无效. 解决:
  ```js
  sprite.material.rotation += 0.01
  ```
- 射线拾取不到坐标或坐标错误
  - 原因: 可能是物体未初始化完成.
  - 解决: 使用 setTimeout 等待物体加载完成再进行射线拾取.
- sprite 固定像素大小
  ```js
  // 透视相机
  const px = (2 * Math.tan(camera.fov * Math.PI / 360)) / canvas.clientHeight
  sprite.material.sizeAttenuation = false
  sprite.scale = vec3().fill(16 * px)
  // 正交相机
  const opx = (camera.top - camera.bottom) / (canvas.clientHeight * camera.zoom)
  sprite.scale = vec3().fill(16 * opx)
  ```
- raycaster 忽略物体
  ```js
  obj.layers.set(1) // 将物体放在图层 1. 默认情况下, raycaster 只对图层 0 生效, 因此将忽略这个物体
  camera.layers.enable(1) // 启用相机的图层 1, 这样仍能看见此物体
  ```
