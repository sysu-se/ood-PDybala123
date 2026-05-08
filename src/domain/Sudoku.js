/**
 * Sudoku 核心领域对象
 * 支持 clone、Hint、NextMove、冲突检测、深拷贝、序列化
 */
export class Sudoku {
    /**
     * @param {(number|null)[][]} grid 9×9 数独数组，0 或 null 表示空格
     * @param {boolean[][]} [given] 初始给定格（不可修改），若未传入自动生成
     */
    constructor(grid, given = null) {
        // 深拷贝并统一空格为 null
        this._cells = grid.map(row => row.map(cell => (cell === 0 || cell === null) ? null : cell));

        // 初始化给定格
        this._given = given
            ? given.map(row => [...row])
            : grid.map(row => row.map(cell => cell !== 0 && cell !== null));
    }

    /* ─── 基本读取 ─── */

    getCell(row, col) {
        return this._cells[row]?.[col] ?? null;
    }

    getGrid() {
        // 返回深拷贝，避免外部修改
        return this._cells.map(row => [...row]);
    }

    setGrid(newGrid) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                this._cells[r][c] = newGrid[r][c];
            }
        }
    }

    getGiven() {
        return this._given.map(row => [...row]);
    }

    isGiven(row, col) {
        return this._given[row][col];
    }

    /* ─── 填写 / 清除 ─── */

    /**
     * 填入或清除格子值
     * @param {{row: number, col: number, value: number|null}} move
     * @returns {boolean} 是否成功
     */
    guess(move) {
        const { row, col, value } = move;

        if (!Number.isInteger(row) || row < 0 || row > 8) return false;
        if (!Number.isInteger(col) || col < 0 || col > 8) return false;
        if (value !== null && value !== 0 && (!Number.isInteger(value) || value < 1 || value > 9)) return false;
        if (this.isGiven(row, col)) return false;

        this._cells[row][col] = (value === 0 ? null : value);
        return true;
    }

    /* ─── 冲突检测 ─── */

    isConflict(row, col) {
        const val = this._cells[row][col];
        if (!val) return false;

        return this._checkRowConflict(row, col, val) ||
               this._checkColConflict(row, col, val) ||
               this._checkBoxConflict(row, col, val);
    }

    getConflicts() {
        const conflicts = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.isConflict(r, c)) conflicts.push({ row: r, col: c });
            }
        }
        return conflicts;
    }

    isSolved() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const val = this._cells[r][c];
                if (!val || this.isConflict(r, c)) return false;
            }
        }
        return true;
    }

    /* ─── 克隆 ─── */

    clone() {
        return new Sudoku(this.getGrid(), this.getGiven());
    }

    /* ─── 序列化 / 外表化 ─── */

    toJSON() {
        return {
            grid: this.getGrid(),
            given: this.getGiven()
        };
    }

    toString() {
        return this._cells
            .map(row => row.map(cell => (cell === null ? '.' : cell)).join(' '))
            .join('\n');
    }

    /* ─── Hint 功能 ─── */

    /**
     * 获取格子的候选数集合
     * @param {number} row
     * @param {number} col
     * @returns {number[]} 候选数数组
     */
    getCandidates(row, col) {
        if (!this._cells[row] || col < 0 || col > 8) return [];
        const val = this._cells[row][col];
        if (val !== null) return [];

        const blocked = new Set();

        // 行
        for (let c = 0; c < 9; c++) {
            if (this._cells[row][c]) blocked.add(this._cells[row][c]);
        }
        // 列
        for (let r = 0; r < 9; r++) {
            if (this._cells[r][col]) blocked.add(this._cells[r][col]);
        }
        // 宫
        const br = Math.floor(row / 3) * 3;
        const bc = Math.floor(col / 3) * 3;
        for (let r = br; r < br + 3; r++) {
            for (let c = bc; c < bc + 3; c++) {
                if (this._cells[r][c]) blocked.add(this._cells[r][c]);
            }
        }

        return [1,2,3,4,5,6,7,8,9].filter(v => !blocked.has(v));
    }

    /**
     * 获取下一步唯一候选数
     * @returns {{row: number, col: number, value: number}|null}
     */
    getNextMove() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this._cells[r][c] !== null || this.isGiven(r,c)) continue;
                const candidates = this.getCandidates(r, c);
                if (candidates.length === 1) {
                    return { row: r, col: c, value: candidates[0] };
                }
            }
        }
        return null;
    }

    /**
     * 统一 Hint 接口
     * @param {'candidates'|'next'} type
     * @param {number} [row]
     * @param {number} [col]
     * @returns {any} Hint 数据
     */
    getHint(type, row, col) {
        if (type === 'candidates') return { row, col, candidates: this.getCandidates(row, col) };
        if (type === 'next') return this.getNextMove();
        return null;
    }

    /* ─── 私有方法 ─── */

    _checkRowConflict(row, col, val) {
        return this._cells[row].some((v, c) => c !== col && v === val);
    }

    _checkColConflict(row, col, val) {
        return this._cells.some((r, i) => i !== row && r[col] === val);
    }

    _checkBoxConflict(row, col, val) {
        const br = Math.floor(row / 3) * 3;
        const bc = Math.floor(col / 3) * 3;
        for (let r = br; r < br + 3; r++) {
            for (let c = bc; c < bc + 3; c++) {
                if (r === row && c === col) continue;
                if (this._cells[r][c] === val) return true;
            }
        }
        return false;
    }
}
