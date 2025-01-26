# Linux

## 包管理器

### pacman

archlinux 的包管理器.

镜像源

    $ cd /etc/pacman.d
    $ sudo rankmirrors -n 5 mirrorlist.pacnew > mirrorlist # 将速度前 5 的源加到 mirrorlist 文件
    $ sudo pacman -Syy # 刷新源

使用 archlinuxcn 镜像

`/etc/pacman.conf`
```
[archlinuxcn]
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/$arch
```

    $ sudo pacman -Sy archlinuxcn-keyring # 安装 GPG key
    $ sudo pacman -Sy # 刷新源

查找

    $ pacman -Ss <package>  # 在线搜索
    $ pacman -Qs <package>  # 本地搜索

安装

    $ sudo pacman -S <package>          # 安装
    $ sudo pacman -Sy <package>         # 安装, yes
    $ sudo pacman -S --needed <package> # 若已安装则忽略

清理

    $ pacman -R <package>               # 移除包
    $ pacman -Ru <group>                # 移除不被其它包依赖的包
    $ sudo pacman -R `pacman -Qdtq`     # 自动移除不需要的包

升级系统

    $ sudo npm -g remove npm            # 先干掉这个麻烦精
    $ sudo pacman -Sy archlinux-keyring # 安装最新的 GPG key, (或者 archlinuxcn-keyring)
    $ sudo pacman -Syu                  # 升级系统
    $ sudo find /etc -path '*.pacnew'   # 寻找所有新配置文件, 按需更新

降级

参考: https://wiki.archlinux.org/index.php/downgrading_packages

pacman 会把老的包放在 `/var/cache/pacman`, 例如:

    $ sudo pacman -U /var/cache/pacman/openssh-7.7p1-2-x86_64.pkg.tar.xz

### 其它

- `pip`: python 默认包管理器
- `npm`: nodejs 默认包管理器
- `gradle`, `maven`: java 包管理器
- `wget`, `curl`: 命令行下载器
- `area2c -s 10 http://...`: 多线程下载
- `qbittorrent`: 图形界面的种子下载器
- `scoop`: windows 的包管理器

## 系统

文字处理

- `awk`: column editing language
- `sed`: line streaming editing language
- `sort`: sort lines based on column
- `uniq`: remove repeated lines
- `tee`: print to stdout and a file
- `iconv`: 编码转换

文件

    $ trash                      # 命令行版本的回收站
    $ find <path> -path '*.jpg'  # 查找路径下的指定文件
    $ grep -R 'keyword'          # 在当前路径下的所有文件中, 查找指定内容
    $ sha256sum                  # 计算文件 hash
    $ zip, unzip                 # 压缩与解压

内存

    $ free -h       # 查看内存占用
    $ ps -ef        # 查看全部进程
    $ jobs          # 查看当前终端下的任务
    $ lsof -i:9999  # 查看端口占用

磁盘

    $ df -h         # 查看磁盘占用
    $ df -T         # 查看文件系统类型
    $ lsblk         # 查看磁盘分区
    $ cfdisk        # 友好的交互式磁盘分区工具
    $ mount         # 挂载分区, 比如 u 盘
    $ umount        # 取消挂载分区

系统信息

    $ screenfetch       # 显示系统信息及终端字符画
    $ lspci             # 查看硬件信息
    $ lscpu             # 查看 CPU 信息
    $ nvidia-smi        # 查看显卡信息 (N卡)
    $ getconf LONG_BIT
    $ uname -a
    $ lsb_release -a

## 网络

    $ ifconfig | grep inet   # 本机 ip 地址
    $ ping <ip地址>          # 检查能否连接到目标 ip
    $ nslookup www.baidu.com # 域名解析
    $ iptables               # 查看防火墙配置

局域网扫描

    $ nmap -sP 192.168.1.0/24
    $ arp | grep ether

## 远程

### ssh

全称 Secure SHell, 是连接到远程计算机的常用方式.  ssh 的用户配置默认位于 `~/.ssh`.

**初始化**: 在客户端生成自己的 ssh 密钥对, 由一个公钥 (`.pub`) 和一个私钥 (没有后缀名) 组成.

    $ ssh-keygen

**授权**: 将生成的公钥拷贝到服务器上, 添加到 `authorized_keys` 文件中. 这样以后就可以用客户端访问服务器

    $ cat id_ed25519.pub >> ~/.ssh/authorized_keys
    $ chmod 700 ~/.ssh                  # 文件权限设置
    $ chmod 600 ~/.ssh/authorized_keys

**设置别名**

`~/.ssh/config`
```
# potato 是一个别名
Host potato
    Hostname 192.168.?.?
    User fran
    Port 22
```

**登录**

    $ ssh <username>@<ip> -p <port>            # 登录远程计算机, port 默认是 22
    $ ssh <host>                               # 以别名登录远程计算机
    $ scp <local_path> <host>:<remote_path>    # 利用 ssh 拷贝文件
    $ sftp <host>                              # ssh 文件传输协议

**禁用密码登录**

`/etc/ssh/sshd_config`
```
PasswordAuthentication no
```

### ftp

file transfer protocol

服务端

    $ sudo apt install vsftpd
    $ sudo service vsftpd start

客户端

    $ sudo pacman -S lftp

- `beyond compare`: windows 端支持 ftp 的文件比较工具

### 其它

- `gvfs-mtp`: mtp 媒体传输协议
- `rdesktop`: 桌面远控
- todesk, 向日葵: windows 端桌面远控软件

## 多媒体

- `feh`: 终端下查看图片
- `magick`: 图片处理工具
- `ffmpeg`: 视频处理工具
- `vlc`, `mpv`, `totem`: 视频播放器
- `timidity`, `timidity-interfaces-extra`: midi 播放器

## 公式图表

    $ dot -Tsvg S3.dot > S3.svg         # 矢量图, 关系图绘制
    $ xelatex                           # 传统数学排版软件
    $ typst                             # 新兴数学排版软件

## Shell


循环语句

    $ for f in *;
    > do ls "$f";
    > done
