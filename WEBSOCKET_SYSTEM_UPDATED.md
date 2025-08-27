# Système WebSocket Unifié - MonVoisin3000

## Vue d'ensemble

Le système WebSocket de MonVoisin3000 a été unifié pour éliminer la redondance et améliorer les performances. Il utilise maintenant un seul système basé sur les conversations qui gère tous les types de messagerie : conversations privées, groupes et événements.

## Architecture

### Frontend (`/front/src/contexts/WebSocketContext.tsx`)

Le WebSocketProvider unifié gère :
- **Connexion persistante** : Reste connecté pendant toute la session
- **Reconnexion automatique** : Se reconnecte en cas de déconnexion accidentelle
- **Compatibilité** : Méthodes legacy pour l'ancien système
- **Notifications en temps réel** : Événements DOM personnalisés

#### Méthodes principales

```typescript
interface WebSocketContextType {
  // État
  socket: Socket | null;
  isConnected: boolean;
  messages: MessageInConversation[];
  
  // Connexion
  connect: (userId: string) => void;
  disconnect: () => void;
  
  // Conversations modernes
  sendMessageToConversation: (conversationId: string, content: string) => Promise<MessageInConversation>;
  createOrGetPrivateConversation: (otherUserId: string) => Promise<ConversationData>;
  createOrGetEventConversation: (eventId: string, eventTitle: string) => Promise<ConversationData>;
  getConversationById: (conversationId: string, page?: number) => Promise<ConversationWithMessages | null>;
  getUserConversations: (page?: number) => Promise<ConversationListItem | null>;
  markConversationAsRead: (conversationId: string, fromSenderId?: string) => Promise<{ markedCount: number }>;
  getUnreadCounts: () => Promise<UnreadCount[]>;
  getTotalUnreadCount: () => Promise<number>;
  getUsersStatus: (userIds: string[]) => Promise<{ userId: string; isOnline: boolean }[]>;
  
  // Méthodes de compatibilité (legacy)
  sendMessage: (recipientId: string, content: string) => Promise<void>;
  getUnreadCount: (userId: string) => Promise<number>;
  markAsRead: (messageId: string, userId: string) => Promise<void>;
  getConversation: (userId1: string, userId2: string, page?: number) => Promise<any>;
}
```

#### Connexion et authentification

```typescript
// Dans NewConversations.tsx
const { connect, isConnected } = useWebSocket();

useEffect(() => {
  if (currentUserId) {
    console.log('🔌 Initialisation de la connexion WebSocket pour:', currentUserId);
    connect(currentUserId); // Se connecte avec l'ID utilisateur
  }
}, [currentUserId, connect]);
```

#### Événements temps réel

Le WebSocket émet des événements DOM personnalisés :

```typescript
// Nouveau message reçu
window.addEventListener('conversationUpdate', (event: CustomEvent) => {
  const { type, conversationId, message } = event.detail;
  if (type === 'newMessage') {
    // Traiter le nouveau message
  }
});

// Changement de statut utilisateur
window.addEventListener('userStatusChanged', (event: CustomEvent) => {
  const { userId, isOnline } = event.detail;
  // Mettre à jour le statut
});
```

### Backend (`/voisin-api/src/message/`)

#### Structure des fichiers

```
message/
├── conversation.controller.ts    # API REST pour les conversations
├── conversation.gateway.ts       # WebSocket Gateway
├── conversation.service.ts       # Logique métier
├── conversation.module.ts        # Module NestJS
└── entities/
    └── conversation.entity.ts    # Schéma MongoDB
```

#### Endpoints API REST

- `GET /api/conversations` - Liste des conversations de l'utilisateur
- `GET /api/conversations/:id` - Détails d'une conversation
- `GET /api/conversations/:id/messages` - Messages d'une conversation
- `POST /api/conversations/private` - Créer/récupérer conversation privée
- `POST /api/conversations/group` - Créer groupe
- `POST /api/conversations/event` - Créer/récupérer conversation d'événement
- `GET /api/conversations/unread-counts` - Compteurs non lus
- `GET /api/conversations/unread-total` - Total des non lus

#### WebSocket Events

**Client vers serveur :**
- `joinUserRoom` - Rejoindre sa room personnelle
- `createMessageInConversation` - Envoyer un message
- `getConversation` - Récupérer une conversation
- `getUserConversations` - Liste des conversations
- `markConversationAsRead` - Marquer comme lu
- `getUnreadCounts` - Compteurs non lus
- `getUsersStatus` - Statuts des utilisateurs

**Serveur vers client :**
- `newMessageInConversation` - Nouveau message reçu
- `messagesMarkedAsRead` - Messages marqués comme lus
- `userStatusChanged` - Changement de statut

## Fonctionnalités

### 1. Connexion persistante

Le WebSocket reste connecté pendant toute la session utilisateur :

```typescript
// Ne se déconnecte QUE quand l'onglet/fenêtre se ferme
useEffect(() => {
  const handleBeforeUnload = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    // Pas de déconnexion automatique en mode développement
  };
}, []);
```

### 2. Reconnexion automatique

En cas de déconnexion accidentelle :

```typescript
newSocket.on('disconnect', (reason) => {
  if (reason !== 'io client disconnect' && currentUserId.current) {
    setTimeout(() => {
      if (currentUserId.current && !socketRef.current?.connected) {
        connect(currentUserId.current);
      }
    }, 3000);
  }
});
```

### 3. Gestion d'erreur d'authentification

Redirection automatique vers la connexion si token invalide :

```typescript
if (response.status === 401) {
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  window.location.href = '/connexion';
}
```

### 4. Optimisation des performances

- **Pas de fallback REST API défaillant** : Utilise seulement WebSocket
- **Filtrage des requêtes** : Évite les appels si WebSocket non connecté
- **Cache local** : Messages stockés localement pour affichage immédiat

## Usage

### Envoyer un message

```typescript
const { sendMessageToConversation } = useWebSocket();

// Message dans une conversation existante
await sendMessageToConversation('conversationId', 'Hello!');

// Message privé (compatibilité legacy)
const { sendMessage } = useWebSocket();
await sendMessage('recipientUserId', 'Hello!');
```

### Créer/récupérer conversation

```typescript
const { createOrGetPrivateConversation } = useWebSocket();

// Conversation privée
const conversation = await createOrGetPrivateConversation('otherUserId');

// Conversation d'événement
const { createOrGetEventConversation } = useWebSocket();
const eventConversation = await createOrGetEventConversation('eventId', 'Event Title');
```

### Écouter les notifications

```typescript
useEffect(() => {
  const handleNewMessage = (event: CustomEvent) => {
    const { conversationId, message } = event.detail;
    // Afficher notification push, son, etc.
    showNotification(message.content, message.senderId);
  };

  window.addEventListener('conversationUpdate', handleNewMessage);
  
  return () => {
    window.removeEventListener('conversationUpdate', handleNewMessage);
  };
}, []);
```

### Vérifier statuts utilisateurs

```typescript
const { getUsersStatus } = useWebSocket();

const userIds = ['user1', 'user2', 'user3'];
const statuses = await getUsersStatus(userIds);
// [{ userId: 'user1', isOnline: true }, ...]
```

## Migration de l'ancien système

### Avant (système dual)
```typescript
// Ancien système
const { connect: connectLegacy } = useWebSocket(); // Legacy
const { connect: connectConv } = useConversationWebSocket(); // Modern
```

### Après (système unifié)
```typescript
// Nouveau système unifié
const { connect, sendMessage, sendMessageToConversation } = useWebSocket();

// Les méthodes legacy fonctionnent toujours
await sendMessage('recipientId', 'message'); // Automatiquement converti

// Mais les nouvelles méthodes sont recommandées
const conversation = await createOrGetPrivateConversation('recipientId');
await sendMessageToConversation(conversation._id, 'message');
```

## Résolution de problèmes

### WebSocket se déconnecte constamment
- Vérifier que l'utilisateur est authentifié (token valide)
- Vérifier les logs de reconnexion automatique
- S'assurer que le backend est accessible

### Erreur 401 Unauthorized
- Token d'authentification expiré ou invalide
- Redirection automatique vers `/connexion`
- Vider le localStorage/sessionStorage

### Messages non reçus en temps réel
- Vérifier que `isConnected` est `true`
- Vérifier que l'utilisateur a rejoint sa room (`joinUserRoom`)
- Écouter les événements DOM personnalisés

### Performance dégradée
- Le WebSocket utilise maintenant un seul système optimisé
- Pas de duplication de connexions
- Cache local pour affichage immédiat

## Avantages du système unifié

1. **Performance améliorée** : Une seule connexion WebSocket au lieu de deux
2. **Code plus maintenable** : Architecture unifiée et cohérente
3. **Compatibilité** : Support des anciennes méthodes pendant la transition
4. **Reconnexion intelligente** : Gestion robuste des déconnexions
5. **Notifications temps réel** : Système d'événements personnalisés pour les notifications
6. **Gestion d'erreur améliorée** : Redirection automatique en cas de problème d'auth

Le système est maintenant prêt pour implémenter des notifications push, sons, badges de compteur, etc.