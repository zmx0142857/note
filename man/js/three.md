# Three.js

web 端流行的 3d 库.

**教程**

- [threejs 官方教程](https://threejs.org/manual/)
- [threejs-tutorial](https://github.com/puxiao/threejs-tutorial): 来自 github
- [discover threejs 电子书](https://discoverthreejs.com/tips-and-tricks/): 总结了许多 three.js 常用技巧
- [webgl fundamentals](https://webglfundamentals.org/): webgl 入门教程
- [the book of shaders](https://thebookofshaders.com/): shader 入门教程

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
    $ pnpm i three@0.145.0

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
app.light() // 平行光
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

```js
import createApp from './3js/app.js'
import * as THREE from 'three'

const createSphere = (app, sphere) => {
  app.add({
    name: 'sphere',
    geometry: {
      type: 'sphere',
      radius: sphere.radius,
    },
    material: {
      type: 'MeshBasicMaterial',
      color: 0xff8800,
      wireframe: true, // 只显示线框
    },
    position: sphere.center,
  })
}

const createBox = (app, box) => {
  app.add({
    name: 'box',
    geometry: {
      type: 'box',
      x: box.max.x - box.min.x,
      y: box.max.y - box.min.y,
      z: box.max.z - box.min.z,
    },
    material: {
      type: 'MeshBasicMaterial',
      color: 0x00ff88,
      wireframe: true, // 只显示线框
    },
    position: box.getCenter(new THREE.Vector3()),
  })
}

const app = createApp()

app.load({
  name: 'roof',
  type: 'gltf',
  url: '/models/0.glb',
}).then(model => {
  // revit 产生的模型单位为 mm, 而 threejs 单位为 m
  // 因此载入模型后, 将它缩小 1000 倍
  const scale = 0.001
  model.scale.set(scale, scale, scale)
  app.scene.add(model)

  // 计算模型包围球, 并更新相机位置
  const sphere = app.mesh.boundingSphere(model)
  const box = app.mesh.boundingBox(model)
  app.camera.fromSphere(sphere)
  app.orbitControl({ target: sphere.center, damping: true })

  // 绘制包围球与包围盒
  createSphere(app, sphere)
  createBox(app, box)
})

app.ambient()
app.light()
app.animate()
```

### 案例四: 3dtiles

用 three.js 载入 3dtiles

    $ pnpm i 3d-tiles-renderer@0.4.5
    $ cp -r node_modules/three/examples/jsm/libs/draco/gltf/ public/draco # 复制 draco/gltf 目录, 重命名为 draco

```js
// https://github.com/NASA-AMMOS/3DTilesRendererJS
import * as THREE from 'three'
import createApp from '../3js/app.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import Tileset from '@/addin/tileset.js'

const loadTileset = async (app, { url, scale = 1 }) => {
  const tileset = await app.load.tileset({ url, name: 'tileset' })
  tileset.addEventListener('load-tile-set', () => {
    setTimeout(() => {
      const sphere = new THREE.Sphere()
      tileset.getBoundingSphere(sphere)
      sphere.center.multiplyScalar(scale)
      sphere.radius *= scale
      // tileset.group.position.copy(sphere.center)
      app.camera.fromSphere(sphere)
      app.orbitControl({ target: sphere.center, damping: true })

      const box = new THREE.Box3()
      tileset.getBoundingBox(box)
      box.max.multiplyScalar(scale)
      box.min.multiplyScalar(scale)
      createBox(app, box) // 同上
      createSphere(app, sphere) // 同上
    })
  })
  tileset.addEventListener('load-model', model => {
    model.scene.scale.set(scale, scale, scale)
  })
  app.scene.add(tileset.group)
  app.needsUpdate.push(tileset)
}

const app = createApp()
app.renderer.outputColorSpace = THREE.SRGBColorSpace
app.ambient()
app.light()

// 载入 Tileset 插件, 然后可以使用 app.load.tileset() 方法载入 3dtiles 数据
Tileset(app, {
  dracoLoader: new DRACOLoader().setDecoderPath('/draco/'),
})

loadTileset(app, {
  // url: '/models/output/tileset.json',
  // scale: 0.001,
  url: '/models/bangonglou/tileset.json',
  scale: 1,
})
app.animate()
```

## 坐标变换

## 常见问题

- 升级到新版 three.js 后, 模型颜色很暗淡. 解决:
  ```js
  renderer.outputColorSpace = THREE.SRGBColorSpace
  ```
- 给 Sprite 指定透明贴图, 在某些视角下背景变得不透明. 解决:
  ```js
  new SpriteMaterial({
    map: imgUrl,
    alphaTest: 0.1, // 丢弃透明度低于 0.1 的部分, 避免贴图变得不透明
  })
  ```
