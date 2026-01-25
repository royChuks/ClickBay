let currentIndex: number = 0;
let isTransitioning: boolean = false;
let track: HTMLElement;
let totalCards: number = 0;

const cardWidth = 280; // matches CSS width
const cardGap = 20; // matches CSS gap
const cardMargin = 10; // matches CSS margin on each card
const cardOffset = cardWidth + cardGap + (cardMargin * 2); // 320px

function updateCarousel() {
    if (!track) return;
    const offset = -currentIndex * cardOffset;
    track.style.transform = `translateX(${offset}px)`;
}

function nextCard() {
    if (isTransitioning || !track) return;

    isTransitioning = true;
    currentIndex++;
    track.style.transition = 'transform 0.3s ease';
    updateCarousel();

    // Check if we reached the start of the cloned set
    if (currentIndex === totalCards) {
        // We are at the cloned first card. Wait for transition, then snap back to real first card.
        setTimeout(() => {
            track.style.transition = 'none';
            currentIndex = 0;
            updateCarousel();
            isTransitioning = false;
        }, 300);
    } else {
        setTimeout(() => {
            isTransitioning = false;
        }, 300);
    }
}

function prevCard() {
    if (isTransitioning || !track) return;
    
    isTransitioning = true;
    track.style.transition = 'transform 0.3s ease';

    if (currentIndex === 0) {
        // Simple rewind to last card for now
        currentIndex = totalCards - 1;
    } else {
        currentIndex--;
    }
    
    updateCarousel();
    setTimeout(() => {
        isTransitioning = false;
    }, 300);
}

// Initialize carousel
document.addEventListener('DOMContentLoaded', () => {
    track = document.getElementById('carouselTrack') as HTMLElement;
    const cards = document.querySelectorAll('.card');
    
    if (track && cards.length > 0) {
        totalCards = cards.length;
        
        // Clone all cards and append to track for seamless forward loop
        cards.forEach(card => {
            const clone = card.cloneNode(true) as HTMLElement;
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });

        console.log(`Carousel initialized: ${totalCards} original cards. Infinite loop enabled.`);
        updateCarousel();
    }
});

// Popup functionality
function togglePopup(event: Event): void {
    event.preventDefault();
    const target = event.target as HTMLElement;

    // Don't toggle if clicking inside the popup content
    if (target.closest('.popup')) {
        return;
    }

    const navLink = target.closest('.nav-link') as HTMLElement;
    if (!navLink) return;

    const popup = navLink.querySelector('.popup') as HTMLElement;
    if (!popup) return;

    // Close other open popups
    document.querySelectorAll('.popup.show').forEach(p => {
        if (p !== popup) p.classList.remove('show');
    });

    // Toggle current popup
    popup.classList.toggle('show');
}

// Handle popup option clicks
function handlePopupOption(event: Event): void {
    const target = event.target as HTMLElement;
    const option = target.closest('.popup-option') as HTMLElement;
    if (!option) return;

    const optionText = option.textContent?.trim() || '';
    console.log('Popup option clicked:', optionText);

    // Close the popup
    const popup = option.closest('.popup') as HTMLElement;
    popup.classList.remove('show');

    // Show feedback based on option
    showOptionFeedback(optionText);
}

function showOptionFeedback(option: string): void {
    const feedback = document.createElement('div');
    feedback.className = 'option-feedback';
    feedback.innerHTML = `
        <div style="position: fixed; top: 20%; right: 20px; background: #10B981; color: white;
                    padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 1000; font-weight: 500;">
            <i class="material-icons" style="vertical-align: middle; margin-right: 0.5rem;">check_circle</i>
            ${option} feature coming soon!
        </div>
    `;

    document.body.appendChild(feedback);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (feedback.parentElement) {
            feedback.remove();
        }
    }, 3000);
}

function handleNotesItemClick(event: Event): void {
    const target = event.target as HTMLElement;
    const item = target.closest('.notes-item') as HTMLElement;
    if (!item) return;

    event.stopPropagation();

    const itemText = item.querySelector('.item-text')?.textContent || 'Note';
    showNotification(`Viewing details for: ${itemText}`, 'info');

    // Close the popup
    const popup = item.closest('.popup') as HTMLElement;
    if (popup) popup.classList.remove('show');
}

// Section Modal Logic
function openSectionModal(section: 'history' | 'highlights' | 'hooks'): void {
    const modal = document.getElementById('sectionModal');
    const title = document.getElementById('modalTitle');
    const icon = document.getElementById('modalIcon');
    const body = document.getElementById('modalBody');

    if (!modal || !title || !icon || !body) return;

    // Define content based on section
    const content: Record<string, { title: string, icon: string, html: string }> = {
        history: {
            title: 'Search & Bookmark History',
            icon: 'history',
            html: `
                <div class="notes-list">
                    <div class="notes-item">
                        <span class="item-text">Search: "AI Modern Trends in 2024"</span>
                        <span class="item-date">2 mins ago</span>
                    </div>
                    <div class="notes-item">
                        <span class="item-text">Bookmark: "Analytics Dashboard UI Kit"</span>
                        <span class="item-date">1 hour ago</span>
                    </div>
                    <div class="notes-item">
                        <span class="item-text">Search: "React Performance Optimization"</span>
                        <span class="item-date">昨日</span>
                    </div>
                    <div class="notes-item">
                        <span class="item-text">Bookmark: "Material Design 3 Guidelines"</span>
                        <span class="item-date">2 days ago</span>
                    </div>
                </div>
            `
        },
        highlights: {
            title: 'Key Insights & Highlights',
            icon: 'star',
            html: `
                <div class="notes-list">
                    <div class="notes-item">
                        <span class="item-tag highlight">Insight</span>
                        <span class="item-text">User engagement increased by 24% in Q4 after redesigning the onboarding flow.</span>
                    </div>
                    <div class="notes-item">
                        <span class="item-tag topic">Topic</span>
                        <span class="item-text">Agentic Workflows and their impact on enterprise automation.</span>
                    </div>
                    <div class="notes-item">
                        <span class="item-tag highlight">Insight</span>
                        <span class="item-text">Keywords "Predictive AI" saw a 150% spike in search volume.</span>
                    </div>
                </div>
            `
        },
        hooks: {
            title: 'User Hooks & Interests',
            icon: 'link',
            html: `
                <div class="notes-list">
                    <div class="notes-item">
                        <span class="item-tag blog">Blog</span>
                        <span class="item-text">Mastering React Hooks: From Beginner to Advanced.</span>
                    </div>
                    <div class="notes-item">
                        <span class="item-tag business">Business</span>
                        <span class="item-text">New B2B Strategy for 2025: Focus on Client Retention.</span>
                    </div>
                    <div class="notes-item">
                        <span class="item-tag news">News</span>
                        <span class="item-text">ClickBay reaches 50k active users!</span>
                    </div>
                    <div class="notes-item">
                        <span class="item-tag community">Community</span>
                        <span class="item-text">Join our upcoming webinar on AI Analytics.</span>
                    </div>
                </div>
            `
        }
    };

    const sectionData = content[section];
    if (sectionData) {
        title.textContent = sectionData.title;
        icon.textContent = sectionData.icon;
        body.innerHTML = sectionData.html;
        modal.classList.add('show');
        
        // Close the notes popup if it was open
        document.querySelectorAll('.popup.show').forEach(p => p.classList.remove('show'));
    }
}

function closeSectionModal(): void {
    const modal = document.getElementById('sectionModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Close modal when clicking outside
window.addEventListener('click', (event: Event) => {
    const modal = document.getElementById('sectionModal');
    if (event.target === modal) {
        closeSectionModal();
    }
});

// Close popups when clicking outside
document.addEventListener('click', (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-link') && !target.closest('.notes-section')) {
        document.querySelectorAll('.popup.show').forEach(popup => {
            popup.classList.remove('show');
        });
    }
});

// Search functionality
function handleSearch(event: Event): void {
    event.preventDefault();
    const searchInput = document.querySelector('.ai-search-box') as HTMLInputElement;
    const searchButton = document.querySelector('.ai-search-button') as HTMLElement;
    const searchTerm = searchInput.value.trim();

    if (searchTerm) {
        // Visual feedback - show loading state
        searchButton.textContent = 'Searching...';
        searchButton.style.opacity = '0.7';
        searchInput.disabled = true;

        console.log('Searching for:', searchTerm);

        // Simulate search process (replace with actual API call)
        setTimeout(() => {
            // Show results (for demo purposes)
            showSearchResults(searchTerm);

            // Reset button state
            searchButton.textContent = 'Scrape';
            searchButton.style.opacity = '1';
            searchInput.disabled = false;
            searchInput.value = '';
        }, 2000); // 2 second delay to simulate search
    }
}

function showSearchResults(searchTerm: string): void {
    // Create a simple results display (can be enhanced with actual results)
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results';
    resultsContainer.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    z-index: 1000; max-width: 400px; text-align: center;">
            <h3 style="color: #1E40AF; margin-bottom: 1rem;">Search Results</h3>
            <p>Found content related to: <strong>"${searchTerm}"</strong></p>
            <p style="font-size: 0.9rem; color: #6B7280; margin-top: 1rem;">
                Backend integration needed for actual scraping functionality.
            </p>
            <button onclick="this.parentElement.parentElement.remove()"
                    style="margin-top: 1rem; padding: 0.5rem 1rem; background: #EF4444; color: white;
                           border: none; border-radius: 6px; cursor: pointer;">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(resultsContainer);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (resultsContainer.parentElement) {
            resultsContainer.remove();
        }
    }, 5000);
}

// Profile popup functions
function updateProfilePopup(): void {
    const currentUser = getCurrentUser();
    const profileAvatar = document.getElementById('profileAvatar');
    const avatarLetter = document.getElementById('avatarLetter');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileContent = document.getElementById('profileContent');
    const loggedInContent = document.getElementById('loggedInContent');

    if (currentUser) {
        // User is logged in
        if (avatarLetter) avatarLetter.textContent = currentUser.name.charAt(0).toUpperCase();
        if (profileName) profileName.textContent = currentUser.name;
        if (profileEmail) profileEmail.textContent = currentUser.email;
        if (profileContent) profileContent.style.display = 'none';
        if (loggedInContent) loggedInContent.style.display = 'block';

        // Update sync status
        updateSyncStatus();
    } else {
        // User is not logged in
        if (avatarLetter) avatarLetter.textContent = '?';
        if (profileName) profileName.textContent = 'Not logged in';
        if (profileEmail) profileEmail.textContent = 'Click to login';
        if (profileContent) profileContent.style.display = 'block';
        if (loggedInContent) loggedInContent.style.display = 'none';
    }
}

function getCurrentUser(): any {
    try {
        const user = localStorage.getItem('clickbay_current_user');
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
}

function toggleSync(): void {
    const syncStatus = localStorage.getItem('clickbay_sync_enabled') === 'true';
    const newStatus = !syncStatus;

    localStorage.setItem('clickbay_sync_enabled', newStatus.toString());

    // Update UI
    updateSyncStatus();

    // Close popup
    document.querySelectorAll('.popup.show').forEach(popup => {
        popup.classList.remove('show');
    });

    // Show feedback
    showNotification(newStatus ? 'Sync enabled' : 'Sync disabled', newStatus ? 'success' : 'info');
}

function updateSyncStatus(): void {
    const syncStatus = localStorage.getItem('clickbay_sync_enabled') === 'true';
    const syncIcon = document.getElementById('syncIcon') as HTMLElement;
    const syncText = document.getElementById('syncText') as HTMLElement;
    const profileAvatar = document.getElementById('profileAvatar') as HTMLElement;

    if (syncStatus) {
        if (syncIcon) {
            syncIcon.textContent = 'sync';
            syncIcon.classList.add('sync-on');
            syncIcon.classList.remove('sync-off');
        }
        if (syncText) syncText.textContent = 'Sync On';
        if (profileAvatar) profileAvatar.classList.add('sync-on');
    } else {
        if (syncIcon) {
            syncIcon.textContent = 'sync_disabled';
            syncIcon.classList.add('sync-off');
            syncIcon.classList.remove('sync-on');
        }
        if (syncText) syncText.textContent = 'Sync Off';
        if (profileAvatar) profileAvatar.classList.remove('sync-on');
    }
}

function openSettings(): void {
    // Close popup first
    document.querySelectorAll('.popup.show').forEach(popup => {
        popup.classList.remove('show');
    });

    // Show settings (placeholder - could open a settings modal or page)
    showNotification('Settings panel coming soon!', 'info');
}

function handleLogout(): void {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('clickbay_current_user');
        localStorage.removeItem('clickbay_remember_login');

        // Update profile popup
        updateProfilePopup();

        // Close popup
        document.querySelectorAll('.popup.show').forEach(popup => {
            popup.classList.remove('show');
        });

        showNotification('Successfully signed out', 'success');
    }
}

function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(el => el.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="material-icons">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Make profile functions globally available
(window as any).toggleSync = toggleSync;
(window as any).openSettings = openSettings;
(window as any).handleLogout = handleLogout;
(window as any).openSectionModal = openSectionModal;
(window as any).closeSectionModal = closeSectionModal;

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add popup toggle listeners to nav links with popups
    document.querySelectorAll('.nav-link').forEach(link => {
        const popup = link.querySelector('.popup');
        if (popup) {
            link.addEventListener('click', togglePopup);

            // Add listeners to popup options
            popup.querySelectorAll('.popup-option').forEach(option => {
                option.addEventListener('click', handlePopupOption);
            });

            // Add listeners to notes items
            popup.querySelectorAll('.notes-item').forEach(item => {
                item.addEventListener('click', handleNotesItemClick);
            });

            // Add listener to "View All" button
            const viewAllBtn = popup.querySelector('.view-all-btn');
            if (viewAllBtn) {
                viewAllBtn.addEventListener('click', () => {
                    showNotification('Full Notes Explorer coming soon!', 'info');
                    popup.classList.remove('show');
                });
            }
        }
    });

    // Update profile popup on page load
    updateProfilePopup();

    // Add search functionality
    const searchButton = document.querySelector('.ai-search-button') as HTMLElement;
    const searchForm = document.querySelector('.search-form') as HTMLFormElement;

    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
});

// Export functions for module usage
export { nextCard, prevCard, togglePopup };

// Make functions globally available for HTML onclick handlers (if needed)
(window as any).nextCard = nextCard;
(window as any).prevCard = prevCard;
(window as any).togglePopup = togglePopup;
(window as any).openSectionModal = openSectionModal;
(window as any).closeSectionModal = closeSectionModal;

//auto swipe every 4s
setInterval(nextCard, 4000);