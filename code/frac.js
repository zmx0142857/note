var Frac = (() => {
/** @typedef {number | bigint} int */

/**
 * 返回两个非负整数的最大公因数
 * @param {bigint} a
 * @param {bigint} b
 * @returns {bigint}
 */
function gcd (a, b) {
  return b ? gcd(b, a % b) : a
}

/**
 * @param {bigint} n
 * @returns {bigint}
 */
function abs(n) {
  return n < 0 ? -n : n
}

// 有理数
class Frac {
  num
  den

  /**
   * @param {int | string | bigint} [num] 分子
   * @param {int | string | bigint} [den] 分母
   */
  constructor (num = 0, den = 1) {
    if (typeof num === 'string' && num.indexOf('/') > -1) [num, den] = num.split('/')
    if (typeof num === 'number' || typeof num === 'string') num = BigInt(num)
    if (typeof den === 'number' || typeof den === 'string') den = BigInt(den)
    if (den === 0n) throw new RangeError('frac division by zero')
    this.num = num
    this.den = den
    this.simp()
  }

  static of (a) {
    if (a instanceof Frac) return a
    return new Frac(a)
  }

  clone () {
    const res = new Frac()
    res.num = this.num
    res.den = this.den
    return res
  }

  simp () {
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

  toString () {
    return this.num + '/' + this.den
  }

  floor () {
    // 执行 bigint 的整数除法
    return this.num / this.den
  }

  /**
   * @param {number | bigint} n
   */
  mod (n = 1) {
    if (typeof n === 'number') n = BigInt(n)
    const d = n * this.den
    let num = this.num % d
    num = num < 0 ? num + d : num
    return new Frac(num, this.den)
  }

  copy () {
    return new Frac(this.num, this.den)
  }

  inv () {
    return new Frac(this.den, this.num)
  }

  neg () {
    return new Frac(-this.num, this.den)
  }

  /**
   * 连分数
   * @returns {bigint[]}
   */
  frac () {
    let a = this.copy()
    let m = this.mod(1)
    let ret = [a.floor()]
    while (m.num) {
      a = m.inv()
      m = a.mod(1)
      ret.push(a.floor())
    }
    return ret
  }

  // 结果保存在原地
  addBy (a) {
    a = Frac.of(a)
    this.num = this.num * a.den + this.den * a.num
    this.den *= a.den
    return this.simp()
  }

  subBy (a) {
    a = Frac.of(a)
    this.num = this.num * a.den - this.den * a.num
    this.den *= a.den
    return this.simp()
  }

  mulBy (a) {
    a = Frac.of(a)
    this.num *= a.num
    this.den *= a.den
    return this.simp()
  }

  divBy (a) {
    a = Frac.of(a)
    this.num *= a.den
    this.den *= a.num
    return this.simp()
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
}

function testFrac () {
  const a = new Frac('62/23')
  console.log(a.frac().map(Number)) // [2,1,2,3,2]
}

function testMath () {
  console.log(new Frac('1/2').add(new Frac('1/3')).toString()) // 5/6
  console.log(new Frac('5/6').mul(new Frac('-1/2')).toString()) // -5/12
  console.log(new Frac(3).mul(new Frac('-1/2')).toString()) // -3/2
}

return Frac
})()