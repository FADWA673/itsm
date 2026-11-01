# 📋 Instructions pour l'Encadrant



Ce document vous guide pour tester et évaluer le projet ITSM Platform.

---

## 📦 Contenu du Package

Vous avez reçu:
- ✅ Code source complet (backend + frontend)
- ✅ Configuration Docker pour démarrage rapide
- ✅ Base de données avec données de test
- ✅ Documentation complète
-

---

## 🚀 Démarrage Rapide (5 minutes)

### Prérequis
- **Docker Desktop** installé et démarré
- **Navigateur web** (Chrome, Firefox, Edge)

### Étapes de Démarrage

#### 1. Extraire le projet
```
Extraire le fichier ZIP dans un dossier de votre choix
```

#### 2. Ouvrir un terminal dans le dossier
```
Windows: Clic droit → "Ouvrir dans le terminal"
```

#### 3. Lancer l'application
```powershell
docker-compose up -d
```

**⏱️ Premier démarrage**: ~3-5 minutes (téléchargement des images Docker)

#### 4. Vérifier que tout est démarré
```powershell
docker-compose ps
```

Vous devriez voir:
- ✅ `itsm-frontend` - Up
- ✅ `itsm-backend` - Up  
- ✅ `itsm-db` - Up (healthy)

#### 5. Accéder à l'application
Ouvrir dans le navigateur: **http://localhost:5173**

---

## 👤 Comptes de Test

### Super Administrateur (Accès complet)
- **Email**: `fadwazr12@gmail.com`
- **Mot de passe**: `Admin@1234`
- **Rôle**: Gestion complète du système



### Technicien
- **Email**: `tech@gmail.com`
- **Mot de passe**: `Tech@1234`
- **Rôle**: Traitement des tickets

### Employé
- **Email**: `employee@gmail.com`
- **Mot de passe**: `Employee@1234`
- **Rôle**: Création de tickets

---

## 🧪 Scénarios de Test Recommandés

### Scénario 1: Gestion des Tickets (10 min)

**En tant qu'Employé** 

1. **Créer un ticket manuellement**
   - Dashboard → "Create Ticket"
   - Remplir: Sujet, Description, Priorité, Catégorie
   - Soumettre → Le ticket est créé avec statut "OPEN"

2. **Créer un ticket avec IA** 
   - Cliquer sur "✨ Create with AI"
   - Coller ce texte:
     ```
     Mon ordinateur ne démarre plus depuis ce matin. L'écran reste noir 
     et je n'entends aucun bip. C'est urgent car j'ai une présentation 
     importante cet après-midi.
     ```
   - Cliquer "Generate" → L'IA remplit automatiquement:
     * Sujet
     * Description structurée
     * Priorité (HIGH détectée)
     * Catégorie suggérée

3. **Utiliser le Chat IA** 💬
   - Cliquer sur l'icône de chat flottante (en bas à droite)
   - Poser une question:
     ```
     Comment réinitialiser mon mot de passe Outlook ?
     ```
   - L'IA répond avec des suggestions de la base de connaissances

**En tant que Technicien** 

4. **Traiter un ticket**
   - Aller dans "Queue" (tickets non assignés)
   - Cliquer "Claim" sur un ticket → Il vous est assigné
   - Ouvrir le ticket → Statut passe à "ASSIGNED"
   - Ajouter un commentaire
   - Cliquer "Start Work" → Statut passe à "IN_PROGRESS"
   - Ajouter une solution
   - Cliquer "Resolve" → Statut passe à "RESOLVED"

**En tant qu'Employé** 

5. **Noter le ticket**
   - Aller dans "My Tickets"
   - Ouvrir le ticket résolu
   - Noter de 1 à 5 étoiles
   - Ajouter un commentaire de satisfaction

### Scénario 2: Base de Connaissances (5 min)

**En tant que Technicien** 

1. **Créer un article**
   - Knowledge Base → "Create Article"
   - Titre: "Comment réinitialiser un mot de passe Windows"
   - Contenu: Procédure détaillée
   - Catégorie: "Software"
   - Tags: "windows, password, reset"
   - Statut: "Pending Review"
   - Soumettre

**En tant qu'Admin** 

2. **Approuver l'article**
   - Knowledge Base → "Pending Review"
   - Ouvrir l'article
   - Cliquer "Approve"
   - L'article est maintenant "Published"

**En tant qu'Employé** 

3. **Rechercher avec IA** 🔍
   - Knowledge Base → Barre de recherche
   - Taper: "mot de passe windows"
   - L'IA trouve l'article pertinent avec recherche sémantique
   - Cliquer "👍 Helpful" si l'article aide

### Scénario 3: Gestion des Actifs (5 min)

**En tant qu'Admin** 

1. **Ajouter un actif**
   - Assets → "Add Asset"
   - Type: Laptop
   - Marque: Dell
   - Modèle: Latitude 5420
   - Numéro de série: DL1234567
   - Statut: Available
   - Localisation: Bureau 101

2. **Assigner à un employé**
   - Ouvrir l'actif
   - Cliquer "Assign"
   - Sélectionner "Ahmed Employé"
   - Le statut passe à "Active"
   - Un historique est créé

3. **Créer un ticket lié**
   - Tickets → Create
   - Lier l'actif "DL1234567"
   - Le ticket affiche les infos de l'actif

### Scénario 4: Monitoring SLA (3 min)

**En tant qu'Admin** 

1. **Configurer les SLA**
   - Admin → SLA Configuration
   - Voir les délais par priorité:
     * CRITICAL: 2h réponse / 4h résolution
     * HIGH: 4h / 8h
     * MEDIUM: 8h / 24h
     * LOW: 24h / 72h

2. **Voir les métriques**
   - Dashboard → Section "SLA Performance"
   - Taux de respect du SLA
   - Tickets en risque de dépassement
   - Temps moyen de résolution

### Scénario 5: Administration (5 min)

**En tant que Super Admin** (`fadwazr12@gmail.com`)

1. **Gérer les utilisateurs**
   - Admin → Users
   - Créer un nouvel utilisateur
   - Modifier un rôle
   - Désactiver un compte
   - Supprimer un utilisateur (avec cascade)

2. **Gérer les catégories**
   - Admin → Categories
   - Créer une catégorie: "Réseau"
   - Ajouter des sous-catégories
   - Réorganiser l'ordre

3. **Voir les statistiques**
   - Dashboard (vue admin)
   - Nombre de tickets par statut
   - Satisfaction client (étoiles)
   - Performance des techniciens
   - Tickets créés par jour (graphique)

---



##  Support

En cas de problème technique:

### Logs à vérifier
```powershell
# Logs de tous les services
docker-compose logs

# Logs backend uniquement
docker-compose logs backend

# Logs en temps réel
docker-compose logs -f
```

### Arrêter l'application
```powershell
docker-compose down
```

### Redémarrer
```powershell
docker-compose restart
```

### Réinitialiser complètement
```powershell
docker-compose down -v  # Supprime aussi les volumes (données)
docker-compose up -d
```

---



---





**Bon test! **
