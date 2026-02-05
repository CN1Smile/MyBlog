## ADDED Requirements

### Requirement: 评论系统

文章详情页 SHALL 在文章末尾提供基于 GitHub 的评论功能。

#### Scenario: 评论区展示

- **WHEN** 文章内容加载完成
- **THEN** 在文章正文下方显示评论区
- **AND** 评论区有明确的标题分隔

#### Scenario: 评论加载

- **WHEN** 评论区渲染
- **THEN** 自动加载 Utterances 评论组件
- **AND** 显示与当前文章关联的评论

#### Scenario: 发表评论

- **WHEN** 用户已登录 GitHub
- **THEN** 可以在评论框中输入 Markdown 格式内容
- **AND** 点击提交后评论发布成功

#### Scenario: 未登录状态

- **WHEN** 用户未登录 GitHub
- **THEN** 显示登录提示
- **AND** 点击后跳转 GitHub 授权

#### Scenario: 主题适配

- **WHEN** 页面使用暗色主题
- **THEN** 评论组件自动使用暗色主题样式
