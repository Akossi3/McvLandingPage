# 🎛️ Guide du Dashboard Admin - Ma Conseillère Voyage

## 📖 Vue d'ensemble

Le dashboard admin est une interface complète pour gérer votre plateforme Ma Conseillère Voyage.

---

## 🔐 Accès au Dashboard

### URL
```
http://localhost:8000/admin.html
```

**En production** :
```
https://votre-site.vercel.app/admin.html
```

### Authentification

Seuls les utilisateurs avec des emails autorisés peuvent accéder au dashboard.

**Emails admin autorisés par défaut** :
- `admin@mcv.com`
- `akossi@mcv.com`

---

## ⚙️ Configuration des Admins

### Méthode 1 : Modifier le code JavaScript

Ouvrez `js/admin.js` et modifiez la liste :

```javascript
const ADMIN_EMAILS = [
    'admin@mcv.com',
    'akossi@mcv.com',
    'votre-email@exemple.com', // Ajoutez votre email
];
```

### Méthode 2 : Modifier les règles Firestore

Ouvrez `firestore.rules` et modifiez :

```javascript
function isAdmin() {
  return isSignedIn() && (
    request.auth.token.email == 'admin@mcv.com' ||
    request.auth.token.email == 'votre-email@exemple.com'
  );
}
```

**Important** : Après modification, publiez les règles dans Firebase Console !

---

## 📊 Fonctionnalités du Dashboard

### 1. **Dashboard (Vue d'ensemble)**

📈 **Statistiques en temps réel** :
- Total des commentaires
- Nombre d'utilisateurs
- Conversations chat
- Total des likes

📋 **Activité récente** :
- Derniers commentaires postés
- Nouvelles inscriptions
- Actions récentes

### 2. **Gestion des Commentaires**

💬 **Fonctionnalités** :
- Visualiser tous les commentaires
- Voir les détails d'un commentaire
- Supprimer des commentaires (spam, inappropriés)
- Voir le nombre de likes par commentaire

**Actions disponibles** :
- 👁️ **Voir** : Afficher les détails complets
- 🗑️ **Supprimer** : Supprimer définitivement

### 3. **Gestion des Utilisateurs**

👥 **Informations** :
- Nom et email de chaque utilisateur
- Méthode de connexion (Email/Google)
- Date d'inscription
- Historique d'activité

**Actions disponibles** :
- 👁️ **Voir** : Profil complet de l'utilisateur

### 4. **Conversations Chat**

💭 **Aperçu** :
- Liste de toutes les conversations avec l'IA
- Nombre de messages par conversation
- Dernière activité

**Informations** :
- Utilisateur
- Date de dernière conversation
- Nombre de messages échangés

### 5. **Analytics & Statistiques**

📈 **Graphiques** :
- Commentaires par jour
- Inscriptions par semaine
- Tendances d'utilisation

📊 **Métriques** :
- Temps moyen par conversation
- Taux d'engagement
- Messages par conversation

### 6. **Paramètres**

⚙️ **Configuration** :
- **Sécurité** : Liste des emails admin
- **Notifications** : Alertes pour nouveaux commentaires, utilisateurs
- **Apparence** : Thème clair/sombre

---

## 🚀 Comment Utiliser

### Se Connecter au Dashboard

1. Allez sur `/admin.html`
2. Si vous n'êtes pas connecté, vous serez redirigé vers la page d'accueil
3. Connectez-vous avec un compte admin autorisé
4. Vous serez redirigé vers le dashboard si votre email est autorisé

### Supprimer un Commentaire

1. Cliquez sur **💬 Commentaires** dans la sidebar
2. Trouvez le commentaire à supprimer
3. Cliquez sur **🗑️ Supprimer**
4. Confirmez la suppression

### Visualiser les Statistiques

1. Le dashboard principal affiche les statistiques en temps réel
2. Les données se mettent à jour automatiquement
3. Utilisez la section **Analytics** pour des graphiques détaillés

### Gérer les Notifications

1. Allez dans **⚙️ Paramètres**
2. Section **Notifications**
3. Cochez/décochez les options souhaitées
4. Cliquez sur **Enregistrer les modifications**

---

## 🔒 Sécurité

### Règles Firestore pour Admins

Les règles Firestore ont été mises à jour pour autoriser les admins :

```javascript
// Admins peuvent supprimer n'importe quel commentaire
allow delete: if (isSignedIn() && resource.data.userId == request.auth.uid) || isAdmin();

// Admins peuvent lire tous les chats
allow read: if isOwner(userId) || isAdmin();
```

### Protection d'Accès

- ✅ Vérification de l'email à chaque chargement
- ✅ Redirection automatique si non autorisé
- ✅ Authentification Firebase requise

### Bonnes Pratiques

1. **N'ajoutez que des emails de confiance** dans la liste admin
2. **Publiez toujours les règles Firestore** après modification
3. **Utilisez des emails professionnels** pour les comptes admin
4. **Surveillez régulièrement** l'activité du dashboard

---

## 📝 Checklist de Configuration

- [ ] Ajouter votre email dans `ADMIN_EMAILS` (js/admin.js)
- [ ] Ajouter votre email dans `isAdmin()` (firestore.rules)
- [ ] Publier les règles Firestore dans Firebase Console
- [ ] Tester l'accès au dashboard avec votre compte
- [ ] Configurer les notifications dans les paramètres
- [ ] Tester la suppression d'un commentaire test

---

## 🛠️ Dépannage

### "Accès refusé"

**Problème** : Votre email n'est pas dans la liste admin

**Solution** :
1. Vérifiez que votre email est dans `ADMIN_EMAILS` (js/admin.js)
2. Vérifiez que votre email est dans `isAdmin()` (firestore.rules)
3. Publiez les règles Firestore
4. Reconnectez-vous

### Les statistiques ne se chargent pas

**Problème** : Erreur de connexion Firestore

**Solution** :
1. Vérifiez que vous êtes connecté
2. Vérifiez les règles Firestore
3. Ouvrez la console du navigateur (F12) pour voir les erreurs
4. Vérifiez que la base Firestore existe

### Impossible de supprimer un commentaire

**Problème** : Règles Firestore bloquent la suppression

**Solution** :
1. Vérifiez que les règles `isAdmin()` sont publiées
2. Reconnectez-vous après publication des règles
3. Vérifiez la console pour les erreurs

---

## 🎨 Personnalisation

### Modifier les Couleurs

Le dashboard utilise les mêmes variables CSS que le site principal (`styles.css`).

Pour personnaliser :
- Modifiez `admin-styles.css`
- Les couleurs sont héritées de `styles.css`

### Ajouter des Statistiques

Dans `js/admin.js`, fonction `loadStatistics()` :

```javascript
// Exemple : Ajouter une nouvelle statistique
const myCustomStat = calculerMaStatistique();
document.getElementById('ma-stat').textContent = myCustomStat;
```

---

## 📞 Support

Pour toute question sur le dashboard admin :
- Consultez ce guide
- Vérifiez la console du navigateur pour les erreurs
- Référez-vous à la documentation Firebase

---

## 🚀 Améliorations Futures

**Fonctionnalités potentielles** :
- [ ] Export des données en CSV
- [ ] Graphiques interactifs avec Chart.js
- [ ] Modération en temps réel
- [ ] Notifications push pour les admins
- [ ] Logs d'activité détaillés
- [ ] Gestion des rôles (super-admin, modérateur)

---

**Dashboard créé avec ❤️ pour Ma Conseillère Voyage**
