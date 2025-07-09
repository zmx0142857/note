var Mat = (() => {

const range = (n, fn) => Array.from({ length: n }, (_, i) => fn(i))
const range2 = (m, n, fn) => range(m, i => range(n, j => fn(i, j)))
const round = (x, digits) => {
  const pow = Math.pow(10, digits)
  return Math.round(x * pow) / pow
}
const dot = (x, y) => x.reduce((sum, xi, i) => sum + xi * y[i], 0)
const scale = (x, k) => {
  x.forEach((_, i) => x[i] *= k)
  return x
}
var argmax = (a, b, fn) => {
  let max = -Infinity
  let res = undefined
  for (let i = a; i <= b; ++i) {
    const v = fn(i)
    if (v > max) {
      max = v
      res = i
    }
  }
  return res
}
var swap = (a, i, j) => {
  const tmp = a[i]
  a[i] = a[j]
  a[j] = tmp
}

class MatError extends Error {
  /**
   * @param {string} msg 错误描述
   * @param {object} info 附加信息
   */
  constructor (msg, info) {
    super(msg)
    this.name = 'MatError'
    this.info = info
  }
}

class Mat {

  /**
   * @param {number[][]} mat 矩阵
   * @param {object} options
   * @param {string[]} [options.title] 列标题
   */
  constructor (mat = [], { title = [] } = {}) {
    this.mat = mat
    this.title = title
  }

  get rows () {
    return this.mat.length
  }

  get cols () {
    return this.mat[0]?.length || 0
  }

  // 拷贝
  clone () {
    return new Mat(this.mat.map(row => row.slice()), { title: this.title.slice() })
  }

  // 转置
  trans () {
    const { mat, rows, cols } = this
    this.mat = range2(cols, rows, (i, j) => mat[j][i])
    return this
  }

  identity (n) {
    n = n || this.rows
    this.mat = range2(n, n, (i, j) => i === j ? 1 : 0)
    return this
  }

  isSquare () {
    return this.rows === this.cols
  }

  isSymm ({ eps = 1e-6 } = {}) {
    if (!this.isSquare()) return false
    const { mat, rows } = this
    for (let i = 0; i < rows; ++i) {
      for (let j = i + 1; j < rows; ++j) {
        if (Math.abs(mat[i][j] - mat[j][i]) > eps) return false
      }
    }
    return true
  }

  // 矩阵乘法, 返回新矩阵
  static mul (mat1, mat2) {
    const m1 = mat1.mat
    const m2 = mat2.mat
    const m = mat1.rows, n = mat2.cols, s = mat2.rows
    if (mat1.cols !== s) throw new MatError('matrices size mismatch', { m1, m2 })
    const res = range2(m, n, (i, j) => {
      let sum = 0
      for (let k = 0; k < s; ++k) {
        sum += m1[i][k] * m2[k][j]
      }
      return sum
    })
    return new Mat(res)
  }

  // this * mat, 结果保存到 this
  mul (mat) {
    const res = Mat.mul(this, mat)
    this.mat = res.mat
    return this
  }

  // mat * this, 结果保存到 this
  premul (mat) {
    const res = Mat.mul(mat, this)
    this.mat = res.mat
    return this
  }

  // jacobi 迭代法求特征值与特征向量, 要求实对称矩阵
  jacobi ({ eps = 1e-6 } = {}) {
    const { mat } = this
    const n = this.rows
    if (!this.isSymm()) throw new MatError('matrix must be symmetric', mat)

    let maxIter = n*n
    const eigvecs = new Mat().identity(n)
    const T = new Mat().identity(n)
    while (maxIter--) {
      const pivot = { i: 0, j: 0, value: 0 }
      const { mat } = this
      for (let i = 0; i < n; ++i) {
        for (let j = i + 1; j < n; ++j) {
          const abs = Math.abs(mat[i][j])
          if (abs > pivot.value) {
            pivot.i = i
            pivot.j = j
            pivot.value = abs
          }
        }
      }
      if (pivot.value <= eps) break
      const { i, j } = pivot
      const theta = Math.atan2(2*mat[i][j], mat[i][i] - mat[j][j]) / 2
      const sin = Math.sin(theta), cos = Math.cos(theta)

      // 构造旋转矩阵 T
      T.identity(n)
      T.mat[i][i] = T.mat[j][j] = cos
      T.mat[i][j] = sin
      T.mat[j][i] = -sin

      // this = T * this * T^-1
      this.premul(T).mul(T.trans())
      eigvecs.mul(T)
    }
    const eigvals = range(n, i => this.mat[i][i])
    return [eigvals, eigvecs]
  }

  // QR 分解 (Schmidt 正交化)
  // 要求各列向量线性无关
  QR ({ eps = 1e-6 } = {}) {
    const { rows, cols } = this
    const Q = this.clone().trans()
    const R = new Mat().identity(cols)

    for (let i = 1; i < cols; ++i) {
      for (let j = 0; j < i; ++j) {
        let alpha = R.mat[j][i] = dot(Q.mat[i], Q.mat[j]) / dot(Q.mat[j], Q.mat[j])
        if (!Number.isFinite(alpha)) throw new MatError('cols are dependent', this.mat)
        for (let k = 0; k < rows; ++k) {
          Q.mat[i][k] -= alpha * Q.mat[j][k]
        }
      }
    }
    for (let i = 0; i < cols; ++i) {
      const len = Math.hypot(...Q.mat[i])
      if (Math.abs(len) <= eps) throw new MatError('cols are dependent', this.mat)
      scale(Q.mat[i], 1/len)
      scale(R.mat[i], len)
    }
    return [Q.trans(), R]
  }

  // 用 QR 迭代法求特征值与特征向量, 要求对称可逆实方阵.
  // 注意: 当矩阵不对称时, 返回的特征向量是错的.
  eigQR ({ eps = 1e-6 } = {}) {
    if (!this.isSquare()) throw new MatError('matrix must be square', this.mat)
    const n = this.rows
    const isRightTriangle = ({ mat }) => {
      for (let i = 1; i < n; ++i) {
        for (let j = 0; j < i; ++j) {
          if (Math.abs(mat[i][j]) > eps) return false
        }
      }
      return true
    }
    /** @type {Mat} */
    let A = this
    let T = new Mat().identity(n)
    let maxIter = 4*n*n
    while (maxIter-- && !isRightTriangle(A)) {
      const [Q, R] = A.QR({ eps })
      A = R.mul(Q)
      T.mul(Q)
    }
    const eigvals = range(n, i => A.mat[i][i])
    return [eigvals, T]
  }

  /**
   * @param {number} [digits] 保留的小数位数, 传入 undefined 则不作处理
   */
  toString (digits) {
    const str = digits === undefined ? String : n => String(round(n, digits))
    const width = Math.max(...this.mat.flat().map(n => str(n).length))
    const content = this.mat.map(row =>
      row.map(item => str(item).padStart(width)).join(' ')
    ).join('\n')
    const title = this.title.length
      ? this.title.map(item => item.padStart(width)).join(' ') + '\n'
      : ''
      return title + content
  }

  /**
   * 求解以 this.mat 为增广矩阵的线性方程组, 将结果
   * X0 + k1 T1 + ... + kn Tn 保存到返回的矩阵中
   * 其中 X0 是特解, T1 ... Tn 是齐次方程的基础解系
   * @param {object} options
   * @param {boolean} [options.verbose] 是否显示过程
   * @param {number} [options.eps] 允许误差
   * @returns {Mat}
   * @throws {MatError} 无解时报错
   */
  solve ({ verbose = false, eps = 1e-6 } = {}) {
    const m = this.clone()
    const { mat, rows, cols } = m
    const base = Object.create(null) // 选为基向量的列
    const baseRows = Object.create(null) // 基向量的 "1" 所在的行
    const nonbase = [] // 非基向量的列
    for (let col = 0; col < cols-1; ++col) {
      // 选定列主元, 即 col 列绝对值最大元素; 跳过那些已选出主元的行 (in baseRows)
      const row = argmax(0, rows-1, r => (r in baseRows) ? -Infinity : Math.abs(mat[r][col]))
      if (row === undefined || Math.abs(mat[row][col]) <= eps) {
        nonbase.push(col)
        continue
      }
      const pivot = mat[row][col]
      base[col] = row
      baseRows[row] = col
      // 该行同乘一个倍数, 使主元化为 1
      for (let c = 0; c < cols; ++c) {
        mat[row][c] /= pivot
      }
      // 行变换消元, 把 col 列除主元所在行以外全部化为 0
      for (let r = 0; r < rows; ++r) {
        if (r === row) continue
        for (let c = 0; c < cols; ++c) {
          if (c === col) continue
          mat[r][c] -= mat[row][c] * mat[r][col]
        }
        mat[r][col] = 0
      }
      if (verbose) console.log(m.toString() + '\n')
    }

    // 无解情形
    for (let r = 0; r < rows; ++r) {
      if (r in baseRows) continue
      if (Math.abs(mat[r][cols-1]) > eps) throw new MatError('no solution', this.mat)
    }

    // 输出特解
    const title = ['']
    const ret = range(cols-1, () => [])
    ret.forEach((row, i) => {
      const index = base[i]
      row.push(index !== undefined ? mat[index][cols-1] : 0)
    })

    // 非基变量取负移到右边
    nonbase.forEach(col => {
      title.push('x' + (col+1))
      ret.forEach((row, i) => {
        const index = base[i]
        row.push(index !== undefined ? -mat[index][col] : i === col ? 1 : 0)
      })
    })

    return new Mat(ret, { title })
  }

  // 秩
  rank ({ verbose = false, eps = 1e-6 } = {}) {
    return this.clone().gauss({ verbose, eps })
  }

  // 在 this.mat 上执行 gauss 消元, 转化为上三角形, 并返回秩
  // 此方法会改变 this.mat
  // 时间复杂度为 O(n^3)
  gauss ({ verbose = false, eps = 1e-6 } = {}) {
    const { mat, rows, cols } = this
    let baseCount = 0
    for (let col = 0; col < cols; ++col) {
      // 选出列主元 (当前列中绝对值最大的元素)
      const row = argmax(baseCount, rows-1, r => Math.abs(mat[r][col]))
      if (row === undefined || Math.abs(mat[row][col]) <= eps) continue
      const pivot = mat[row][col]
      swap(mat, row, baseCount)

      for (let r = baseCount+1; r < rows; ++r) {
        const v = mat[r][col] / pivot
        for (let c = col; c < cols; ++c) {
          mat[r][c] -= v * mat[baseCount][c]
        }
      }

      ++baseCount
      if (verbose && baseCount < Math.min(rows, cols)) console.log(this.toString() + '\n')
    }
    return baseCount
  }

  // 求解以 this.mat 为增广矩阵的线性方程组, 要求系数矩阵是可逆的上三角阵
  // 时间复杂度为 O(n^2)
  triangularSolve ({ eps = 1e-6 }) {
    const { mat, rows, cols } = this
    if (cols !== rows + 1) {
      console.error(this.mat)
      throw new Error('matrix must have shape (n, n+1)')
    }
    const x = []
    for (let r = rows-1; r >= 0; --r) {
      const pivot = mat[r][r]
      if (Math.abs(pivot) <= eps) {
        console.error(this.mat)
        throw new Error('matrix not invertable')
      }

      let b = mat[r][cols-1]
      for (let c = r+1; c < cols-1; ++c) {
        b -= mat[r][c] * x[c]
      }
      x[r] = b / pivot
    }
    return x
  }

  // Gauss 消元法求解以 this.mat 为增广矩阵的线性方程组, 要求系数矩阵可逆
  gaussSolve ({ verbose = false, eps = 1e-6 } = {}) {
    const { rows, cols } = this
    if (cols !== rows + 1) {
      console.error(this.mat)
      throw new Error('matrix must have shape (n, n+1)')
    }
    const m = this.clone()
    m.gauss({ verbose, eps }) // 消元步骤
    return m.triangularSolve({ eps }) // 代入步骤
  }
}

// if (typeof module !== 'undefined') {
//     module.export = Mat
// }

function testToString () {
  const m = new Mat([
    [1, 1, 4],
    [5, 1, 114]
  ])
  console.log(m.toString())
}

function testSolve () {
  console.log(new Mat([
    [1, 1, 0, -3, -1, 0],
    [1, -1, 2, -1, 0, 0],
    [4, -2, 6, 3, -4, 0],
    [2, 4, -2, 4, -7, 0]
  ]).solve().toString())
  /*
 X0                 T2                 T4
  0                 -1 1.1666666666666667
  0                  1 0.8333333333333334
  0                  1                  0
  0                  0 0.3333333333333333
  0                  0                  1
  */

  console.log(new Mat([
    [5, 6, -2, 7, 4, 23],
    [2, 3, -1, 4, 2, 12],
    [7, 9, -3, 5, 6, 23],
    [5, 9, -3, 1, 6, 13]
  ]).solve().toString())
  /*
                  X0                      T2                      T4
  0.9999999999999964 -2.2204460492503136e-16   4.440892098500627e-16
  0.6666666666666685      0.3333333333333334     -0.6666666666666669
                   0                       1                       0
   2.000000000000001   5.551115123125784e-17 -1.1102230246251568e-16
                   0                       0                       1
  */

  console.log(new Mat([
    [1, -1, 1, -1, 1],
    [1, -1, -1, 1, 0],
    [1, -1, -2, 2, -0.5]
  ]).solve().toString())
  /*
   X0  T1  T3
  0.5   1   0
    0   1   0
  0.5   0   1
    0   0   1
  */
}

return Mat
})()
