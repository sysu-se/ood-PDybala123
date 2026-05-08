// 难度级别
export const DIFFICULTIES = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    extreme: 'Extreme'
};

// 自定义难度标记
export const DIFFICULTY_CUSTOM = 'custom';

// 难度对应的空格数量
export const DIFFICULTY_HOLES = {
    easy: 35,
    medium: 45,
    hard: 52,
    extreme: 58,
    custom: 40
};

// 下拉菜单动画持续时间 (ms)
export const DROPDOWN_DURATION = 150;

// 模态框动画持续时间 (ms)
export const MODAL_DURATION = 200;

// 无模态框状态
export const MODAL_NONE = null;

// 棋盘大小
export const BOX_SIZE = 3;
export const SUDOKU_SIZE = 9;

// 提示次数限制
export const MAX_HINTS = 5;
export const DEFAULT_HINTS = 3;

// 基础 URL
export const BASE_URL = 'https://sudoku.com';

// 候选数格子坐标 (用于渲染 3x3 候选数网格)
// 每个元素是 [row, col]，对应 9 个候选数的排列位置
export const CANDIDATE_COORDS = [
    [1, 1], [1, 4], [1, 7],
    [4, 1], [4, 4], [4, 7],
    [7, 1], [7, 4], [7, 7]
];

// 游戏结束庆祝语
export const GAME_OVER_CELEBRATIONS = [
    'Congratulations!',
    'Well Done!',
    'Amazing!',
    'Fantastic!',
    'You Won!'
];
