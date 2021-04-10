const list = document.querySelectorAll('.playground')
for (let playground of list) {
  const frag = document.createDocumentFragment(),
        input = document.createElement('input'),
        button = document.createElement('input'),
        pre = document.createElement('pre')
  input.type = 'text'
  input.value = playground.getAttribute('value')
  button.type = 'button'
  button.value = '运行'
  button.onclick = function () {
    pre.classList.remove('hidden')
    try {
      pre.textContent = window[playground.getAttribute('run')](input.value)
      pre.classList.remove('error')
    } catch (e) {
      pre.textContent = e + '\n' + e.stack
      pre.classList.add('error')
    }
  }
  pre.classList.add('hidden')
  let onkeyup = function (e) {
    if (e.keyCode == 13) {
      button.onclick();
    }
  }
  input.onfocus = function () {
    document.addEventListener('keyup', onkeyup)
  }
  input.onblur = function () {
    document.removeEventListener('keyup', onkeyup)
  }

  frag.appendChild(input)
  frag.appendChild(button)
  frag.appendChild(pre)
  playground.appendChild(frag)
}
