export function createSudoku(initialGrid) {
  let grid = deepCopy(initialGrid)

  function getGrid() {
    return deepCopy(grid)
  }

  function guess({ row, col, value }) {
    grid[row][col] = value
  }

  function isValid(row, col, value) {
    // 行
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c] === value) return false
    }

    // 列
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col] === value) return false
    }

    // 宫
    const br = Math.floor(row / 3) * 3
    const bc = Math.floor(col / 3) * 3

    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        if ((r !== row || c !== col) && grid[r][c] === value) {
          return false
        }
      }
    }

    return true
  }

  function getCandidates(row, col) {
    if (grid[row][col] !== 0) return []

    const result = []

    for (let v = 1; v <= 9; v++) {
      if (isValid(row, col, v)) {
        result.push(v)
      }
    }

    return result
  }

  function clone() {
    return createSudoku(grid)
  }

  function toJSON() {
    return {
      grid
    }
  }

  function toString() {
    return grid
      .map(row => row.map(v => v || '.').join(' '))
      .join('\n')
  }

  return {
    getGrid,
    guess,
    isValid,
    getCandidates, // 👉 HW2 Hint 直接用
    clone,
    toJSON,
    toString
  }
}

function deepCopy(grid) {
  return grid.map(row => [...row])
}

export function createSudokuFromJSON(json) {
  return createSudoku(json.grid)
}
