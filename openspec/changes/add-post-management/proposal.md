# Change: 文章管理功能

## Why
目前博客只能发布新文章，无法对已发布的文章进行编辑、删除或管理。需要一个专门的管理页面来统一管理所有文章。

## What Changes
- 创建 `posts.html` 文章列表管理页面
- 支持单篇文章的编辑、删除、移动（调整顺序）操作
- 支持批量选择和批量删除功能
- 管理页面需要密码验证（复用编辑器的密码保护机制）
- 在首页导航添加「文章」入口

## Impact
- Affected specs: `blog-editor`, 新增 `post-management`
- Affected code: 
  - 新建 `posts.html`, `css/posts.css`, `js/posts.js`
  - 修改 `js/github-storage.js` 添加删除/更新文章 API
  - 修改 `index.html` 导航栏添加入口
  - 修改 `editor.html` 支持加载已有文章进行编辑
