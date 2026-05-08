/**
 * 数独生成器
 * 用于生成不同难度的数独题目
 */

/**
 * 生成完整的数独解
 * @returns {number[][]} 9x9 二维数组，表示完整的数独解
 */
function generateSolution() {
    const grid = Array(9).fill(null).map(() => Array(9).fill(0));

    function isValid(grid, row, col, num) {
        // 检查行
        for (let c = 0; c < 9; c++) {
            if (grid[row][c] === num) return false;
        }
        // 检查列
        for (let r = 0; r < 9; r++) {
            if (grid[r][col] === num) return false;
        }
        // 检查 3x3 宫
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (grid[r][c] === num) return false;
            }
        }
        return true;
    }

    function solve(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    // 打乱 1-9 的顺序尝试
                    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (const num of nums) {
                        if (isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (solve(grid)) {
                                return true;
                            }
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    solve(grid);
    return grid;
}

/**
 * 打乱数组（Fisher-Yates 洗牌算法）
 */
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * 复制二维数组
 */
function copyGrid(grid) {
    return grid.map(row => [...row]);
}

/**
 * 计算数独解的数量（用于验证唯一解）
 */
function countSolutions(grid, maxCount = 2) {
    let count = 0;

    function solve(g) {
        if (count >= maxCount) return;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (g[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (isValidPlacement(g, row, col, num)) {
                            g[row][col] = num;
                            solve(g);
                            g[row][col] = 0;
                        }
                    }
                    return;
                }
            }
        }
        count++;
    }

    function isValidPlacement(g, row, col, num) {
        for (let c = 0; c < 9; c++) {
            if (g[row][c] === num) return false;
        }
        for (let r = 0; r < 9; r++) {
            if (g[r][col] === num) return false;
        }
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (g[r][c] === num) return false;
            }
        }
        return true;
    }

    solve(copyGrid(grid));
    return count;
}

/**
 * 根据难度挖掉指定数量的格子
 */
function createPuzzle(solution, holes) {
    const puzzle = copyGrid(solution);
    const positions = [];

    // 收集所有非零位置
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            positions.push([r, c]);
        }
    }

    // 打乱位置
    const shuffledPositions = shuffle(positions);

    // 挖掉指定数量的格子
    let removed = 0;
    for (const [row, col] of shuffledPositions) {
        if (removed >= holes) break;

        const backup = puzzle[row][col];
        puzzle[row][col] = 0;

        // 简单验证：确保挖掉后仍有解
        if (countSolutions(puzzle, 2) === 1) {
            removed++;
        } else {
            // 如果导致多解，恢复格子
            puzzle[row][col] = backup;
        }
    }

    return puzzle;
}

/**
 * 根据难度生成数独题目
 * @param {string} difficulty - 难度级别：'easy', 'medium', 'hard', 'extreme'
 * @returns {number[][]} 9x9 二维数组，表示数独题目
 */
export function generateSudoku(difficulty = 'medium') {
    const holesMap = {
        easy: 35,
        medium: 45,
        hard: 52,
        extreme: 58
    };

    const holes = holesMap[difficulty] || 45;

    // 生成完整解
    const solution = generateSolution();

    // 根据难度挖空
    const puzzle = createPuzzle(solution, holes);

    return puzzle;
}

/**
 * 创建自定义难度的数独
 * @param {number} numHoles - 挖空数量
 * @returns {number[][]} 9x9 二维数组
 */
export function generateCustomSudoku(numHoles = 40) {
    const solution = generateSolution();
    return createPuzzle(solution, Math.min(Math.max(numHoles, 20), 70));
}
