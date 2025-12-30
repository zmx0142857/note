# LeetCode

## 查找

### 线性查找

```js
// 返回第一个使 f 成立的下标 i ∈ [lo, hi), 若找不到返回 hi
var find = (lo, hi, f) => {
  for (let i = lo; i < hi; ++i) {
    if (f(i)) return i
  }
  return hi
}

// 若存在 i ∈ [lo, hi) 使得 f 成立, 则返回 true
var some = (lo, hi, f) => {
  return find(lo, hi, f) < hi
}

// 若任意 i ∈ [lo, hi) 都使得 f 成立, 则返回 true
var every = (lo, hi, f) => {
  return find(lo, hi, i => !f(i)) === hi
}
```

### 二分查找

```js
/**
 * 设 f: [lo, hi) -> {0, 1} 单调增
 * 在左闭右开区间 [lo, hi) 中寻找使 f(n) == 1 的最小 n, 若找不到则返回 hi
 * NOTE: 返回值 res 减 1 就是使 f(n) == 0 的最大 n, 若 res == lo 则说明不存在这样的 n
 */
var bsearch = (lo, hi, f) => {
  --lo
  while (hi - lo > 1) {
    const mid = lo + ((hi-lo)>>1)
    if (f(mid)) hi = mid
    else lo = mid
  }
  return hi
}
```

### 最大值最小值

```js
/**
 * 在左闭右开区间 [lo, hi) 中寻找 n 使 f(n) 最大
 * 如果区间为空, 返回 undefined
 */
var argmax = (lo, hi, f) => {
  let max = -Infinity
  let res = undefined
  for (let i = lo; i < hi; ++i) {
    const v = f(i)
    if (v > max) {
      max = v
      res = i
    }
  }
  return res
}

var argmin = (lo, hi, f) => {
  return argmax(lo, hi, i => -f(i))
}
```

TIPS: 如果在求 `argmax` 时想要排除某些情形, 可以返回 `-Infinity`, 例如, 求区间内函数值为正的最大值点, 可以这么写. 同理 `argmin` 可以返回 `Infinity` 来排除一些情形.
```js
argmax(lo, hi, n => {
  const res = f(n)
  return res > 0 ? res : -Infinity
})
```

## 随机算法

### 随机数

```js
// 随机生成 [lo, hi) 之间的浮点数, 包含 lo, 不包含 hi
var rand = (lo, hi) => {
  // lerp(lo, hi, Math.random())
  return lo + (hi-lo) * Math.random()
}

// 随机生成 [lo, hi) 之间的整数, 包含 lo, 不包含 hi
var randint = (lo, hi) => {
  return Math.floor(rand(lo, hi))
}
```

> ⚠  python 库函数 random.randint(a, b) 生成的是闭区间 [a, b] 的整数, 包含右端点

### 离散随机抽样

```js
// 样本空间 [0, n), 从已知离散概率分布 distrib 中抽取 k 个数字. 允许数字重复
var sample = (distrib, k) => {
  const res = []
  const cumsum = [] // 累积和
  let sum = 0
  distrib.forEach(weight => { // 权重可以是未经归一化的
    sum += weight
    cumsum.push(sum)
  })
  for (let i = 0; i < k; ++i) {
    const r = Math.random() * sum
    // 一定能找到这样的 j, 因为 r < sum = cumsum.at(-1)
    let j = bsearch(0, cumsum.length, j => cumsum[j] >= r)
    res.push(j)
  }
  return res
}
```

### 连续随机抽样

为了从分布函数 `F` 中抽取随机样本, 先取 `u ~ U[0, 1]`, 再令 `x = F⁻¹(u)` 即可. 其中 `F⁻¹` 是 `F` 的反函数, 可以用二分法近似求解:

```js
// 从分布函数 f 中抽取随机样本
var sample_f = (f, eps = 1e-6) => {
  const u = Math.random()
  let lo = -1, hi = 1, count = 100
  while (f(lo) > u && count--) lo *= 2
  while (f(hi) < u && count--) hi *= 2
  while (hi - lo > eps) {
    const mid = (lo + hi) / 2
    const fmid = f(mid)
    if (fmid < u) lo = mid
    else if (fmid > u) hi = mid
    else return mid
  }
  return (lo + hi) / 2
}
```

### Box-Muller 算法: 生成正态随机数

```js
// 生成标准正态随机数
// TIPS: 用 norm() * sigma + mu 得到任意正态随机数
var norm = () => {
  const { cache } = norm
  if (cache !== undefined) {
    delete norm.cache
    return cache
  }

  const { random, sqrt, log, cos, sin, PI } = Math
  let u1, u2 = random()

  // 避免计算 log(0) 得到 -Infinity
  do u1 = random(); while (u1 <= Number.EPSILON)

  const r = sqrt(-2 * log(u1))
  const theta = 2.0 * PI * u2

  // 生成一对正态随机数, 缓存其中一个, 用于下次返回
  norm.cache = r * sin(theta)
  return r * cos(theta)
}
```

### Fisher-Yates 洗牌: 生成均匀随机排列

遍历数组, 每步要么保持第 k 个元素不动, 要么将它与后面的随机一个元素交换.
数组的前 k 个位置是一个随机 k 排列.
```js
/**
 * fisher-yates 洗牌算法: 每个排列出现的概率都相等.
 * @param {any[]} arr
 * @param {number} k 生成 k 排列. 默认生成全排列
 * @param {number} lo 下标范围起始, 默认 0
 * @param {number} hi 下标范围结束 (不含), 默认 arr.length
 */
var shuffle = (arr, k, lo, hi) => {
  lo ??= 0
  hi ??= arr.length
  k ??= hi - lo
  for (let i = lo; i < lo + k; ++i) {
    // j = randint(i, hi)
    const j = i + Math.floor((hi-i) * Math.random())
    // swap(arr, i, j)
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}
```

### Knuth 抽样: 生成均匀随机组合

遍历数组, 每步以概率 p 选中当前元素:
p = 剩余需选数/剩余候选数.
这等价于 k 个红球和 n-k 个黑球的不放回摸球实验,
如果第 i 次摸到红球, 就选中第 i 个元素.
```js
/**
 * knuth 抽样算法: 每个 k-子集出现的概率都相等.
 * @param {any[]} arr
 * @param {number} k 抽样数量, 默认 1
 * @param {number} lo 下标范围起始, 默认 0
 * @param {number} hi 下标范围结束 (不含), 默认 arr.length
 */
var choose = (arr, k, lo, hi) => {
  lo ??= 0
  hi ??= arr.length
  k = Math.min(k ?? 1, hi - lo)
  const res = []
  for (let i = lo; i < hi; ++i) {
    const p = (k-res.length)/(hi-i)
    if (Math.random() < p) res.push(arr[i])
  }
  return res
}
```

### 哈希函数与伪随机数

> - `imul` 是 js 提供的 32 位整数乘法.
> - `>>>` 是无符号右移位, 这意味着高位永远补零, 结果永远非负.
> - ⚠ 这些算法适用于前端和游戏等, 但它们不安全, 不要用于**密码学**.
```js
// 字符串哈希
function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

// 32 位伪随机数, 接收 4 个 seed
function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

// 32 位伪随机数, 接收 1 个 seed
function mulberry32(a) {
  return function() {
    a >>>= 0;
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
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

模板
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

示例: 全排列
```js
var perm = (arr) => {
  const n = arr.length
  const res = []
  const buf = arr.slice()
  const swap = (i, j) => {
    const tmp = buf[i]
    buf[i] = buf[j]
    buf[j] = tmp
  }
  const dfs = (depth) => {
    if (depth === n) return res.push(buf.slice())
    for (let i = depth; i < n; ++i) {
      swap(i, depth)
      dfs(depth+1)
      swap(i, depth)
    }
  }
  dfs(0)
  return res
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

### 快速傅里叶变换 (FFT)

```js
// 复数运算. 用 [x, y] 表示 x+iy
var add = (a, b) => [a[0] + b[0], a[1] + b[1]]
var sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
var mul = (a, b) => [a[0]*b[0] - a[1]*b[1], a[0]*b[1] + a[1]*b[0]]
var scale = (a, n) => [a[0]*n, a[1]*n]

// 计算 Fourier 变换. 当 inv = true 时计算逆变换.
// 要求 a.length 是 2 的幂
var fft = (a, { inv = false } = {}) => {
  const { PI, log2, sin, cos } = Math
  const pi = inv ? PI : -PI
  const n = a.length
  const logn = log2(n) | 0
  const f = []

  // 枚举反转二进制数, 例如 logn=3 时, 序列为 0 4 2 6 1 5 3 7
  const next = (i) => {
    let mask = 1 << (logn-1)
    while (i & mask) {
      i ^= mask
      mask >>= 1
    }
    return i | mask
  }

  // 子问题细分
  for (let i = 0, j = 0; i < n; ++i) {
    f[i] = a[j]
    j = next(j)
  }

  // 子问题规模以 2 的幂递增
  for (let m = 1; m < n; m <<= 1) {
    const w = [cos(pi / m), sin(pi / m)]
    // j 以 2m 的倍数递增, 每一步合并位于 [j:j+2m] 的两个规模 m 的子问题
    for (let j = 0; j < n; j += m << 1) {
      let wk = [1, 0] // wk = w^k
      for (let k = 0; k < m; ++k) {
        const s = f[j + k]
        const t = mul(wk, f[j + k + m])
        f[j + k] = add(s, t)
        f[j + k + m] = sub(s, t)
        wk = mul(wk, w)
      }
    }
  }

  return inv ? f : f.map(v => scale(v, 1/n))
}

// 卷积
var conv = (a, b) => {
  const m = a.length, n = b.length
  const total = 1 << Math.ceil(Math.log2(m+n))
  a = fft([...a, ...new Array(total-m).fill([0, 0])], { inv: true })
  b = fft([...b, ...new Array(total-n).fill([0, 0])], { inv: true })
  return fft(a.map((_, i) => mul(a[i], b[i])))
}
```

用卷积计算大整数乘法. 虽然时间复杂度是 O(n log n), 但常数巨大, 速度可能不如竖式运算.
```js
// multiply('114514', '1919810') => 219845122340
var multiply = (a, b) => {
  if (a === '0' || b === '0') return '0'
  a = a.split('').map(n => [Number(n), 0])
  b = b.split('').map(n => [Number(n), 0])
  const len = a.length + b.length
  const res = conv(a, b).map(v => Math.round(v[0])).slice(0, len-1)
  for (let i = len-2; i > 0; --i) {
    res[i-1] += res[i] / 10 | 0
    res[i] %= 10
  }
  return res.join('')
}
```

## 字符串

### 子串的记号

我们用 `s[i:j]` 表示左闭右开区间 `s[i], ..., s[j-1]`, 特别 `i == j` 时这是空串.

### 前缀函数

字符串 `s` 的前缀函数是一个数组 `pi`, 其中 `pi[i-1]` 表示子串 `pi[0:i]` 的最长相等前后缀的长度:

<center>
  <code>pi[i-1] := max{0 ≤ k < i: s[0:k] == s[i-k:i]}</code>.
</center>

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

## 树

### 并查集

```js
// set[i] >= 0 时, 指示 i 的父节点
// set[i] < 0 时, 意味 i 是根节点, 其绝对值表示集合大小
const set = Array(n).fill(-1)

// 查找 i 的根节点
const find = (i) => {
  return set[i] < 0 ? i : (set[i] = find(set[i]))
}

// 把集合 j 并入集合 i
const union = (i, j) => {
  i = find(i)
  j = find(j)
  if (i === j) return
  if (set[i] > set[j]) return union(j, i)
  set[i] += set[j]
  set[j] = i
}
```
