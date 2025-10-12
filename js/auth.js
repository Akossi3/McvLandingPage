// Authentication Management
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from './firebase-config.js';

let currentUser = null;

// Initialize auth state listener
export function initAuth() {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        updateUIForAuthState(user);
    });
}

// Update UI based on auth state
function updateUIForAuthState(user) {
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');
    const commentsSection = document.getElementById('comments-section');
    const loginPrompt = document.getElementById('login-prompt');

    if (user) {
        // User is signed in
        if (authButtons) {
            authButtons.innerHTML = `
                <span class="user-name">Bonjour, ${user.displayName || user.email}</span>
                <button onclick="window.authModule.logout()" class="btn-logout">Déconnexion</button>
            `;
        }

        if (userInfo) {
            userInfo.innerHTML = `
                <div class="user-profile">
                    <img src="${user.photoURL || 'https://via.placeholder.com/40'}" alt="Profile" class="user-avatar">
                    <span>${user.displayName || user.email}</span>
                </div>
            `;
        }

        // Show comments section, hide login prompt
        if (commentsSection) commentsSection.style.display = 'block';
        if (loginPrompt) loginPrompt.style.display = 'none';
    } else {
        // User is signed out
        if (authButtons) {
            authButtons.innerHTML = `
                <button onclick="window.authModule.showLoginModal()" class="btn-login">Se connecter</button>
            `;
        }

        // Hide comments section, show login prompt
        if (commentsSection) commentsSection.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'block';
    }
}

// Show login modal
export function showLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Hide login modal
export function hideLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Google Sign In
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Connexion réussie:', result.user);
        hideLoginModal();
        return result.user;
    } catch (error) {
        console.error('Erreur de connexion Google:', error);
        alert('Erreur lors de la connexion avec Google. Veuillez réessayer.');
        throw error;
    }
}

// Email/Password Sign In
export async function signInWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log('Connexion réussie:', result.user);
        hideLoginModal();
        return result.user;
    } catch (error) {
        console.error('Erreur de connexion:', error);
        alert('Erreur de connexion. Vérifiez vos identifiants.');
        throw error;
    }
}

// Email/Password Sign Up
export async function signUpWithEmail(email, password, displayName) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Update profile with display name
        await result.user.updateProfile({ displayName: displayName });
        console.log('Inscription réussie:', result.user);
        hideLoginModal();
        return result.user;
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        alert('Erreur lors de l\'inscription. Veuillez réessayer.');
        throw error;
    }
}

// Logout
export async function logout() {
    try {
        await signOut(auth);
        console.log('Déconnexion réussie');
        // Redirect to home if on chat page
        if (window.location.pathname.includes('chat.html')) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Erreur de déconnexion:', error);
        alert('Erreur lors de la déconnexion.');
    }
}

// Get current user
export function getCurrentUser() {
    return currentUser;
}

// Check if user is authenticated (for protected pages)
export function requireAuth() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Redirect to home page if not authenticated
            window.location.href = 'index.html';
        }
    });
}

// Switch between login and signup forms
export function showSignupForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}

export function showLoginForm() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

// Make functions available globally
window.authModule = {
    showLoginModal,
    hideLoginModal,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    showSignupForm,
    showLoginForm
};
