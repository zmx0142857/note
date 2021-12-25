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

// 虚拟 dom (bushi
function $(tag, options = {}, children = []) {
  const el = tag ? document.createElement(tag) : document.createDocumentFragment()
  Object.keys(options).forEach(key => {
    const value = options[key]
    if (key === 'className') {
      if (Array.isArray(value)) value.forEach(v => el.classList.add(v))
      else el.classList.add(value)
    } else if (key === 'attrs') {
      Object.keys(value).forEach(attr => el.setAttribute(attr, value[attr]))
    } else if (key === 'style') {
      Object.assign(el.style, value)
    } else if (typeof value === 'function') {
      el[key] = value.bind(options)
    } else {
      el[key] = value
    }
  })
  children.forEach(child => {
    el.appendChild(child)
  })
  return el
}

const list = document.querySelectorAll('.playground')
for (let playground of list) {
  const script = Array.from(playground.children).find(n => n.nodeName === 'SCRIPT')

  const inputType = playground.getAttribute('type') || 'text'
  const input = $(inputType === 'textarea' ? 'textarea' : 'input', {
    type: 'text',
    value: playground.getAttribute('value'),
    onfocus () {
      document.addEventListener('keyup', onkeyup)
    },
    onblur () {
      document.removeEventListener('keyup', onkeyup)
    }
  })

  const run = $('input', {
    type: 'button',
    value: '运行',
    onclick () {
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
    },
  })

  const output = $('pre', {
    className: 'hidden'
  })

  const src = $('pre', {
    textContent: script.textContent.trim(),
    className: 'hidden',
    attr: {
      contenteditable: 'true',
      spellcheck: 'false',
    },
  })

  const showSrc = $('input', {
    type: 'button',
    value: '源码',
    onclick () {
      src.classList.toggle('hidden')
    }
  })

  const onkeyup = function (e) {
    if (inputType === 'text' && e.keyCode == 13) {
      run.onclick();
    }
  }

  const ctrls = [input, run, showSrc]

  if (playground.getAttribute('value2')) {
    const value1 = $('input', {
      type: 'button',
      value: '例1',
      input: input.value,
      onclick () {
        input.value = this.input
      }
    })
    const value2 = $('input', {
      type: 'button',
      value: '例2',
      input: playground.getAttribute('value2'),
      onclick () {
        input.value = this.input
      }
    })
    ctrls.push(value1, value2)
  }

  const ctrl = $('div', {
    className: 'ctrl',
  }, ctrls)

  const frag = $('', {}, [ctrl, output, src])
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

