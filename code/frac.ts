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

  constructor (num: bigint | string, den: bigint = 1n) {
    if (typeof num == 'string') {
      [ num, den ] = num.split('/').map(BigInt)
    }
    if (den === 0n) {
      throw new RangeError('frac division by zero')
    } else if (den < 0) {
      num = -num
      den = -den
    }
    this.num = num
    this.den = den
    this.simp()
  }

  simp (): void {
    const d = gcd(abs(this.num), this.den)
    if (d > 1) {
      this.num /= d
      this.den /= d
    }
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
    return new Frac(this.den, this.num)
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
}

let a = new Frac('62/23')
console.log(a.frac().map(Number))