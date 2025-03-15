# 3dtiles

- https://github.com/CesiumGS/3d-tiles
- https://www.cnblogs.com/onsummer/p/12799366.html

> 3dtiles 1.0 版本包含 cmpt, b3dm, i3dm, pnts 多种格式的文件, 而 1.1 版本改为直接包含 glb 文件.

### tileset.json

`root.transform` 是从模型坐标系到世界坐标系的四阶变换矩阵. 例如下面表示一个 `x, y, z => z, x, y` 的变换
```
transform = [
  0, 0, 1, 0,
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 0, 1
]
```

`root.boundingVolume.box` 包围盒
```
box = [c1, c2, c3, x1, x2, x3, y1, y2, y3, z1, z2, z3]
```
其中 `(c1, c2, c3)` 是包围盒中心坐标, `(x1, x2, x3)`, `(y1, y2, y3)`, `(z1, z2, z3)`
三个向量分别是包围盒的 x, y, z 三个半轴. 例如, 下面的包围盒:
```
[-27570, -13239.5, 14440.5, 33925, 0, 0, 0, 21299.5, 0, 0, 0, 14890.5]
```
该包围盒与世界坐标系对齐 (无旋转), 中心点为 `(-27570, -13239.5, 14440.5)`, 大小为 `(33925*2, 21299.5*2, 14890.5*2)`.

### cmpt

```text
┌──────┬───────┬───────┬─────┐
│ head │ tile1 │ tile2 │ ... │
└──────┴───────┴───────┴─────┘
```

- head: 文件头 (16byte)
  |字段名|字节长|类型|描述|
  |-|-|-|-|
  |magic|4|string|常量 `"cmpt"`|
  |version|4|uint32|目前是 `1`|
  |byteLength|4|uint32|整个 cmpt 文件的大小, 单位 byte|
  |tilesLength|4|uint32|cmpt 文件中的 tile 数目|
- tile: 瓦片, 可以是 b3dm, i3dm, 甚至 cmpt

### b3dm

```text
┌──────┬───────────────────────────────────────┬───────────────────────────────────┬─────┐
│      │         FeatureTable                  │           BatchTable              │     │
│ head ├──────────────────┬────────────────────┼────────────────┬──────────────────┤ glb │
│      │ FeatureTableJSON │ FeatureTableBinary │ BatchTableJSON │ BatchTableBinary │     │
│      │ [in binary]      │                    │ [in binary]    │                  │     │
└──────┴──────────────────┴────────────────────┴────────────────┴──────────────────┴─────┘
```

- head: 文件头 (28byte)
  |字段名|字节长|类型|描述|
  |-|-|-|-|
  |magic|4|string|常量 `"b3dm"`|
  |version|4|uint32|目前是 `1`|
  |byteLength|4|uint32|整个 b3dm 文件的大小, 单位 byte|
  |featureTableJSONByteLength|4|uint32|FeatureTableJSON 的长度|
  |featureTableBinaryByteLength|4|uint32|FeatureTableBinary 的长度|
  |batchTableJSONByteLength|4|uint32|BatchTableJSON 的长度|
  |batchTableBinaryByteLength|4|uint32|BatchTableBinary 的长度|
  > 注: glb 的长度 = byteLength - 文件头长度(28) - 四个table的长度

### i3dm

```text
*same as b3dm*
```

- header: 文件头 (32byte)
  前 7 个字段和 b3dm 一样, 最后多一个字段:
  |字段名|字节长|类型|描述|
  |-|-|-|-|
  |magic|4|string|常量 `"i3dm"`|
  |...|...|...|...|
  |gltfFormat|4|uint32|0: gltf 通过 uri 指向 gltf 的数据内容 (bin 文件); 1: glb 文件 (比较常见)|

