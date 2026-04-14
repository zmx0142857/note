# Quine

## 入门

quine 是一种输出自身源码的程序, 即程序的输出与源码完全相同.
读取文件的方法一般视为作弊, 而不被采用.
quine 的重要思想是将源码编码后存储.
输出时, 第一遍原样输出, 第二遍将它解码后输出.
典型的 quine 形如:
```py
src = print(encoded_src) + decode(encoded_src)))
quine = encode(src) + src
```

### 数组编码

让我们试试用数组编码:
```py
a = ['print("a =", a)', 'for s in a: print(s)']
print("a =", a)
for s in a: print(s)
```
该程序完全遵循基本技巧: 第一行是编码后的 src, 第二行原样输出, 第三行解码后输出.

### ascii 编码

采用的编码方式是无所谓的, 甚至可以用 ascii 编码.
并且比起直接编写 quine, 更方便的做法是编写 **quine 生成器**.
例如, 下面的函数输出一个 quine 程序:
```py
def quine_ascii():
    def encode(s):
        return str([ord(c) for c in s])
    src = '''print('s =', s)
print(''.join(chr(c) for c in s))'''
    return 's = ' + encode(src) + '\n' + src

print(quine_ascii())
```
将上述代码的输出保存为 src1.py, src1.py 的输出保存为 out1.py, 则 src1.py 和 out1.py 完全相同:

    $ python quine_ascii.py > src1.py
    $ python src1.py > out1.py
    $ diff src1.py out1.py

### 最短的 python quine?

```py
_='_=%r;print(_%%_)';print(_%_)
```
该程序使用字符串格式符编码, 并且巧妙地将同一个字符串用作模板和数据 (即 `_ % _`).
其中 `%r` 格式符的作用是原样插入字符串, 并保留单引号. 例如 `'%r' % 'a'` 的结果是 `"'a'"`.
最后注意百分号转义为 `%%` 即可.

## C 语言 Quine

我们已经学会编写 python quine, 但它们使用了太多 python 的特性. 让我们采用字符串格式符编码,
并一步步去掉这些特性.

下面是一些 quine 生成器, 即每个函数都输出一个 quine 程序:

```py
# 使用字符串格式符编码
def quine1():
    def encode(s):
        t = s.replace('%', '%%').replace("'", '%s')
        return "'''" + t + "'''"
    src = """q = "'"
print("s = '''%s'''" % s)
print(s % (q, q, q, q, q, q, q))"""
    return 's = ' + encode(src) + '\n' + src

# 不使用多行字符串特性, 考虑反斜杠的转义
def quine2():
    def encode(s):
        t = s.replace('%', '%%').replace("'", '%s').replace('\n', '%s').replace('\\', '%s')
        return "'" + t + "'"
    src = """q = "'"
n = '\\n'
b = '\\\\'
print("s = '%s'" % s)
print(s % (q, n, q, b, q, n, q, b, b, q, n, q, q, n))"""
    return 's = ' + encode(src) + '\n' + src

# 不使用双引号, 只用单引号
def quine3():
    q = '\''
    def encode(s):
        t = s.replace('%', '%%').replace(q, '%s').replace('\n', '%s').replace('\\', '%s')
        return q + t + q
    src = '''q = '\\''
n = '\\n'
b = '\\\\'
print('s = \\'%s\\'' % s)
print(s % (q, b, q, q, n, q, b, q, n, q, b, b, q, n, q, b, q, b, q, q, n))'''
    return 's = ' + encode(src) + '\n' + src

# c 语言的版本
def quine4():
    q = "\""
    def encode(s):
        t = s.replace('%', '%%').replace(q, '%s').replace('\n', '%s').replace('\\', '%s')
        return q + t + q
    src = '''int main () {
  char *q = "\\"", *n = "\\n", *b = "\\\\";
  printf("#include <stdio.h>\\nchar *s = \\"%s\\";\\n", s);
  printf(s, n, q, b, q, q, q, b, q, q, b, b, q, n, q, b, b, q, b, q, b, q, n, n, n, n);
  return 0;
}
'''
    return '#include <stdio.h>\nchar *s = ' + encode(src) + ';\n' + src.strip()
```

绝大多数时候, c 语言 quine 不需要这么长. 假定换行符、单引号的 ascii 码分别是 10 和 34, 也可以像下面这样写:
```c
#include <stdio.h>
int main(){char *s="#include <stdio.h>%cint main(){char *s=%c%s%c;printf(s,10,34,s,34,10);}%c";printf(s,10,34,s,34,10);}
```
