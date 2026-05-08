/**
 * UI Stores - 纯 UI 状态，与领域对象无关
 */

// 光标位置
export { cursor } from './cursor.js';

// 弹窗状态
export { modal, modalData } from './modal.js';

// 笔记模式
export { notes } from './notes.js';

// 用户设置
export { settings } from './settings.js';

// 难度选择（UI 偏好）
export { difficulty } from './difficulty.js';

// 提示次数限制（UI 偏好）
export { hints, useHint } from './hints.js';
