# Change: 添加博客撰写编辑器

## Why

当前博客系统仅支持通过直接编辑 `posts.json` 来添加文章，缺乏友好的内容创作界面。需要一个简洁的 Markdown 编辑器，支持实时预览，让作者能够专注于写作体验，同时与现有的文章数据系统无缝集成。

## What Changes

- 新增博客撰写页面（`editor.html`），提供专用的文章编辑环境
- 实现左右分栏布局：左侧为 Markdown 编辑区，右侧为实时渲染预览区
- 支持填写文章元信息（标题、摘要、分类、标签等）
- 集成 Markdown 工具栏，快速插入常用格式
- 实现草稿自动保存功能（localStorage）
- 提供导出功能，生成符合 `posts.json` 格式的 JSON 数据
- 首页导航栏新增"撰写"入口

## Capabilities

### New Capabilities
- `blog-editor`: 博客文章撰写编辑器，包含 Markdown 编辑、实时预览、元信息填写、草稿保存和导出功能

### Modified Capabilities
- `blog-homepage`: 导航栏新增"撰写"按钮入口

## Impact

- 新增文件：`editor.html`, `js/editor.js`, `css/editor.css`
- 修改文件：`index.html`（导航栏）
- 依赖：可能需要 Markdown 解析库（如 marked.js）
- 用户流程：首页 → 点击撰写 → 进入编辑器 → 编写文章 → 导出/复制 JSON → 手动添加到 posts.json
