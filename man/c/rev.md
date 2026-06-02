# 逆向

教程
- [Nightmare](https://guyinatuxedo.github.io/) is an intro to binary exploitation / reverse engineering course based around ctf challenges.

工具
- c: x64dbg, ida pro, hexray
- dotnet: ILspy, Detect It Easy, dnSpy, x64dbgde4dot
- flash: FFDec
- 命令行: xxd (小兄弟)

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

