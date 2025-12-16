/**
 * dom 操作.
 * 优先级: el > selector > 创建
 * @returns {HTMLElement}
 */
export const div = ({
  el,
  tag = 'div',
  container = document.body,
  selector,
  selectorAll,
  className,
  css,
  style,
  attr,
  on,
  off,
  namespace,
  children,
  ...options
} = {}) => {
  if (selector === true) selector = '.' + className
  el ||= (selectorAll && container.querySelectorAll(selectorAll)) || (selector && container.querySelector(selector)) || container.appendChild(
    !tag ? document.createDocumentFragment()
    : namespace ? document.createElementNS(namespace, tag)
    : document.createElement(tag)
  )
  if (className && !el.className) el.className = className
  if (css) div.css(css, className)
  if (style) Object.assign(el.style, style)
  if (attr) Object.entries(attr).forEach(([k, v]) => div.attr(el, k, v))
  if (on) Object.entries(on).forEach(([k, v]) => div.on(el, k, v))
  if (off) Object.entries(off).forEach(([k, v]) => div.off(el, k, v))
  if (children) div.append(el, children)
  return Object.assign(el, options)
}
div.styles = {}
div.key = 'va' // short for vanilla-ui
div.css = (css, className, key) => {
  if (className && div.styles[className]) return
  div.styles[className] = true
  key ||= div.key
  const res = div({
    tag: 'style',
    container: document.head,
    selector: `style[data-${key}]`,
    attr: { [`data-${key}`]: '' }
  })
  res.innerHTML += css
    .replace(/\n\s+/g, '\n')
    .replace(/&/g, '.' + className)
    .replace(/\$[-a-z0-9]+/g, m => div.cssvar(m.slice(1))) + '\n'
  return res
}
// div: advanced features
div.themes = {}
div.theme = 'light'
div.cssvar = (name, defaultValue) => {
  defaultValue ||= div.themes[div.theme]?.[name]
  name = `--${div.key}-${name}`
  return defaultValue ? `var(${name}, ${defaultValue})` : `var(${name})`
}
div.on = (el, ...args) => {
  el.addEventListener(...args)
}
div.off = (el, ...args) => {
  el.removeEventListener(...args)
}
// string template
div.html = (arr, ...args) => {
  const esc = (v) => String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  const buf = []
  arr.forEach((str, i) => buf.push(str, esc(args[i])))
  return buf.join('')
}
// build className
div.clsx = (...args) => {
  if (args.length !== 1) return args.map(v => div.clsx(v)).join(' ').trim()
  const arg = args[0]
  if (Array.isArray(arg)) return div.clsx(...arg)
  if (typeof arg === 'string') return arg.trim()
  // suppose arg is object
  return Object.keys(arg).filter(k => arg[k]).join(' ').trim()
}
div.append = (el, children) => {
  if (!children) return
  if (typeof children === 'string') children = div.text(children)
  if (Array.isArray(children)) children.forEach(v => div.append(el, v))
  else el.appendChild(children)
}
div.text = (str) => document.createTextNode(str)
div.attr = (el, key, value) => {
  if (!value && value !== 0) el.removeAttribute(key)
  else el.setAttribute(key, value)
}

/**
 * @example
 * ```
 * const container = $('.container')
 * const btn = $(container, '.btn')
 * ```
 */
export const $ = (...args) => (args.at(-2) || document).querySelector(args.at(-1))
$.all = (...args) => (args.at(-2) || document).querySelectorAll(args.at(-1))