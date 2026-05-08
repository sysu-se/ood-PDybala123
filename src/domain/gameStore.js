import { writable, derived } from 'svelte/store';
import { createGame, createSudoku, createGameFromJSON } from './index.js';

/**
 * createGameStore
 * 将 Game 对象适配成 Svelte 可响应式 store
 * 支持：Hint / Explore / Undo / Redo / Timer
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

    // 内部 state
    let _state = {
        game: initialGame,
        elapsed: 0,
        _version: 0,
        _lastCommitResult: null
    };

    const store = writable(_state);
    const { subscribe, set, update } = store;

    // ─── 派生状态（供 UI 消费） ─────────────
    const gameState = derived(store, $store => {
        if (!$store.game) return null;
        const game = $store.game;
        return {
            grid: game.getGrid(),
            given: game.getGiven(),
            conflicts: game.getConflicts(),
            solved: game.isSolved(),
            canUndo: game.canUndo(),
            canRedo: game.canRedo(),
            isPaused: game.isPaused,
            isExploring: game.isExploring,
            hintsUsed: game.hintsUsed,
            hintsTotal: game.hintsTotal,
            hintsRemaining: game.getHintsRemaining(),
            elapsed: $store.elapsed,
            _version: $store._version,
            lastCommitResult: $store._lastCommitResult
        };
    });

    // ─── 内部辅助 ───────────────────────────────
    function bump(state) {
        return { ...state, _version: state._version + 1, _lastCommitResult: null };
    }

    function startTimer() {
        stopTimer();
        elapsedSeconds = 0;
        update(s => ({ ...s, elapsed: 0 }));
        timerInterval = setInterval(() => {
            elapsedSeconds++;
            update(s => ({ ...s, elapsed: elapsedSeconds }));
        }, 1000);
    }

    function resumeTimer() {
        stopTimer();
        timerInterval = setInterval(() => {
            elapsedSeconds++;
            update(s => ({ ...s, elapsed: elapsedSeconds }));
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

    // ─── 对外 API ───────────────────────────────
    return {
        subscribe: gameState.subscribe,

        isReady() {
            let ready = false;
            store.subscribe(s => { ready = !!s.game; })();
            return ready;
        },

        load(newGrid) {
            resetTimer();
            const sudoku = createSudoku(newGrid);
            const game = createGame({ sudoku });
            set({ game, elapsed: 0, _version: 0, _lastCommitResult: null });
            startTimer();
        },

        /* ─── 游戏操作 ─── */
        guess(row, col, value) {
            let success = false;
            update(state => {
                if (state.game) {
                    success = state.game.guess({ row, col, value });
                    if (success && !state.game.isExploring && state.game.isSolved()) {
                        stopTimer();
                    }
                    return success ? bump(state) : state;
                }
                return state;
            });
            return success;
        },

        undo() { update(state => state.game ? bump({ ...state, game: (state.game.undo(), state.game) }) : state); },
        redo() { update(state => state.game ? bump({ ...state, game: (state.game.redo(), state.game) }) : state); },

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
                    if (!state.game.isSolved()) resumeTimer();
                    return bump(state);
                }
                return state;
            });
        },

        getCandidates(row, col) {
            let result = [];
            store.subscribe(s => { if (s.game) result = s.game.getCandidates(row, col); })();
            return result;
        },

        getNextMove() {
            let result = null;
            store.subscribe(s => { if (s.game) result = s.game.getNextMove(); })();
            return result;
        },

        getHint(row, col) {
            let result = null;
            store.subscribe(s => { if (s.game) result = s.game.getHint('candidates', row, col); })();
            return result;
        },

        useHint() {
            let success = false;
            update(state => {
                if (state.game) {
                    success = state.game.useHint();
                    return success ? bump(state) : state;
                }
                return state;
            });
            return success;
        },

        exploreStart() {
            let success = false;
            update(state => {
                if (state.game) success = state.game.exploreStart();
                return success ? bump(state) : state;
            });
            return success;
        },

        exploreCommit() {
            let result = { success: false };
            update(state => {
                if (state.game) {
                    result = state.game.exploreCommit();
                    if (result.success && state.game.isSolved()) stopTimer();
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
            set({ game, elapsed: 0, _version: 0, _lastCommitResult: null });
        }
    };
}
