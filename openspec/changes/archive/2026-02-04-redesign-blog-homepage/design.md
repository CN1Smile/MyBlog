# 设计文档: 博客首页重新设计

## Context

用户提供了一张专业级别的博客首页设计图，要求按照该设计重构现有的简易博客首页。设计采用现代暗色主题，双栏布局，包含丰富的视觉层次和交互细节。

## Goals / Non-Goals

**Goals:**
- 完全复刻设计图的布局结构和视觉风格
- 实现响应式设计，适配桌面、平板、手机
- 保持代码简洁，使用纯 CSS（无框架）
- 支持文章动态加载

**Non-Goals:**
- 暂不实现实际的文章筛选功能（仅 UI 交互）
- 暂不实现订阅功能
- 暂不实现文章详情页

## Decisions

### Decision 1: 布局方案

采用 CSS Grid 实现主容器双栏布局。

```css
.main-container {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 2rem;
}
```

**理由**: Grid 布局简洁且响应式处理方便，通过媒体查询可轻松切换为单栏。

### Decision 2: 导航栏效果

使用 `backdrop-filter: blur()` 实现毛玻璃效果。

```css
.top-nav {
    background: rgba(13, 13, 15, 0.85);
    backdrop-filter: blur(20px);
}
```

**理由**: 现代浏览器均已支持，提供高级视觉效果。

### Decision 3: 渐变文字

使用 `background-clip: text` 实现标题渐变效果。

```css
.gradient-text {
    background: linear-gradient(90deg, #ff6b35, #ff3366, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
```

**理由**: 标准 CSS 技术，无需额外库。

### Decision 4: 动态色彩卡片

使用 CSS `hue-rotate` 动画创建色彩流动效果。

```css
.gradient-card {
    background: linear-gradient(...);
    animation: gradientShift 8s ease-in-out infinite;
}

@keyframes gradientShift {
    0%, 100% { filter: hue-rotate(0deg); }
    50% { filter: hue-rotate(20deg); }
}
```

**理由**: 纯 CSS 实现，性能优秀，无需 JavaScript。

### Decision 5: 响应式断点

| 断点 | 行为 |
|------|------|
| > 1200px | 完整双栏布局 |
| 1024-1200px | 收窄侧边栏 |
| 768-1024px | 单栏，侧边栏两列网格 |
| < 768px | 全单栏堆叠 |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    .top-nav (fixed)                         │
│  [Logo]                        [Links]  [Subscribe Button]  │
├─────────────────────────────────────────────────────────────┤
│                    .main-container (grid)                   │
│  ┌─────────────────────────┐  ┌───────────────────────────┐ │
│  │     .left-section       │  │    .right-sidebar         │ │
│  │                         │  │                           │ │
│  │  ┌───────────────────┐  │  │  ┌─────────────────────┐  │ │
│  │  │   .hero-section   │  │  │  │  .note-card         │  │ │
│  │  │   (grid 2-col)    │  │  │  └─────────────────────┘  │ │
│  │  └───────────────────┘  │  │                           │ │
│  │                         │  │  ┌─────────────────────┐  │ │
│  │  ┌───────────────────┐  │  │  │  .filter-card       │  │ │
│  │  │  .posts-section   │  │  │  │  - filter tags      │  │ │
│  │  │  (flex column)    │  │  │  │  - series list      │  │ │
│  │  └───────────────────┘  │  │  │  - about section    │  │ │
│  │                         │  │  └─────────────────────┘  │ │
│  └─────────────────────────┘  └───────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
├── index.html          # 页面结构
├── css/
│   └── styles.css      # 完整样式（含响应式）
├── js/
│   └── app.js          # 文章加载、筛选交互
└── data/
    └── posts.json      # 文章数据
```

## Color Palette

| 用途 | 颜色值 | 说明 |
|------|--------|------|
| 背景 | #0d0d0f | 主背景 |
| 卡片背景 | #141416 | 次级容器 |
| 边框 | #2a2a2e | 分割线 |
| 主文字 | #f5f5f7 | 标题、正文 |
| 次文字 | #a1a1a6 | 描述、元信息 |
| 弱文字 | #6e6e73 | 标签、提示 |
| 强调色 | #ff6b35 | 链接、高亮 |
| 紫色 | #a855f7 | 标签 |
| 蓝色 | #3b82f6 | 标签 |

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| backdrop-filter 兼容性 | 旧浏览器无模糊效果 | 降级为纯背景色 |
| 渐变文字兼容性 | 极少数浏览器不支持 | 添加 fallback 颜色 |
| 侧边栏内容静态 | 无法动态更新 | 后续迭代添加 API |

## Open Questions

- [ ] 是否需要添加亮色主题切换？
- [ ] 文章筛选功能是否需要真实过滤逻辑？
- [ ] 是否需要添加文章搜索功能？
