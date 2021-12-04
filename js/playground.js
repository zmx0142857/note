;(function(window, document){
const requireCache = {}
function require (id) {
  const module = requireCache[id] || (requireCache[id] = loadModule(
    document.getElementById(id).textContent
  ))
  return module.exports
}

function loadModule (src) {
  const module = {}
  Function(
    ['module', 'require'],
    '"use strict";' + src
  )(module, require)
  return module
}

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
      const module = loadModule(src.innerText) // 用 innerText 而不是 textContent 可以保留换行
      output.textContent = module.exports(input.value)
      output.classList.remove('error')
    } catch (e) {
      console.error(e)
      output.textContent = e.stack
      output.classList.add('error')
    }
  }
  output.classList.add('hidden')
  src.textContent = script.textContent.trim()
  src.classList.add('hidden')
  src.setAttribute('contenteditable', 'true')
  src.setAttribute('spellcheck', 'false')
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
  *range (...args) {
    let start = 0, stop, step = 1;
    if (args.length === 1) {
      stop = args[0]
    } else if (args.length === 2) {
      start = args[0]
      stop = args[1]
    } else if (args.length === 3) {
      start = args[0]
      stop = args[1]
      step = args[2]
    }
    if (step > 0) {
      for (let x = start; x < stop; x += step)
        yield x
    } else if (step < 0) {
      for (let x = start; x > stop; x += step)
        yield x
    }
  }
}
Playground.zeros = Playground.fill(0)
Playground.ones = Playground.fill(1)
window.Playground = Playground

})(window, document)

