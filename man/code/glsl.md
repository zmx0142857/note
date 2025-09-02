# GLSL

坐标的标准化
```
vec2 uv = fragCoord / iResolution.xy; // [0,1]x[0,1]
uv = uv * 2. - 1.; // [-1,1]x[-1,1]
uv = uv * 5.; // [-5,5]x[-5,5]
```

基础函数
```
dot(v0, v1) // 点乘
distance(v0, v1) // 距离
length(v) // 长度
min(v0, v1) // 最小值
max(v0, v1) // 最大值
sin(v) // 正弦
cos(v) // 余弦
tan(v) // 正切
mod(v, m) // 取模
floor(v) // 向下取整
fract(v) // 取小数部分, 相当于 v - floor(v)

// 将结果限制在 min_v, max_v 之间, 相当于 min(max(v, min_v), max_v)
clamp(v, min_v, max_v)

// 线性插值. alpha 从 0 到 1 时, 函数值线性地从 v0 变到 v1
mix(v0, v1, alpha)
```

step
```
// 判断 edge <= v
step(edge, v)

// 三个等价写法, 判断 edge >= v
step(v, edge)
1.-step(edge, v)
step(-edge, -v)

// 两个等价写法, 判断 a <= v and v <= b
step(a, v) - step(b, v)
step(abs(v - (a+b)*0.5), (b-a)*0.5)
```

smoothstep - step 的光滑版本
```
// v 不属于 [a, b] 时, 表现与 step((a+b)*0.5, v) 相同
// v 属于 [a, b] 时, 呈现一个光滑的过渡, 内部使用三次缓动函数 (3-2*t)*t*t.
smoothstep(a, b, v)

// 等价实现
float smoothstep(a, b, v) {
  v = (v-a) / (b-a);
  v = clamp(v, 0., 1.);
  v = (3.-2.*v)*v*v;
}

// 以原点为中心有一个鼓包
smoothstep(0.02, 0.0, abs(x))
```

构造分段函数
```
float i = floor(x);
float f = fract(x);
mix(random(i), random(i+1.), f); // 用折线连接
mix(random(i), random(i+1.), smoothstep(0.0, 1.0, f)); // 用平滑曲线连接
```

rgb 与 hsl 转换
```
// by Iñigo Quiles https://www.shadertoy.com/view/MsS3Wc
vec3 hsl2rgb(in vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6. + vec3(0., 4., 2.), 6.) - 3.) - 1., 0., 1.);
  rgb = rgb * rgb * (3. - 2. * rgb);
  return c.z * mix(vec3(1.), rgb, c.y);
}

vec3 rgb2hsl(in vec3 c) {
  vec4 K = vec4(0., -1. / 3., 2. / 3., -1.);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6. * d + e)), d / (q.x + e), q.x);
}
```

函数绘制
```
float plot(float f, float line_width) {
  return smoothstep(line_width, 0., abs(f));
}

/**
 * 函数图像
 * @example
 * ```
 * float x = uv.x;
 * x = x * x;
 * plot(uv.y - x); // 绘制抛物线
 * ```
 */
float plot(float f) {
  return plot(f, 0.02);
}

// 三次缓动函数. 当 x 属于 [0, 1] 时相当于 smoothstep(0., 1., x)
float cubic_ease(float x) {
  return (3. - 2. * x) * x * x;
}

// 城墙函数
float sawtooth(float x) {
  return step(1., mod(x, 2.));
}

// 折线函数
float zigzag(float x) {
  return 1. - abs(mod(x, 2.)-1.);
}

float random(float x) {
  return fract(sin(x) * 43758.5453123);
}

float random2d(vec2 st) {
  return random(dot(st, vec2(12.9898,78.233)));
}

float noise(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(random(i), random(i + 1.), smoothstep(0., 1., f));
}
```

形状绘制
```

// 棋盘
float chess(in vec2 uv, in vec2 size) {
  vec2 i = floor(uv / size);
  return mod(i.x + i.y, 2.);
}

// 网格
float grid(in vec2 uv, in float line_width) {
  vec2 f = fract(uv + vec2(line_width * 0.5));
  return step(abs(f.x), line_width) + step(abs(f.y), line_width);
}

// 实心矩形
float fill_rect(in vec2 uv, in vec2 size) {
  vec2 st = step(-0.5 * size, uv) - step(0.5 * size, uv);
  return st.x * st.y;
}

// 空心矩形
float stroke_rect(in vec2 uv, in vec2 size, in float line_width) {
  vec2 s = vec2(line_width) * 0.5;
  return rect(uv, size + s) - rect(uv, size - s);
}

// 实心圆
float fill_circle(in vec2 uv, in float radius) {
  float s = 0.02;
  return smoothstep(
    radius * (1.0 + s),
    radius * (1.0 - s),
    dot(uv, uv) * 4.0
  );
}

// 空心圆
float stroke_circle(in vec2 uv, in float radius, in float line_width) {
  float s = line_width * 0.5;
  return circle(uv, radius + s) - circle(uv, radius - s);
}
```

基于距离场的形状绘制
```
// 填充: fill(sdf(...))
float fill(in float sdf) {
  return step(sdf, 0.0);
  // 或者 return smoothstep(0.02, -0.02, sdf);
}

// 描边: stroke(sdf(...), line_width)
float stroke(in float sdf, in float line_width) {
  return step(abs(sdf), line_width*0.5);
  // 或者 return smoothstep(line_width*0.5, 0., abs(sdf));
}

// 圆
float circle_sdf(in vec2 uv, in float radius) {
  return length(uv) - radius;
}

// 矩形
float rect_sdf(vec2 pos, vec2 half_size) {
  vec2 v = abs(pos) - half_size;
  // return max(v.x, v.y); // cheap rect which wrong at corner
  float outside = length(max(v, 0.));
  float inside = min(max(v.x, v.y), 0.);
  return outside + inside;
}

// 圆角矩形
float rect_sdf(in vec2 uv, in vec2 size, in float radius) {
  vec2 d = abs(uv) - size * 0.5 + vec2(radius);
  return length(max(d, 0.0)) - radius;
}

#define PI 3.1415926535897932384626433832795
#define TWO_PI 6.283185307179586476925286766559

// 正多边形 http://thndl.com/square-shaped-shaders.html
float regular_polygon_sdf(in vec2 uv, in int sides) {
    float r = length(uv); // uv 的模长
    float a = atan(uv.x, uv.y) + PI; // uv 的辐角, 向上为 0 度
    float b = TWO_PI / float(sides); // 一边所对的圆心角
    return r * cos(floor(0.5 + a / b) * b - a);
}
```
