export class Sudoku {
    constructor(grid, locked = null) {
        this._grid = JSON.parse(JSON.stringify(grid)).map(row =>
            row.map(cell => (cell === 0 || cell === null) ? null : cell)
        );
        this._locked = locked
            ? JSON.parse(JSON.stringify(locked))
            : grid.map(row => row.map(cell => cell !== 0 && cell !== null));
    }

    getCell(row, col) {
        return this._grid[row]?.[col] ?? null;
    }

    getGrid() {
        return JSON.parse(JSON.stringify(this._grid));
    }

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

    guess(move) {
        const { row, col, value } = move;
        if (!Number.isInteger(row) || row < 0 || row > 8 ||
            !Number.isInteger(col) || col < 0 || col > 8) return false;
        if (value !== null && value !== 0 &&
            (!Number.isInteger(value) || value < 1 || value > 9)) return false;
        if (this._locked[row][col]) return false;
        this._grid[row][col] = (value === 0) ? null : value;
        return true;
    }

    isConflict(row, col) {
        const val = this._grid[row][col];
        if (!val) return false;
        return (
            this._rowConflict(row, col, val) ||
            this._colConflict(row, col, val) ||
            this._boxConflict(row, col, val)
        );
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
                const v = this._grid[r][c];
                if (!v) return false;
                if (this.isConflict(r, c)) return false;
            }
        }
        return true;
    }

    // ─── 最小修改 ───
    clone() {
        return new Sudoku(this.getGrid(), this.getLocked());
    }

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

    static fromJSON(json) {
        return new Sudoku(json.grid, json.locked ?? null);
    }

    /* ─── 提示功能 ─── */
    getCandidates(row, col) {
        if (!this._grid || !this._grid[row] || this._grid[row][col] === undefined) return [];
        const val = this._grid[row][col];
        if (val !== null && val !== 0) return [];
        const blocked = new Set();
        for (let c = 0; c < 9; c++) if (this._grid[row][c]) blocked.add(this._grid[row][c]);
        for (let r = 0; r < 9; r++) if (this._grid[r][col]) blocked.add(this._grid[r][col]);
        const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
        for (let r = br; r < br + 3; r++) for (let c = bc; c < bc + 3; c++)
            if (this._grid[r][c]) blocked.add(this._grid[r][c]);
        return [1,2,3,4,5,6,7,8,9].filter(v => !blocked.has(v));
    }

    getNextMove() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const val = this._grid[r][c];
                if (val !== null && val !== 0) continue;
                if (this._locked[r][c]) continue;
                const candidates = this.getCandidates(r, c);
                if (candidates.length === 1) return { row: r, col: c, value: candidates[0] };
            }
        }
        return null;
    }

    _rowConflict(row, col, val) { return this._grid[row].some((v,c) => c !== col && v===val); }
    _colConflict(row, col, val) { return this._grid.some((r,i)=> i!==row && r[col]===val); }
    _boxConflict(row, col, val) {
        const br=Math.floor(row/3)*3, bc=Math.floor(col/3)*3;
        for(let r=br;r<br+3;r++) for(let c=bc;c<bc+3;c++)
            if(r!==row||c!==col) if(this._grid[r][c]===val) return true;
        return false;
    }
}
