;(function(){

'use strict'
function getDefault(val, defaultVal) {
  if (val !== undefined) return val
  return defaultVal
}

function Plot(el, config={}) {
  this.canvas = document.getElementById(el)
  this.ctx = this.canvas.getContext('2d')
  this.ctx.font = "12px sans-serif"
  this.color = getDefault(config.color, '#337ab7')

  this.step = getDefault(config.step, 5e-3)
  this.padding = 10
  this.geometry(config)
}

Plot.colors = {
  blue: '#337ab7',
  darkBlue: '#23527c',
  green: '#3c763d',
  lightGreen: '#dff0d8',
  yellow: '#8a6d3b',
  red: '#a94442',
}

Plot.prototype.geometry = function(config) {
  this.xmin = getDefault(config.xmin, -5)
  this.ymin = getDefault(config.ymin, -1)
  this.xmax = getDefault(config.xmax, 5)
  this.ymax = getDefault(config.ymax, 5)
  this.xscale = (this.canvas.width-2*this.padding) / (this.xmax-this.xmin)
  this.yscale = (this.canvas.height-2*this.padding) / (this.ymax-this.ymin)
  if (config.keepRatio) {
    this.xscale = this.yscale = Math.min(this.xscale, this.yscale)
  }
  return this
}

// 另一种方案是用 css transform: scaleY(-1); 实现上下翻转；
// 问题是，文字也会倒转，这可以用 ctx.scale(1, -1) 补救
Plot.prototype.transform = function(x, y) {
  return [(x-this.xmin)*this.xscale+this.padding, (this.ymax-y)*this.yscale+this.padding]
}

Plot.prototype.moveTo = function(x, y) {
  this.ctx.moveTo(...this.transform(x, y))
  return this
}

Plot.prototype.lineTo = function(x, y) {
  this.ctx.lineTo(...this.transform(x, y))
  return this
}

Plot.prototype.line = function(x0, y0, x1, y1) {
  this.ctx.beginPath()
  this.moveTo(x0, y0)
  this.lineTo(x1, y1)
  this.ctx.stroke()
  return this
}

Plot.prototype.text = function(text, x, y) {
  this.ctx.fillText(text, ...this.transform(x, y))
  return this
}

Plot.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  return this
}

function getProperTick(range, pixels) {
  const tick = range * 80 / pixels // 80px per tick
  const properTick = Math.pow(10, Math.floor(Math.log10(tick)))
  const ratio = tick / properTick
  // tick 的大小总是 2, 5, 10 这样的数字
  return properTick * (
    ratio > 4
    ? (ratio > 8 ? 10 : 5)
    : (ratio > 1.5 ? 2 : 1)
  )
}

Plot.prototype.axis = function(config) {
  config = config || {}
  config.xtick = config.xtick || getProperTick(this.xmax-this.xmin, this.canvas.width)
  config.ytick = config.ytick || getProperTick(this.ymax-this.ymin, this.canvas.height)
  config.xlabel = config.xlabel || config.xtick
  config.ylabel = config.ylabel || config.ytick

  var origin = this.transform(0, 0)
  this.ctx.strokeStyle = 'black'
  // x 轴
  this.ctx.beginPath()
  this.ctx.moveTo(0, origin[1])
  this.ctx.lineTo(this.canvas.width, origin[1])
  this.ctx.stroke()
  // y 轴
  this.ctx.beginPath()
  this.ctx.moveTo(origin[0], 0)
  this.ctx.lineTo(origin[0], this.canvas.height)
  this.ctx.stroke()

  function myceil(x, step) {
    return Math.ceil(x / step) * step
  }
  // TODO round the labels
  function myround(x) {
    return Math.round(x * 100) / 100
  }
  // 刻度
  for (var x = myceil(this.xmin, config.xtick); x <= this.xmax; x += config.xtick) {
    if (x !== 0) {
      this.line(x, 0, x, 4/this.yscale)
    }
  }
  for (var y = myceil(this.ymin, config.ytick); y <= this.ymax; y += config.ytick) {
    if (y !== 0) {
      this.line(0, y, 4/this.xscale, y)
    }
  }
  // 标签
  for (var x = myceil(this.xmin, config.xlabel); x <= this.xmax; x += config.xlabel) {
    this.ctx.save()
    if (x !== 0) {
      this.ctx.translate(-2, 12)
      this.text(''+x, x, 0)
    } else {
      this.ctx.translate(4, 12)
      this.text(''+x, x, 0)
    }
    this.ctx.restore()
  }

  this.ctx.save()
  this.ctx.translate(6, 4)
  for (var y = myceil(this.ymin, config.ylabel); y <= this.ymax; y += config.ylabel) {
    if (y !== 0) {
      this.text(''+y, 0, y)
    }
  }
  this.ctx.restore()
  return this
}

// plot discretely
Plot.prototype.discrete = function(f, config={}) {
  var xmin = this.xmin - this.padding / this.xscale
  var xmax = this.xmax + this.padding / this.xscale
  var x = xmin
  var step = getDefault(config.step, this.step)
  this.ctx.strokeStyle = getDefault(config.color, this.color)
  while (x <= xmax) {
    x += step
    this.line(x, f(x), x+step, f(x))
  }
  return this
}

function isPlainObject (o) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

// 散点图
Plot.prototype.plotPoints = function (map, config={}) {
  const keys = Object.keys(map), values = Object.values(map)
  this.geometry({
    xmin: Math.min.apply(null, keys),
    xmax: Math.max.apply(null, keys),
    ymin: Math.min.apply(null, values),
    ymax: Math.max.apply(null, values)
  })

  //var step = getDefault(config.step, this.step)
  //var continuity = getDefault(config.continuity, 100)
  this.ctx.strokeStyle = getDefault(config.color, this.color)
  this.ctx.beginPath()
  let x = this.xmin
  this.moveTo(x, map[x])
  for (x of keys) {
    this.lineTo(x, map[x])
  }
  this.ctx.stroke()
  return this
}

// plot continuously
Plot.prototype.plot = function(f, g, config={}) {
  if (isPlainObject(f)) return this.plotPoints(f, config)
  if (typeof g !== 'function') {
    config = g || {}
    g = f
    f = t => t
  }
  config.min = getDefault(config.min, this.xmin - this.padding / this.xscale)
  config.max = getDefault(config.max, this.xmax + this.padding / this.xscale)
  var t = config.min, x = f(t), y = g(t), prex = x, prey = y
  var step = getDefault(config.step, this.step)
  var continuity = getDefault(config.continuity, 100)
  this.ctx.strokeStyle = getDefault(config.color, this.color)
  this.ctx.beginPath()
  this.moveTo(x, y)
  while (t <= config.max) {
    t += step
    x = f(t)
    y = g(t)
    // 斜率过大处断开
    if ( Math.abs((x-prex)/step) > continuity ||
      Math.abs((y-prey)/step) > continuity) {
      this.ctx.stroke()
      this.ctx.beginPath()
      this.moveTo(x, y)
    }
    this.lineTo(x, y)
    prex = x
    prey = y
  }
  this.ctx.stroke()
  return this
}

window.Plot = Plot

})()

/*
var plot = new Plot('canvas', {xmin: -10, ymin: -1, xmax: 10, ymax: 5})
  plot.axis({xlabel: 3})
  .plot(Math.floor)
  .plot(x => x*x, {color: Plot.colors.yellow})
  .plot(Math.cos, {color: Plot.colors.green})
  .plot(Math.tan, {color: Plot.colors.red})
  .plot(x => Math.sin(1/x), {color: 'grey', continuity:1e4})
*/
