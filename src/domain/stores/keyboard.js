/**
 * 键盘状态 - UI 状态
 * 控制键盘输入是否启用
 */
import { writable } from 'svelte/store';

export const keyboardDisabled = writable(false);

export function enableKeyboard() {
    keyboardDisabled.set(false);
}

export function disableKeyboard() {
    keyboardDisabled.set(true);
}
