# Ma Conseillère Voyage - Landing Page avec Chat IA

Site web complet pour Ma Conseillère Voyage avec authentification, système de commentaires et chat IA.

## 🚀 Fonctionnalités

### ✅ Site Web Multi-pages
- Page d'accueil avec présentation des services
- Page des services détaillés
- Page des destinations
- Page à propos
- Page de contact
- **Page de chat avec assistant IA**

### ✅ Authentification Firebase
- Connexion avec Email/Password
- Connexion avec Google
- Inscription de nouveaux utilisateurs
- Gestion de session persistante

### ✅ Système de Commentaires
- Ajout de commentaires (utilisateurs connectés uniquement)
- Like/Unlike des commentaires
- Affichage en temps réel avec Firestore
- Protection contre XSS

### ✅ Chat IA avec OpenAI
- Assistant virtuel personnalisé pour MCV
- Historique des conversations sauvegardé
- Réponses contextuelles basées sur l'historique
- System prompt complet avec toutes les informations de l'agence
- Interface de chat moderne et responsive

## 📁 Structure du Projet

```
/Users/akossi/Documents/App Amaide/
├── index.html                  # Page d'accueil avec auth et commentaires
├── services.html               # Page des services
├── destinations.html           # Page des destinations
├── about.html                 # Page à propos
├── contact.html               # Page de contact
├── chat.html                  # Page de chat IA (protégée)
├── test-firebase.html         # 🧪 Page de test Firebase/Firestore
├── test-chat.html             # 🧪 Page de test OpenAI/Chat
├── styles.css                 # Styles CSS complets
├── firestore.rules            # Règles de sécurité Firestore
├── vercel.json                # Configuration Vercel
├── README.md                  # Documentation principale
├── FIREBASE-SETUP.md          # 📖 Guide configuration Firebase
├── TROUBLESHOOTING-CHAT.md    # 📖 Guide dépannage chat
├── .gitignore                 # Fichiers ignorés par Git
├── js/
│   ├── firebase-config.js     # Configuration Firebase
│   ├── auth.js                # Gestion authentification
│   ├── comments.js            # Système de commentaires
│   ├── chat.js                # Chat IA avec OpenAI
│   ├── config.js              # Template configuration API (public)
│   └── config.local.js        # Configuration API locale (privé, .gitignore)
```

## 🔧 Configuration

### 1. Firebase Setup

#### Dans la console Firebase (https://console.firebase.google.com/):

1. **Authentication**:
   - Activer "Email/Password"
   - Activer "Google Sign-In"
   - Ajouter domaines autorisés (localhost, vercel.app, etc.)

2. **Firestore Database**:
   - Créer une base de données en mode production
   - Copier les règles de `firestore.rules` dans l'onglet "Règles"
   - Publier les règles

3. **Structure Firestore**:
```
comments/
  └── {commentId}/
      ├── userId: string
      ├── userName: string
      ├── userPhoto: string | null
      ├── text: string
      ├── timestamp: timestamp
      ├── likes: array<string>
      └── likesCount: number

chats/
  └── {userId}/
      └── messages/
          └── {messageId}/
              ├── role: "user" | "assistant"
              ├── content: string
              └── timestamp: timestamp
```

### 2. Configuration des Clés API

**IMPORTANT**: Les clés API sont actuellement dans le code. Pour la production:

#### Option 1: Variables d'environnement (Recommandé)
Créer un fichier `.env` :
```env
OPENAI_API_KEY=sk-proj-...
```

#### Option 2: Firebase Functions (Production)
Déplacer les appels OpenAI vers Firebase Functions pour sécuriser la clé API.

### 3. Déploiement

#### Vercel (Actuel)
```bash
vercel --prod
```

#### Firebase Hosting (Alternative)
```bash
firebase init hosting
firebase deploy
```

## 🔐 Sécurité

### Règles Firestore
Les règles de sécurité implémentées :
- ✅ Authentification requise pour lire/écrire
- ✅ Utilisateurs ne peuvent modifier que leurs propres commentaires
- ✅ Validation de la taille et du contenu des messages
- ✅ Protection contre l'injection
- ✅ Isolation des chats par utilisateur

### API OpenAI
⚠️ **ATTENTION**: La clé OpenAI est actuellement exposée côté client.

**Pour la production**, implémenter Firebase Functions:

1. Créer une Cloud Function:
```javascript
// functions/index.js
const functions = require('firebase-functions');
const axios = require('axios');

exports.chatWithAI = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Appeler OpenAI de manière sécurisée
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: data.messages,
      max_tokens: 500
    },
    {
      headers: {
        'Authorization': `Bearer ${functions.config().openai.key}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
});
```

2. Configurer la clé:
```bash
firebase functions:config:set openai.key="sk-proj-..."
```

## 💡 Utilisation

### Pour les utilisateurs

1. **Visiter le site**: https://mcv-landing-page-p7qgvuux2-richard-akossis-projects.vercel.app

2. **Voir les commentaires**: Cliquer sur "Se connecter" en bas de la page d'accueil

3. **S'inscrire/Se connecter**:
   - Avec email/mot de passe
   - Ou avec Google

4. **Laisser un commentaire**: Une fois connecté, utiliser le formulaire de commentaire

5. **Aimer des commentaires**: Cliquer sur le bouton 🤍/❤️

6. **Chatter avec l'IA**: Cliquer sur "Parler avec MCV" pour accéder au chat

### Pour les développeurs

#### Tester localement
1. Ouvrir `index.html` dans un navigateur
2. Les modules ES6 nécessitent un serveur local:
```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js
npx http-server

# Option 3: VS Code Live Server
```

#### Modifier le System Prompt
Éditer `js/chat.js` ligne 6-67 pour personnaliser l'assistant IA.

## 📊 Coûts

### Firebase (Plan Gratuit - Spark)
- **Firestore**: 50K lectures/jour, 20K écritures/jour
- **Auth**: Illimité
- **Hosting**: 10GB/mois

### OpenAI
- **GPT-3.5-Turbo**: ~$0.002 / 1K tokens
- Estimation: 500-1000 tokens par conversation
- Coût moyen: $0.001-$0.002 par message

**Recommandation**: Implémenter une limite de messages par utilisateur/jour.

## 🐛 Dépannage

### 🚨 Problème : Les commentaires ou le chat ne fonctionnent pas ?

**📖 Consultez les guides de dépannage détaillés** :

1. **[FIREBASE-SETUP.md](./FIREBASE-SETUP.md)** - Configuration complète de Firebase
   - Comment créer la base Firestore
   - Comment publier les règles de sécurité
   - Page de test pour diagnostiquer les problèmes

2. **[TROUBLESHOOTING-CHAT.md](./TROUBLESHOOTING-CHAT.md)** - Dépannage du chat IA
   - Configuration de la clé OpenAI
   - Vérification du crédit OpenAI
   - Page de test pour diagnostiquer le chat

3. **Pages de test disponibles** :
   - `test-firebase.html` - Teste Firebase et Firestore
   - `test-chat.html` - Teste OpenAI et le chat complet

### Erreurs Courantes

#### Erreur: "Firebase Auth not configured"
- Vérifier que les méthodes de connexion sont activées dans Firebase Console

#### Erreur: "Permission denied" sur Firestore
- **Solution** : Voir [FIREBASE-SETUP.md](./FIREBASE-SETUP.md)
- Les règles Firestore doivent être publiées
- L'utilisateur doit être connecté

#### Erreur: "Désolé, une erreur s'est produite" (Chat)
- **Solution** : Voir [TROUBLESHOOTING-CHAT.md](./TROUBLESHOOTING-CHAT.md)
- Vérifier la clé OpenAI dans `js/config.local.js`
- Vérifier le crédit OpenAI sur platform.openai.com
- Vérifier les règles Firestore

#### Modules ES6 ne se chargent pas
- Utiliser un serveur local (pas file://)
- Vérifier que `type="module"` est présent dans les scripts

### 🧪 Diagnostic Rapide

```bash
# Démarrer le serveur local
python3 -m http.server 8000

# Ouvrir les pages de test
# http://localhost:8000/test-firebase.html
# http://localhost:8000/test-chat.html
```

## 📝 TODO / Améliorations Futures

- [ ] Migrer la clé OpenAI vers Firebase Functions
- [ ] Ajouter un système de modération des commentaires
- [ ] Implémenter rate limiting côté serveur
- [ ] Ajouter des notifications en temps réel
- [ ] Créer un dashboard admin
- [ ] Ajouter la possibilité de répondre aux commentaires
- [ ] Implémenter un système de signalement
- [ ] Ajouter Analytics pour suivre l'utilisation du chat
- [ ] Optimiser les coûts OpenAI (caching, etc.)
- [ ] Ajouter support multilingue

## 📞 Contact

Pour toute question concernant le développement:
- Email: contact@maconseillerevoyage.com
- WhatsApp: +225 05 03 69 29 29
- Téléphone: +225 07 09 16 95 51

## 📄 Licence

© 2025 Ma Conseillère Voyage. Tous droits réservés.
