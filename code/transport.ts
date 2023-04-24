// 运输问题
class TransportProblem {
  cost: number[][] // m x n 价格矩阵
  produce: number[] // m 维产量数组
  consume: number[] // n 维销量数组
  m: number // 行数
  n: number // 列数

  solution!: number[][] // 运输方案
  rowVisited!: boolean[] // 访问过的行
  colVisited!: boolean[] // 访问过的列
  rowPenalty!: number[] // 行罚数
  colPenalty!: number[] // 列罚数

  constructor (cost: number[][], produce: number[], consume: number[]) {
    this.cost = cost
    this.produce = [...produce]
    this.consume = [...consume]
    this.m = produce.length
    this.n = consume.length
  }

  init () {
    const { m, n } = this
    Object.assign(this, {
      solution: Array.from({ length: m }, () => Array.from({ length: n }, () => 0)),
      rowVisited: Array.from({ length: m }, () => false),
      colVisited: Array.from({ length: n }, () => false),
    })
  }

  * rows () {
    const { m, rowVisited } = this
    for (let i = 0; i < m; ++i) {
      if (rowVisited[i]) continue
      yield i
    }
  }

  * cols () {
    const { n, colVisited } = this
    for (let j = 0; j < n; ++j) {
      if (colVisited[j]) continue
      yield j
    }
  }

  // 找出当前价格矩阵的最小值
  argmin2() {
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

  // 执行一次运输, 更新产量、销量
  transport (row: number, col: number) {
    const { solution, produce, consume, rowVisited, colVisited } = this
    const quantity = Math.min(produce[row], consume[col])
    solution[row][col] = quantity
    produce[row] -= quantity
    consume[col] -= quantity
    if (produce[row] === 0) rowVisited[row] = true
    if (consume[col] === 0) colVisited[col] = true
  }

  // 计算一行/列的最小元素与次小元素的差
  getDiff (arr: number[]): number {
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
  getPenalty () {
    const { cost } = this
    const rowPenalty = [], colPenalty = []
    let maxPenalty = -Infinity, maxPenaltyRow, maxPenaltyCol
    // 行罚数
    for (const i of this.rows()) {
      const diff = rowPenalty[i] = this.getDiff([...this.cols()].map(j => cost[i][j]))
      if (diff > maxPenalty) {
        maxPenalty = diff
        maxPenaltyRow = i
      }
    }
    // 列罚数
    for (const j of this.cols()) {
      const diff = colPenalty[j] = this.getDiff([...this.rows()].map(i => cost[i][j]))
      if (diff > maxPenalty) {
        maxPenalty = diff
        maxPenaltyRow = undefined
        maxPenaltyCol = j
      }
    }
    Object.assign(this, {
      rowPenalty,
      colPenalty,
    })
    return [maxPenaltyRow, maxPenaltyCol]
  }

  // 寻找初始可行解 (最小值法)
  initSolutionByMin (): number[][] {
    this.init()
    let row, col, min
    do {
      [row, col, min] = this.argmin2()
      if (min < Infinity) {
        this.transport(row, col)
      }
    } while (min < Infinity)
    return this.solution
  }

  // 寻找初始可行解 (Vogel 法)
  initSolutionByVogel (): number[][] {
    this.init()
    const { cost, solution } = this
    let min
    do {
      min = Infinity
      // 最大罚数所在的行/列
      let [row, col] = this.getPenalty()
      // 该行/列的最小运费
      if (row !== undefined) {
        for (const j of this.cols()) {
          if (cost[row][j] < min) {
            min = cost[row][j]
            col = j
          }
        }
      } else if (col !== undefined) {
        for (const i of this.rows()) {
          if (cost[i][col] < min) {
            min = cost[i][col]
            row = i
          }
        }
      }
      if (min < Infinity) {
        this.transport(row as number, col as number)
      }
    } while (min < Infinity)
    return solution
  }

  // 最优性判别 (闭回路法)
  checkOptimalByClosedPath () {

  }

  // 最优性判别 (位势法)
  checkOptimalByPotential () {

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
  // console.log(tp.initSolutionByMin())
  console.log(tp.initSolutionByVogel())
}

test1()