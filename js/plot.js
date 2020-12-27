(function(){

'use strict';
function getDefault(val, defaultVal) {
  if (val !== undefined) return val;
  return defaultVal;
}

function Plot(el, config={}) {
  this.canvas = document.getElementById('canvas');
  this.ctx = canvas.getContext('2d');
  this.ctx.font = "12px sans-serif";
  this.color = getDefault(config.color, '#337ab7');

  this.step = getDefault(config.step, 5e-3);
  this.padding = 10;
  this.geometry(config);
}

Plot.colors = {
  blue: '#337ab7',
  darkBlue: '#23527c',
  green: '#3c763d',
  lightGreen: '#dff0d8',
  yellow: '#8a6d3b',
  red: '#a94442',
};

Plot.prototype.geometry = function(config) {
  this.xmin = getDefault(config.xmin, -5);
  this.ymin = getDefault(config.ymin, -1);
  this.xmax = getDefault(config.xmax, 5);
  this.ymax = getDefault(config.ymax, 5);
  this.scale = Math.min(
    (this.canvas.width-2*this.padding) / (this.xmax-this.xmin),
    (this.canvas.height-2*this.padding) / (this.ymax-this.ymin)
  );
  return this;
}

// 另一种方案是用 css transform: scaleY(-1); 实现上下翻转；
// 问题是，文字也会倒转，这可以用 ctx.scale(1, -1) 补救
Plot.prototype.transform = function(x, y) {
  return [(x-this.xmin)*this.scale+this.padding, (this.ymax-y)*this.scale+this.padding];
}

Plot.prototype.moveTo = function(x, y) {
  this.ctx.moveTo(...this.transform(x, y));
  return this;
}

Plot.prototype.lineTo = function(x, y) {
  this.ctx.lineTo(...this.transform(x, y));
  return this;
}

Plot.prototype.line = function(x0, y0, x1, y1) {
  this.ctx.beginPath();
  this.moveTo(x0, y0);
  this.lineTo(x1, y1);
  this.ctx.stroke();
  return this;
}

Plot.prototype.text = function(text, x, y) {
  this.ctx.fillText(text, ...this.transform(x, y));
  return this;
}

Plot.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  return this;
}

Plot.prototype.axis = function() {
  var origin = this.transform(0, 0);
  this.ctx.strokeStyle = 'black';
  // x 轴
  this.ctx.beginPath();
  this.ctx.moveTo(0, origin[1]);
  this.ctx.lineTo(this.canvas.width, origin[1]);
  this.ctx.stroke();
  // y 轴
  this.ctx.beginPath();
  this.ctx.moveTo(origin[0], 0);
  this.ctx.lineTo(origin[0], this.canvas.height);
  this.ctx.stroke();
  // 刻度
  for (var x = Math.ceil(this.xmin); x <= this.xmax; ++x) {
    if (x !== 0) {
      this.line(x, 0, x, 4/this.scale);
    }
  }
  for (var y = Math.ceil(this.ymin); y <= this.ymax; ++y) {
    if (y !== 0) {
      this.line(0, y, 4/this.scale, y);
    }
  }
  // 标签
  for (var x = Math.ceil(this.xmin); x <= this.xmax; ++x) {
    this.ctx.save();
    if (x !== 0) {
      this.ctx.translate(-2, 12);
      this.text(''+x, x, 0);
    } else {
      this.ctx.translate(4, 12);
      this.text(''+x, x, 0);
    }
    this.ctx.restore();
  }

  this.ctx.save();
  this.ctx.translate(6, 4);
  for (var y = Math.ceil(this.ymin); y <= this.ymax; ++y) {
    if (y !== 0) {
      this.text(''+y, 0, y);
    }
  }
  this.ctx.restore();
  return this;
}

// plot discretely
Plot.prototype.discrete = function(f, config={}) {
  var xmin = this.xmin - this.padding / this.scale;
  var xmax = this.xmax + this.padding / this.scale;
  var x = xmin;
  var step = getDefault(config.step, this.step);
  this.ctx.strokeStyle = getDefault(config.color, this.color);
  while (x <= xmax) {
    x += step;
    this.line(x, f(x), x+step, f(x));
  }
  return this;
}

// plot continuously
Plot.prototype.plot = function(f, config={}) {
  var xmin = this.xmin - this.padding / this.scale;
  var xmax = this.xmax + this.padding / this.scale;
  var x = xmin, y = f(x);
  var step = getDefault(config.step, this.step);
  var continuity = getDefault(config.continuity, 100);
  this.ctx.strokeStyle = getDefault(config.color, this.color);
  this.ctx.beginPath();
  this.moveTo(x, y);
  while (x <= xmax) {
    x += step;
    var newy = f(x);
    // 斜率过大处断开
    if (Math.abs((newy-y)/step) > continuity) {
      this.ctx.stroke();
      this.ctx.beginPath();
      this.moveTo(x, newy);
    }
    this.lineTo(x, newy);
    y = newy;
  }
  this.ctx.stroke();
  return this;
}

window.Plot = Plot;

})();

/*
var plot = new Plot('canvas', {xmin: -4.5, ymin: -1, xmax: 4.5, ymax: 5})
plot.axis()
  .plot(Math.floor)
  .plot(x => x*x, {color: Plot.colors.yellow})
  .plot(Math.cos, {color: Plot.colors.green})
  .plot(Math.tan, {color: Plot.colors.red})
  .plot(x => Math.sin(1/x), {color: 'grey', continuity:1e4})
*/
