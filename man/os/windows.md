# Windows

## scoop

windows 的包管理器, chocolatey 的后继者.

安装: 打开一个普通 powershell 窗口 (不是管理员)
```
ps> [environment]::setEnvironmentVariable('SCOOP','D:\app\scoop','User')
ps> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
ps> Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
```
> 最后一个命令也: iwr get.scoop.sh -useb | iex

使用

    $ scoop install <package> # 安装软件
    $ scoop list              # 列出已安装软件
    $ scoop config SCOOP_REPO https://gitee.com/scoop-bucket/scoop # 设置镜像
    $ scoop config SCOOP_REPO https://github.com/ScoopInstaller/Scoop # 恢复官方镜像

## windows terminal + git bash

- 在商店下载最新的 windows terminal
- 在[镜像](https://npm.taobao.org/mirrors/git-for-windows/)下载 git for windows, 或者直接 scoop install git vim
  - 确保 git for windows 版本 >= 2.29.2, 低版本 git 套装中的 vim 有问题
  - 不要使用 git for windows 版本 2.39.0-rc2, 否则使用 git push 提交后会导致 svn 乱码
  - 一个合适的版本: 2.32.0.windows.2
- 中文乱码问题: 打开 git bash, 右键 > options > text > Locale=zh\_CN, Character set=UTF-8
- 打开 windows terminal 配置, 或找到 `settings.json`, 将 git bash 可执行文件 `bash.exe` 添加到一个 profile
  `settings.json` 的默认位置:
  ```
  %USERPROFILE%/AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState/settings.json
  ```
- 你可以为 windows terminal 配置喜爱的颜色主题
- 愉悦地在 windows 下使用 bash: ls, git, vim...

## 环境变量

- 按【田】键 > 搜索 "env" > 编辑系统环境变量
- 环境变量分为【用户变量】和【系统变量】, 一般只改用户变量即可
- 刷新当前 cmd 的环境变量, 而不必关闭窗口: [RefreshEnv.cmd](https://github.com/chocolatey-archive/chocolatey/blob/master/src/redirects/RefreshEnv.cmd)
- 问题: win10 PATH 环境变量编辑器不能打开, 只显示一个长长的输入框.
  - 解决: 不要把 `%` 开头的变量放在最前面

## 代理

当前命令行有效:

    cmd> set http_proxy=http://127.0.0.1:10809
    cmd> set https_proxy=http://127.0.0.1:10809

永久有效

    cmd admin> netsh winhttp import proxy source=ie

## 个性化

用命令行设置深色模式

```sh
$ reg.exe add HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize /v AppsUseLightTheme /t REG_DWORD /d 0 /f
```

win10 任务栏图标居中

- 在桌面新建文件夹, 起名为 I could fran
- 右键任务栏 > 解除锁定任务栏
- 右键任务栏 > 工具栏 > 新建工具栏 > 选择刚才新建的文件夹
- 这个文件夹会出现在任务栏最右侧, 用鼠标把它拖动到最左侧
- 至于任务栏的其它图标, 可以拖动到中间位置
- 右键任务栏 > 锁定任务栏

### 输入法自定义短语 / 自造词

```sh
$ cp /c/Users/Administrator/AppData/Roaming/Microsoft/InputMethod/Chs/*.lex $APPDATA/Microsoft/InputMethod/Chs
```

### 蓝屏分析

- 打开【系统属性/高级/启动和故障恢复/设置】，勾选【将事件写入系统日志】和【写入调试信息=小内存转储(256KB)】
- 下次蓝屏重启后，打开【事件查看器】查看日志，或从商店下载【WinDBG】分析 `C:\Windows\Minidump\dmp` 文件

## WSL

[windows subsystem linux](https://learn.microsoft.com/zh-cn/windows/wsl/install-manual)

### 安装

- 打开商店下载想要的 linux 发行版, 如 ubuntu.
- 在管理员 powershell 中启用 WSL 功能
  ```
  ps admin> dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
  ```
- win10 专业版默认已开启虚拟化功能, 家庭版则需要手动开启:
  - 按【田】键 > 启用或关闭 windows 功能 > Hyper V
  - 重启电脑
- win11 用户需要安装 [适用于 x64 计算机的最新 wsl2 linux 内核更新包](https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi)。
  - 如果你没有安装就直接运行 Ubuntu, 多半会看到这个错误: `WslRegisterDistribution failed with error: 0x800701bc`
- 重启电脑, 打开刚才下载的 ubuntu, wsl 就会开始安装

### wsl 迁移到 D 盘

```
$ wsl --shutdown
$ wsl --status # 查看已安装的 wsl, 如 ubuntu-22.04
$ mkdir -p /d/app/wsl/ubuntu22.04
$ wsl --export Ubuntu22.04 /d/app/wsl/ubuntu22.04.tar # 导出备份
$ wsl --unregister Ubuntu-22.04 # 卸载 wsl
$ wsl --import Ubuntu-22.04 /d/app/wsl/ubuntu22.04 /d/app/wsl/ubuntu22.04.tar # 导入备份
```

登入 wsl, 新建文件 `/etc/wsl.conf` 指定默认登录用户:
```
[user]
default = <username>
```

`wsl --shutdown`, 再重新进入 wsl 即可.
