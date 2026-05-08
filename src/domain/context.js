import { getContext, setContext } from 'svelte';

export const GAME_STORE_KEY = Symbol('gameStore');

/**
 * 设置 gameStore 到 context
 * @param {Object} gameStore - createGameStore 返回的 store
 */
export function setGameContext(gameStore) {
    setContext(GAME_STORE_KEY, gameStore);
}

/**
 * 从 context 获取 gameStore
 * @returns {Object} gameStore
 */
export function getGameContext() {
    return getContext(GAME_STORE_KEY);
}
