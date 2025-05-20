# JavaScript

### string to number

推荐使用 `parseFloat`, 更仔细的写法参见 [builtin.js](https://www.npmjs.com/package/@zmx0142857/builtin) 的 `toNumber` 函数.

### prototype & class

判断函数是否用 `new` 调用
```js
function foo () {
  console.log(this?.constructor === foo)
}

foo() // false
new foo() // true
```

### join

避免网页上出现 undefined, null 的好方法, 但是要小心 object!
```js
['a', 'b', undefined, null].join('') // "ab"
['a', 'b', undefined, null, [], {}].join('') // "ab[object Object]"
```

### json parse number as string

```js
JSON.parse('{"id":1231231231231231231231}', (k, v, { source }) => {
  if (typeof v === 'number') return source;
  return v;
})
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

### [jsfuck](https://github.com/aemkei/jsfuck)

一种只使用 `[]()+!` 六个字符的混乱代码

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
