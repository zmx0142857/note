window.solver = (() => {

/**
 * 数独
 * @param {number[9][9]} board 9*9 方阵, 空格用零填充
 * @return {number[9][9]} 原地修改 board 数组
 */
const sudoku = (board) => {
  let found = false
  let count = 0
  const stack = []
  const rows = [], cols = [], grids = [] // 用 bitset 表示每一行、列、宫的情况

  const init = () => {
    for (let i = 0; i < 9; ++i) {
      for (let j = 0; j < 9; ++j) {
        const n = board[i][j]
        if (n === 0) {
          stack.push([i,j])
        } else {
          set(i, j, n)
        }
      }
    }
  }

  const set = (i, j, n) => {
    const mask = 1 << n
    rows[i] ^= mask
    cols[j] ^= mask
    grids[(i/3|0)*3+(j/3|0)] ^= mask
  }

  const ok = (i, j, n) => {
    ++count
    const mask = 1 << n
    const conflict = (rows[i] & mask) || (cols[j] & mask) || (grids[(i/3|0)*3 + (j/3|0)] & mask)
    return !conflict
  }

  const dfs = (depth) => {
    if (found || depth === stack.length) {
      found = true
      return
    }
    const [i, j] = stack[depth]
    for (let n = 9; n >= 1; --n) {
      if (ok(i, j, n)) {
        board[i][j] = n
        set(i, j, n)

        dfs(depth+1)
        if (found) return

        board[i][j] = 0
        set(i, j, n)
      }
    }
  }

  init()
  dfs(0)
  return board
}

/**
 * 摩天楼
 * @link https://www.krnsk0.dev/posts/skyscraper-puzzle-1
 * @param {number[][]} board n*n 方阵, 空格用零填充
 * @param {number[4][]} clues 依次为上下左右的线索, 其中上下线索从左住右读, 左右线索从上住下读
 * @returns {number[][]}
 */
const skyscraper = (board, clues) => {
  let found = false
  const n = clues[0].length
  const stack = []
  const rows = [], cols = [] // bitset
  // 从上往下, 从下往上, 从左往右, 从右往左
  const UP = 0, DOWN = 1, LEFT = 2, RIGHT = 3
  const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  const starts = [[0, 1], [n-1, 1], [1, 0], [1, n-1]]

  const getStart = (dir, index) => {
    const pos = starts[dir].slice()
    pos[dir === UP || dir === DOWN ? 1 : 0] = index
    return pos
  }

  // 特殊情形: clue 为 1 或 n
  const specials = () => {
    clues.forEach((clue, dir) => {
      clue.forEach((v, index) => {
        if (v === 1) { // 线索 1 的旁边必为数字 n
          const [i, j] = getStart(dir, index)
          board[i][j] = n
        } else if (v === n) { // 线索 n 的同行列, 必为从小到大顺序排列
          const step = steps[dir]
          let [i, j] = getStart(dir, index)
          for (let k = 1; k <= n; ++k) {
            board[i][j] = k
            i += step[0]
            j += step[1]
          }
        }
      })
    })
  }

  const init = () => {
    specials() // 可以省略这一行
    for (let i = 0; i < n; ++i) {
      for (let j = 0; j < n; ++j) {
        const num = board[i][j]
        if (num === 0) {
          stack.push([i, j])
        } else {
          set(i, j, num)
        }
      }
    }
  }

  const every = (lo, hi, fn) => {
    for (let i = lo; i <= hi; ++i) {
      if (!fn(i)) return false
    }
    return true
  }

  const see = (dir, index) => {
    const clue = clues[dir][index]
    if (!clue) return true // 暂无线索, 跳过本轮测试
    let max = 0, cnt = 0, step = steps[dir], [i, j] = getStart(dir, index)
    for (let k = 1; k <= n; ++k) {
      if (board[i][j] > max) {
        max = board[i][j]
        ++cnt
      }
      i += step[0]
      j += step[1]
    }
    return cnt === clue
  }

  const set = (i, j, num) => {
    const mask = 1 << num
    rows[i] ^= mask
    cols[j] ^= mask
  }

  const ok = (i, j, num) => {
    // 每行、列数字不重复
    // if (!every(0, n-1, k => board[i][k] !== num && board[i][j] !== num)) return 0
    const mask = 1 << num
    if (rows[i] & mask || cols[j] & mask) return 0

    // 尝试放置数字, 从四个方向观察
    board[i][j] = num
    if (every(i+1, n-1, k => board[k][j])) {
      if (!see(UP, j) || !see(DOWN, j)) {
        return board[i][j] = 0
      }
    }
    if (every(j+1, n-1, k => board[i][k])) {
      if (!see(LEFT, i) || !see(RIGHT, i)) {
        return board[i][j] = 0
      }
    }
    return 1
  }

  const dfs = (depth) => {
    if (found || depth === stack.length) {
      found = true
      return
    }
    const [i, j] = stack[depth]
    for (let num = n; num >= 1; --num) {
      if (ok(i, j, num)) {
        board[i][j] = num
        set(i, j, num)

        dfs(depth+1)
        if (found) return

        board[i][j] = 0
        set(i, j, num)
      }
    }
  }
  const debug = () => console.log(board.map(row => row.join(' ')).join('\n'))

  init()
  dfs(0)
  return board
}

/**
 * 迷宫
 * @param {character[][]} board m*n 迷宫, '#' 代表墙, 空格代表地面, 'A' 代表起点, 'Z' 代表终点
 * @returns {character[][]} 原地修改 board 数组, 用 '.' 代表路线
 */
const maze = (board) => {
  const m = board.length, n = board[0].length
  const queue = [], recycle = []
  const EMPTY = ' ', WALL = '#', START = 'A', GOAL = 'Z', PATH = '.'
  const UP = 0, DOWN = 1, LEFT = 2, RIGHT = 3
  const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]]

  // 寻找终点
  const goalIndex = () => {
    for (let i = 0; i < m; ++i) {
      for (let j = 0; j < n; ++j) {
        if (board[i][j] === GOAL) return [i, j]
      }
    }
  }

  // 从终点出发, 应用广度优先搜索
  const solve = () => {
    const goal = goalIndex()
    if (!goal) return
    queue.push(goal)
    while (queue.length) {
      let [i, j] = queue.shift()
      for (let dir = 0; dir < 4; ++dir) {
        const [di, dj] = steps[dir]
        i += di
        j += dj
        if (board[i][j] === EMPTY) {
          board[i][j] = dir
          queue.push([i, j])
          recycle.push([i, j])
        } else if (board[i][j] === START) {
          return [i - di, j - dj]
        }
        i -= di
        j -= dj
      }
    }
  }

  // 标记路径, 并清除中间变量
  const markPath = (start) => {
    let [i, j] = start
    let dir
    while ((dir = board[i][j]) !== GOAL) {
      const [di, dj] = steps[dir]
      board[i][j] = PATH
      i -= di
      j -= dj
    }
    recycle.forEach(([i, j]) => {
      if (board[i][j] !== PATH) board[i][j] = EMPTY
    })
  }

  const start = solve()
  if (!start) throw new Error('no solution')
  markPath(start)
  return board
}

/**
 * 数织
 * @params {number[][]} rowClue 行线索
 * @params {number[][]} colClue 列线索
 */
const picross = (rowClue, colClue) => {
  const m = rowClue.length // 行数
  const n = colClue.length // 列数
  const board = [...Array(m)].map(() => Array(n).fill(0)) // m 行 n 列, 用 0 填充
  // rowSpace[i] 表示第 i 行的空格情况. 总是有 rowClue[i].length + 1 === rowSpace[i].length
  // 类似地, colSpace[j] 表示第 j 列的空格情况
  const rowSpace = []
  const colSpace = []
  let found = false

  const dfs = (row) => {
    rowSpace[row] = rowClue[row].map(() => 0)
    rowSpace[row].unshift(-1)
    if (found || row === m) {
      found = true
      return
    }
    while (next(row)) {
      if (stop(row)) {
        dfs(row + 1)
      }
      if (found) return
    }
  }

  const next = (row) => {
    let col = 0
    rowSpace[row][col] += 1 // 遍历下一情况
    let sum = rowSpace[row].reduce((x, y) => x+y) // 计算已占用空格
    let tot = n + 1 - rowClue[row].reduce((x, y) => x+y+1) // 计算可用空格数
    while (col < rowClue[row].length - 1 && sum > tot) { // 若未进满位且仍不符条件，就进一位
      rowSpace[row][col] = 0 // 低位归零
      col += 1 // 进位
      rowSpace[row][col] += 1 // 高位加一
      sum = rowSpace[row].reduce((x, y) => x+y) // 重新计算占用的空格
    }
    if (sum <= tot) { // 若符条件，就在 board 里输出
      board[row].fill(0)
      col = 1
      for (let j = 0; j < rowClue[row].length; j++) {
        col += rowSpace[row][j] // 输出前置空格
        for (let i = col; i < col + rowClue[row][j]; i++) { // 输出中间实心
          board[row][i] = 1
        }
        col += rowClue[row][j] + 1 // 实心与实心之间至少存在一个空格
      }
    }
    return sum <= tot // 返回是否还没到头
  }

  const stop = (row) => { // 检查当前是否已经不符合要求
    let col = 0
    for (let i = 1; i <= n; i++) {
      col = 0
      colSpace[i] = [0]
      for (let j = 1; j <= row; j++) {
        if (board[j][i] == 0) {
          if (j == 1) { // 首位零不管
          } else if (board[j-1][i] == 0) { // 连续零不管
          } else { // 新零要管，他分开了连续的两段
            if (colSpace[i][col] < colClue[i][col]) { // 没有满足 colClue 就断了
              return false
            }
            col++ // 新增一段
            colSpace[i][col] = 0 // 新增的归零
          }
        } else { // 实心都管
          colSpace[i][col] += 1 // 尾端加一
          if (colSpace[i][col] > colClue[i][col]) { // 尾端长度已经超了要求
            return false
          }
          if (col > colClue[i].length - 1) { // 段数已经超了要求
            return false
          }
        }
      }
    }
    return true
  }

  dfs(0)
  if (!found) throw new Error('no solution')
  return board
}

/**
 * 关灯
 * @param {number[][]} board m*n 的 0-1 矩阵
 * @returns {number[][]} 需要按下的按钮
 */
const lightsoff = (board) => {
  const m = board.length, n = board[0].length
  if (m < n) {
    // TODO 转置
  }
  if (n > 31) throw new Error('only support size <= 30')
  const bits = []

  // 转为二进制数, 高位在前, 低位在后
  const toBits = (board) => {
    return board.map(row => {
      return row.reduce((num, b) => (num << 1) | b, 0)
    })
  }

  const fromBits = (bits) => {
    return bits.slice(0, m).map(row => {
      return row.toString(2).padStart(n, '0').split('').map(v => Number(v))
    })
  }

  const solve = () => {
    const mask = (1 << n) - 1
    for (let guess = 0; guess <= mask; ++guess) { // 从 00000 - 11111 枚举第一行按钮
      bits[0] = guess
      // 根据上一行的按钮状态, 推理下一行的状态
      //     j-1  j  j+1
      // i-2      .
      // i-1   .  .  .
      // i        ?
      // 在位运算中, undefined 和 0 的效果相同
      for (let i = 1; i <= m; ++i) {
        bits[i] = board[i-1] ^ bits[i-1] ^ bits[i-2] ^ (bits[i-1] << 1) ^ (bits[i-1] >> 1)
        bits[i] &= mask
      }
      // 判断最后一行的灯是否全部点亮
      if (bits[m] === 0) return true
    }
  }

  board = toBits(board)
  solve()
  return fromBits(bits)
}

const starbattle = () => {

}

// TODO: 使用 worker 计算
return {
  sudoku,
  skyscraper,
  lightsoff,
  maze,
}

})()
