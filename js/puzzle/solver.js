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
 * @param {char[][]} board m*n 迷宫, '#' 代表墙, 空格代表地面, 'A' 代表起点, 'Z' 代表终点
 * @returns {char[][]} 原地修改 board 数组, 用 '.' 代表路线
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
 * 数织 (来自群友 硫化氢)
 * @params {number[][]} rowClue 行线索
 * @params {number[][]} colClue 列线索
 */
const picross = (rowClue, colClue) => {
  const m = rowClue.length // 行数
  const n = colClue.length // 列数
  const board = [...Array(m)].map(() => Array(n).fill(0)) // m 行 n 列, 用 0 填充
  const rowSpace = [] // rowSpace[i] 表示第 i 行的空格情况, 不含行尾空格
  let found = false

  const dfs = (row) => {
    if (found || row === m) return found = true
    rowSpace[row] = rowClue[row].map(() => 1)
    rowSpace[row][0] = -1 // 行首可以有 0 个空格
    while (!found && next(row)) {
      putRow(row)
      if (ok(row)) {
        dfs(row + 1)
      }
    }
  }

  // 输出一行
  const putRow = (row) => {
    board[row].fill(0)
    let col = 0
    rowClue[row].forEach((c, j) => {
      col += rowSpace[row][j] // 输出前置空格
      for (let i = 0; i < c; i++) { // 输出黑格
        board[row][col+i] = 1
      }
      col += c
    })
  }

  // 枚举所有可能的行空格 (rowSpace)
  const next = (row) => {
    const space = rowSpace[row]
    const clue = rowClue[row]
    space[0] += 1 // 枚举下一情况
    let available = n - clue.reduce((x, y) => x+y) - space.reduce((x, y) => x+y) // 计算可用空格数
    // 空格不够用时, 向右进位
    for (let k = 0; k < clue.length - 1 && available < 0; ++k) {
      const ds = k ? space[k]-1 : space[k]
      space[k] -= ds // 低位归零
      space[k+1] += 1 // 高位加一
      available += ds-1 // 重新计算占用空格
    }
    return available >= 0
  }

  // 检查前 maxRow 行是否符合 colClue 的条件
  const ok = (maxRow) => {
    for (let col = 0; col < n; col++) {
      const clue = colClue[col]
      let k = 0 // 黑格段数
      let count = 0 // 当前段的黑格计数
      for (let row = 0; row <= maxRow; row++) {
        if (board[row][col]) { // 黑格
          ++count
          if (count > clue[k]) return false // 黑格数量超标
          if (k > clue.length - 1) return false // 段数超标
        } else if (row > 0 && board[row-1][col]) { // 黑格下的空格
          if (count < clue[k]) return false // 黑格数量不足
          k++
          count = 0
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

/**
 * 星之战
 * @param {number} size 方阵的阶数
 * @param {number} count 每行/列/宫的星星数
 * @param {number[size][]} walls 每行的竖直方向的墙 "|", 取值范围 1 到 size-1
 * @param {number[size][]} floors 每列的水平方向的墙 "_", 取值范围 1 到 size-1
 */
const starbattle = (size, count, walls, floors) => {
  console.log(size, count, walls, floors)
  let found = false
  const board = [...Array(size)].map(() => Array(size).fill(0))
  const parent = Array(size * size).fill(-1) // 并查集, 用于判断星星属于哪一宫
  const cells = Array(size * size).fill(0) // 每一宫的星星计数
  const cols = Array(size).fill(0) // 每列的星星计数
  const rowStar = [...Array(size)].map(() => []) // 每行的星星排布

  // 并查集的【并】: 合并子树
  const union = (i, j) => {
    i = findParent(i)
    j = findParent(j)
    if (i === j) return
    if (parent[i] > parent[j]) return union(j, i)
    parent[i] += parent[j]
    parent[j] = i
  }

  // 并查集的【查】: 判断星星属于哪一宫
  const findParent = (i) => {
    if (!Number.isFinite(i)) throw new Error('findParent ' + i)
    if (parent[i] < 0) return i
    return parent[i] = findParent(parent[i])
  }

  // 初始化并查集
  const init = () => {
    for (let i = 0; i < size; ++i) {
      for (let j = 0; j < size; ++j) {
        if (i > 0 && !floors[j].includes(i)) union((i-1)*size+j, i*size+j)
        if (j > 0 && !walls[i].includes(j)) union(i*size+j-1, i*size+j)
      }
    }
  }

  // 递归回溯
  const dfs = (row) => {
    if (found || row === size) return found = true
    rowStar[row].length = 0
    while (!found && next(row)) {
      if (!rowStar[row].every(col => ok(row, col))) continue
      putRow(row)
      if (count >= 3 && row === 1) {
        console.log(row)
        console.log(board.map(v => v.map(c => c ? '@' : '.').join('')).join('\n'))
      }
      if (cols.every(v => v <= count) && cells.every(v => v <= count)) {
        dfs(row+1)
      }
    }
    if (!found) clearRow(row)
  }

  // 清空第 row 行
  const clearRow = (row) => {
    board[row].forEach((flag, col) => {
      if (flag) {
        board[row][col] = 0
        --cols[col]
        --cells[findParent(row*size+col)]
      }
    })
  }

  // 更新第 row 行
  const putRow = (row) => {
    clearRow(row)
    rowStar[row].forEach(col => {
      board[row][col] = 1
      ++cols[col]
      ++cells[findParent(row*size+col)]
    })
  }

  // 保证星星纵向不相邻, 也不对角相邻
  const ok = (row, col) => {
    if (row > 0) {
      const last = board[row-1]
      if (last[col-1] || last[col] || last[col+1]) return false
    }
    return true
  }

  // 枚举第 row 行的下一种可能排布
  // 和数织一样采用进位法
  const next = (row) => {
    const star = rowStar[row]
    if (!star.length) return star.push(...Array(count).keys().map(i => 2*i))
    const diff = star.map((col, i) => col - (star[i-1] || 0))
    diff[0] += 1
    let available = size - 2 - star[count-1]
    for (let k = 0; k < count-1 && available < 0; ++k) {
      const ds = k ? diff[k]-2 : diff[k]
      diff[k] -= ds
      diff[k+1] += 1
      available += ds-1
    }
    if (available >= 0) diff.forEach((v, i) => star[i] = (star[i-1] || 0) + v)
    return available >= 0
  }

  init()
  console.log(parent)
  console.log('start')
  dfs(0)
  console.log('end')
  if (!found) throw new Error('no solution')
  return board
}

// TODO: 使用 worker 计算
return {
  sudoku,
  skyscraper,
  lightsoff,
  maze,
  picross,
  starbattle,
}

})()
