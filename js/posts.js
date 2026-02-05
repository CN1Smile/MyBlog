/**
 * 文章管理页面 JavaScript
 */

(function() {
    'use strict';

    // ========================================
    // 配置常量
    // ========================================
    const AUTH_SESSION_KEY = 'blog_editor_auth';
    const EDITOR_PASSWORD = 'tong951008';

    // ========================================
    // DOM 元素
    // ========================================
    const elements = {
        // 验证
        authOverlay: document.getElementById('authOverlay'),
        authForm: document.getElementById('authForm'),
        authPassword: document.getElementById('authPassword'),
        authError: document.getElementById('authError'),
        
        // 主要区域
        postsList: document.getElementById('postsList'),
        loading: document.getElementById('loading'),
        emptyState: document.getElementById('emptyState'),
        
        // 批量操作
        batchBar: document.getElementById('batchBar'),
        selectAll: document.getElementById('selectAll'),
        selectedCount: document.getElementById('selectedCount'),
        btnBatchDelete: document.getElementById('btnBatchDelete'),
        
        // 按钮
        btnRefresh: document.getElementById('btnRefresh'),
        btnNewPost: document.getElementById('btnNewPost'),
        
        // 确认弹窗
        confirmOverlay: document.getElementById('confirmOverlay'),
        confirmIcon: document.getElementById('confirmIcon'),
        confirmTitle: document.getElementById('confirmTitle'),
        confirmMessage: document.getElementById('confirmMessage'),
        btnConfirmCancel: document.getElementById('btnConfirmCancel'),
        btnConfirmOk: document.getElementById('btnConfirmOk'),
        
        // Toast
        toast: document.getElementById('toast')
    };

    // ========================================
    // 状态管理
    // ========================================
    let posts = [];
    let selectedSlugs = new Set();
    let confirmCallback = null;

    // ========================================
    // 密码验证
    // ========================================
    function checkAuth() {
        const isAuth = sessionStorage.getItem(AUTH_SESSION_KEY);
        if (isAuth === 'true') {
            hideAuthOverlay();
            return true;
        }
        showAuthOverlay();
        return false;
    }

    function showAuthOverlay() {
        elements.authOverlay.classList.remove('hidden');
        elements.authPassword.focus();
    }

    function hideAuthOverlay() {
        elements.authOverlay.classList.add('hidden');
    }

    function handleAuthSubmit(e) {
        e.preventDefault();
        const password = elements.authPassword.value;
        
        if (password === EDITOR_PASSWORD) {
            sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
            hideAuthOverlay();
            elements.authError.textContent = '';
            elements.authPassword.value = '';
            initPage();
        } else {
            elements.authError.textContent = '密码错误，请重试';
            elements.authPassword.value = '';
            elements.authPassword.focus();
        }
    }

    // ========================================
    // 初始化
    // ========================================
    function init() {
        bindAuthEvents();
        
        if (checkAuth()) {
            initPage();
        }
    }

    function initPage() {
        bindEvents();
        loadPosts();
    }

    function bindAuthEvents() {
        elements.authForm.addEventListener('submit', handleAuthSubmit);
    }

    function bindEvents() {
        // 刷新和新建按钮
        elements.btnRefresh.addEventListener('click', loadPosts);
        elements.btnNewPost.addEventListener('click', () => {
            window.location.href = 'editor.html';
        });
        
        // 批量操作
        elements.selectAll.addEventListener('change', handleSelectAll);
        elements.btnBatchDelete.addEventListener('click', handleBatchDelete);
        
        // 确认弹窗
        elements.btnConfirmCancel.addEventListener('click', hideConfirm);
        elements.btnConfirmOk.addEventListener('click', handleConfirmOk);
        elements.confirmOverlay.addEventListener('click', (e) => {
            if (e.target === elements.confirmOverlay) {
                hideConfirm();
            }
        });
    }

    // ========================================
    // 加载文章
    // ========================================
    async function loadPosts() {
        showLoading();
        selectedSlugs.clear();
        updateBatchBar();
        
        try {
            if (typeof GitHubStorage === 'undefined') {
                throw new Error('GitHubStorage 模块未加载');
            }
            
            if (!GitHubStorage.isConfigured()) {
                throw new Error('请先在编辑器中配置 GitHub');
            }
            
            posts = await GitHubStorage.getPosts();
            renderPosts();
            
        } catch (error) {
            console.error('Load posts error:', error);
            showToast(error.message, 'error');
            showEmpty();
        }
    }

    function showLoading() {
        elements.loading.classList.remove('hidden');
        elements.postsList.innerHTML = '';
        elements.emptyState.classList.add('hidden');
    }

    function hideLoading() {
        elements.loading.classList.add('hidden');
    }

    function showEmpty() {
        hideLoading();
        elements.emptyState.classList.remove('hidden');
    }

    // ========================================
    // 渲染文章列表
    // ========================================
    function renderPosts() {
        hideLoading();
        
        if (!posts || posts.length === 0) {
            showEmpty();
            elements.batchBar.classList.add('hidden');
            return;
        }
        
        elements.emptyState.classList.add('hidden');
        elements.batchBar.classList.remove('hidden');
        
        const html = posts.map((post, index) => createPostItem(post, index)).join('');
        elements.postsList.innerHTML = html;
        
        // 绑定事件
        bindPostEvents();
    }

    function createPostItem(post, index) {
        const isFirst = index === 0;
        const isLast = index === posts.length - 1;
        const isSelected = selectedSlugs.has(post.slug);
        const isPrivate = post.visibility === 'private';
        
        const categoryIcons = {
            frontend: '🎨',
            ai: '🤖',
            tools: '🛠️',
            thinking: '💡',
            essay: '✍️'
        };
        const icon = post.icon || categoryIcons[post.category] || '📄';
        const privateTag = isPrivate ? '<span class="visibility-badge private" title="仅自己可见">🔒 私密</span>' : '<span class="visibility-badge public" title="所有人可见">🌐</span>';
        
        return `
            <div class="post-item ${isSelected ? 'selected' : ''}${isPrivate ? ' post-private' : ''}" data-slug="${post.slug}">
                <div class="post-checkbox">
                    <input type="checkbox" class="checkbox post-select" 
                           data-slug="${post.slug}" ${isSelected ? 'checked' : ''}>
                </div>
                <div class="post-info">
                    <div class="post-title">${icon} ${post.title} ${privateTag}</div>
                    <div class="post-meta">
                        <span>📅 ${post.date || '未知日期'}</span>
                        <span>📁 ${post.category || '未分类'}</span>
                        ${post.readTime ? `<span>⏱️ ${post.readTime}</span>` : ''}
                    </div>
                </div>
                <div class="post-actions">
                    <button class="action-btn btn-move-up" data-slug="${post.slug}" 
                            ${isFirst ? 'disabled' : ''} title="上移">⬆️</button>
                    <button class="action-btn btn-move-down" data-slug="${post.slug}" 
                            ${isLast ? 'disabled' : ''} title="下移">⬇️</button>
                    <button class="action-btn btn-edit" data-slug="${post.slug}" title="编辑">✏️ 编辑</button>
                    <button class="action-btn danger btn-delete" data-slug="${post.slug}" title="删除">🗑️</button>
                </div>
            </div>
        `;
    }

    function bindPostEvents() {
        // 选择框
        document.querySelectorAll('.post-select').forEach(checkbox => {
            checkbox.addEventListener('change', handlePostSelect);
        });
        
        // 编辑按钮
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slug = e.currentTarget.dataset.slug;
                window.location.href = `editor.html?slug=${encodeURIComponent(slug)}`;
            });
        });
        
        // 删除按钮
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slug = e.currentTarget.dataset.slug;
                const post = posts.find(p => p.slug === slug);
                showConfirm(
                    '确认删除',
                    `确定要删除文章「${post?.title || slug}」吗？此操作不可撤销。`,
                    () => deletePost(slug)
                );
            });
        });
        
        // 上移按钮
        document.querySelectorAll('.btn-move-up').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slug = e.currentTarget.dataset.slug;
                movePost(slug, 'up');
            });
        });
        
        // 下移按钮
        document.querySelectorAll('.btn-move-down').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slug = e.currentTarget.dataset.slug;
                movePost(slug, 'down');
            });
        });
    }

    // ========================================
    // 选择功能
    // ========================================
    function handlePostSelect(e) {
        const slug = e.target.dataset.slug;
        const postItem = e.target.closest('.post-item');
        
        if (e.target.checked) {
            selectedSlugs.add(slug);
            postItem.classList.add('selected');
        } else {
            selectedSlugs.delete(slug);
            postItem.classList.remove('selected');
        }
        
        updateBatchBar();
    }

    function handleSelectAll(e) {
        const checkboxes = document.querySelectorAll('.post-select');
        
        if (e.target.checked) {
            checkboxes.forEach(cb => {
                cb.checked = true;
                selectedSlugs.add(cb.dataset.slug);
                cb.closest('.post-item').classList.add('selected');
            });
        } else {
            checkboxes.forEach(cb => {
                cb.checked = false;
                selectedSlugs.delete(cb.dataset.slug);
                cb.closest('.post-item').classList.remove('selected');
            });
        }
        
        updateBatchBar();
    }

    function updateBatchBar() {
        const count = selectedSlugs.size;
        elements.selectedCount.textContent = `已选择 ${count} 篇`;
        elements.btnBatchDelete.disabled = count === 0;
        elements.selectAll.checked = count > 0 && count === posts.length;
    }

    // ========================================
    // 删除功能
    // ========================================
    async function deletePost(slug) {
        hideConfirm();
        showToast('删除中...', '');
        
        try {
            await GitHubStorage.deletePost(slug);
            showToast('文章已删除', 'success');
            await loadPosts();
        } catch (error) {
            console.error('Delete error:', error);
            showToast(`删除失败: ${error.message}`, 'error');
        }
    }

    async function handleBatchDelete() {
        const count = selectedSlugs.size;
        if (count === 0) return;
        
        showConfirm(
            '批量删除',
            `确定要删除选中的 ${count} 篇文章吗？此操作不可撤销。`,
            async () => {
                hideConfirm();
                showToast('删除中...', '');
                
                try {
                    await GitHubStorage.batchDeletePosts([...selectedSlugs]);
                    showToast(`已删除 ${count} 篇文章`, 'success');
                    await loadPosts();
                } catch (error) {
                    console.error('Batch delete error:', error);
                    showToast(`删除失败: ${error.message}`, 'error');
                }
            }
        );
    }

    // ========================================
    // 移动功能
    // ========================================
    async function movePost(slug, direction) {
        try {
            await GitHubStorage.movePost(slug, direction);
            showToast('位置已调整', 'success');
            await loadPosts();
        } catch (error) {
            console.error('Move error:', error);
            showToast(`移动失败: ${error.message}`, 'error');
        }
    }

    // ========================================
    // 确认弹窗
    // ========================================
    function showConfirm(title, message, callback) {
        elements.confirmTitle.textContent = title;
        elements.confirmMessage.textContent = message;
        confirmCallback = callback;
        elements.confirmOverlay.classList.remove('hidden');
    }

    function hideConfirm() {
        elements.confirmOverlay.classList.add('hidden');
        confirmCallback = null;
    }

    function handleConfirmOk() {
        if (confirmCallback) {
            confirmCallback();
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
    // 启动
    // ========================================
    document.addEventListener('DOMContentLoaded', init);
})();
