// lp = 老婆 (❎️), 线性规划 linear programming (✅️)
class LP {
  static EPS = 1e-8
  static status = {
      RUNNING: 0,
      FOUND: 1,
      UNBOUNDED: 2,
      NO_SOLUTION: 3,
      TODO: 4
  } 
  mat: number[][] // m 行, m+n+1 列
  base: number[] // m 个基变量的下标
  vars: string[] // n 个变量名

  static makeArr (length: number, callback: (i: number) => any) {
      return Array.from({ length }, (_, i) => callback(i))
  }

  /**
   * 初始化标准形线性规划
   * max f = c^T x
   * A x <= b
   * x >= 0
   * @param A m x n 矩阵
   * @param b m 维向量
   * @param c n 维向量
   */
  constructor (A: number[][], b: number[], c: number[], vars: string[] = []) {
    const m = b.length
    const n = c.length
    
    this.mat = A // 将 mat 改造为 (m+1) * (m+n+1) 矩阵
    this.mat.forEach((row, i) => {
      for (let j = 0; j < m; ++j) {
        row.push(i === j ? 1 : 0) // 为每个约束添加松弛变量
      }
      row.push(b[i])
    })
    const lastRow = []
    for (let j = 0; j < n; ++j)
      lastRow.push(-c[j])
    for (let j = 0; j <= m; ++j)
      lastRow.push(0)
    this.mat.push(lastRow)

    this.base = LP.makeArr(m, i => n + i + 1)
    
    this.vars = vars.length
      ? ['_0', ...vars, ...LP.makeArr(m, i => `_${n+i}`)]
      : LP.makeArr(m + n + 1, i => `x${i}`)
  }

  /**
   * 输出当前的单纯形表
   * @param digits 保留的小数位数, 传入 0 则不作处理
   */
  toString (digits: number = 4): string {
    let str: (x: number) => string
    if (digits) {
      digits = 10**digits
      str = x => String(Math.round(x * digits!!) / digits!!)
    } else {
      str = x => String(x)
    }
    const width = Math.max(...this.mat.flat().map(x => str(x).length))
    const varWidth = Math.max(...this.vars.map(s => s.length))
    const format = (x: number) => str(x).padStart(width)
    const m = this.mat.length - 1
    const n = this.mat[0].length - m - 1
    const lastRow = this.mat[m]
    const head = 'f'.padEnd(varWidth) + ' | '
      + lastRow.slice(0, -1).map(format).join(' ')
      + ' | ' + format(lastRow[m+n])
    const content = this.mat.slice(0, -1).map((row, i) =>
      this.vars[this.base[i]].padEnd(varWidth) + ' | '
      + row.slice(0, -1).map(format).join(' ')
      + ' | ' + format(row[m+n])
    ).join('\n')
    return head + '\n' + content + '\n'
  }

  // 换入变量为 swapin, 换出变量为 base[swapout]
  rotate (swapin: number, swapout: number, addone: number) {
    this.base[swapout] = swapin + addone
    const pivot = this.mat[swapout][swapin]
    for (let j = 0; j < this.mat[swapout].length; ++j) {
      this.mat[swapout][j] /= pivot
    }
    for (let i = 0; i < this.mat.length; ++i) {
      if (i !== swapout) {
        const r = -this.mat[i][swapin]
        for (let j = 0; j < this.mat[i].length; ++j) {
          this.mat[i][j] += this.mat[swapout][j] * r
        }
      }
    }
  }

  // 求解一个具有初始可行基解的松弛形
  solve_slack(instruction: number) {
    const addone = instruction === -1 ? 1 : 0
    console.log(this.toString())
    // 换入换出指示
    if (instruction > -1) {
      this.rotate(0, instruction, addone)
    }

    const m = this.mat.length - 1
    const n = this.mat[0].length - m - 1

    // (n+m choose m)
    let cnt = 1;
    for (let i = 1; i <= m; ++i) {
      cnt *= n + i;
      cnt /= i;
    }

    let status = LP.status.RUNNING
    while (status === LP.status.RUNNING && cnt--) {

      // 打印计算过程
      console.log(this.toString())

      // 确定换入变量
      const swapin = this.mat[m].findIndex(x => x <= -LP.EPS)
      if (swapin === -1 || swapin === m + n) {
        console.log("solution found")
        status = LP.status.FOUND
        break
      }

      // 计算最紧约束, 确定换出变量
      let swapout = -1
      let min = Infinity
      for (let i = 0; i < m; ++i) {
        const tmp = this.mat[i][swapin] > LP.EPS
          ? this.mat[i][n+m] / this.mat[i][swapin] : Infinity
        if (tmp < min) {
          min = tmp
          swapout = i
        }
      }
      if (swapout === -1) {
        console.log("unbounded solution")
        status = LP.status.UNBOUNDED
        break
      }

      // 旋转
      this.rotate(swapin, swapout, addone)
    }

    // 超过最大迭代次数限制
    if (status === LP.status.RUNNING) {
      console.log("max iterations exceeded")
    }
    return status
  }

  // 构造辅助线性规划, 引入人工变量 x0, 要求最大化 -x0
  solve_helper (swapout: number) {
    const m = this.mat.length - 1
    const n = this.mat[0].length - m - 1

    // helper 是 (m+1) * (m+n+2) 矩阵, 我们对 mat 进行原地改造
    for (let i = 0; i < m; ++i) {
      this.mat[i].unshift(-1)
    }
    const savedLastRow = this.mat[m]
    this.mat[m] = LP.makeArr(m + n + 2, j => j === 0 ? 1 : 0)

    // 换入 x0, 换出 swapout
    console.log("constructing helper LP...")

    // 辅助线性规划是否取得最优解 0
    if (swapout === -1 || this.solve_slack(swapout) !== LP.status.FOUND) return
    if (Math.abs(this.mat[m][m+n+1]) >= LP.EPS) {
      return console.log("the helper LP failed. original problem has no solution")
    }

    // 若 x0 是基变量, 执行一次退化旋转使它成为非基变量
    for (let i = 0; i < m; ++i) {
      if (this.base[i] === 0) {
        for (let j = 0; j <= m+n; ++j) {
          if (!this.base.includes(j) && Math.abs(this.mat[i][j]) > LP.EPS) {
            this.rotate(j, i, 0)
            console.log(this.toString())
            break
          }
        }
        break
      }
    }
    console.log("the helper LP has got optimal value")

    // 去掉 x0, 重置目标函数
    this.mat[m] = savedLastRow
    for (let i = 0; i < m; ++i) {
      this.mat[i].shift()
      for (let j = 0; j <= m + n; ++j) {
        if (this.mat[i][j] < -1e8) {
          console.log(i, j, this.mat[i][j])
          console.log("lp internal error")
          return
        }
      }
      const r = -this.mat[m][this.base[i]-1]
      if (Math.abs(r) > LP.EPS) {
        for (let j = 0; j <= m + n; ++j) {
          this.mat[m][j] += this.mat[i][j] * r
        }
      }
    }
    return this.solve_slack(-1) // 不作换入换出的指示
  }

  // 单纯形法求解线性规划
  solve () {
    console.log('solving...')
    console.log(this.toString())

    const m = this.mat.length - 1
    const n = this.mat[0].length - m - 1

    // 判断初始基解是否可行
    let minb = 0
    let swapout = -1
    for (let i = 0; i < m; ++i) {
      if (this.mat[i][m+n] < minb) {
        minb = this.mat[i][m+n];
        swapout = i;
      }
    }

    if (swapout > -1) {
      return this.solve_helper(swapout)
    } else {
      return this.solve_slack(-1) // 不作换入换出的指示
    }
  }

  /**
   * 从字符串初始化线性规划.
   * 第一行指定目标函数:
   *   max 3x - y - z
   * 接下来 m 行指定约束:
   *   x - 2y + z <= 11
   *   4x - y - 2z <= -3
   *   -2x + z <= 1
   *   2x - z <= -1
   * 默认每个变量都取非负实数, 如果某些变量可以取全体实数, 则将它们在最后一行列出:
   *   free x y z
   */
  static from (input: string) {
    const freeVars: string[] = []
    const vars: string[] = []
    const A: number[][] = []
    const b: number[] = []
    const c: number[] = []
    let i = 0
    input.split('\n').forEach((line, lineNo) => {
      line = line.trim()
      if (/^free /.test(line)) { // 自由变元
        // TODO
        freeVars.push(...line.slice(5).trim().split(/\s/))
      } else if (/^(min|max) /.test(line)) { // 目标函数
        const s = line.slice(0,3) === 'min' ? -1 : 1
        LP.parseExpr(line.slice(4), lineNo, vars, c, s)
      } else if (/<=|>=|=/.test(line)) { // 约束
        const match = line.match(/<=|>=|=/)
        const sign = match![0]
        const arr = line.split(sign)
        if (sign === '<=' || sign === '=') {
          const s = 1
          b[i] = Number(arr[1].trim()) * s
          if (isNaN(b[i])) throw new Error(`Line ${lineNo+1}: '${arr[1].trim()}' is not a number: `)
          A.push([])
          LP.parseExpr(arr[0].trim(), lineNo, vars, A[i], s)
          ++i
        }
        if (sign === '>=' || sign === '=') {
          const s = -1
          b[i] = Number(arr[1].trim()) * s
          if (isNaN(b[i])) throw new Error(`Line ${lineNo+1}: '${arr[1].trim()}' is not a number: `)
          A.push([])
          LP.parseExpr(arr[0].trim(), lineNo, vars, A[i], s)
          ++i
        }
      } else if (line.trim() !== '') {
        throw new Error(`Line ${lineNo+1}: invalid input '${line.trim()}`)
      }
    })
    const fillZero = (row: number[]) => {
      for (let j = 0; j < vars.length; ++j) {
        row[j] = row[j] || 0
      }
    }
    A.forEach(fillZero)
    fillZero(c)
    return new LP(A, b, c, vars)
  }

  /**
   * 读入线性表达式, 如 -3x - y - z
   * @param input 表达式
   * @param lineNo 行号
   * @param vars 变量标识符表
   * @param row 系数矩阵的一行
   * @param sign 所有系数同乘一个符号
   */
  static parseExpr (input: string, lineNo: number,
     vars: string[], row: number[], sign: number) {
    const itemReg = /^\s*(-?\d+(\.\d+)?)?\s*\*?\s*([_a-zA-Z]?[_a-zA-Z0-9]*)/
    const signReg = /^\s[+-]/
    let s = sign
    while (input.length) {
      // 匹配一项
      let m = input.match(itemReg)
      //console.log(m)
      if (!m) throw new Error(`Line ${lineNo+1}: invalid input '${input}'`)
      input = input.slice(m[0].length)

      // 处理系数与变量标识符
      const sym = m[3]
      let index = vars.indexOf(sym)
      if (index === -1) {
        index = vars.length
        vars.push(sym)
      }
      const coef = m[1] ? Number(m[1]) : 1
      row[index] = coef * s

      // 匹配两项间的加减号
      if (!input.length) break
      m = input.match(signReg)
      //console.log(m)
      if (!m) break
      input = input.slice(m[0].length)

      // 决定下一项的符号
      s = m[0].trim() === '-' ? -sign : sign
    }
  }
}

function test01 () {
  new LP([
      [1, -2, 1],
      [4, -1, -2],
      [-2, 0, 1],
      [2, 0, -1]
    ],
    [11, -3, 1, -1],
    [3, -1, -1],
    ['x', 'y', 'z']
  ).solve()
}

function test02 () {
  console.log(LP.from(`
    max 3x - y - z
    x - 2y + z <= 11
    4x - y - 2z <= -3
    -2x + z <= 1
    2x - z <= -1
    free x y z
  `).toString())
}
