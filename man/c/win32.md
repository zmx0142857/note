# Win32 编程

- [api docs](https://learn.microsoft.com/zh-cn/windows/win32/api/winuser/)
- [bilibili 达内教育](https://www.bilibili.com/video/BV1Qb4y1o7u9)

## 快速开始

### hello

`hello.c`
```c
#include <Windows.h>

/**
 * win32 程序入口函数
 * @param hIns 当前进程的句柄. 句柄是一个整数, 可以获取到当前进程的相关信息
 * @param hPrev 上一个进程的句柄, 已废弃
 * @param lpCmdLine 命令行参数
 * @param nCmdShow 窗口显示方式
 */
int WINAPI WinMain(HINSTANCE hIns, HINSTANCE hPrev, LPSTR lpCmdLine, int nCmdShow) {
    MessageBox(NULL, "Hello World", "Title 标题", MB_OK|MB_ICONINFORMATION);
    return 0;
}
```

- 头文件 Windows.h 包含了 windows 系统提供的一千多个 API, 借此可以编写 windows 平台的程序
- 其中 win32 的 3 个核心库是: user32.lib (用户界面), kernel32.lib (内核), gdi32.lib (绘图)
- 宏定义 `WINAPI` 与 `CALLBACK` 等价, 都等价于 `__stdcall`, 表示参数从右到左传递
- 代码建议保存为 utf-8 with bom 编码. 代码为 utf-8 编码时, 需指定编译选项 `cl -utf-8`

使用 Visual Studio 编译: `F5` (debug), `Ctrl+F5` (release)

使用 Visual Studio 提供的编译器 cl.exe 与链接器 link.exe 编译:

    cmd> path to visual studio\Common7\Tools\VsDevCmd.bat :: 设置环境变量
    cmd> where cl                               :: 查看编译器所在目录
    cmd> echo %INCLUDE%                         :: 查看 INCLUDE 路径
    cmd> cl hello.c -c                          :: 编译
    cmd> link hello.obj user32.lib              :: 链接

使用 gcc 编译:

    $ gcc main.c -o main -mwindows -fexec-charset=gbk
    $ # 未加 -mwindows 导致链接错误: undefined reference to `GetStockObject@4'
    $ # 未加 -fexec-charset=gbk 导致中文乱码

### 宽字节

在 windows 中常用 utf16 编码, 即不论中英文字符都使用 2 个字节.

```c
#include <Windows.h>

int main() {
    const wchar_t* wstr = L"宽字符: hello world\n";
    HANDLE hOut = GetStdHandle(STD_OUTPUT_HANDLE);
    WriteConsole(hOut, wstr, wcslen(wstr), NULL, NULL);
    return 0;
}
```

`TCHAR` 类型可能是 `wchar_t`, 也可能是 `char`, 取决于是否定义了 `UNICODE` 宏:

| |ifdef UNICODE|else|
|-|-|-|
|TCHAR|wchar\_t|char|
|LPTSTR|wchar\_t \*|char \*|
|LPCTSTR|const wchar\_t \*|const char \*|
|TEXT("hello")|L"hello"|"hello"|

visual studio 中, 【项目属性-高级-字符集】的设定有两个选项, 其中 "Unicode" 就对应着 `#define UNICODE`,
而 "多字节" 不会 `#define UNICODE`.

### 第一个窗口

一个 Win32 窗口程序包括：
- 入口：WinMain 函数
- 一个窗口: 包含注册、创建、显示三步骤
- 消息循环: 窗口程序需要响应键盘和鼠标事件, 它是事件驱动的
- 消息处理函数: 专门处理消息的回调函数

`window.c`
```c
#include <Windows.h>

HWND hMain;

// 消息处理函数
LRESULT WINAPI WndProc(HWND hWnd, UINT msgID, WPARAM wParam, LPARAM lParam) {
    switch (msgID) {
    case WM_DESTROY: // 窗口销毁时
        if (hWnd == hMain) PostQuitMessage(0); // 让 GetMessage 返回 0 从而退出程序
        break;
    }
    return DefWindowProc(hWnd, msgID, wParam, lParam);
}

// 注册窗口
void Register(HINSTANCE hIns, LPCSTR wndClassName, WNDPROC WndProc) {
    WNDCLASS wc = { 0 };
    wc.cbClsExtra = 0; // 窗口类缓冲区大小
    wc.cbWndExtra = 0; // 窗口实例缓冲区大小
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1); // 白色. +3 为黑色
    wc.hCursor = NULL; // 默认光标
    wc.hIcon = NULL; // 默认图标
    wc.hInstance = hIns; // 程序实例句柄
    wc.lpfnWndProc = WndProc; // 消息处理函数
    wc.lpszClassName = wndClassName; // 类名
    wc.lpszMenuName = NULL; // 无菜单
    wc.style = CS_HREDRAW | CS_VREDRAW; // 水平或垂直大小改变时，重绘窗口
    RegisterClass(&wc); // 注册窗口
}

// 消息循环
void MessageLoop() {
    MSG nMsg = { 0 };
    // GetMessage 参数: 消息指针, 窗口句柄, 最小消息ID, 最大消息ID (都填0表示不限消息ID范围)
    // 当且仅当抓到 WM_QUIT 消息时, GetMessage 返回 0
    while (GetMessage(&nMsg, NULL, 0, 0)) {
        TranslateMessage(&nMsg); // 翻译键盘消息
        DispatchMessage(&nMsg); // 把消息派发给处理函数 WndProc
    }
}

int WINAPI WinMain(HINSTANCE hIns, HINSTANCE hPrev, LPSTR lpCmdLine, int nCmdShow) {
    LPCSTR wndClassName = "Main";

    // 注册窗口
    Register(hIns, wndClassName, WndProc);

    // 创建窗口 (但还没有显示)
    hMain = CreateWindow(
        wndClassName, // 类名 (需先注册)
        "Title 标题", // 标题
        WS_OVERLAPPEDWINDOW, // 风格
        100, 100, 550, 400, // x, y, w, h
        NULL, NULL, hIns, NULL // 父窗口句柄, 菜单, 当前进程句柄, 额外参数
    );

    CreateWindow(
        wndClassName,
        "子窗口1",
        WS_OVERLAPPEDWINDOW | WS_CHILD | WS_VISIBLE,
        0, 0, 200, 200,
        hMain, NULL, hIns, NULL
    );

    CreateWindow(
        wndClassName,
        "子窗口2",
        WS_OVERLAPPEDWINDOW | WS_CHILD | WS_VISIBLE,
        200, 0, 200, 200,
        hMain, NULL, hIns, NULL
    );

    ShowWindow(hMain, SW_SHOW); // 显示窗口. SW_SHOW 表示原样显示
    UpdateWindow(hMain); // 更新窗口
    MessageLoop(); // 消息循环
    return 0;
}
```

    cmd> cl window.c -c

### 设置图标

`window.rc`
```
100 ICON window.ico
```

准备一个图标文件 window.ico 放在同一目录, 使用 `rc.exe` 打包资源

    cmd> rc window.rc

最后链接在一起:

    cmd> link window.res window.obj user32.lib

> 可以使用 `7z x a.exe` 解包程序来获得图标文件

### 调试日志

```c
#define Log(format, ...) do {\
    char buf[256];\
    sprintf_s(buf, 256, format, __VA_ARGS__);\
    LogStr(buf);\
} while (0)

void LogStr(LPCSTR str) {
    static HANDLE hOut = 0;
    if (!hOut) {
        AllocConsole(); // 这一行也可以直接放在 WinMain 的开头
        hOut = GetStdHandle(STD_OUTPUT_HANDLE);
    }
    WriteConsole(hOut, str, strlen(str), NULL, NULL);
}
```

## 窗口与消息

### 注册与创建窗口

窗口类分为 3 种.
- 系统窗口类: 由系统注册;
- 全局窗口类: 由程序员注册, 在所有模块可用 (一个 dll 就是一个模块);
- 局部窗口类: 由程序员注册, 只在当前模块可用.
试试看: 把 wndClassName 换成系统窗口类 Button 或者 Edit，注释掉注册窗口的代码再运行.

默认情况下, 注册的窗口类是局部窗口类, 这也是推荐的选项.
如果非要注册一个全局窗口类, 可以指定 `wc.style = CS_GLOBALCLASS` (不推荐这么做).

创建窗口时, 除了 `CreateWindow`, 还可以使用加强版的 `CreateWindowEx`, 它多了第一个参数 `DWORD dwExStyle`, 表示窗口的额外风格.

`CreateWindow` 的执行过程:
- 先在当前进程注册的局部窗口类中匹配 `wndClassName` 和 `hIns`.
- 如果没找到, 再到全局窗口类中匹配 `wndClassName`.
- 如果还是没找到, 就到系统窗口类中匹配 `wndClassName`.

创建子窗口:
- 设置样式 `WS_CHILD | WS_VISIBLE`
- 设置父窗口句柄

常见窗口样式:
- `WS_BORDER`: 有边框
- `WS_VISIBLE`: 无需调用 ShowWindow, 直接显示窗口

### 消息处理

系统消息的 ID 范围是 0 ~ 0x03FF, 用户自定义消息的范围是 0x0400 ~ 0x7FFF.
```c
#define WM_USER 0x0400
```

常见系统消息类型 (msgID):
- `WM_CREATE`: 窗口创建但未显示. 指针 `(CREATESTRUCT*) lParam` 指向 `CreateWindow` 的参数. 此消息触发时间早于消息循环.
- `WM_DESTROY`: 窗口销毁
- `WM_QUIT`: 手动调用 `PostQuitMessage(wParam)` 时产生此消息, 用于结束消息循环 (让 GetMessage 返回 0)
- `WM_CLOSE`: 点击右上角关闭按钮
- `WM_SYSCOMMAND`: 点击右上角按钮 (最小化、最大化、关闭). `wParam` 分别对应 `SC_MINIMIZE`, `SC_MAXIMIZE`, `SC_CLOSE`
- `WM_SIZE`: 窗口大小变化. 宽高分别为 `LOWORD(lParam)` 和 `HIWORD(lParam)`
- `WM_PAINT`: 绘图消息, 产生时间是当窗口需要绘制, 且当前没有其他消息要处理时
- `WM_TIMER`: 定时器, 产生时间是当规定的时间已到, 且当前没有其他消息 (包括绘图消息) 要处理时.
  消息处理的优先级是其他消息 > 绘图消息 > 定时器.
  附带信息: `wParam`: 定时器ID, `lParam`: 定时器处理函数的指针

键盘消息
- `WM_KEYDOWN`, `WM_KEYUP`, `WM_SYSKEYDOWN`, `WM_SYSKEYUP`: 键盘按下/抬起. `wParam` 保存具体键码值.
  `SYSKEY` 是一些功能键, 如 `ALT`, `F10` 等. 大写 `A` 和小写 `a` 的 `wParam` 都是 `65`,
  需要通过 `WM_CHAR` 区分.
- `WM_CHAR`: 字符消息. TranslateMessage 将键盘可见字符翻译为 ascii 码, 保存于 `wParam`

鼠标消息
- `WM_LBUTTONDOWN`, `WM_LBUTTONUP`, `WM_RBUTTONDOWN`, `WM_RBUTTONUP`: 按下/抬起鼠标按键.
  其中客户区 x, y 坐标分别为 `LOWORD(lParam)` 和 `HIWORD(lParam)`.  `wParam` 保存其他按键状态, 如
  左键=1, 右键=2, shift=4, ctrl=8
- `WM_MOUSEMOVE`: 鼠标移动. `wParam`, `lParam` 的含义同上
- `WM_LBUTTONDBLCLK`, `WM_RBUTTONDBLCLK`: 双击. 需要配合窗口类样式 `wc.style = CS_DBLCLKS` 使用.
  `wParam`, `lParam` 含义同上. 消息产生顺序为 DOWN, UP, DBLCLK, UP.
- `WM_MOUSEWHEEL`: 鼠标滚轮. `LOWORD(wParam)`
  仍表示其他按键状态, 但 `HIWORD(wParam)` 表示滚轮的偏移量, 正值表示向前滚动.
  `lParam` 仍表示鼠标位置, 但原点不再是窗口客户区的左上角, 而是屏幕左上角.

退出询问
```c
case WM_CLOSE:
    if (hWnd == hMain) {
        int nRet = MessageBox(hWnd, "是否退出", "提示", MB_YESNO);
        if (nRet != IDYES) return 0;
    }
    break;
```

消息队列 (FIFO)
- 系统消息队列: 系统中产生的大多数消息首先进入系统消息队列, 如鼠标、键盘、`WM_TIMER`、`WM_PAINT`、`WM_QUIT` 消息
- 进程消息队列: 每隔一段时间, 操作系统将系统消息队列中的消息转发到进程专属的队列中
- 非队列消息: 不进入队列, 直接调用消息处理函数 WndProc 完成消息处理, 例如 `WM_CREATE`, `WM_SIZE`

接收与发送消息
- GetMessage: 从本进程的消息队列中获取消息. 有消息时返回, 无消息时阻塞. 如果抓到 `WM_QUIT` 消息则返回 0.
- PeekMessage: 检查本进程的消息队列中有无消息. 不阻塞, 直接返回 BOOL 值. 前 4 个参数与 GetMessage 相同, 第 5 个参数通常传 `PM_NOREMOVE`, 表示不要从消息队列中移除消息.
- SendMessage: 发送消息并阻塞, 等待消息处理结果. 消息直接发送给处理函数 WndProc (非队列消息).
- PostMessage: 投递消息后不阻塞, 立刻返回. 消息进入系统消息队列.

### 定时器

**SetTimer**: 创建定时器, 相当于 js 的 setInterval
```c
UINT_PTR SetTimer(
    HWND hWnd, // 窗口句柄. 定时器触发的 WM_TIMER 消息将交给这个窗口处理
    UINT_PTR nIDEvent, // 定时器ID
    UINT nElapse, // 时间间隔
    TIMERPROC lpTimerFunc // 定时器处理函数指针, 一般传 NULL
) // 返回值非零表示成功
```

**KillTimer**: 关闭定时器, 相当于 js 的 clearInterval
```c
BOOL KillTimer(HWND hWnd, UINT_PTR uIDEvent)
```

## 资源

### 菜单资源

在解决方案管理器右键添加资源, 选择菜单. VS 会为我们新增一个 `.rc` 文件和一个 `resource.h` 文件, 并打开可视化编辑器.

在可视化编辑器中, 根据提示输入各级菜单名称, 还可以右键修改菜单项的属性. 你可以修改菜单项的 ID, 起一个容易记忆的名字, 如 `ID_NEW`. VS 会自动在 `resource.h` 中生成相应的宏定义, 如 `#define ID_NEW 40005`.

完成编辑后保存, 在资源视图中可以看到 VS 为菜单分配了一个资源 ID, 叫做 `IDR_MENU1`.

使用菜单的 3 种方式: 首先 `#include "resource.h"`
1. 注册窗口类时指定 `wc.lpszMenuName = (char*)IDR_MENU1`
2. 创建窗口时, CreateWindow 的倒数第 3 个参数可以指定菜单句柄, 该句柄可以通过 LoadMenu 获得:
   ```c
   HMENU LoadMenu(HINSTANCE hIns, LPCTSTR lpMenuName)
   ```
3. 处理主窗口 `WM_CREATE` 消息时, 利用 SetMenu 设置菜单:
   ```c
   BOOL SetMenu(HWND hWnd, HMENU hMenu)
   ```

点击菜单项时, 产生 `WM_COMMAND` 消息, 其中 `LOWORD(wParam)` 表示菜单项ID, `HIWORD(wParam)` 为 0.

### 图标资源

在资源视图中右键添加图标资源, 保存后再通过 LoadIcon 加载:
```c
HICON LoadIcon(HINSTANCE hIns, LPCTSTR lpIconName)
```
然后注册到窗口类中: `wc.hIcon = hIcon`

### 光标资源

在资源视图中右键添加光标资源, 选中【设置热点】工具, 在图片上双击确定热点位置.
保存后再通过 LoadCursor 加载:
```c
HCURSOR LoadCursor(HINSTANCE hIns, LPCTSTR lpCursorName)
```
使用光标的方式有 2 种:
1. 直接注册到窗口类中
2. 在 `WM_SETCURSOR` 消息处理时用 `SetCursor(hCursor)` 设置光标. 该消息在移动鼠标时不断地触发.
   消息参数有:
   - `wParam`: 当前光标句柄;
   - `LOWORD(lParam)`: 光标当前活动区域, 如 HTCLIENT, HTCAPTION 等;
   - `HIWORD(lParam)`: 当前鼠标消息ID

> 用 `SetCursor` 修改光标后记得 `return 0` 退出函数, 否则 `DefWindowProc` 函数将把光标改回默认样式.

### 字符串资源

字符串资源常用于国际化处理. 在资源视图中添加字符串表, 在表中增加字符串, 保存后通过 LoadString 加载:
```c
int LoadString(
    HINSTANCE hIns,
    UINT uID, // 资源ID
    LPTSTR lpBuffer, // 存放字符串的缓冲区
    int nBufferMax, // 缓冲区大小
) // 成功时返回字符串长度, 失败返回 0
```

### 快捷键资源

快捷键常与菜单绑定使用. 在资源视图中添加 Accelerator 表, 然后添加快捷键.
快捷键的 ID 可以和菜单项 ID 相同, 比如都是 `ID_NEW`. 修饰符选择 Ctrl, 键选择 N.
```c
// 加载快捷键表
HACCEL LoadAccelerators(HINSTANCE hIns, LPCTSTR lpTableName)
// 翻译快捷键
int TranslateAccelator(HWND hWnd, HACCEL hAccTable, LPMSG lpMsg) // 如果是快捷键, 返回非零
```
TranslateAccelator 会产生 `WM_COMMAND` 消息, 其中 `LOWORD(wParam)` 是快捷键ID, `HIWORD(wParam)` 是 1,
与菜单项区分.
建议在 TranslateMessage 前面调用:
```c
while (GetMessasge(&nMsg, NULL, 0, 0)) {
    if (!TranslateAccelator(hWnd, hAccel, &nMsg)) {
        TranslateMessage(&nMsg);
        DispatchMessage(&nMsg);
    }
}
```

## 绘图

### 绘图基础

- win32 提供的绘图 api 叫做 GDI (graphics device interface)
- 注意: 绘图代码只能在处理 WM\_PAINT 消息时调用, 以 BeginPaint 调用开始, 以 EndPaint 结束:
  ```c
  void OnPaint(HWND hWnd) {
      PAINTSTRUCT ps = { 0 };
      HDC hdc = BeginPaint(hWnd, &ps);

      // 绘图代码

      EndPaint(hWnd, &ps);
  }
  ```

**InvalidateRect**: 将窗口区域标记为需要重绘
```c
BOOL InvalidateRect(
    HWND hWnd, // 窗口句柄
    CONST RECT* lpRect, // 矩形区域. NULL 表示整个窗口
    BOOL bErase // 是否擦除
)
```

**BeginPaint**: 开始绘图
```c
HDC BeginPaint(
    HWND hWnd,
    LPPAINTSTRUCT lpPaint // 绘图参数
) // 返回绘图设备 (Device Context) 句柄
```
我们不关心绘图参数的具体细节, 它由 win32 内部负责

**EndPaint**: 结束绘图
```c
BOOL EndPaint(HWND hWnd, CONST PAINTSTRUCT *lpPaint)
```

**TextOut**: 绘制文字
```c
BOOL TextOut(HDC hdc, int x, int y, LPCSTR lpString, int len)
```

win32 颜色以 32 位存储 (`typedef DWORD COLORREF`), 从低到高位分别为 RGBA.
这意味着 0xff0000 是蓝色. 为了避免引起反直觉的问题, 建议使用 RGB 宏为颜色赋值:
```c
COLORREF nColor = RGB(0, 0, 255);
BYTE nRed = GetRValue(nColor); // 获取红色分量
```

**SetPixel** 绘制一个像素
```c
COLORREF SetPixel(HDC hdc, int x, int y, COLORREF color) // 返回原来的颜色
```

- 绘制线段: `MoveToEx(hdc, 100, 100, NULL); LineTo(hdc, 300, 300)`
- 绘制矩形: `Rectangle(hdc, left, top, right, bottom)`
- 绘制椭圆: `Ellipse(hdc, left, top, right, bottom)`

### 绘图对象: 画笔与画刷

画笔可以指定线的颜色、粗细、虚实等, 通过画笔句柄 `HPEN` 使用.
```c
HPEN CreatePen(
    int style, // 样式, 如 PS_SOLID, PS_DASH
    int width, // 粗细. 如果样式不是 PS_SOLID, 粗细必须写 1 才能使样式生效
    COLORREF color // 颜色
)
```

用 SelectObject 切换画笔. 画完以后注意释放:
```c
HPEN hPen = CreatePen(PS_SOLID, 3, RGB(255, 0, 0));
HGDIOBJ hOldPen = SelectObject(hdc, hPen); // 返回原来的绘图对象句柄

// 绘图代码

SelectObject(hdc, hOldPen); // 传入原来的绘图对象句柄, 换回我们的画笔
DeleteObject(hPen); // 释放画笔. 注意只能释放不被使用的画笔
```

画刷用于给封闭图形填充颜色或图案, 通过句柄 `HBRUSH` 使用. 和画笔一样, 使用时需要注意画刷的切换与释放.
```c
CreateSolidBrush(color) // 实心画刷
CreateHatchBrush(style, color) // 纹理画刷, 常见的 style 有 HS_CROSS 等
```

系统画笔、画刷无需自己创建, 使用 GetStockObject 获取即可, 而且无需释放.
```c
GetStockObject(NULL_BRUSH); // 透明画刷
```
