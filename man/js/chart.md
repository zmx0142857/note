# Chart

## @ant-design/charts

Web 端图表库, 适配 react 框架

[1.x文档](https://ant-design-charts-v1.antgroup.com/examples)

- 图表在缩放状态下, 导致鼠标位置偏移. 解决:
  ```js
  const config = {
    data: [],
    supportCSSTransform: true,
  }
  ```

- 图表数据显示异常:
  y 轴数据类型必须是 `Number`, 不可以用 `String`.

- 图表指针悬停交互异常:
  x 轴数据类型建议用 `String`, 除非是连续型数据, 这时可以用 `Number`.

- 整数单位刻度: `yAxis.tickInterval = 1`

- 文字标签旋转
  ```js
  xAxis: {
    label: {
      autoHide: false,
      autoEllipsis: false,
      autoRotate: true,
      // rotate: -Math.PI / 4,
      // offset: 20,
    },
  }
  ```

- 渐变色
  ```js
  color: ({ type }) => {
    if (type === '10-30分' || type === '30+分') {
      return 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
    }
    return brandColor;
  },
  ```

## @antv/f2

移动端图表库

[官方文档](https://f2.antv.antgroup.com/examples/)

- 文字标签旋转
  ```js
  jsx(Axis, {
    field: 'label',
    style: {
      labelOffset: 20,
      label: {
        rotate: -Math.PI / 4,
        textAlign: 'end',
        textBaseline: 'top',
      },
    },
  }),
  ```
