function bsearch (L: number[], fn: (number) => boolean) {
  let lo = -1, hi = L.length
  while (hi - lo > 1) {
    const mid = lo + ((hi - lo) >> 1)
    if (fn(mid)) hi = mid
    else lo = mid
  }
  return hi
}

// number theory
const NT = {
  // 辗转相除法求最大公约数
  gcd (a: number, b: number): number {
    if (isNaN(b) || isNaN(a)) return NaN
    if (b === 0) return a
    return NT.gcd(b, a % b)
  },
  // 扩展 Euclid 算法, 求最大公约数 d = a x + b y
  extgcd (a: number, b: number): { d: number, x: number, y: number } {
    if (b === 0) return { d: a, x: 1, y: 0 }
    const { d, x, y } = NT.extgcd(b, a % b)
    return { d, x: y, y: x - y * Math.floor(a / b) }
  },
  // 求 a 的 n 次方根, 并向下取整
  floorRoot (n: number, a: number): number {
    if (a < 0) return NaN
    let x = 1
    do x = Math.floor(
      ((n - 1) * x + Math.floor(a / x ** (n - 1))) / n
    )
    while (x ** n > a)
    return x
  },
  // 求 a 的平方根并向下取整
  sqrt (a: number): number {
    return NT.floorRoot(2, a)
  },
  // 快速幂
  pow (a: number, n: number, mod: number = Infinity): number {
    if (n < 0) return NaN
    let ret = 1
    while (n) {
      if (n & 1) ret = (ret * a) % mod
      a = (a * a) % mod
      n >>= 1
    }
    return ret
  },
  // 求 n 的所有正因子
  factors (n: number): number[] {
    const lo = []
    const hi = []
    const s = NT.sqrt(n)
    for (let d = 1; d <= s; ++d) {
      if (n % d === 0) {
          lo.push(d)
          hi.push(Math.floor(n / d))
      }
    }
    if (lo[lo.length - 1] === hi[hi.length - 1]) {
      lo.pop()
    }
    return lo.concat(hi.reverse())
  },
  // 求 n 的所有素因子
  primeFactors (n: number): number[] {
    const ret = []
    // 任何数最多只有一个大于根号 n 的素因子
    for (let p = 2; p * p <= n; ++p) {
      if (n % p === 0) {
        ret.push(p)
        do { n /= p } while (n % p === 0) // 将素因子 p 从 n 中除去
      }
    }
    if (n > 1) ret.push(n)
    return ret
  },
  // Euler 函数, O(sqrt(n))
  phi (n: number): number {
    let phi = n
    for (const p of NT.primeFactors(n)) {
      phi -= phi / p // phi *= (1-1/p)
    }
    return phi
  },
  // a 模 n 的阶 (指数)
  // 若 a 与 n 不互素, 返回 NaN
  order (a: number, n: number): number {
    if (a === 1) return 1
    if (Math.abs(NT.gcd(a, n)) !== 1) return NaN
    const phi = NT.phi(n)
    const factors = NT.factors(phi)
    const index = bsearch(factors, i => NT.pow(a, factors[i], n) === 1)
    if (index < factors.length) return factors[index]
    return phi
  },
  // 寻找模 n 的最小原根, 若不存在则返回 NaN
  // 由初等数论知道, n 存在原根当且仅当 n = 2, 4, p^k, 2*p^k, p 为奇素数
  primitiveRoot (n: number): number {
    if (n < 2) return NaN
    // 2 到 6 的最小原根分别是 1, 2, 3, 2, 5
    if (n === 5) return 2
    if (n <= 6) return n-1
    const phi = NT.phi(n)
    const primes = NT.primeFactors(phi)
    // 原根通常较小, 这个循环并不会真的执行 n 次
    for (let r = 2; r < n-1; ++r) {
      if (NT.gcd(r, n) === 1 && primes.every(p => NT.pow(r, phi/p, n) !== 1)) {
        return r
      }
    }
    return NaN
  },
}
