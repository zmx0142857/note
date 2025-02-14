# SVN <small>——subversion</small>

## 下载

tortoise svn 已经集成到 explorer 中, 不能在命令行下使用.  推荐使用下面两款:
- [apache subversion command line tools](http://www.visualsvn.com/downloads/)
- [silksvn](https://silksvn.com/download).

## 基础

### help - 帮助

使用 `svn help` 查看所有可用的子命令. 每个子命令都可以查看帮助, 比如 `svn add --help`

### checkout - 下载仓库到本地

    $ svn checkout --username='???' http://???

### status - 查看仓库状态

    $ alias svns='svn status'

### log - 日志

    $ alias svnl='svn log -l 5' # 最近 5 次提交
    $ svn log -r 1234 -v        # 提交详情

### diff - 比较

    $ alias svnd='svn diff > ~/tmp/diff.txt && vi ~/tmp/diff.txt' # 查看当前仓库的修改
    $ svn diff -r 1233:1234     # 版本间比较

### revert - 丢弃修改

    $ svn revert <files>
    $ svn revert --depth=infinity

### update - 拉取更新

    $ svn update

提交前最好 update 一下, 否则可能遇到 out of date 错误

### add - 添加

    $ svn add --force . # 跟踪当前目录全部文件

### rm - 移除

    $ svn rm <file> # 删除文件
    $ svn rm --keep-local <file> # 取消跟踪文件, add 的逆操作

### commit - 提交修改

    $ svn commit <files> -m 'commit message'

此命令会直接把代码推送到远程服务器. 为避免误提交, 使用如下脚本:
```sh
alias svn='hackSvn'
function hackSvn() {
    if [ "$1" == "commit" ]; then
        if [ "$2" == "-m" ]; then
          echo "please specify the files to commit"
          return
        fi
        printf "did you lint the code?  did you run svn update? "
        read ans
        if [ "$ans" != "y" ]; then
            return
        fi
    fi
    /d/app/Apache-Subversion-1.14.1/bin/svn "$@"
}
```

## 实例

### 忽略列表 ignore

写一个配置文件:

`.svnignore`
```
node_modules
dist
```

执行命令:

    $ svn propset svn:ignore -F .svnignore . # 读取配置文件, 为当前目录设置 ignore 属性
    $ svn proplist -v .
    Properties on '.':
      svn:ignore
        node_modules
        dist

现在用 `svn status` 就看不到 `node_modules` 的变化了.

### 更换远程地址 change url

    $ svn info | grep URL
    $ svn --version
    $ svn relocate <old> <new> # svn >= 1.7
    $ svn switch --relocate <old> <new> # svn < 1.7

### 回退文件到指定版本

如果修改了文件没有提交, 想放弃这些修改, 直接执行 `svn revert`

如果想查看历史版本的代码, 执行导出: `svn export -r <版本号> <版本库路径> <本地路径>`

### 补写 log 信息

https://blog.csdn.net/lc315yuhuofei/article/details/51649217

    $ svn propset svn:log 'commit message' -r <版本号> --revprop

前提是有修改 log 的权限.

### 解决冲突 resolve conflict

    $ svn resolve <filename>

然后按 `r` (mark as resolved).
