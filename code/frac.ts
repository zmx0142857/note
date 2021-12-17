type int = number | bigint

// 返回两个非负整数的最大公因数
function gcd (a: bigint, b: bigint): bigint {
  return b ? gcd(b, a % b) : a
}

function abs(n: bigint): bigint {
  return n < 0 ? -n : n
}

// 有理数
class Frac {
  num: bigint
  den: bigint

  constructor (num: int | string, den: bigint = 1n) {
    if (typeof num === 'string') {
      if (num.indexOf('/') > -1) {
        [ num, den ] = num.split('/').map(BigInt)
      } else {
        num = BigInt(num)
      }
    } else if (typeof num === 'number') {
      num = BigInt(num)
    }
    if (den === 0n) {
      throw new RangeError('frac division by zero')
    }
    this.num = num
    this.den = den
    this.simp()
  }

  simp (): Frac {
    if (this.den < 0) {
      this.num = -this.num
      this.den = -this.den
    }
    const d = gcd(abs(this.num), this.den)
    if (d > 1) {
      this.num /= d
      this.den /= d
    }
    return this
  }

  toString (): string {
    return this.num + '/' + this.den
  }

  floor (): bigint {
    return this.num / this.den
  }

  mod1 (): Frac {
    let num = this.num % this.den
    num = num < 0 ? num + this.den : num
    return new Frac(num, this.den)
  }

  copy (): Frac {
    return new Frac(this.num, this.den)
  }

  inv (): Frac {
    return new Frac(this.den, this.num).simp()
  }

  // 连分数
  frac (): [bigint] {
    let a = this.copy()
    let m = this.mod1()
    let ret: [bigint] = [a.floor()]
    while (m.num) {
      a = m.inv()
      m = a.mod1()
      ret.push(a.floor())
    }
    return ret
  }

  add (other: Frac): Frac {
    return new Frac(this.num * other.den + this.den * other.num, this.den * other.den).simp()
  }

  sub (other: Frac): Frac {
    return new Frac(this.num * other.den - this.den * other.num, this.den * other.den).simp()
  }

  mul (other: Frac): Frac {
    return new Frac(this.num * other.num, this.den * other.den).simp()
  }

  div (other: Frac): Frac {
    return new Frac(this.num * other.den, this.den * other.num).simp()
  }
}

function testFrac () {
  const a = new Frac('62/23')
  console.log(a.frac().map(Number))
}

function testMath () {
  console.log(new Frac('1/2').add(new Frac('1/3')).toString())
  console.log(new Frac('5/6').mul(new Frac('-1/2')).toString())
  console.log(new Frac(3).mul(new Frac('-1/2')).toString())
}
