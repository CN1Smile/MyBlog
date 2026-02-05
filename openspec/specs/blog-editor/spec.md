# blog-editor Specification

## Purpose

博客撰写编辑器提供简洁的 Markdown 编辑环境，支持实时预览，让作者能够专注于写作体验。编辑器与现有的文章数据系统无缝集成，提供草稿保存和 JSON 导出功能。

## Requirements

### Requirement: 编辑器页面布局

编辑器页面 SHALL 采用上下分区布局，顶部为元信息区，下方为左右分栏的编辑预览区。

#### Scenario: 桌面端布局
- **WHEN** 用户在宽度 > 1024px 的设备上访问编辑器
- **THEN** 显示左右分栏布局
- **AND** 左侧为 Markdown 编辑区（约 50%）
- **AND** 右侧为实时预览区（约 50%）

#### Scenario: 移动端布局
- **WHEN** 用户在宽度 < 768px 的设备上访问编辑器
- **THEN** 编辑区和预览区垂直堆叠
- **AND** 可通过标签页切换编辑/预览模式

---

### Requirement: 文章元信息表单

编辑器 SHALL 在顶部提供文章元信息输入表单。

#### Scenario: 元信息表单展示
- **WHEN** 编辑器页面加载完成
- **THEN** 显示文章标题输入框
- **AND** 显示文章摘要输入框
- **AND** 显示 slug（URL 别名）输入框
- **AND** 显示分类选择器
- **AND** 显示标签输入区域

#### Scenario: slug 自动生成
- **WHEN** 用户输入文章标题
- **THEN** 系统自动生成 slug（拼音或英文）
- **AND** 用户可手动修改 slug

---

### Requirement: Markdown 编辑区

编辑器 SHALL 提供功能完善的 Markdown 编辑区域。

#### Scenario: 编辑区展示
- **WHEN** 编辑器加载完成
- **THEN** 显示多行文本编辑区
- **AND** 编辑区使用等宽字体
- **AND** 编辑区有行号显示（可选）

#### Scenario: 工具栏功能
- **WHEN** 编辑区渲染
- **THEN** 显示 Markdown 工具栏
- **AND** 包含加粗、斜体、标题、链接、图片、代码、引用按钮
- **AND** 点击按钮可插入对应 Markdown 语法

#### Scenario: 快捷键支持
- **WHEN** 用户在编辑区使用快捷键
- **THEN** Ctrl+B 可插入加粗语法
- **AND** Ctrl+I 可插入斜体语法
- **AND** Ctrl+K 可插入链接语法

---

### Requirement: 实时预览区

编辑器 SHALL 提供 Markdown 内容的实时渲染预览。

#### Scenario: 预览同步更新
- **WHEN** 用户在编辑区输入内容
- **THEN** 预览区实时渲染 Markdown 为 HTML
- **AND** 渲染延迟不超过 300ms

#### Scenario: 预览样式一致
- **WHEN** 预览区渲染内容
- **THEN** 样式与文章详情页保持一致
- **AND** 代码块有语法高亮
- **AND** 使用暗色主题样式

---

### Requirement: 草稿自动保存

编辑器 SHALL 自动保存编辑内容到本地存储。

#### Scenario: 定时自动保存
- **WHEN** 用户编辑文章内容
- **THEN** 系统每 30 秒自动保存草稿到 localStorage
- **AND** 显示"已保存"状态提示

#### Scenario: 恢复草稿
- **WHEN** 用户重新打开编辑器页面
- **THEN** 系统检测是否有未完成的草稿
- **AND** 提示用户是否恢复草稿内容

#### Scenario: 离开页面警告
- **WHEN** 用户尝试关闭或离开编辑器页面
- **AND** 存在未保存的更改
- **THEN** 显示确认对话框提醒保存

---

### Requirement: 导出功能

编辑器 SHALL 支持将文章导出为 posts.json 兼容格式。

#### Scenario: 导出 JSON 数据
- **WHEN** 用户点击"导出"按钮
- **THEN** 生成符合 posts.json 格式的 JSON 对象
- **AND** 包含 slug、title、date、excerpt、content、category、tags 字段
- **AND** date 字段使用当前日期

#### Scenario: 复制到剪贴板
- **WHEN** 用户点击"复制 JSON"按钮
- **THEN** 将生成的 JSON 复制到系统剪贴板
- **AND** 显示"已复制"成功提示

#### Scenario: 下载 JSON 文件
- **WHEN** 用户点击"下载"按钮
- **THEN** 浏览器下载 JSON 文件
- **AND** 文件名为 `<slug>.json`

---

### Requirement: 视觉设计一致性

编辑器页面 SHALL 遵循博客整体的暗色主题设计规范。

#### Scenario: 配色方案
- **WHEN** 编辑器页面渲染
- **THEN** 使用与首页相同的暗色背景 (#0d0d0f)
- **AND** 编辑区背景为深灰色 (#141416)
- **AND** 文字颜色与整体风格一致

#### Scenario: 导航栏一致
- **WHEN** 编辑器页面加载
- **THEN** 顶部显示与首页相同的导航栏
- **AND** 导航栏包含返回首页的链接

---

### Requirement: 访问权限控制

编辑器页面 SHALL 要求密码验证后才能访问。

#### Scenario: 首次访问验证
- **WHEN** 用户访问编辑器页面
- **AND** 当前会话未验证
- **THEN** 显示密码输入对话框
- **AND** 编辑器内容被遮盖不可见

#### Scenario: 密码验证成功
- **WHEN** 用户输入正确的密码
- **THEN** 关闭密码对话框
- **AND** 显示完整的编辑器界面
- **AND** 将验证状态保存到 sessionStorage

#### Scenario: 密码验证失败
- **WHEN** 用户输入错误的密码
- **THEN** 显示"密码错误"提示
- **AND** 允许重新输入
- **AND** 编辑器内容保持不可见

#### Scenario: 会话内免登录
- **WHEN** 用户已在当前会话中验证成功
- **AND** 再次访问编辑器页面
- **THEN** 直接显示编辑器界面
- **AND** 无需重新输入密码

#### Scenario: 关闭浏览器后重新验证
- **WHEN** 用户关闭浏览器后重新打开
- **AND** 访问编辑器页面
- **THEN** 需要重新输入密码验证
