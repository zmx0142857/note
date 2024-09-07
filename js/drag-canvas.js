function draggableCanvas (options) {
  let { canvas, ctx, onInit, onMouseDown, onMouseMove } = options
  const dpr = window.devicePixelRatio
  canvas.style.zoom = 1/dpr
  canvas.setAttribute('width', canvas.offsetWidth * dpr)
  canvas.setAttribute('height', canvas.offsetHeight * dpr)
  ctx = ctx || canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  onInit && onInit.call(options, { ctx })

  function getXY (e) {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX || e.touches[0].clientX
    const y = e.clientY || e.touches[0].clientY
    e.preventDefault() // causes error thus stopped event propagation, see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners
    return [x - rect.left, y - rect.top]
  }

  canvas.onmousedown = canvas.ontouchstart = function (e) {
    const [x, y] = getXY(e)
    onMouseDown && onMouseDown.call(options, { x, y, ctx })
    function mousemove (e) {
      const [x, y] = getXY(e)
      onMouseMove && onMouseMove.call(options, { x, y, ctx })
    }
    function mouseup () {
      document.removeEventListener('mousemove', mousemove)
      document.removeEventListener('mouseup', mouseup)
      document.removeEventListener('touchmove', mousemove, true)
      document.removeEventListener('touchend', mouseup, true)
    }
    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseup', mouseup)
    document.addEventListener('touchmove', mousemove, true)
    document.addEventListener('touchend', mouseup, true)
  }
}
