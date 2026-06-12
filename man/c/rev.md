# 逆向

教程
- [Nightmare](https://guyinatuxedo.github.io/) is an intro to binary exploitation / reverse engineering course based around ctf challenges.
- [CTF-Workshop](https://github.com/kablaa/CTF-Workshop)
- [mohamedaymenkarmous/CTF](https://github.com/mohamedaymenkarmous/CTF)

工具
- ctf: [ghidra](https://github.com/NationalSecurityAgency/ghidra), [gdb-gef](https://github.com/hugsy/gef), pwn,
- c: x64dbg, ida pro, hexray
- dotnet: ILspy, Detect It Easy, dnSpy, x64dbgde4dot
- flash: FFDec

命令行工具:
- xxd (小兄弟)
- file: 分析文件类型
- strings: 寻找二进制文件中的 ascii 字符串

## windows: x64dbg

https://blog.csdn.net/qq_18497293/article/details/111246369

### 案例: 修改字符串

在 windows 上安装 [scoop](https://scoop.sh/), gcc 和 x64dbg:
```shell
$ scoop install gcc
$ scoop bucket add extras
$ scoop install x64dbg
```

`main.c`
```cpp
#include <stdio.h>
int main() {
  printf("Hello world\n");
  return 0;
}
```

```shell
$ gcc main.c -o main.exe
```

- 用 x64dbg 打开 main.exe, 点击 `=>` 运行程序
- 在汇编窗口右键搜索字符串 (shift-d) "Hello world", 双击搜索结果转到代码中的位置
- 得到该字符串的地址, 例如 `ds[00007FF7360E9000]`, 在内存窗口右键转到 -> 表达式 (ctrl-g) -> 粘贴这个地址
- 在内存窗口用鼠标双击 ascii 编辑文字, 把 world 改为 pojie
- 右键汇编窗口, 选择补丁 -> 修补文件 (ctrl-p), 保存文件为 `main.mod.exe`
- 运行补丁程序, 得到 `Hello pojie`.

### 案例: 分支语句

`main.c`
```cpp
#include <stdio.h>
int main() {
  int flag = 0;
  if (flag) {
    printf("Hello pojie\n");
  } else {
    printf("Hello world\n");
  }
  return 0;
}
```

在 x64dbg 中搜索字符串 `Hello` 后, 跳转到下面的汇编:

```
...
00007FF64314159E | C745 FC 00000000         | mov dword ptr ss:[rbp-4],0              |
00007FF6431415A5 | 837D FC 00               | cmp dword ptr ss:[rbp-4],0              | 将当前值与 0 比较
00007FF6431415A9 | 74 11                    | je main.7FF6431415BC                    | 相等时跳转到 BC
00007FF6431415AB | 48:8D05 4E7A0000         | lea rax,qword ptr ds:[7FF643149000]     | lea, mov, call 三个语句完成了打印操作. ds:[00007FF643149000]:"Hello pojie\n"
00007FF6431415B2 | 48:89C1                  | mov rcx,rax                             |
00007FF6431415B5 | E8 86FFFFFF              | call main.7FF643141540                  |
00007FF6431415BA | EB 0F                    | jmp main.7FF6431415CB                   | 跳转到 CB
00007FF6431415BC | 48:8D05 4A7A0000         | lea rax,qword ptr ds:[7FF64314900D]     | BC: ds:[00007FF64314900D]:"Hello world\n"
00007FF6431415C3 | 48:89C1                  | mov rcx,rax                             |
00007FF6431415C6 | E8 75FFFFFF              | call main.7FF643141540                  |
00007FF6431415CB | B8 00000000              | mov eax,0                               | CB: if 语句结束
...
```

选中 `mov dword ptr ss:[rbp-4],0` 这行代码, 右键选择汇编 (space) 打开编辑窗口, 将 0 换成 1.
还有其它几种改法, 比如把 je 换成 jne 或者 nop 等等.

## linux: objdump + vim

https://blog.csdn.net/leibris/article/details/120235595

在 linux 上:

`main.c`
```cpp
#include <stdio.h>
int main() {
  int condition = 0;
  if (condition == 1) {
    printf("success\n");
  } else {
    printf("fail\n");
  }
  return 0;
}
```

```
$ gcc -g main.c -o main
$ ./main
fail
$ objdump main -S > main.s
```

> 如果想要 intel 语法的汇编, 可以使用命令 `objdump -D main -M intel > main.asm`

打开 `main.s`, 找到如下内容:
```
int condition = 0;
    1155:       c7 45 fc 00 00 00 00    movl   $0x0,-0x4(%rbp)
```

用 vim 打开二进制程序 `main`:
```
$ vim -d main
:%!xxd
```
将 `c7 45 fc 00 00 00 00`
替换为 `c7 45 fc 01 00 00 00`
```
:%!xxd -r
:wq!
$ ./main
success
```

> 在 C 程序中嵌入汇编 `asm("nop");`, 可知 `nop` 指令的机器码为 `0x90`

## 工具介绍

### gdb

在 linux 安装 gdb 和 [gdb-gef](https://github.com/hugsy/gef)

- 直接回车: 重复上一条命令
- `disass main`: 查看汇编
- `b main`: 在 main 函数打断点
- `b *main+15`: 在 main 函数 15 个字节后打断点
- `i b`: info break, 查看断点
- `i r`: info registers, 查看寄存器
- `i frame`: 查看当前运行状态
- `d 1`: delete, 删除 1 号断点
- `r`: run, 运行
- `ni`: next instruction, 下一条指令
- `si`: step instruction, 下一条指令, 进入函数内部
- `x/s 0x80484b0`: 以字符串形式查看内存 x080484b0. 此外还有地址 `x/a`, 字符 `x/10c`, 指令 `x/i`
- `set`: 修改内存, 例如 `set {char [12]} 0x080484b0 = "hello venus"`
- `p 0x80484b0`: 定义变量
- `j *0x8048451`: 指令跳转
- `pattern create 100 "pattern.txt"`: 创建一个文件, 包含 100 个字符
- `search-pattern abcd`: 在内存中查找 abcd

### pwn

python library for IO, making pipes to remote site or process

    $ pip install pwn

例如, 有一个出题程序, 依次输出 16 进制数, 要求输入对应的 10 进制数, 可以用下面的程序来解题:

`solution.py`
```py
import pwn

p = pwn.process('./question') # 或者 pwn.remote() 连接到远程服务

while True:
    try:
        line = p.recvline().decode()
    except EOFError:
        break
    print('[recv]', line)
    arr = line.split()
    if len(arr) > 2:
        num = arr[2]
        print('[send]', int(num, 16))
        p.sendline(str(int(num, 16)).encode())
```

还有一个同名的命令行工具叫 pwn:

    $ sudo apt install python3-pwntools
    $ pwn checksec ./program # 检查程序的安全性

### socket

netcat 将 tcp 服务转换为交互式命令行程序

    $ nc <host> <port>

socat 将交互式命令行程序转换为 tcp 连接

    $ sudo apt install socat
    $ socat -v tcp-l:1234,fork exec:./program

## CTF 技巧

- BOF: buffer overflow, 通过缓冲区溢出修改栈上的内容
- ROP: return oriented programming, 通过修改返回地址改变程序的执行流程, 通常结合 BOF 使用
- Heap Exploitation

## FAQS

- 问题: 运行 elf 文件失败: cannot execute: required file not found
- 原因: 使用 file 命令检查:
  ```sh
  $ file hello_world
  hello_world: ELF 32-bit LSB executable, Intel i386, version 1 (SYSV),
  dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, 
  $ ls /lib/ld-linux.so.2
  ls: cannot access '/lib/ld-linux.so.2': No such file or directory
  ```
  原因是 64 位系统缺少 32 位动态链接器
- 解决: `sudo apt install libc6:i386`.
  如果遇到依赖冲突, 先安装 aptitude, 再运行 `sudo aptitude install libc6:i386`.
  aptitude 会为你列出多个方案, 按 Y 或 n 进行选择.
