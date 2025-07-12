var Complex = (() => {
const round = (x, digits) => {
  const pow = Math.pow(10, digits)
  return Math.round(x * pow) / pow
}

class Complex {
  static i = Object.freeze(new Complex(0, 1))

  /**
   * @param {number} real 
   * @param {number} imag 
   */
  constructor (real = 0, imag = 0) {
    this.real = real
    this.imag = imag
  }

  static of (a) {
    if (a instanceof Complex) return a
    return new Complex(a)
  }

  clone () {
    return new Complex(this.real, this.imag)
  }

  conj () {
    return new Complex(this.real, -this.imag)
  }

  abs2 () {
    return this.real * this.real + this.imag * this.imag
  }

  abs () {
    return Math.hypot(this.real, this.imag)
  }

  neg () {
    return this.mul(-1)
  }

  exp () {
    return Complex.i.mul(Math.sin(this.imag))
      .addBy(Math.cos(this.imag))
      .mulBy(Math.exp(this.real))
  }

  // n 为非负整数, 取值范围 uint32
  pow (n) {
    let ret = new Complex(1)
    let base = this.clone()
    while (n) {
      if (n & 1) ret.mulBy(base)
      base.mulBy(base)
      n >>>= 1
    }
    return ret
  }

  // 结果保存在原地
  addBy (a) {
    a = Complex.of(a)
    this.real += a.real
    this.imag += a.imag
    return this
  }

  subBy (a) {
    a = Complex.of(a)
    this.real -= a.real
    this.imag -= a.imag
    return this
  }

  mulBy (a) {
    if (typeof a === 'number') {
      this.real *= a
      this.imag *= a
    } else {
      const { real, imag } = this
      const { real: aReal, imag: aImag } = a
      this.real = real * aReal - imag * aImag
      this.imag = real * aImag + imag * aReal
    }
    return this
  }

  divBy (a) {
    if (typeof a === 'number') {
      this.real /= a
      this.imag /= a
      return this
    }
    return this.mulBy(a.conj()).divBy(a.abs2())
  }

  add (a) {
    return this.clone().addBy(a)
  }

  sub (a) {
    return this.clone().subBy(a)
  }

  mul (a) {
    return this.clone().mulBy(a)
  }

  div (a) {
    return this.clone().divBy(a)
  }

  /**
   * @param {number} [digits] 保留的小数位数, 传入 undefined 则不作处理
   */
  toString (digits) {
    const str = digits === undefined ? String : n => String(round(n, digits))
    const real = str(this.real)
    const imag = str(this.imag)
    const sign = imag[0] === '-' ? '' : '+'
    return `${real}${sign}${imag}i`
  }
}

function testMath() {
  console.log(new Complex(2).pow(6))
}

return Complex
})()