// src/domain/generator.js

/**
 * SudokuGenerator
 * 提供生成完整解和挖空题目的方法
 */
export class SudokuGenerator {
    constructor() {
        this.SIZE = 9;
        this.BOX = 3;
    }

    /* ─── 公共接口 ─── */

    /**
     * 生成完整解
     * @returns {number[][]} 9x9 完整数独
     */
    generateSolution() {
        const grid = Array.from({ length: this.SIZE }, () => Array(this.SIZE).fill(0));
        this._fillGrid(grid);
        return grid;
    }

    /**
     * 根据难度生成题目
     * @param {'easy'|'medium'|'hard'|'extreme'} difficulty
     * @returns {number[][]}
     */
    generatePuzzle(difficulty = 'medium') {
        const holesMap = { easy: 35, medium: 45, hard: 52, extreme: 58 };
        const holes = holesMap[difficulty] || 45;

        const solution = this.generateSolution();
        return this._createPuzzle(solution, holes);
    }

    /**
     * 自定义挖空题目
     * @param {number} holes
     * @returns {number[][]}
     */
    generateCustomPuzzle(holes = 40) {
        const solution = this.generateSolution();
        const count = Math.min(Math.max(holes, 20), 70);
        return this._createPuzzle(solution, count);
    }

    /* ─── 私有方法 ─── */

    _fillGrid(grid) {
        const nums = [1,2,3,4,5,6,7,8,9];

        const shuffle = arr => {
            const a = [...arr];
            for (let i = a.length-1; i>0; i--) {
                const j = Math.floor(Math.random() * (i+1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        };

        const solve = () => {
            for (let r=0; r<this.SIZE; r++) {
                for (let c=0; c<this.SIZE; c++) {
                    if (grid[r][c] === 0) {
                        for (const n of shuffle(nums)) {
                            if (this._isSafe(grid, r, c, n)) {
                                grid[r][c] = n;
                                if (solve()) return true;
                                grid[r][c] = 0;
                            }
                        }
                        return false;
                    }
                }
            }
            return true;
        };

        solve();
    }

    _createPuzzle(solution, holes) {
        const puzzle = solution.map(row => [...row]);
        const positions = [];

        for (let r=0; r<this.SIZE; r++) {
            for (let c=0; c<this.SIZE; c++) positions.push([r,c]);
        }

        const shuffle = arr => {
            const a = [...arr];
            for (let i = a.length-1; i>0; i--) {
                const j = Math.floor(Math.random() * (i+1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        };

        const shuffled = shuffle(positions);
        let removed = 0;

        for (const [r, c] of shuffled) {
            if (removed >= holes) break;
            const backup = puzzle[r][c];
            puzzle[r][c] = 0;

            if (this._countSolutions(puzzle, 2) === 1) {
                removed++;
            } else {
                puzzle[r][c] = backup;
            }
        }

        return puzzle;
    }

    _isSafe(grid, row, col, val) {
        // 行列宫检查
        for (let i=0; i<this.SIZE; i++) {
            if (grid[row][i] === val) return false;
            if (grid[i][col] === val) return false;
        }

        const br = Math.floor(row/3)*3;
        const bc = Math.floor(col/3)*3;
        for (let r=br; r<br+3; r++) {
            for (let c=bc; c<bc+3; c++) {
                if (grid[r][c] === val) return false;
            }
        }

        return true;
    }

    _countSolutions(grid, maxCount = 2) {
        let count = 0;

        const copyGrid = g => g.map(row => [...row]);

        const solve = (g) => {
            if (count >= maxCount) return;

            for (let r=0; r<this.SIZE; r++) {
                for (let c=0; c<this.SIZE; c++) {
                    if (g[r][c] === 0) {
                        for (let n=1; n<=9; n++) {
                            if (this._isSafe(g, r, c, n)) {
                                g[r][c] = n;
                                solve(g);
                                g[r][c] = 0;
                            }
                        }
                        return;
                    }
                }
            }
            count++;
        };

        solve(copyGrid(grid));
        return count;
    }
}

/* ─── 工厂函数 ─── */

const generator = new SudokuGenerator();

export function generateSudoku(difficulty = 'medium') {
    return generator.generatePuzzle(difficulty);
}

export function generateCustomSudoku(holes = 40) {
    return generator.generateCustomPuzzle(holes);
}
