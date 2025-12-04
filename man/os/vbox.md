# Virtual Box

oracle 公司的虚拟机软件（免费）

## 如何安装在 D 盘

在 D 盘的目录下安装，不出所料会遇到报错:
```text
Invalid installation directory
The chosen installation directory is invalid, as it does not meeet the security requirements.
```
解决：在 cmd (管理员) 执行以下命令，修改目录权限。注意，安装目录的所有父目录也需要相同的权限, 为了避免不必要的麻烦，建议直接在 D 盘根目录新建文件夹：
```cmd
mkdir D:\vbox
icacls D:\vbox /reset /t /c
icacls D:\vbox /inheritance:d /t /c
icacls D:\vbox /grant *S-1-5-32-545:(OI)(CI)(RX) /t /c
icacls D:\vbox /deny *S-1-5-32-545:(DE,WD,AD,WEA,WA) /t /c
icacls D:\vbox /grant *S-1-5-11:(OI)(CI)(RX) /t /c
icacls D:\vbox /deny *S-1-5-11:(DE,WD,AD,WEA,WA) /t /c
```
运行安装程序时，如果遇到报错
```text
安装程序没有足够的特权来访问目录 D:\vbox\sdk
安装无法继续。请以系统管理员身份登录，或与你的系统管理员联系。
```
解决: 用下面的命令重置权限，然后继续安装
```cmd
icacls D:\vbox /reset /t /c
```
安装程序可能会报错退出。这时重新运行安装程序并选择“修复”，可能解决问题。

## 新建虚拟机

### win10

- Name: `win10-251204`
- Folder: `D:\app\vbox-vm`
- ISO Image: `win10.iso`
- 不勾选 Skip Unattended Installation
- 内存: 8GB
- 处理器: 8核
- 不勾选 Enable EFI
- Disk Size: 80GB

### 画面放大

- 【视图 > 自动调整显示尺寸】

### 文件共享

- 【设置 > 共享文件夹】，然后选择宿主系统中的一个文件夹
- 勾选自动挂载、固定分配
- 启动虚拟机，【设备 > 安装增强功能】。或者在虚拟机的【此电脑】中打开 (D:) VirtualBox Guest Additions，双击 exe 文件安装
- 安装增强工具后，重启虚拟机

### 系统备份

- 生成快照：启动虚拟机，【控制 > 生成备份】
- 查看快照：关闭虚拟机，在虚拟机的【⋮三】菜单中选择备份

