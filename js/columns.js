/**
 * 专栏页面逻辑
 */

// DOM 元素
const elements = {
    columnsListView: document.getElementById('columnsListView'),
    columnView: document.getElementById('columnView'),
    loadingState: document.getElementById('loadingState'),
    columnsGrid: document.getElementById('columnsGrid'),
    emptyState: document.getElementById('emptyState'),
    columnIcon: document.getElementById('columnIcon'),
    columnName: document.getElementById('columnName'),
    columnDesc: document.getElementById('columnDesc'),
    columnPosts: document.getElementById('columnPosts'),
    columnEmpty: document.getElementById('columnEmpty')
};

// 所有文章缓存
let allPosts = [];
let allColumns = [];

/**
 * 初始化
 */
async function init() {
    // 检查 URL 参数
    const params = new URLSearchParams(window.location.search);
    const columnSlug = params.get('column');
    
    if (columnSlug) {
        await showColumnView(columnSlug);
    } else {
        await loadColumnsView();
    }
}

/**
 * 加载专栏列表视图
 */
async function loadColumnsView() {
    elements.columnsListView.style.display = 'block';
    elements.columnView.classList.remove('active');
    
    try {
        // 并行加载专栏和文章
        const [columns, posts] = await Promise.all([
            fetchColumns(),
            fetchPosts()
        ]);
        
        allColumns = columns;
        allPosts = posts;
        
        elements.loadingState.style.display = 'none';
        
        if (columns.length === 0) {
            elements.emptyState.style.display = 'block';
            elements.columnsGrid.style.display = 'none';
        } else {
            elements.emptyState.style.display = 'none';
            elements.columnsGrid.style.display = 'grid';
            renderColumnsGrid(columns, posts);
        }
    } catch (error) {
        console.error('加载专栏失败:', error);
        elements.loadingState.innerHTML = '<p>加载失败，请刷新重试</p>';
    }
}

/**
 * 获取专栏列表
 */
async function fetchColumns() {
    try {
        // 优先从远程获取
        if (GitHubStorage && GitHubStorage.isConfigured()) {
            return await GitHubStorage.getColumns();
        }
    } catch (e) {
        console.log('从 GitHub 获取专栏失败');
    }
    
    // 从本地获取
    try {
        const response = await fetch('data/columns.json');
        if (response.ok) {
            const data = await response.json();
            return data.columns || [];
        }
    } catch (e) {
        console.log('从本地获取专栏失败');
    }
    
    return [];
}

/**
 * 获取文章列表
 */
async function fetchPosts() {
    try {
        const response = await fetch('data/posts.json');
        if (response.ok) {
            const data = await response.json();
            return data.posts || [];
        }
    } catch (e) {
        console.log('获取文章失败');
    }
    return [];
}

/**
 * 渲染专栏网格
 */
function renderColumnsGrid(columns, posts) {
    // 计算每个专栏的文章数
    const columnCounts = {};
    posts.forEach(post => {
        if (post.column) {
            columnCounts[post.column] = (columnCounts[post.column] || 0) + 1;
        }
    });
    
    const html = columns.map(column => {
        const count = columnCounts[column.slug] || 0;
        return `
            <a href="columns.html?column=${column.slug}" class="column-card">
                <div class="column-icon">${column.icon || '📁'}</div>
                <div class="column-name">${column.name}</div>
                <div class="column-description">${column.description || '暂无描述'}</div>
                <div class="column-stats">
                    <span><span class="count">${count}</span> 篇文章</span>
                </div>
            </a>
        `;
    }).join('');
    
    elements.columnsGrid.innerHTML = html;
}

/**
 * 显示专栏详情视图
 */
async function showColumnView(columnSlug) {
    elements.columnsListView.style.display = 'none';
    elements.columnView.classList.add('active');
    
    try {
        // 加载数据
        const [columns, posts] = await Promise.all([
            fetchColumns(),
            fetchPosts()
        ]);
        
        allColumns = columns;
        allPosts = posts;
        
        // 查找专栏
        const column = columns.find(c => c.slug === columnSlug);
        if (!column) {
            elements.columnName.textContent = '专栏不存在';
            elements.columnDesc.textContent = '';
            elements.columnIcon.textContent = '❓';
            elements.columnPosts.innerHTML = '';
            elements.columnEmpty.style.display = 'block';
            return;
        }
        
        // 显示专栏信息
        elements.columnIcon.textContent = column.icon || '📁';
        elements.columnName.textContent = column.name;
        elements.columnDesc.textContent = column.description || '';
        
        // 筛选该专栏的文章
        const columnPosts = posts.filter(p => p.column === columnSlug);
        
        if (columnPosts.length === 0) {
            elements.columnPosts.innerHTML = '';
            elements.columnEmpty.style.display = 'block';
        } else {
            elements.columnEmpty.style.display = 'none';
            renderColumnPosts(columnPosts);
        }
    } catch (error) {
        console.error('加载专栏详情失败:', error);
    }
}

/**
 * 渲染专栏文章列表
 */
function renderColumnPosts(posts) {
    const html = posts.map(post => {
        const date = new Date(post.date).toLocaleDateString('zh-CN');
        return `
            <div class="post-item">
                <div class="post-info">
                    <h3><a href="post.html?slug=${post.slug}">${post.title}</a></h3>
                    <div class="post-meta">${date} · ${post.summary || ''}</div>
                </div>
                <div class="post-actions">
                    <a href="post.html?slug=${post.slug}">阅读 →</a>
                </div>
            </div>
        `;
    }).join('');
    
    elements.columnPosts.innerHTML = html;
}

/**
 * 格式化日期
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 初始化
document.addEventListener('DOMContentLoaded', init);
