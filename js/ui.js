;(function (win) {

var doc = win.document, body = doc.body,
    head = doc.getElementsByTagName('head')[0]

var style;
function addStyle (css) {
  //document.styleSheets[0].addRule('.box', 'height: 100px')
  //document.styleSheets[0].insertRule('.box {height: 100px}', 0)
  if (!style) {
    style = doc.createElement('style')
    head.appendChild(style)
  }
  style.appendChild(doc.createTextNode(css))
}

/**
 * Modal
 */
win.Modal = function Modal (id, config = {}) {
  const {
    height = 400,
    width = 300,
    zIndex = 99
  } = config
  this.elem = doc.getElementById(id)
  this.container = doc.createElement('div')
  this.container.appendChild(this.elem)
  Object.assign(this.container.style, {
    height: '100%',
    width: '100%',
    display: 'none',
    position: 'absolute',
    top: '0',
    background: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex,
    perspective: '1000px'
  })
  Object.assign(this.elem.style, {
    background: '#f4f8fb',
    height: `${height}px`,
    width: `${width}px`,
    borderRadius: '10px',
    padding: '20px',
    overflow: 'auto',
    display: 'unset'
  })
  this.elem.addEventListener('click', function (e) {
    e.stopPropagation()
  }, true)
  this.container.onclick = function () {
    this.style.display = 'none'
  }
  body.appendChild(this.container)
}

Modal.prototype.show = function () {
  this.container.style.display = 'flex'
}

/**
 * Notify
 */
win.Notify = function Notify (text) {
  var notify = doc.createElement('div')
  notify.classList.add('notify')
  notify.textContent = text
  notify.id = 'notify'
  body.appendChild(notify)
}

Notify.prototype.remove = function () {
  var notify = doc.getElementById('notify')
  notify && body.removeChild(notify)
}

addStyle(`
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
`)

})(window)
