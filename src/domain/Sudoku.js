export class Sudoku {
    /**
     * @param {(number|null)[][]} grid  9×9 二维数组，0 或 null 表示空格
     * @param {boolean[][]}       [locked]  标记初始给定格（不可修改）
     */
    constructor(grid, locked = null) {
        // 将 grid 中的 0 转换为 null，统一表示空格
        this._grid = JSON.parse(JSON.stringify(grid)).map(row =>
            row.map(cell => (cell === 0 || cell === null) ? null : cell)
        );
        // 若未传入 locked，则把一开始所有非零格视为给定格
        this._locked = locked
            ? JSON.parse(JSON.stringify(locked))
            : grid.map(row => row.map(cell => cell !== 0 && cell !== null));
    }

    /* ─── 基本读取 ─── */

    /**
     * 获取格子 (row, col) 的值（性能优化，避免完整深拷贝）
     * @returns {number|null}
     */
    getCell(row, col) {
        return this._grid[row]?.[col] ?? null;
    }

    getGrid() {
        return JSON.parse(JSON.stringify(this._grid));
    }

    /**
     * 批量设置盘面（用于状态恢复）
     * @param {(number|null)[][]} grid  9×9 二维数组
     */
    setGrid(grid) {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                this._grid[r][c] = grid[r][c];
            }
        }
    }

    getLocked() {
        return JSON.parse(JSON.stringify(this._locked));
    }

    isLocked(row, col) {
        return this._locked[row][col];
    }

    /** 填入/清除格子值。返回是否成功，拒绝修改 locked 格 */
    guess(move) {
        const { row, col, value } = move;

        // ─── 输入验证 ───
        if (!Number.isInteger(row) || row < 0 || row > 8 ||
            !Number.isInteger(col) || col < 0 || col > 8) {
            return false;
        }
        // value 可以是 1-9，或 null/0 表示清除
        if (value !== null && value !== 0 &&
            (!Number.isInteger(value) || value < 1 || value > 9)) {
            return false;
        }
        if (this._locked[row][col]) return false;   // 给定格不可修改

        this._grid[row][col] = (value === 0) ? null : value;
        return true;
    }


    /** 判断某个格子的值是否与同行/列/宫冲突（0/null 视为空，不冲突） */
    isConflict(row, col) {
        const val = this._grid[row][col];
        if (!val) return false;
        return (
            this._rowConflict(row, col, val) ||
            this._colConflict(row, col, val) ||
            this._boxConflict(row, col, val)
        );
    }

    /** 返回所有冲突格坐标 { row, col }[] */
    getConflicts() {
        const conflicts = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.isConflict(r, c)) conflicts.push({ row: r, col: c });
            }
        }
        return conflicts;
    }

    /** 判断当前盘面是否已完成且合法 */
    isSolved() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const v = this._grid[r][c];
                if (!v) return false;               // 有空格
                if (this.isConflict(r, c)) return false; // 有冲突
            }
        }
        return true;
    }

    /* ─── clone ─── */

    clone() {
        return new Sudoku(this.getGrid(), this.getLocked());
    }

    /* ─── 序列化 ─── */

    toString() {
        return this._grid
            .map(row => row.map(cell => (cell === null || cell === 0 ? '.' : cell)).join(' '))
            .join('\n');
    }

    toJSON() {
        return {
            grid: this.getGrid(),
            locked: this.getLocked()
        };
    }

    /* ─── 提示功能 ─── */

    /**
     * 计算某格子 (row, col) 的候选数集合 { 1..9 }
     * @returns {number[]} 候选数数组，若格子已有值则返回空数组
     */
    getCandidates(row, col) {
        // 防御性检查
        if (!this._grid || !this._grid[row] || this._grid[row][col] === undefined) {
            return [];
        }
        
        const val = this._grid[row][col];
        if (val !== null && val !== 0) return []; // 已填格子无候选数

        const blocked = new Set();
        // 同行
        for (let c = 0; c < 9; c++) {
            if (this._grid[row][c]) blocked.add(this._grid[row][c]);
        }
        // 同列
        for (let r = 0; r < 9; r++) {
            if (this._grid[r][col]) blocked.add(this._grid[r][col]);
        }
        // 同宫
        const br = Math.floor(row / 3) * 3;
        const bc = Math.floor(col / 3) * 3;
        for (let r = br; r < br + 3; r++) {
            for (let c = bc; c < bc + 3; c++) {
                if (this._grid[r][c]) blocked.add(this._grid[r][c]);
            }
        }

        return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(v => !blocked.has(v));
    }

    /**
     * 找到当前盘面下一步可推断的"推定数"（唯一候选数）。
     * @returns {{ row, col, value } | null} 若无推定数则返回 null
     */
    getNextMove() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const val = this._grid[r][c];
                if (val !== null && val !== 0) continue;   // 跳过已填格
                if (this._locked[r][c]) continue;           // 只提示用户可填的格
                const candidates = this.getCandidates(r, c);
                if (candidates.length === 1) {
                    return { row: r, col: c, value: candidates[0] };
                }
            }
        }
        return null; // 无法推断下一步
    }

    /* ─── 私有辅助 ─── */

    _rowConflict(row, col, val) {
        return this._grid[row].some((v, c) => c !== col && v === val);
    }

    _colConflict(row, col, val) {
        return this._grid.some((r, i) => i !== row && r[col] === val);
    }

    /** 检查同宫（3×3 子宫）内是否有重复值 */
    _boxConflict(row, col, val) {
        const br = Math.floor(row / 3) * 3;
        const bc = Math.floor(col / 3) * 3;
        for (let r = br; r < br + 3; r++) {
            for (let c = bc; c < bc + 3; c++) {
                if (r === row && c === col) continue; // 跳过自己
                if (this._grid[r][c] === val) return true;
            }
        }
        return false;
    }
}
