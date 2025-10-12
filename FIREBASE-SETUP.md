# 🔥 Guide de Configuration Firebase - Ma Conseillère Voyage

## Problème: Les commentaires ne fonctionnent pas

Si les commentaires ne s'affichent pas, c'est probablement parce que **les règles Firestore ne sont pas publiées** ou que **la base Firestore n'est pas créée correctement**.

---

## ✅ Étape 1: Vérifier et Créer la Base Firestore

### Dans Firebase Console (https://console.firebase.google.com)

1. **Sélectionnez votre projet** : `mcvlanding`

2. **Allez dans Firestore Database** (menu de gauche)

3. **Vérifiez si la base existe** :
   - Si vous voyez "Créer une base de données" → Cliquez dessus
   - Si vous voyez déjà des collections → Passez à l'étape suivante

4. **Si vous créez la base** :
   - Choisissez **"Commencer en mode production"**
   - Sélectionnez la région la plus proche (par exemple `europe-west`)
   - Cliquez sur **"Activer"**

---

## ✅ Étape 2: Publier les Règles de Sécurité Firestore

### Méthode 1: Via Firebase Console (RECOMMANDÉ)

1. Dans **Firebase Console** → **Firestore Database** → onglet **"Règles"**

2. **Remplacez tout le contenu** par les règles ci-dessous :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Comments collection
    match /comments/{commentId} {
      // Anyone authenticated can read comments
      allow read: if isSignedIn();

      // Only authenticated users can create comments
      allow create: if isSignedIn()
                    && request.resource.data.userId == request.auth.uid
                    && request.resource.data.keys().hasAll(['userId', 'userName', 'text', 'timestamp'])
                    && request.resource.data.text is string
                    && request.resource.data.text.size() > 0
                    && request.resource.data.text.size() <= 1000;

      // Users can update likes
      allow update: if isSignedIn()
                    && (
                      request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes', 'likesCount'])
                    );

      // Users can only delete their own comments
      allow delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }

    // Chat messages collection
    match /chats/{userId}/messages/{messageId} {
      // Users can only read their own chat history
      allow read: if isOwner(userId);

      // Users can only create messages in their own chat
      allow create: if isOwner(userId)
                    && request.resource.data.keys().hasAll(['role', 'content', 'timestamp'])
                    && request.resource.data.role in ['user', 'assistant']
                    && request.resource.data.content is string
                    && request.resource.data.content.size() > 0
                    && request.resource.data.content.size() <= 5000;

      // No updates or deletes allowed for chat messages
      allow update, delete: if false;
    }

    // Rate limiting collection (optional)
    match /rate_limits/{userId} {
      allow read, write: if isOwner(userId);
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. **Cliquez sur "Publier"**

4. **Attendez la confirmation** (peut prendre 1-2 minutes)

### Méthode 2: Via Firebase CLI (Alternative)

Si vous avez Firebase CLI installé :

```bash
# Se connecter à Firebase
firebase login

# Initialiser Firebase (si pas déjà fait)
firebase init firestore

# Déployer les règles
firebase deploy --only firestore:rules
```

---

## ✅ Étape 3: Tester la Configuration

### Option A: Utiliser la Page de Test (RECOMMANDÉ)

1. **Ouvrez dans votre navigateur** :
   ```
   http://localhost:8000/test-firebase.html
   ```

2. **Suivez les étapes** :
   - Cliquez sur "Test connexion Google" pour vous connecter
   - Cliquez sur "Lire les commentaires" → Devrait fonctionner sans erreur
   - Cliquez sur "Écrire un commentaire test" → Devrait créer un commentaire
   - Cliquez sur "Écouter en temps réel" → Devrait recevoir des mises à jour

3. **Vérifiez la console de sortie** :
   - ✅ = Succès
   - ❌ = Erreur (avec explication)

### Option B: Vérifier dans Firebase Console

1. Allez dans **Firestore Database** → onglet **"Données"**

2. Vous devriez voir une collection **"comments"**

3. Si vous avez utilisé la page de test, vous devriez voir vos commentaires test

---

## 🔍 Résolution des Problèmes Courants

### Erreur: "permission-denied"

**Cause** : Les règles Firestore bloquent l'accès

**Solution** :
1. Vérifiez que vous êtes bien connecté (authentification Firebase)
2. Vérifiez que les règles sont publiées (Étape 2)
3. Attendez 1-2 minutes après publication des règles

### Erreur: "not-found"

**Cause** : La base Firestore n'existe pas

**Solution** :
1. Créez la base Firestore (Étape 1)
2. Assurez-vous d'avoir sélectionné "Commencer en mode production"

### Erreur: "unavailable"

**Cause** : Problème de connexion réseau

**Solution** :
1. Vérifiez votre connexion Internet
2. Vérifiez que Firebase n'est pas bloqué par un pare-feu
3. Essayez de recharger la page

### Les commentaires ne s'affichent toujours pas

**Vérifications** :
1. ✅ Êtes-vous connecté ? (bouton "Déconnexion" visible)
2. ✅ La section commentaires est-elle visible ? (pas le message "Connectez-vous")
3. ✅ Y a-t-il des erreurs dans la console du navigateur ? (F12 ou Cmd+Option+J)

---

## 📝 Vérification Finale

Après avoir suivi toutes les étapes :

1. **Rechargez votre page index.html** : `http://localhost:8000/index.html`
2. **Connectez-vous** avec Google
3. **Descendez à la section commentaires**
4. **Écrivez un commentaire de test**
5. **Le commentaire devrait apparaître instantanément**

---

## 🆘 Besoin d'Aide ?

Si le problème persiste :

1. **Ouvrez la console du navigateur** (F12 ou Cmd+Option+J)
2. **Allez sur l'onglet "Console"**
3. **Copiez tous les messages d'erreur en rouge**
4. **Partagez-les pour un diagnostic précis**

---

## 📋 Checklist Complète

- [ ] Base Firestore créée en mode production
- [ ] Règles de sécurité copiées et publiées
- [ ] Page de test ouverte et tests réussis
- [ ] Authentification fonctionne (bouton Google)
- [ ] Lecture des commentaires fonctionne
- [ ] Écriture de commentaire fonctionne
- [ ] Section commentaires visible sur index.html
- [ ] Aucune erreur dans la console du navigateur
