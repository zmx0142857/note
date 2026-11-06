# Agent

Skills, Agent & Harness

## Pi

[Pi](https://pi.dev) is a minimal agent harness

    $ npm install -g --ignore-scripts @earendil-works/pi-coding-agent
    $ pi install git:github.com/NVlabs/SoL-Pi # 省 token 插件

```bash
$ cd my-work-dir
$ pi --continue # 继续上次会话
```

Pi 常用命令
```
/resume   # 打开会话列表
/name     # 为当前会话命名
/fork     # 会话分支
/model    # 选择模型
/thinking # 思考强度
/quit     # 退出
```

快捷键
```
enter         # 发送提示词
alt+enter     # 排队发送提示词
shift+enter   # 换行, 部分终端可能不支持
ctrl+t        # 显示/隐藏思考过程
ctrl+o        # 显示/隐藏工具调用输出
@             # 指定文件. 如果终端支持, 也可以用鼠标拖动文字或文件名到输入框中
```

### skill

Pi 可以读取全局 skill: `~/.agents/skills/<skill-name>`

指定当前会话加载哪些 skill, 可以使用 `-ns` (相当于 `--no-skills`) 结合 `--skill`:
```bash
pi -ns --skill ~/.agents/skills/<skill-name>
```
禁止模型自动调用 skill, 可以指定 `disable-model-invocation: true`:

`SKILL.md`
```yaml
---
name: ...
description: ...
disable-model-invocation: true
---
```
修改 `SKILL.md` 后, 在会话中输入 `/reload` 生效.
模型虽不会自动调用 skill, 但可以用 `/skill:<skill-name>` 手动加载它.
