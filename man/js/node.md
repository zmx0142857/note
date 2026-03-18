# NodeJS

## http 服务

### http + fs

经典的 SPA (single page application)

```js
const http = require('http')
const fs = require('fs')
const port = 1234

http.createServer((req, res) => {
  const { url } = req
  console.log('url', url)
  fs.promises.readFile('.' + url, 'utf-8').then(content => {
    if (url.endsWith('.js')) {
      res.writeHead(200, {
        'Content-Type': 'text/javascript'
      })
    } else if (url.endsWith('.css')) {
      res.writeHead(200, {
        'Content-Type': 'text/css'
      })
    }
    res.end(content)
  }).catch(err => {
    fs.promises.readFile('index.html', 'utf-8').then(content => {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
      })
      res.end(content)
    })
  })
}).listen(port, () => {
  console.log('Server listening on: http://localhost:%s', port)
})
```

注: 使用 [vercel/serve](https://github.com/vercel/serve) 可以达到同样效果:
```sh
$ npm i -g serve
$ serve -s -L -l 1234 &
```

### express

文件上传 express-fileupload

    $ npm i express cors express-fileupload

```js
import express from 'express'
import cors from 'cors'
import fileUpload from 'express-fileupload'

const page = (html) => `
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>文件分享</title>
</head>
<body>
${html}
</body>
</html>`

const app = express()
app.use(cors())
app.use(fileUpload({ createParentPath: true }))
app.use(express.json())
app.use('/img', express.static('img')) // 需要在 js 的同级目录新建一个 img 文件夹
app.post('/upload', (req, res) => {
  console.log(req.body, req.files)
  if (!req.files || !req.files.imgs) {
    // return res.status(400).json({ code: 400, msg: 'imgs are required' })
    return res.send(page(`<p>请选择一个或多个文件</p><a href="/">返回</a>`))
  }
  let { imgs } = req.files
  if (!Array.isArray(imgs)) imgs = [imgs]
  const data = []
  imgs.forEach(file => {
    file.mv('./img/' + file.name)
    data.push({
      name: file.name,
      mimetype: file.mimetype,
      size: file.size,
    })
  })
  // res.status(200).json({ code: 200, msg: 'ok', data })
  res.send(page(`<p>上传成功!</p><a href="/">返回</a>`))
})

app.get('/', (req, res) => res.send(page(`
<form action="/upload" method="post" enctype="multipart/form-data">
  <input type="file" name="imgs" id="file" multiple required title="选择一个或多个文件"/>
  <input type="submit" value="提交" />
</form>
`)))

app.listen(3001, () => console.log('server is running at port 3001'))
```

## 爬虫

下载图片: 在浏览器中将网络请求复制为 fetch, 拷贝 headers, 然后用下面的代码自动下载.
```js
const download = async ({ url, filename, headers }) => {
  const buf = await fetch(url, { headers }).then(res => res.arrayBuffer())
  return fs.promises.writeFile(filename, new Uint8Array(buf))
}
```
