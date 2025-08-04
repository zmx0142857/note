# React

## memo

组件 memo
```js
import _ from 'lodash'

// 利用 isEqual 深度比较 object
const memoKeys = (component, keys = []) => (
    React.memo(component, (prev, now) => (
        _.isEqual(_.pick(prev, keys), _.pick(now, keys))
    )
)

const MyComponent = () => {...}

// 只在 prop1, prop2 变化时才更新组件
export memoKeys(MyComponent, ['prop1', 'prop2'])
```

redux memo
```js
import { useSelector, shallowEqual } from 'react-redux'
import _ from 'lodash'

const MyComponent = () => {
  // 当 redux state 的 a, b 变化时才更新组件
  // shallowEqual 只比较第一层属性是否相等 (Object.is)
  const { a, b } = useSelector(state => _.pick(state, ['a', 'b']), shallowEqual)
}
```

## antd: Ant Design

避免内层 Drawer 发生偏移
```js
<Drawer
  style={{ transform: 'translateX(0px)' }} // 避免内层 Drawer 发生偏移
  push={false} // 另一种写法
>
</Drawer>
```
