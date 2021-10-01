const symbols = {
  '+': 0,
  '-': 1,
  '*': 2,
  '/': 3,
  '(': 4,
  ')': 5,
  'EOL': 6,
}

const prec = [
  ['>', '>', '<', '<', '<', '>', '>'],
  ['>', '>', '<', '<', '<', '>', '>'],
  ['>', '>', '>', '>', '<', '>', '>'],
  ['>', '>', '>', '>', '<', '>', '>'],
  ['<', '<', '<', '<', '<', '=', 'N'],
  ['>', '>', '>', '>', 'N', '>', '>'],
  ['<', '<', '<', '<', '<', 'N', '=']
]

function tokenize (str) {
  // 匹配整数或变量或 +-*/()
  let match = str.match(/-?\d+|[a-zA-Z_][a-zA-Z_]*|[+\-*/()]/g)
  if (!match) return []
  return match.map(s => /^\d+$/.test(s) ? parseInt(s) : s)
}

function areNumbers (...args) {
  return args.every(arg => typeof arg === 'number')
}

function operate(op, x, y) {
  switch (op) {
    case '+': return areNumbers(x, y) ? x + y : x.add(y)
    case '-': return areNumbers(x, y) ? x - y : x.sub(y)
    case '*': return areNumbers(x, y) ? x * y : x.mul(y)
    case '/': return areNumbers(x, y) ? x / y : x.div(y)
  }
}

function parse (str) {
  const gen = (tokenize(str).concat(['EOL']))[Symbol.iterator]() // 生成器
  let token = gen.next()
  let operator = ['EOL'], operand = []
  while (operator.length) {
    const sym2 = symbols[token.value]
    if (sym2 === undefined) {
      const num = eval(token.value)
      operand.push(num)
      token = gen.next()
    } else { // type operator
      const sym1 = symbols[operator[operator.length-1]]
      const pr = prec[sym1][sym2]
      if (pr === '<') {
        operator.push(token.value)
        token = gen.next()
      } else if (pr === '=') {
        operator.pop()
        token = gen.next()
      } else if (pr === '>') {
        const op = operator.pop()
        const y = operand.pop()
        const x = operand.pop()
        operand.push(operate(op, x, y))
      } else {
        throw new Error('invalid expression')
      }
    }
  }
  return operand[operand.length-1]
}

const Complex = require('./complex.js')

// const a = 3, b = 5, c = 2
const a = new Complex(3), b = new Complex(5), c = new Complex(2)
const str = '(a + b) * c'
const res = parse(str)
console.log(res) // 16
