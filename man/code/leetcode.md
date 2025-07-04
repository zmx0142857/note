# LeetCode

二分查找
```js
/**
 * 设 f: [lo, hi] -> {0, 1} 单调增
 * 在闭区间 [lo, hi] 中寻找使 f(n) == 1 的最小 n, 若找不到则返回 hi+1
 * NOTE: hi-1 就是使 f(n) == 0 的最大 n, 如果 hi-1 == -1 说明不存在这样的 n
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
