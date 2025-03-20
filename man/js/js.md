# JavaScript

### prototype & class

判断函数是否用 `new` 调用
```js
function foo () {
  console.log(this?.constructor === foo)
}

foo() // false
new foo() // true
```
