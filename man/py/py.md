# Python

## 基础

### 字符串

模板
```py
value = 1
print(f'value={value}')
```

查找与替换
```py
'aaa'.replace('a', 'b') # 全局替换, 不支持正则. 正则替换请使用 re.sub
```

### 函数

字典参数
```py
def fn1(a, *, key=1, value=2):
    print(a, key, value)

def fn2(a, b):
    print(a, b)

fn2(b=1, a=2) # 2 1
```

### 全局变量

在函数中, 可以直接读取全局变量的值. 但如果要修改全局变量的值, 必须先以 global 关键字进行声明, 否则会报错 `UnboundLocalError: cannot access local variable 'a' where it is not associated with a value`.
显然 python 把这里的 a 当成未初始化的局部变量, 从而报错.

如果全局变量是列表、字典等容器, 可以随意修改它的内容, 但如果要让全局变量指向一个新的容器, 则必须使用 global 声明.
```py
a = 42

def main():
    # global a
    # a += 1
    print(a)

main()
```

### 包与模块

python 的层次关系:
- 包: 就是文件夹
- 模块: 就是 `.py` 文件
- 函数、类、模块级变量

模块引入
```txt
.
├─ pak1/
│  ├─ main.py
│  ├─ mod1.py
│  └─ pak2/
│     ├─ mod2.py
│     └─ __init__.py
└─ pak3/
   └─ mod3.py
```

在 `mod1.py`, `mod2.py`, `mod3.py`, `__init__.py` 各定义一个 `hello` 函数:
```py
def hello():
    print('hello', __file__)
```

`main.py`
```py
import mod1 # 同目录下的模块
from pak2 import mod2 # 子目录下的模块
import pak2 # 子目录下的 __init__.py 模块

mod1.hello()
mod2.hello()
pak2.hello()

# 其他目录, 先添加到 sys.path
import sys
from os.path import dirname, normpath, join
path_to_pak3 = normpath(join(dirname(__file__), '../pak3'))
sys.path.append(path_to_pak3)

import mod3 # 然后, 就和同目录下的模块一样引入. 但小心不要与标准库重名

mod3.hello()
```

### 装饰器

```py
import time

def timer(fn):
    def inner():
        start = time.time()
        res = fn()
        end = time.time()
        print(end - start, 'seconds')
        return res
    return inner

@timer # 相当于 test = timer(test)
def test():
    sorted(list(range(9999999,0,-1)))
    return 42

print(test())
```

## 标准库

文件操作
```py
with open('input.txt') as f:
    lines = f.readlines() # 按行读取为列表

# 除了最后一行, 每个字符串都以 \n 结尾
# 最后一行有无换行符取决于文件是否以 \n 结尾
print(lines)
```

pathlib - 文件路径
```py
Path(__file__).parent.resolve() # 获取文件所在的目录名 (绝对路径)
```

re - 正则表达式
```py
re.match(r'\d+', text) -> None | Match
re.findall(r'\d+', text) -> str[]
re.sub(r'\d+', '000', text) -> str
```

json
```py
d = json.loads('{"a":1}')
json.dumps(d)
```

base64
```py
base64.b64encode(bytes('你好', 'utf-8'))
str(base64.b64decode('5L2g5aW9'), 'utf-8')
```

socket: TCP/UDP 连接, 参见 [net.md](markdown.html#man/os/net.md)

os/subprocess: 命令执行
```py
import os, subprocess

os.system('ls') -> int # 执行命令行并输出到 stdout, 成功时返回 0
os.popen('ls').read() -> str # 执行命令, 返回输出内容

# 通过管道执行命令. stdin 或 stdout 也可以指定为文件
p = subprocess.Popen(['cat'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
p.stdin.write('复读机\n'.encode()) # 保证以 \n 结尾
p.stdin.close()
print([s.decode() for s in p.stdout.readlines()])
```

time: 时间
```py
time.strftime('%Y-%m-%d %H:%M:%S')
time.sleep(seconds)
```

threading: 线程
```py
import threading

def fn(n):
    print(n, threading.currentThread().getName())

t = threading.Thread(target=fn, args=(42,))
t.start()
```

## 第三方库

requests: http 网络请求
```py
import requests

# 下载
res = requests.get(url)
# print(res.headers, res.text, res.cookies)
with open('./file.jpg', mode='wb') as f:
    f.write(res.content)

# 上传
with open('./file.jpg', 'rb') as f:
    res = requests.post(url, files={ 'files': f })
    print(res.text)

# 登录
session = requests.session()
session.post(login_url, json=json1)
session.post(do_something_url, json=json2) # 自动携带 cookies

# https
requests.get(url, verify=False) # 忽略证书校验
```

beautifulsoup4 + lxml: 爬虫与网页解析
```py
from bs4 import BeautifulSoup
import requests

res = requests.get(url)
html = BeautifulSoup(res.text, 'lxml')
print(html.head.title.string)
print(html.find(id='keyword')) # 找一个
print(html.find_all(class_='title')) # 找多个
print(html.select('.title')) # 找多个, 相当于 js 的 querySelectorAll
```

pymysql: 操作 mysql 数据库
```py
import pymysql
from pymysql.cursors import DictCursor

conn = pymysql.connect(
    host='localhost',
    port=3306,
    user='root',
    password='',
    database='test',
    charset='utf8',
    autocommit=True # 默认为 False, 增删改操作需要 conn.commit()
)
print(conn.host_info)
cursor = conn.cursor(DictCursor)

sql = "select * from user"
cursor.execute(sql)
res = cursor.fetchall()
print(res)

conn.close()
```
uiautomation: 桌面程序自动化测试

