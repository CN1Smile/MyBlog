# Tasks

## 1. GitHub Storage API 扩展

- [x] 1.1 在 `github-storage.js` 添加 `deletePost(slug)` 删除文章方法
- [x] 1.2 在 `github-storage.js` 添加 `updatePost(slug, post)` 更新文章方法
- [x] 1.3 在 `github-storage.js` 添加 `reorderPosts(posts)` 调整顺序方法
- [x] 1.4 在 `github-storage.js` 添加 `batchDeletePosts(slugs)` 批量删除方法

## 2. 文章管理页面 UI

- [x] 2.1 创建 `posts.html` 页面结构
- [x] 2.2 添加密码验证遮罩（复用编辑器样式）
- [x] 2.3 创建文章列表表格/卡片布局
- [x] 2.4 每篇文章添加操作按钮：编辑、删除、上移、下移
- [x] 2.5 添加批量选择复选框和批量删除按钮
- [x] 2.6 创建 `css/posts.css` 样式文件

## 3. 文章管理页面逻辑

- [x] 3.1 创建 `js/posts.js` 逻辑文件
- [x] 3.2 实现密码验证功能
- [x] 3.3 实现加载并渲染文章列表
- [x] 3.4 实现单篇删除功能（带确认弹窗）
- [x] 3.5 实现编辑跳转功能（跳转到 editor.html?slug=xxx）
- [x] 3.6 实现上移/下移调整顺序功能
- [x] 3.7 实现批量选择和批量删除功能

## 4. 编辑器支持加载文章

- [x] 4.1 修改 `editor.html` 支持 URL 参数 `?slug=xxx`
- [x] 4.2 修改 `editor.js` 检测 slug 参数并加载文章数据
- [x] 4.3 加载时填充表单字段
- [x] 4.4 发布时判断是新建还是更新

## 5. 导航入口

- [x] 5.1 在 `index.html` 导航栏添加「文章」链接
- [x] 5.2 在 `editor.html` 导航栏添加「文章」链接

## 6. 测试验证

- [x] 6.1 测试单篇删除功能
- [x] 6.2 测试编辑现有文章功能
- [x] 6.3 测试调整顺序功能
- [x] 6.4 测试批量删除功能