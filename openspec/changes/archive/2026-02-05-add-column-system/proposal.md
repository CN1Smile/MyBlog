# Change: 添加文章专栏/分类系统

## Why
用户希望能将文章按主题分组到不同专栏中，方便读者按领域浏览内容。目前文章只有简单的分类标签，缺乏专栏管理和专栏页面展示功能。

## What Changes
- 在编辑器添加「专栏」选择/输入框，支持选择已有专栏或输入新专栏名自动创建
- 创建专栏数据存储 `data/columns.json`
- 创建专栏列表页面 `columns.html`，展示所有专栏及其文章数量
- 在首页侧边栏显示专栏列表，点击可筛选文章
- 文章详情页显示所属专栏，点击可跳转到该专栏

## Impact
- Affected specs: 新增 column-system 能力
- Affected code: 
  - `js/editor.js` - 添加专栏选择功能
  - `js/github-storage.js` - 添加专栏存储 API
  - `js/app.js` - 首页专栏筛选
  - `columns.html` - 新页面
  - `js/columns.js` - 专栏页面逻辑
  - `index.html` - 侧边栏专栏列表
  - `post.html` - 显示所属专栏
