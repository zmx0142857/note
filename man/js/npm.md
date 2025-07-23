# npm

## nvm

nodejs 版本管理器

- linux: `sudo pacman -S nvm`;
- windows: 下载 nvm for windows, 然后运行 `nvm-init.exe`.

```sh
$ nvm ls            # 列出可用 nodejs 版本
$ nvm install ?.?.? # 安装指定版本的 nodejs
$ nvm install --lts # 安装长期支持版 nodejs
$ nvm use ?.?.?     # 切换到指定版本
```

## npm

config
```sh
$ npm config set cache /d/app/npm/npm-cache
$ npm config set prefix /d/app/npm/npm-global # 全局包的位置, 可以不设置
$ npm config set registry https://registry.npmmirror.com -g # 镜像加速
$ npm config set registry https://registry.npmjs.org/ -g # 官网
```

publish
```sh
$ npm publish --registry=https://registry.npmjs.org --access public # 发布自己的包到公共域
```

## yarn

config
```sh
$ yarn cache dir
$ yarn cache clean # 清除缓存
$ yarn config set cache-folder /d/app/npm/yarn-cache
```

## pnpm

config
```sh
$ pnpm config set store-dir /d/app/npm/pnpm-store
$ pnpm config set cache-dir /d/app/npm/pnpm-cache
$ pnpm config set global-dir /d/app/npm/pnpm-global # 全局包的位置, 可以不设置
$ pnpm config set global-bin-dir /d/app/npm/pnpm-global/bin # 全局包可执行程序的位置, 可以不设置
```

## pm2

后台进程管理

```sh
$ npm i pm2 -g
$ pm2 install pm2-logrotate         # 日志分割插件, 默认每个应用每天一个文件
$ pm2 set pm2-logrotate:retain 365  # 保留 365 个日志文件
$ pm2 start app.js -n myapp         # 启动应用, 指定名字为 myapp
$ pm2 start ./server -- arg1 arg2   # 给 server 程序传参 arg1 arg2
$ pm2 stop/reload/restart/delete <name> # 管理应用
$ pm2 log <name> --n 300            # 查看日志, 显示最后 300 行
```

> pm2 日志默认保存在 `~/.pm2/logs`

## 其它

增大 node 可用内存
```sh
NODE_OPTIONS='--max-old-space-size=8192'
```

项目路径别名
`jsconfig.json`
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["*"]
    }
  }
}
```
