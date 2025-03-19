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

> 确保在 x86 平台的 linux 上运行上面的汇编程序. 在 WSL 中它会段错误.

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
