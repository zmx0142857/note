# Python

## 字符串

模板
```py
value = 1
print(f'value={value}')
```

查找与替换
```py
'aaa'.replace('a', 'b') # 全局替换, 不支持正则
```

## 函数

字典参数
```py
def fn(a, *, key=1, value=2):
    print(a, key, value)
```
