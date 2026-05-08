import { writable, derived } from 'svelte/store';

/**
 * 光标位置 Store
 * 跟踪当前选中的格子坐标
 */
function createCursorStore() {
    const { subscribe, set, update } = writable({ x: null, y: null });

    return {
        subscribe,

        /** 设置光标位置 */
        set(x, y) {
            set({ x, y });
        },

        /** 移动光标（相对移动） */
        move(dx, dy = 0) {
            update(cursor => {
                let newX = cursor.x;
                let newY = cursor.y;

                if (newX === null || newY === null) {
                    newX = 4;
                    newY = 4;
                } else {
                    newX = (newX + dx + 9) % 9;
                    newY = (newY + dy + 9) % 9;
                }

                return { x: newX, y: newY };
            });
        },

        /** 重置光标 */
        reset() {
            set({ x: null, y: null });
        }
    };
}

export const cursor = createCursorStore();
