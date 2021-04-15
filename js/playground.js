;(function(window, document){

const list = document.querySelectorAll('.playground')
const $ = document.createElement.bind(document)
for (let playground of list) {
  const frag = document.createDocumentFragment(),
        ctrl = $('div'),
        input = $('input'),
        run = $('input'),
        showSrc = $('input'),
        output = $('pre'),
        src = $('pre'),
        script = Array.from(playground.children).find(n => n.nodeName === 'SCRIPT')
  input.type = 'text'
  input.value = playground.getAttribute('value')
  run.type = 'button'
  run.value = '运行'
  run.onclick = function () {
    output.classList.remove('hidden')
    try {
      output.textContent = window[playground.getAttribute('run')](input.value)
      output.classList.remove('error')
    } catch (e) {
      output.textContent = e + '\n' + e.stack
      output.classList.add('error')
    }
  }
  output.classList.add('hidden')
  src.textContent = script.textContent.trim()
  src.classList.add('hidden')
  showSrc.type = 'button'
  showSrc.value = '源码'
  showSrc.onclick = function () {
    src.classList.toggle('hidden')
  }
  const onkeyup = function (e) {
    if (e.keyCode == 13) {
      run.onclick();
    }
  }
  input.onfocus = function () {
    document.addEventListener('keyup', onkeyup)
  }
  input.onblur = function () {
    document.removeEventListener('keyup', onkeyup)
  }

  ctrl.classList.add('ctrl')
  ctrl.appendChild(input)
  ctrl.appendChild(run)
  ctrl.appendChild(showSrc)
  frag.appendChild(ctrl)
  frag.appendChild(output)
  frag.appendChild(src)
  playground.appendChild(frag)
}

let Playground = {
  parse (obj) {
    return Function('"use strict";return (' + obj + ')')()
  },
  fill (value) {
    return function doFill (head, ...tail) {
      if (tail.length)
        return Array.from({ length: head }, () => doFill(...tail))
      return Array(head).fill(value)
    }
  },
}
Playground.zeros = Playground.fill(0)
Playground.ones = Playground.fill(1)
window.Playground = Playground

})(window, document)

