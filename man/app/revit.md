# Revit

## 安装

- 建议在虚拟机中安装，因为 revit 有很多开机自启进程和服务。虚拟机建议至少有 80GB 磁盘空间。
- 若安装进度卡在 Preparing...，可以试试脱机安装：`Setup.exe --noupdate`。
<!--
- 安装完成后，关闭 windows 安全中心，运行 Crack 目录中的程序。
- 在 revit 界面中选择 use network license。server name 就写 localhost
-->
- 全部完成后，建立虚拟机快照，备份当前状态。

## 使用

### 旧版 revit 如何打开新版模型

将 revit 模型导出为 IFC 格式，再用旧版 revit 导入

### 坐标系

- 问题：revit 模型导出为 obj 后，原点位置发生改变。
- 原因：revit 中有三个原点：内部原点、项目基点与测量点。bim angle 导出 3dtiles 模型时默认以项目基点为原点，然而 revit 导出 obj 时是以内部原点为原点，即 (E, N, H) 坐标系。
- 解决方法一：bim angle 导出时，选择内部坐标系作为原点。
- 解决方法二：
  - 在 revit 中右键项目基点，菜单中选择将它移动到内部原点，在属性窗口可以看到项目基点的坐标。记住这个坐标。
  - 撤销操作，不要保存 revit 模型，把上一步记住的偏移量应用到 obj 点云模型
  - translate=(x: 东/西, y: 北/南, z:高程)
