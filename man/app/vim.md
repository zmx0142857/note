# Vim

## 正常模式 - normal

在 vim 中, 每个键都是快捷键.
```
<space>     # 后移一格
<backspace> # 前移一格

j       # 向下移动
k       # 向上移动
h       # 向左移动
l       # 向右移动
gg      # 跳到第一行
G       # 跳到最后一行
10gg    # 跳到第 10 行
ctrl-f  # 向下翻页
ctrl-b  # 向上翻页

<esc>   # 从其它模式回到正常模式 (有些状态下, 需要多按几次)

i       # 进入插入模式 (insert)
I       # 光标移到行首的非空白字符, 然后进入插入模式
a       # 光标后移一格, 然后进入插入模式
A       # 光标移到行尾, 然后进入插入模式
o       # 另起一行, 然后进入插入模式
O       # 在上方另起一行, 然后进入插入模式

v       # 进入选择模式 (visual)
V       # 进入按行选择模式 (visual line)

yy      # 复制一行
10yy    # 复制 10 行
dd      # 剪下一行
10dd    # 剪下 10 行
p       # 粘贴

gt      # 下一标签页
gT      # 上一标签页

ctrl-w <hjkl>   # 切换当前分屏
```

## 插入模式 - insert

一个正常打字的模式, 但也有一些快捷键:
```
ctrl-p  # 自动补全单词
ctrl-k  # 组合字, 用于输入一些特殊符号文字, 如 á 可以用 ctrl-k a' 来输入
```

## 命令模式

```
:w      # 保存 (write)
:q      # 退出 (quit)
:wq     # 保存并退出
:echo   # 内置计算器
:help   # 帮助
:help!  # Don't panic!

:tabe <file>  # 新标签页
:e <file>     # 替换当前标签页
:tabo         # 关闭其他标签页
:wqa          # 保存并关闭所有标签页

:vs     # 纵向分屏
:sv     # 横向分屏

:reg    # 查看剪贴板
```

## 查找与替换

```
/pattern                # 查找
:s/pattern/after/gc     # 替换 (substitude)
:g/pattern              # 行过滤 (grep)
:v/pattern              # 反向行过滤, 筛选出未与 pattern 匹配的行
```

其中 pattern 是指 vim 正则表达式. 区别于一般的正则表达式, 括号、加号等特殊字符需要用反斜杠转义. 参见 `:help magic`

```
:grep! [-R] pattern filepath # vim 内置的 grep 查找.
:copen                       # 执行 grep! 后, 打开 quickfix 窗口
```

## 变量

查看当前所有变量
```
:set
```

bool 型变量
```
:set <变量名>   # 设置变量为 true, 如开启行号 :set nu
:set no<变量名> # 设置变量为 false, 如关闭行号 :set nonu
```

其它变量
```
:set <变量名>       # 查看变量的值, 如查看键盘映射 :set keymap
:set <变量名>=<值>  # 设置变量, 如设置键盘映射为日语 :set keymap=kana
:set <变量名>=      # 清空变量, 如还原键盘映射 :set keymap=
```

常用变量

|变量名|含义|取值|
|------|----|----|
|fileencoding|编码|utf-8, gbk 等|
|fileformat|行结束符|unix, dos 等|
|keymap|键盘映射|kana, russian-yawerty 等|
|expandtab|是否把 tab 转化为空格|bool|
|ic,ignorecase|搜索时是否忽略大小写|bool|

## vimrc

vimrc 是 vim 的主配置文件, 位于 `~/.vim/vimrc` 或者 `~/.vimrc`.
在 vim 启动时, 会自动执行 vimrc 中的脚本.

## 应用

```
$ vimtutor          # 自带教程
$ vimdiff           # 比较文件, 但默认颜色很糟糕. 也可以用 vscode: $ code --diff a.txt b.txt
$ vim <directory>   # 打开文件夹
$ vim file.zip      # 打开 zip 压缩包
```

文件加密
```
:X          # 加密文件, vim 会要求你输入两次密码
:set key=   # 解除加密
```
