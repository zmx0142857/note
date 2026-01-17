# css

## 实用技巧

### 工具类

更多参见 [builtin/lib/ui.css](https://github.com/zmx0142857/builtin)
```css
.g-full {
  width: 100%;
  height: 100%;
}
```

### 卡片转场特效

```css
.container {
  perspective: 1000px;
  .card-transition {
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    opacity: 0;
    transform: scale(0.9) translateY(20px) rotateX(-10deg);
    filter: blur(10px) brightness(0.8);
    transform-origin: center center;
    backface-visibility: hidden;
    will-change: transform, opacity, filter;
    pointer-events: none;

    &-visible {
      opacity: 1;
      transform: scale(1) translateY(0) rotateX(0);
      filter: blur(0) brightness(1);
      pointer-events: auto;
    }
  }
}
```

### checkbox 美化

这类原生组件的美化技巧都是, 先设置 `appearance: none;` 隐藏默认样式, 再手动编写 css:
```css
input[type=checkbox] {
  position: relative;
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1px solid #aaa;
  border-radius: 3px;
  cursor: pointer;
  vertical-align: middle;
  transition: background-color .3s;
}
input[type=checkbox]:checked {
  background-color: #2196f3;
}
/* 打勾 */
input[type=checkbox]::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 4px;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #fff;
  opacity: 0;
  transition: transform .3s;
  transform: rotate(-15deg);
}
input[type=checkbox]:checked::after {
  opacity: 1;
  transform: rotate(-45deg);
}
```

### 滚动条美化

```css
/* 通用 */
html {
  scrollbar-color: #c2c2c2 transparent;
}
* {
  scrollbar-width: thin;
}

/* webkit */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: #c2c2c2;
  background-clip: padding-box;
  min-height: 28px;
}
::-webkit-scrollbar-track-piece {
  background-color: #fff;
}
```

滚动条隐藏
```css
scrollbar-width: none;
```

### 九图背景

基于 border-image: 只需一张图片和少量代码.

> ⚠ 警告: 当 container 带有 transform: scale 时, 图片边界可能会有缝隙.
> 未找到好的解决方法. 提高图片分辨率可能有效.

```html
<style>
* {
  box-sizing: border-box;
}
.container {
  width: max-content;
  height: max-content;
  position: relative;
}
.bg {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  border-style: solid;
  border-image-source: url('bg.png');
  border-image-slice: 68 134 68 134 fill; /* 分别指定四个方向的宽度 */
  border-image-width: 68px 134px 68px 134px;
}
.fg {
  width: 300px;
  height: 150px;
  padding: 20px;
}
</style>
<div class="container">
  <div class="bg"></div>
  <div class="fg">这是内容</div>
</div>
```

### 夜间模式

方案一, 简单粗暴的 filter
```css
body {
  color: #000;
  background: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    filter: invert(1) hue-rotate(180deg);
  }
}
```

方案二, css 变量
```css
:root {
  --bg: #fff;
  --fg: #333;
  --primary: #1976d2;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #333;
    --fg: #fff;
  }
}
```

方案三, js 动态切换. 参见 [scratch](https://github.com/zmx0142857/scratch)
```js
const media = window.matchMedia('(prefers-color-scheme: dark)')
media.onchange = console.log
const isDark = media.matches
```

### 空心字

```css
/* 方案1 webkit 专用 */
.outlined1 {
  -webkit-text-fill-color: transparent;
  -webkit-text-stroke: 1px #333;
}

/* 方案2 向八个方向投下文字阴影 */
.outlined2 {
  color: white;
  text-shadow:
    -1px -1px 0 #000,
    0    -1px 0 #000,
    1px  -1px 0 #000,
    1px     0 0 #000,
    1px   1px 0 #000,
      0   1px 0 #000,
    -1px  1px 0 #000,
    -1px    0 0 #000;
}
```

### 调色板

```css
--link-blue: #4399ff;
--dark-blue: #102040;
```

## Trouble Shooting

### absolute 造成滚动条意外出现

问题: `overflow: auto` 与 `position: relative` 设置在同一元素时, absolute 元素会造成滚动条出现.
解决: 去掉 `.scroll` 元素的 `position: relative`.
注: `transform` 也会形成一个上下文包含块, 相当于 `position: relative`.
```html
<style>
.container {
  position: relative;
  width: 300px;
  height: 500px;
  background: #666;
  overflow: hidden;
}
.scroll {
  position: relative; /* 去掉这个! */
  transform: translateZ(0); /* 去掉这个! */
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  height: 100%;
}
.box {
  height: 100%;
  background: #333;
}
.absolute {
  position: absolute;
  background: #6cf;
  width: 14px;
  height: 14px;
  bottom: 0;
  left: 0;
  border-radius: 7px;
  transform: translate(-50%, 50%);
}
</style>

<div class="container">
  <div class="scroll">
    <div class="box">
      <div class="absolute"></div>
    </div>
  </div>
</div>
```

### 居中元素溢出

问题: 用 g-center 居中内容时, 无法滚动查看开头内容.
```html
<style>
* {
  box-sizing: border-box;
}
.g-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.container {
  width: 200px;
  height: 300px;
  background: #aaa;
  overflow: auto;
}
</style>

<body class="g-center">
<div class="container g-center">
开头
Elit aliquam deleniti repellat libero repellendus. Harum optio numquam quae ut nobis sed Fugiat incidunt rem magni voluptatem magnam Rem officia atque eligendi reiciendis neque aut veritatis? Praesentium quo eaque.
Elit aliquam deleniti repellat libero repellendus. Harum optio numquam quae ut nobis sed Fugiat incidunt rem magni voluptatem magnam Rem officia atque eligendi reiciendis neque aut veritatis? Praesentium quo eaque.
结尾
</div>
</body>
```
解决: 在 `div.container` 中再套一层 `div.inner`, 并设置样式 `max-height: 100%` 即可.

> 如果内容需要 padding:
> - 可以添加 `::after` 伪元素撑高底部空白.
> - 或者, 在 `div.inner` 内部再套一层 `div.padding` 并设置 padding

修改后的代码如下:
```html
<style>
/* 新增样式 */
.inner {
  max-height: 100%;
  padding: 20px;
}
.inner::after {
  content: '';
  display: block;
  height: 20px;
  width: 100%;
}
</style>

<body class="g-center">
<div class="container g-center">
  <div class="inner">
    ...
  </div>
</div>
</body>
```
