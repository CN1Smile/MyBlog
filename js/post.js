/**
 * 文章详情页 JavaScript
 * 
 * 演化路径说明：
 * - Phase 1（当前）：使用 Query String 方式 (post.html?slug=xxx)
 * - Phase 2（未来）：静态站点生成，每篇文章独立目录 (/posts/xxx/index.html)
 * 
 * 切换时只需修改 getSlugFromUrl() 函数的实现
 */

// 分类配置
const CATEGORIES = {
    css: { emoji: '🎨', label: 'CSS 魔法' },
    javascript: { emoji: '⚡', label: 'JavaScript' },
    tools: { emoji: '🛠️', label: '工具链' },
    design: { emoji: '✨', label: '设计思考' },
    tutorial: { emoji: '📖', label: '教程指南' },
    thinking: { emoji: '💭', label: '随想' },
    workflow: { emoji: '🔄', label: '工作流' }
};

// DOM 元素引用
const elements = {
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    article: document.getElementById('article'),
    title: document.getElementById('article-title'),
    date: document.getElementById('article-date'),
    author: document.getElementById('article-author'),
    readingTime: document.getElementById('article-reading-time'),
    category: document.getElementById('article-category'),
    content: document.getElementById('article-content'),
    prevPost: document.getElementById('prev-post'),
    nextPost: document.getElementById('next-post')
};

/**
 * 从 URL 获取文章 slug
 * 
 * Phase 1: 使用 Query String
 * Phase 2: 可改为解析路径 /posts/{slug}/
 */
function getSlugFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
}

/**
 * 生成文章 URL（用于上下篇导航）
 */
function getPostUrl(slug) {
    // Phase 1: Query String 方式
    return `post.html?slug=${slug}`;
    
    // Phase 2: 静态目录方式（未来切换时取消注释）
    // return `/posts/${slug}/`;
}

/**
 * 格式化日期
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 估算阅读时间（按中文平均阅读速度 400字/分钟）
 */
function estimateReadingTime(content) {
    // 移除 HTML 标签
    const text = content.replace(/<[^>]*>/g, '');
    const charCount = text.length;
    const minutes = Math.ceil(charCount / 400);
    return `${minutes} 分钟阅读`;
}

/**
 * 渲染分类标签
 */
function renderCategory(categoryKey) {
    const category = CATEGORIES[categoryKey];
    if (!category) return '';
    
    return `<span class="category-tag">
        <span class="category-emoji">${category.emoji}</span>
        <span class="category-label">${category.label}</span>
    </span>`;
}

/**
 * 显示加载状态
 */
function showLoading() {
    elements.loading.classList.remove('hidden');
    elements.error.classList.add('hidden');
    elements.article.classList.add('hidden');
}

/**
 * 显示错误状态
 */
function showError() {
    elements.loading.classList.add('hidden');
    elements.error.classList.remove('hidden');
    elements.article.classList.add('hidden');
    document.title = '文章未找到 - HENGHENG STUDIO';
}

/**
 * 显示文章内容
 */
function showArticle() {
    elements.loading.classList.add('hidden');
    elements.error.classList.add('hidden');
    elements.article.classList.remove('hidden');
}

/**
 * 渲染上下篇导航
 */
function renderNavigation(posts, currentIndex) {
    // 上一篇
    if (currentIndex > 0) {
        const prevPost = posts[currentIndex - 1];
        elements.prevPost.href = getPostUrl(prevPost.slug);
        elements.prevPost.querySelector('.nav-title').textContent = prevPost.title;
        elements.prevPost.classList.remove('hidden');
    }
    
    // 下一篇
    if (currentIndex < posts.length - 1) {
        const nextPost = posts[currentIndex + 1];
        elements.nextPost.href = getPostUrl(nextPost.slug);
        elements.nextPost.querySelector('.nav-title').textContent = nextPost.title;
        elements.nextPost.classList.remove('hidden');
    }
}

/**
 * 渲染文章
 */
function renderPost(post, posts, currentIndex) {
    // 设置页面标题
    document.title = `${post.title} - HENGHENG STUDIO`;
    
    // 填充文章信息
    elements.title.textContent = post.title;
    elements.date.textContent = formatDate(post.date);
    elements.author.textContent = post.author || '匿名作者';
    elements.readingTime.textContent = estimateReadingTime(post.content);
    elements.category.innerHTML = renderCategory(post.category);
    
    // 填充文章内容
    elements.content.innerHTML = post.content;
    
    // 渲染上下篇导航
    renderNavigation(posts, currentIndex);
    
    // 显示文章
    showArticle();
}

/**
 * 加载并显示文章
 */
async function loadPost() {
    const slug = getSlugFromUrl();
    
    // 没有 slug 参数
    if (!slug) {
        showError();
        return;
    }
    
    showLoading();
    
    try {
        // 获取所有文章
        const response = await fetch('data/posts.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const posts = data.posts || data; // 兼容两种格式
        
        // 查找当前文章
        const currentIndex = posts.findIndex(p => p.slug === slug);
        
        if (currentIndex === -1) {
            showError();
            return;
        }
        
        const post = posts[currentIndex];
        
        // 检查文章是否有内容
        if (!post.content) {
            console.warn('文章没有 content 字段，使用 excerpt 作为替代');
            post.content = `<p>${post.excerpt}</p>`;
        }
        
        // 渲染文章
        renderPost(post, posts, currentIndex);
        
        // 生成目录导航
        generateTOC();
        
        // 加载评论系统
        loadUtterances(post.slug);
        
    } catch (error) {
        console.error('加载文章失败:', error);
        showError();
    }
}

/**
 * 加载 Utterances 评论系统
 * @param {string} slug - 文章 slug，用于 issue 映射
 */
function loadUtterances(slug) {
    const container = document.getElementById('utterances-container');
    if (!container) return;
    
    // 清空容器（防止重复加载）
    container.innerHTML = '';
    
    // 创建 Utterances script
    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.setAttribute('repo', 'CN1Smile/Blog-comments');
    script.setAttribute('issue-term', 'pathname'); // 使用路径名作为 issue 标题
    script.setAttribute('theme', 'github-dark');   // 暗色主题
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;
    
    container.appendChild(script);
}

/**
 * 生成目录导航
 */
function generateTOC() {
    const tocSidebar = document.getElementById('toc-sidebar');
    const tocNav = document.getElementById('toc-nav');
    const tocToggle = document.getElementById('toc-toggle');
    const articleContent = document.getElementById('article-content');
    
    if (!articleContent || !tocNav) return;
    
    // 获取所有标题
    const headings = articleContent.querySelectorAll('h2, h3, h4');
    
    // 如果没有标题，隐藏目录
    if (headings.length === 0) {
        tocSidebar.classList.add('empty');
        return;
    }
    
    // 生成目录链接
    const tocHTML = Array.from(headings).map((heading, index) => {
        // 为标题添加 ID
        const id = `heading-${index}`;
        heading.id = id;
        
        const level = heading.tagName.toLowerCase();
        const text = heading.textContent;
        
        return `<a href="#${id}" class="toc-link toc-${level}" title="${text}">${text}</a>`;
    }).join('');
    
    tocNav.innerHTML = tocHTML;
    
    // 目录收起/展开
    tocToggle.addEventListener('click', () => {
        tocSidebar.classList.toggle('collapsed');
        const isCollapsed = tocSidebar.classList.contains('collapsed');
        tocToggle.title = isCollapsed ? '展开目录' : '收起目录';
    });
    
    // 点击链接平滑滚动
    tocNav.querySelectorAll('.toc-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // 滚动时高亮当前标题
    let ticking = false;
    const tocLinks = tocNav.querySelectorAll('.toc-link');
    
    function updateActiveLink() {
        const scrollPos = window.scrollY + 100;
        
        let activeIndex = 0;
        headings.forEach((heading, index) => {
            if (heading.offsetTop <= scrollPos) {
                activeIndex = index;
            }
        });
        
        tocLinks.forEach((link, index) => {
            link.classList.toggle('active', index === activeIndex);
        });
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateActiveLink);
            ticking = true;
        }
    });
    
    // 初始化高亮
    updateActiveLink();
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', loadPost);
