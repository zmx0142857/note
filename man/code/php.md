# PHP

## quick start

### windows

- 安装 xampp 建站工具包, 它包含 apache, mysql, tomcat, perl 等工具
- 在 control panel 启动 apache 和 mysql.  点击 admin 可以打开后台管理页面.
  - 端口不冲突时, apache 默认使用 80 和 443 端口, mysql 默认使用 3306 端口.
  - mysql 的默认用户名是 root, 密码为空. 点击 shell, 输入 `mysql -u root -p` 登录到 mysql 命令行.
- 新建目录, 添加测试网页 `xampp/htdocs/php-demo/index.php`
- 用浏览器访问 http://localhost/php-demo/index.php

`index.php`
```html
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <title></title>
</head>
<body>

<?php
echo "<h1>欢迎来到PHP</h1>";
?>

</body>
</html>
```

## basics

> ⚠ 注意: 以下代码均要包裹在 `<?php ?>` 标签内

变量
```php
$name = "fran";
echo "你好, " . $name . "<br>"; // 点号连接字符串
echo "你好, $name <br>"; // 模板字符串
echo '你好, $name <br>'; // 未发生变量替换, 原样输出 $name

// 多行字符串
echo "<p>hello</p>
<p>world</p>";
echo <<<EOF
    <p>hello</p>
    <p>world</p>
EOF;

// 最后一个语句的分号可以省略, 但不推荐
```

建议使用三个等号判断相等
```php
// 用 var_dump 查看变量详情
var_dump(1 == "1"); // bool(true)
var_dump(1 === "1"); // bool(false)

echo true; // 输出 1
echo false; // 没有输出
```

GBK 编码处理: 方法一
```php
header("Content-Type:text/html; charset='GBK'"); // 整个网页都使用 GBK 编码
echo `ipconfig`; // 执行命令行, 返回结果
```

GBK 编码处理: 方法二
```php
echo iconv('gbk', 'utf-8', `ipconfig`); // 手动转换编码
```

分支循环
- `switch` 语句与 c 语言相同
- `elseif` 关键字中间无空格
- `while`, `do..while`, `for` 循环与 c 语言相同
- `foreach` 循环用来遍历数组, 参见下文

作用域
```php
$x = 5; // 全局变量

function myTest () {
    global $x; // 声明全局变量
    $y = 10; // 局部变量
    echo "<p>在函数内, x: $x, y: $y</p>";
}

myTest();

echo "<p>在函数外, x: $x, y: $y</p>"; // 无法获得 y 值, 得到一个 warning
echo "<p>全局变量数组: </p>";
var_dump($GLOBALS);
```

刷新缓冲区
```php
for ($i = 0; $i < 10; ++$i) {
  echo date("Y-m-d H:i:s") . "<br>";
  ob_flush();
  flush();
  sleep(1);
}

// 问题一: 时区设置
// 问题二: php 执行超时报错
```

### 字符串

```php
preg_match("/^1[3-9]\d{9}$/", $phone); // 正则 test
explode(',', $str); // 字符串 split 为数组
implode(',', $arr); // 数组 join 为字符串
```

### 数组

```php
$arr = array('one', 'two', 3);
var_dump($arr);
echo "<br>";

echo count($arr); // 长度
echo "<br>";

array_pop($arr); // 删除尾元素
array_push($arr, 'three'); // 添加尾元素
var_dump($arr);
echo "<br>";

// 关联数组
$obj = array('key1' => 'value1', 'key2' => 'value2');
```

foreach 循环
```php
$arr = array(1, 2, 3, 4);

// 遍历值
foreach ($arr as $value) {
   echo $value . "<br>";
}

// 遍历键与值
foreach ($arr as $key => $value) {
   // 可以在这里使用 $key 和 $value
}

// 修改值
foreach ($arr as &$value) {
   $value = $value * 2;
}
unset($value); // 最后取消掉引用
```

### 表单与数据库

mysqli
```php
$username = $_POST['username'];
$password = $_POST['password'];
echo $username . $password;
```

## 漏洞

文件上传漏洞
```php
if ($_FILES["file"]["error"]) {
    header("Location: file.html");
    die();
} else {
    echo "<b>Great!! Review your uploaded file from <a>here</a>.</b>";
    move_uploaded_file($_FILES["file"]["tmp_name"]);
}
```
