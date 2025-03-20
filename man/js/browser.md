# 浏览器

### 移动端事件

禁用触摸滚动
```js
const preventDefault = e => e.preventDefault()
document.addEventListener('touchmove', preventDefault, { passive: false })
// 恢复
document.removeEventListener('touchmove', preventDefault)
```
