import { writable, derived } from 'svelte/store';
import { createGame, createSudoku, createGameFromJSON } from './index.js';

/**
 * 游戏状态 Store —— 领域对象与 Svelte UI 之间的适配层。
 */
export function createGameStore(initialGrid = null, options = {}) {
    let initialSudoku = null;
    let initialGame = null;

    if (initialGrid) {
        initialSudoku = createSudoku(initialGrid);
        initialGame = createGame({ sudoku: initialSudoku, hintsTotal: options.hintsTotal ?? 0 });
    }

    // ─── 计时器状态 ─────────────────────────────
    let timerInterval = null;
    let elapsedSeconds = 0;

    // 状态对象
    let _state = {
        game: initialGame, 
        _version: 0,
        elapsed: 0,
        _lastCommitResult: null
    };

    // 创建 writable store
    const store = writable(_state);
    const { subscribe, set, update } = store;

    // ─── 派生状态（供 UI 使用的安全视图） ─────────────────────────
    // 每次 store 更新都生成全新对象，所有字段都是新引用，
    // 解决了 Svelte 响应式在 game 引用不变时不触发更新的问题。
    const gameState = derived(store, ($store) => {
        if (!$store.game) return null;
        const game = $store.game;
        return {
            grid:            game.getGrid(),
            locked:          game.getLocked(),
            conflicts:       game.getConflicts(),
            solved:          game.isSolved(),
            canUndo:         game.canUndo(),
            canRedo:         game.canRedo(),
            isPaused:        game.isPaused,
            isExploring:     game.isExploring,
            hintsRemaining:  game.getHintsRemaining(),
            hintsUsed:       game.hintsUsed,
            hintsTotal:      game.hintsTotal,
            elapsed:         $store.elapsed,
            _version:        $store._version,
            lastCommitResult: $store._lastCommitResult,
        };
    });

    // ─── 内部辅助 ───────────────────────────────
    function bump(state) {
        return { ...state, _version: state._version + 1, _lastCommitResult: null };
    }

    function startTimer() {
        stopTimer();
        elapsedSeconds = 0;
        update(state => ({ ...state, elapsed: 0 }));
        timerInterval = setInterval(() => {
            elapsedSeconds++;
            update(state => ({ ...state, elapsed: elapsedSeconds }));
        }, 1000);
    }

    function resumeTimer()
    {
        stopTimer();
        timerInterval = setInterval(() => {
            elapsedSeconds++;
            update(state => ({ ...state, elapsed: elapsedSeconds }));
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function resetTimer() {
        stopTimer();
        elapsedSeconds = 0;
    }

    // ─── 对外 API ─────────────────────────────────
    return {
        // subscribe 指向 gameState，这样 $gameStore 直接返回 gameState 对象
        subscribe: gameState.subscribe,
        
        /** 获取游戏是否已初始化 */
        isReady() {
            let ready = false;
            store.subscribe(s => { ready = (s.game !== null); })();
            return ready;
        },

        /** 加载新局面 */
        load(newGrid) {
            resetTimer();
            const sudoku = createSudoku(newGrid);
            const game = createGame({ sudoku });
            set({ game, _version: 0, elapsed: 0, _lastCommitResult: null });
            startTimer();
        },

        // ══════════════════════════════════════════════════════════════
        // 游戏操作
        // ══════════════════════════════════════════════════════════════

        /**
         * 猜测/填入数字
         */
        guess(row, col, value) {
            let success = false;
            update(state => {
                if (state.game) {
                    success = state.game.guess({ row, col, value });
                    if (success) {
                        if (!state.game.isExploring && state.game.isSolved()) {
                            stopTimer();
                        }
                        return bump(state);
                    }
                }
                return state;
            });
            return success;
        },

        undo() {
            update(state => {
                if (state.game) {
                    state.game.undo();
                    return bump(state);
                }
                return state;
            });
        },

        redo() {
            update(state => {
                if (state.game) {
                    state.game.redo();
                    return bump(state);
                }
                return state;
            });
        },

        pause() {
            update(state => {
                if (state.game) {
                    state.game.pause();
                    stopTimer();
                    return bump(state);
                }
                return state;
            });
        },

        resume() {
            update(state => {
                if (state.game) {
                    state.game.resume();
                    if (!state.game.isSolved()) {
                        resumeTimer();
                    }
                    return bump(state);
                }
                return state;
            });
        },

        getCandidates(row, col) {
            let result = [];
            store.subscribe(s => { 
                if (s.game) result = s.game.getCandidates(row, col);
            })();
            return result;
        },

        getNextMove() {
            let result = null;
            store.subscribe(s => { 
                if (s.game) result = s.game.getNextMove();
            })();
            return result;
        },

        getHint(row, col) {
            let result = null;
            store.subscribe(s => { 
                if (s.game) result = s.game.hint('candidates', row, col);
            })();
            return result;
        },

        useHint() {
            let success = false;
            update(state => {
                if (state.game) {
                    success = state.game.useHint();
                    if (success) {
                        return bump(state);
                    }
                }
                return state;
            });
            return success;
        },

        exploreStart() {
            let success = false;
            update(state => {
                if (state.game) {
                    success = state.game.exploreStart();
                    return bump(state);
                }
                return state;
            });
            return success;
        },

        exploreCommit() {
            let result = { success: false };
            update(state => {
                if (state.game) {
                    result = state.game.exploreCommit();
                    if (result.success && state.game.isSolved()) {
                        stopTimer();
                    }
                    return { ...bump(state), _lastCommitResult: result };
                }
                return state;
            });
            return result;
        },

        exploreRollback() {
            update(state => {
                if (state.game) {
                    state.game.exploreRollback();
                    return bump(state);
                }
                return state;
            });
        },

        fromJSON(json) {
            resetTimer();
            const game = createGameFromJSON(json);
            set({ game, _version: 0, elapsed: 0, _lastCommitResult: null });
        }
    };
}
