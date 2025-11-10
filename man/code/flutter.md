# flutter

flutter 是用 dart 语言进行移动 app 开发的框架.

dart 语言的 hello world 看起来像这样
```js
void printInteger(int aNumber) {
  print('The number is $aNumber.');
}

void main() {
  var number = 42;
  printInteger(number);
}
```

## Install

https://docs.flutter.dev/get-started

假设你已安装 git 和 android studio, 下面是 flutter 的安装步骤:

用 git clone 或从官网下载 zip 包, 内容是一样的:

    $ git clone https://github.com/flutter/flutter.git -b stable --depth=1

把 `flutter/bin` 加到 `PATH`, 并配置镜像:

`.bashrc`
```sh
export PUB_HOSTED_URL=https://pub.flutter-io.cn
export FLUTTER_STORAGE_BASE_URL=https://storage.flutter-io.cn
```

- 在 android studio 的 settings > languages & frameworks > android sdk 中安装 android sdk command-line tools.
- 在 android studio 或 vscode (推荐) 中安装 flutter 插件

(可选) 环境变量设置:
- 设置 `JAVA_HOME` 为 `android_studio` 目录下的 `jbr/` (注意末尾有斜杠)
- 设置 `PUB_CACHE` 目录 (默认为 `C:\Users\username\AppData\Local\Pub\Cache`)
- 设置 `GRADLE_USER_HOME` 目录 (默认为 `C:\Users\username\.gradle`)

最后, 运行环境检查程序:

    $ flutter doctor

## Quick Start

创建项目:

    $ flutter create flutter_demo

打开手机的开发者模式, 启用 usb debugger, 将手机用数据线连接至电脑, 然后运行项目:

    $ cd flutter_demo && flutter run

`lib/main.dart`
```js
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      home: HomePage(),
    );
  }
}
```

`lib/pages/home.dart`
```js
import 'package:flutter/material.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  HomePageState createState() => HomePageState();
}

class HomePageState extends State<HomePage> {
  var msg = 'Hello World';
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('HomePage')),
      body: Center(
        child: Column(
          children: [
            Text(msg),
            FilledButton(
              onPressed: () {
                setState(() {
                  msg = 'You click me'
                });
              },
              child: const Text('Click me', style: TextStyle(fontSize: 20.0)),
            ),
          ],
        ),
      ),
    );
  }
}
```

## Trouble Shooting

### 运行调试

- 手机用数据线连接到电脑后, 启用 USB debug, 但找不到设备
  - 解决: 在手机上把连接模式从「仅充电」改为「传输文件」
- Flutter App stuck at "Running Gradle task 'assembleDebug'..."
  ```
  $ cd your_flutter_project/android
  $ ./gradlew clean assembleDebug
  ```
  修改 `AndroidManifest.xml` 后, 也要重新运行 `./gradlew clean build`
- 下载 gradle 失败
  - 解决: 打开 `android/gradle/wrapper/gradle-wrapper.properties`, 查看 `distributionUrl`,
    自行下载文件 `gradle-?.?-all.zip` 到 `$GRADLE_USER_HOME` (默认 `~/.gradle`) 对应目录中.
- 运行 `./gradlew clean build` 时报错
  ```
  > Could not open settings generic class cache for settings file '...\settings.gradle'.
  > BUG! exception in phase 'semantic analysis' in source unit '_BuildScript_' Unsupported class file major version 57
  ```
  - 原因: 当前 java 版本过高, 建议降级到 java 17. [参考链接](https://dev-solve.com/zh/posts/4020157)
  - 可以用命令 `./gradlew -version` 查看 gradle 和 java 版本信息
- gradle 下载依赖过慢

  `your_flutter_project/android/build.gradle`
  ```
  repositories {
      // google()
      // mavenCentral()
      maven { url 'https://maven.aliyun.com/repository/google' }
      maven { url 'https://maven.aliyun.com/repository/jcenter' }
      maven { url 'https://maven.aliyun.com/nexus/content/groups/public' }
  }
  ```
- Unimplemented handling of missing static target
  - 重启 app, 不要使用 hot reload
- Unhandled Exception: MissingPluginException(No implementation found for method requestPermissions on channel flutter.baseflow.com/permissions/methods)
  - 重启 app, 不要使用 hot reload
- 修改 flutter.minSdkVersion
  - `flutter-sdk/packages/flutter_tools/gradle/src/main/groovy/flutter.groovy`
- 第三方库缺少命名空间
  ```
  A problem occurred configuring project ':image_gallery_saver'.
  > Could not create an instance of type com.android.build.api.variant.impl.LibraryVariantBuilderImpl.
     > Namespace not specified. Specify a namespace in the module's build file: D:\app\pub-cache\hosted\pub.dev\image_gallery_saver-2.0.3\android\build.gradle. See https://d.android.com/r/tools/upgrade-assistant/set-namespace for information about setting the namespace.
  ```
  解决:
  `android/build.gradle`
  ```
  subprojects {
    // 修复一些第三方库未添加 namespace 的问题
    afterEvaluate { project ->
        if (project.hasProperty('android')) {
            project.android {
                if (namespace == null) {
                    namespace project.group // 使用项目组名作为默认值
                    println("✅ [自动修复] 设置命名空间: ${project.group}")
                }
            }
        }
    }
  }
  ```
  [参考链接](https://juejin.cn/post/7472975606948511781)

### UI 布局

- Expanded 嵌套 Container 看不见的问题:
  - 解决: 把下面的 `child: Text('')` 换成 `child: null`
  ```
  Expanded(flex: 1, child: Container(height: 30, color: Colors.green, child: Text('')))
  ```
- Align 或其子类 Center 在未指定 widthFactor 和 heightFactor 时会占用尽可能大的空间, 例如
  ```
  Container( // 占满父容器
    color: Colors.red,
    child: const Center(
      child: Text("xxx"),
    ),
  ),
  Container( // 和子元素一样大
    color: Colors.blue,
    child: const Center(
      widthFactor: 1,
      heightFactor: 1,
      child: Text("xxx"),
    ),
  )
  ```
- 文字下方有多余的两条黄色下划线. 解决:
  ```
  Text(style: const TextStyle(decoration: TextDecoration.none))
  ```

### 其它问题

- 网络响应的 body 为空.
  - 检查响应的状态码是否为 300 ~ 399. dart http 包在遇到重定向状态码时不会自动重新请求.
