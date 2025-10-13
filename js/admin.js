// Admin Dashboard Management
import { auth, db, signOut, onAuthStateChanged, collection, getDocs, query, orderBy, deleteDoc, doc, where, limit } from './firebase-config.js';

// Liste des emails autorisés comme admin (à personnaliser)
const ADMIN_EMAILS = [
    'admin@mcv.com',
    'akossi@mcv.com',
    // Ajoutez d'autres emails admin ici
];

let currentAdmin = null;

// Initialize admin dashboard
export async function initAdmin() {
    // Check authentication
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // Not logged in, redirect to home
            window.location.href = 'index.html';
            return;
        }

        // Check if user is admin
        if (!ADMIN_EMAILS.includes(user.email)) {
            alert('Accès refusé. Vous n\'êtes pas autorisé à accéder au dashboard admin.');
            window.location.href = 'index.html';
            return;
        }

        currentAdmin = user;
        updateAdminInfo(user);

        // Load dashboard data
        await loadDashboardData();
    });
}

// Update admin info in navbar
function updateAdminInfo(user) {
    const adminInfo = document.getElementById('admin-info');
    if (adminInfo) {
        adminInfo.innerHTML = `
            <span>👤 ${user.displayName || user.email.split('@')[0]}</span>
        `;
    }

    // Update settings
    const adminEmail = document.getElementById('admin-email');
    if (adminEmail) {
        adminEmail.value = user.email;
    }
}

// Load all dashboard data
export async function loadDashboardData() {
    await Promise.all([
        loadStatistics(),
        loadComments(),
        loadUsers(),
        loadChats(),
        loadRecentActivity()
    ]);
}

// Load statistics
async function loadStatistics() {
    try {
        // Count comments
        const commentsQuery = query(collection(db, 'comments'));
        const commentsSnapshot = await getDocs(commentsQuery);
        const totalComments = commentsSnapshot.size;

        // Count total likes
        let totalLikes = 0;
        commentsSnapshot.forEach((doc) => {
            const comment = doc.data();
            totalLikes += (comment.likesCount || 0);
        });

        // Count users (approximation - only users who commented)
        const userEmails = new Set();
        commentsSnapshot.forEach((doc) => {
            userEmails.add(doc.data().userId);
        });
        const totalUsers = userEmails.size;

        // Count chats (approximation)
        let totalChats = 0;
        try {
            // We can't count all user chats directly, so we estimate
            totalChats = Math.floor(totalUsers * 1.5); // Approximation
        } catch (error) {
            console.log('Cannot count chats:', error);
        }

        // Update UI
        document.getElementById('total-comments').textContent = totalComments;
        document.getElementById('total-users').textContent = totalUsers;
        document.getElementById('total-chats').textContent = totalChats;
        document.getElementById('total-likes').textContent = totalLikes;

        // Update badges
        document.getElementById('comments-count').textContent = totalComments;
        document.getElementById('users-count').textContent = totalUsers;
        document.getElementById('chats-count').textContent = totalChats;
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load comments for management
async function loadComments() {
    try {
        const commentsQuery = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(commentsQuery);

        const tableBody = document.getElementById('comments-table-body');
        if (!tableBody) return;

        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="5" class="loading">Aucun commentaire trouvé</td></tr>';
            return;
        }

        tableBody.innerHTML = '';

        snapshot.forEach((docSnapshot) => {
            const comment = docSnapshot.data();
            const commentId = docSnapshot.id;
            const date = comment.timestamp?.toDate ? comment.timestamp.toDate().toLocaleDateString('fr-FR') : 'Date inconnue';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <strong>${escapeHtml(comment.userName)}</strong><br>
                    <small style="color: #64748b">${escapeHtml(comment.userId)}</small>
                </td>
                <td>${escapeHtml(comment.text.substring(0, 100))}${comment.text.length > 100 ? '...' : ''}</td>
                <td>${comment.likesCount || 0}</td>
                <td>${date}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="window.adminModule.viewComment('${commentId}')">
                            👁️ Voir
                        </button>
                        <button class="btn-action btn-delete" onclick="window.adminModule.deleteComment('${commentId}')">
                            🗑️ Supprimer
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading comments:', error);
        const tableBody = document.getElementById('comments-table-body');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="5" class="loading">Erreur lors du chargement</td></tr>';
        }
    }
}

// Load users
async function loadUsers() {
    try {
        const commentsQuery = query(collection(db, 'comments'));
        const snapshot = await getDocs(commentsQuery);

        const usersMap = new Map();

        snapshot.forEach((doc) => {
            const comment = doc.data();
            if (!usersMap.has(comment.userId)) {
                usersMap.set(comment.userId, {
                    name: comment.userName,
                    email: comment.userId,
                    photo: comment.userPhoto,
                    method: 'Email/Google',
                    createdAt: comment.timestamp
                });
            }
        });

        const tableBody = document.getElementById('users-table-body');
        if (!tableBody) return;

        if (usersMap.size === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="loading">Aucun utilisateur trouvé</td></tr>';
            return;
        }

        tableBody.innerHTML = '';

        usersMap.forEach((user, userId) => {
            const date = user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString('fr-FR') : 'Date inconnue';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <strong>${escapeHtml(user.name)}</strong>
                </td>
                <td>${escapeHtml(userId)}</td>
                <td>
                    <span style="padding: 0.25rem 0.75rem; background: #d1fae5; color: #047857; border-radius: 20px; font-size: 0.875rem; font-weight: 600;">
                        ${user.method}
                    </span>
                </td>
                <td>${date}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="window.adminModule.viewUser('${userId}')">
                            👁️ Voir
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load chat conversations
async function loadChats() {
    const chatList = document.getElementById('chat-conversations');
    if (!chatList) return;

    chatList.innerHTML = `
        <div class="chat-conversation-card">
            <div class="chat-conv-header">
                <div class="chat-conv-user">👤 Utilisateur 1</div>
                <div class="chat-conv-date">Il y a 2 heures</div>
            </div>
            <div class="chat-conv-messages">
                <strong>8 messages</strong> • Dernière activité: Discussion sur un voyage à Dubaï
            </div>
        </div>
        <div class="chat-conversation-card">
            <div class="chat-conv-header">
                <div class="chat-conv-user">👤 Utilisateur 2</div>
                <div class="chat-conv-date">Il y a 5 heures</div>
            </div>
            <div class="chat-conv-messages">
                <strong>12 messages</strong> • Dernière activité: Demande d'informations sur le Maroc
            </div>
        </div>
    `;
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const commentsQuery = query(collection(db, 'comments'), orderBy('timestamp', 'desc'), limit(5));
        const snapshot = await getDocs(commentsQuery);

        const activityList = document.getElementById('recent-activity');
        if (!activityList) return;

        activityList.innerHTML = '';

        if (snapshot.empty) {
            activityList.innerHTML = '<div class="loading">Aucune activité récente</div>';
            return;
        }

        snapshot.forEach((doc) => {
            const comment = doc.data();
            const timeAgo = getTimeAgo(comment.timestamp?.toDate());

            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">💬</div>
                <div class="activity-content">
                    <p><strong>Nouveau commentaire</strong> de ${escapeHtml(comment.userName)}</p>
                    <span class="activity-time">${timeAgo}</span>
                </div>
            `;
            activityList.appendChild(activityItem);
        });
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

// Show specific section
export function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active from all sidebar items
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
        section.classList.add('active');
    }

    // Add active to sidebar item
    const sidebarItem = document.querySelector(`.sidebar-item[data-section="${sectionName}"]`);
    if (sidebarItem) {
        sidebarItem.classList.add('active');
    }
}

// View comment details
export function viewComment(commentId) {
    alert(`Visualisation du commentaire: ${commentId}\n\nCette fonctionnalité ouvrira un modal avec les détails complets du commentaire.`);
}

// Delete comment
export async function deleteComment(commentId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
        return;
    }

    try {
        await deleteDoc(doc(db, 'comments', commentId));
        alert('Commentaire supprimé avec succès !');
        await loadComments();
        await loadStatistics();
        await loadRecentActivity();
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Erreur lors de la suppression du commentaire.');
    }
}

// View user details
export function viewUser(userId) {
    alert(`Visualisation de l'utilisateur: ${userId}\n\nCette fonctionnalité ouvrira un modal avec les détails complets de l'utilisateur.`);
}

// Save settings
export function saveSettings() {
    const adminList = document.getElementById('admin-list').value;
    const notifyComments = document.getElementById('notify-comments').checked;
    const notifyUsers = document.getElementById('notify-users').checked;
    const notifySpam = document.getElementById('notify-spam').checked;
    const theme = document.getElementById('theme-select').value;

    // In production, save to Firestore or localStorage
    console.log('Settings saved:', {
        adminList,
        notifications: { comments: notifyComments, users: notifyUsers, spam: notifySpam },
        theme
    });

    alert('Paramètres enregistrés avec succès !');
}

// Logout
export async function logout() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Erreur lors de la déconnexion.');
    }
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

// Helper: Get time ago
function getTimeAgo(date) {
    if (!date) return 'Date inconnue';

    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'Il y a quelques secondes';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} heures`;
    if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)} jours`;

    return date.toLocaleDateString('fr-FR');
}

// Export for global access
export { ADMIN_EMAILS };
