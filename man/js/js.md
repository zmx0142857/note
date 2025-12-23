# JavaScript

## Number

### max safe integer

js number 使用 64 位浮点数, 能精确表示的最大整数是 `2**53-1`.
```js
Number.MAX_SAFE_INTEGER === 2**53-1 // true
```

想要更大的整数类型, 考虑 js 自带的 `BigInt` 或 npm 包 `long`.

### 位运算

```js
value | 0 // 向零取整, 转为 int32
value >> 0 // 转为 int32
value >>> 0 // 转为 uint32
```

用于查找
```js
const index = arr.indexOf(item)
if (~index) {
  // index !== -1
}
```

`Math.floor` 与 `n | 0` 的区别
- `n | 0` 只适用于 `int32` 范围内的整数, 且向零取整
- `Math.floor` 适用于任意 `number`, 且向下取整
```js
4294967295 | 0 // 坏了, -1
Math.floor(4294967295) // 正确, 4294967295

(-1.5) | 0 // -1
Math.floor(-1.5) // -2
```

### string to number

推荐使用 `parseFloat`, 更仔细的写法参见 [builtin.js](https://www.npmjs.com/package/@zmx0142857/builtin) 的 `toNumber` 函数.

## String

### join

避免网页上出现 undefined, null 的好方法, 但是要小心 object!
```js
['a', 'b', undefined, null].join('') // "ab"
['a', 'b', undefined, null, [], {}].join('') // "ab[object Object]"
```

### json parse number as string

```js
JSON.parse('{"id":12345678901234567890}', (k, v, { source }) => {
  if (k === 'id' && typeof v === 'number') return source;
  return v;
})
```

## json stringify circular reference

循环引用结构在序列化时会报错. 应对方法:
```js
const toJson = (obj, defaultValue) => {
  const cache = new Set()
  return JSON.stringify(obj, (k, v) => {
    if (v instanceof Object) { // 参见 "何为对象"
      if (cache.has(v)) return defaultValue
      cache.add(v)
    }
    return v
  })
}

const o = { get foo () { return o } }
JSON.stringify(o) // Error
toJson(o, null) // '{"foo":null}'
```

## Array

```js
Array(n).fill() // 用 undefined 填充数组
[...Array(n)] // 同上
[...Array(m)].map(() => Array(n).fill(0)) // m 行 n 列的零矩阵
```

```js
[...Array(n).keys()] // 使用迭代器生成 [0..n-1]

// 在最新的浏览器中, 迭代器接口 Iterator 支持 toArray, map, flatMap 等方法:
Array(y).keys().toArray() // 同样生成 [0..n-1]
Array(9).keys().flatMap(i =>
  Array(9-i).keys().map(j => `${i+1} * ${j+i+1} = ${(i+1)*(j+i+1)}`)
).toArray() // 九九乘法表
```

取最后一个元素
```js
arr.at(-1)
```

## Date

```js
new Date('2025-11-17') // UTC, ✅推荐使用
new Date('2025/11/17') // 本地时间
new Date('2025-11-17 00:00:00') // 本地时间
new Date('2025/11/17 00:00:00') // 本地时间
```

> 建议总是使用 yyyy-mm-dd 的 UTC 格式，以避免时区相关的坑

孩子们，历法是座屎山。如果你发现你的[时间偏差了 343 秒](https://www.cnblogs.com/thisiswhy/p/15623731.html)，那是因为 Asia/Shanghai 在 1900 和 1901 交界处发生过一次历史时区偏移，从 UTC+08:05:43 改成了 UTC+08:00:00
```js
new Date('1901-01-01').valueOf() - new Date('1900-12-31').valueOf() // 86400000, ok
new Date('1901/01/01').valueOf() - new Date('1900/12/31').valueOf() // 86743000, wtf
```
[关于时区的更深入探讨](https://keng42.com/blog/article/timezone/)


## Object

### 相等比较

> 永远不要使用两等号 `==` 进行比较!
```js
NaN === NaN // false
Object.is(0, -0) // false
```

### prototype

`obj.prototype` 和 `Object.getPrototypeOf(obj)` 一般是不同的.

### 何为对象
```js
const isPlainObject = (obj) => {
  if (!obj) return false
  const proto = Object.getPrototypeOf(obj)
  return proto === null || proto === Object.prototype
}
```

||`{}`|`[]`|`fn`|`new fn`|
|-|-|-|-|-|
|`obj instance of Object`|✅|✅|✅|✅|
|`typeof obj === 'object' && obj !== null`|✅|✅||✅|
|`Object.prototype.toString.call(obj) === '[object Object]'`|✅|||✅|
|`isPlainObject(obj)`|✅||||

- 什么不是对象: `"str"`, `1`, `true`, `null`, `undefined`
- toStringTag 的用法:
  ```js
  obj = { [Symbol.toStringTag]: 'Foo' }
  Object.prototype.toString.call(obj) // '[object Foo]'
  ```

### 何为数组

除了正统数组 `[]` 外, 还有许多伪数组 (arraylike) 对象, 具有以下特点:
- 有 length 属性, 按 0, 1, 2, ... 索引元素
- 可以被展开为数组 `arr = [...arraylike]`, 或用 `Array.from(arraylike)` 转化为数组
- 无法通过数组检测: `Array.isArray(arraylike) === false`

> fun fact: `Array.prototype` 可以通过数组检测: `Array.isArray(Array.prototype) === true`.

常见的伪数组有:
- `String`: 字符串
- `Arguments`: 函数参数对象
- `NodeList`: `el.querySelectorAll()` 返回的元素列表
- `HTMLFormControlsCollection`: `form.elements` 列表
- `Uint8Array`, `Float32Array` 之类的类型数组 (TypedArray)

```js
const isTypedArray = (arr) => {
  return Object.getPrototypeOf(arr) === Object.getPrototypeOf(Uint8Array)
}
```

### 判断函数是否用 `new` 调用

```js
function foo () {
  console.log(this?.constructor === foo)
}

foo() // false
new foo() // true
```

## 平台相关

### console
```js
console.log('some log')
console.warn
console.error

console.dir(str.match(/a/)) // 以对象的形式打印, 不作特殊处理
console.dir(loaders, { depth: 4 }) // 指定对象深度 (nodejs)

console.table

console.group('group1')
console.log('content')
console.groupEnd('group1')

console.time('id')
console.timeEnd('id')

// 浏览器有效, node 无效
console.log('%c你好!', 'color:#29e;background:#233;font-weight:bold')
// 花里胡哨
console.log('%c Platform %c shakespeare ', 'padding: 1px; border-radius: 3px 0 0 3px; color: #fff; background: #606060;', 'padding: 1px; border-radius: 0 3px 3px 0; color: #fff; background: #248;')
// 花里胡哨 x2
var t = ["\n %c %c %c PixiJS 4.8.7 - ✰ WebGL ✰  %c  %c  http://www.pixijs.com/  %c %c ♥%c♥%c♥ \n\n", "background: #ff66a5; padding:5px 0;", "background: #ff66a5; padding:5px 0;", "color: #ff66a5; background: #030307; padding:5px 0;", "background: #ff66a5; padding:5px 0;", "background: #ffc3dc; padding:5px 0;", "background: #ff66a5; padding:5px 0;", "color: #ff2424; background: #fff; padding:5px 0;", "color: #ff2424; background: #fff; padding:5px 0;", "color: #ff2424; background: #fff; padding:5px 0;"];
console.log(...t)
```

### 浏览器事件

禁用触摸滚动 / 禁用滚动冒泡: 滚动事件无法通过 `e.stopPropagation` 阻止冒泡, 但可以通过下面的方法来阻止冒泡:
```js
const preventDefault = e => e.preventDefault()
document.addEventListener('touchmove', preventDefault, { passive: false })
// 恢复
document.removeEventListener('touchmove', preventDefault)
```

获取当前触摸元素
```js
container.addEventListenter('pointermove', e => {
  const { clientX, clientY } = e
  // const target = e.target // 不行, 它永远是触摸开始时的元素
  const target = document.elementFromPoint(clientX, clientY) // ok
})
```

### dom 查询

获取包围矩形
```js
// 可以有小数
el.getBoundingClientRect() // { x, y, width, height, left, right, top, bottom }

// 全是整数
pick(el, ['offsetLeft', 'offsetTop', 'offsetWidth', 'offsetHeight', 'clientWidth', 'clientHeight'])
```

监听元素大小变化
```js
const observer = new ResizeObserver(() => {
  console.log(el.getBoundingClientRect())
})
observer.observe(el) // 开始监听
observer.unobserve(el) // 结束监听
```

监听元素进入视口
```js
const observer = new IntersectionObserver((arr) => {
  console.log(arr.map(v => v.isIntersecting))
}, {
  threshold: 0,
  rootMargin: '0px',
  root: el,
})
```

### 标签页

```js
window.open(url, '_blank') // 在新标签页中打开
```
或者
```html
<a href="https://www.example.com" target="_blank">在新标签页中打开</a>
```

### bytes 字节数组

在浏览器, 使用 `Uint8Array`, 在 Node, 使用 `Buffer`

使用 DataView 读取字节内容:
```js
const arr = new Uint8Array([1, 1, 4, 5, 1, 4])
const view = new DataView(arr.buffer)
const offset = 0
const littleEndian = true
const num = view.getUint32(offset, littleEndian)
```

### worker

原生 worker
```html
<script id="worker" type="worker">
self.addEventListener('message', e => {
  console.log('[worker]', e.data)
  self.postMessage({ msg: 'hello from worker' })
})
</script>

<script>
const url = window.URL.createObjectURL(
  new Blob([document.querySelector('#worker').textContent])
)
const worker = new Worker(url)
worker.addEventListener('message', e => {
  console.log('[main]', e.data)
})
worker.postMessage({
  msg: 'hello from main',
})
</script>
```

使用 comlink

`worker.js`
```js
Comlink.export({
  hello: () => 'hello from worker',
})
```

`main.js`
```js
const worker = new Worker('worker.js')
const wrapper = Comlink.wrap(worker)
await wrapper.hello()
```

[builtin.js](https://www.npmjs.com/package/@zmx0142857/builtin) 中的 worker 封装 (利用 Proxy):
```html
<script id="worker" type="worker">
exports({
  hello: () => 'hello from worker',
})
</script>

<script type="module">
import createWorker from './worker.js'
const src = document.querySelector('#worker').textContent
const worker = createWorker(src, { name: 'my-worker' })
const { proxy } = worker
proxy.hello().then(console.log)
</script>
```

### Audio API

[来自 测测你是不是猪](https://nanancc.github.io/pig-text/)
```js
function playSound(type) {
  try {
    // 创建音频上下文
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    // 创建振荡器
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // 设置音效参数
    if (type === 'complete') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    }
  } catch (error) {
    console.error('播放音效失败:', error);
    // 音效播放失败不影响主要功能
  }
}
```

### es module 命名冲突

在 es module 中, 如果两个模块具有相同名字的组件, 会怎样呢?
```js
// a.js
export const hello = () => 'AAA'

// b.js
export const hello = () => 'BBB'

// main.js
export * from './a.js'
export * from './b.js'

// index.js
import { hello } from './main.js'

console.log(hello())
```
- 截至 2025 年底, 新版浏览器原生、webpack、vite 均报错.
- 旧版 webpack (5.25.1) 运行结果是 `AAA`, 但有一个警告.

### 内存占用情况

除了使用开发者工具外, Chrome 和 Edge 还提供了 performance api:
```js
console.log(performance.memory)
```

## html

用原生 input 模拟 switch 组件
```html
<input type="range" min="0" max="1" />
```


## 逆向

### debugger: 防止页面被调试

### 混淆与反混淆

- 混淆: obfuscate.io
- [反混淆工具1](https://www.51shizhi.com/tool/js-anti-obfuscate-io)
- [反混淆工具2](https://obf-io.deobfuscate.io/)
- [js逆向入门实例](https://www.luogu.com.cn/article/tk6qsd8x)

## esolang

一些非常规代码

### jsfuck

[jsfuck](https://github.com/aemkei/jsfuck): 一种只使用 `[]()+!` 六个字符的混乱代码

```js
false       =>  ![]
true        =>  !![]
undefined   =>  [][[]]
NaN         =>  +[![]]
0           =>  +[]
1           =>  +!+[]
2           =>  !+[]+!+[] // !![] + !![]
10          =>  +[[+!+[]]+[+[]]]
Array       =>  []
Number      =>  +[]
String      =>  []+[]
Boolean     =>  ![]
Function    =>  []["filter"]
run         =>  []["filter"]["constructor"]( CODE )()
eval        =>  []["filter"]["constructor"]("return eval")()( CODE )
window      =>  []["filter"]["constructor"]("return this")()
```

### thank you for inventing js

to number
```js
['', [], null, {}, undefined].map(v => +v) // [0, 0, 0, NaN, NaN]
['', [], null, {}, undefined, Infinity, NaN].map(v => ~~v) // [0, 0, 0, 0, 0, 0, 0]
```

to string
```js
'' + [] // ''
[] + '' // ''
[] + [] // ''
'' + {} // '[object Object]'
{} + '' // 0
{} + 'hello' // NaN
```

```js
NaN + [] // 'NaN'
[] + NaN // 'NaN'
0 + [] // '0'
[] + 0 // '0'
```

bit flip
```js
// ~n === -n-1, 比如
~0 // -1
-~100 // 101
~-100 // 99
```

primes
```js
res = [] // 素数结果数组
// n-2 && primes(n-1): 从 2 到 n 的循环
// res[m] ??= n: 如果 res[m] 处是 undefined, 就把 n 存入其中
// 如果 res[m] 整除 n, 那么 n 是合数, 返回 res
// 否则进一步检查 res[m+1] 是否整除 n
primes = n => (n-2 && primes(n-1), (div = m => n % (res[m] ??= n) ? div(m+1) : res)(0))
primes(100) // [2, 3, 5, ..., 97]
```
