# Change: 编辑器密码保护

## Why
博客编辑器是管理功能，应仅限博主本人使用。需要添加访问控制，防止未授权用户访问撰写功能。

## What Changes
- 访问编辑器页面时，弹出密码验证对话框
- 密码验证成功后，在当前会话（sessionStorage）中保持登录状态
- 验证失败时，阻止访问编辑器内容

## Impact
- Affected specs: blog-editor
- Affected code: js/editor.js, editor.html
