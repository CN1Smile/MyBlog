# HENGHENG STUDIO Blog - 项目文档

## 项目概述

个人博客网站，采用现代暗色主题设计，展示文章、笔记和技术内容。

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端 | 纯 HTML5 + CSS3 + Vanilla JavaScript |
| 样式 | CSS Variables + CSS Grid/Flexbox |
| 数据 | 静态 JSON 文件 |
| 构建 | 无构建工具（原生开发） |
| 部署 | 静态文件托管 |

## 项目结构

```
├── index.html          # 博客首页
├── css/
│   └── styles.css      # 全局样式
├── js/
│   └── app.js          # 主应用逻辑
├── data/
│   └── posts.json      # 文章数据
└── openspec/           # 规格与变更文档
    ├── project.md      # 本文件
    ├── specs/          # 功能规格
    └── changes/        # 变更记录
```

## 设计规范

### 配色方案（暗色主题）

| 用途 | 颜色 |
|------|------|
| 主背景 | `#0d0d0f` |
| 卡片背景 | `#141416` |
| 边框 | `#2a2a2e` |
| 主文字 | `#f5f5f7` |
| 次文字 | `#a1a1a6` |
| 强调色 | `#ff6b35` |

### 渐变

- **Hero 渐变**: `#ff6b35 → #ff3366 → #8b5cf6`
- **彩虹卡片**: `#ff6b35 → #ec4899 → #8b5cf6 → #06b6d4`

## 功能模块

详见 `openspec/specs/` 目录：

- **blog-homepage**: 博客首页（Hero、文章列表、侧边栏）

## 开发约定

### 命名规范

- CSS 类名：`kebab-case`（如 `.post-item-title`）
- JavaScript：`camelCase`（如 `loadPosts()`）
- 文件名：小写 + 连字符（如 `styles.css`）

### 响应式断点

| 断点 | 说明 |
|------|------|
| > 1200px | 完整桌面布局 |
| 1024-1200px | 收窄侧边栏 |
| 768-1024px | 平板（单栏 + 双列侧边栏） |
| < 768px | 移动端（全单栏） |

## 本地开发

```bash
# 启动本地服务器（避免 CORS 问题）
npx serve . -p 8080

# 访问
http://localhost:8080
```

## 变更历史

所有已完成的变更记录在 `openspec/changes/archive/` 目录下，包含：
- 变更提案（proposal.md）
- 技术设计（design.md）
- 任务清单（tasks.md）
- 规格增量（specs/）
