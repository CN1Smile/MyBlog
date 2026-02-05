/**
 * GitHub Storage 模块
 * 通过 GitHub API 将文章保存到仓库
 */

const GitHubStorage = (function() {
    'use strict';

    // ========================================
    // 配置常量
    // ========================================
    const STORAGE_KEY = 'github_config';
    const API_BASE = 'https://api.github.com';
    const DATA_PATH = 'data/posts.json';
    const COLUMNS_PATH = 'data/columns.json';

    // 默认配置（你可以修改这里的默认值）
    const DEFAULT_CONFIG = {
        token: '',
        owner: 'CN1Smile',
        repo: 'MyBlog',
        branch: 'main'
    };

    // ========================================
    // 配置管理
    // ========================================
    function getConfig() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Failed to load GitHub config:', e);
        }
        return { ...DEFAULT_CONFIG };
    }

    function saveConfig(config) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
            return true;
        } catch (e) {
            console.error('Failed to save GitHub config:', e);
            return false;
        }
    }

    function isConfigured() {
        const config = getConfig();
        return !!(config.token && config.owner && config.repo);
    }

    // ========================================
    // GitHub API 调用
    // ========================================
    async function apiRequest(endpoint, options = {}) {
        const config = getConfig();
        
        if (!config.token) {
            throw new Error('GitHub Token 未配置');
        }

        const url = `${API_BASE}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `API 错误: ${response.status}`);
        }

        return response.json();
    }

    // 获取文件内容和 SHA
    async function getFileContent(path) {
        const config = getConfig();
        const endpoint = `/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`;
        
        try {
            const data = await apiRequest(endpoint);
            const content = atob(data.content.replace(/\n/g, ''));
            return {
                content: JSON.parse(content),
                sha: data.sha
            };
        } catch (e) {
            // 文件不存在时返回空数据
            if (e.message.includes('404') || e.message.includes('Not Found')) {
                return { content: { posts: [] }, sha: null };
            }
            throw e;
        }
    }

    // 更新文件
    async function updateFile(path, content, sha, message) {
        const config = getConfig();
        const endpoint = `/repos/${config.owner}/${config.repo}/contents/${path}`;
        
        const body = {
            message: message,
            content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
            branch: config.branch
        };

        if (sha) {
            body.sha = sha;
        }

        return apiRequest(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    // ========================================
    // 连接测试
    // ========================================
    async function testConnection() {
        const config = getConfig();
        
        if (!config.token || !config.owner || !config.repo) {
            throw new Error('请填写完整的配置信息');
        }

        const endpoint = `/repos/${config.owner}/${config.repo}`;
        const repo = await apiRequest(endpoint);
        
        return {
            success: true,
            repoName: repo.full_name,
            isPrivate: repo.private
        };
    }

    // ========================================
    // 发布文章
    // ========================================
    async function publishPost(post) {
        // 验证文章数据
        if (!post.title || !post.content) {
            throw new Error('请填写标题和内容');
        }

        if (!isConfigured()) {
            throw new Error('请先配置 GitHub');
        }

        // 获取当前文章列表
        const { content: data, sha } = await getFileContent(DATA_PATH);
        
        // 确保 posts 数组存在
        if (!data.posts) {
            data.posts = [];
        }

        // 检查是否存在相同 slug 的文章
        const existingIndex = data.posts.findIndex(p => p.slug === post.slug);
        if (existingIndex >= 0) {
            // 更新现有文章
            data.posts[existingIndex] = post;
        } else {
            // 添加新文章到开头
            data.posts.unshift(post);
        }

        // 提交更新
        const message = existingIndex >= 0 
            ? `更新文章: ${post.title}`
            : `发布文章: ${post.title}`;

        await updateFile(DATA_PATH, data, sha, message);

        return {
            success: true,
            isUpdate: existingIndex >= 0,
            message: existingIndex >= 0 ? '文章已更新' : '文章已发布'
        };
    }

    // ========================================
    // 获取所有文章
    // ========================================
    async function getPosts() {
        const { content: data } = await getFileContent(DATA_PATH);
        return data.posts || [];
    }

    // ========================================
    // 获取单篇文章
    // ========================================
    async function getPost(slug) {
        const posts = await getPosts();
        return posts.find(p => p.slug === slug) || null;
    }

    // ========================================
    // 删除单篇文章
    // ========================================
    async function deletePost(slug) {
        if (!isConfigured()) {
            throw new Error('请先配置 GitHub');
        }

        const { content: data, sha } = await getFileContent(DATA_PATH);
        
        if (!data.posts) {
            throw new Error('文章列表为空');
        }

        const index = data.posts.findIndex(p => p.slug === slug);
        if (index === -1) {
            throw new Error('文章不存在');
        }

        const deletedPost = data.posts[index];
        data.posts.splice(index, 1);

        await updateFile(DATA_PATH, data, sha, `删除文章: ${deletedPost.title}`);

        return {
            success: true,
            message: '文章已删除'
        };
    }

    // ========================================
    // 批量删除文章
    // ========================================
    async function batchDeletePosts(slugs) {
        if (!isConfigured()) {
            throw new Error('请先配置 GitHub');
        }

        if (!slugs || slugs.length === 0) {
            throw new Error('请选择要删除的文章');
        }

        const { content: data, sha } = await getFileContent(DATA_PATH);
        
        if (!data.posts) {
            throw new Error('文章列表为空');
        }

        const slugSet = new Set(slugs);
        const deletedTitles = [];
        
        data.posts = data.posts.filter(p => {
            if (slugSet.has(p.slug)) {
                deletedTitles.push(p.title);
                return false;
            }
            return true;
        });

        await updateFile(DATA_PATH, data, sha, `批量删除 ${deletedTitles.length} 篇文章`);

        return {
            success: true,
            count: deletedTitles.length,
            message: `已删除 ${deletedTitles.length} 篇文章`
        };
    }

    // ========================================
    // 调整文章顺序
    // ========================================
    async function reorderPosts(posts) {
        if (!isConfigured()) {
            throw new Error('请先配置 GitHub');
        }

        const { content: data, sha } = await getFileContent(DATA_PATH);
        
        data.posts = posts;

        await updateFile(DATA_PATH, data, sha, '调整文章顺序');

        return {
            success: true,
            message: '顺序已更新'
        };
    }

    // ========================================
    // 移动文章位置
    // ========================================
    async function movePost(slug, direction) {
        if (!isConfigured()) {
            throw new Error('请先配置 GitHub');
        }

        const { content: data, sha } = await getFileContent(DATA_PATH);
        
        if (!data.posts || data.posts.length < 2) {
            throw new Error('文章数量不足，无法移动');
        }

        const index = data.posts.findIndex(p => p.slug === slug);
        if (index === -1) {
            throw new Error('文章不存在');
        }

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (newIndex < 0 || newIndex >= data.posts.length) {
            throw new Error('已经在边界位置');
        }

        // 交换位置
        [data.posts[index], data.posts[newIndex]] = [data.posts[newIndex], data.posts[index]];

        await updateFile(DATA_PATH, data, sha, `移动文章: ${data.posts[newIndex].title}`);

        return {
            success: true,
            message: '位置已调整'
        };
    }

    // ========================================
    // 专栏相关 API
    // ========================================
    
    // 获取专栏文件内容
    async function getColumnsFileContent() {
        const config = getConfig();
        const endpoint = `/repos/${config.owner}/${config.repo}/contents/${COLUMNS_PATH}?ref=${config.branch}`;
        
        try {
            const data = await apiRequest(endpoint);
            const content = atob(data.content.replace(/\n/g, ''));
            return {
                content: JSON.parse(content),
                sha: data.sha
            };
        } catch (e) {
            if (e.message.includes('404') || e.message.includes('Not Found')) {
                return { content: { columns: [] }, sha: null };
            }
            throw e;
        }
    }

    // 获取所有专栏
    async function getColumns() {
        const { content: data } = await getColumnsFileContent();
        return data.columns || [];
    }

    // 创建专栏
    async function createColumn(column) {
        if (!column.name) {
            throw new Error('请填写专栏名称');
        }

        if (!isConfigured()) {
            throw new Error('请先配置 GitHub');
        }

        const { content: data, sha } = await getColumnsFileContent();
        
        if (!data.columns) {
            data.columns = [];
        }

        // 生成 slug
        const slug = column.slug || column.name.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-\u4e00-\u9fa5]/g, '');

        // 检查是否已存在
        if (data.columns.find(c => c.slug === slug)) {
            throw new Error('该专栏已存在');
        }

        const newColumn = {
            slug,
            name: column.name,
            description: column.description || '',
            icon: column.icon || '📁',
            createdAt: new Date().toISOString()
        };

        data.columns.push(newColumn);

        await updateFile(COLUMNS_PATH, data, sha, `创建专栏: ${column.name}`);

        return {
            success: true,
            column: newColumn,
            message: '专栏已创建'
        };
    }

    // 更新专栏
    async function updateColumn(slug, updates) {
        if (!isConfigured()) {
            throw new Error('请先配置 GitHub');
        }

        const { content: data, sha } = await getColumnsFileContent();
        
        if (!data.columns) {
            throw new Error('专栏列表为空');
        }

        const index = data.columns.findIndex(c => c.slug === slug);
        if (index === -1) {
            throw new Error('专栏不存在');
        }

        data.columns[index] = { ...data.columns[index], ...updates };

        await updateFile(COLUMNS_PATH, data, sha, `更新专栏: ${data.columns[index].name}`);

        return {
            success: true,
            column: data.columns[index],
            message: '专栏已更新'
        };
    }

    // 删除专栏
    async function deleteColumn(slug) {
        if (!isConfigured()) {
            throw new Error('请先配置 GitHub');
        }

        const { content: data, sha } = await getColumnsFileContent();
        
        if (!data.columns) {
            throw new Error('专栏列表为空');
        }

        const index = data.columns.findIndex(c => c.slug === slug);
        if (index === -1) {
            throw new Error('专栏不存在');
        }

        const deletedColumn = data.columns[index];
        data.columns.splice(index, 1);

        await updateFile(COLUMNS_PATH, data, sha, `删除专栏: ${deletedColumn.name}`);

        return {
            success: true,
            message: '专栏已删除'
        };
    }

    // 根据专栏获取文章
    async function getPostsByColumn(columnSlug) {
        const posts = await getPosts();
        if (!columnSlug || columnSlug === 'all') {
            return posts;
        }
        return posts.filter(p => p.column === columnSlug);
    }

    // ========================================
    // 公开 API
    // ========================================
    return {
        getConfig,
        saveConfig,
        isConfigured,
        testConnection,
        publishPost,
        getFileContent,
        getPosts,
        getPost,
        deletePost,
        batchDeletePosts,
        reorderPosts,
        movePost,
        // 专栏 API
        getColumns,
        createColumn,
        updateColumn,
        deleteColumn,
        getPostsByColumn
    };
})();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubStorage;
}
