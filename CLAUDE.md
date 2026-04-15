# CLAUDE.md — Yoyo's Learning World

## 项目概述
为 Grade 7 女儿 Yoyo 制作的历史学习游戏，对接 BC 省 Social Studies 大纲。
上线地址：https://yoyo-world.vercel.app

## 当前已上线关卡
- `/mesopotamia` — 古美索不达米亚（第一关）
- `/china` — 古中国（第二关）

## 技术架构
- 纯静态 HTML + CSS + JS 单文件，无构建工具
- Vercel serverless 函数代理 Claude API（`api/zara.js`, `api/china.js`）
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
- 游戏机制改动（Zara轮数、倒计时、UI逻辑）必须**同时**更新两个关卡

## Zara 对话机制
- 第5轮：出现"I'm done!"按钮，输入框**保持开启**
- 第20轮：输入框关闭（硬上限）
- `api/zara.js` / `api/china.js`：第5条消息后触发结束语

## 内容卡片倒计时（两关一致）
```javascript
const delays = { text:40, gallery:10, video:120, map:30 };
```
已收集的卡片再次打开不触发倒计时。

## 待实现：v3 升级（见 yoyo_game_spec_v3.md）
优先级：
1. 守门动物（SVG，每区域一个，问引导性问题，不管答什么都让通过）
2. 关卡考试 + AI专属卡片（5道AI生成选择题，≥3/5得卡）
3. 纵横填字小游戏（5/5解锁）
4. 卡片收藏册（主页入口，localStorage）
