// Chat with MCV AI
import { db, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, getDocs } from './firebase-config.js';
import { getCurrentUser, requireAuth } from './auth.js';

// Try to import local config, fallback to default config
let API_CONFIG;
try {
    const module = await import('./config.local.js');
    API_CONFIG = module.API_CONFIG;
} catch {
    const module = await import('./config.js');
    API_CONFIG = module.API_CONFIG;
}

// OpenAI API Configuration
const OPENAI_API_KEY = API_CONFIG.OPENAI_API_KEY;
const OPENAI_API_URL = API_CONFIG.OPENAI_API_URL;

// MCV System Prompt
const SYSTEM_PROMPT = `Tu es un assistant virtuel pour "Ma Conseillère Voyage" (MCV), une agence de voyage basée en Côte d'Ivoire.

INFORMATIONS SUR L'AGENCE :
- Nom : Ma Conseillère Voyage
- Slogan : Votre 1er Cabinet de Conseil en Voyage
- Localisation : Côte d'Ivoire
- Contact WhatsApp : +225 05 03 69 29 29
- Contact Téléphone : +225 07 09 16 95 51
- Site web : https://mcv-landing-page-p7qgvuux2-richard-akossis-projects.vercel.app

SERVICES PROPOSÉS :
1. Séjours touristiques personnalisés - Organisation complète de vacances sur mesure
2. Voyages d'affaires professionnels - Solutions efficaces pour déplacements pro
3. Assistance visa complète - Accompagnement dans toutes les démarches
4. Voyages de groupe avec tarifs attractifs - Parfait pour familles, amis, entreprises
5. Voyages sur mesure adaptés au budget - Chaque détail pensé selon vos préférences
6. Services premium et conciergerie - Expérience de voyage exceptionnelle

DESTINATIONS PHARES :
- Dubaï (EAU) - Luxe et modernité, Burj Khalifa, Palm Jumeirah, Dubai Mall, Safari désert
- Turquie - Histoire et culture, Istanbul, Cappadoce, Pamukkale, Éphèse, Antalya
- Maroc - Charme oriental, Marrakech, Fès, Chefchaouen, Désert Sahara, Essaouira
- Sénégal - Authenticité africaine, Dakar, Lac Rose, Saint-Louis, Saly, Delta Siné-Saloum
- Égypte - Merveilles antiques, Pyramides de Gizeh, Le Caire, Louxor, Croisière Nil, Mer Rouge
- Chine - Tradition millénaire, Pékin, Grande Muraille, Shanghai, Xi'an, Guilin, Hong Kong

AUTRES DESTINATIONS : France, Italie, Espagne, Thaïlande, Maurice, Afrique du Sud

VALEURS :
- Excellence dans le service - Qualité irréprochable dans chaque détail
- Confiance et transparence - Honnêteté et tarifs clairs sans frais cachés
- Innovation - Toujours à l'écoute des nouvelles tendances
- Passion pour les voyages - Créer des expériences inoubliables

MISSION :
Simplifier l'organisation des voyages en offrant des solutions complètes et personnalisées, adaptées à chaque budget avec un service client exceptionnel et un accompagnement 24/7.

HORAIRES D'OUVERTURE :
- Lundi à Vendredi : 8h00 - 18h00
- Samedi : 9h00 - 14h00
- Dimanche : Fermé
- Service d'urgence 24/7 disponible pour les clients en voyage

TON RÔLE :
- Répondre aux questions sur les services de manière détaillée
- Proposer des destinations selon les préférences et le budget du client
- Donner des conseils de voyage pratiques (meilleure saison, documents nécessaires, etc.)
- Aider avec les demandes de devis en récoltant les informations nécessaires
- Être chaleureux, professionnel, serviable et enthousiaste
- Inviter à contacter directement l'équipe MCV pour les réservations concrètes
- Répondre en français de manière naturelle et conversationnelle

STYLE DE COMMUNICATION :
- Utilise un ton chaleureux et professionnel
- Sois enthousiaste mais pas trop insistant
- Pose des questions pour mieux comprendre les besoins
- Donne des informations concrètes et utiles
- Termine souvent par une invitation à contacter l'équipe pour plus de détails`;

// Initialize chat page
export function initChat() {
    requireAuth(); // Redirect if not logged in
    loadChatHistory();
    setupChatForm();
}

// Load chat history from Firestore
function loadChatHistory() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;

    const messagesQuery = query(
        collection(db, 'chats', currentUser.uid, 'messages'),
        orderBy('timestamp', 'asc')
    );

    onSnapshot(messagesQuery, (snapshot) => {
        chatContainer.innerHTML = '';

        if (snapshot.empty) {
            addWelcomeMessage();
            return;
        }

        snapshot.forEach((doc) => {
            const message = doc.data();
            appendMessage(message.role, message.content, false);
        });

        scrollToBottom();
    });
}

// Add welcome message
function addWelcomeMessage() {
    const welcomeMessage = "Bonjour ! Je suis l'assistant virtuel de Ma Conseillère Voyage. Comment puis-je vous aider à planifier votre prochain voyage ?";
    appendMessage('assistant', welcomeMessage, false);
}

// Setup chat form
function setupChatForm() {
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await sendMessage();
        });
    }
}

// Send message to OpenAI
export async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    if (!messageInput || !messageInput.value.trim()) return;

    const userMessage = messageInput.value.trim();
    messageInput.value = '';
    sendButton.disabled = true;

    // Display user message
    appendMessage('user', userMessage, true);
    await saveMessage('user', userMessage);

    // Show typing indicator
    showTypingIndicator();

    try {
        // Get chat history for context
        const chatHistory = await getChatHistory();

        // Prepare messages for OpenAI
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...chatHistory,
            { role: 'user', content: userMessage }
        ];

        // Call OpenAI API
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('Erreur API OpenAI');
        }

        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;

        // Hide typing indicator
        hideTypingIndicator();

        // Display assistant message
        appendMessage('assistant', assistantMessage, true);
        await saveMessage('assistant', assistantMessage);

    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        hideTypingIndicator();
        appendMessage('assistant', "Désolé, une erreur s'est produite. Veuillez réessayer ou contacter notre équipe directement.", false);
    } finally {
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// Get chat history from Firestore
async function getChatHistory() {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];

    const messagesQuery = query(
        collection(db, 'chats', currentUser.uid, 'messages'),
        orderBy('timestamp', 'asc')
    );

    const snapshot = await getDocs(messagesQuery);
    const messages = [];

    snapshot.forEach((doc) => {
        const message = doc.data();
        messages.push({
            role: message.role,
            content: message.content
        });
    });

    // Limit to last 10 messages for context
    return messages.slice(-10);
}

// Save message to Firestore
async function saveMessage(role, content) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    try {
        await addDoc(collection(db, 'chats', currentUser.uid, 'messages'), {
            role: role,
            content: content,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du message:', error);
    }
}

// Append message to chat UI
function appendMessage(role, content, shouldScroll = true) {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';

    if (role === 'assistant') {
        avatar.innerHTML = '🌍';
        avatar.style.background = '#10b981';
    } else {
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.photoURL) {
            avatar.innerHTML = `<img src="${currentUser.photoURL}" alt="User">`;
        } else {
            avatar.innerHTML = '👤';
            avatar.style.background = '#6b7280';
        }
    }

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    chatContainer.appendChild(messageDiv);

    if (shouldScroll) {
        scrollToBottom();
    }
}

// Show typing indicator
function showTypingIndicator() {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;

    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message assistant-message typing';
    typingDiv.innerHTML = `
        <div class="message-avatar" style="background: #10b981;">🌍</div>
        <div class="message-content">
            <span class="typing-dots">
                <span>.</span><span>.</span><span>.</span>
            </span>
        </div>
    `;
    chatContainer.appendChild(typingDiv);
    scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Scroll to bottom of chat
function scrollToBottom() {
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// Make functions available globally
window.chatModule = {
    sendMessage
};
