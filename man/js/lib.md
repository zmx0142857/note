# js 工具集

> 也有其它工具混入其中.

## 数据与通信

### http

- httpie: 命令行界面的接口测试工具, 同类软件还有 postman, 浏览器插件 data~more 等.
  ```
  $ http -v --json POST localhost:8000/login username=admin password=admin
  ```
- serve: web 静态服务
  ```
  $ serve -L -l 1234 &
  ```
- ky: 浏览器端的 http 请求库
- got: node js 端的 http 请求库

### 数据

- [protobufjs](https://www.npmjs.com/package/protobufjs): 处理 protocol buffers, 将数据编码为二进制在网上传输
- long.js: 处理长整型数字

### 通信

- mqtt: 基于 websocket 的二进制通信协议
- grpc: 是 RPC (远程过程调用) 的一个实现, 允许调用服务端提供的函数.

## 编译工具链

- babel
- typescript
- uglify-js, pretty-js
  ```
  $ uglifyjs input.js -c -m > out.js # compress and mangle
  $ pretty-js input.js > out.js
  ```

## 图形与动画

### WebGL

- [twgl, tiny webgl](https://twgljs.org/): webgl 的简易封装
- [three.js](https://threejs.org): 基于 WebGL 的 3D 库
- [babylon.js](https://www.babylonjs.com): 高性能 3D 引擎
- [cesium.js](https://cesium.com/platform/cesiumjs/): web gis、智慧城市场景渲染
- [shadertoy](https://shadertoy.com)

### 动画/幻灯片

- movy: 基于 three.js 的动画引擎
- manim: python 动画引擎
- motion canvas: typescript 动画引擎
- revealjs: web 端幻灯片
- bespoke: 超轻量级幻灯片 (示例: jyywiki.cn)
- animate.css, velocity, jquery.animate: web 小动画
- @tweenjs/tween.js: 补间动画

### 3d 建模

- blender
- autocad (dxf: dwg 的平替)
- road-pro: 道路模型在线编辑器

### SVG

- raphael: svg 绘图
- snapsvg: 用 js 创建 svg
- nano: 专注 svg 压缩
- svgo: svg 优化压缩
- d3: svg 中的 jquery
- @resvg/resvg-js, @resvg/resvg-wasm: 来自 rust 的 svg 渲染库

### 画图

- excalidraw.com
- processing
- protovis
- draw.io
- [geogebra](https://www.geogebra.org/calculator)
- mermaid, plant-uml: 流程图
- wavedrom: 电路、波形
- clipjs: 网页端视频剪辑
- [画图网页版](https://paint.js.org)
- [svg在线编辑器](https://www.jyshare.com/more/svgeditor/)
- [svg-path-editor](https://yqnn.github.io/svg-path-editor/)
- [gif在线编辑器](https://clideo.com/editor)

### 统计图表

- echarts, chart.js, v-charts (vue), recharts (react), ant-design-chart: 图表绘制

### 其它

- medium-zoom: 图片缩放
- image-magick: 一个 cli 程序, 支持多种图片格式

