// 运输问题
class TransportProblem {
  type: number // -1: 供不应求, 0: 产销平衡, 1: 供过于求'
  cost: number[][] // m x n 价格矩阵
  produce: number[] // m 维产量数组
  consume: number[] // n 维销量数组
  m: number // 行数
  n: number // 列数

  solution!: number[][] // 运输方案
  base!: number[][] // 基变量的行列位置

  rowVisited!: boolean[] // 访问过的行 (用于生成初始解)
  colVisited!: boolean[] // 访问过的列 (用于生成初始解)

  constructor (cost: number[][], produce: number[], consume: number[]) {
    // 保证输入非负
    // if (cost.some(row => row.some(v => v < 0)) || produce.some(v => v < 0) || consume.some(v => v < 0)) {
    //   throw new Error('input numbers must >= 0')
    // }

    // 判断类型
    const diff = produce.reduce((x, y) => x + y) - consume.reduce((x, y) => x + y)
    if (this.isZero(diff)) { // 产销平衡
      this.type = 0
    } else if (diff > 0) { // 供过于求
      this.type = 1
      cost.forEach(row => row.push(0))
      consume.push(diff)
    } else { // 供不应求
      this.type = -1
      cost.push(Array.from({ length: consume.length }, () => 0))
      produce.push(-diff)
    }

    this.cost = cost
    this.produce = [...produce]
    this.consume = [...consume]
    this.m = produce.length
    this.n = consume.length
  }

  private isZero (v: number) {
    return Math.abs(v) < 1e-8
  }

  private init () {
    const { m, n } = this
    Object.assign(this, {
      solution: Array.from({ length: m }, () => Array.from({ length: n }, () => 0)),
      rowVisited: Array.from({ length: m }, () => false),
      colVisited: Array.from({ length: n }, () => false),
      base: [],
    })
  }

  private * rows () {
    const { m, rowVisited } = this
    for (let i = 0; i < m; ++i) {
      if (rowVisited[i]) continue
      yield i
    }
  }

  private * cols () {
    const { n, colVisited } = this
    for (let j = 0; j < n; ++j) {
      if (colVisited[j]) continue
      yield j
    }
  }

  private * nonBase () {
    const { m, n } = this
    for (let i = 0; i < m; ++i) {
      for (let j = 0; j < n; ++j) {
        if (!this.isBase(i, j)) yield [i, j]
      }
    }
  }

  // 找出当前行/列的最小值
  private argmin(row?: number, col?: number): [number, number, number] {
    let min = Infinity
    if (row !== undefined) {
      for (const j of this.cols()) {
        if (this.cost[row][j] < min) {
          min = this.cost[row][j]
          col = j
        }
      }
    } else if (col !== undefined) {
      for (const i of this.rows()) {
        if (this.cost[i][col] < min) {
          min = this.cost[i][col]
          row = i
        }
      }
    }
    return [row as number, col as number, min]
  }

  // 找出当前价格矩阵的最小值
  private argmin2() {
    let row = 0, col = 0, min = Infinity
    for (const i of this.rows()) {
      for (const j of this.cols()) {
        if (this.cost[i][j] < min) {
          min = this.cost[i][j]
          row = i
          col = j
        }
      }
    }
    return [row, col, min]
  }

  // 处理退化情形
  // 若部分产地的产量和等于部分产地的销量和, 运输问题可能出现退化, 表现在同时划去一行和一列.
  // 这时应该在运输方案表中该行或该列的位置上补零, 以保证基变量数目等于 m+n-1.
  private handleDegeneration (row: number, col: number) {
    for (const i of this.rows()) {
      if (i !== row) {
        return this.base.push([i, col])
      }
    }
    for (const j of this.cols()) {
      if (j !== col) {
        return this.base.push([row, j])
      }
    }
  }

  // 执行一次运输, 更新产量、销量
  private transport (row: number, col: number) {
    const { solution, produce, consume, rowVisited, colVisited, base } = this
    const quantity = Math.min(produce[row], consume[col])
    solution[row][col] = quantity
    base.push([row, col])
    produce[row] -= quantity
    consume[col] -= quantity
    if (this.isZero(produce[row]) && this.isZero(consume[col])) {
      this.handleDegeneration(row, col)
    }
    if (this.isZero(produce[row])) rowVisited[row] = true
    if (this.isZero(consume[col])) colVisited[col] = true
  }

  // 计算一行/列的最小元素与次小元素的差
  private getDiff (arr: number[]): number {
    let min = Infinity, min2 = Infinity
    arr.forEach(v => {
      if (v < min) {
        if (min < min2) {
          min2 = min
        }
        min = v
      } else if (v < min2) {
        min2 = v
      }
    })
    return min2 - min
  }

  // 计算罚数
  private getPenalty () {
    const { cost } = this
    let maxPenalty = -Infinity, maxPenaltyRow, maxPenaltyCol
    // 行罚数
    for (const i of this.rows()) {
      const diff = this.getDiff([...this.cols()].map(j => cost[i][j]))
      if (diff > maxPenalty) {
        maxPenalty = diff
        maxPenaltyRow = i
      }
    }
    // 列罚数
    for (const j of this.cols()) {
      const diff = this.getDiff([...this.rows()].map(i => cost[i][j]))
      if (diff > maxPenalty) {
        maxPenalty = diff
        maxPenaltyRow = undefined
        maxPenaltyCol = j
      }
    }
    return [maxPenaltyRow, maxPenaltyCol]
  }

  // 是否为基变量
  private isBase (row: number, col: number) {
    return this.base.some(v => v[0] === row && v[1] === col)
  }

  // 从指定位置出发寻找闭回路 (DFS)
  private findPath (path: number[][]) {
    const { m, n } = this
    const len = path.length
    if (len >= m + n) {
      console.log('path', path)
      throw new Error('path not found')
    }
    const [row, col] = path[len - 1]
    if (len % 2 === 1) {
      // 竖线
      for (let i = 0; i < m; ++i) {
        if (i !== row && this.isBase(i, col) && !path.some(v => v[0] === i && v[1] === col)) {
          path.push([i, col])
          if (this.findPath(path)) return true
          path.pop()
        }
      }
    } else {
      // 横线
      if (row === path[0][0] && col !== path[0][1]) return true // 回路已找到
      for (let j = 0; j < n; ++j) {
        if (j !== col && this.isBase(row, j) && !path.some(v => v[0] === row && v[1] === j)) {
          path.push([row, j])
          if (this.findPath(path)) return true
          path.pop()
        }
      }
    }
  }

  // 沿闭回路调整当前解
  private rotate (path: number[][]) {
    const { solution, base } = this
    // 寻找换入变量
    let row = 0, col = 0, min = Infinity
    path.forEach(([i, j], index) => {
      if (index % 2 === 1) {
        if (solution[i][j] < min) {
          min = solution[i][j]
          row = i
          col = j
        }
      }
    })
    // 换入
    const deleteIndex = base.findIndex(v => v[0] === row && v[1] === col)
    base.splice(deleteIndex, 1, path[0])
    path.forEach(([i, j]) => {
      solution[i][j] += min
      min = -min
    })
  }

  // 寻找初始可行解 (最小值法)
  public initSolutionByMin (): number[][] {
    this.init()
    let row, col, min
    do {
      // 当前价格矩阵的最小值
      [row, col, min] = this.argmin2()
      // 安排 row, col 格子的运输
      if (min < Infinity) {
        this.transport(row, col)
      }
    } while (min < Infinity)
    return this.solution
  }

  // 寻找初始可行解 (Vogel 法)
  public initSolutionByVogel (): number[][] {
    this.init()
    let min
    do {
      // 最大罚数所在的行/列
      let [row, col] = this.getPenalty()
      // 该行/列的最小运费
      ;[row, col, min] = this.argmin(row, col)
      // 安排 row, col 格子的运输
      if (min < Infinity) {
        this.transport(row, col)
      }
    } while (min < Infinity)
    return this.solution
  }

  // 最优性判别 (闭回路法)
  public checkOptimalByClosedPath () {
    throw new Error('TODO')
  }

  // 最优性判别 (位势法)
  public checkOptimalByPotential () {
    const { cost, base, m, n } = this
    const rowPotential: number[] = []
    const colPotential: number[] = []

    // get potential
    rowPotential[0] = 0
    let count = 1, count2 = 0
    while (count < m + n && count2 < m + n) { // TODO: 能否减少该循环的次数？
      base.forEach(([row, col]) => {
        const rp = rowPotential[row]
        const cp = colPotential[col]
        if (rp !== undefined && cp === undefined) {
          colPotential[col] = cost[row][col] - rp
          ++count
        } else if (rp === undefined && cp !== undefined) {
          rowPotential[row] = cost[row][col] - cp
          ++count
        }
      }) 
      ++count2
    }
    if (count2 === m + n) {
      console.log({ cost, base, rowPotential, colPotential })
      throw new Error('cannot compute potential')
    }

    // get check number
    let min = Infinity, row = 0, col = 0
    for (const [i, j] of this.nonBase()) {
      const checkNumber = cost[i][j] - rowPotential[i] - colPotential[j]
      if (checkNumber < min) {
        row = i
        col = j
        min = checkNumber
      }
    }
    return [row, col, min]
  }

  // 求解运输问题
  public solve ({ initBy = 'min', checkBy = 'potential' }: { initBy?: 'min' | 'vogel', checkBy?: 'potential' } = {}) {
    switch (initBy) {
      case 'min': this.initSolutionByMin(); break
      case 'vogel': this.initSolutionByVogel(); break
      default: throw new Error('invalid initBy=' + initBy)
    }

    const { type, solution, cost, base } = this
    switch (checkBy) {
      case 'potential':
        console.log('solution', solution)
        let [row, col, min] = this.checkOptimalByPotential()
        while (min < 0) {
          const path = [[row, col]]
          this.findPath(path)
          this.rotate(path)
          console.log('solution', solution)
          ;[row, col, min] = this.checkOptimalByPotential()
        }
        break
      default: throw new Error('invalid checkBy=' + checkBy)
    }

    const value = base.reduce((sum, [row, col]) => {
      return sum + solution[row][col] * cost[row][col]
    }, 0)
    return { type, solution, value }
  }
}

function test1 () {
  const cost = [
    [4, 12, 4, 11],
    [2, 10, 3, 9],
    [8, 5, 11, 6],
  ]
  const produce = [16, 10, 22]
  const consume = [8, 14, 12, 14]
  const tp = new TransportProblem(cost, produce, consume)
  console.log(tp.initSolutionByMin()) // [ [ 0, 0, 10, 6 ], [ 8, 0, 2, 0 ], [ 0, 14, 0, 8 ] ]
  // console.log(tp.initSolutionByVogel()) // [ [ 0, 0, 12, 4 ], [ 8, 0, 0, 2 ], [ 0, 14, 0, 8 ] ]
  const [row, col, checkNumber] = tp.checkOptimalByPotential()
  console.log(row, col, checkNumber) // 1 3 -1
  // const path = [[row, col]]
  // tp.findPath(path)
  // console.log('found path', path) // [ [ 1, 3 ], [ 0, 3 ], [ 0, 2 ], [ 1, 2 ] ]
}

function test2 () {
  const cost = [
    [4, 12, 4, 11],
    [2, 10, 3, 9],
    [8, 5, 11, 6],
  ]
  const produce = [16, 10, 22]
  const consume = [8, 14, 12, 14]
  const tp = new TransportProblem(cost, produce, consume)
  console.log(tp.solve({ initBy: 'vogel' }))
}

// 退化问题
function test3() {
  const inf = 999999
  const tp = new TransportProblem([
      [-4, 5, 3, 2, inf],
      [5, -1, 2, inf, 4],
      [3, 2, -3, 5, 5],
      [2, inf, 5, -3, 6],
      [inf, 4, 5, 6, -5],
    ],
    [60, 90, 50, 50, 50],
    [50, 50, 50, 80, 70],
  )
  console.log(tp.solve())
}
