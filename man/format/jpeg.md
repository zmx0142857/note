# JPEG

- [深入浅出JPEG](https://deepinout.com/camera-terms/easy-to-understand-jpeg.html)
- [Description of Exif file format](http://www.fifi.org/doc/jhead/exif-e.html)

## 段结构

JPEG (Joint Photographic Experts Group) 文件由许多段组成, 段的一般结构如下:

|字段名|字节数|类型|描述|
|-|-|-|-|
|填充字节 padding|≥1|uint8|常量 `0xff`|
|标记码 type|1|uint8|用一个整数表示段类型|
|段长度 length|2|uint16 (big endian)|`sizeof(content) + 2`|
|段内容 content|0~65533||段的具体内容取决于段类型|

- JPEG 格式中的整数总是采用大端字节序 (big endian), 即高位字节在先的形式.
- 有些段没有长度描述也没有内容, 文件头和文件尾属于这种段.
- 段与段之间无论有多少 `0xff` 都是合法的.
- 判断一个文件属于 jpeg 格式, 只需确认它的前 3 个字节为 `ff d8 ff` 即可.

## 段类型

段类型共有 30 种, 但只有 10 种是应用程序必须支持的:

|段类型|缩写|标记码|说明|
|-|-|-|-|
|文件头|SOI|`0xd8`|文件头固定为两字节 `ff d8`|
|文件尾|EOI|`0xd9`|文件尾固定为两字节 `ff d9`|
|图像识别信息|APP0|`0xe0`||
|定义量化表|DQT|`0xdb`||
|图像基本信息|SOF0|`0xc0`||
|图像基本信息|SOF1|`0xc1`||
|定义 Huffman 表|DHT|`0xc4`||
|扫描行开始|SOS|`0xda`|真正承载图像数据的段|
|注释|COM|`0xfe`||
|定义重新开始间隔|DRI|`0xdd`||

- 有的地方也将 "定义扫描行数" (DNL, `0xdc`) 列为必须段.

### APP0 图像识别信息

|字段名|字节数|类型|描述|
|-|-|-|-|
|段长度 length|2|uint16|`sizeof(thumbnail) + 16`|
|交换格式 format|5|string|`"JFIF\0"` 或 `"TFIF\0"`, 前者较为常见|
|主版本号 majorVersion|1|uint8||
|次版本号 minorVersion|1|uint8||
|密度单位 densityUnit|1|uint8|0:无单位, 1:像素/英寸, 2:像素/厘米|
|X像素密度 densityX|2|uint16|水平方向密度|
|Y像素密度 densityY|2|uint16|竖直方向密度|
|缩略图宽度 thumbnailW|1|uint8|缩略图最大为 256x256|
|缩略图高度 thumbnailH|1|uint8||
|缩略图 thumbnail|3n|uint8[]|每个像素占 3 字节, 像素总数 n = thumbnailW * thumbnailH|

### DQT 定义量化表

|字段名|字节数|类型|描述|
|-|-|-|-|
|段长度 length|2|uint16|`sizeof(QT) + 3`|
|量化表信息 qtInfo|1|uint8|低4位:量化表号; 高4位:精度 (0:1字节, 其它:2字节)|
|量化表 qt|64n|uint8[]|n = QT精度的字节数|

### SOF0 图像基本信息

|字段名|字节数|类型|描述|
|-|-|-|-|
|段长度 length|2|uint16|`nComponents*3 + 8`|
|样本精度 accuracy|1|uint8|每个分量的位数, 常见为 8|
|图片高度 height|2|uint16|图片最大宽高为65535|
|图片宽度 width|2|uint16||
|分量数 nComponents|1|uint8|1:灰度图, 3:YCbCr/YIQ彩色图, 4:CMYK彩色图|
|分量定义 components|`nComponents*3`|Component[]|见下|

**Component**

|字段名|字节数|类型|描述|
|-|-|-|-|
|分量ID componentId|1|uint8|1:Y, 2:Cb, 3:Cr, 4:I, 5:Q|
|采样系数 sampleRate|1|uint8|低4位:垂直采样系数; 高4位:水平采样系数|
|量化表号 qtId|1|uint8||

- 样本是分量的同义词.
- JPEG 一般采用 YCbCr (亮度、红色分量、蓝色分量) 色彩模型, 每个像素有三个分量 (即三个样本).
- 采样系数乘以 0.5, 就得到每个像素的采样数. 比如 sampleRate=2 表示每个像素有一个采样.

### DHT 定义Huffman表

JPEG 文件中可以有多个 DHT 段, 每个 DHT 段可以有多个 Huffman 表, 但常见情形是一段一表.

|字段名|字节数|类型|描述|
|-|-|-|-|
|段长度 length|2|uint16|`sizeof(ht) + 2`|
|Huffman表 ht|不定|HT[]|见下|

**HT**

|字段名|字节数|类型|描述|
|-|-|-|-|
|HT信息 htInfo|1|uint8|低4位:HT号; 第4位:HT类型 (0:DC表, 1:AC表); 5-7位:常量, 等于0|
|HT位表 htBits|16|uint8[]|这16个数之和≤256|
|HT值表 htValues|n|uint8[]|n = htBits 16 个数之和|

### SOS 扫描行开始

|字段名|字节数|类型|描述|
|-|-|-|-|
|段长度 length|2|uint16|`nComponents*2 + 6`|
|分量数 nComponents|1|uint8|范围 1~4, 常见为 3|
|分量定义 components|`nComponents*2`|Component[]|见下|
|剩余3个字节 unknown|3|uint8[]|用途不明|
|图像数据 data|不定|uint8[]|数据存放顺序: 从左到右, 从上到下|

**Component**

|字段名|字节数|类型|描述|
|-|-|-|-|
|分量ID componentId|1|uint8|1:Y, 2:Cb, 3:Cr, 4:I, 5:Q|
|Huffman表号|1|uint8|低4位:AC表号, 高4位:DC表号, 两种表号的范围都是 0~3|

### COM 注释

注释段是可选的.

|字段名|字节数|类型|描述|
|-|-|-|-|
|段长度 length|2|uint16|`sizeof(comment) + 2`|
|注释内容 comment|不定|string||

### DRI 定义重新开始间隔

DRI 段也是可选的.

|字段名|字节数|类型|描述|
|-|-|-|-|
|段长度 length|2|uint16|常量 `4`|
|开始间隔 restartInterval|2|uint16|复位标记的间隔|

在 JPEG 数据流中, 每隔 n 个 MCU 块就有一个复位标记 (RST).
复位标记长度为 2 字节, 其取值为 `ff d0` 至 `ff d7`, 分别称为 RST0 到 RST7.
