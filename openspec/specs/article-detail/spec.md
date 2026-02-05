# article-detail Specification

## Purpose
TBD - created by archiving change add-article-detail. Update Purpose after archive.
## Requirements
### Requirement: 文章详情页布局

文章详情页 SHALL 提供舒适的 PC 端阅读体验，内容区域宽度根据屏幕尺寸自适应，最大可达 1280px。

#### Scenario: 大屏显示器阅读

- **WHEN** 用户在 1600px 以上宽度的屏幕查看文章
- **THEN** 内容区域最大宽度为 1280px
- **AND** 内容居中显示

#### Scenario: 标准 PC 屏幕阅读

- **WHEN** 用户在 1200px-1600px 宽度的屏幕查看文章
- **THEN** 内容区域最大宽度为 1080px

#### Scenario: 移动端布局

- **WHEN** 用户在移动设备访问文章详情页
- **THEN** 文章内容全宽显示
- **AND** 左右有适当内边距

### Requirement: 文章头部信息

文章详情页 SHALL 在正文前展示文章的元信息。

#### Scenario: 文章头部展示
- **WHEN** 文章加载完成
- **THEN** 显示文章标题（大号字体）
- **AND** 显示发布日期
- **AND** 显示作者名称
- **AND** 显示预计阅读时间
- **AND** 显示文章分类标签

---

### Requirement: 文章正文排版

文章详情页 SHALL 提供优雅的正文排版样式。

#### Scenario: 正文文字样式
- **WHEN** 文章正文渲染
- **THEN** 正文字体大小适中（约 18px）
- **AND** 行高舒适（约 1.8）
- **AND** 段落间距合理
- **AND** 文字颜色与背景对比度适宜

#### Scenario: 标题层级样式
- **WHEN** 文章包含多级标题
- **THEN** h2、h3、h4 有明确的视觉层级
- **AND** 标题上方有额外间距

#### Scenario: 代码块样式
- **WHEN** 文章包含代码块
- **THEN** 代码使用等宽字体
- **AND** 代码块有深色背景
- **AND** 代码有适当内边距

#### Scenario: 引用块样式
- **WHEN** 文章包含引用内容
- **THEN** 引用块有左侧边框标识
- **AND** 引用文字颜色略淡

---

### Requirement: 文章导航功能

文章详情页 SHALL 提供便捷的导航功能。

#### Scenario: 返回首页
- **WHEN** 用户想返回文章列表
- **THEN** 可通过顶部导航栏返回
- **AND** 可通过文章末尾的"返回"按钮返回

#### Scenario: 上一篇/下一篇导航
- **WHEN** 文章加载完成
- **THEN** 文章底部显示上一篇/下一篇文章链接
- **AND** 显示相邻文章的标题

---

### Requirement: 文章加载机制

文章详情页 SHALL 通过 URL 参数加载对应文章。

#### Scenario: 通过 slug 加载文章
- **WHEN** 用户访问 `post.html?slug=xxx`
- **THEN** 系统从 posts.json 中查找对应文章
- **AND** 渲染文章完整内容

#### Scenario: 文章不存在
- **WHEN** URL 中的 slug 不存在
- **THEN** 显示"文章未找到"提示
- **AND** 提供返回首页的链接

#### Scenario: 加载状态
- **WHEN** 文章正在加载
- **THEN** 显示加载动画

### Requirement: 目录导航

系统 SHALL 在文章详情页左侧提供可收起的目录导航栏，自动从文章标题生成。

#### Scenario: 目录自动生成

- **WHEN** 文章内容包含 h2/h3/h4 标题
- **THEN** 系统自动生成目录导航
- **AND** 目录项按层级缩进显示

#### Scenario: 点击目录跳转

- **WHEN** 用户点击目录中的某一项
- **THEN** 页面平滑滚动到对应章节

#### Scenario: 滚动高亮

- **WHEN** 用户滚动页面
- **THEN** 当前可见章节在目录中高亮显示

#### Scenario: 目录收起展开

- **WHEN** 用户点击目录收起按钮
- **THEN** 目录栏收起到左侧
- **AND** 显示展开按钮

#### Scenario: 小屏幕隐藏

- **WHEN** 屏幕宽度小于 1200px
- **THEN** 目录导航栏自动隐藏

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

