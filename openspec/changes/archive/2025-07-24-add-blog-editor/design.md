# Design: 博客撰写编辑器

## Context

当前博客系统是纯静态站点，文章数据存储在 `data/posts.json` 中。用户需要手动编辑 JSON 文件来添加文章，这对非技术用户不友好。需要一个可视化的编辑界面来简化内容创作流程。

**现有技术栈：**
- 纯原生 HTML/CSS/JavaScript
- 暗色主题设计系统
- posts.json 作为数据源

## Goals / Non-Goals

**Goals:**
- 提供简洁直观的 Markdown 编辑体验
- 实时预览编辑内容
- 与现有暗色主题视觉风格一致
- 草稿自动保存，防止意外丢失
- 导出符合 posts.json 格式的数据

**Non-Goals:**
- 不实现后端服务（保持纯静态）
- 不实现图片上传功能（用户使用外部图床）
- 不实现多用户/权限管理
- 不自动写入 posts.json（需手动复制）

## Decisions

### Decision 1: Markdown 解析库选择
**选择**: 使用 `marked.js`
- 轻量级（~40KB gzipped）
- 零依赖
- 支持 GFM（GitHub Flavored Markdown）
- 活跃维护，广泛使用

**替代方案考虑:**
- `showdown.js`: 功能类似但体积略大
- `markdown-it`: 功能强大但对本项目过于复杂

### Decision 2: 编辑器布局
**选择**: 左右分栏布局（编辑器 | 预览）
- 左侧：Markdown 编辑区 + 工具栏
- 右侧：实时渲染预览区
- 顶部：元信息表单（标题、摘要、分类等）

**理由**: 所见即所得的体验，符合开发者习惯

### Decision 3: 数据存储策略
**选择**: localStorage 自动保存 + JSON 导出
- 每 30 秒自动保存草稿到 localStorage
- 提供"导出 JSON"按钮生成 posts.json 格式数据
- 提供"复制到剪贴板"功能

**理由**: 保持纯静态特性，无需后端

### Decision 4: 代码高亮
**选择**: 使用 `highlight.js` (可选)
- 在预览区对代码块进行语法高亮
- 与文章详情页使用相同的高亮方案保持一致

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| localStorage 容量限制（~5MB） | 单篇文章足够；提示用户导出后清理草稿 |
| 手动复制 JSON 流程繁琐 | 提供一键复制功能，格式化输出便于粘贴 |
| 用户刷新页面丢失编辑内容 | 自动保存 + 页面关闭前确认提示 |
| Markdown 渲染与文章详情页不一致 | 使用相同的 marked 配置和 CSS 样式 |

## Open Questions

1. 是否需要支持本地图片预览（Base64 编码）？
2. 是否需要快捷键支持（Ctrl+B 加粗等）？
3. 编辑器工具栏需要包含哪些常用格式按钮？
