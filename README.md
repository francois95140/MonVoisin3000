# MonVoisin3000

## Description du Projet
**MonVoisin3000** est une plateforme destinée à faciliter les interactions entre voisins et à améliorer l'accès aux informations locales. L'objectif est de proposer un ensemble de fonctionnalités favorisant l'entraide, le partage et la communication entre habitants d'un même quartier.

## Fonctionnalités Principales

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

