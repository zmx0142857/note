# Excel

## 数据类型

- 地址, 如 `A1`
- 绝对地址, 如 `$A$1`, 它不会随着复制或填充柄而更改
- 范围, 如 `A1:Z26`
- 相对行列号, 指范围中的第几行第几列, 例如对 `C2:F8` 而言, `E5` 是它的第 4 行第 3 列.
- 字符串, 如 `"STR"`.

## 常用函数

### 字符串操作

- `MID(str, start, length)`

  取子串. 从 str 的第 start 个字起 (下标从 1 开始), 取 length 个字.

- `CONCAT(a, b, ...)`

  连接字符串. a, b 可以是字符串也可以是数字, 此函数可以将数字转为字符串.

### 索引操作

- `INDIRECT(str)`

  取出指定地址的内容, 比如 `INDIRECT("A2")` 将取出单元格 A2 的内容.

- `INDEX(range, relative_row, relative_column)`

  取出范围 range 内的指定单元格内容. `relative_row`, `relative_column` 是相对行列号.

- `ROW(), COLUMN()`

  公式所在单元格的行列号.

### 查找

- `MATCH(value, range, type)`

  查找数值. 在范围 range 中查找给定的值 value, 返回相对行号.
  - `type`: 0: 精确匹配, 1 小于, -1: 大于

- `VLOOKUP(value, range, relative_column, fuzzy = TRUE)`

  查找数值或文本. 在范围 range 的最左边一列查找给定的值 value,
  找到后返回匹配行的第 `relative_column` 列内容.
  - `fuzzy`: TRUE: 模糊匹配 (默认), FALSE: 精确匹配

### 其他

- `IF(cond, value1, value2)`

  cond 是非 0 值时, 返回 value1, 否则返回 value2.

- `TRUE(), FALSE()`

  分别返回逻辑值真和假.

## 常用操作

| | MS Office | Libre Office | 腾讯文档 |
|-|-|-|-|
| 合并单元格 | | 格式 > 合并单元格 > 合并并居中单元格 (Alt+O E E) | |
| 设置数据类型 | | 格式 > 单元格... (Ctrl+1) | |
