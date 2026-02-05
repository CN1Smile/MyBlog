# 设计文档: 文章详情页

## Context

博客需要文章详情页来展示完整的文章内容。设计需要与首页的暗色主题保持一致，同时提供舒适的阅读体验。

## Goals / Non-Goals

**Goals:**
- 提供专注、舒适的阅读体验
- 支持 Markdown 渲染的 HTML 内容
- 与首页视觉风格统一
- 支持文章间导航

**Non-Goals:**
- 暂不实现评论功能
- 暂不实现目录（TOC）侧边栏
- 暂不实现分享功能

## Decisions

### Decision 1: URL 路由方案

使用 Query String 方式：`post.html?slug=article-slug`

**理由**: 
- 纯静态部署，无需服务端路由
- 单一 HTML 模板，通过 JS 动态加载内容
- 简单直接，易于实现

**替代方案（未采用）**:
- `post/slug.html` - 需要为每篇文章生成静态文件
- Hash 路由 `#/post/slug` - SEO 不友好

### Decision 2: 文章内容存储

在 `posts.json` 中添加 `content` 字段，存储 HTML 格式的文章内容。

```json
{
  "slug": "article-slug",
  "title": "文章标题",
  "content": "<p>文章正文 HTML...</p>",
  ...
}
```

**理由**: 
- 保持纯静态架构
- 无需 Markdown 解析库
- 未来可迁移到 CMS 或静态生成器

### Decision 3: 阅读体验优化

| 参数 | 值 | 说明 |
|------|-----|------|
| 正文宽度 | max-width: 720px | 最佳阅读行宽 |
| 正文字号 | 18px | 舒适阅读 |
| 行高 | 1.8 | 中文阅读友好 |
| 段落间距 | 1.5em | 清晰分隔 |

### Decision 4: 代码块样式

使用 CSS 实现简单的代码高亮，无需引入 highlight.js。

```css
pre code {
    background: #1e1e22;
    color: #e5e5e5;
    font-family: 'SF Mono', 'Fira Code', monospace;
}
```

## Architecture

```
post.html?slug=xxx
       │
       ▼
┌─────────────────────────────────────────┐
│              post.js                     │
│  1. 解析 URL 获取 slug                   │
│  2. fetch posts.json                     │
│  3. 查找匹配文章                          │
│  4. 渲染文章内容                          │
│  5. 渲染上一篇/下一篇                     │
└─────────────────────────────────────────┘
```

## File Structure

```
├── post.html           # 文章详情页模板
├── css/
│   ├── styles.css      # 共享样式（导航栏）
│   └── post.css        # 文章页专用样式
├── js/
│   └── post.js         # 文章页逻辑
└── data/
    └── posts.json      # 扩展：添加 content 字段
```

## Data Schema

```json
{
  "posts": [
    {
      "slug": "string",        // URL 标识
      "title": "string",       // 标题
      "date": "YYYY-MM-DD",    // 发布日期
      "author": "string",      // 作者
      "summary": "string",     // 摘要（列表页用）
      "category": "string",    // 分类
      "content": "string"      // 完整内容 HTML
    }
  ]
}
```

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| JSON 文件过大 | 首页加载变慢 | 可拆分为独立文章 JSON |
| 无代码高亮 | 代码可读性一般 | 后续可添加 highlight.js |
| SEO 不佳 | 搜索引擎抓取困难 | 后续可考虑 SSG |

## 演进路径：从本地开发到公网部署

当前采用 Query String 方案（`post.html?slug=xxx`）是为了快速开发。后续部署到公网时，可按以下路径演进：

### 阶段 1: 当前方案（本地开发）

```
post.html?slug=getting-started
```
- ✅ 无需构建工具
- ✅ 本地开发简单
- ❌ URL 不够美观
- ❌ SEO 一般

### 阶段 2: 静态站点生成（推荐部署方案）

使用 Vite/11ty/Astro 等工具，构建时生成独立 HTML：

```
/posts/getting-started/index.html
/posts/css-grid-layout/index.html
```

**访问 URL**: `https://yourdomain.com/posts/getting-started`

- ✅ 美观的永久链接
- ✅ SEO 友好
- ✅ 可部署到 GitHub Pages / Vercel / Netlify
- ⚠️ 需要添加构建步骤

### 阶段 3: 服务端渲染（如需动态功能）

如果后续需要评论、用户系统等动态功能，可迁移到：
- Next.js / Nuxt.js
- 传统后端（Node.js / Python）

### 迁移成本评估

| 迁移目标 | 改动量 | 说明 |
|----------|--------|------|
| 静态生成 | 低 | 主要是构建配置，模板复用 |
| SSR 框架 | 中 | 需要重写路由，但样式和内容可复用 |

### 当前代码的兼容性设计

为了降低后续迁移成本，当前实现会：

1. **分离数据和模板** - 文章内容在 JSON，模板在 HTML
2. **使用相对路径** - 便于部署到子目录
3. **模块化 JS** - 方便后续改为 ES Modules
4. **语义化 HTML** - 便于 SSG 工具解析
