# Change: 添加文章详情页

## Why

当前博客首页的"阅读全文"链接指向不存在的页面。用户无法查看文章的完整内容。文章详情页是博客的核心阅读体验，需要提供舒适的阅读环境和良好的排版。

## What Changes

- 新增 `post.html` 文章详情页模板
- 新增 `css/post.css` 文章页专用样式
- 新增 `js/post.js` 文章页逻辑（加载文章内容）
- 更新 `data/posts.json` 添加完整文章内容字段
- 更新首页文章链接指向详情页

## Capabilities

### New Capabilities
- `article-detail`: 文章详情页，展示完整文章内容

### Modified Capabilities
- `blog-homepage`: 更新文章链接格式

## Impact

- `post.html`: 新增文章详情页模板
- `css/post.css`: 新增文章页样式
- `js/post.js`: 新增文章加载逻辑
- `data/posts.json`: 扩展文章数据结构
- `index.html`: 更新链接格式
