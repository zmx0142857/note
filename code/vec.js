var Vec = (function(){

const { sin, cos, hypot } = Math

// length(axis) == 1
const rotate3d = (xyz, axis, angle) => {
  const [x, y, z] = xyz
  const [u, v, w] = axis
  const k = u * x + v * y + w * z
  const s = sin(angle)
  const c = cos(angle)
  return [
    x * c + k * u * (1-c) + (v * z - w * y) * s,
    y * c + k * v * (1-c) + (w * x - u * z) * s,
    z * c + k * w * (1-c) + (u * y - v * x) * s
  ]
}

const cross = (r1, r2) => {
  const [x1, y1, z1] = r1
  const [x2, y2, z2] = r2
  return [y1 * z2 - z1 * y2, z1 * x2 - x1 * z2, x1 * y2 - y1 * x2]
}

const dot = (r1, r2) => {
  const [x1, y1, z1] = r1
  const [x2, y2, z2] = r2
  return x1 * x2 + y1 * y2 + z1 * z2
}

const length = (xyz) => {
  return hypot(...xyz)
}

const normalize = (xyz) => {
  const len = length(xyz)
  return xyz.map(v => v / len)
}

return {
  rotate3d,
  cross,
  dot,
  length,
  normalize,
}

})()