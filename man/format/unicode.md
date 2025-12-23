# Unicode

## 控制字符

- **字节顺序标记 (Byte Order Mark, BOM)** 通常位于文件开头:
  ```txt
  UTF-8:                EF BB BF
  UTF-16 little endian: FF FE
  UTF-16 big endian:    FE FF
  UTF-32 little endian: FF FE 00 00
  UTF-32 big endian:    00 00 FE FF
  ```
  尽管 utf-8 与字节序无关, 微软的某些工具 (如记事本、excel 导出 utf-8 csv 时) 仍会添加 BOM.
  好消息是 js 的 `FileReader.readAsText` 可以正确识别 BOM, 无需额外处理.
- **变体选择符 (Variation Selector, VS)** 范围 `U+FE00 ~ U+FEFF`, 其中 `U+FE0F` 可以把字符变为 emoji.
  例如, 取决于你的环境, 下面第一行的字符可能是空心的惊叹号, 但第二行的惊叹号是 emoji 的彩色惊叹号:
  ```text
  ⚠
  ⚠️
  ```
  复制这两行文字, 在 console 中验证这一点, 可以看到第二行文字以 `U+FE0F` 结尾:
  ```js
  Array.from(s, c => c.charCodeAt(0)) // ['26a0', 'a', '26a0', 'fe0f']
  ```
- 零宽字符: 一类不可见字符, 常见的有:
  |编码|中文|英文|缩写|备注|
  |----|----|----|----|----|
  |U+FEFF|零宽不换行空格|ZERO WIDTH NO-BREAK SPACE|zwnbsp|与零宽空格类似，但阻止换行|
  |U+200B|零宽空格|ZERO WIDTH SPACE|zwsp|它在那里，但是看不见|
  |U+200C|零宽不连字|ZERO WIDTH NON-JOINER|zwnj|用于阻止连字|
  |U+200D|零宽连字|ZERO WIDTH JOINER|zwj|常用于连接 emoji 表情|
  |U+200E|左至右标志|LEFT-TO-RIGHT MARK|lrm||
  |U+200F|右至左标志|RIGHT-TO-LEFT-MARK|rlm||
  |U+202A|左至右嵌入|LEFT-TO-RIGHT-EMBEDDING|lre|在 windows 资源管理器，查看文件的【属性/安全/对象名称】, 从右至左复制路径, 得到的字符串以 U+202A 开头|
  |U+202B|右至左嵌入|RIGHT-TO-LEFT-EMBEDDING|rle||
  |U+202C|退出方向性格式化|POP DIRECTIONAL FORMATTING|pdf||
  |U+202D|强制左至右|LEFT-TO-RIGHT-OVERRIDE|lro|iOS 通讯录号码带有 U+202D, 确保号码显示方向为从左到右|
  |U+202E|强制右至左|RIGHT-TO-LEFT-OVERRIDE|rlo|用 "昵称 U+202E 喵 U+202D" 做 QQ 昵称, 群友 @ 你时就会在句末带 "喵"|
- [空格字符一览](https://cloud.tencent.com/developer/article/2128593)
