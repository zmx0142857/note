# cmd 批处理脚本

## 参考资料

- 《批处理标准教程》MHL 版

## 循环语句

批量转换 gltf 模型

    cmd> for %i in ('dir *.gltf ') do gltf-pipeline -i %i -o %~ni.glb

## powershell

```
irm     # InvokeRequestMethod, 用于发起网络请求
iex     # 用于执行脚本
```
