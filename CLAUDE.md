# CLAUDE.md — Yoyo's Learning World

## 项目概述
为 Grade 7 女儿 Yoyo 制作的历史学习游戏，对接 BC 省 Social Studies 大纲。
上线地址：https://yoyo-world.vercel.app

## 当前已上线关卡
- `/mesopotamia` — 古美索不达米亚（第一关）
- `/china` — 古中国（第二关）
- `/cards` — 卡片收藏册（所有关卡的探险家证书）

## 技术架构
- 纯静态 HTML + CSS + JS 单文件，无构建工具
- Vercel serverless 函数代理 Claude API
  - `api/zara.js` — Mesopotamia AI 导师对话
  - `api/china.js` — China AI 导师对话
  - `api/quiz.js` — 关卡测验（支持 `level` 参数：`mesopotamia` / `china`）
  - `api/card.js` — AI 生成探险家证书（支持 `level` 参数）
- API Key：Vercel 环境变量 `CLAUDE_API_KEY`，前端不暴露
- 模型：`claude-sonnet-4-6`

## 关键规则

### 图片
- 只用 Wikimedia Commons **直链**（不用 `/thumb/` 路径）
- 新图片的 URL 必须通过 WebFetch Commons 页面验证，不能猜 MD5 hash

### 视频
- 只用 **TED-Ed** 视频（ed.ted.com），适合16岁以下
- Video ID 通过 WebFetch TED-Ed 课程页面获取，不能猜

### 同步修改
- 游戏机制改动（守门动物、测验、倒计时、UI逻辑）必须**同时**更新两个关卡

## Zara / AI 导师对话机制
- 第5轮：出现"I'm done!"按钮，输入框**保持开启**
- 第20轮：输入框关闭（硬上限）
- `api/zara.js` / `api/china.js`：第5条消息后触发结束语

## 内容卡片倒计时（两关一致）
```javascript
const delays = { text:10, gallery:10, video:10, map:10 };
```
已收集的卡片再次打开不触发倒计时。

## v3 功能（已全部实现）

### 1. 守门动物
- 每个大区域入口有一只 SVG 动物，问引导性问题，任何回答都让通过
- sessionStorage 记录已通过的门（`yoyo_gates_cleared` / `yoyo_gates_cleared_china`）
- Mesopotamia：Fish🐟 / Camel🐪 / Bull🐂 / Cat🐈
- China：Dragon🐉 / Panda🐼 / Ox🐂 / Turtle🐢

### 2. 关卡测验 + AI 探险家证书
- 路径：`/mesopotamia/quiz` → `mesopotamia/quiz.html`；`/china/quiz` → `china/quiz.html`
- 5 道 AI 生成选择题（`/api/quiz`，带 `level` 参数）
- ≥3/5：调用 `/api/card` 生成证书，存入 `localStorage['yoyo_cards']`
- 证书字段：`{ level, levelDisplay, title, description, key_facts[], fun_fact, score, total, date }`
- 5/5：解锁对应纵横填字（`localStorage['yoyo_crossword_meso']` / `['yoyo_crossword_china']`）
- 测验题目缓存：`sessionStorage['mesoquiz_cache']` / `['chinaquiz_cache']`

### 3. 纵横填字小游戏
- Mesopotamia：`/crossword/mesopotamia` → 11×13 格，7 个单词
- China：`/crossword/china` → 12×9 格，7 个单词（ORACLE、DYNASTY、LOESS、CONFUCIUS、YANGTZE、EMPEROR、MILLET）
- 5/5 满分才解锁，完成显示彩色纸屑庆祝

### 4. 卡片收藏册
- `/cards` → `cards.html`，读取 `localStorage['yoyo_cards']`
- 每关只保留最近一张，点击显示完整证书弹窗
- 主页（`index.html`）动态显示卡片数量角标

## 证书卡片样式（quiz.html / cards.html 保持一致）
```css
.cert-outer  /* 动态彩虹渐变边框 wrapper，animation:borderAnim */
.cert-card   /* 深紫色渐变背景，dark purple gradient */
.cert-dots   /* 点状纹理覆盖层 */
.cert-title  /* 金色渐变文字，-webkit-background-clip:text */
```

## 文件结构
```
yoyo-world/
├── index.html              # 主页（世界地图 + 卡片入口）
├── cards.html              # 卡片收藏册
├── vercel.json             # 路由配置
├── mesopotamia/
│   ├── index.html          # 第一关游戏
│   └── quiz.html           # 第一关测验
├── china/
│   ├── index.html          # 第二关游戏
│   └── quiz.html           # 第二关测验
├── crossword/
│   ├── mesopotamia.html    # 第一关填字
│   └── china.html          # 第二关填字
└── api/
    ├── zara.js             # Mesopotamia AI 导师
    ├── china.js            # China AI 导师
    ├── quiz.js             # 测验题生成（level 参数）
    └── card.js             # 证书生成（level 参数）
```
