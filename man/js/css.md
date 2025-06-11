# css

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

## 卡片转场特效

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
