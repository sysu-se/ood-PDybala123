import { writable, derived } from 'svelte/store';

/**
 * 模态框 Store
 * 管理应用中的所有模态框状态
 */

// 模态框数据 store
export const modalData = writable({});

// 模态框类型 store
export const modal = (() => {
    const { subscribe, set } = writable(null);

    // 待执行的隐藏回调
    let hideCallback = null;

    return {
        subscribe,

        /** 显示指定类型的模态框 */
        show(type, data = {}) {
            modalData.set(data);
            set(type);
        },

        /** 隐藏当前模态框 */
        hide() {
            if (hideCallback) {
                hideCallback();
                hideCallback = null;
            }
            set(null);
            modalData.set({});
        },

        /** 设置隐藏时的回调 */
        setHideCallback(callback) {
            hideCallback = callback;
        },

        /** 清空回调 */
        clearCallback() {
            hideCallback = null;
        }
    };
})();
