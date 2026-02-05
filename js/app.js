/**
 * HENGHENG STUDIO - 博客首页
 */

// DOM 引用
const postsList = document.getElementById('posts-list');
const loadingElement = document.getElementById('loading');

// 分类图标映射
const categoryIcons = {
    'openspec': { icon: '🔧', name: 'OpenSpec' },
    'css': { icon: '🎨', name: 'CSS' },
    'javascript': { icon: '⚡', name: 'JavaScript' },
    'workflow': { icon: '�', name: 'Workflow' },
    'design': { icon: '✨', name: '设计' },
    'ai': { icon: '🤖', name: 'AI' },
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
        
        hideLoading();
        renderPosts(data.posts);
        
    } catch (error) {
        console.error('加载文章失败:', error);
        hideLoading();
        showError('加载文章失败，请稍后重试');
    }
}

/**
 * 初始化筛选标签交互
 */
function initFilterTags() {
    const filterTags = document.querySelectorAll('.filter-tag');
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
        });
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    initFilterTags();
});