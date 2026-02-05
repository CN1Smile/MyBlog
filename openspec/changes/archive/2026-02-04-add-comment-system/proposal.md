# Change: 添加 Utterances 评论系统

## Why

博客文章缺乏互动功能，读者无法留言反馈或讨论文章内容。通过集成评论系统，可以增强读者参与度和社区互动。

## What Changes

- 在文章详情页底部添加 Utterances 评论组件
- 评论数据存储在 GitHub Issues（CN1Smile/Blog-comments）
- 支持 Markdown 格式评论
- 自动适配暗色主题

## Impact

- 受影响文件：`post.html`, `css/post.css`
- 新增依赖：Utterances script（外部加载）
- 需要 GitHub 账号才能评论
