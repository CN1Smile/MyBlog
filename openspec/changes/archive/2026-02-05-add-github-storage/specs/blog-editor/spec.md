# Blog Editor - GitHub 集成修改

对现有博客编辑器的修改，增加 GitHub 发布功能。

## MODIFIED Requirements

### Requirement: 编辑器工具栏

编辑器顶部工具栏 SHALL 包含以下额外按钮：
- GitHub 设置按钮（⚙️ 图标）
- 发布到 GitHub 按钮（🚀 图标）

#### Scenario: 显示 GitHub 操作按钮

- **WHEN** 用户进入编辑器页面并通过密码验证
- **THEN** 工具栏显示 GitHub 设置和发布按钮
- **AND** 按钮位于导出按钮区域

#### Scenario: GitHub 未配置时的按钮状态

- **WHEN** GitHub 未配置
- **THEN** 发布按钮可点击但点击后提示配置

### Requirement: 编辑器导出功能

编辑器 SHALL 支持以下导出方式：
- 复制 JSON 到剪贴板
- 下载 JSON 文件
- **发布到 GitHub**（新增）

#### Scenario: 发布到 GitHub

- **WHEN** 用户点击发布到 GitHub 按钮
- **AND** 配置有效
- **THEN** 将文章发布到配置的 GitHub 仓库
- **AND** 显示发布结果
