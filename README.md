# MonVoisin3000 - Réseau Social de Quartier

![](icone.svg)

Une application de réseau social pour connecter les voisins d'un même quartier.

## 🚀 Déploiement Rapide avec Docker

### Prérequis

- [Docker](https://www.docker.com/get-started) installé et en cours d'exécution
- [Docker Compose](https://docs.docker.com/compose/install/) (généralement inclus avec Docker Desktop)

### Déploiement en Une Commande

#### Sur Linux/macOS :
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Sur Windows (PowerShell) :
```powershell
.\deploy.ps1
```

#### Alternative avec Docker Compose directement :
```bash
docker-compose up --build -d
```

### 🌐 Accès à l'Application

Après le déploiement, l'application sera accessible sur :

- **Application Frontend** : http://localhost
- **API Backend** : http://localhost:3001
- **Mongo Express** : http://localhost:8081 (admin/password123)
- **Neo4j Browser** : http://localhost:7475 (neo4j/password123)

## 📋 Architecture

L'application utilise une architecture microservices avec :

### Backend
- **Framework** : NestJS (Node.js/TypeScript)
- **Base de données relationnelle** : PostgreSQL (utilisateurs, événements, services)
- **Base de données NoSQL** : MongoDB (conversations, messages)
- **Base de données graphe** : Neo4j (relations d'amitié)
- **Port** : 3001

### Frontend
- **Framework** : React + TypeScript + Vite
- **Serveur web** : Nginx
- **Port** : 80

### Bases de Données
- **PostgreSQL** : Port 5433
- **MongoDB** : Port 27018
- **Neo4j** : Ports 7475 (HTTP) et 7688 (Bolt)

## 🛠️ Commandes de Gestion

### Scripts de Déploiement

#### Linux/macOS (deploy.sh)
```bash
./deploy.sh deploy    # Déploiement complet
./deploy.sh dev       # Bases de données uniquement (développement)
./deploy.sh stop      # Arrêter tous les services
./deploy.sh logs      # Voir les logs
./deploy.sh status    # État des services
```

#### Windows (deploy.ps1)
```powershell
.\deploy.ps1 deploy   # Déploiement complet
.\deploy.ps1 dev      # Bases de données uniquement (développement)
.\deploy.ps1 stop     # Arrêter tous les services  
.\deploy.ps1 logs     # Voir les logs
.\deploy.ps1 status   # État des services
```

### Docker Compose Direct

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f [service_name]

# Arrêter tous les services
docker-compose down

# Redémarrer un service
docker-compose restart [service_name]

# Reconstruire et redémarrer
docker-compose up --build -d

# Voir l'état des services
docker-compose ps
```

## 🔧 Développement

### Environnement de Développement

Pour le développement, vous pouvez démarrer uniquement les bases de données :

```bash
# Linux/macOS
./deploy.sh dev

# Windows
.\deploy.ps1 dev

# Ou directement
docker-compose -f docker-compose.dev.yml up -d
```

Puis démarrer le frontend et backend manuellement :

```bash
# Backend
cd voisin-api
npm install
npm run start:dev

# Frontend  
cd front
npm install
npm run dev
```

## 📝 Fonctionnalités

- 👥 Gestion des utilisateurs et authentification
- 🤝 Système d'amitié
- 💬 Messagerie en temps réel
- 📅 Organisation d'événements
- 🛠️ Services entre voisins
- 🗺️ Géolocalisation par quartier

### Fonctionnalités Détaillées

### 1. Troc et Services entre Voisins
- **Troc** : Possibilité d'échanger des objets via des annonces.
- **Services** : Proposition et réservation de services entre voisins.

### 2. Sorties et Événements Communautaires
- **Organisation d'événements** : Nettoyage, collectes, activités sociales.
- **Sorties entre voisins** : Cinéma, activités sportives, loisirs.

### 3. Messagerie Instantanée
- Chat privé et de groupe.
- Notifications en temps réel via WebSockets.

### 4. Journal de Quartier et Informations Locales
- Stockage et diffusion des actualités locales.
- Scraping automatique des journaux municipaux.

### 5. Surveillance et Entraide
- Signalement d'absences et surveillance de domicile.

### 6. Gestion des Relations Sociales
- Liste d'amis et gestion des groupes.
- TrackMap permettant de partager sa localisation avec des amis choisis.

## Architecture du Projet

### Frontend - Client Léger
- **Technologie** : React.js
- **Interface Utilisateur** : Vue mobile et Web.
- **Navigation** :
  - Events du coin
  - Profil utilisateur
  - Troc et Services
  - Groupes et Messagerie
  - TrackMap des amis
  - Paramètres (gestion TrackMap, thèmes visuels, amis, confidentialité, etc.)
  - Journal et actualités

### Backend - API
- **Technologie** : NestJS
- **Fonctionnalités** :
  - Exposition des endpoints pour le frontend.
  - Gestion des interactions via WebSockets (messagerie, notifications, TrackMap).
  - Accès aux bases de données relationnelles et NoSQL.

### Client Lourd - Application Desktop
- **Technologie** : Java
- **Fonctionnalités** :
  - Interface administrateur (gestion des comptes, bannissements, etc.).
  - Web Scraping pour récupérer les journaux municipaux et les stocker.
  - Gestion et mise à jour automatique des bibliothèques utilisées.

### Microlangage - Communication avec les Bases de Données
- **Technologie** : Python
- **Objectif** : Gérer l’interaction entre le client lourd et les bases de données.
- **Utilisation** :
  - Prise en charge de Neo4j (relations entre utilisateurs, amitiés, groupes, etc.).
  - Optimisation des requêtes pour MongoDB (journal de quartier, articles, commentaires).

## Bases de Données

### 1. PostgreSQL
- Utilisé pour stocker les données relationnelles des utilisateurs, annonces, services, événements, etc.

### 2. MongoDB
- Utilisé pour stocker le journal de quartier et les actualités.

### 3. Neo4j
- Utilisé pour la gestion des relations sociales et interactions entre utilisateurs.

## Déploiement et Maintenance
- Mise à jour automatique des bibliothèques du client lourd.
- API scalable avec NestJS et base de données optimisée.
- Sécurisation des échanges et gestion des permissions avancées.

## Conclusion
MonVoisin3000 est un projet ambitieux visant à renforcer les liens entre voisins et à faciliter la communication locale. Grâce à son architecture multi-plateforme et ses fonctionnalités variées, il propose une solution complète et intuitive pour une meilleure interaction communautaire.

