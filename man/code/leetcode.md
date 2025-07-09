# LeetCode

最大值最小值
```js
/**
 * 在闭区间 [lo, hi] 中寻找 n 使 f(n) 最大
 * 如果区间为空, 返回 undefined
 */
var argmax = (lo, hi, f) => {
  let max = -Infinity
  let res = undefined
  for (let i = lo; i <= hi; ++i) {
    const v = f(i)
    if (v > max) {
      max = v
      res = i
    }
  }
  return res
}

var argmin = (lo, hi, f) => {
  let min = Infinity
  let res = undefined
  for (let i = lo; i <= hi; ++i) {
    const v = f(i)
    if (v < min) {
      min = v
      res = i
    }
  }
  return res
}
```

二分查找
```js
/**
 * 设 f: [lo, hi] -> {0, 1} 单调增
 * 在闭区间 [lo, hi] 中寻找使 f(n) == 1 的最小 n, 若找不到则返回 hi+1
 * NOTE: 返回值 res 减 1 就是使 f(n) == 0 的最大 n, 若 res == lo 则说明不存在这样的 n
 */
var bsearch = (lo, hi, f) => {
  --lo, ++hi
  while (hi - lo > 1) {
    const mid = lo + ((hi-lo)>>1)
    if (f(mid)) hi = mid
    else lo = mid
  }
  return hi
}
```

链表
```js
function ListNode(val = 0, next = null) {
  this.val = val
  this.next = next
}

var fromArray = (arr) => {
  const L = new ListNode()
  let p = L
  for (const v of arr) {
    p.next = new ListNode(v)
    p = p.next
  }
  return L.next
}

var toArray = (L) => {
  const res = []
  while (L) {
    res.push(L.val)
    L = L.next
  }
  return res
}
```

回溯
```js
var dfs = (depth = 0) => {
  if (depth === n) {
    return output()
  }
  choices().forEach(choice => {
    make(choice)
    dfs(depth+1)
    undo(choice)
  })
}
```
