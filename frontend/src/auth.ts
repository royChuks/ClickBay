// Authentication functionality for ClickBay

import { client, LOGIN_MUTATION, SIGNUP_MUTATION, LOGOUT_MUTATION, CURRENT_USER_QUERY } from './graphqlClient';

interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
}

let currentUser: User | null = null;

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
    const { data } = await client.mutate({
        mutation: LOGIN_MUTATION,
        variables: { email, password }
    });

    if (data?.login) {
        localStorage.setItem('token', data.login.token);
        localStorage.setItem('refreshToken', data.login.refreshToken);
        currentUser = data.login.user;
        if (rememberMe) {
            localStorage.setItem('clickbay_remember_login', 'true');
        }
    } else {
        throw new Error('Invalid email or password');
    }
}

async function registerUser(name: string, email: string, password: string): Promise<void> {
    const { data } = await client.mutate({
        mutation: SIGNUP_MUTATION,
        variables: { name, email, password }
    });

    if (!data?.signup) {
        throw new Error('Registration failed');
    }
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