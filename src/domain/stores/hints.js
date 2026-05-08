/**
 * 提示次数限制 - UI 偏好设置
 * 这个 store 控制提示功能的限制策略
 */
import { writable, derived } from 'svelte/store';
import { DEFAULT_HINTS } from '../constants.js';

// 存储可用提示次数
const stored = typeof localStorage !== 'undefined'
    ? localStorage.getItem('sudoku-hints')
    : null;

export const hints = writable(
    stored ? parseInt(stored, 10) : DEFAULT_HINTS
);

// 监听变化，持久化
if (typeof localStorage !== 'undefined') {
    hints.subscribe(value => {
        localStorage.setItem('sudoku-hints', String(value));
    });
}

// 导出一个 useHint 方法来递减
export function useHint() {
    hints.update(n => Math.max(0, n - 1));
}
