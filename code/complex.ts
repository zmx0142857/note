class Complex {
  real: number
  imag: number

  static i: Complex = new Complex(0, 1)

  constructor (real: number, imag: number = 0) {
    this.real = real
    this.imag = imag
  }

  static of (a: Complex | number): Complex {
    return typeof a === 'number' ? new Complex(a) : a
  }

  copy (): Complex {
    return new Complex(this.real, this.imag)
  }

  conj (): Complex {
    return new Complex(this.real, -this.imag)
  }

  abs (): number {
    return Math.hypot(this.real, this.imag)
  }

  neg (): Complex {
    return this.mul(-1)
  }

  exp (): Complex {
    return Complex.i.mul(Math.sin(this.imag))
      .add(Math.cos(this.imag))
      .mul(Math.exp(this.real))
  }

  // n is non-negative integer
  pow (n: number): Complex {
    let ret = new Complex(1)
    let base = this.copy()
    while (n) {
      if (n & 1) ret = ret.mul(base)
      base = base.mul(base)
      n >>= 1
    }
    return ret
  }

  add (a: Complex | number): Complex {
    return Complex.add(this, a)
  }

  sub (a: Complex | number): Complex {
    return Complex.sub(this, a)
  }

  mul (a: Complex | number): Complex {
    if (typeof a === 'number')
      return new Complex(this.real * a, this.imag * a)
    return Complex.mul(this, a)
  }

  div (a: Complex | number): Complex {
    if (typeof a === 'number')
      return new Complex(this.real / a, this.imag / a)
    return Complex.div(this, a)
  }

  static add (a: Complex | number, b: Complex | number): Complex {
    a = Complex.of(a)
    b = Complex.of(b)
    return new Complex(a.real + b.real, a.imag + b.imag)
  }

  static sub (a: Complex | number, b: Complex | number): Complex {
    a = Complex.of(a)
    b = Complex.of(b)
    return new Complex(a.real - b.real, a.imag - b.imag)
  }

  static mul (a: Complex, b: Complex): Complex {
    return new Complex(
      a.real * b.real - a.imag * b.imag,
      a.real * b.imag + a.imag * b.real
    )
  }

  static div (a: Complex, b: Complex): Complex {
    return a.mul(b.conj()).mul(1 / b.abs())
  }
}

/*
function f (t: number): Complex {
  const z = Complex.i.mul(t).exp().mul(3)
  return Complex.mul(
    z.pow(2).add(1),
    z.sub(1).pow(5)
  )
}
console.log(new Complex(2).pow(6))
*/

if (typeof module !== 'undefined')
  module.exports = Complex
