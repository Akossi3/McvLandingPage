# 🤖 Dépannage du Chat OpenAI - Ma Conseillère Voyage

## Problème: "Désolé, une erreur s'est produite"

Ce message apparaît quand :
1. ❌ **La clé API OpenAI est invalide** ou manquante
2. ❌ **Les règles Firestore** ne permettent pas de sauvegarder l'historique
3. ❌ **Le crédit OpenAI** est épuisé ou le compte est suspendu
4. ❌ **Problème de connexion** réseau

---

## 🔍 Diagnostic Rapide

### Ouvrez la page de test :
```
http://localhost:8000/test-chat.html
```

Cette page va :
- ✅ Vérifier si votre clé API est configurée
- ✅ Tester l'appel à OpenAI directement
- ✅ Tester la sauvegarde dans Firestore
- ✅ Identifier l'erreur exacte

---

## ✅ Solution 1: Vérifier la Clé API OpenAI

### Étape 1: Vérifier le fichier config.local.js

Le fichier `js/config.local.js` doit contenir votre **vraie clé API** :

```javascript
// js/config.local.js
export const API_CONFIG = {
    OPENAI_API_KEY: 'sk-VOTRE_VRAIE_CLE_ICI',
    OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions'
};
```

**Important** :
- La clé doit commencer par `sk-`
- Ne doit **PAS** être `'REPLACE_WITH_YOUR_KEY'`
- Le fichier doit être dans le dossier `js/`

### Étape 2: Obtenir/Vérifier votre clé OpenAI

1. Allez sur https://platform.openai.com/api-keys
2. Connectez-vous à votre compte OpenAI
3. **Créez une nouvelle clé** ou copiez une clé existante
4. Collez-la dans `js/config.local.js`

### Étape 3: Vérifier votre crédit OpenAI

1. Allez sur https://platform.openai.com/usage
2. Vérifiez que vous avez du **crédit disponible**
3. Si nécessaire, ajoutez des crédits (environ $5 pour commencer)

**Note** : Les nouveaux comptes OpenAI ont souvent un crédit gratuit de $5 pendant 3 mois.

---

## ✅ Solution 2: Publier les Règles Firestore

Le chat sauvegarde l'historique dans Firestore. Si les règles ne sont pas publiées, ça échoue.

### Suivez le guide FIREBASE-SETUP.md

Voir le fichier `FIREBASE-SETUP.md` pour les instructions complètes.

**En résumé** :
1. Allez sur https://console.firebase.google.com
2. Projet **mcvlanding** → **Firestore Database** → onglet **"Règles"**
3. Vérifiez que les règles incluent la section `/chats`
4. Cliquez sur **"Publier"**

---

## ✅ Solution 3: Créer le fichier config.local.js (s'il n'existe pas)

Si le fichier `js/config.local.js` n'existe pas :

### Créez-le manuellement :

1. Ouvrez un éditeur de texte
2. Créez un nouveau fichier avec ce contenu :

```javascript
// API Configuration
export const API_CONFIG = {
    OPENAI_API_KEY: 'sk-REMPLACEZ_PAR_VOTRE_VRAIE_CLE',
    OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions'
};
```

3. Sauvegardez-le dans : `js/config.local.js`
4. Remplacez `sk-REMPLACEZ_PAR_VOTRE_VRAIE_CLE` par votre vraie clé
5. Rechargez la page

---

## 🧪 Tests à Effectuer

### Test 1: Configuration (test-chat.html)

```
http://localhost:8000/test-chat.html
```

**Vérifiez** :
- ✅ "Configuration OpenAI valide" (vert)
- ✅ La clé API est masquée mais commence par "sk-"

**Si erreur** :
- ❌ "Clé API OpenAI manquante" → Suivez Solution 1

### Test 2: Appel API OpenAI

Sur la page de test :
1. Tapez un message : "Bonjour"
2. Cliquez sur **"Tester l'API OpenAI"**

**Résultat attendu** :
```
✅ SUCCÈS! Réponse de OpenAI:
"Bonjour ! Comment puis-je vous aider ?"
```

**Si erreur 401** :
```
❌ ERREUR API: 401 - Invalid API key
```
→ Votre clé API est invalide. Obtenez-en une nouvelle.

**Si erreur 429** :
```
❌ ERREUR API: 429 - You exceeded your current quota
```
→ Crédit OpenAI épuisé. Ajoutez des crédits sur https://platform.openai.com/usage

### Test 3: Chat Complet (avec Firestore)

Sur la page de test :
1. **Connectez-vous** avec Google
2. Cliquez sur **"Tester Chat Complet"**

**Résultat attendu** :
```
✅ Message utilisateur sauvegardé
✅ Réponse reçue de OpenAI
✅ Réponse sauvegardée
🎉 TEST COMPLET RÉUSSI!
```

**Si erreur "permission-denied"** :
```
❌ ERREUR: permission-denied
```
→ Règles Firestore non publiées. Suivez FIREBASE-SETUP.md

---

## 🔍 Erreurs Courantes et Solutions

### Erreur: "Failed to fetch"

**Cause** : Problème de connexion réseau ou CORS

**Solutions** :
1. Vérifiez votre connexion Internet
2. Vérifiez que vous êtes sur `localhost:8000` (pas `file://`)
3. Désactivez temporairement les extensions de navigateur (bloqueurs de pub)

### Erreur: "Invalid API key"

**Cause** : Clé OpenAI incorrecte

**Solutions** :
1. Vérifiez que la clé commence par `sk-`
2. Créez une nouvelle clé sur https://platform.openai.com/api-keys
3. Vérifiez qu'il n'y a pas d'espaces avant/après la clé
4. Le fichier doit être `config.local.js`, pas `config.js`

### Erreur: "You exceeded your current quota"

**Cause** : Crédit OpenAI épuisé

**Solutions** :
1. Vérifiez votre usage : https://platform.openai.com/usage
2. Ajoutez des crédits : https://platform.openai.com/account/billing
3. Vérifiez la date d'expiration du crédit gratuit

### Erreur: "permission-denied" (Firestore)

**Cause** : Règles Firestore pas publiées ou incorrectes

**Solutions** :
1. Publiez les règles dans Firebase Console
2. Vérifiez que la section `/chats` est incluse
3. Attendez 1-2 minutes après publication
4. Reconnectez-vous (déconnexion/connexion)

---

## 📝 Checklist Complète

Avant de tester le chat sur chat.html :

- [ ] Fichier `js/config.local.js` existe
- [ ] Clé API OpenAI valide (commence par "sk-")
- [ ] Crédit OpenAI disponible (vérifier sur platform.openai.com)
- [ ] Règles Firestore publiées
- [ ] Base Firestore créée en mode production
- [ ] Authentification Firebase activée
- [ ] Connecté avec un compte Google/Email
- [ ] Serveur local sur port 8000 (pas file://)
- [ ] Tous les tests sur test-chat.html réussis

---

## 🎯 Test Final

Après avoir résolu tous les problèmes :

1. Allez sur : `http://localhost:8000/chat.html`
2. Connectez-vous
3. Tapez : "Bonjour, je cherche un voyage à Dubaï"
4. Appuyez sur Entrée

**Résultat attendu** :
- Le message s'affiche immédiatement
- "..." apparaît (typing indicator)
- La réponse de l'assistant apparaît en quelques secondes
- Le message est sauvegardé (visible si vous rechargez la page)

---

## 🆘 Besoin d'Aide Supplémentaire ?

Si le problème persiste après tous ces tests :

1. **Ouvrez la console du navigateur** (F12 ou Cmd+Option+J)
2. Allez sur l'onglet **"Console"**
3. Envoyez un message sur chat.html
4. **Copiez tous les messages d'erreur en rouge**
5. Partagez-les pour diagnostic précis

Les erreurs courantes :
- `Erreur API OpenAI` → Problème de clé/crédit
- `Erreur lors de la sauvegarde du message` → Problème Firestore
- `Failed to fetch` → Problème de connexion/CORS

---

## 💡 Astuce : Mode Développeur

Pour voir exactement ce qui se passe :

1. Ouvrez `js/chat.js`
2. Toutes les erreurs sont loguées avec `console.error()`
3. Ouvrez la console du navigateur pendant l'utilisation
4. Vous verrez les détails exacts de chaque erreur
