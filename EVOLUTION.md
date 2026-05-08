1. 提示功能实现

提示功能分为两种：

候选数提示（Candidates）：
Sudoku 类提供 getCandidates(row, col) 方法，返回该格子可能的数字集合。
计算逻辑：检查该格子所在的行、列、宫中已经存在的数字，剩下的数字即为候选数。
唯一候选数推断（Next Move）：
Sudoku 类提供 getNextMove() 方法，扫描整个盘面，找到候选数集合仅有一个数字的格子，并返回 { row, col, value }。
Game 类通过 getNextMove() + guess() 调用实现提示操作。
2. 提示功能归属分析
提示功能 逻辑上属于 Sudoku：
Sudoku 负责计算每个格子的候选数和下一步推断数，核心算法和盘面状态紧密相关。
Game 类只负责 提示的消耗和操作控制：
Game 管理提示次数、是否处于暂停或探索模式，保证用户操作合法。

原因：
提示功能依赖盘面状态和 Sudoku 的冲突检测逻辑，因此计算本身属于 Sudoku，而 Game 只是管理提示使用。

3. 探索模式实现

探索模式用于允许用户尝试填写数字而不影响主 Undo/Redo 栈：

开始探索 (exploreStart)：
保存当前盘面快照 _exploreSnapshot。
初始化探索专用栈 _exploreUndoStack。
标记 _isExploring = true。
探索操作 (guess)：
若处于探索模式，填入数字只记录到 _exploreUndoStack，不修改主 _undoStack。
提交探索 (exploreCommit)：
检查探索结果是否有冲突。
若合法，将探索操作同步到主 _undoStack。
清空 _exploreUndoStack，结束探索模式。
放弃探索 (exploreRollback)：
回滚到 _exploreSnapshot 保存的状态。
清空 _exploreUndoStack，结束探索模式。
4. 主局面与探索局面的关系
主局面：真实游戏盘面及主 Undo/Redo 栈，用于正式记录用户操作。
探索局面：临时副本，用户可以尝试操作但不影响主盘面。
关系：
探索局面基于主局面快照。
提交时，探索操作合并到主局面。
放弃时，探索局面丢弃，主局面保持不变。
5. History 结构变化
Homework 1：仅有单一 _history，用于 Undo/Redo。
Homework 2：新增探索模式，需要区分：
_undoStack / _redoStack：主局面操作记录。
_exploreUndoStack：探索模式临时操作记录。
变化：增加了探索专用历史栈，使 Undo/Redo 能同时支持主局面和探索模式。
6. Homework 1 局限性
逻辑分散：盘面状态、操作记录、提示逻辑混在前端或全局变量中。
Undo/Redo 简单：不支持探索模式或分支尝试。
提示功能与游戏状态耦合：无法单独测试提示功能。
序列化能力不足：无法完整保存/恢复游戏状态，包括探索模式和提示次数。
7. Homework 2 改进设想（如果重做 Homework 1）
引入 Sudoku / Game OO 分层：
Sudoku 负责盘面和核心逻辑。
Game 管理游戏状态、Undo/Redo、提示次数和探索模式。
统一空格表示（0 或 null）以避免冲突计算错误。
独立历史栈：
主局面 Undo/Redo。
探索模式临时栈。
提示逻辑封装：
Sudoku 提供候选数和唯一推断。
Game 控制提示消耗和用户操作。
完整序列化 / 反序列化接口，便于保存和恢复游戏状态。
