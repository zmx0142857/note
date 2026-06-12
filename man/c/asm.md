# x86 汇编语言

## AT&T 语法

### quick start

下面这个程序的作用是返回一个数字 42:

`main.s`
```asm
.section .text      # 代码段 .text
    .global _start  # 程序入口声明
_start:             # 程序入口
    movl $1, %eax   # 将立即数 1 移动到寄存器 eax
    movl $42, %ebx  # 将立即数 42 移动到寄存器 ebx
    int $0x80       # 呼叫系统调用 (syscall)
```

> 确保在 x86 平台的 linux 上运行上面的汇编程序. 在 WSL1 中它会段错误, WSL2 正常

在 x86 平台的 linux 上编译运行:

    $ as main.s -o main.o   # 汇编
    $ ld main.o -o main     # 链接
    $ ./main
    $ echo $?
    42

可以用这个 shell 函数简化编译命令:
```sh
function s () {
  as "$1.s" -o "$1.o" && ld "$1.o" -o "$1"
}
```
输入 `s main && ./main` 编译运行.

## Intel 语法

与 AT&T 相比, intel 语法作出许多简化:
- 立即数无需 `$` 前缀, 寄存器无需 `%` 前缀, `section` 和 `global` 关键字无需 `.` 前缀.
- 用一个 `mov` 指令取代了 `mov` 和 `movl` 的工作
- 还有一个重要区别是, `mov` 的参数从 `mov value, reg` 变成了 `mov reg, value`

### quick start

`main.asm`
```asm
section .data
    msg db 'Hello, world!', 0xa ; 0xa is new line
    len equ $-msg               ; length of msg

section .text
    global _start               ; declare entry point

_start:                         ; entry point
    mov eax, 4                  ; system call number (sys_write)
    mov ebx, 1                  ; file descriptor (stdout)
    mov ecx, msg                ; message to write
    mov edx, len                ; message length
    int 0x80                    ; call kernel

    mov eax, 1                  ; system call number (sys_exit)
    mov ebx, 0                  ; return value
    int 0x80                    ; call kernel
```

在 x86 平台的 linux 上安装 nasm, 然后

    $ nasm -f elf64 main.asm    # 汇编
    $ ld main.o -o main         # 链接


用这个 shell 函数简化编译:
```sh
function asm () {
  nasm -f elf64 "$1.asm" && ld "$1.o" -o "$1"
}

function asm32 () {
  nasm -f elf "$1.asm" && ld -m elf_i386 -s "$1.o" -o "$1"
}
```
现在用 `asm main && ./main` 即可编译运行.

### 寄存器

- instrution 指令寄存器: rip (64 位), eip (32 位)
- stack 栈顶寄存器: rsp (64 位), esp (32 位)
- base 栈底寄存器: rbp (64 位), ebp (32 位)
- 其它: 通用寄存器. r 开头的为 8 字节, 适合 x64 程序; e 开头的为 4 字节, 适合 x86 (32 位) 程序.

### 指令

- 方括号: 表示解引用, 例如 `DWORD PTR [eax]` 相当于把 eax 当作地址解引用, 得到一个 4 字节整数 (dword)
- lea: 用于运算赋值, 例如 `lea ecx,[esp+0x4]` 的作用相当于 `ecx = esp + 0x4`. 这里的方括号与指针没什么关系
- call: 用于调用函数, 会将 rip (下一条指令的地址) 压栈. 换言之, 函数开始执行时, esp 指向返回地址
- ret: 用于函数返回, 会将返回地址弹栈, 赋值给 rip, 从而恢复执行

### 函数调用

典型函数调用, 是用若干个 push 指令将参数压栈, 然后执行 call 指令:
```asm
push 参数3
push 参数2
push 参数1
call 函数地址
```
由于栈是向下增长的, 栈顶 esp 的地址小于栈底 ebp 地址, 所以参数在内存中像这样:
```txt
    ┌─┬─┬─┐
esp │1│2│3│ ebp
    └─┴─┴─┘
```
> 64 位 linux 系统的重要变化是, 函数的前 6 个参数分别通过寄存器 rdi, rsi, rdx, rcx, r8, r9 传递, 超过 6 个参数才需要压栈.

典型函数序言, 保存旧栈帧, 分配新栈帧
```asm
push ebp
mov ebp,esp
sub esp,... ; 分配栈空间, 用于局部变量
```
效果如下:
```txt
 ebp
  ↓
 ┌─┬─┐...┌─┬─┐
 └─┴─┘   └─┴─┘
  ↑ ↑       ↑
esp esp    ebp
   (old)  (old)
```
leave 指令常见于函数结尾, 它相当于以下两条指令, 是函数序言的逆操作:
```asm
mov esp,ebp
pop ebp
```

### 典型 main 函数

`main.c`
```c
#include <stdio.h>
int main() {
  puts("hello");
  return 0;
}
```

在 64 位 linux 系统中, 编译然后反编译该程序

    $ gcc main.c -o main
    $ objdump -D -M intel > main.asm

或者用这个 shell 函数简化反编译:
```sh
function rev () {
  objdump -D -M intel "$1" > "$1.asm"
}
```

64 位程序
```asm
<main>:
    ; 函数序言
    push   rbp
    mov    rbp,rsp

    ; 将参数 "hello" 的地址放进 rdi, 然后调用 puts
    lea    rax,[rip+0xec0]        # 0x2004 <_IO_stdin_used+0x4>
    mov    rdi,rax
    call   0x1030 <puts@plt>

    mov    eax,0x0 ; 将返回值放进 eax (32 位整数)
    pop    rbp     ; 恢复 rbp
    ret

<_IO_stdin_used>:
    2000:	01 00                	add    DWORD PTR [rax],eax
    2002:	02 00                	add    al,BYTE PTR [rax]
    2004:	68 65 6c 6c 6f          "hello"
```

为了生成 32 位程序, 首先安装相关 32 位库:

    $ sudo apt install gcc-multilib g++-multilib
    $ sudo dpkg --add-architecture i386
    $ gcc main.c -o main -m32 # 现在可以生成 32 位程序

生成的 32 位程序会更冗长:
```asm
lea ecx,[esp+0x4]           ; ecx = esp + 4
and esp,0xfffffff0          ; 将 esp 对齐到 16 字节 (栈对齐)
push DWORD PTR [ecx-0x4]    ; 保存旧 esp 指向的值, 即返回地址

; 函数序言
push ebp
mov ebp,esp

push ecx                    ; 保存 ecx 到 ebp-4 的地址

; 分配栈空间
sub esp,0x4
sub esp,0xc

; 参数压栈并调用函数
push 0x80484b0              ; "hello"
call 0x80482d0 <puts@plt>

; 减小栈空间
add esp,0x10
mov eax,0x0

mov ecx,DWORD PTR [ebp-0x4] ; 恢复 ecx 的值

; 序言的逆操作: mov esp,ebp; pop ebp
leave

lea esp,[ecx-0x4]           ; 恢复旧的 esp, 它等于 ecx-4
ret
```
