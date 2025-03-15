# 网络

## 内网穿透

假设你拥有两台服务器:
- 公网服务器: 具有公网 IP 地址;
- 内网服务器: 位于内网, 没有公网 IP 地址.

现在想要在内网服务器部署一个 web 服务, 使它在外网可访问. 使用 frp 实现内网穿透, 步骤如下:

- 暂时关闭杀毒软件, 下载最新版本的 [frp](https://github.com/fatedier/frp/releases).
- frp 分为服务端 frps 与客户端 frpc 两部分.
- 登陆云服务器网页端控制台, 或者通过 `ufw`, `firewall-cmd` 等命令, 配置公网服务器的防火墙, 确保开启 `80` 与 `7000` 端口的 TCP 通信.
- 公网服务器配置:
  ```toml
  # frps.toml
  bindPort = 7000 # 用于 frp 内部通信
  ```
  启动:
  ```sh
  $ ./frps -c ./frps.toml
  ```
  你可以用 `screen` 或 `nohup` 等命令让 frp 保持后台运行.
- 内网服务器配置:
  ```toml
  # frpc.toml
  serverAddr = "x.x.x.x" # 公网服务器的 IP 地址
  serverPort = 7000 # 与 frps.toml 的 bindPort 相同

  [[proxies]]
  name = "my-service"
  type = "tcp"
  localIP = "127.0.0.1"
  localPort = "8080" # 内网服务器上的 web 服务端口
  remotePort = "80" # 暴露到外网的端口
  ```
  启动:
  ```sh
  $ ./frpc -c ./frpc.toml
  ```
- 在外网通过浏览器访问: `http://x.x.x.x:80`
