# gltf

## 模型处理

- gltfpack
  ```sh
  $ npm i -g gltfpack
  $ gltfpack -i model.gltf -o model.min.gltf # 有损压缩
  ```
- gltf-pipeline
  ```sh
  $ npm i -g gltf-pipeline
  $ gltf-pipeline -i model.gltf -o model.draco.gltf -d # draco 压缩
  ```
- 在线压缩 https://modelcompress.cn/home

## 模型结构

- https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

gltf 模型由 `.gltf` 和 `.bin` 两个文件组成, 或者两者合而为一, 用一个二进制文件 `.glb` 表示.

### glb 结构

```text
┌──────┬────────┬────────┬─────┐
│ head │ chunk0 │ chunk1 │ ... │
└──────┴────────┴────────┴─────┘
```
- head: 文件头 (12byte)
  |字段名|字节长|类型|描述|
  |-|-|-|-|
  |magic|4|string|常量 `"glTF"`|
  |version|4|uint32|目前是 `2`|
  |length|4|uint32|整个文件的大小, 单位 byte|
- chunk0: JSON 数据
  |字段名|字节长|类型|描述|
  |-|-|-|-|
  |chunkLength|4|uint32|块长度|
  |chunkType|4|string|块类型, `"JSON"` 或 `"BIN\x00"`|
  |chunkData|chunkLength|bytes[]|块数据|
- chunk1: 二进制 buffer, 同样由 chunkLength, chunkType, chunkData 三部分组成

### gltf 结构

- https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#properties-reference

我们接下来专注于 `.gltf + .bin` 的格式.

buffers: 二进制数据, 指向 `.bin` 文件. 这里的 uri 也可以是 base64 编码的数据, 如 `"uri": "data:application/octet-stream;base64,ALDUxQD..."`
```js
{
  "buffers": [
    {
      "byteLength": 102040,
      "uri": "model.bin"
    }
  ]
}
```

bufferViews: buffer 的切片引用
- buffer: buffer 编号
- byteLength: 切片长度
- byteOffset: 切片在 buffer 中的起始位置
- target: 目标类型. 有 array buffer (34962), element array buffer (34963)
- bytestride: 可选, 顶点跨度, 单位 byte

```js
{
  "bufferViews": [
    {
      "buffer": 0,
      "byteLength": 25272,
      "byteOffset": 0,
      "target": 34963 // 保存 index 信息
    },
    {
      "buffer": 0,
      "byteLength": 76768,
      "byteOffset": 25272,
      "byteStride": 32,
      "target": 34962 // 保存顶点信息
    }
  ]
}
```

accessors: 访问器
- bufferView: bufferView 编号
- byteOffset: 数据在 bufferView 中的起始位置
- componentType: 元素类型, 有 uint16 (5123), float32 (5126) 等
- count: 元素个数.
- max 和 min: 模型的 POSITION 属性会用到, 可以用来计算包围盒
- type: 标量 (SCALAR)、三维矢量 (VEC3)、四维矩阵 (MAT4) 等

```js
{
  "accessors": [
    {
      "bufferView": 0,
      "byteOffset": 0,
      "componentType": 5123,
      "count": 12636,
      "max": [
        4212
      ],
      "min": [
        0
      ],
      "type": "SCALAR"
    },
    {
      "bufferView": 1,
      "byteOffset": 0,
      "componentType": 5126,
      "count": 2399,
      "max": [
        0.961799,
        1.6397,
        0.539252
      ],
      "min": [
        -0.692985,
        0.0992937,
        -0.613282
      ],
      "type": "VEC3"
    }
  ]
}
```

materials: 材质
```js
{
  "materials": [
    {
      "name": "gold",
      "pbrMetallicRoughness": {
        "baseColorFactor": [ 1.000, 0.766, 0.336, 1.0 ], // 基本色
        "metallicFactor": 1.0, // 金属度
        "roughnessFactor": 0.0 // 粗糙度
      }
    }
  ]
}
```

meshes: 网格
```js
{
  "meshes": [
    {
      "primitives": [
        {
          "attributes": {
            "NORMAL": 23, // accessors[23]
            "POSITION": 22, // accessors[22]
            "TANGENT": 24, // accessors[24]
            "TEXCOORD_0": 25 // accessors[25]
          },
          "indices": 21, // accessors[21]
          "material": 3, // materials[3]
          "mode": 4 // points(0), lines(1), line loop(2), line strip(3), triangles(4), triangle strip(5), triangle fan(6)
        }
      ]
    }
  ]
}
```

nodes: 网格的实例化

同一网格可以在不同 node 间复用, 指定不同的 translation:
```js
{
  "nodes": [
    {
      "mesh": 11
    },
    {
      "mesh": 11,
      "translation": [
        -20,
        -1,
        0
      ]
    }
  ]
}
```

> 标准写道：When normals are not specified, client implementations MUST calculate flat normals.
> 也许这就是 cesium 不会为模型自动添加法线的原因
