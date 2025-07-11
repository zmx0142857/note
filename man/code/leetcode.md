# LeetCode

## 查找

### 最大值最小值

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

### 二分查找

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

## 链表

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

## 递归与回溯

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

## 数学

### 快速幂

```js
/**
 * 遍历 n 的每个 bit
 * x^n = x^(sum 2^k b_k)
 *     = prod x^(2^k) where b_k = 1
 * @param {number} x
 * @param {uint32} n
 */
var pow = (x, n) => {
  let res = 1
  while (n) {
    if (n & 1) res *= x
    x *= x
    n >>>= 1
  }
}
```

### 大整数运算

```js
// 以倒序 BASE 进制数组表示非负整数, 如 12345 表示成 [345, 12]
// 乘法运算不溢出, 需满足 (m+n) * BASE * BASE < MAX_SAFE_INTEGER.
// 取 SIZE=6 时 m+n 不超过 9007, 相当于乘法结果不超过 54042 位数,
// 可以满足大多数情况的实际需要
var SIZE = 6
var BASE = Math.pow(10, SIZE)

var toString = (a) => {
  const n = a.findLastIndex(Boolean), res = [a[n]]
  for (let i = n - 1; i >= 0; --i) {
    res.push(String(a[i]).padStart(SIZE, '0'))
  }
  return res.join('') || '0'
}

var fromString = (s) => {
  let res = [], lo
  for (let hi = s.length; hi > 0; hi = lo) {
    lo = Math.max(0, hi-SIZE)
    res.push(Number(s.slice(lo, hi)))
  }
  return res
}

var isZero = (a) => {
  return !a.some(Boolean)
}

var carry = (a) => {
  let c = 0
  for (let i = 0; i < a.length; ++i) {
    a[i] += c
    c = a[i] / BASE | 0
    a[i] %= BASE
    // 处理减法借位
    if (a[i] < 0) {
      --c
      a[i] += BASE
    }
  }
  if (c) a.push(c)
  return a
}

var compare = (a, b) => {
  const m = a.length, n = b.length
  if (m < n) return -1
  if (m > n) return 1
  for (let i = n-1; i >= 0; --i) {
    if (a[i] < b[i]) return -1
    if (a[i] > b[i]) return 1
  }
  return 0
}

// 加法结果保存到 a 中
var add = (a, b) => {
  const n = Math.max(a.length, b.length)
  for (let i = 0; i < n; ++i) {
    a[i] = (a[i] || 0) + (b[i] || 0)
  }
  return carry(a)
}

// 减法结果保存到 a 中, 要求 a ≥ b
var sub = (a, b) => {
  const n = a.length
  for (let i = 0; i < n; ++i) {
    a[i] -= (b[i] || 0)
  }
  return carry(a)
}

// 乘法
var mul = (a, b) => {
  if (isZero(a) || isZero(b)) return [0]
  const m = a.length, n = b.length
  const res = new Array(m+n-1).fill(0)
  for (let i = 0; i < m; ++i) {
    for (let j = 0; j < n; ++j) {
      res[i+j] += a[i] * b[j]
    }
  }
  return carry(res)
}

// 整数除法
var div = (a, b) => {
  if (isZero(b)) throw new Error('division by zero')
  if (compare(a, b) < 0) return [0]

  // 现在有 a >= b, 寻找最大的 n 使得 a >= c := (2**n) * b,
  // 则 a / b = 2**n + (a - c) / b
  const pow = [1]
  const divisor = b.slice()
  sub(a, b)
  while (compare(a, b) >= 0) {
    sub(a, b)
    add(pow, pow)
    add(b, b)
  }
  return add(pow, div(a, divisor))
}
```

## 字符串

### 前缀函数

```js
var prefix_function = (s) => {
  const pi = []
  if (s.length) pi.push(0)
  let j = 0
  for (let i = 1; i < s.length; ++i) {
    while (j > 0 && s[i] !== s[j]) j = pi[j-1]
    j = s[i] === s[j] ? j+1 : 0
    pi.push(j)
  }
  return pi
}
```
