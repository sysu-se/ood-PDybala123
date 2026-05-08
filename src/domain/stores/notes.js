import { writable } from 'svelte/store';

/**
 * 笔记模式 Store
 * 跟踪是否开启笔记模式
 */
function createNotesStore() {
    const { subscribe, set, update } = writable(false);

    return {
        subscribe,

        /** 切换笔记模式 */
        toggle() {
            update(v => !v);
        },

        /** 开启笔记模式 */
        enable() {
            set(true);
        },

        /** 关闭笔记模式 */
        disable() {
            set(false);
        },

        /** 设置笔记模式状态 */
        set(value) {
            set(value);
        }
    };
}

export const notes = createNotesStore();
