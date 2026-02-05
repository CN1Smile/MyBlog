# blog-homepage Delta Specification

## MODIFIED Requirements

### Requirement: 顶部导航栏

页面 SHALL 包含固定在顶部的导航栏，采用毛玻璃效果。

#### Scenario: 导航栏展示
- **WHEN** 页面加载完成
- **THEN** 导航栏固定在视口顶部
- **AND** 左侧显示 Logo（图标 + 文字）
- **AND** 右侧显示导航链接（文章、代码、关于我、友链、撰写）
- **AND** 最右侧显示订阅按钮

#### Scenario: 滚动时导航栏
- **WHEN** 用户滚动页面
- **THEN** 导航栏保持固定位置
- **AND** 背景呈半透明毛玻璃效果

#### Scenario: 撰写入口
- **WHEN** 用户点击导航栏中的"撰写"链接
- **THEN** 跳转到博客编辑器页面（editor.html）
