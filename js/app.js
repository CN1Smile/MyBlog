/**
 * ZHITONG'S BLOG - 博客首页
 */

// DOM 引用
const postsList = document.getElementById('posts-list');
const loadingElement = document.getElementById('loading');

// 存储所有文章数据（用于筛选）
let allPosts = [];
// 当前选中的分类
let currentCategory = '全部';

// 分类图标映射
const categoryIcons = {
    'openspec': { icon: '🔧', name: 'OpenSpec' },
    'css': { icon: '🎨', name: 'CSS' },
    'javascript': { icon: '⚡', name: 'JavaScript' },
    'workflow': { icon: '🔄', name: 'Workflow' },
    'design': { icon: '✨', name: '设计' },
    'ai': { icon: '🤖', name: 'AI' },
    'unity': { icon: '🎮', name: 'Unity' },
    'graphics': { icon: '🖼️', name: '图形学' },
    'default': { icon: '📄', name: '文章' }
};

/**
 * 获取文章分类信息
 */
function getPostCategory(slug, title) {
    if (slug.includes('openspec') || title.includes('OpenSpec')) return categoryIcons.openspec;
    if (slug.includes('css') || title.includes('CSS')) return categoryIcons.css;
    if (slug.includes('javascript') || slug.includes('async')) return categoryIcons.javascript;
    if (slug.includes('workflow') || title.includes('工作流')) return categoryIcons.workflow;
    if (slug.includes('design') || title.includes('设计')) return categoryIcons.design;
    if (slug.includes('ai') || title.includes('AI')) return categoryIcons.ai;
    if (slug.includes('unity') || title.includes('Unity')) return categoryIcons.unity;
    if (slug.includes('shader') || title.includes('渲染') || title.includes('图形')) return categoryIcons.graphics;
    return categoryIcons.default;
}

/**
 * 计算阅读时间
 */
function getReadingTime(summary) {
    const words = summary.length / 2;
    const minutes = Math.ceil(words / 200);
    return `${Math.max(1, minutes)} min read`;
}

/**
 * 格式化日期
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 创建文章列表项 HTML
 */
function createPostItem(post) {
    const category = getPostCategory(post.slug, post.title);
    const readingTime = getReadingTime(post.summary);
    
    return `
        <article class="post-item">
            <div class="post-item-content">
                <div class="post-item-meta">
                    <span class="post-item-date">发布日期：${formatDate(post.date)}</span>
                    <span>·</span>
                    <span>${readingTime}</span>
                </div>
                <h3 class="post-item-title">${post.title}</h3>
                <p class="post-item-desc">${post.summary}</p>
                <div class="post-item-footer">
                    <a href="post.html?slug=${post.slug}" class="post-item-link">阅读全文 ↗</a>
                </div>
            </div>
            <div class="post-item-visual">
                <div class="post-icon-tag">
                    <span>${category.icon}</span>
                    <span>${category.name}</span>
                </div>
            </div>
        </article>
    `;
}

/**
 * 渲染文章列表
 */
function renderPosts(posts) {
    const postsHTML = posts.map(createPostItem).join('');
    postsList.innerHTML = postsHTML;
}

/**
 * 显示加载状态
 */
function showLoading() {
    if (loadingElement) loadingElement.classList.remove('hidden');
    if (postsList) postsList.innerHTML = '';
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
    if (loadingElement) loadingElement.classList.add('hidden');
}

/**
 * 显示错误信息
 */
function showError(message) {
    postsList.innerHTML = `
        <div class="post-item" style="text-align: center; padding: 3rem;">
            <p style="font-size: 2rem; margin-bottom: 1rem;">😕</p>
            <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">${message}</p>
            <button onclick="loadPosts()" class="btn-primary">重试</button>
        </div>
    `;
}

/**
 * 加载站点配置并更新页面
 */
async function loadSiteConfig() {
    try {
        const response = await fetch('data/site-config.json');
        if (!response.ok) {
            console.log('使用默认配置');
            return;
        }
        
        const config = await response.json();
        applySiteConfig(config);
    } catch (error) {
        console.log('配置加载失败，使用默认配置:', error);
    }
}

/**
 * 应用站点配置到页面
 */
function applySiteConfig(config) {
    // 更新网站标题
    if (config.site?.title) {
        document.title = config.site.title;
    }
    
    // 更新 Logo
    const logoIcon = document.querySelector('.logo .logo-icon');
    const logoText = document.querySelector('.logo .logo-text');
    if (logoIcon && config.site?.logoIcon) logoIcon.textContent = config.site.logoIcon;
    if (logoText && config.site?.logoText) logoText.textContent = config.site.logoText;
    
    // 更新 Hero 区域
    const heroLabel = document.querySelector('.hero-label');
    const heroTitle = document.querySelector('.hero-title');
    const heroDesc = document.querySelector('.hero-description');
    
    if (heroLabel && config.site?.label) {
        heroLabel.textContent = `— ${config.site.label}`;
    }
    if (heroTitle && config.hero?.title) {
        heroTitle.innerHTML = config.hero.title;
    }
    if (heroDesc && config.hero?.description) {
        heroDesc.textContent = config.hero.description;
    }
    
    // 更新写作主题标签
    const heroTags = document.querySelector('.hero-tags');
    if (heroTags && config.hero?.topics) {
        const topicsHtml = config.hero.topics.map(t => `<span class="tag-item">${t}</span>`).join('');
        heroTags.innerHTML = `
            <span class="tag">✎ 写作主题：</span>
            ${topicsHtml}
            <span class="tag-divider">|</span>
            <span class="tag">${config.hero?.updateFrequency || '持续更新中'}</span>
        `;
    }
    
    // 更新按钮文字
    const primaryBtn = document.querySelector('.hero-actions .btn-primary');
    const secondaryBtn = document.querySelector('.hero-actions .btn-secondary');
    if (primaryBtn && config.hero?.primaryButton) primaryBtn.textContent = config.hero.primaryButton;
    if (secondaryBtn && config.hero?.secondaryButton) secondaryBtn.textContent = config.hero.secondaryButton;
    
    // 更新作者信息
    const authorAvatar = document.querySelector('.author-avatar');
    const authorName = document.querySelector('.author-name');
    if (authorAvatar && config.author?.avatarText) authorAvatar.textContent = config.author.avatarText;
    if (authorName && config.author?.name) authorName.textContent = config.author.name;
    
    // 更新侧边栏笔记卡片
    const noteTitle = document.querySelector('.note-card .card-title');
    const noteDesc = document.querySelector('.note-card .card-desc');
    const noteFootnote = document.querySelector('.note-card .card-footnote');
    if (noteTitle && config.latestNote?.title) noteTitle.textContent = config.latestNote.title;
    if (noteDesc && config.latestNote?.description) noteDesc.textContent = config.latestNote.description;
    if (noteFootnote && config.latestNote?.footnote) noteFootnote.textContent = config.latestNote.footnote;
    
    // 更新分类标签
    const filterTagsContainer = document.querySelector('.filter-tags');
    if (filterTagsContainer && config.categories) {
        filterTagsContainer.innerHTML = config.categories.map((cat, i) => 
            `<span class="filter-tag${i === 0 ? ' active' : ''}">${cat}</span>`
        ).join('');
        initFilterTags(); // 重新绑定事件
    }
    
    // 更新系列列表
    const seriesList = document.querySelector('.series-list');
    if (seriesList && config.series) {
        seriesList.innerHTML = config.series.map(s => `
            <li>
                <span class="series-name">${s.name}</span>
                <span class="series-progress">${s.progress}</span>
            </li>
        `).join('');
    }
    
    // 更新关于博客
    const aboutText = document.querySelector('.about-text');
    if (aboutText && config.about) aboutText.textContent = config.about;
}

/**
 * 获取文章的分类名称（用于筛选匹配）
 */
function getPostCategoryName(post) {
    const slug = post.slug || '';
    const title = post.title || '';
    const category = post.category || '';
    
    // 优先使用文章自身的 category 字段
    if (category) return category;
    
    // 否则根据 slug 和 title 推断
    if (slug.includes('unity') || title.includes('Unity')) return 'Unity 开发';
    if (slug.includes('shader') || title.includes('渲染') || title.includes('图形') || title.includes('Shader')) return '图形渲染';
    if (slug.includes('architecture') || title.includes('架构') || title.includes('设计模式')) return '游戏架构';
    if (slug.includes('art') || title.includes('美术') || title.includes('TA')) return '技术美术';
    if (slug.includes('devlog') || title.includes('日志') || title.includes('日记')) return '开发日志';
    
    return '其他';
}

/**
 * 根据分类筛选文章
 */
function filterPostsByCategory(categoryName) {
    if (categoryName === '全部') {
        return allPosts;
    }
    
    return allPosts.filter(post => {
        const postCategory = getPostCategoryName(post);
        // 支持模糊匹配（比如 "Unity" 匹配 "Unity 开发"）
        return postCategory.includes(categoryName) || categoryName.includes(postCategory);
    });
}

/**
 * 加载文章数据
 */
async function loadPosts() {
    showLoading();
    
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const response = await fetch('data/posts.json');
        
        if (!response.ok) {
            throw new Error('无法加载文章数据');
        }
        
        const data = await response.json();
        
        // 保存所有文章用于后续筛选
        allPosts = data.posts || [];
        
        hideLoading();
        
        // 根据当前选中分类渲染
        const filteredPosts = filterPostsByCategory(currentCategory);
        renderPosts(filteredPosts);
        
    } catch (error) {
        console.error('加载文章失败:', error);
        hideLoading();
        showError('加载文章失败，请稍后重试');
    }
}

/**
 * 显示无文章提示
 */
function showEmptyState(categoryName) {
    postsList.innerHTML = `
        <div class="post-item" style="text-align: center; padding: 3rem;">
            <p style="font-size: 2rem; margin-bottom: 1rem;">📭</p>
            <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">
                「${categoryName}」分类下暂无文章
            </p>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">
                试试其他分类，或点击「全部」查看所有文章
            </p>
        </div>
    `;
}

/**
 * 初始化筛选标签交互
 */
function initFilterTags() {
    const filterTags = document.querySelectorAll('.filter-tag');
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            // 更新样式
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            
            // 获取分类名并筛选
            const categoryName = tag.textContent.trim();
            currentCategory = categoryName;
            
            // 筛选并重新渲染
            const filteredPosts = filterPostsByCategory(categoryName);
            
            if (filteredPosts.length === 0) {
                showEmptyState(categoryName);
            } else {
                renderPosts(filteredPosts);
            }
        });
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadSiteConfig(); // 先加载站点配置
    loadPosts();
    initFilterTags();
});
