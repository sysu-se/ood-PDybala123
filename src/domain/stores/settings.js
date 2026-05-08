import { writable } from 'svelte/store';
import { DEFAULT_HINTS, MAX_HINTS } from '../constants.js';

/**
 * 设置项 Store
 */
const defaultSettings = {
    displayTimer: true,           // 显示计时器
    hintsLimited: true,           // 限制提示次数
    hints: DEFAULT_HINTS,         // 可用提示次数
    highlightCells: true,         // 高亮同行列宫
    highlightSame: true,          // 高亮相同数字
    highlightConflicting: true,  // 高亮冲突数字
    darkTheme: false             // 深色主题（预留）
};

function createSettingsStore() {
    const { subscribe, set, update } = writable({ ...defaultSettings });

    return {
        subscribe,

        /** 重置为默认设置 */
        reset() {
            set({ ...defaultSettings });
        },

        /** 更新设置 */
        set(settings) {
            set({ ...defaultSettings, ...settings });
        },

        /** 更新单个设置项 */
        updateKey(key, value) {
            update(s => ({ ...s, [key]: value }));
        }
    };
}

export const settings = createSettingsStore();
