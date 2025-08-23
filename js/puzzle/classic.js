window.puzzle = (function () {

const ord = c => c.codePointAt(0)
const chr = String.fromCodePoint

// split into n-chunks
const chunk = (str, len) => {
  const buf = []
  for (let i = 0; i < str.length; i += len) {
    buf.push(str.slice(i, i+len))
  }
  return buf
}

// example: tokenize('zhong guo', braillePinyinEncode) => ['zh', 'ong', ' ', 'g', 'uo']
// TODO: use trie
const tokenize = (str, dict) => {
  const keys = Object.keys(dict)
  const res = []
  let i = 0, j = 1
  while (j <= str.length) {
	const s = str.slice(i, j)
	if (dict[s] || keys.some(v => v.startsWith(s))) {
	  ++j
	} else if (j-i === 1) {
	  res.push(s)
	  i = j
	  j = i+1
	} else {
	  res.push(str.slice(i, j-1))
	  i = j-1
	  j = i+1
	}
  }
  if (i < str.length) res.push(str.slice(i))
  return res
}

const brailleStr = '⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠥⠧⠺⠭⠽⠵'
const brailleDict = Object.fromEntries([...brailleStr].map((b, i) => [b, chr(97 + i)]))
const braillePinyinArr = [
  ['b', '⠃'], ['p', '⠏'], ['m', '⠍'], ['f', '⠋'], ['d', '⠙'], ['t', '⠞'], ['n', '⠝'], ['l', '⠇'],
  ['g', '⠛'], ['k', '⠅'], ['h', '⠓'],
  ['j', '⠛'], ['q', '⠅'], ['x', '⠓'],
  ['zh', '⠌'], ['ch', '⠟'], ['sh', '⠱'], ['r', '⠚'], ['z', '⠵'], ['c', '⠉'], ['s', '⠎'],
  ['er', '⠗'],
  ['a', '⠔'], ['o', '⠢'], ['e', '⠢'], ['ai', '⠪'], ['ei', '⠮'], ['ao', '⠖'], ['ou', '⠷'], ['an', '⠧'], ['en', '⠴'], ['ang', '⠦'], ['eng', '⠼'],
  ['i', '⠊'], ['ia', '⠫'], ['ie', '⠑'], ['iao', '⠜'], ['iu', '⠳'], ['ian', '⠩'], ['in', '⠣'], ['iang', '⠭'], ['ing', '⠡'],
  ['u', '⠥'], ['ua', '⠿'], ['uo', '⠕'], ['uai', '⠽'], ['ui', '⠺'], ['uan', '⠻'], ['un', '⠒'], ['uang', '⠶'], ['ong', '⠲'],
  ['ü', '⠬'], ['üe', '⠾'], ['üan', '⠯'], ['ün', '⠸'], ['iong', '⠹'],
]
const braillePinyinEncode = Object.fromEntries(braillePinyinArr)
const braillePinyinDecode = Object.fromEntries(Object.entries(braillePinyinEncode).map(([k, v]) => [v, k]))
const pinyinStd = str => [
  [/[jqx]([^iü])/g, (match, $1) => 'gkh'['jqx'.indexOf(match[0])] + $1],
  [/[bpmf]e/g, (match) => match[0] + 'o'],
].reduce((s, v) => s.replace(...v), str)
const numberStd = str => str.replace(/⠼([a-j])/g, (_, $1) => chr((ord($1)-96) % 10 + 48))

const morseArr = ['.-', '-...', '-.-.', '-..', '.', '..-.', '--.', '....', '..', '.---', '-.-', '.-..', '--', '-.', '---', '.--.', '--.-', '.-.', '...', '-', '..-', '...-', '.--', '-..-', '-.--', '--..']
const morseNums = ['-----', '.----', '..---', '...--', '....-', '.....', '-....', '--...', '---..', '----.']
const morseDict = Object.fromEntries(morseArr.map((m, i) => [m, chr(97 + i)]))
morseNums.forEach((m, i) => morseDict[m] = String(i))

const natoArr = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliet', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa', 'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey', 'x-ray', 'yankee', 'zulu']

const cellphoneArr = ['21', '22', '23', '31', '32', '33', '41', '42', '43', '51', '52', '53', '61', '62', '63', '71', '72', '73', '74', '81', '82', '83', '91', '92', '93', '94']
const cellphoneDict = Object.fromEntries(cellphoneArr.map((c, i) => [c, chr(97 + i)]))

const flagArr = ['↓↙', '←↓', '↓↖', '↑↓', '↓↗', '→↓', '↓↘', '←↙', '↖↙', '↑→', '↑↙', '↗↙', '→↙', '↘↙', '←↖', '←↑', '←↗', '←→', '←↘', '↑↖', '↖↗', '↑↘', '→↗', '↗↘', '→↖', '→↘']
const flagDict = Object.fromEntries(flagArr.map((c, i) => [c, chr(97 + i)]))
const cantorArr = perm([1,2,3,4]).map(v => v.join('')).sort()

function perm (arr) {
  const n = arr.length
  const res = []
  const buf = arr.slice()
  const swap = (i, j) => {
    const tmp = buf[i]
    buf[i] = buf[j]
    buf[j] = tmp
  }
  const dfs = (depth) => {
    if (depth === n) return res.push(buf.slice())
    for (let i = depth; i < n; ++i) {
      swap(i, depth)
      dfs(depth+1)
      swap(i, depth)
    }
  }
  dfs(0)
  return res
}

function renderTable ({ el, header, rows, title = '', filter = Boolean, map }) {
  rows = (rows || chunk([
    ...Array(26).keys().map(i => chr(65+i)),
    ...Array(10).keys().map(i => chr(48+i)),
  ], 6)).map(row => row.filter(filter).map(v => map ? [v, map(v)] : v).flat())
  el.innerHTML = `<caption>${title}</caption>\n` +
    (header ? '<tr>\n' + header.map(th => `<th>${th}</th>`).join('\n') + '\n</tr>' : '') +
    rows.map(tr => '<tr>\n' + tr.map(td => `<td>${td}</td>`).join('\n') + '\n</tr>').join('\n')
}

const converters = {
  char2number (c) {
    if (/[a-zA-Z]/.test(c)) return ord(c.toUpperCase()) - 64
    return c
  },
  number2char (n) {
    if (n >= 1 && n <= 26 && Number.isInteger(n)) return chr(n + 96)
    return n
  },
  braille2char (c) {
	if (c === '⠼') return c
    if (/[\u2800-\u28ff]/.test(c)) return brailleDict[c] || '?'
    return c
  },
  char2braille (c) {
    if (/[a-zA-Z]/.test(c)) return brailleStr[ord(c.toUpperCase()) - 65]
	if (/[0-9]/.test(c)) {
	  c = +c || 10
	  return '⠼' + brailleStr[c-1]
	}
    return c
  },
  braille2pinyin (c) {
    if (/[\u2800-\u28ff]/.test(c)) return braillePinyinDecode[c] || '?'
	return c
  },
  pinyin2braille (c) {
	if (/[a-zA-Z]/.test(c)) return braillePinyinEncode[c] || '?'
	return c
  },
  char2morse (c) {
    if (/[a-zA-Z]/.test(c)) return morseArr[ord(c.toUpperCase()) - 65]
    if (/[0-9]/.test(c)) return morseNums[c]
    return ''
  },
  morse2char (m) {
    return morseDict[m] || '?'
  },
  char2cellphone (c) {
    if (/[a-zA-Z]/.test(c)) return cellphoneArr[ord(c.toUpperCase()) - 65]
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
    if (/[a-zA-Z]/.test(c)) return flagArr[ord(c.toUpperCase()) - 65]
    return c
  },
  char2cantor (c) {
    if (/[a-xA-X]/.test(c)) return cantorArr[ord(c.toUpperCase()) - 65]
    return '?'
  },
  cantor2char (c) {
    const index = cantorArr.indexOf(c)
    if (index > -1) return chr(97+index)
    return '?'
  },
}

function convert (data, { from, to }) {
  const fn = converters[from + '2' + to]
  if (fn) return fn(data)
  console.error(`cannot convert from ${from} to ${to}`)
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
  data: {
    brailleStr,
    braillePinyinArr,
	braillePinyinEncode,
	braillePinyinDecode,
    morseArr,
    natoArr,
    flagArr,
    cantorArr,
  },
  utils: {
    chunk,
    ord,
    chr,
	tokenize,
	pinyinStd,
    numberStd,
  },
  InputHelper,
}

})();
