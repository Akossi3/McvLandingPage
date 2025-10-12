// Comments System
import { db, collection, addDoc, getDocs, query, orderBy, updateDoc, doc, arrayUnion, arrayRemove, onSnapshot, serverTimestamp } from './firebase-config.js';
import { getCurrentUser } from './auth.js';

// Load and display comments in real-time
export function initComments() {
    const commentsContainer = document.getElementById('comments-list');
    if (!commentsContainer) return;

    const commentsQuery = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));

    // Real-time listener
    onSnapshot(commentsQuery, (snapshot) => {
        commentsContainer.innerHTML = '';

        if (snapshot.empty) {
            commentsContainer.innerHTML = '<p class="no-comments">Aucun commentaire pour le moment. Soyez le premier à commenter !</p>';
            return;
        }

        snapshot.forEach((doc) => {
            const comment = doc.data();
            const commentElement = createCommentElement(doc.id, comment);
            commentsContainer.appendChild(commentElement);
        });
    }, (error) => {
        console.error('Erreur lors du chargement des commentaires:', error);
    });
}

// Create comment HTML element
function createCommentElement(commentId, comment) {
    const div = document.createElement('div');
    div.className = 'comment-card';

    const currentUser = getCurrentUser();
    const userHasLiked = currentUser && comment.likes && comment.likes.includes(currentUser.uid);
    const likesCount = comment.likesCount || 0;

    const date = comment.timestamp?.toDate ? comment.timestamp.toDate().toLocaleDateString('fr-FR') : 'Date inconnue';

    div.innerHTML = `
        <div class="comment-header">
            <img src="${comment.userPhoto || 'https://via.placeholder.com/40'}" alt="${comment.userName}" class="comment-avatar">
            <div class="comment-user-info">
                <strong>${comment.userName}</strong>
                <span class="comment-date">${date}</span>
            </div>
        </div>
        <p class="comment-text">${escapeHtml(comment.text)}</p>
        <div class="comment-actions">
            <button class="like-button ${userHasLiked ? 'liked' : ''}" onclick="window.commentsModule.toggleLike('${commentId}')">
                <span class="like-icon">${userHasLiked ? '❤️' : '🤍'}</span>
                <span class="like-count">${likesCount}</span>
            </button>
        </div>
    `;

    return div;
}

// Add new comment
export async function addComment(text) {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        alert('Vous devez être connecté pour commenter.');
        return;
    }

    if (!text || text.trim() === '') {
        alert('Le commentaire ne peut pas être vide.');
        return;
    }

    try {
        await addDoc(collection(db, 'comments'), {
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email,
            userPhoto: currentUser.photoURL || null,
            text: text.trim(),
            timestamp: serverTimestamp(),
            likes: [],
            likesCount: 0
        });

        // Clear the input
        const commentInput = document.getElementById('comment-input');
        if (commentInput) {
            commentInput.value = '';
        }

        console.log('Commentaire ajouté avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'ajout du commentaire:', error);
        alert('Erreur lors de l\'ajout du commentaire. Veuillez réessayer.');
    }
}

// Toggle like on comment
export async function toggleLike(commentId) {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        alert('Vous devez être connecté pour aimer un commentaire.');
        return;
    }

    try {
        const commentRef = doc(db, 'comments', commentId);

        // Get current comment data
        const commentSnap = await getDocs(query(collection(db, 'comments')));
        let currentComment = null;

        commentSnap.forEach((doc) => {
            if (doc.id === commentId) {
                currentComment = doc.data();
            }
        });

        if (!currentComment) {
            console.error('Commentaire non trouvé');
            return;
        }

        const likes = currentComment.likes || [];
        const userHasLiked = likes.includes(currentUser.uid);

        if (userHasLiked) {
            // Unlike
            await updateDoc(commentRef, {
                likes: arrayRemove(currentUser.uid),
                likesCount: Math.max(0, (currentComment.likesCount || 0) - 1)
            });
        } else {
            // Like
            await updateDoc(commentRef, {
                likes: arrayUnion(currentUser.uid),
                likesCount: (currentComment.likesCount || 0) + 1
            });
        }
    } catch (error) {
        console.error('Erreur lors du like/unlike:', error);
        alert('Erreur lors de l\'action. Veuillez réessayer.');
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Handle comment form submission
export function setupCommentForm() {
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const commentInput = document.getElementById('comment-input');
            if (commentInput) {
                addComment(commentInput.value);
            }
        });
    }
}

// Make functions available globally
window.commentsModule = {
    addComment,
    toggleLike
};
