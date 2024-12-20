function appendChildren (el, children) {
  if (Array.isArray(children)) {
    children.forEach(c => {
      if (typeof c === 'string') c = document.createTextNode(c)
      el.appendChild(c)
    })
  } else {
    if (typeof children === 'string') children = document.createTextNode(children)
    el.appendChild(children)
  }
}

// 虚拟 dom (bushi
function $(tag, options = {}, children = []) {
  const len = tag && tag.length
  const el = !tag
    ? document.createDocumentFragment()
    : tag[0] === '#'
    ? document.getElementById(tag.slice(1))
    : tag[0] === '.'
    ? document.getElementsByClassName(tag.slice(1))
    : tag[0] === '<' && tag[len-1] === '>'
    ? (options.namespace
      ? document.createElementNS(options.namespace, tag.slice(1,len-1))
      : document.createElement(tag.slice(1,len-1))
    ) : document.getElementsByTagName(tag);

  if (typeof options === 'string') {
    el.innerText = options
  } else {
    Object.keys(options).forEach(key => {
      const value = options[key]
      if (key === 'className') {
        if (Array.isArray(value)) value.forEach(v => el.classList.add(v))
        else el.classList.add(value)
      } else if (key === 'attrs') {
        Object.keys(value).forEach(attr => el.setAttribute(attr, value[attr]))
      } else if (key === 'on') {
        Object.keys(value).forEach(ev => {
          const arr = ev.split('.')
          el.addEventListener(arr[0], value[ev].bind(options), arr[1] === 'true')
        })
      } else if (key === 'style') {
        Object.assign(el.style, value)
      } else if (typeof value === 'function') {
        el[key] = value.bind(options)
      } else if (key !== 'namespace') {
        el[key] = value
      }
    })
    options.el = el
  }

  appendChildren(el, children)

  return el
}

;(function () {

/**
 * Modal
 */
window.Modal = function Modal (id, config = {}) {
  const {
    height = 400,
    width = 300,
    zIndex = 99
  } = config

  this.elem = $('#' + id, {
    className: 'ui-modal-elem',
    style: {
      height: `${ height }px`,
      width: `${ width }px`,
      display: 'unset',
    },
  })

  this.container = $('<div>', {
    className: 'ui-modal-container',
    style: {
      zIndex,
      display: 'none',
    },
    attrs: {
      'aria-hidden': true // 解决模态框用键盘无法关闭的问题
    },
    on: {
      click (e) {
        if (e.target === this.el) {
          this.el.style.display = 'none'
        }
      }
    },
  }, this.elem)
  document.body.appendChild(this.container)
}

Modal.prototype.toggle = function () {
  this.container.style.display =
    this.container.style.display === 'flex' ? 'none' : 'flex'
}

/**
 * Notify
 */
window.Notify = function Notify (textContent) {
  const notify = $('<div>', {
    id: 'notify',
    className: 'notify',
    textContent,
  })
  document.body.appendChild(notify)
}

Notify.prototype.remove = function () {
  const notify = $('#notify')
  notify && document.body.removeChild(notify)
}

/**
 * Range
 */
window.Range = function (id, { type = 'range', min = -5, max = 5, step = 0.1, defaultValue = 1, onChange }) {
  this.span = $('<label>', {
    className: 'ui-range-label',
  })
  this.setLabel = text => {
    this.span.innerText = text
  }
  this.range = $('<input>', {
    className: 'ui-range-input',
    attrs: {
      type,
      min,
      max,
      step,
      value: defaultValue,
    },
    oninput: (e) => {
      const value = e ? parseFloat(e.target.value) : defaultValue
      onChange?.call(this, value)
    }
  })
  this.el = $('#' + id)
  this.el.appendChild(this.span)
  this.el.appendChild(this.range)
  setTimeout(this.range.oninput)
}

// -------------------------------

let style
const head = $('head')[0]
function addStyle (css) {
  //document.styleSheets[0].addRule('.box', 'height: 100px')
  //document.styleSheets[0].insertRule('.box {height: 100px}', 0)
  if (!style) {
    style = $('<style>')
    head.appendChild(style)
  }
  style.appendChild(document.createTextNode(css))
}

addStyle(`
.ui-modal-elem {
  background: #f4f8fb;
  color: #333;
  border-radius: 10px;
  padding: 20px;
  overflow: auto;
}
.ui-modal-container {
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0,0,0,0.2);
  align-items: center;
  justify-content: center;
  perspective: 1000px;
}
.notify {
  position: fixed;
  top: 10px;
  left: 40%;
  width: 20%;
  max-width: 150px;
  padding: 5px;
  border-radius: 5px;
  text-align: center;
  z-index: 10;
  color: white;
  background: #444;
  overflow: hidden;
}
.notify::before {
  content: '';
  position: absolute;
  background: white;
  bottom: 2px;
  left: -25%;
  height: 2px;
  width: 50%;
  animation: whitebar 1.5s infinite ease;
}
@keyframes whitebar {
  50% { left: 75% }
}
.ui-range-label {
  display: inline-block;
  width: 60px;
  line-height: 30px;
}
.ui-range-input {
  vertical-align: middle;
}
`)

})()
