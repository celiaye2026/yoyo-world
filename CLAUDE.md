# CLAUDE.md — Yoyo's Learning World

## 项目概述
为 Grade 7 女儿 Yoyo 制作的历史学习游戏，对接 BC 省 Social Studies 大纲。
上线地址：https://yoyo-world.vercel.app

## 当前已上线关卡
- `/mesopotamia` — 古美索不达米亚（**v4 故事叙述版**，Nisaba 角色）
- `/china` — 古中国（v3 谜题探索版，Zara 导师）
- `/cards` — 卡片收藏册（所有关卡的探险家证书）

## 技术架构
- 纯静态 HTML + CSS + JS 单文件，无构建工具
- Vercel serverless 函数代理 Claude API
  - `api/nisaba.js` — Mesopotamia v4 AI 角色对话（Nisaba）
  - `api/zara.js` — China AI 导师对话（Zara，v3）
  - `api/china.js` — China AI 导师对话
  - `api/quiz.js` — 关卡测验（支持 `level` 参数：`mesopotamia` / `china`）
  - `api/card.js` — AI 生成探险家证书（支持 `level` 参数）
- API Key：Vercel 环境变量 `CLAUDE_API_KEY`，前端不暴露
- 本地测试：需要 `yoyo-world/.env.local` 内写入 `CLAUDE_API_KEY=sk-ant-xxx`，然后运行 `vercel dev`
- 模型：`claude-sonnet-4-6`

## 关键规则

### 图片
- 只用 Wikimedia Commons **直链**（不用 `/thumb/` 路径）
- 新图片的 URL 必须通过 WebFetch Commons 页面验证，不能猜 MD5 hash

### 视频
- 只用 **TED-Ed** 视频（ed.ted.com），适合16岁以下
- Video ID 通过 WebFetch TED-Ed 课程页面获取，不能猜

### Claude API 消息格式
- messages 数组必须严格 user/assistant 交替，不能连续两条同一 role
- 进入新展区时先插入一条 user 桥接消息再推 assistant opener，防止 400 错误

### 同步修改
- 游戏机制改动如同时影响两关，必须**同时**更新（目前两关架构不同，谨慎操作）

---

## Mesopotamia v4（当前版本）

### 核心理念：故事叙述（Story Narrative）
- 12岁苏美尔女孩 **Nisaba** 穿越到现代，出现在 Yoyo 的卧室
- Yoyo 带她去温哥华博物馆寻找回家的方法
- 5个展区 → 收集5块记忆碎片 → 石门开启 → Nisaba 回家
- **无计时器、无强制观看、无失败状态**

### 游戏流程
```
卧室开场 → 过渡动画 → 博物馆（5展区）→ 卧室结尾 → 徽章
```

### 五个展区
| 展区 | 场景 X 范围 | 内容卡片 | API area key |
|------|-----------|---------|-------------|
| Tigris & Euphrates River Basin | 100–960 | 🗺️ Leaflet 地图 | `area_1` |
| Mud-Brick Construction | 1020–1920 | 🖼️ 图库 | `area_2` |
| Food of the Two Rivers | 2020–2960 | 🎬 TED-Ed 视频 `XBk9KywTIgk`（Rise and fall of history's first empire） | `area_3` |
| Cuneiform: The First Writing | 3020–3960 | ✍️ 楔形文字翻译器 | `area_4` |
| The Seal Door | 4100–4750 | 无（脚本化告别） | `area_5` |

### Nisaba AI 对话机制
- API 端点：`POST /api/nisaba`，body: `{ messages, area }`
- 对话由 Yoyo 自由输入驱动（文字 + 发送）
- 第4轮对话后出现"Got it → Next exhibit"按钮 + 颁发记忆碎片
- Area 3 第1轮回复后触发3秒情感停顿（Yoyo 可打字安慰 Nisaba）
- Area 5 全程脚本化，5阶段对话 + 碎片放置 UI + 石门发光

### 记忆碎片系统
- 5块碎片，右上角5个圆点指示（`#shard-bar`）
- 每完成一个展区对话（第4轮）自动颁发
- 存储：`localStorage['meso_shards']`（数字）/ `localStorage['meso_areas']`（已完成展区对象）

### 卧室结尾 + 徽章
- Nisaba 离去 → 金色闪光 → 夜晚卧室 → 桌上的泥板印章发光
- 点击印章 → 徽章弹窗（正面：引言+称号+日期；背面：5道关键词填空题）
- 答对5/5解锁填字游戏：`localStorage['yoyo_crossword_meso'] = '1'`

### Nisaba SVG 姿势
4种姿势：`stand` / `reach` / `wave` / `quiet`（长发+刘海，苏美尔风格连衣裙）

---

## China v3（现有版本，未改动）

### Zara / AI 导师对话机制
- 第5轮：出现"I'm done!"按钮，输入框**保持开启**
- 第20轮：输入框关闭（硬上限）
- `api/zara.js` / `api/china.js`：第5条消息后触发结束语

### v3 功能
1. **守门动物**：Dragon🐉 / Panda🐼 / Ox🐂 / Turtle🐢，sessionStorage `yoyo_gates_cleared_china`
2. **关卡测验**：`/china/quiz`，5道AI生成选择题，≥3/5颁发证书
3. **纵横填字**：`/crossword/china`，7个单词，5/5满分解锁
4. **卡片收藏册**：`/cards`，读取 `localStorage['yoyo_cards']`

---

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
│   ├── index.html          # 第一关游戏（v4 Nisaba 故事版）
│   └── quiz.html           # 第一关测验（仍可用）
├── china/
│   ├── index.html          # 第二关游戏（v3）
│   └── quiz.html           # 第二关测验
├── crossword/
│   ├── mesopotamia.html    # 第一关填字
│   └── china.html          # 第二关填字
└── api/
    ├── nisaba.js           # Mesopotamia v4 AI 角色（Nisaba）
    ├── zara.js             # Mesopotamia v3 AI 导师（已弃用）
    ├── china.js            # China AI 导师
    ├── quiz.js             # 测验题生成（level 参数）
    └── card.js             # 证书生成（level 参数）
```
