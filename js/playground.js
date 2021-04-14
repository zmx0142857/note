;(function(window, document){

const list = document.querySelectorAll('.playground')
for (let playground of list) {
  const frag = document.createDocumentFragment(),
        input = document.createElement('input'),
        run = document.createElement('input'),
        showSrc = document.createElement('input'),
        output = document.createElement('pre'),
        src = document.createElement('pre'),
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
  let onkeyup = function (e) {
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

  frag.appendChild(input)
  frag.appendChild(run)
  frag.appendChild(showSrc)
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

