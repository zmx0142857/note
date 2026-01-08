# Git

[在线教学](https://learngitbranching.js.org/)

## 基础

### 安装

    $ scoop install git

### 配置

    $ git config --global core.autocrlf false
    $ git config --global user.email "you@example.com"
    $ git config --global user.name "Your Name"

### 创建仓库

    $ cd my-dir
    $ echo 'test' > README.md # 生成测试文件
    $ echo 'node_modules' > .gitignore # 让 git 忽略一些文件

    $ git init   # 在当前目录下初始化 git 仓库, 生成一个 .git 子目录
    $ git status # 查看仓库状态, 未添加的文件显示为红色
    $ alias gits='git status' # 设置别名

### 添加 - add

    $ git add .  # 把当前目录下所有文件加入 git 暂存区
    $ gits       # 查看仓库状态, 已添加的文件显示为绿色

### 提交 - commit

    $ git commit -m 'commit message' # 提交暂存区的文件, 并附加一条信息
    $ git commit -am 'commit message' # 快速提交: 添加当前目录所有文件并提交
    $ git commit --amend # 修改最近一次提交的信息

> 每次提交可以视为版本树中的一个节点.

### 修改

    $ vim README.md # 修改文件
    $ gits          # 查看仓库状态, 已修改的文件显示为红色
    $ git diff      # 比较修改前后的文件, 显示增加和减少的行
    $ git difftool --tool=vimdiff # 使用 vimdiff 比较文件, 也可以使用 --tool=vscode
    $ git add README.md
    $ git diff --staged README.md # 比较已添加的文件, 需要加 --staged
    $ git commit -m 'edit README.md'

### 日志 - log

    $ git log       # 查看提交记录, 每个 commit 都带有一个唯一编码 (hash)
    $ git log --graph --pretty=oneline --abbrev-commit # 自定义提交记录的显示方式
    $ git reflog    # 操作记录

### 比较 - diff

    $ git diff <filename>           # 比较修改前后的文件
    $ git diff --staged <filename>  # 比较已添加的文件
    $ git diff <filename> <hash>    # 将文件与指定版本进行比较

    $ git show                      # 与上一个提交比较
    $ git diff --name-only          # 比较时只显示文件名

## 回退

### 还原 - restore

    $ git restore README.md          # 已修改未添加时, 将文件还原到修改前的状态
    $ git restore --staged README.md # 已添加未提交时, 将文件还原到未添加的状态

### 回退版本

    $ git diff README.md <hash>     # 将指定文件与历史版本比较, 一般只需输入 hash 的前几位即可

    $ git reset --hard <hash>       # 将整个仓库回退到指定版本
    $ git reset <hash>              # 只回退版本库, 本地文件不变

### HEAD

HEAD 是版本树上的一个指针, 通常指向当前版本

    $ cat .git/HEAD                 # 查看 HEAD 指向
    $ git symbolic-ref HEAD         # HEAD 指向一个引用时, 可以这样查看指向
    $ git reset --hard HEAD^        # 回退一个版本
    $ git reset --hard HEAD~100     # 回退 100 个版本

    $ git revert HEAD               # 在 HEAD 后面新增一个提交, 文件内容回退到上一个提交的状态

> 注意区别: revert 的参数是 `HEAD` 而不是 `HEAD^`

## 分支

### 创建

    $ git branch <name> && git switch <name>  # 创建并切换到新分支
    $ git checkout -b <name>                  # 同上
    $ git branch                              # 查看所有分支
    $ git branch <name> <hash>                # 在指定版本处创建一个分支

### 移动

    $ git branch -f main HEAD~3 # 将 main 分支强制指向 HEAD 往前数 3 个版本

### 删除

    $ git branch -d <name>

### 合并 (方法一): merge

下面的命令将创建一个新提交, 其两个 parent 节点分别是 A 和 B, 然后移动 A 指针使它指向新提交.

    $ git switch A
    $ git merge B

### 合并 (方法二): rebase

rebase 将提交从一个分支拷贝到另一个分支上, 不会出现一个节点有两个 parent 的情形. 这样得到的版本树更加线性、简洁.

    $ git rebase A B    # 把 B 提交拷贝到 A 提交的后面. B 的默认值为 HEAD

> 注意 `git rebase A B` 的方向是 A ← B

案例: 使用 rebase

    $ git switch bugfix # 在新分支上完成工作
    $ git rebase main   # 把完成的工作拷贝到 main
    $ git switch main
    $ git rebase bugfix # 更新 bugfix 分支, 让它和 main 同步

交互式 rebase

    $ git rebase -i <hash>  # 对指定版本以后的所有提交进行重排、筛选、合并

### 合并 (方法三): cherry-pick

    $ git cherry-pick <hash1> <hash2> <hash3> # 将一些提交复制到 HEAD 提交的下面

## 远程

### 克隆 - clone

    $ git clone https://github.com/<user>/<repo>    # 用 https 克隆
    $ git clone git@github.com:<user>/<repo>.git    # 如果是自己的仓库, 可以用 ssh 克隆
    $ git clone <url> --depth=1                     # 只克隆最新一个版本, 这通常会快一些

### 远程管理 - remote

    $ git remote add origin <url>   # origin 是默认的远程地址别名
    $ git remote remove origin
    $ git remote show origin        # 查看远程分支
    $ git remote -v                 # 查看所有远程分支

### 推送 - push

在 github 上创建自己的仓库, 然后:

    $ git remote add origin git@github.com:<user>/<repo>.git
    $ git push -u origin main # -u 的全称是 --set-upstream, 意思是将当前分支与远程 origin 的 main 分支相关联

以后的推送只需使用 `git push` 即可.

### 拉取 - pull

    $ git pull <remote> <branch>    # 拉取远程分支, 例如 git pull origin main

- 如果当前分支已经与远程分支关联, 则远程名与分支名都可以省略, 直接 `git pull` 拉取即可
- `git pull` 是 `git fetch; git merge` 的简写
- `git pull --rebase` 是 `git fetch; git rebase` 的简写

### 标签 - tag

    $ git tag v1.0.0 <hash>
    $ git tag -a <name> -m 'tag message'    # 给最新的 commit 上打一个标签
    $ git push origin <name>                # 将标签推送到远程

### 更多远程操作

新建分支, 使其跟踪远程分支

    $ git checkout -b foo origin/foo

将远程分支与本地分支关联

    $ git branch -u origin/foo foo

推送本地指定分支到远程指定分支

    $ git push origin <local-branch>:<remote-branch>

git fetch 的参数与 push 相似

    $ git fetch origin <remote-branch>:<local-branch>

push 空与 fetch 空

    $ git push origin :foo # 删除远程的 foo 分支
    $ git fetch origin :bar # 在本地创建一个新分支 bar

## 其它话题

### 找回丢失的 commit

    $ git fsck --lost-found # 找回的内容在 .git/lost-found 中

### git submodule

    $ git submodule init
    $ git submodule update

### git lfs - large file support

    $ git lfs install
    $ git lfs track '*.jar'
    $ git lfs track '*.so'
    $ git lfs track '*.png'
    $ git add .gitattributes

### github actions

使用 github action 部署应用

- 编写 `.github/workflows/actions.yml`, 可以参考网上的代码
- Settings > Actions > General, 将 `secrets.GITHUB_TOKEN` 的 permissions 改为 read and write
- 由于 dist 目录被 .gitignore 忽略, 无法部署, 所以要拷贝到另外的目录中, 例如:
  ```yaml
  run: pnpm install && pnpm build && mkdir -p build && cp -r dist index.html index.css jianpu.css build
  ```

## 案例

### fork 仓库与原仓库的同步

在 github 上 fork 一个仓库, 一段时间后原仓库有新的提交, 想要合并到 fork 的分支上, 可以这样做:

    $ git remote add upstream <原仓库url> # 添加一个远程分支, 命名为 upstream
    $ git fetch upstream            # 下载 upstream 远程分支, 但先不合并
    $ git switch main
    $ git merge upstream/main       # 将 upstream/main 合并到本地的 main 分支
    $ git push                      # 推送到 github 上的 fork 仓库中

这样一来, fork 仓库与原仓库就保持同步了.

### 合并多个 commit

假设前后有 3 个 commit, hash 值分别是 111, 222 和 333

```sh
$ git log # 查看提交记录
commit 333333 (HEAD -> main)
    third commit
commit 222222
    second commit
commit 111111
    init
$ git rebase -i --onto 111111 main # 把后面的两个提交合并到第一个提交
```

git 会打开 vim, 编辑信息如下：
```text
pick 111111
fixup 222222
fixup 333333
```

- pick 表示使用这个 commit
- fixup 表示使用这个 commit, 但丢弃 log 信息.

退出编辑, 执行 `git rebase --continue` 完成 rebase.

如果想修改最近一次提交的信息, 可以用 `git commit --amend`.

另外注意, 由于这些修改丢弃了一些 commit, 所以是无法成功推送至远程的. 除非使用 `git push -f` (不推荐).

### 代理 - proxy

http(s) 代理
```
$ git config --global http.proxy http://127.0.0.1:8080 # 或者 socks5://
$ git config --global https.proxy http://127.0.0.1:8080 # 或者 socks5://
$ git config --list
```

ssh 代理

`~/.ssh/config`
```
Host github.com
    User git
    ProxyCommand connect -S 127.0.0.1:1080 %h %p
```
