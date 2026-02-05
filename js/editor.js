/**
 * 博客编辑器 JavaScript
 * 功能：Markdown 编辑、实时预览、草稿保存、导出
 */

(function() {
    'use strict';

    // ========================================
    // 配置常量
    // ========================================
    const STORAGE_KEY = 'blog_editor_draft';
    const AUTH_SESSION_KEY = 'blog_editor_auth';
    const AUTO_SAVE_INTERVAL = 30000; // 30秒
    const DEBOUNCE_DELAY = 300; // 预览更新延迟
    
    // ⚠️ 修改此密码为你自己的密码
    const EDITOR_PASSWORD = 'tong951008';

    // ========================================
    // DOM 元素引用
    // ========================================
    const elements = {
        // 表单字段
        title: document.getElementById('title'),
        slug: document.getElementById('slug'),
        excerpt: document.getElementById('excerpt'),
        category: document.getElementById('category'),
        tags: document.getElementById('tags'),
        markdownInput: document.getElementById('markdownInput'),
        
        // 预览区域
        previewContent: document.getElementById('previewContent'),
        editorPane: document.getElementById('editorPane'),
        previewPane: document.getElementById('previewPane'),
        
        // 状态和按钮
        saveStatus: document.getElementById('saveStatus'),
        btnCopyJson: document.getElementById('btnCopyJson'),
        btnDownload: document.getElementById('btnDownload'),
        btnClearDraft: document.getElementById('btnClearDraft'),
        btnPublish: document.getElementById('btnPublish'),
        btnGithubSettings: document.getElementById('btnGithubSettings'),
        toast: document.getElementById('toast'),
        
        // 工具栏和标签页
        toolbar: document.querySelector('.editor-toolbar'),
        tabBtns: document.querySelectorAll('.tab-btn')
    };

    // GitHub 弹窗元素
    const githubElements = {
        overlay: document.getElementById('githubOverlay'),
        form: document.getElementById('githubForm'),
        token: document.getElementById('githubToken'),
        owner: document.getElementById('githubOwner'),
        repo: document.getElementById('githubRepo'),
        branch: document.getElementById('githubBranch'),
        status: document.getElementById('githubStatus'),
        btnClose: document.getElementById('btnCloseGithub'),
        btnTest: document.getElementById('btnTestConnection')
    };

    // ========================================
    // 状态管理
    // ========================================
    let hasUnsavedChanges = false;
    let autoSaveTimer = null;
    let previewDebounceTimer = null;

    // ========================================
    // 密码验证
    // ========================================
    const authElements = {
        overlay: document.getElementById('authOverlay'),
        form: document.getElementById('authForm'),
        password: document.getElementById('authPassword'),
        error: document.getElementById('authError')
    };

    function checkAuth() {
        // 检查 sessionStorage 中是否已验证
        const isAuth = sessionStorage.getItem(AUTH_SESSION_KEY);
        if (isAuth === 'true') {
            hideAuthOverlay();
            return true;
        }
        showAuthOverlay();
        return false;
    }

    function showAuthOverlay() {
        authElements.overlay.classList.remove('hidden');
        authElements.password.focus();
    }

    function hideAuthOverlay() {
        authElements.overlay.classList.add('hidden');
    }

    function handleAuthSubmit(e) {
        e.preventDefault();
        const password = authElements.password.value;
        
        if (password === EDITOR_PASSWORD) {
            // 验证成功
            sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
            hideAuthOverlay();
            authElements.error.textContent = '';
            authElements.password.value = '';
            // 验证成功后初始化编辑器
            initEditor();
        } else {
            // 验证失败
            authElements.error.textContent = '密码错误，请重试';
            authElements.password.value = '';
            authElements.password.focus();
        }
    }

    function bindAuthEvents() {
        authElements.form.addEventListener('submit', handleAuthSubmit);
    }

    // ========================================
    // 初始化
    // ========================================
    function init() {
        // 先绑定验证事件
        bindAuthEvents();
        
        // 检查验证状态
        if (checkAuth()) {
            // 已验证，初始化编辑器
            initEditor();
        }
    }

    function initEditor() {
        // 配置 marked.js
        configureMarked();
        
        // 绑定事件
        bindEvents();
        
        // 尝试恢复草稿
        tryRestoreDraft();
        
        // 启动自动保存
        startAutoSave();
        
        console.log('Editor initialized');
    }

    // ========================================
    // Marked.js 配置
    // ========================================
    function configureMarked() {
        if (typeof marked === 'undefined') {
            console.error('marked.js not loaded');
            return;
        }

        marked.setOptions({
            breaks: true,
            gfm: true,
            highlight: function(code, lang) {
                if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (e) {
                        console.error('Highlight error:', e);
                    }
                }
                return code;
            }
        });
    }

    // ========================================
    // 事件绑定
    // ========================================
    function bindEvents() {
        // Markdown 输入 - 实时预览
        elements.markdownInput.addEventListener('input', handleMarkdownInput);
        
        // 标题输入 - 自动生成 slug
        elements.title.addEventListener('input', handleTitleInput);
        
        // 所有表单字段变更
        const formFields = [elements.title, elements.slug, elements.excerpt, 
                           elements.category, elements.tags, elements.markdownInput];
        formFields.forEach(field => {
            field.addEventListener('input', markAsUnsaved);
        });
        
        // 工具栏按钮
        elements.toolbar.addEventListener('click', handleToolbarClick);
        
        // 导出按钮
        elements.btnCopyJson.addEventListener('click', copyJsonToClipboard);
        elements.btnDownload.addEventListener('click', downloadJson);
        elements.btnClearDraft.addEventListener('click', clearDraft);
        
        // GitHub 按钮
        elements.btnGithubSettings.addEventListener('click', openGithubSettings);
        elements.btnPublish.addEventListener('click', handlePublish);
        
        // GitHub 弹窗事件
        githubElements.btnClose.addEventListener('click', closeGithubSettings);
        githubElements.overlay.addEventListener('click', handleGithubOverlayClick);
        githubElements.form.addEventListener('submit', handleGithubSave);
        githubElements.btnTest.addEventListener('click', handleTestConnection);
        
        // 移动端标签页切换
        elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', handleTabSwitch);
        });
        
        // 快捷键
        elements.markdownInput.addEventListener('keydown', handleKeyboardShortcuts);
        
        // 页面离开警告
        window.addEventListener('beforeunload', handleBeforeUnload);
    }

    // ========================================
    // Markdown 预览更新
    // ========================================
    function handleMarkdownInput() {
        clearTimeout(previewDebounceTimer);
        previewDebounceTimer = setTimeout(updatePreview, DEBOUNCE_DELAY);
    }

    function updatePreview() {
        const markdown = elements.markdownInput.value;
        
        if (!markdown.trim()) {
            elements.previewContent.innerHTML = 
                '<p class="preview-placeholder">预览区域 - 开始输入内容后将显示渲染结果</p>';
            return;
        }
        
        try {
            const html = marked.parse(markdown);
            elements.previewContent.innerHTML = html;
            
            // 应用代码高亮
            if (typeof hljs !== 'undefined') {
                elements.previewContent.querySelectorAll('pre code').forEach(block => {
                    hljs.highlightElement(block);
                });
            }
        } catch (e) {
            console.error('Markdown parse error:', e);
            elements.previewContent.innerHTML = '<p style="color: #f87171;">渲染错误</p>';
        }
    }

    // ========================================
    // Slug 自动生成
    // ========================================
    function handleTitleInput() {
        const title = elements.title.value;
        
        // 只在 slug 为空或未手动修改时自动生成
        if (!elements.slug.dataset.manualEdit) {
            elements.slug.value = generateSlug(title);
        }
    }

    function generateSlug(title) {
        if (!title) return '';
        
        return title
            .toLowerCase()
            .trim()
            // 替换中文标点
            .replace(/[，。！？、；：""''（）【】《》]/g, '')
            // 替换空格和特殊字符为连字符
            .replace(/[\s\-_]+/g, '-')
            // 移除非字母数字和中文以外的字符
            .replace(/[^\u4e00-\u9fa5a-z0-9\-]/g, '')
            // 移除首尾连字符
            .replace(/^-+|-+$/g, '')
            // 限制长度
            .substring(0, 50);
    }

    // 标记 slug 为手动编辑
    elements.slug?.addEventListener('input', function() {
        this.dataset.manualEdit = 'true';
    });

    // ========================================
    // 工具栏功能
    // ========================================
    function handleToolbarClick(e) {
        const btn = e.target.closest('.toolbar-btn');
        if (!btn) return;
        
        const action = btn.dataset.action;
        if (!action) return;
        
        insertMarkdown(action);
        elements.markdownInput.focus();
    }

    function insertMarkdown(action) {
        const textarea = elements.markdownInput;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const before = textarea.value.substring(0, start);
        const after = textarea.value.substring(end);
        
        let insertion = '';
        let cursorOffset = 0;
        
        switch (action) {
            case 'bold':
                insertion = `**${selectedText || '粗体文本'}**`;
                cursorOffset = selectedText ? insertion.length : 2;
                break;
            case 'italic':
                insertion = `*${selectedText || '斜体文本'}*`;
                cursorOffset = selectedText ? insertion.length : 1;
                break;
            case 'heading':
                insertion = `\n## ${selectedText || '标题'}\n`;
                cursorOffset = selectedText ? insertion.length : 4;
                break;
            case 'link':
                if (selectedText) {
                    insertion = `[${selectedText}](url)`;
                    cursorOffset = insertion.length - 1;
                } else {
                    insertion = '[链接文字](url)';
                    cursorOffset = 1;
                }
                break;
            case 'image':
                insertion = `![${selectedText || '图片描述'}](image-url)`;
                cursorOffset = selectedText ? insertion.length - 1 : 2;
                break;
            case 'code':
                if (selectedText.includes('\n')) {
                    insertion = `\n\`\`\`\n${selectedText}\n\`\`\`\n`;
                } else {
                    insertion = `\`${selectedText || '代码'}\``;
                }
                cursorOffset = selectedText ? insertion.length : 1;
                break;
            case 'quote':
                insertion = `\n> ${selectedText || '引用文字'}\n`;
                cursorOffset = selectedText ? insertion.length : 3;
                break;
            case 'ul':
                insertion = `\n- ${selectedText || '列表项'}\n`;
                cursorOffset = selectedText ? insertion.length : 3;
                break;
            case 'ol':
                insertion = `\n1. ${selectedText || '列表项'}\n`;
                cursorOffset = selectedText ? insertion.length : 4;
                break;
            case 'hr':
                insertion = '\n\n---\n\n';
                cursorOffset = insertion.length;
                break;
        }
        
        textarea.value = before + insertion + after;
        
        // 设置光标位置
        const newCursorPos = start + cursorOffset;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        
        // 触发输入事件以更新预览
        textarea.dispatchEvent(new Event('input'));
    }

    // ========================================
    // 快捷键处理
    // ========================================
    function handleKeyboardShortcuts(e) {
        if (!e.ctrlKey && !e.metaKey) return;
        
        let action = null;
        
        switch (e.key.toLowerCase()) {
            case 'b':
                action = 'bold';
                break;
            case 'i':
                action = 'italic';
                break;
            case 'k':
                action = 'link';
                break;
        }
        
        if (action) {
            e.preventDefault();
            insertMarkdown(action);
        }
    }

    // ========================================
    // 草稿保存与恢复
    // ========================================
    function getDraftData() {
        return {
            title: elements.title.value,
            slug: elements.slug.value,
            excerpt: elements.excerpt.value,
            category: elements.category.value,
            tags: elements.tags.value,
            content: elements.markdownInput.value,
            lastSaved: new Date().toISOString()
        };
    }

    function saveDraft() {
        const data = getDraftData();
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            updateSaveStatus('saved');
            hasUnsavedChanges = false;
            showToast('草稿已保存', 'success');
        } catch (e) {
            console.error('Save draft error:', e);
            showToast('保存失败', 'error');
        }
    }

    function tryRestoreDraft() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return;
            
            const data = JSON.parse(saved);
            
            // 检查是否有实际内容
            const hasContent = data.title || data.content;
            if (!hasContent) return;
            
            // 询问是否恢复
            const lastSaved = data.lastSaved 
                ? new Date(data.lastSaved).toLocaleString() 
                : '未知时间';
            
            const restore = confirm(`发现未完成的草稿 (${lastSaved})，是否恢复？`);
            
            if (restore) {
                restoreDraft(data);
                showToast('草稿已恢复', 'success');
            }
        } catch (e) {
            console.error('Restore draft error:', e);
        }
    }

    function restoreDraft(data) {
        elements.title.value = data.title || '';
        elements.slug.value = data.slug || '';
        elements.excerpt.value = data.excerpt || '';
        elements.category.value = data.category || 'frontend';
        elements.tags.value = data.tags || '';
        elements.markdownInput.value = data.content || '';
        
        // 标记 slug 为已手动编辑
        if (data.slug) {
            elements.slug.dataset.manualEdit = 'true';
        }
        
        // 更新预览
        updatePreview();
        updateSaveStatus('saved');
    }

    function clearDraft() {
        if (!confirm('确定要清除当前草稿吗？此操作不可撤销。')) return;
        
        // 清空表单
        elements.title.value = '';
        elements.slug.value = '';
        elements.slug.dataset.manualEdit = '';
        elements.excerpt.value = '';
        elements.category.value = 'frontend';
        elements.tags.value = '';
        elements.markdownInput.value = '';
        
        // 清空 localStorage
        localStorage.removeItem(STORAGE_KEY);
        
        // 更新状态
        updatePreview();
        updateSaveStatus('unsaved');
        hasUnsavedChanges = false;
        
        showToast('草稿已清除', 'success');
    }

    function startAutoSave() {
        autoSaveTimer = setInterval(() => {
            if (hasUnsavedChanges) {
                saveDraft();
            }
        }, AUTO_SAVE_INTERVAL);
    }

    function markAsUnsaved() {
        hasUnsavedChanges = true;
        updateSaveStatus('unsaved');
    }

    function updateSaveStatus(status) {
        const statusEl = elements.saveStatus;
        statusEl.classList.remove('saved', 'saving');
        
        switch (status) {
            case 'saved':
                statusEl.textContent = '已保存';
                statusEl.classList.add('saved');
                break;
            case 'saving':
                statusEl.textContent = '保存中...';
                statusEl.classList.add('saving');
                break;
            default:
                statusEl.textContent = '未保存';
        }
    }

    // ========================================
    // 导出功能
    // ========================================
    function generatePostJson() {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        
        const tags = elements.tags.value
            .split(',')
            .map(t => t.trim())
            .filter(t => t);
        
        // 计算阅读时间 (按中文 400字/分钟估算)
        const content = elements.markdownInput.value;
        const wordCount = content.length;
        const readTime = Math.max(1, Math.ceil(wordCount / 400));
        
        // 使用 summary 字段（首页列表使用）
        const summary = elements.excerpt.value || content.substring(0, 150) + '...';
        
        return {
            slug: elements.slug.value || generateSlug(elements.title.value),
            title: elements.title.value,
            date: dateStr,
            summary: summary,           // 首页列表显示用
            content: content,           // 文章详情页用
            category: elements.category.value,
            tags: tags,
            readTime: `${readTime} min read`,
            icon: getCategoryIcon(elements.category.value)
        };
    }

    function getCategoryIcon(category) {
        const icons = {
            frontend: '🎨',
            ai: '🤖',
            tools: '🛠️',
            thinking: '💡',
            essay: '✍️'
        };
        return icons[category] || '📝';
    }

    function copyJsonToClipboard() {
        const post = generatePostJson();
        const json = JSON.stringify(post, null, 2);
        
        navigator.clipboard.writeText(json)
            .then(() => showToast('JSON 已复制到剪贴板', 'success'))
            .catch(e => {
                console.error('Copy failed:', e);
                showToast('复制失败', 'error');
            });
    }

    function downloadJson() {
        const post = generatePostJson();
        const json = JSON.stringify(post, null, 2);
        const slug = post.slug || 'untitled';
        
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${slug}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('文件已下载', 'success');
    }

    // ========================================
    // 移动端标签页切换
    // ========================================
    function handleTabSwitch(e) {
        const btn = e.target;
        const tab = btn.dataset.tab;
        
        // 更新按钮状态
        elements.tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // 切换面板
        if (tab === 'editor') {
            elements.editorPane.classList.remove('hidden');
            elements.previewPane.classList.add('hidden');
        } else {
            elements.editorPane.classList.add('hidden');
            elements.previewPane.classList.remove('hidden');
            // 切换到预览时更新内容
            updatePreview();
        }
    }

    // ========================================
    // 页面离开警告
    // ========================================
    function handleBeforeUnload(e) {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '你有未保存的更改，确定要离开吗？';
            return e.returnValue;
        }
    }

    // ========================================
    // Toast 提示
    // ========================================
    function showToast(message, type = '') {
        const toast = elements.toast;
        toast.textContent = message;
        toast.className = 'toast show';
        if (type) {
            toast.classList.add(type);
        }
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ========================================
    // GitHub 配置功能
    // ========================================
    function openGithubSettings() {
        // 加载已保存的配置
        if (typeof GitHubStorage !== 'undefined') {
            const config = GitHubStorage.getConfig();
            githubElements.token.value = config.token || '';
            githubElements.owner.value = config.owner || '';
            githubElements.repo.value = config.repo || '';
            githubElements.branch.value = config.branch || 'main';
        }
        
        // 清除状态
        setGithubStatus('', '');
        
        // 显示弹窗
        githubElements.overlay.classList.remove('hidden');
        githubElements.token.focus();
    }

    function closeGithubSettings() {
        githubElements.overlay.classList.add('hidden');
    }

    function handleGithubOverlayClick(e) {
        if (e.target === githubElements.overlay) {
            closeGithubSettings();
        }
    }

    function setGithubStatus(message, type) {
        const status = githubElements.status;
        status.textContent = message;
        status.className = 'github-status';
        
        if (message) {
            status.classList.add('show', type);
        }
    }

    function handleGithubSave(e) {
        e.preventDefault();
        
        const config = {
            token: githubElements.token.value.trim(),
            owner: githubElements.owner.value.trim(),
            repo: githubElements.repo.value.trim(),
            branch: githubElements.branch.value.trim() || 'main'
        };

        if (!config.token || !config.owner || !config.repo) {
            setGithubStatus('请填写完整的配置信息', 'error');
            return;
        }

        if (typeof GitHubStorage !== 'undefined') {
            GitHubStorage.saveConfig(config);
            setGithubStatus('配置已保存', 'success');
            showToast('GitHub 配置已保存', 'success');
            
            setTimeout(() => {
                closeGithubSettings();
            }, 1000);
        } else {
            setGithubStatus('GitHubStorage 模块未加载', 'error');
        }
    }

    async function handleTestConnection() {
        if (typeof GitHubStorage === 'undefined') {
            setGithubStatus('GitHubStorage 模块未加载', 'error');
            return;
        }

        // 先临时保存配置用于测试
        const config = {
            token: githubElements.token.value.trim(),
            owner: githubElements.owner.value.trim(),
            repo: githubElements.repo.value.trim(),
            branch: githubElements.branch.value.trim() || 'main'
        };

        if (!config.token || !config.owner || !config.repo) {
            setGithubStatus('请填写完整的配置信息', 'error');
            return;
        }

        // 临时保存以便测试
        GitHubStorage.saveConfig(config);
        
        setGithubStatus('正在测试连接...', 'loading');
        
        try {
            const result = await GitHubStorage.testConnection();
            setGithubStatus(`✅ 连接成功: ${result.repoName}`, 'success');
        } catch (error) {
            setGithubStatus(`❌ ${error.message}`, 'error');
        }
    }

    async function handlePublish() {
        if (typeof GitHubStorage === 'undefined') {
            showToast('GitHubStorage 模块未加载', 'error');
            return;
        }

        // 检查是否配置
        if (!GitHubStorage.isConfigured()) {
            showToast('请先配置 GitHub', 'error');
            openGithubSettings();
            return;
        }

        // 验证文章内容
        const title = elements.title.value.trim();
        const content = elements.markdownInput.value.trim();
        
        if (!title) {
            showToast('请填写文章标题', 'error');
            elements.title.focus();
            return;
        }

        if (!content) {
            showToast('请填写文章内容', 'error');
            elements.markdownInput.focus();
            return;
        }

        // 生成文章数据
        const post = generatePostJson();

        // 禁用按钮，显示发布中状态
        elements.btnPublish.disabled = true;
        elements.btnPublish.textContent = '⏳ 发布中...';

        try {
            const result = await GitHubStorage.publishPost(post);
            showToast(result.message, 'success');
            
            // 清除草稿
            localStorage.removeItem(STORAGE_KEY);
            hasUnsavedChanges = false;
            updateSaveStatus('saved');
            
        } catch (error) {
            console.error('Publish error:', error);
            showToast(`发布失败: ${error.message}`, 'error');
        } finally {
            // 恢复按钮状态
            elements.btnPublish.disabled = false;
            elements.btnPublish.textContent = '🚀 发布';
        }
    }

    // ========================================
    // 启动
    // ========================================
    document.addEventListener('DOMContentLoaded', init);
})();
