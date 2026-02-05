/**
 * 站点配置管理
 * 使用 GitHub 存储站点配置信息
 */

const SiteConfig = {
    CONFIG_PATH: 'data/site-config.json',
    
    // 默认配置
    defaultConfig: {
        site: {
            title: '张志通 - 游戏开发工程师',
            logoIcon: '🎮',
            logoText: "ZHITONG'S BLOG",
            label: 'GAME DEV BLOG · 2026'
        },
        hero: {
            title: '记录 <span class="gradient-text">游戏开发</span> 的每一次探索。',
            description: '这里是张志通的游戏开发笔记。分享 Unity、图形渲染、游戏架构与技术美术的实践心得，用代码构建虚拟世界的每一个细节。',
            topics: ['Unity', '图形学', '游戏架构'],
            updateFrequency: '持续更新中',
            primaryButton: '开始阅读 ↗',
            secondaryButton: '查看项目作品'
        },
        author: {
            name: '张志通',
            avatarText: '张'
        },
        categories: ['全部', 'Unity 开发', '图形渲染', '游戏架构', '技术美术', '开发日志'],
        series: [
            { name: '「Unity Shader 从入门到实战」', progress: '已发布 3/8 篇 · 图形学 · Shader' },
            { name: '「游戏性能优化指南」', progress: '已发布 2/5 篇 · 优化 · 实战' },
            { name: '「独立游戏开发日记」', progress: '已发布 4/10 篇 · 项目 · 记录' }
        ],
        about: '这里记录我在游戏开发路上的学习笔记、技术分享和项目经验。希望这些内容对你也有所帮助。',
        latestNote: {
            title: 'Unity URP 渲染管线优化实践',
            description: '如何在移动端实现高效的后处理效果，以及 SRP Batcher 的最佳实践经验。',
            tags: [
                { text: 'Unity', color: 'purple' },
                { text: 'Graphics', color: 'blue' },
                { text: 'Performance', color: 'gray' }
            ],
            footnote: '深入游戏引擎的渲染世界'
        }
    },

    /**
     * 获取站点配置
     */
    async getConfig() {
        try {
            // 优先从 GitHub 获取
            if (GitHubStorage && GitHubStorage.isConfigured()) {
                const config = await this.fetchFromGitHub();
                if (config) return config;
            }
        } catch (e) {
            console.log('从 GitHub 获取配置失败，使用默认配置');
        }
        
        // 返回默认配置
        return this.defaultConfig;
    },

    /**
     * 从 GitHub 获取配置
     */
    async fetchFromGitHub() {
        const settings = GitHubStorage.getSettings();
        const url = `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${this.CONFIG_PATH}?ref=${settings.branch}`;
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'SiteConfig'
            }
        });
        
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('获取配置失败');
        }
        
        const data = await response.json();
        const content = atob(data.content);
        return JSON.parse(content);
    },

    /**
     * 保存站点配置到 GitHub
     */
    async saveConfig(config) {
        if (!GitHubStorage || !GitHubStorage.isConfigured()) {
            throw new Error('请先配置 GitHub 信息');
        }
        
        const settings = GitHubStorage.getSettings();
        const url = `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${this.CONFIG_PATH}`;
        
        // 获取现有文件的 SHA（如果存在）
        let sha = null;
        try {
            const existingResponse = await fetch(`${url}?ref=${settings.branch}`, {
                headers: {
                    'Authorization': `token ${settings.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (existingResponse.ok) {
                const existingData = await existingResponse.json();
                sha = existingData.sha;
            }
        } catch (e) {
            // 文件不存在，继续创建
        }
        
        // 保存配置
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(config, null, 2))));
        const body = {
            message: '更新站点配置',
            content: content,
            branch: settings.branch
        };
        if (sha) body.sha = sha;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${settings.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || '保存失败');
        }
        
        return true;
    }
};
