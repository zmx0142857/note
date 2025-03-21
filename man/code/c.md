# C 语言

- [linux c 编程一站式学习](https://micfan.github.io/linux-c-one-stop/)
- [c 语言标准库 | cpp reference](https://en.cppreference.com/w/c)

## 标准库

**getchar**: 读取一个字符. 其实它的返回类型是 `int` 而不是 `char`, 因此可以用来判断 EOF (end of file, 文件结束符).
> 在 windows 上输入 EOF 的方法是 `ctrl-z` `enter`, linux 则是 `ctrl-d`.
```c
int ch;
while ((ch = getchar()) != EOF) {
    putchar(ch);
}
```

**scanf**: 返回成功读取的变量数目. 下面的代码连续读取输入, 读到 EOF 时退出循环.
```c
int a, b;
while (scanf("%d %d", &a, &b) == 2) {
    printf("%d\n", a + b);
}
```

**fgets**: 读取一行最多 n-1 个字符, 并附加 `\0`. 如果没有遇到 EOF, buf 将会包含换行符 `\n`.
这个函数限制了字符数, 因此它相比 `scanf("%s", buf)` 更安全.
```c
char buf[N];
fgets(buf, sizeof buf, stdin);
```

**strncpy**: 将 `src` 开始的最多 n 个字符拷贝到 `dest`. 注意 `src` 和 `dest` 的内存空间不能重叠.
警告: 如果 `src` 的前 n 个字符不包含 `\0`, 则 `dest` 将不会以 `\0` 结束.
这个函数还有一个危险的版本 `strcpy`, 后者完全不考虑数组溢出问题.
```c
char dest[N];
const char *str = "hello";
size_t len = sizeof dest;
strncpy(dest, str, len);
dest[len-1] = '\0';
```

**malloc**: 申请 n 字节的内存空间, 出错返回 NULL.

**free**: 释放内存, 将它归还给 malloc.
```c
int *arr = malloc(n * sizeof(int));
if (arr == NULL) {
  puts("out of memory");
} else {
  // ...
  free(arr);
  arr = NULL;
}
```

## 多文件编译

**全局定义唯一原则**: 全局变量、函数在所有 `.c` 文件中只能定义一次.
- **全局与局部**: 函数、变量 (文件作用域) 的声明及定义, 默认都是全局的. 在前面加上 `static` 可以将它变为文件局部的.
- **声明与定义**: 对于函数, 有函数体的就是定义, 否则为声明; 对于变量 (文件作用域), 如果有赋初值, 则必为定义, 其它情况见下表:
  ||变量 (文件作用域)|函数|
  |-|-|-|
  |全局声明|`extern int top`|`extern void init()`<br>`void init()`|
  |全局定义|`extern int top = 0` [注1]<br>`int top = 0`<br>`int top` [注2]|`extern void init(){}`<br>`void init(){}`|
  |局部声明| - |`static void init()`|
  |局部定义|`static int top = 0`<br>`static int top` [注2]|`static void init(){}`|

  - [注1] gcc 会报警告, 不推荐这种写法.
  - [注2] 这两条其实是试探性定义, 它们可以多次出现, 只要不与现有定义矛盾. 但不推荐这种写法, 建议养成给变量赋初值的好习惯.
- **头文件**: 如果头文件被不同的 `.c` 文件包含, 则这个头文件不能包含全局定义, 否则这两个 `.c` 文件不能链接到一起.

`stack.h`
```c
#ifndef STACK_H
#define STACK_H

// 全局变量声明
extern char stack[512];
extern int top;

// 局部函数定义
static void push(char c) {
    stack[top++] = c;
}

static char pop() {
    return stack[--top];
}

static int is_empty() {
    return top == 0;
}

#endif
```

`init.c`
```c
#include "stack.h"

// 全局变量只能定义一次
char stack[512] = {};
int top = 0;

void init() {
    push('a');
    push('b');
    push('c');
}
```

`main.c`
```c
#include <stdio.h>
#include "stack.h"

// 全局函数声明
extern void init();

int main() {
    init();
    while (!is_empty()) {
        putchar(pop());
    }
    putchar('\n');
    return 0;
}
```

    $ gcc -c main.c init.c
    $ gcc main.o init.o -o main

## x86 汇编 (AT&T 语法)

`test.s`
```asm
.section .data
.section .text
    .global _start
_start:
    movl $1, %eax   # 1 表示退出程序
    movl $42, %ebx  # 返回码
    int $0x80       # 执行系统调用, 退出程序
```

> 确保在 linux 上运行. 这个程序在 windows/wsl 会产生 segentation fault

    $ as test.s -o test.o
    $ ld test.o -o test

## 编译过程

    $ gcc -E test.c | less      # 宏展开
    $ gcc -S test.c -o test.s   # 生成汇编代码
    $ gcc -c test.c -o test.o   # 生成目标文件
    $ gcc -v test.c -o test     # 显示详细编译过程

    $ readelf -a test # 查看 elf 文件
    $ readelf -s test # 查看符号表 (也可以用 nm 命令)
    $ readelf -h test # 查看 elf 文件头
    $ readelf -l test # 查看 program header (segment header)
    $ readelf -S test # 查看 section header

    $ xxd test        # 二进制查看器

    $ gcc -g test.c -o test # 编译时带上调试信息
    $ objdump -dS test      # 反汇编, -S 表示显示源码

## 编译库

### linux 静态库 .a

    $ ar rs libtest.a test.o
    $ gcc main.c -L. -ltest -o main

- `-L.`: 在当前目录寻找库文件
- `-ltest`: 链接 `libtest` 库
- `gcc -print-search-dirs`: 编译器搜索路径

### linux 动态库 (共享库) .so

    $ gcc -c -fPIC test.c
    $ gcc -shared test.o -o libtest.so
    $ gcc main.c -L. -ltest -o main
    $ ldd main # 查看可执行文件依赖于哪些共享库

- `-fPIC`: 生成位置无关代码 (position independent code)
- `-ltest`: 链接 `libtest` 库. `libtest.so` 的优先级高于 `libtest.a`

### windows DLL 库

`add.c`
```c
#include <stdio.h>

__declspec(dllexport)
int add(int a, int b) {
    return a + b;
}
```

`main.c`
```c
#include <stdio.h>
#include <windows.h>

typedef int (*AddFn)(int, int);

int main() {
    HMODULE module = LoadLibrary("add.dll");
    if (module != NULL) {
        AddFn add = (AddFn)GetProcAddress(module, "add");
        printf("%d\n", add(1, 2));
    }
    return 0;
}
```

使用 mingw 编译

    $ gcc -shared -o add.dll add.c

或使用 msvc 编译 (位于 visual-studio-2022/VC/Tools/MSVC/14.38.33130/bin/Hostx64/x64)

    $ cl -c add.c
    $ link -dll add.obj

查看 dll 导出函数

    $ dumpbin -exports add.dll

运行主函数

    $ gcc main.c
    $ ./a.exe

## 案例

用位运算实现加法
```c
int add(int a, int b) {
    int sum = a ^ b;
    int carry = (a & b) << 1;
    return carry ? add(sum, carry) : sum;
}
```

用异或交换两个变量的值
```c
a ^= b; // a <- a0 ^ b0
b ^= a; // b <- b0 ^ (a0 ^ b0) == a0
a ^= b; // a <- (a0 ^ b0) ^ b0 == b0
```

