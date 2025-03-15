# NodeJS

## express

文件上传 express-fileupload

    $ npm i express cors express-fileupload

```js
import express from 'express'
import cors from 'cors'
import fileUpload from 'express-fileupload'

const app = express()

app.use(cors())
app.use(fileUpload({ createParentPath: true }))
app.use(express.json())
app.use('/img', express.static('img')) // 需要在 js 的同级目录新建一个 img 文件夹
app.post('/upload', (req, res) => {
  console.log(req.body, req.files)

  if (!req.files || !req.files.imgs || !req.files.imgs.length) {
    return res.status(400).json({ code: 400, msg: 'imgs are required' })
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
  res.status(200).json({
    code: 200,
    msg: 'ok',
    data,
  })
})

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>文件分享</title>
</head>
<body>

<form action="/upload" method="post" enctype="multipart/form-data">
  <input type="file" name="imgs" id="file" multiple>
  <input type="submit" value="提交">
</form>

</body>
</html>
`)
})

app.listen(3001, () => {
  console.log('server is running at port 3001')
})
```
