// Authentication functionality for ClickBay

interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}

// Mock user storage (in a real app, this would be handled by a backend)
const users: User[] = JSON.parse(localStorage.getItem('clickbay_users') || '[]');
let currentUser: User | null = JSON.parse(localStorage.getItem('clickbay_current_user') || 'null');

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (currentUser && window.location.pathname.includes('login.html')) {
        redirectToProfile();
        return;
    }

    // Initialize forms
    initializeLoginForm();
    initializeSignupForm();
    initializeSocialAuth();
});

function initializeLoginForm(): void {
    const loginForm = document.getElementById('loginForm') as HTMLFormElement;
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = (document.getElementById('loginEmail') as HTMLInputElement).value;
        const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
        const rememberMe = (document.getElementById('rememberMe') as HTMLInputElement).checked;

        try {
            await loginUser(email, password, rememberMe);
            showSuccess('Login successful! Redirecting...');
            setTimeout(() => redirectToProfile(), 1500);
        } catch (error) {
            showError(error instanceof Error ? error.message : 'Login failed');
        }
    });
}

function initializeSignupForm(): void {
    const signupForm = document.getElementById('signupForm') as HTMLFormElement;
    if (!signupForm) return;

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = (document.getElementById('signupName') as HTMLInputElement).value;
        const email = (document.getElementById('signupEmail') as HTMLInputElement).value;
        const password = (document.getElementById('signupPassword') as HTMLInputElement).value;
        const confirmPassword = (document.getElementById('signupConfirmPassword') as HTMLInputElement).value;

        try {
            validateSignup(name, email, password, confirmPassword);
            await registerUser(name, email, password);
            showSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => window.location.href = 'login.html', 1500);
        } catch (error) {
            showError(error instanceof Error ? error.message : 'Registration failed');
        }
    });
}

function initializeSocialAuth(): void {
    // Social authentication buttons
    document.querySelectorAll('.social-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const provider = button.classList.contains('google') ? 'Google' : 'GitHub';
            showInfo(`${provider} authentication coming soon!`);
        });
    });
}

async function loginUser(email: string, password: string, rememberMe: boolean): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find user (in real app, this would be a server request)
    const user = users.find(u => u.email === email);
    if (!user) {
        throw new Error('User not found. Please check your email or sign up.');
    }

    // In a real app, you'd verify the password hash on the server
    // For demo purposes, we'll just accept any password for existing users

    currentUser = user;
    localStorage.setItem('clickbay_current_user', JSON.stringify(currentUser));

    if (rememberMe) {
        localStorage.setItem('clickbay_remember_login', 'true');
    }
}

async function registerUser(name: string, email: string, password: string): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        throw new Error('An account with this email already exists.');
    }

    // Create new user
    const newUser: User = {
        id: generateUserId(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        createdAt: new Date()
    };

    users.push(newUser);
    localStorage.setItem('clickbay_users', JSON.stringify(users));
}

function validateSignup(name: string, email: string, password: string, confirmPassword: string): void {
    if (!name.trim()) {
        throw new Error('Please enter your full name.');
    }

    if (!email.trim() || !isValidEmail(email)) {
        throw new Error('Please enter a valid email address.');
    }

    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
    }
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function redirectToProfile(): void {
    // Redirect to profile page
    window.location.href = 'profile.html';
}

// Utility functions for user feedback
function showSuccess(message: string): void {
    showNotification(message, 'success');
}

function showError(message: string): void {
    showNotification(message, 'error');
}

function showInfo(message: string): void {
    showNotification(message, 'info');
}

function showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    // Remove existing notifications
    document.querySelectorAll('.auth-notification').forEach(el => el.remove());

    const notification = document.createElement('div');
    notification.className = `auth-notification ${type}`;
    notification.innerHTML = `
        <i class="material-icons">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Export functions for potential use in other modules
export { loginUser, registerUser, currentUser };