/**
 * 难度选择 - UI 偏好设置
 * 这个 store 存储用户选择的难度，不参与游戏逻辑
 */
import { writable } from 'svelte/store';
import { DIFFICULTIES } from '../constants.js';

// 默认难度
const DEFAULT_DIFFICULTY = 'easy';

// 初始难度
const stored = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('sudoku-difficulty') 
    : null;

export const difficulty = writable(
    stored && DIFFICULTIES.hasOwnProperty(stored) ? stored : DEFAULT_DIFFICULTY
);

// 监听变化，持久化
if (typeof localStorage !== 'undefined') {
    difficulty.subscribe(value => {
        localStorage.setItem('sudoku-difficulty', value);
    });
}
