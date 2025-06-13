# React

## antd: Ant Design

避免内层 Drawer 发生偏移
```js
<Drawer
  style={{ transform: 'translateX(0px)' }} // 避免内层 Drawer 发生偏移
  push={false} // 另一种写法
>
</Drawer>
```
