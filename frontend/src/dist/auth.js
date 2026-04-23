// Authentication functionality for ClickBay
import { client, LOGIN_MUTATION, SIGNUP_MUTATION } from './graphqlClient';
let currentUser = null;
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
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm)
        return;
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        try {
            await loginUser(email, password, rememberMe);
            showSuccess('Login successful! Redirecting...');
            setTimeout(() => redirectToProfile(), 1500);
        }
        catch (error) {
            showError(error instanceof Error ? error.message : 'Login failed');
        }
    });
}
function initializeSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm)
        return;
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        try {
            validateSignup(name, email, password, confirmPassword);
            await registerUser(name, email, password);
            showSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => window.location.href = 'login.html', 1500);
        }
        catch (error) {
            showError(error instanceof Error ? error.message : 'Registration failed');
        }
    });
}
function initializeSocialAuth() {
    // Social authentication buttons
    document.querySelectorAll('.social-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const provider = button.classList.contains('google') ? 'Google' : 'GitHub';
            showInfo(`${provider} authentication coming soon!`);
        });
    });
}
async function loginUser(email, password, rememberMe) {
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
    }
    else {
        throw new Error('Invalid email or password');
    }
}
async function registerUser(name, email, password) {
    const { data } = await client.mutate({
        mutation: SIGNUP_MUTATION,
        variables: { name, email, password }
    });
    if (!data?.signup) {
        throw new Error('Registration failed');
    }
}
function validateSignup(name, email, password, confirmPassword) {
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
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
function redirectToProfile() {
    // Redirect to profile page
    window.location.href = 'profile.html';
}
// Utility functions for user feedback
function showSuccess(message) {
    showNotification(message, 'success');
}
function showError(message) {
    showNotification(message, 'error');
}
function showInfo(message) {
    showNotification(message, 'info');
}
function showNotification(message, type) {
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
//# sourceMappingURL=auth.js.map