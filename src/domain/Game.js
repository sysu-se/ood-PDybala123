import { Sudoku } from './Sudoku.js';

export class Game {
    /**
     * @param {Sudoku} sudoku
     * @param {Array}  undoStack  move 记录栈 { row, col, before, after }[]
     * @param {Array}  redoStack
     * @param {Object} options  游戏选项
     * @param {number} options.hintsTotal  总提示次数（0 表示无限）
     */
    constructor(sudoku, undoStack = [], redoStack = [], options = {}) {
        this._sudoku = sudoku;
        this._undoStack = [...undoStack];
        this._redoStack = [...redoStack];

        // ─── 游戏状态（私有属性） ───
        this._isPaused = false;
        this._hintsUsed = 0;
        this._hintsTotal = options.hintsTotal ?? 0; // 0 表示无限提示

        // ─── 探索模式状态（私有属性） ───
        this._isExploring = false;
        this._exploreSnapshot = null;
        this._exploreUndoStack = [];
    }

    // ══════════════════════════════════════════════════════════════
    // 公共只读属性（getter，禁止直接修改）
    // ══════════════════════════════════════════════════════════════

    get isPaused() { return this._isPaused; }
    get isExploring() { return this._isExploring; }
    get hintsUsed() { return this._hintsUsed; }
    get hintsTotal() { return this._hintsTotal; }

    // ══════════════════════════════════════════════════════════════
    // 暂停/恢复
    // ══════════════════════════════════════════════════════════════

    pause() {
        this._isPaused = true;
    }

    resume() {
        this._isPaused = false;
    }

    // ══════════════════════════════════════════════════════════════
    // 提示相关
    // ══════════════════════════════════════════════════════════════

    getHintsRemaining() {
        if (this._hintsTotal === 0) return Infinity; // 无限提示
        return Math.max(0, this._hintsTotal - this._hintsUsed);
    }

    /**
     * 消耗一次提示次数（带边界检查）
     * @returns {boolean} 是否成功消耗（hintsTotal 为 0 时表示无限，返回 true）
     */
    useHint() {
        // 如果 hintsTotal 为 0，表示无限提示
        if (this._hintsTotal === 0) {
            this._hintsUsed++;
            return true;
        }
        // 如果已用次数小于总数，允许消耗
        if (this._hintsUsed < this._hintsTotal) {
            this._hintsUsed++;
            return true;
        }
        // 已用完所有提示次数
        return false;
    }

    // ══════════════════════════════════════════════════════════════
    // 受保护的方法（供 gameStore 调用）
    // ══════════════════════════════════════════════════════════════

    /**
     * 获取只读的 grid 副本
     * @deprecated 使用 getGrid() 代替
     */
    getSudoku() {
        // 返回只读副本，防止外部绕过封装
        return {
            getGrid: () => this._sudoku.getGrid(),
            getLocked: () => this._sudoku.getLocked(),
            getCandidates: (r, c) => this._sudoku.getCandidates(r, c),
            getNextMove: () => this._sudoku.getNextMove(),
            isSolved: () => this._sudoku.isSolved(),
            getConflicts: () => this._sudoku.getConflicts()
        };
    }

    /** 获取只读的 grid 副本 */
    getGrid() {
        return this._sudoku.getGrid();
    }

    /** 获取只读的 locked 副本 */
    getLocked() {
        return this._sudoku.getLocked();
    }

    /** 获取冲突列表 */
    getConflicts() {
        return this._sudoku.getConflicts();
    }

    /** 判断是否已解决 */
    isSolved() {
        return this._sudoku.isSolved();
    }

    /** 是否可以撤销 */
    canUndo() {
        if (this._isExploring) return this._exploreUndoStack.length > 0;
        return this._undoStack.length > 0;
    }

    /** 是否可以重做 */
    canRedo() {
        return !this._isExploring && this._redoStack.length > 0;
    }

    /* ─── 游戏操作 ─── */

    /**
     * 猜测/填入数字
     * @param {{row, col, value}} move
     * @returns {boolean} 是否成功
     */
    guess(move) {
        if(this._isPaused) return false;
        const { row, col, value } = move;
        // 使用 getCell() 获取原值，避免完整深拷贝
        const before = this._sudoku.getCell(row, col);

        // 探索模式下操作记录到探索历史，不影响主 _undoStack
        if (this._isExploring) {
            const success = this._sudoku.guess(move);
            if (success) {
                this._exploreUndoStack.push({ row, col, before, after: value });
            }
            return success;
        }

        const success = this._sudoku.guess(move);
        if (!success) return false;

        // push move record
        this._undoStack.push({ row, col, before, after: value });
        this._redoStack = [];
        return true;
    }

    /* ─── Undo / Redo ─── */

    undo() {
        if (this._isPaused) return;
        // 探索模式下撤销探索历史
        if (this._isExploring) {
            if (this._exploreUndoStack.length === 0) return;
            const record = this._exploreUndoStack.pop();
            this._sudoku.guess({ row: record.row, col: record.col, value: record.before });
            return;
        }

        if (!this.canUndo()) return;
        const record = this._undoStack.pop();
        this._sudoku.guess({ row: record.row, col: record.col, value: record.before });
        this._redoStack.push(record);
    }

    redo() {
        if (this._isPaused) return;
        // 探索模式下无 redo
        if (this._isExploring) return;

        if (!this.canRedo()) return;
        const record = this._redoStack.pop();
        this._sudoku.guess({ row: record.row, col: record.col, value: record.after });
        this._undoStack.push(record);
    }

    /* ─── 提示功能 ─── */

    /**
     * 获取某格子的候选数
     * @returns {number[]} 候选数数组
     */
    getCandidates(row, col) {
        return this._sudoku.getCandidates(row, col);
    }

    /**
     * 获取下一步可推断的推定数（唯一候选数）
     * @returns {{ row, col, value } | null}
     */
    getNextMove() {
        return this._sudoku.getNextMove();
    }

    /**
     * 获取候选数提示（仅查询，不自动填入）
     * @deprecated 由 gameStore.getHint() 代替
     * @param {'candidates' | 'next'} type
     * @param {number} [row]
     * @param {number} [col]
     */
    hint(type, row, col) {
        if (this._isPaused) return null;
        // 预留接口，供将来扩展使用
        if (type === 'candidates') {
            return {
                type: 'candidates',
                data: { row, col, candidates: this.getCandidates(row, col) }
            };
        }
        if (type === 'next') {
            const move = this.getNextMove();
            if (!move) {
                return { type: 'none', data: null };
            }
            return { type: 'next', data: move };
        }
        return null;
    }

    /**
     * 获取提示（仅查询，不自动填入）
     * @deprecated 由 getNextMove() + guess() 组合代替
     */
    getHint(type, row, col) {
        // 预留接口，供将来扩展使用
        return this.hint(type, row, col);
    }

    /* ─── 探索模式 ─── */

    /**
     * 进入探索模式：保存当前盘面快照
     * @returns {boolean} 是否成功进入
     */
    exploreStart() {
        if (this._isExploring) return false;

        this._exploreSnapshot = {
            grid: this._sudoku.getGrid(),
            locked: this._sudoku.getLocked(),
            undoStackLength: this._undoStack.length
        };
        this._exploreUndoStack = [];
        this._isExploring = true;
        return true;
    }

    /**
     * 提交探索结果
     * @returns {{ success: boolean, hasConflicts?: boolean }} 提交结果
     */
    exploreCommit() {
        if (!this._isExploring) return { success: false };

        // 检查探索结果是否有效（无冲突）
        if (this._sudoku.getConflicts().length > 0) {
            return { success: false, hasConflicts: true };
        }

        // 将探索历史的每一步记录到主 _undoStack
        for (const record of this._exploreUndoStack) {
            this._undoStack.push(record);
        }

        this._isExploring = false;
        this._exploreSnapshot = null;
        this._exploreUndoStack = [];
        this._redoStack = [];

        return { success: true };
    }

    /**
     * 放弃探索：回滚到探索前的状态
     */
    exploreRollback() {
        if (!this._isExploring || !this._exploreSnapshot) return;

        this._sudoku.setGrid(this._exploreSnapshot.grid);
        this._undoStack.length = this._exploreSnapshot.undoStackLength;

        this._isExploring = false;
        this._exploreSnapshot = null;
        this._exploreUndoStack = [];
    }

    /* ─── 序列化 ─── */

    /**
     * 序列化为 JSON（受控方式）
     */
    toJSON() {
        return {
            current: this._sudoku.toJSON(),
            undoStack: [...this._undoStack],
            redoStack: [...this._redoStack],
            isPaused: this._isPaused,
            hintsUsed: this._hintsUsed,
            hintsTotal: this._hintsTotal,
            isExploring: this._isExploring,
            exploreSnapshot: this._exploreSnapshot,
            exploreUndoStack: [...this._exploreUndoStack]
        };
    }

    /**
     * 从 JSON 反序列化（受控方式）
     * @param {Object} json 序列化的游戏状态
     * @returns {Game}
     */
    static fromJSON(json) {

        const sudoku = new Sudoku(json.current.grid, json.current.locked);
        const game = new Game(sudoku, json.undoStack ?? [], json.redoStack ?? [], {
            hintsTotal: json.hintsTotal ?? 0
        });
        
        // 通过受控方法恢复状态
        game._restoreState({
            isPaused: json.isPaused,
            hintsUsed: json.hintsUsed,
            isExploring: json.isExploring,
            exploreSnapshot: json.exploreSnapshot,
            exploreUndoStack: json.exploreUndoStack ?? []
        });
        
        return game;
    }

    /**
     * 受控的状态恢复（仅供 fromJSON 使用）
     * @private
     * @param {Object} state 要恢复的状态
     */
    _restoreState(state) {
        if (state.isPaused) {
            this._isPaused = true;
        }
        if (state.hintsUsed !== undefined) {
            this._hintsUsed = state.hintsUsed;
        }
        if (state.isExploring) {
            this._isExploring = true;
            this._exploreSnapshot = state.exploreSnapshot;
            this._exploreUndoStack = state.exploreUndoStack;
        }
    }
}
