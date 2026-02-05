# GitHub Storage

GitHub 仓库存储集成，支持通过 GitHub API 读写文章数据。

## ADDED Requirements

### Requirement: GitHub 配置管理

系统 SHALL 提供 GitHub 配置界面，允许用户配置以下信息：
- Personal Access Token
- 仓库所有者（owner）
- 仓库名称（repo）
- 分支名称（branch，默认 main）

配置信息 SHALL 存储在 `localStorage` 中，key 为 `github_config`。

#### Scenario: 首次配置 GitHub

- **WHEN** 用户点击 GitHub 设置按钮
- **THEN** 显示配置弹窗
- **AND** 所有字段为空或显示默认值

#### Scenario: 保存 GitHub 配置

- **WHEN** 用户填写完配置信息并点击保存
- **THEN** 配置保存到 localStorage
- **AND** 弹窗关闭
- **AND** 显示保存成功提示

#### Scenario: 加载已保存的配置

- **WHEN** 用户打开配置弹窗且已有保存的配置
- **THEN** 表单自动填充已保存的值

### Requirement: GitHub 连接测试

系统 SHALL 提供连接测试功能，验证配置是否正确。

#### Scenario: 测试连接成功

- **WHEN** 用户点击测试连接按钮
- **AND** 配置信息正确
- **THEN** 调用 GitHub API 获取仓库信息
- **AND** 显示"连接成功"提示

#### Scenario: 测试连接失败

- **WHEN** 用户点击测试连接按钮
- **AND** Token 无效或仓库不存在
- **THEN** 显示具体的错误信息

### Requirement: 发布文章到 GitHub

系统 SHALL 提供发布功能，将当前编辑的文章保存到 GitHub 仓库的 `data/posts.json` 文件中。

#### Scenario: 发布新文章成功

- **WHEN** 用户点击发布按钮
- **AND** GitHub 配置有效
- **AND** 文章标题和内容不为空
- **THEN** 获取远程 posts.json 的当前内容
- **AND** 将新文章添加到 posts 数组开头
- **AND** 通过 GitHub API 提交更新
- **AND** 显示"发布成功"提示
- **AND** 清空编辑器草稿

#### Scenario: 发布失败 - 未配置 GitHub

- **WHEN** 用户点击发布按钮
- **AND** GitHub 未配置
- **THEN** 显示"请先配置 GitHub"提示
- **AND** 自动打开配置弹窗

#### Scenario: 发布失败 - 文章内容不完整

- **WHEN** 用户点击发布按钮
- **AND** 标题或内容为空
- **THEN** 显示"请填写标题和内容"提示

#### Scenario: 发布失败 - API 错误

- **WHEN** 发布过程中发生 API 错误
- **THEN** 显示具体的错误信息
- **AND** 文章内容保留不丢失

### Requirement: GitHub API 调用

系统 SHALL 使用 GitHub Contents API 进行文件操作。

#### Scenario: 读取远程文件

- **WHEN** 需要读取 posts.json
- **THEN** 调用 `GET /repos/{owner}/{repo}/contents/data/posts.json`
- **AND** 使用 `ref` 参数指定分支
- **AND** 解码 Base64 内容

#### Scenario: 更新远程文件

- **WHEN** 需要更新 posts.json
- **THEN** 调用 `PUT /repos/{owner}/{repo}/contents/data/posts.json`
- **AND** 请求体包含 `content`（Base64 编码）、`sha`（当前文件 SHA）、`message`（提交信息）
- **AND** 使用 `branch` 参数指定分支
