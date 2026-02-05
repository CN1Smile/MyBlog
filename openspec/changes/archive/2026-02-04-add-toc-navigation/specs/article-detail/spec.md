## MODIFIED Requirements

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

## ADDED Requirements

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