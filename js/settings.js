/**
 * 站点设置页面逻辑
 */

// 编辑器密码
const EDITOR_PASSWORD = '123456';

// 当前配置
let currentConfig = null;

// DOM 元素
const elements = {
    authOverlay: document.getElementById('authOverlay'),
    authForm: document.getElementById('authForm'),
    authPassword: document.getElementById('authPassword'),
    authError: document.getElementById('authError'),
    loadingState: document.getElementById('loadingState'),
    settingsContent: document.getElementById('settingsContent'),
    toast: document.getElementById('toast'),
    
    // 基本信息
    siteTitle: document.getElementById('siteTitle'),
    logoIcon: document.getElementById('logoIcon'),
    logoText: document.getElementById('logoText'),
    siteLabel: document.getElementById('siteLabel'),
    
    // Hero 区域
    heroTitle: document.getElementById('heroTitle'),
    heroDescription: document.getElementById('heroDescription'),
    topicsContainer: document.getElementById('topicsContainer'),
    topicsInput: document.getElementById('topicsInput'),
    updateFrequency: document.getElementById('updateFrequency'),
    primaryButton: document.getElementById('primaryButton'),
    secondaryButton: document.getElementById('secondaryButton'),
    
    // 作者信息
    authorName: document.getElementById('authorName'),
    authorAvatar: document.getElementById('authorAvatar'),
    
    // 分类
    categoriesContainer: document.getElementById('categoriesContainer'),
    categoriesInput: document.getElementById('categoriesInput'),
    
    // 系列
    seriesList: document.getElementById('seriesList'),
    addSeriesBtn: document.getElementById('addSeriesBtn'),
    
    // 关于
    aboutText: document.getElementById('aboutText'),
    
    // 侧边栏笔记
    noteTitle: document.getElementById('noteTitle'),
    noteDescription: document.getElementById('noteDescription'),
    noteFootnote: document.getElementById('noteFootnote'),
    
    // 操作按钮
    btnReset: document.getElementById('btnReset'),
    btnGithubSettings: document.getElementById('btnGithubSettings'),
    btnSave: document.getElementById('btnSave'),
    
    // GitHub 配置
    githubOverlay: document.getElementById('githubOverlay'),
    githubForm: document.getElementById('githubForm'),
    githubToken: document.getElementById('githubToken'),
    githubOwner: document.getElementById('githubOwner'),
    githubRepo: document.getElementById('githubRepo'),
    githubBranch: document.getElementById('githubBranch'),
    btnCloseGithub: document.getElementById('btnCloseGithub')
};

// 标签数据
let topicsTags = [];
let categoriesTags = [];

/**
 * 初始化
 */
function init() {
    checkAuth();
    setupEventListeners();
}

/**
 * 检查授权
 */
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('editor_authenticated') === 'true';
    if (isAuthenticated) {
        elements.authOverlay.style.display = 'none';
        loadConfig();
    } else {
        elements.authOverlay.style.display = 'flex';
    }
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // 密码验证
    elements.authForm.addEventListener('submit', handleAuth);
    
    // 保存配置
    elements.btnSave.addEventListener('click', saveConfig);
    
    // 重置配置
    elements.btnReset.addEventListener('click', resetConfig);
    
    // GitHub 设置
    elements.btnGithubSettings.addEventListener('click', () => {
        loadGithubSettings();
        elements.githubOverlay.classList.remove('hidden');
    });
    elements.btnCloseGithub.addEventListener('click', () => {
        elements.githubOverlay.classList.add('hidden');
    });
    elements.githubForm.addEventListener('submit', saveGithubSettings);
    
    // 标签输入
    elements.topicsInput.addEventListener('keydown', (e) => handleTagInput(e, 'topics'));
    elements.categoriesInput.addEventListener('keydown', (e) => handleTagInput(e, 'categories'));
    
    // 添加系列
    elements.addSeriesBtn.addEventListener('click', addSeriesItem);
}

/**
 * 处理密码验证
 */
function handleAuth(e) {
    e.preventDefault();
    const password = elements.authPassword.value;
    
    if (password === EDITOR_PASSWORD) {
        sessionStorage.setItem('editor_authenticated', 'true');
        elements.authOverlay.style.display = 'none';
        loadConfig();
    } else {
        elements.authError.textContent = '密码错误，请重试';
        elements.authPassword.value = '';
        elements.authPassword.focus();
    }
}

/**
 * 加载配置
 */
async function loadConfig() {
    try {
        currentConfig = await SiteConfig.getConfig();
        populateForm(currentConfig);
        elements.loadingState.style.display = 'none';
        elements.settingsContent.style.display = 'block';
    } catch (error) {
        console.error('加载配置失败:', error);
        showToast('加载配置失败', 'error');
    }
}

/**
 * 填充表单
 */
function populateForm(config) {
    // 基本信息
    elements.siteTitle.value = config.site?.title || '';
    elements.logoIcon.value = config.site?.logoIcon || '';
    elements.logoText.value = config.site?.logoText || '';
    elements.siteLabel.value = config.site?.label || '';
    
    // Hero 区域
    elements.heroTitle.value = config.hero?.title || '';
    elements.heroDescription.value = config.hero?.description || '';
    elements.updateFrequency.value = config.hero?.updateFrequency || '';
    elements.primaryButton.value = config.hero?.primaryButton || '';
    elements.secondaryButton.value = config.hero?.secondaryButton || '';
    
    // 写作主题标签
    topicsTags = config.hero?.topics || [];
    renderTags('topics');
    
    // 作者信息
    elements.authorName.value = config.author?.name || '';
    elements.authorAvatar.value = config.author?.avatarText || '';
    
    // 分类标签
    categoriesTags = config.categories || [];
    renderTags('categories');
    
    // 系列
    renderSeriesList(config.series || []);
    
    // 关于
    elements.aboutText.value = config.about || '';
    
    // 侧边栏笔记
    elements.noteTitle.value = config.latestNote?.title || '';
    elements.noteDescription.value = config.latestNote?.description || '';
    elements.noteFootnote.value = config.latestNote?.footnote || '';
}

/**
 * 渲染标签
 */
function renderTags(type) {
    const container = type === 'topics' ? elements.topicsContainer : elements.categoriesContainer;
    const input = type === 'topics' ? elements.topicsInput : elements.categoriesInput;
    const tags = type === 'topics' ? topicsTags : categoriesTags;
    
    // 清除现有标签（保留输入框）
    const existingTags = container.querySelectorAll('.tag-item');
    existingTags.forEach(tag => tag.remove());
    
    // 添加标签
    tags.forEach((tag, index) => {
        const tagEl = document.createElement('span');
        tagEl.className = 'tag-item';
        tagEl.innerHTML = `
            ${tag}
            <button type="button" data-index="${index}">&times;</button>
        `;
        tagEl.querySelector('button').addEventListener('click', () => removeTag(type, index));
        container.insertBefore(tagEl, input);
    });
}

/**
 * 处理标签输入
 */
function handleTagInput(e, type) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const input = type === 'topics' ? elements.topicsInput : elements.categoriesInput;
        const value = input.value.trim();
        
        if (value) {
            if (type === 'topics') {
                topicsTags.push(value);
            } else {
                categoriesTags.push(value);
            }
            input.value = '';
            renderTags(type);
        }
    }
}

/**
 * 移除标签
 */
function removeTag(type, index) {
    if (type === 'topics') {
        topicsTags.splice(index, 1);
    } else {
        categoriesTags.splice(index, 1);
    }
    renderTags(type);
}

/**
 * 渲染系列列表
 */
function renderSeriesList(series) {
    elements.seriesList.innerHTML = '';
    series.forEach((item, index) => {
        addSeriesItem(item.name, item.progress, index);
    });
}

/**
 * 添加系列项
 */
function addSeriesItem(name = '', progress = '', index = null) {
    const item = document.createElement('div');
    item.className = 'series-item';
    item.innerHTML = `
        <input type="text" class="series-name" placeholder="系列名称" value="${name}">
        <input type="text" class="series-progress" placeholder="进度描述" value="${progress}">
        <button type="button" class="remove-series">×</button>
    `;
    item.querySelector('.remove-series').addEventListener('click', () => {
        item.remove();
    });
    elements.seriesList.appendChild(item);
}

/**
 * 收集表单数据
 */
function collectFormData() {
    // 收集系列数据
    const seriesItems = elements.seriesList.querySelectorAll('.series-item');
    const series = [];
    seriesItems.forEach(item => {
        const name = item.querySelector('.series-name').value.trim();
        const progress = item.querySelector('.series-progress').value.trim();
        if (name) {
            series.push({ name, progress });
        }
    });
    
    return {
        site: {
            title: elements.siteTitle.value.trim(),
            logoIcon: elements.logoIcon.value.trim(),
            logoText: elements.logoText.value.trim(),
            label: elements.siteLabel.value.trim()
        },
        hero: {
            title: elements.heroTitle.value.trim(),
            description: elements.heroDescription.value.trim(),
            topics: [...topicsTags],
            updateFrequency: elements.updateFrequency.value.trim(),
            primaryButton: elements.primaryButton.value.trim(),
            secondaryButton: elements.secondaryButton.value.trim()
        },
        author: {
            name: elements.authorName.value.trim(),
            avatarText: elements.authorAvatar.value.trim()
        },
        categories: [...categoriesTags],
        series: series,
        about: elements.aboutText.value.trim(),
        latestNote: {
            title: elements.noteTitle.value.trim(),
            description: elements.noteDescription.value.trim(),
            tags: currentConfig?.latestNote?.tags || [],
            footnote: elements.noteFootnote.value.trim()
        }
    };
}

/**
 * 保存配置
 */
async function saveConfig() {
    const btn = elements.btnSave;
    const originalText = btn.textContent;
    
    try {
        btn.disabled = true;
        btn.textContent = '保存中...';
        
        const config = collectFormData();
        await SiteConfig.saveConfig(config);
        
        showToast('配置保存成功！刷新首页查看效果', 'success');
        currentConfig = config;
    } catch (error) {
        console.error('保存失败:', error);
        showToast('保存失败: ' + error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

/**
 * 重置配置
 */
function resetConfig() {
    if (confirm('确定要重置为默认配置吗？这将覆盖你的所有修改。')) {
        currentConfig = SiteConfig.defaultConfig;
        populateForm(currentConfig);
        showToast('已重置为默认配置', 'success');
    }
}

/**
 * 加载 GitHub 设置
 */
function loadGithubSettings() {
    const settings = GitHubStorage.getSettings();
    elements.githubToken.value = settings.token || '';
    elements.githubOwner.value = settings.owner || '';
    elements.githubRepo.value = settings.repo || '';
    elements.githubBranch.value = settings.branch || 'main';
}

/**
 * 保存 GitHub 设置
 */
function saveGithubSettings(e) {
    e.preventDefault();
    
    const settings = {
        token: elements.githubToken.value.trim(),
        owner: elements.githubOwner.value.trim(),
        repo: elements.githubRepo.value.trim(),
        branch: elements.githubBranch.value.trim() || 'main'
    };
    
    GitHubStorage.saveSettings(settings);
    elements.githubOverlay.classList.add('hidden');
    showToast('GitHub 配置已保存', 'success');
}

/**
 * 显示 Toast 提示
 */
function showToast(message, type = 'info') {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// 初始化
document.addEventListener('DOMContentLoaded', init);
