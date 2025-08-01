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
const media = matchMedia('(prefers-color-scheme: dark)')
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

## Trouble Shooting

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
