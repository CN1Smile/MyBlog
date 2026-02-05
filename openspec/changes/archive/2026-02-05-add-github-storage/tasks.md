# Tasks

## 1. GitHub Pages 部署准备

- [x] 1.1 创建 GitHub 仓库（用户手动操作）
- [x] 1.2 初始化 Git 并推送代码到 GitHub
- [ ] 1.3 在 GitHub 仓库设置中启用 GitHub Pages（需用户手动设置）
- [ ] 1.4 创建 GitHub Personal Access Token（用户手动操作）

## 2. GitHub 配置 UI

- [x] 2.1 在 `editor.html` 添加 GitHub 设置按钮和发布按钮
- [x] 2.2 在 `editor.html` 添加 GitHub 配置弹窗 HTML
- [x] 2.3 在 `css/editor.css` 添加配置弹窗样式

## 3. GitHub API 集成

- [x] 3.1 创建 `js/github-storage.js` 模块
- [x] 3.2 实现配置管理功能（保存/加载 localStorage）
- [x] 3.3 实现 GitHub API 调用封装（读取/更新文件）
- [x] 3.4 实现发布文章功能

## 4. 编辑器集成

- [x] 4.1 在 `editor.html` 引入 `github-storage.js`
- [x] 4.2 在 `js/editor.js` 添加 GitHub 按钮事件绑定
- [x] 4.3 实现配置弹窗的打开/关闭逻辑
- [x] 4.4 实现连接测试功能
- [x] 4.5 实现发布按钮点击处理

## 5. 测试验证

- [ ] 5.1 测试配置保存和加载
- [ ] 5.2 测试连接验证功能
- [ ] 5.3 测试发布文章功能
- [ ] 5.4 验证 GitHub Pages 自动更新