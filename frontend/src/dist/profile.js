// Profile/Dashboard page functionality
// Get current user from localStorage
function getCurrentUser() {
    try {
        const user = localStorage.getItem('clickbay_current_user');
        return user ? JSON.parse(user) : null;
    }
    catch {
        return null;
    }
}
// Check if user is logged in, redirect if not
function checkAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    // Populate user information
    populateUserInfo(user);
    initializeProfile();
}
function populateUserInfo(user) {
    const userNameElement = document.getElementById('userName');
    const userEmailElement = document.getElementById('userEmail');
    const searchesCountElement = document.getElementById('searchesCount');
    const savedItemsCountElement = document.getElementById('savedItemsCount');
    const accountAgeElement = document.getElementById('accountAge');
    if (userNameElement) {
        userNameElement.textContent = `Welcome back, ${user.name}!`;
    }
    if (userEmailElement) {
        userEmailElement.textContent = user.email;
    }
    // Calculate account age in days
    const createdDate = new Date(user.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24));
    if (accountAgeElement) {
        accountAgeElement.textContent = daysDiff.toString();
    }
    // Load user stats (mock data for demo)
    const userStats = getUserStats(user.id);
    if (searchesCountElement) {
        searchesCountElement.textContent = userStats.searches.toString();
    }
    if (savedItemsCountElement) {
        savedItemsCountElement.textContent = userStats.savedItems.toString();
    }
}
function getUserStats(userId) {
    // In a real app, this would come from an API
    const stats = localStorage.getItem(`clickbay_stats_${userId}`);
    if (stats) {
        return JSON.parse(stats);
    }
    // Default stats for new users
    const defaultStats = { searches: 0, savedItems: 0 };
    localStorage.setItem(`clickbay_stats_${userId}`, JSON.stringify(defaultStats));
    return defaultStats;
}
function initializeProfile() {
    // Initialize logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    // Load and display recent activity
    loadRecentActivity();
    // Add some demo activity if this is a new user
    addWelcomeActivity();
}
function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('clickbay_current_user');
        localStorage.removeItem('clickbay_remember_login');
        window.location.href = 'login.html';
    }
}
function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    if (!activityList)
        return;
    // In a real app, this would load from an API
    const activities = getStoredActivities();
    if (activities.length === 0) {
        activityList.innerHTML = `
            <div class="activity-item">
                <i class="material-icons">info</i>
                <div class="activity-content">
                    <p>No recent activity yet. Start using ClickBay to see your activity here!</p>
                    <span class="activity-time">Welcome</span>
                </div>
            </div>
        `;
        return;
    }
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <i class="material-icons">${activity.icon}</i>
            <div class="activity-content">
                <p>${activity.description}</p>
                <span class="activity-time">${formatTimeAgo(new Date(activity.timestamp))}</span>
            </div>
        </div>
    `).join('');
}
function addWelcomeActivity() {
    const user = getCurrentUser();
    if (!user)
        return;
    const activities = getStoredActivities();
    const hasWelcomeActivity = activities.some(a => a.type === 'welcome');
    if (!hasWelcomeActivity) {
        const welcomeActivity = {
            id: 'welcome_' + Date.now(),
            type: 'welcome',
            icon: 'celebration',
            description: 'Welcome to ClickBay! Your account has been created successfully.',
            timestamp: new Date().toISOString()
        };
        activities.unshift(welcomeActivity);
        localStorage.setItem('clickbay_activities', JSON.stringify(activities));
        loadRecentActivity();
    }
}
function getStoredActivities() {
    try {
        const activities = localStorage.getItem('clickbay_activities');
        return activities ? JSON.parse(activities) : [];
    }
    catch {
        return [];
    }
}
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 3600));
    const diffDays = Math.floor(diffMs / (1000 * 3600 * 24));
    if (diffMins < 1)
        return 'Just now';
    if (diffMins < 60)
        return `${diffMins}m ago`;
    if (diffHours < 24)
        return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}
// Update user stats (call this from main app when user performs actions)
export function updateUserStats(userId, action) {
    const stats = getUserStats(userId);
    if (action === 'search') {
        stats.searches++;
    }
    else if (action === 'save') {
        stats.savedItems++;
    }
    localStorage.setItem(`clickbay_stats_${userId}`, JSON.stringify(stats));
    // Add activity
    const activities = getStoredActivities();
    const activity = {
        id: Date.now().toString(),
        type: action,
        icon: action === 'search' ? 'search' : 'bookmark',
        description: action === 'search'
            ? 'Performed a new search on ClickBay'
            : 'Saved a new item to your collection',
        timestamp: new Date().toISOString()
    };
    activities.unshift(activity);
    // Keep only last 10 activities
    if (activities.length > 10) {
        activities.splice(10);
    }
    localStorage.setItem('clickbay_activities', JSON.stringify(activities));
}
// Navigate to index page
function goToIndex() {
    window.location.href = 'index.html';
}
// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
//# sourceMappingURL=profile.js.map