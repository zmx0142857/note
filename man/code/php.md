# PHP

## quick start

- windows: 安装 xampp 建站工具包, 它包含 apache, mysql, tomcat, perl 等工具. linux 可以安装 lampp
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
$name = "User";
?>

<p>你的名字是: <?= $name ?></p>

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
var_dump(1 == "001"); // bool(true)
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
set_time_limit(0); // 不设超时限制
date_default_timezone_set("PRC"); // 中国时区
for ($i = 0; $i < 100; ++$i) {
  echo date("Y-m-d H:i:s") . "<br>";
  ob_flush();
  flush();
  sleep(1);
}
```

字符串

```php
preg_match("/^1[3-9]\d{9}$/", $phone); // 正则 test
explode(',', $str); // 字符串 split 为数组
implode(',', $arr); // 数组 join 为字符串
```

数组

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

引入 import
```php
require_once('common.php');
include_once('common.php');
```

序列化
```php
serialize("张三");
unserialize('s:6:"张三"');

class MyClass {
    function __construct () {

    }

    // 反序列化时不会调用析构方法
    function __destruct () {

    }

    // 序列化时调用, 返回需要序列化的成员名
    function __sleep() {
        return array();
    }

    // 反序列化时调用
    function __wakeup() {

    }
}
```

> ⚠ 反序列化容易带来漏洞

## CRUD

`login.php`
```php
<form method="POST" action="index.php">
  <input name="username" />
  <input name="password" type="password" />
  <input type="submit" />
</form>

<?php
$username = $_POST['username'];
$password = $_POST['password'];
$conn = mysqli_connect('localhost:3306', 'username', 'password', 'db_name') or die('数据库连接失败');

mysqli_set_charset($conn, 'utf8'); // 设置客户端编码, 方法一
// mysqli_query($conn, 'set names utf8'); // 设置客户端编码, 方法二

$sql = "select * from user where username='$username' and password='$password'";
$res = mysqli_query($conn, $sql) or die('查询失败');
if (mysqli_num_rows($res) === 1) {
    echo "登录成功<br>";
} else {
    echo "登录失败<br>";
}
mysqli_close($conn);
?>
```
> ⚠ 上述代码存在 sql 注入风险, 比如用户可以输入 username 为 `张三'; -- '`, 只要【张三】是真实存在的用户, 就可以绕过密码检查, 直接登录张三的账号.

`list.php`
```php
$sql = "select * from article where article_id < 31";
$res = mysqli_query($conn, $sql) or die('查询失败');
$rows = mysqli_fetch_all($res, MYSQLI_ASSOC);
header("Content-Type:application/json; charset='utf-8'");
echo json_encode($rows, JSON_UNESCAPED_UNICODE); // 返回 json
```

`detail.php`
```php
$id = $_GET['id'];
$sql = "select * from article where article_id=$id";
$res = mysqli_query($conn, $sql) or die('查询失败');
$rows = mysqli_fetch_assoc($res);
```
> ⚠ 同样存在 sql 注入风险, 用户可以输入 `?id=1 or 1=1` 查询所有用户数据

文件上传

`index.html`
```html
<form action="upload.php" method="post" enctype="multipart/form-data">
  <input type="file" name="files" required title="选择一个文件"/>
  <input type="submit" value="提交" />
</form>
```

`upload.php`
```php
if (!isset($_FILES["files"])) die("缺失字段: files");
$file = $_FILES["files"];
$file["error"] and die("上传失败");
$path = "./upload/" . $file["name"];
// 调用前确保同级目录下存在 upload 子目录
move_uploaded_file($file["tmp_name"], $path) or die("保存失败");
echo "<a href='$path'>Download</a>";
```

> ⚠ 上述文件上传代码存在漏洞

cookie/session
```php
if (登录成功) {
    // 分配 session id, 保存在 xampp/tmp 目录中
    session_start(); // 使用 $_SESSION 变量前, 要先调用 session_start
    $_SESSION['isLogin'] = '1';
    $_SESSION['username'] = $username;
}
```

登录成功后, http 响应头含有 `Set-Cookie: PHPSESSID=????????????; path=/`.
这里 `path=/` 表示 cookie 的作用域是 `htdocs` 这个网站的根目录.

> ⚠ cookie/session 机制存在安全漏洞, 如 cookie 欺骗

## ThinkPHP

主流 php 框架: think php, laverel php, zend framework

- 先下载安装 php 依赖管理器 [composer](https://getcomposer.org), 并指定 php.exe 路径
- 配置国内镜像
  ```sh
  $ composer config -g repo.packagist composer https://mirrors.aliyun.com/composer/
  ```
- 基于 thinkphp 创建项目
  ```sh
  $ composer create-project topthink/think thinkphp-demo
  ```
- 修改 `xampp/apache/conf/httpd.conf`, 让服务根目录指向新创建的项目
  ```
  #DocumentRoot "xampp/htdocs"
  DocumentRoot "thinkphp-demo/public"
  ```
- 安装 think-view 模板引擎
  ```sh
  $ cd thinkphp-demo
  $ composer require topthink/think-view
  ```

目录结构
```txt
.
|- app
|  |- controller // 处理请求
|  `- model   // 实体类
|- public     // 网站根目录
|- route      // 定义路由, 把 url 地址对应到某个 controller 的某个方法
`- view       // 存放 html 页面, 在 controller 中通过 view('../view/some.html') 载入
```
