# Sqlite3

## 安装

    $ scoop install sqlite3

- android platform\_tools 目录中也带有 sqlite3 命令行工具
- vscode 的 Sqlite3 Editor 插件提供了 sqlite3 的图形化工具

## 命令行

```bash
$ sqlite3 data.db # 打开数据库文件
$ sqlite3 data.db .dump > data.sql # 将数据库文件转存为 sql
$ sqlite3 data.db < data.sql # 从 sql 恢复数据库文件
```

```
sqlite> .help -- 帮助
sqlite> .open data.db -- 打开或新建数据库
sqlite> .show -- 基本信息
sqlite> .quit -- 退出
sqlite> .exit -- 退出
sqlite> .databases -- 列出数据库
sqlite> .tables -- 列出表
sqlite> .schema <table> -- 显示建表语句
sqlite> select * from sqlite_master; -- sqlite 管理表
sqlite> .header on -- 显示表头
sqlite> .mode column -- 输出表格时, 显示更多空白
```

> sqlite 命令 (以句点开头) 不需要带分号, 但 sql 语句需要.

## 数据类型

存储上, sqlite 只有 5 种类型: `null`, `integer`, `real`, `text` 和 `blob`.

### 日期时间

- `datetime(time, [format])`: 返回日期字符串, 形如 `YYYY-MM-DD HH:mm:ss`.
  ```sql
  datetime('now') -- 等价于 current_timestamp
  datetime('2023-11-11 01:10:36', 'localtime') -- 在东八区, +8h
  datetime('2023-11-11 01:10:36', 'utc') -- 在东八区, -8h
  datetime(1699665036, 'unixepoch') -- 将时间戳转为字符串 (0 时区)
  ```
- `strftime('%s', time, [format])`: 返回 UNIX 时间戳, (1970-01-01 以来的秒数)
  ```sql
  strftime('%s', '2023-11-11 01:10:36') -- 将字符串转为时间戳 (0 时区)
  strftime('%s', '2023-11-11 01:10:36', 'localtime') -- 在东八区, +8h
  strftime('%s', '2023-11-11 01:10:36', 'utc') -- 在东八区, -8h
  ```

> 一般在数据库中存储本地时间字符串 `datetime('now', 'localtime')`, 好处是利于阅读与运维.
> 也可以存储时间戳数字 `strftime('%s', 'now')`, 好处是不会遇到时区的问题, 且便于程序处理.

## sql 指南

### 常用运算符

- `||`: 字符串拼接. 如果其中一个参数为 NULL, 则结果是 NULL
- `%`: 字符串通配符, 代表 0 或任意多个字符
- `_`: 字符串通配符, 代表 1 个字符

### 常用函数

- `ifnull(value, defaultValue)`: 当 value 为 NULL 时, 返回 defaultValue
- `coalesce(value1, value2, ..., valueN)`: 返回第一个不为 NULL 的参数, 如果所有参数均为 NULL, 则返回 NULL
- `changes()`: 查询上次操作的受影响行数: `select changes();`

### 常用语句

```sql
-- 建表
create table user(
  user_id integer primary key autoincrement,
  is_delete boolean not null default false,
  create_time integer not null,
  update_time integer not null,
  username text not null,
  nickname text not null); -- sqlite 不支持尾逗号, 建议直接在最后一行闭合括号

-- 删表 (危!)
drop table if exists user;

-- 插入
insert into user (create_time, update_time, username, nickname) values
  (strftime('%s', 'now'), strftime('%s', 'now'), 'icouldfran', 'Fran'),
  (strftime('%s', 'now'), strftime('%s', 'now'), 'nancy', 'Nancy');

-- 查询
select * from user;

-- 清空表中数据 (危!)
delete from user; -- 表中数据会清空, 但继续插入时, 自增 id 不会从 1 开始

-- 软删除
update user set is_delete=1 where user_id=2;
```

> ⚠  数据无价. 使用 update 或 delete 语句时, 永远要带上 where 子句!
> 更保险的做法是先按查出待修改记录, 确认无误后再操作.

### 修改列的 not null 约束

sqlite 几乎没有 alter table 支持, 更改表最简单的方法是重建一个, 把数据复制过来:
```sql
create table user2(..., create_time integer, update_time integer, ...);
insert into user2 select * from user;
drop table user;
alter table user2 rename to user;
```

### 用触发器提供默认值/更新时间

```sql
create trigger user_create_time after insert on user
begin
  update user set create_time=strftime('%s', 'now'), update_time=strftime('%s', 'now') where user_id=new.user_id;
end;

create trigger user_update_time after update on user
begin
  update user set update_time=strftime('%s', 'now') where user_id=new.user_id;
end;

-- 试试看!
insert into user (username, nickname) values ('nikohere', 'Niko');
select * from user;
update user set is_delete=1 where username='nikohere';
select * from user;

-- 查看 user 表上的所有触发器
select name from sqlite_master where type='trigger' and tbl_name='user';
```
触发器可能导致性能下降, 请根据实际情况权衡.
