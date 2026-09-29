# 微信小程序

## 应用

- 小程序视频截帧方案
  ```js
  const decoder = wx.createVideoDecoder()
  await promise(decoder.start({ source, mode: 1 }))
  await decoder.seek({ time })
  await sleep(50)
  const { data, width, height } = decoder.getFrameData()

  const imageData = ctx.createImageData(width, height)
  imageData.data.set(data)
  ctx.putImageData(imageData)
  ```

## Troubleshoot

- `scroll-view` 内部的 `position: fixed` 失效, 被降级为 `position: absolute`.
  - 解决: 使用 `root-portal` 将内部组件传送到外部
- wx.uploadFile 可以高效上传单个文件, 但不支持多文件以及文件字段混合的 form-data
  使用 wx.uploadFile 上传文件, 模拟器的网络一栏会提示 "provisional headers
  are shown", 不显示文件字段.  而使用手搓的 form-data 则正常.
- wx.downloadFile 返回的 header 字段在不同平台上结构不同: 在模拟器和 Android 手机上, 它形如
  ```
  header: {
    "Content-Type": "value"
  }
  ```
  但在 iOS 端它形如
  ```
  header: {
    "Content-Type": ["value"]
  }
  ```
- 模拟器中虽然有 TextEncoder, 但手机环境中没有, 请务必添加 polyfill.
