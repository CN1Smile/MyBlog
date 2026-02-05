## Context

博客需要部署到 GitHub Pages 并支持在线编辑文章。由于是纯静态站点，无法使用传统后端，因此采用 GitHub API 直接操作仓库文件的方式实现数据持久化。

### 约束条件
- 纯前端实现，无后端服务
- 用户需自行创建 GitHub Personal Access Token
- 文章数据以 JSON 格式存储在仓库中

## Goals / Non-Goals

### Goals
- ✅ 部署博客到 GitHub Pages
- ✅ 在编辑器中配置 GitHub Token
- ✅ 通过 GitHub API 发布文章到仓库
- ✅ 发布后自动触发网站更新

### Non-Goals
- ❌ 不实现 OAuth App（需要后端）
- ❌ 不实现图片上传（可后续扩展）
- ❌ 不实现多用户协作

## Decisions

### 1. 授权方式：Personal Access Token (PAT)

**选择**: 使用 GitHub Fine-grained Personal Access Token

**原因**:
- 纯前端可实现，无需后端
- 用户一次性配置，长期有效
- Fine-grained token 可限制仓库权限，更安全

**Token 权限要求**:
- Repository access: 仅选择博客仓库
- Permissions: Contents (Read and write)

### 2. Token 存储位置

**选择**: `localStorage`

**原因**:
- 编辑器已有密码保护，安全性有保障
- 持久化存储，避免每次都输入
- 简单易实现

**存储格式**:
```javascript
localStorage.setItem('github_config', JSON.stringify({
    token: 'ghp_xxxx',
    owner: 'username',
    repo: 'blog-repo',
    branch: 'main'
}));
```

### 3. GitHub API 调用流程

**发布文章流程**:
```
1. 获取当前 posts.json 的 SHA (GET /repos/{owner}/{repo}/contents/data/posts.json)
2. 解码 Base64 内容，解析 JSON
3. 添加新文章到 posts 数组
4. 编码为 Base64，提交更新 (PUT /repos/{owner}/{repo}/contents/data/posts.json)
```

**API 端点**:
- Base URL: `https://api.github.com`
- 读取文件: `GET /repos/{owner}/{repo}/contents/{path}`
- 更新文件: `PUT /repos/{owner}/{repo}/contents/{path}`

### 4. UI 设计

**编辑器新增元素**:
```
┌─────────────────────────────────────────────────┐
│  [GitHub 设置 ⚙️]        [发布到 GitHub 🚀]     │
│                                                  │
│  (现有编辑器界面)                                │
└─────────────────────────────────────────────────┘
```

**GitHub 设置弹窗**:
```
┌─────────────────────────────────────────────────┐
│  GitHub 配置                              [×]   │
├─────────────────────────────────────────────────┤
│  Token: [________________________]              │
│  仓库所有者: [________________]                 │
│  仓库名称: [__________________]                 │
│  分支: [main________________]                   │
│                                                  │
│  [测试连接]                      [保存配置]     │
└─────────────────────────────────────────────────┘
```

### 5. GitHub Pages 部署步骤

1. 用户将代码推送到 GitHub 仓库
2. 在仓库 Settings > Pages 中启用 GitHub Pages
3. 选择部署分支（main）和目录（root）
4. 网站自动部署到 `https://{username}.github.io/{repo}/`

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| Token 泄露 | 编辑器有密码保护；用户可随时撤销 Token |
| API 调用频率限制 | GitHub API 限制 5000 次/小时，博客场景足够 |
| 并发编辑冲突 | 单人使用场景，不需要处理 |

## Migration Plan

1. 创建 GitHub 仓库
2. 推送博客代码
3. 启用 GitHub Pages
4. 生成 Personal Access Token
5. 在编辑器中配置 Token
6. 测试发布功能

## Open Questions

- 是否需要支持编辑/删除已发布的文章？（可后续扩展）
