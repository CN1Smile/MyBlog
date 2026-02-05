## Why

当前博客的文章数据存储在本地 `data/posts.json` 文件中，部署到静态托管平台后，编辑器无法将新文章保存到服务器。用户需要：
1. 将博客部署到 GitHub Pages 实现免费托管
2. 在线编辑文章并自动同步到 GitHub 仓库，使网站能自动更新

## What Changes

- 新增 GitHub Pages 部署配置
- 新增 GitHub Personal Access Token 配置功能
- 新增 GitHub API 集成，可直接读取和写入仓库中的 `posts.json`
- 修改编辑器的保存逻辑，从本地存储改为 GitHub API 提交
- 新增发布文章功能，将文章保存到 GitHub 并触发网站自动部署

## Capabilities

### New Capabilities
- `github-storage`: GitHub 仓库存储集成 - OAuth 登录、API 调用、文章的读取和写入

### Modified Capabilities
- `blog-editor`: 编辑器需要新增 GitHub 发布按钮和登录状态管理

## Impact

- **受影响文件**: 
  - `js/editor.js` - 添加 GitHub API 调用逻辑
  - `editor.html` - 添加 GitHub 登录按钮和发布按钮
  - `js/main.js` - 修改文章加载逻辑（可选，用于从 GitHub 读取）
- **新增依赖**: 无（使用原生 fetch API）
- **安全考虑**: 
  - GitHub Token 将存储在 `localStorage` 中
  - 用户需要创建 GitHub Personal Access Token 或使用 OAuth App
