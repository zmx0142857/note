# webpack

上个世代最流行的打包工具; 如今, 我们推荐使用 vite.

## 快速开始

    $ pnpm i -D webpack webpack-cli webpack-dev-server html-webpack-plugin

`package.json`
```js
{
  "devDependencies": {
    "html-webpack-plugin": "^5.3.1",
    "webpack": "^5.25.1",
    "webpack-cli": "^4.10.0",
    "webpack-dev-server": "^3.11.2"
  },
  "scripts": {
    "dev": "webpack serve" // node >= 18: "set NODE_OPTIONS=--openssl-legacy-provider && webpack serve"
  }
}
```

`webpack.config.js`
```js
const Html = require('html-webpack-plugin')

module.exports = {
  mode: 'none',
  stats: 'none',
  devtool: 'source-map',
  plugins: [new Html({ title: 'dev' })],
}
```

    $ pnpm dev # 启动 dev server
