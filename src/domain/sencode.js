/**
 * 数独编码/解码工具
 * 将数独盘面编码为短字符串（sencode）
 */

/**
 * 验证 sencode 格式是否有效
 * @param {string} sencode
 * @returns {boolean}
 */
export function validateSencode(sencode) {
    if (!sencode || typeof sencode !== 'string') return false;
    // sencode 应该是 base64 编码的字符串
    return /^[A-Za-z0-9+/=_-]+$/.test(sencode) && sencode.length >= 40;
}

/**
 * 将数独盘面编码为 sencode
 * @param {number[][]} grid - 9x9 数独盘面
 * @returns {string} sencode 字符串
 */
export function encodeSudoku(grid) {
    // 将 2D 数组转为 1D 字符串
    let bits = '';
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const val = grid[r][c] || 0;
            bits += val.toString(2).padStart(4, '0');
        }
    }

    // 每 6 位转换为一个字符（使用 base64 变体）
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < bits.length; i += 6) {
        const chunk = bits.slice(i, i + 6);
        const val = parseInt(chunk.padEnd(6, '0'), 2);
        result += chars[val];
    }

    // 移除末尾的填充
    return result.replace(/=+$/, '');
}

/**
 * 将 sencode 解码为数独盘面
 * @param {string} sencode
 * @returns {number[][]} 9x9 数独盘面
 */
export function decodeSencode(sencode) {
    if (!validateSencode(sencode)) {
        return Array(9).fill(null).map(() => Array(9).fill(0));
    }

    // 补齐 padding
    const paddedLength = Math.ceil(sencode.length / 4) * 4;
    const padded = sencode.padEnd(paddedLength, 'A');

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let bits = '';

    for (const char of padded) {
        const idx = chars.indexOf(char);
        if (idx >= 0) {
            bits += idx.toString(2).padStart(6, '0');
        }
    }

    const grid = [];
    for (let r = 0; r < 9; r++) {
        const row = [];
        for (let c = 0; c < 9; c++) {
            const bitIndex = (r * 9 + c) * 4;
            const chunk = bits.slice(bitIndex, bitIndex + 4);
            row.push(parseInt(chunk.padEnd(4, '0'), 2));
        }
        grid.push(row);
    }

    return grid;
}
