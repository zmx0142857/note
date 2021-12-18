class Mat {

  mat: number[][]
  title: string[]

  constructor (mat: number[][], title: string[] = []) {
    this.mat = mat
    this.title = title
  }

  copy (): Mat {
    return new Mat(this.mat.map(row => row.slice()), this.title.slice())
  }

  /**
   * 输出矩阵
   * @param digits 保留的小数位数, 传入 undefined 则不作处理
   */
  toString (digits?: number): string {
    let str: (n: number) => string
    if (digits !== undefined) {
      digits = 10**digits
      str = n => String(Math.round(n * digits!!) / digits!!)
    } else {
      str = n => String(n)
    }
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
   * 返回指定列中绝对值最大元素的行号
   * @param col 列号
   * @param baseRows 已选出主元的行, 应该跳过
   */
  colMax (col: number, baseRows: Object): number {
    const { mat } = this
    let max = 0
    let row = -1
    for (let r = 0; r < mat.length; ++r) {
      if (r in baseRows) continue
      const value = Math.abs(mat[r][col])
      if (value > max) {
        row = r
        max = value
      }
    }
    return row
  }

  /**
   * 求解以 this.mat 为增广矩阵的线性方程组, 将结果
   * k1 T1 + ... + kn Tn + X0 保存到返回的矩阵中
   * 若方程组无解, 返回空矩阵 [[]]
   * @param verbose 显示过程
   */
  solve (verbose: boolean = false): Mat {
    const epsi = 1e-6
    const m = this.copy()
    const mat = m.mat
    const rows = mat.length
    const cols = mat[0].length
    const base = Object.create(null) // 选为基向量的列
    const baseRows = Object.create(null) // 基向量的 "1" 所在的行
    const nonbase: number[] = [] // 非基向量的列
    for (let col = 0; col < cols-1; ++col) {
      // 选定列主元
      const row = m.colMax(col, baseRows)
      if (row < 0 || Math.abs(mat[row][col]) <= epsi) {
        nonbase.push(col)
        continue
      }
      const pivot = mat[row][col]
      base[col] = row
      baseRows[row] = col
      // 该行同乘一个倍数
      for (let c = 0; c < cols; ++c) {
        mat[row][c] /= pivot
      }
      // 通过行变换消元, 把该列化为 0; 0; 1; 0
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

    // 输出特解 X0
    const title = ['X0']
    const ret: number[][] = Array.from({ length: cols-1 }, () => [])
    ret.forEach((row, i) => {
      const index = base[i]
      row.push(index !== undefined ? mat[index][cols-1] : 0)
    })

    // 非基向量取负移到右边
    nonbase.forEach(col => {
      title.push('T' + col)
      ret.forEach((row, i) => {
        const index = base[i]
        row.push(index !== undefined ? -mat[index][col] : i === col ? 1 : 0)
      })
    })

    return new Mat(ret, title)
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
