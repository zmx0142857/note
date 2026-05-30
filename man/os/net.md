# 网络

## 小知识

- `127.0.0.1` 与 `0.0.0.0` 的区别是, 前者只允许本设备访问, 后者允许所有设备访问.
- 网络协议的 5 层模型: 物理层, 数据链路层 (mac 地址), 网络层 (IP 协议), 传输层 (TCP/UDP 协议), 应用层 (http, ftp 协议等)
- http 协议族包含 http, https, websocket, hls (音视频 m3u8), soap (web service) 等
- 标准的 http web 服务器: apache, nginx, tomcat, iis 等

## 小工具

抓包
- [fiddler classic](https://www.telerik.com/fiddler/fiddler-classic): http 协议族监控
- [wireshark](https://www.wireshark.org/download/win64/) + [npcap](https://npcap.com/#download): 全流量监控

虚拟组网
- tailscale
- zerotier

## socket - TCP/UDP 连接

TCP 实现全双工通信 (即两边都能收发消息):

`client.py`
```py
import socket


# 默认 TCP 协议. UDP 需指定 type=socket.SOCK_DGRAM
with socket.socket() as s:
    addr = ('127.0.0.1', 9999)
    s.connect(addr)
    while True:
        data = input('> ').encode()
        s.send(data)
        data = s.recv(1024).decode()
        print(data)
```

`server.py`
```py
import socket

with socket.socket() as s:
    addr = ('127.0.0.1', 9999)
    s.bind(addr)
    s.listen()
    print('[server] %s:%s' % addr)
    while True:
        channel, addr = s.accept()
        tag = '[client] %s:%s' % addr
        print(tag, 'connected')
        while data := channel.recv(1024):
            data = data.decode()
            print(tag, data)
            channel.send(data.replace('吗？', '！').encode())
        channel.close()
        print(tag, 'closed')
```

首先启动 `server.py`, 然后运行 `client.py`, 在服务端日志如下
```txt
[server] 127.0.0.1:9999
[client] 127.0.0.1:58038 connected
```

用下面命令可以看到服务端正在运行:
```sh
$ netstat -ant | grep 9999
```

使用 wireshark 抓包 `tcp.port==9999`, 可以清楚看到通信过程:
```txt
# 三次握手
58038 → 9999 [SYN]
9999 → 58038 [SYN, ACK]
58038 → 9999 [ACK]

# 数据发送
58038 → 9999 [PSH, ACK] Data: e4bda0e5a5bd68656c6c6f // 你好hello

# 四次挥手
58038 → 9999 [FIN, ACK]
9999 → 58038 [ACK]
9999 → 58038 [FIN, ACK]
58038 → 9999 [ACK]
```

> accept 是阻塞函数, 上面的代码在第一个客户端断开前, 无法处理第二个客户端的请求.
> 为了同时处理多个请求, 在服务端可以使用多线程:
> ```py
> from threading import Thread
>
> def handle_request(channel, addr):
>     # 处理请求...
>
> channel, addr = s.accept()
> t = Thread(target=handle_request, args=(channel, addr))
> t.start()
> ```
> 同理, 在收到服务器响应前, 客户端无法继续发送消息, 此问题也可以用多线程解决.
> 最后, recv, send 可能抛出异常, 最好做 try-except 处理.

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
