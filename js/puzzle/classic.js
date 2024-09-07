window.puzzle = (function () {

const brailleStr = '⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠥⠧⠺⠭⠽⠵'
const brailleDict = Object.fromEntries([...brailleStr].map((b, i) => [b, String.fromCharCode(97 + i)]))

const morseArr = ['.-', '-...', '-.-.', '-..', '.', '..-.', '--.', '....', '..', '.---', '-.-', '.-..', '--', '-.', '---', '.--.', '--.-', '.-.', '...', '-', '..-', '...-', '.--', '-..-', '-.--', '--..']
const morseDict = Object.fromEntries(morseArr.map((m, i) => [m, String.fromCharCode(97 + i)]))

const natoArr = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliet', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa', 'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey', 'x-ray', 'yankee', 'zulu']

const cellphoneArr = ['21', '22', '23', '31', '32', '33', '41', '42', '43', '51', '52', '53', '61', '62', '63', '71', '72', '73', '74', '81', '82', '83', '91', '92', '93', '94']
const cellphoneDict = Object.fromEntries(cellphoneArr.map((c, i) => [c, String.fromCharCode(97 + i)]))

const flagArr = ['↓↙', '←↓', '↓↖', '↑↓', '↓↗', '→↓', '↓↘', '←↙', '↖↙', '↑→', '↑↙', '↗↙', '→↙', '↘↙', '←↖', '←↑', '←↗', '←→', '←↘', '↑↖', '↖↗', '↑↘', '→↗', '↗↘', '→↖', '→↘']
const flagDict = Object.fromEntries(flagArr.map((c, i) => [c, String.fromCharCode(97 + i)]))

function makeTable (fn) {
  return Array.from({ length: 7 }).map((_, i) => [
    String.fromCharCode(65 + i), fn(0 + i),
    String.fromCharCode(72 + i), fn(7 + i),
    String.fromCharCode(79 + i), fn(14 + i),
    ...(21 + i < 26 ? [String.fromCharCode(86 + i), fn(21 + i)] : [])
  ])
}

function renderTable (el, rows, caption) {
  el.innerHTML = `<caption>${caption}</caption>\n` +
    rows.map(tr => '<tr>\n' + tr.map(td => `<td>${td}</td>`).join('\n') + '\n</tr>').join('\n')
}

const converters = {
  char2number (c) {
    if (/[a-zA-Z]/.test(c)) return c.toUpperCase().charCodeAt(0) - 64
    return c
  },
  number2char (n) {
    if (n >= 1 && n <= 26 && Number.isInteger(n)) return String.fromCharCode(n + 96)
    return n
  },
  braille2char (c) {
    if (/[\u2800-\u28ff]/.test(c)) return brailleDict[c] || '?'
    return c
  },
  char2braille (c) {
    if (/[a-zA-Z]/.test(c)) return brailleStr[c.toUpperCase().charCodeAt(0) - 65]
    return c
  },
  char2morse (c) {
    if (/[a-zA-Z]/.test(c)) return morseArr[c.toUpperCase().charCodeAt(0) - 65]
    return ''
  },
  morse2char (m) {
    return morseDict[m] || '?'
  },
  char2cellphone (c) {
    if (/[a-zA-Z]/.test(c)) return cellphoneArr[c.toUpperCase().charCodeAt(0) - 65]
    return c
  },
  cellphone2char (c) {
    return cellphoneDict[c] || '?'
  },
  flag2char (f) {
    f = f.split('').sort().join('')
    return flagDict[f] || '?'
  },
  char2flag (c) {
    if (/[a-zA-Z]/.test(c)) return flagArr[c.toUpperCase().charCodeAt(0) - 65]
    return c
  },
}

function convert (data, { from, to }) {
  const fn = converters[from + '2' + to]
  if (fn) return fn(data)
  console.error(`cannot convert from ${from} to ${to}`)
}


// split into n-chunks
function strChunk (str, len) {
  const buf = []
  for (let i = 0; i < str.length; i += len) {
    buf.push(str.slice(i, i+len))
  }
  return buf
}

class InputHelper {
  constructor (input) {
    this.input = input
  }
  getCaret () {
    return this.input.selectionStart || 0
  }
  setCaret (pos) {
    const input = this.input
    if (input.setSelectionRange) {
      setTimeout(function() {
        input.setSelectionRange(pos, pos)
        input.focus()
      }, 0)
    } else if (input.createTextRange) {
      const range = input.createTextRange()
      range.move('character', pos)
      range.select()
    }
  }
  insert (text) {
    const input = this.input
    input.focus();
    const i = this.getCaret();
    const leftStr = input.value.substr(0, i)
    const rightStr = input.value.substr(i)
    input.value = leftStr + text + rightStr
    this.setCaret(input.value.length - rightStr.length)
  }
}

return {
  convert,
  renderTable,
  makeTable,
  data: {
    brailleStr,
    morseArr,
    natoArr,
    flagArr,
  },
  utils: {
    chunk: strChunk,
    ord: c => c.codePointAt(0),
    chr: String.fromCodePoint,
  },
  InputHelper,
}

})();
