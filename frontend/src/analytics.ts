// =============================================
// CLICKBAY - ANALYTICS DASHBOARD
// Professional Dashboard Functionality
// =============================================

interface AnalyticsData {
    sentiment: {
        score: number;
        label: string;
        confidence: number;
        positive: number;
        neutral: number;
        negative: number;
    };
    keywords: Array<{
        word: string;
        size: 'xl' | 'lg' | 'md' | 'sm' | 'xs';
        frequency: number;
    }>;
    entities: {
        people: Array<{ name: string; initials: string; mentions: number }>;
        places: Array<{ name: string; initials: string; mentions: number }>;
        organizations: Array<{ name: string; initials: string; mentions: number }>;
    };
    topics: Array<{
        name: string;
        percentage: number;
        color: string;
    }>;
    social: {
        likes: number;
        comments: number;
        shares: number;
        views: number;
        engagementRate: number;
    };
    content: {
        summary: string;
        wordCount: number;
        sentenceCount: number;
        readTime: string;
    };
    stats: {
        totalViews: string;
        totalEngagement: string;
        sentimentScore: string;
        keywordsFound: number;
    };
}

// DOM Elements
let analyzeBtn: HTMLElement | null;
let urlInput: HTMLInputElement | null;
let loadingOverlay: HTMLElement | null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    loadSampleData();
});

function initializeDashboard(): void {
    // Get DOM elements
    analyzeBtn = document.getElementById('analyzeBtn');
    urlInput = document.getElementById('analyzeUrl') as HTMLInputElement;
    loadingOverlay = document.getElementById('loadingOverlay');

    // Set up event listeners
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', handleAnalyze);
    }

    if (urlInput) {
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAnalyze();
            }
        });
    }

    // Sample chips
    document.querySelectorAll('.sample-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLElement;
            const url = target.dataset.url;
            if (url && urlInput) {
                urlInput.value = url;
                handleAnalyze();
            }
        });
    });

    // Sidebar navigation
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            (e.currentTarget as HTMLElement).classList.add('active');
        });
    });

    // Chart tabs
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
            (e.currentTarget as HTMLElement).classList.add('active');
            animateChartBars();
        });
    });

    // Entity tabs
    document.querySelectorAll('.entity-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.entity-tab').forEach(t => t.classList.remove('active'));
            (e.currentTarget as HTMLElement).classList.add('active');
        });
    });

    // Action buttons
    document.getElementById('refreshBtn')?.addEventListener('click', () => {
        showNotification('Refreshing data...', 'info');
        loadSampleData();
    });

    document.getElementById('exportBtn')?.addEventListener('click', () => {
        showNotification('Export feature coming soon!', 'info');
    });

    document.getElementById('settingsBtn')?.addEventListener('click', () => {
        showNotification('Settings panel coming soon!', 'info');
    });
}

function handleAnalyze(): void {
    const url = urlInput?.value.trim();

    if (!url) {
        showNotification('Please enter a URL to analyze', 'error');
        return;
    }

    if (!isValidUrl(url)) {
        showNotification('Please enter a valid URL', 'error');
        return;
    }

    analyzeContent(url);
}

function analyzeContent(url: string): void {
    showLoading(true);

    let step = 1;
    const totalSteps = 5;
    let progress = 0;

    const stepInterval = setInterval(() => {
        progress += 20;
        updateLoadingProgress(progress);
        updateLoadingStep(step);
        step++;

        if (step > totalSteps) {
            clearInterval(stepInterval);

            setTimeout(() => {
                const data = generateMockData(url);
                updateDashboard(data);
                showLoading(false);
                showNotification('Analysis complete!', 'success');
            }, 500);
        }
    }, 600);
}

function generateMockData(url: string): AnalyticsData {
    const urlType = getUrlType(url);

    const dataTemplates: Record<string, AnalyticsData> = {
        tech: {
            sentiment: {
                score: 78,
                label: 'Positive',
                confidence: 85,
                positive: 65,
                neutral: 25,
                negative: 10
            },
            keywords: [
                { word: 'artificial intelligence', size: 'xl', frequency: 12 },
                { word: 'machine learning', size: 'lg', frequency: 9 },
                { word: 'automation', size: 'lg', frequency: 8 },
                { word: 'innovation', size: 'md', frequency: 6 },
                { word: 'technology', size: 'md', frequency: 5 },
                { word: 'data science', size: 'sm', frequency: 4 },
                { word: 'analytics', size: 'sm', frequency: 3 },
                { word: 'cloud', size: 'sm', frequency: 3 },
                { word: 'security', size: 'xs', frequency: 2 },
                { word: 'blockchain', size: 'xs', frequency: 2 }
            ],
            entities: {
                people: [
                    { name: 'Elon Musk', initials: 'EM', mentions: 8 },
                    { name: 'Sundar Pichai', initials: 'SP', mentions: 5 },
                    { name: 'Jeff Bezos', initials: 'JB', mentions: 3 }
                ],
                places: [
                    { name: 'Silicon Valley', initials: 'SV', mentions: 6 },
                    { name: 'San Francisco', initials: 'SF', mentions: 4 },
                    { name: 'Seattle', initials: 'SE', mentions: 2 }
                ],
                organizations: [
                    { name: 'Google', initials: 'GO', mentions: 7 },
                    { name: 'Microsoft', initials: 'MS', mentions: 5 },
                    { name: 'Apple', initials: 'AP', mentions: 4 }
                ]
            },
            topics: [
                { name: 'AI & ML', percentage: 35, color: '#3b82f6' },
                { name: 'Technology', percentage: 25, color: '#10b981' },
                { name: 'Business', percentage: 20, color: '#f59e0b' },
                { name: 'Innovation', percentage: 20, color: '#8b5cf6' }
            ],
            social: {
                likes: 1247,
                comments: 89,
                shares: 234,
                views: 15420,
                engagementRate: 8.2
            },
            content: {
                summary: 'This article discusses the latest advancements in artificial intelligence and machine learning technologies, exploring their potential impact on various industries. The content highlights key developments in automation, digital transformation, and data science, with insights from industry leaders.',
                wordCount: 1247,
                sentenceCount: 89,
                readTime: '6 min'
            },
            stats: {
                totalViews: '15,420',
                totalEngagement: '2,847',
                sentimentScore: '78%',
                keywordsFound: 42
            }
        },
        blog: {
            sentiment: {
                score: 72,
                label: 'Positive',
                confidence: 78,
                positive: 58,
                neutral: 32,
                negative: 10
            },
            keywords: [
                { word: 'personal development', size: 'xl', frequency: 10 },
                { word: 'growth mindset', size: 'lg', frequency: 8 },
                { word: 'productivity', size: 'lg', frequency: 7 },
                { word: 'motivation', size: 'md', frequency: 5 },
                { word: 'success', size: 'md', frequency: 4 },
                { word: 'habits', size: 'sm', frequency: 3 },
                { word: 'goals', size: 'sm', frequency: 3 },
                { word: 'mindfulness', size: 'xs', frequency: 2 }
            ],
            entities: {
                people: [
                    { name: 'James Clear', initials: 'JC', mentions: 5 },
                    { name: 'Tim Ferriss', initials: 'TF', mentions: 4 },
                    { name: 'Cal Newport', initials: 'CN', mentions: 3 }
                ],
                places: [
                    { name: 'New York', initials: 'NY', mentions: 3 },
                    { name: 'London', initials: 'LO', mentions: 2 }
                ],
                organizations: [
                    { name: 'Harvard', initials: 'HA', mentions: 4 },
                    { name: 'MIT', initials: 'MT', mentions: 2 }
                ]
            },
            topics: [
                { name: 'Personal Growth', percentage: 40, color: '#3b82f6' },
                { name: 'Productivity', percentage: 30, color: '#10b981' },
                { name: 'Motivation', percentage: 20, color: '#f59e0b' },
                { name: 'Lifestyle', percentage: 10, color: '#8b5cf6' }
            ],
            social: {
                likes: 856,
                comments: 67,
                shares: 145,
                views: 9876,
                engagementRate: 6.8
            },
            content: {
                summary: 'A comprehensive guide to personal development and productivity, offering practical strategies for achieving goals and maintaining work-life balance. The author shares valuable insights on building habits and cultivating a growth mindset.',
                wordCount: 986,
                sentenceCount: 67,
                readTime: '5 min'
            },
            stats: {
                totalViews: '9,876',
                totalEngagement: '1,068',
                sentimentScore: '72%',
                keywordsFound: 28
            }
        },
        social: {
            sentiment: {
                score: 65,
                label: 'Neutral',
                confidence: 72,
                positive: 45,
                neutral: 40,
                negative: 15
            },
            keywords: [
                { word: 'trending', size: 'xl', frequency: 15 },
                { word: 'viral', size: 'lg', frequency: 12 },
                { word: 'engagement', size: 'lg', frequency: 10 },
                { word: 'content', size: 'md', frequency: 8 },
                { word: 'marketing', size: 'md', frequency: 6 },
                { word: 'audience', size: 'sm', frequency: 4 },
                { word: 'brand', size: 'sm', frequency: 3 },
                { word: 'reach', size: 'xs', frequency: 2 }
            ],
            entities: {
                people: [
                    { name: 'Content Creator', initials: 'CC', mentions: 6 },
                    { name: 'Influencer', initials: 'IN', mentions: 4 }
                ],
                places: [
                    { name: 'Los Angeles', initials: 'LA', mentions: 5 },
                    { name: 'Miami', initials: 'MI', mentions: 3 }
                ],
                organizations: [
                    { name: 'Instagram', initials: 'IG', mentions: 8 },
                    { name: 'TikTok', initials: 'TK', mentions: 6 },
                    { name: 'Twitter', initials: 'TW', mentions: 5 }
                ]
            },
            topics: [
                { name: 'Social Media', percentage: 45, color: '#3b82f6' },
                { name: 'Marketing', percentage: 25, color: '#10b981' },
                { name: 'Content', percentage: 20, color: '#f59e0b' },
                { name: 'Trends', percentage: 10, color: '#8b5cf6' }
            ],
            social: {
                likes: 2156,
                comments: 178,
                shares: 456,
                views: 28901,
                engagementRate: 12.3
            },
            content: {
                summary: 'Social media trending content analysis showing viral patterns and engagement metrics. The feed captures real-time reactions and discussions across multiple platforms.',
                wordCount: 423,
                sentenceCount: 34,
                readTime: '2 min'
            },
            stats: {
                totalViews: '28,901',
                totalEngagement: '2,790',
                sentimentScore: '65%',
                keywordsFound: 35
            }
        }
    };

    const result = dataTemplates[urlType] ?? dataTemplates['tech'];
    return result as AnalyticsData;
}

function getUrlType(url: string): string {
    if (url.includes('tech') || url.includes('techcrunch')) return 'tech';
    if (url.includes('blog') || url.includes('medium')) return 'blog';
    if (url.includes('social') || url.includes('twitter') || url.includes('trending')) return 'social';
    return 'tech';
}

function updateDashboard(data: AnalyticsData): void {
    // Update stats cards
    updateElement('totalViews', data.stats.totalViews);
    updateElement('totalEngagement', data.stats.totalEngagement);
    updateElement('sentimentScore', data.stats.sentimentScore);
    updateElement('keywordsFound', data.stats.keywordsFound.toString());

    // Update sentiment
    updateSentiment(data.sentiment);

    // Update keywords
    updateKeywords(data.keywords);

    // Update entities
    updateEntities(data.entities);

    // Update social metrics
    updateSocialMetrics(data.social);

    // Update content summary
    updateContentSummary(data.content);

    // Animate elements
    animateChartBars();
}

function updateElement(id: string, value: string): void {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function updateSentiment(sentiment: AnalyticsData['sentiment']): void {
    // Update badge
    const badge = document.getElementById('sentimentBadge');
    if (badge) {
        badge.textContent = sentiment.label;
        badge.className = `panel-badge ${sentiment.label.toLowerCase()}`;
    }

    // Update gauge
    const gaugeValue = document.getElementById('gaugeValue');
    if (gaugeValue) {
        gaugeValue.textContent = `${sentiment.score}%`;
    }

    // Update breakdown bars
    const breakdowns = document.querySelectorAll('.breakdown-item');
    if (breakdowns.length >= 3) {
        const bar0 = breakdowns[0]?.querySelector('.breakdown-bar') as HTMLElement | null;
        const val0 = breakdowns[0]?.querySelector('.breakdown-value') as HTMLElement | null;
        if (bar0) bar0.style.width = `${sentiment.positive}%`;
        if (val0) val0.textContent = `${sentiment.positive}%`;

        const bar1 = breakdowns[1]?.querySelector('.breakdown-bar') as HTMLElement | null;
        const val1 = breakdowns[1]?.querySelector('.breakdown-value') as HTMLElement | null;
        if (bar1) bar1.style.width = `${sentiment.neutral}%`;
        if (val1) val1.textContent = `${sentiment.neutral}%`;

        const bar2 = breakdowns[2]?.querySelector('.breakdown-bar') as HTMLElement | null;
        const val2 = breakdowns[2]?.querySelector('.breakdown-value') as HTMLElement | null;
        if (bar2) bar2.style.width = `${sentiment.negative}%`;
        if (val2) val2.textContent = `${sentiment.negative}%`;
    }
}

function updateKeywords(keywords: AnalyticsData['keywords']): void {
    const cloud = document.getElementById('keywordsCloud');
    if (!cloud) return;

    cloud.innerHTML = keywords.map(k => 
        `<span class="keyword-bubble size-${k.size}">${k.word}</span>`
    ).join('');
}

function updateEntities(entities: AnalyticsData['entities']): void {
    const list = document.getElementById('entityList');
    if (!list) return;

    const activeTabEl = document.querySelector('.entity-tab.active') as HTMLElement | null;
    const activeTab = activeTabEl?.dataset?.type || 'people';
    const entityData = entities[activeTab as keyof typeof entities] ?? entities.people;

    list.innerHTML = entityData.map(e => `
        <div class="entity-item">
            <div class="entity-avatar">${e.initials}</div>
            <div class="entity-info">
                <span class="entity-name">${e.name}</span>
                <span class="entity-mentions">${e.mentions} mentions</span>
            </div>
        </div>
    `).join('');
}

function updateSocialMetrics(social: AnalyticsData['social']): void {
    updateElement('likesCount', formatNumber(social.likes));
    updateElement('commentsCount', social.comments.toString());
    updateElement('sharesCount', social.shares.toString());
    updateElement('viewsCount', formatNumber(social.views));
    updateElement('engagementRate', `${social.engagementRate}%`);

    const engagementFill = document.getElementById('engagementFill');
    if (engagementFill) {
        engagementFill.style.width = `${Math.min(social.engagementRate * 10, 100)}%`;
    }
}

function updateContentSummary(content: AnalyticsData['content']): void {
    updateElement('summaryText', content.summary);
    updateElement('wordCount', formatNumber(content.wordCount));
    updateElement('sentenceCount', content.sentenceCount.toString());
    updateElement('readTime', content.readTime);
}

function animateChartBars(): void {
    const bars = document.querySelectorAll('.chart-bar');
    bars.forEach((bar, index) => {
        const heights = [45, 68, 52, 85, 73, 42, 58];
        const randomOffset = Math.random() * 20 - 10;
        const baseHeight = heights[index] ?? 50;
        const height = Math.max(20, Math.min(95, baseHeight + randomOffset));
        (bar as HTMLElement).style.setProperty('--height', `${height}%`);
    });
}

function showLoading(show: boolean): void {
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
    if (show) {
        updateLoadingProgress(0);
        resetLoadingSteps();
    }
}

function updateLoadingProgress(percent: number): void {
    const progressBar = document.getElementById('loadingProgress');
    if (progressBar) {
        progressBar.style.width = `${percent}%`;
    }
}

function updateLoadingStep(step: number): void {
    for (let i = 1; i <= 5; i++) {
        const stepEl = document.getElementById(`step${i}`);
        if (stepEl) {
            if (i < step) {
                stepEl.classList.add('active');
                const icon = stepEl.querySelector('i');
                if (icon) icon.textContent = 'check_circle';
            } else if (i === step) {
                stepEl.classList.add('active');
                const icon = stepEl.querySelector('i');
                if (icon) icon.textContent = 'pending';
            }
        }
    }
}

function resetLoadingSteps(): void {
    for (let i = 1; i <= 5; i++) {
        const stepEl = document.getElementById(`step${i}`);
        if (stepEl) {
            stepEl.classList.remove('active');
            const icon = stepEl.querySelector('i');
            if (icon) icon.textContent = 'radio_button_unchecked';
        }
    }
}

function loadSampleData(): void {
    setTimeout(() => {
        const data = generateMockData('https://techcrunch.com/article');
        updateDashboard(data);
    }, 500);
}

function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Remove existing notifications
    document.querySelectorAll('.dashboard-notification').forEach(el => el.remove());

    const notification = document.createElement('div');
    notification.className = `dashboard-notification ${type}`;
    notification.innerHTML = `
        <i class="material-icons">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</i>
        <span>${message}</span>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
        font-size: 0.9rem;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

function isValidUrl(string: string): boolean {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

// Add CSS keyframes for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Export for module usage
export { analyzeContent, generateMockData, updateDashboard };