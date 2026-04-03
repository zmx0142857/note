# 微信小程序

## Troubleshoot

- `scroll-view` 内部的 `position: fixed` 失效, 被降级为 `position: absolute`.
  - 解决: 使用 `root-portal` 将内部组件传送到外部
