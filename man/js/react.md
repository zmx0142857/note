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

## hooks

### 标准 hook

- useState
- useEffect
- useRef
- useImperativeHandle
- useContext
- useLayoutEffect
- useReducer

### 自定义 hook

```js
// 返回第一个非空值
const useFirst = (value, isEmpty = (v) => !v) => {
  const cache = useRef()
  return useMemo(() => {
    if (isEmpty(cache.current)) {
        cache.current = value
    }
    return cache.current
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
}

// 父组件可以影响组件的状态
// 可选: 传入 getDelay 函数用于计算延迟时间
const useValue = (value, getDelay) => {
  const [_value, setValue] = useState(value)

  const later = (fn, delay) => {
    return delay === undefined
      ? fn() && undefined
      : setTimeout(fn, delay)
  }

  useEffect(() => {
    const timer = later(() => setValue(value), getDelay?.(value))
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return [_value, setValue]
}

// 每次渲染都返回相同的函数, 并及时更新闭包
const usePersistFn = (fn) => {
  const ref = useRef(() => {
    throw new Error('Cannot call function while rendering.')
  })
  ref.current = fn
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback((...args) => ref.current(...args), [])
}

// 监听 dom 大小变化
const useResize = (ref) => {
  const [size, setSize] = useState([])

  useEffect(() => {
    const el = ref.current
    // 注意 ref 不应挂在异步组件下, 否则会造成 size 未初始化
    if (!el) return console.warn('useResize: el is undefined')
    const update = () => {
      const size = [el.offsetWidth, el.offsetHeight]
      console.log('useResize', ...size)
      setSize(size)
    }
    update()
    if (!window.ResizeObserver) return
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.unobserve(el)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return size
}

/**
 * 全屏控制
 * @param {React.RefObject} ref
 * @param {boolean} defaultValue
 * @returns {[boolean, () => void]}
 */
const useFullscreen = (ref, defaultValue = false) => {
  const [isFull, setIsFull] = useState(defaultValue)

  useEffect(() => {
    const onFullscreenChange = () => {
      const isFull = document.fullscreenElement === ref.current
      setIsFull(isFull)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = () => {
    if (isFull) {
      document.exitFullscreen()
    } else {
      ref.current.requestFullscreen()
    }
  }

  return [isFull, toggle]
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
