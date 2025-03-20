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

**fgets**: 读取一行最多 N-1 个字符, 并附加 `\0`. 如果没有遇到 EOF, buf 将会包含换行符 `\n`.
这个函数限制了字符数, 因此它相比 `scanf("%s", buf)` 更安全.
```c
char buf[N];
fgets(buf, sizeof buf, stdin);
```

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
    $ objdump -d test # 反汇编

## DLL 库

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
