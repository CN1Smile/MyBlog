## ADDED Requirements

### Requirement: 文章详情页布局

文章详情页 SHALL 提供专注的阅读体验，采用居中单栏布局。

#### Scenario: 桌面端布局
- **WHEN** 用户在桌面设备访问文章详情页
- **THEN** 文章内容居中显示，最大宽度约 720px
- **AND** 两侧留有充足边距
- **AND** 顶部显示导航栏（与首页一致）

#### Scenario: 移动端布局
- **WHEN** 用户在移动设备访问文章详情页
- **THEN** 文章内容全宽显示
- **AND** 左右有适当内边距

---

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
