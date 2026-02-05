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
    // 公开 API
    // ========================================
    return {
        getConfig,
        saveConfig,
        isConfigured,
        testConnection,
        publishPost,
        getFileContent
    };
})();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubStorage;
}
