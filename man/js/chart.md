# 图表

## ant design chart

### Trouble Shooting

- 图表在缩放状态下, 导致鼠标位置偏移. 解决:
  ```js
  const config = {
    data: [],
    supportCSSTransform: true,
  }
  ```
