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

    cmd> path-to-visual-studio\Common7\Tools\VsDevCmd.bat :: 设置环境变量
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

> 可以使用 `7z x a.exe` 解包程序来获得图标文件, 注意先把 exe 文件复制到单独文件夹再解包, 否则文件会掉一地.

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

### 菜单 Menu

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

### 图标 Icon

在资源视图中右键添加图标资源, 保存后再通过 LoadIcon 加载:
```c
HICON LoadIcon(HINSTANCE hIns, LPCTSTR lpIconName)
```
然后注册到窗口类中: `wc.hIcon = hIcon`

### 光标 Cursor

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

### 字符串 String

字符串资源常用于国际化处理. 在资源视图中添加字符串表, 在表中增加字符串, 保存后通过 LoadString 加载:
```c
int LoadString(
    HINSTANCE hIns,
    UINT uID, // 资源ID
    LPTSTR lpBuffer, // 存放字符串的缓冲区
    int nBufferMax, // 缓冲区大小
) // 成功时返回字符串长度, 失败返回 0
```

### 快捷键 Accelerator

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

### 对话框 Dialog

对话框分为模态对话框、非模态对话框. 当打开模态对话框时函数阻塞, 直到关闭对话框才解除阻塞.
在这期间用户无法和当前进程的其他窗口交互.

对话框的窗口类由系统注册, 消息处理函数由系统定义. 为了使程序员参与到对话框的消息处理中, 可以定义如下回调函数.
```c
INT WINAPI DialogProc(
    HWND hDlg, // 对话框窗口句柄
    UINT uMsg, // 消息ID
    WPARAM wParam,
    LPARAM lParam
); // 返回 FALSE 表示接下来执行系统默认处理逻辑
```

对话框也是一种资源. 首先在资源视图中添加对话框, 然后:

模态对话框
```c
// 打开模态对话框, 阻塞函数
INT_PTR DialogBox(
    HINSTANCE hIns,
    LPCTSTR lpResourceName, // 对话框资源ID
    HWND hWndParent, // 父窗口句柄
    DLGPROC lpDialogProc, // 回调函数
)

// 关闭对话框, 解除 DialogBox 的阻塞, 并指定 DialogBox 的返回值
// 不能用 DestroyWindow 关闭模态对话框, 否则不能解除阻塞
EndDialog(HWND hDlg, INT_PTR nResult);
```

非模态对话框
```c
// 创建非模态对话框但不显示, 也不阻塞. 需要使用 ShowWindow 来显示
// 参数与 DialogBox 完全相同
HWND CreateDialog(
    HINSTANCE hIns,
    LPCTSTR lpResourceName, // 对话框资源ID
    HWND hWndParent, // 父窗口句柄
    DLGPROC lpDialogProc, // 回调函数
) // 返回对话框窗口句柄

DestroyWindow(hDlg); // 不能使用 EndDialog 关闭非模态对话框 (为什么?)
```

模态对话框示例：
```c
INT WINAPI DialogProc(HWND hDlg, UINT msgID, WPARAM wParam, LPARAM lParam) {
    switch (msgID) {
    case WM_CLOSE:
        EndDialog(hDlg, 42);
        break;
    }
    return FALSE;
}

void OnCommand(HWND hWnd, WPARAM wParam) {
    if (LOWORD(wParam) == ID_MODAL) {
        INT_PTR res = DialogBox(hInstance, (char*)IDD_DIALOG1, hWnd, DialogProc);
        char buf[256];
        sprintf_s(buf, 256, "res: %d", res);
        MessageBox(hWnd, buf, "Info", MB_OK);
    }
}

// 消息处理函数
LRESULT WINAPI WndProc(HWND hWnd, UINT msgID, WPARAM wParam, LPARAM lParam) {
    switch (msgID) {
    case WM_DESTROY: // 窗口销毁时
        if (hWnd == hMain) PostQuitMessage(0); // 让 GetMessage 返回 0 从而退出程序
        break;
    case WM_COMMAND:
        OnCommand(hWnd, wParam);
        break;
    }
    return DefWindowProc(hWnd, msgID, wParam, lParam);
}
```

- 对话框特有的消息 `WM_INITDIALOG` 触发时间在对话框创建后, 显示前. 用于取代 `WM_CREATE` 消息

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

### 绘图对象: 位图与文本

绘制位图的步骤: 添加位图资源, 然后
```c
HBITMAP hBmp = LoadBitmap(hIns, (char*)IDB_BITMAP1);
HDC src = CreateCompatibleDC(hdc); // 创建一个内存 DC
HGDIOBJ hOldBmp = SelectObject(src, hBmp); // 在内存中画图

BitBlt(hdc, x, y, w, h, src, src_x, src_y, SRCCOPY); // 将内存图像显示到屏幕上
// StretchBlt(hdc, x, y, w, h, src, src_x, src_y, src_w, src_h, SRCCOPY); // 允许缩放图像

SelectObject(src, hOldBmp); // 取回位图资源
DeleteObject(hBmp);
DeleteDC(src);
```

绘制文本
```c
TextOut(hdc, x, y, str, len); // 简单文字
DrawText(hdc, str, len, &rect, format); // 矩形对齐文字
```

其中 rect 定义如下:
```c
RECT rect;
rect.left = 100;
rect.top = 150;
rect.right = 200;
rect.bottom = 200;
```

可选的 format 有 DT\_LEFT, DT\_RIGHT, DT\_CENTER, DT\_TOP, DT\_BOTTOM,
DT\_VCENTER, DT\_WORDBREAK, DT\_SINGLELINE, DT\_NOCLIP 等.
注意: 指定多行文字 DT\_WORDBREAK 时, 垂直对齐不会生效

- SetTextColor: 文本颜色
- SetBkColor: 文本背景色
- SetBkMode: 背景模式 (OPAQUE/TRANSPARENT)

使用字体

查看字体名称: 双击打开 `C:/Windows/Fonts` 下的字体文件, 在第一行可以看到字体名称.
```
HFONT hFont = CreateFont(
    int height,
    int width,              // 指定为 0 即可, 系统会根据 height 计算字体宽度
    int escapement，        // baseline 倾斜角
    int orientation,        // 字符倾斜角
    int weight,             // 例如 900
    DWORD italic,           // 指定为 1 则为斜体
    DWORD underline,        // 下划线
    DWORD strikeout,        // 删除线
    DWORD charset,          // 字符集, 例如 GB2312_CHARSET
    DWORD outputPrecision,  // 指定为 0 即可
    DWORD clipPrecision,    // 指定为 0 即可
    DWORD quality,          // 指定为 0 即可
    DWORD pitchAndFamily,   // 指定为 0 即可
    LPCTSTR fontFace        // 字体名称
)
HDGIOBJ hOldFont = SelectObject(hdc, hFont);
DrawText 或 TextOut
SelectObject(hdc, hOldFont);
DeleteObject(hFont); // 字体占用内存较大, 切记释放
```

## 库程序

### 静态库 (lib)

特点: 不能运行, 用于链接到其它程序中.

在 VS 创建静态库项目 `lib`, 添加一个 c 文件:

`lib.c`
```c
int my_add(int a, int b) {
    return a + b;
}

int my_sub(int a, int b) {
    return a - b;
}
```
> 如果遇到 `pch.h` 不存在的问题, 可以到项目属性中, 选择 C/C++ → 预编译头 → 不使用预编译头.

右键项目选择生成 (Build).  生成的 `lib.lib` 文件可以在解决方案目录的 `x64/Debug` 目录下找到 (不是项目的 Debug 目录)

为了使用静态库, 在同一解决方案下新建一个 `uselib` 项目, 添加一个 c 文件, 用 pragma 指令给出静态库的路径.

`uselib.c`
```c
#include <stdio.h>
#pragma comment(lib, "../x64/Debug/lib.lib")

int main() {
    int sum = my_add(5, 3);
    int sub = my_sub(5, 3);
    printf("sum: %d, sub: %d\n", sum, sub);
    return 0;
}
```

- 在 C 语言中, 我们可以省略函数声明, 因为这两个函数返回 int.
  如果返回值类型不是 int, 或者是使用 C++, 则声明不可省略.
- 在 C++ 中直接调用 C 语言库会链接失败.  这是因为 C++ 编译器为了支持函数重载会修改函数名,
  例如将 `my_add` 改为 `?my_add@@YAHHH@Z`. 链接器拿着改过的名字, 自然找不到库中的 `my_add` 函数.
  解决方案是在函数声明前加上 `extern "C"` 手动禁用改名:
  ```cpp
  extern "C" int my_add(int, int);
  ```

### 动态库 (dll)

特点: 运行时使用单独进程, 源码不会链接到执行程序, 需要在运行时加载.

优点: 动态库可以减少可执行文件的大小.

#### 动态库的导出

创建动态库项目 `dll`, 添加一个 c 文件.
```c
__declspec(dllexport) // 导出函数
int dll_add(int a, int b) {
	return a + b;
}

__declspec(dllexport)
int dll_sub(int a, int b) {
	return a - b;
}
```
右键项目生成. 可以在解决方案的 `x64/Debug` 目录下看到 `dll.dll` 和 `dll.lib` 文件.

`dll` 文件结构
```text
导出表
序号 名称    相对地址 (相对于动态库首地址的偏移量)
0    dll_add 50
1    dll_sub 100
------------------
正文内容
dll_add, dll_sub 函数的机器码
```

`lib` 文件结构. 与静态库不同, lib 文件不再保存函数的机器码, 仅保存 dll 文件名与每个函数在 dll 文件中的序号
```text
动态库文件名: dll.dll
dll_add 0
dll_sub 1
```

查看 dll 导出表:

    $ cd path-to-visual-studio/VC/Tools/MSVC/14.50.35717/bin/Hostx64/x64
    $ dumpbin -exports dll.dll

#### 动态库的使用

隐式链接, 由操作系统负责 dll 的载入与执行
```c
#include <stdio.h>
#pragma comment(lib, "../x64/Debug/dll.lib")

// 函数声明
__declspec(dllimport)
int dll_add(int, int);

__declspec(dllimport)
int dll_sub(int, int);

int main() {
    int sum = dll_add(5, 3);
    int sub = dll_sub(5, 3);
    printf("sum: %d, sub: %d\n", sum, sub);
    return 0;
}
```

隐式链接时, dll 文件可以存放在以下默认路径:
- 可执行文件 (exe) 所在目录 (推荐)
- 当前工作目录、
- Windows 目录、Windows/System32 目录和 Windows/System 目录
- 环境变量 PATH 指定目录

显式链接, 由程序员负责 dll 的载入与执行
```c
#include <stdio.h>
#include <windows.h>

typedef int Func(int, int);

int main() {
    // HMODULE 就是 HINSTANCE
    HMODULE module = LoadLibrary("dll.dll"); // dll 不在默认路径下时, 须指定绝对路径
    if (module != NULL) {
        Func *dll_add = (Func*)GetProcAddress(module, "dll_add"); // 获取函数地址, 转为函数指针
        printf("%d\n", dll_add(1, 2));
        FreeLibrary(module);
    }
    return 0;
}
```

- 如果 dll 是用 C++ 编写的, 用 `GetProcAddress(module, "dll_add")`
  将无法找到函数地址. 原因和静态库的一样, 函数名已被换成 `?dll_add@@YAHHH@Z`.
  可以用 `dumpbin -exports` 验证这一点.
- 解决: 编写动态库时, 不使用声明导出 `__declspec(dllexport)`, 而使用模块定义文件 `.def`
  ```text
  LIBRARY dll
  EXPORTS
    dll_add @1
    dll_sub @2
  ```
  这种方式导出的函数不会换名.

#### 动态库中封装类

```cpp
// 导出
class __declspec(dllexport) MyClass {};

// 导入
class __declspec(dllimport) MyClass {};

// 合而为一
#ifdef DLLCLASS_EXPORTS
#define EXT_CLASS __declspec(dllexport)
#else
#define EXT_CLASS __declspec(dllimport)
#endif
class EXT_CLASS MyClass {};
```

## 线程开发

### 线程基础

进程开启意味着分配内存, 而线程开启才是真正运行. 系统以线程为单位调度程序.

同一进程中的线程共享地址空间、堆空间, 但不共享栈空间. 每个线程有自己的栈.

```c
// 创建线程
HANDLE CreateThread(
    LPSECURITY_ATTRIBUTES lpThreadAttributes,   // 安全属性, 已弃用, 传 NULL
    SIZE_T dwStackSize,                         // 栈大小, 系统会将它向上取整为 1M 的倍数
    LPTHREAD_START_ROUTINE lpStartAddress,      // 线程处理函数地址
    LPVOID lpParameter,                         // 线程处理函数的参数
    DWORD dwCreationFlags,                      // 线程创建方式: 0: 立即执行, CREATE_SUSPENDED 挂起
    LPDWORD lpThreadId                          // 返回线程ID
) // 返回线程句柄

DWORD WINAPI ThreadProc(LPVOID lpParameter) // 线程处理函数

DWORD SuspendThread(HANDLE hThread) // 挂起线程 (线程休眠)
DWORD ResumeThread(HANDLE hThread) // 唤醒线程
VOID ExitThread(DWORD dwExitCode) // 退出当前线程. dwExitCode 已弃用, 传 0 即可
BOOL TerminateThread(HANDLE hThread, DWORD dwExitCode) // 结束指定的线程
HANDLE GetCurrentThread() // 获取当前线程句柄
DWORD GetCurrentThreadId() // 获取当前线程ID
```

第一个线程
```c
#include <stdio.h>
#include <Windows.h>

DWORD WINAPI ThreadProc(void* lpParam) {
    puts((char*)lpParam);
    return 0;
}

int main() {
    DWORD dwThreadId;
    HANDLE hThread = CreateThread(NULL, 0, ThreadProc, "ThreadName", 0, &dwThreadId);
    getchar(); // 按回车退出. 防止主线程直接退出
    return 0;
}
```

线程句柄是一种可等候的句柄, 这种句柄具备【有信号】和【无信号】两种状态. 使用下面的函数来等候信号:
```c
// 阻塞并等候句柄出现信号
VOID WaitForSingleObject(
    HANDLE handle, // 句柄
    DWORD dwMilliseconds // 等候时间, 可填 INFINITE = 0xffffffff, 约 49.7 天
)

// 同时等候多个句柄信号
DWORD WaitForMultipleObjects(
    DWORD nCount, // 句柄数量
    CONST HANDLE *lpHandles, // 句柄列表
    BOOL bWaitAll, // 等候方式. TRUE: 等到所有句柄都有信号才返回, FALSE: 只要一个句柄有信号就返回
    DWORD dwMilliseconds // 等候时间
)
```
事实上, 线程有三种状态: 运行、休眠（阻塞）、结束。当它运行或休眠时无信号，当它结束时有信号。

### 线程同步: 原子锁 (interlock)

多个线程对同一变量进行原子操作 (如 `++` 操作), 会造成数据丢失的现象.
下面的代码中, 每个线程都对同一变量进行 10 万次自增操作, 但 `g_value` 的最终值却小于 20 万.
```c
#include <stdio.h>
#include <Windows.h>

int g_value = 0;

DWORD WINAPI ThreadProc(void* lpParam) {
    int n = (int)lpParam;
    for (int i = 0; i < n; i++) {
        g_value++;
    }
    return 0;
}

int main() {
    DWORD dwThreadId;
    HANDLE hThread[2];
    hThread[0] = CreateThread(NULL, 0, ThreadProc, 100000, 0, &dwThreadId);
    hThread[1] = CreateThread(NULL, 0, ThreadProc, 100000, 0, &dwThreadId);
    WaitForMultipleObjects(2, hThread, TRUE, INFINITE);
    printf("g_value: %d\n", g_value);
    return 0;
}
```

> 计算错误的原因是: 例如 `g_value = 10`. 当线程 A 执行 `g_value++`, 还未把结果 `11` 保存到 `g_value` 变量的时候, 线程发生切换, 由线程 B 执行 `g_value++`, 并把 `g_value` 更新为 `11`.
当切回到线程 A 时, 线程 A 继续执行, 将它的计算结果 `11` 保存到 `g_value` 中,
从而线程 B 的计算结果被覆盖.

> 在 `g_value++` 这一行添加断点并启动 debug 运行, 程序停在断点后右键选择查看反汇编, 可以看到这一语句对应三条汇编指令:
> ```asm
> mov eax, dword ptr [g_value] ; 将 g_value 的值移到 eax
> add eax, 1                   ; eax 自增 1
> mov dword ptr [g_value], eax ; 将 eax 的值移到 g_value
> ```

解决: 把 `g_value++` 换成 `InterlockedIncrement(&g_value)`.
事实上许多运算符都有对应的原子锁函数:
- InterlockedIncrement
- InterlockedDecrement
- InterlockedExchange
- InterlockedCompareExchange
- ...

原子锁的原理是将整个操作视为整体, 开始操作前锁住 `g_value` 的内存, 结束操作后解锁.
其他线程遇到加锁的内存时则会阻塞.

### 线程同步: 互斥锁 (mutex)

互斥的适用范围比原子锁更广, 它可以用来锁定一段代码, 但运行效率不如原子锁.

同一时刻只能有至多一个线程拥有互斥锁.
```c
// 创建互斥锁
HANDLE CreateMutex(
    LPSECURITY_ATTRIBUTES lpMutexAttributes, // 安全属性, 已弃用, 传 0
    BOOL bInitialOwner, // 是否初始拥有. TRUE 表示初始时, 当前线程拥有该互斥锁
    LPCTSTR lpName, // 命名
) // 返回互斥句柄
```

互斥句柄是可等候的, 它有信号当且仅当没有线程拥有该互斥锁.
谁先等候, 谁就先获取到互斥锁.
```c
WaitForSingleObject / WaitForMultipleObjects // 等候互斥
BOOL ReleaseMutex(hMutex) // 释放互斥锁, 交出互斥的所有权
CloseHandle(hMutex) // 关闭互斥句柄
```

互斥锁案例. 在加锁前, 星号与横线字符穿插打印. 加锁后必须打完一行星号再打印一行横线.
```c
#include <stdio.h>
#include <Windows.h>

HANDLE g_hMutex;

DWORD WINAPI ThreadProc(void* lpParam) {
    char* str = (char*)lpParam;
    while (1) {
        WaitForSingleObject(g_hMutex, INFINITE); // 等候

        for (int i = 0; i < strlen(str); i++) {
            putchar(str[i]);
            Sleep(125);
        }
        putchar('\n');

        ReleaseMutex(g_hMutex); // 释放
    }
    return 0;
}

int main() {
    g_hMutex = CreateMutex(NULL, FALSE, "mutex"); // 创建互斥
    DWORD dwThreadId;
    HANDLE hThread[2];
    hThread[0] = CreateThread(NULL, 0, ThreadProc, "********", 0, &dwThreadId);
    hThread[1] = CreateThread(NULL, 0, ThreadProc, "--------", 0, &dwThreadId);
    getchar();
    CloseHandle(g_hMutex); // 销毁互斥
    return 0;
}
```

### 线程同步: 事件 (event)

事件可以解决线程间的通信问题
```c
// 创建事件
HANDLE CreateEvent(
    LPSECURITY_ATTRIBUTES lpEventAttributes, // 安全属性, 弃用, 传 NULL
    BOOL bManualReset, // 复位方式, TRUE: 手动, FALSE: 自动
    BOOL bInitialState, // 初始状态, TRUE: 有信号
    LPCTSTR lpName // 命名
) // 返回事件句柄
```
事件句柄是可等候的, 并且程序员可以决定一个事件句柄何时有信号.
信号从无到有, 叫做事件触发; 从有到无, 叫做事件复位. 如果指定自动复位, 则事件会在一个线程等候到信号以后自动复位.
```c
WaitForSingleObject / WaitForMultipleObjects: 等候事件
BOOL SetEvent(HANDLE hEvent) // 触发事件
BOOL ResetEvent(HANDLE hEvent) // 复位事件
CloseHandle(hEvent) // 关闭事件
```

> ⚠ 当心事件死锁

事件案例: 两个线程合作, 一秒打印一行字符串
```c
#include <stdio.h>
#include <Windows.h>

HANDLE g_hEvent;

// 负责打印
DWORD WINAPI ThreadPrint(void* lpParam) {
    char* str = (char*)lpParam;
    while (1) {
        WaitForSingleObject(g_hEvent, INFINITE);
        // ResetEvent(g_hEvent); // 系统自动帮我们复位事件, 这一行可以不加
        puts(str);
    }
    return 0;
}

// 负责控制
DWORD WINAPI ThreadCtrl(void* lpParam) {
    while (1) {
        Sleep(1000);
        SetEvent(g_hEvent);
    }
    return 0;
}

int main() {
    g_hEvent = CreateEvent(NULL, FALSE, FALSE, NULL); // 自动复位, 初始无信号
    DWORD dwThreadId;
    HANDLE hThread[2];
    hThread[0] = CreateThread(NULL, 0, ThreadPrint, "********", 0, &dwThreadId);
    hThread[1] = CreateThread(NULL, 0, ThreadCtrl, NULL, 0, &dwThreadId);
    WaitForMultipleObjects(2, hThread, TRUE, INFINITE);
    CloseHandle(g_hEvent);
    return 0;
}
```

### 线程同步: 信号量

信号的功能类似于事件, 用于线程间通信, 但它提供计数器, 可以设置次数
```c
HANDLE CreateSemaphore(
    LPSECURITY_ATTRIBUTES lpSemaphoreAttributes, // 安全属性, 已弃用, 传 NULL
    LONG lInitialCount, // 初始计数
    LONG lMaximumCount, // 计数最大值
    LPCTSTR lpName // 命名
) // 返回信号量句柄
```
信号量也是可等候的. 当信号量为 0 时线程阻塞, 大于 0 时线程通过, 但信号量减 1.
```c
WaitForSingleObject / WaitForMultipleObjects // 等候信号量
// 释放信号量 (修改信号量的计数值)
BOOL ReleaseSemaphore(
    HANDLE hSemaphore,
    LONG lReleaseCount, // 释放数量, 不能超过计数最大值, 否则执行失败
    LPLONG lpPreviousCount // 返回释放前的数量
)
CloseHandle(hSemaphore) // 关闭信号量
```
