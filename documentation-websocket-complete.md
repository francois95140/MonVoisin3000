# Documentation Complète : Système WebSocket et Conversations - MonVoisin3000

## Table des matières

1. [Vue d'ensemble du système](#vue-densemble-du-système)
2. [Architecture complète](#architecture-complète)
3. [Initialisation et bootstrapping](#initialisation-et-bootstrapping)
4. [Hooks vs Contexts - Pourquoi et comment](#hooks-vs-contexts---pourquoi-et-comment)
5. [Flux complet d'envoi et réception de message](#flux-complet-denvoi-et-réception-de-message)
6. [Système de requêtes : WebSocket vs REST API](#système-de-requêtes--websocket-vs-rest-api)
7. [Event Listeners et propagation des événements](#event-listeners-et-propagation-des-événements)
8. [Types de données et normalisation](#types-de-données-et-normalisation)
9. [Gestion des conversations](#gestion-des-conversations)
10. [Sécurité et authentification](#sécurité-et-authentification)
11. [Gestion des erreurs et fallbacks](#gestion-des-erreurs-et-fallbacks)
12. [Optimisations et performances](#optimisations-et-performances)

---

## Vue d'ensemble du système

MonVoisin3000 utilise un système de communication temps réel basé sur **Socket.io** avec **NestJS** côté serveur et **React** côté client. Le système gère deux types de communication :

### 1. **Messages directs** (Legacy)
- Communication 1-to-1 simple
- Géré par `WebSocketContext`
- Utilise `MessageGateway` côté serveur

### 2. **Conversations** (Moderne)
- Conversations privées et de groupe
- Conversations d'événements
- Géré par `ConversationWebSocketContext`
- Utilise `ConversationGateway` côté serveur

### Pourquoi deux systèmes ?
Le système moderne **Conversations** a été développé pour remplacer le système **Messages** legacy tout en gardant la compatibilité. Il apporte :
- **Conversations groupées** : Messages organisés par conversation
- **Intégration événements** : Chaque événement a sa propre discussion
- **Meilleure UX** : Interface plus moderne avec compteurs, statuts, etc.
- **Scalabilité** : Architecture plus robuste pour de nombreux participants

---

## Architecture complète

### Frontend (React)
```
src/
├── contexts/
│   ├── WebSocketContext.tsx          # Messages directs (legacy)
│   └── ConversationWebSocketContext.tsx  # Conversations (moderne)
├── hooks/
│   ├── useWebSocket.ts               # Hook alternatif aux contexts
│   ├── useConversations.ts           # Hook pour API REST conversations
│   └── useNewConversations.ts        # Hook principal conversations
├── section/conversations/
│   ├── Conversations.tsx             # Interface legacy
│   ├── NewConversations.tsx          # Interface moderne
│   ├── Chat.tsx                      # Chat messages directs
│   ├── NewChat.tsx                   # Chat conversations
│   └── types.ts                      # Types TypeScript
└── types/
    └── conversation.types.ts         # Types conversations
```

### Backend (NestJS)
```
voisin-api/src/
├── message/
│   ├── message.gateway.ts            # WebSocket messages directs
│   ├── conversation.gateway.ts       # WebSocket conversations  
│   ├── message.service.ts            # Service messages directs
│   ├── conversation.service.ts       # Service conversations
│   ├── conversation.controller.ts    # REST API conversations
│   └── entities/
│       ├── message.entity.ts         # Entity MongoDB messages
│       └── conversation.entity.ts    # Entity MongoDB conversations
```

---

## Initialisation et bootstrapping

### 1. Point d'entrée - Application Bootstrap

**Fichier :** `front/src/main.tsx`

```typescript
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <WebSocketProvider>                    {/* 🔥 CONTEXTE 1 : Messages directs */}
        <ConversationWebSocketProvider>      {/* 🔥 CONTEXTE 2 : Conversations */}
          <BrowserRouter basename={basename}>
            <AppLayout />
          </BrowserRouter>
        </ConversationWebSocketProvider>
      </WebSocketProvider>
    </ThemeProvider>
  </StrictMode>
);
```

**Ce qui se passe :**
1. **Montage des Providers** : Les deux contextes WebSocket sont instanciés au démarrage
2. **État initial** : `socket: null`, `isConnected: false` pour les deux contextes
3. **Aucune connexion réseau** : Les providers sont créés mais pas connectés
4. **Attente active** : Les contextes attendent l'appel de `connect(userId)`

### 2. Déclenchement de la connexion

#### Route `/convs` - Interface moderne

**Fichier :** `front/src/section/conversations/NewConversations.tsx`

```typescript
// 🔍 ÉTAPE 1 : Récupération de l'utilisateur connecté
useEffect(() => {
  const getUserId = async () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      // 🌐 PREMIÈRE REQUÊTE : REST API pour récupérer l'ID utilisateur
      const response = await fetch(`${apiUrl}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUserId(userData.id); // 🎯 DÉCLENCHEUR WebSocket
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }
  };

  getUserId();
}, []);

// 🚀 ÉTAPE 2 : Déclenchement de la connexion WebSocket
useEffect(() => {
  if (currentUserId) {
    console.log('🔌 Initialisation de la connexion WebSocket Conversations pour:', currentUserId);
    connect(currentUserId);  // 🚀 APPEL QUI DÉCLENCHE LA VRAIE CONNEXION
  }
}, [currentUserId, connect]);
```

### 3. Exécution de la connexion WebSocket

**Fichier :** `front/src/contexts/ConversationWebSocketContext.tsx`

```typescript
const connect = useCallback((userId: string) => {
  // ⚠️ PROTECTIONS : Éviter les connexions multiples
  if (isConnecting.current || (socketRef.current && socketRef.current.connected)) {
    console.log('⚠️ Connexion WebSocket déjà active, ignorée');
    return;
  }

  // ⚠️ RÉUTILISATION : Si même utilisateur et socket existante
  if (currentUserId.current === userId && socketRef.current) {
    console.log('⚠️ Même utilisateur, connexion existante conservée');
    return;
  }

  isConnecting.current = true; // 🔒 VERROU

  // 🧹 NETTOYAGE : Déconnexion ancienne socket
  if (socketRef.current) {
    socketRef.current.disconnect();
  }

  console.log('🔌 Connexion WebSocket Conversations pour utilisateur:', userId);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // 🚀 ICI : VRAIE REQUÊTE INITIALE WEBSOCKET !
  const newSocket = io(apiUrl, {
    transports: ['websocket', 'polling'],  // WebSocket prioritaire, HTTP polling fallback
    autoConnect: true,                     // Démarre connexion immédiatement
    reconnection: true,                    // Reconnexion auto en cas de perte
    reconnectionDelay: 1000,               // Délai entre tentatives : 1s
    reconnectionAttempts: 3,               // Max 3 tentatives
    timeout: 10000,                        // Timeout connexion : 10s
    forceNew: false                        // Réutilise connexion si possible
  });

  // 💾 STOCKAGE
  socketRef.current = newSocket;
  currentUserId.current = userId;
  setSocket(newSocket);
}, []);
```

### 4. Négociation WebSocket réseau

**Séquence de connexion :**

```
1. [Client] → [Server] : GET /socket.io/?transport=polling&t=xxx
   └─ Handshake HTTP initial avec transport polling

2. [Server] → [Client] : JSON Response
   └─ { sid: "session-id", upgrades: ["websocket"], pingTimeout: 60000 }

3. [Client] → [Server] : WebSocket Handshake
   └─ Upgrade: websocket, Connection: Upgrade

4. [Server] → [Client] : 101 Switching Protocols ✅
   └─ WebSocket établi

OU (si WebSocket échoue)

4. [Client] Continue HTTP long-polling 📡
   └─ Communication via POST/GET répétés
```

### 5. Événements de connexion et première communication

```typescript
// 📡 CONNEXION RÉUSSIE
newSocket.on('connect', () => {
  console.log('✅ Connecté au WebSocket Conversations');
  isConnecting.current = false;
  setIsConnected(true);
  
  // 🏠 PREMIÈRE COMMUNICATION : Rejoindre la room utilisateur
  console.log('🏠 Rejoindre la room pour utilisateur:', userId);
  newSocket.emit('joinUserRoom', { userId }, (response: any) => {
    if (response && response.success) {
      console.log('✅ Room rejointe avec succès:', response.message);
    } else {
      console.error('❌ Erreur lors de la jointure de room:', response);
    }
  });
});

// ❌ GESTION DÉCONNEXIONS
newSocket.on('disconnect', (reason) => {
  console.log('❌ Déconnecté du WebSocket Conversations. Raison:', reason);
  isConnecting.current = false;
  setIsConnected(false);
  
  if (reason === 'io client disconnect') {
    console.log('🔌 Déconnexion volontaire, pas de reconnexion');
  }
  // Autres raisons → reconnexion automatique par Socket.io
});
```

---

## Hooks vs Contexts - Pourquoi et comment

### Context vs Hook - Différences fondamentales

#### **Contexts React** (`WebSocketContext`, `ConversationWebSocketContext`)

**Avantages :**
- **État global** : Partagé à travers toute l'application
- **Singleton** : Une seule instance de connexion WebSocket par contexte
- **Persistance** : L'état survit aux changements de route
- **Performance** : Évite les reconnexions inutiles

**Utilisation :**
```typescript
// Provider au niveau racine
<ConversationWebSocketProvider>
  <App />
</ConversationWebSocketProvider>

// Utilisation dans n'importe quel composant enfant
const { connect, sendMessage, messages } = useConversationWebSocket();
```

**Inconvénients :**
- **Complexité** : Plus de code pour setup
- **Coupling** : Tous les composants partagent le même état

#### **Hook personnalisé** (`useWebSocket.ts`)

**Avantages :**
- **Simplicité** : Facile à utiliser, auto-contenu
- **Isolation** : Chaque composant a son propre état
- **Flexibilité** : Peut être configuré différemment par composant

**Utilisation :**
```typescript
const MyComponent = () => {
  const { socket, connect, messages } = useWebSocket();
  
  useEffect(() => {
    connect('user123');
  }, []);
  
  return <div>...</div>;
};
```

**Inconvénients :**
- **Duplication** : Plusieurs connexions WebSocket possibles
- **Performances** : Reconnexions à chaque montage de composant
- **État perdu** : Reset à chaque changement de route

### Hook utilitaire (`useNewConversations.ts`)

Ce hook **ne gère pas WebSocket** mais utilise le contexte + API REST :

```typescript
export const useNewConversations = (currentUserId: string | null) => {
  const { getUserConversations, getUnreadCounts, getUsersStatus, isConnected } = useConversationWebSocket();
  
  const loadConversations = useCallback(async () => {
    // 🚀 STRATÉGIE HYBRIDE : WebSocket prioritaire, REST fallback
    if (isConnected) {
      try {
        conversationData = await getUserConversations(1); // Via WebSocket
      } catch (wsError) {
        console.warn('Erreur WebSocket, fallback sur REST API:', wsError);
        // 📡 FALLBACK REST
        const response = await fetch(`${apiUrl}/api/conversations?page=1&limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } else {
      // 📡 REST DIRECT si WebSocket non connecté
      const response = await fetch(`${apiUrl}/api/conversations...`);
    }
  }, [isConnected, getUserConversations]);
  
  return { conversations, loading, error, refetch: loadConversations };
};
```

**Pourquoi cette approche ?**
- **Robustesse** : Fonctionne même si WebSocket échoue
- **Performances** : WebSocket plus rapide quand disponible
- **Compatibilité** : Supporte les environnements restreints
- **Graduabilité** : Migration progressive vers full-WebSocket

---

## Flux complet d'envoi et réception de message

### 📤 ENVOI DE MESSAGE

#### Étape 1 : Interface utilisateur (NewChat.tsx)
```typescript
const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!newMessage.trim() || isLoading) return;
  
  setIsLoading(true);
  try {
    let conversationId = conversation.conversationId;
    
    // Si pas de conversationId, créer ou récupérer la conversation privée
    if (!conversationId && conversation.userId && !conversation.isGroup) {
      console.log('🔄 Création/récupération de conversation privée avec:', conversation.userId);
      const conversationData = await createOrGetPrivateConversation(conversation.userId);
      conversationId = conversationData._id;
      console.log('✅ Conversation récupérée/créée:', conversationId);
    }

    if (!conversationId) {
      throw new Error('ID de conversation manquant');
    }

    // 🚀 ENVOI DU MESSAGE VIA WEBSOCKET
    console.log('📤 Envoi du message:', newMessage, 'vers conversation:', conversationId);
    const sentMessage = await sendMessageToConversation(conversationId, newMessage);
    console.log('✅ Message envoyé:', sentMessage);

    setNewMessage('');
    
    // Émettre événement de mise à jour pour les listes de conversations
    const conversationUpdateEvent = new CustomEvent('conversationUpdate', {
      detail: {
        type: 'newMessage',
        conversationId,
        message: sentMessage
      }
    });
    window.dispatchEvent(conversationUpdateEvent);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du message:', error);
  } finally {
    setIsLoading(false);
  }
};
```

#### Étape 2 : Contexte WebSocket (ConversationWebSocketContext.tsx)
```typescript
const sendMessageToConversation = useCallback(async (conversationId: string, content: string): Promise<MessageInConversation> => {
  if (!socketRef.current || !currentUserId.current) {
    throw new Error('WebSocket non connecté');
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout lors de l\'envoi du message'));
    }, 10000);

    // 🚀 ÉMISSION WEBSOCKET VERS LE SERVEUR
    socketRef.current!.emit('createMessageInConversation', {
      conversationId,
      senderId: currentUserId.current,
      content
    }, (response: any) => {
      clearTimeout(timeout);
      if (response && response.success) {
        console.log('✅ Message envoyé dans conversation avec succès:', response.data);
        
        // ✨ AJOUT IMMÉDIAT LOCAL (optimistic update)
        const newMessage = response.data.message;
        setMessages(prev => [...prev, newMessage]);
        
        resolve(newMessage);
      } else {
        console.error('❌ Erreur lors de l\'envoi du message:', response?.error || 'Erreur inconnue');
        reject(new Error(response?.error || 'Erreur lors de l\'envoi du message'));
      }
    });
  });
}, []);
```

#### Étape 3 : Gateway serveur (ConversationGateway.ts)
```typescript
@SubscribeMessage('createMessageInConversation')
async createMessage(
  @MessageBody() data: CreateMessageInConversationDto,
  @ConnectedSocket() client: AuthenticatedSocket
) {
  try {
    // 💾 SAUVEGARDE EN BASE DE DONNÉES
    const conversation = await this.conversationService.addMessage(data);
    const newMessage = conversation.messages[conversation.messages.length - 1];

    // 📡 BROADCAST : Émettre le message à tous les participants (sauf expéditeur)
    conversation.participant_ids.forEach(participantId => {
      if (participantId !== data.senderId) {
        this.server.to(`user_${participantId}`).emit('newMessageInConversation', {
          conversationId: conversation._id,
          message: newMessage,
          conversation: {
            _id: conversation._id,
            participant_ids: conversation.participant_ids,
            type: conversation.type,
            name: conversation.name,
            updatedAt: conversation.updatedAt
          }
        });
      }
    });

    // ✅ RÉPONSE À L'EXPÉDITEUR
    return {
      success: true,
      data: {
        conversationId: conversation._id,
        message: newMessage
      },
      message: 'Message créé avec succès'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

#### Étape 4 : Service métier (ConversationService.ts)
```typescript
async addMessage(createMessageDto: CreateMessageInConversationDto): Promise<ConversationDocument> {
  const conversation = await this.conversationModel.findById(createMessageDto.conversationId);
  if (!conversation) {
    throw new NotFoundException('Conversation non trouvée');
  }

  // ✅ VÉRIFICATION PERMISSIONS
  if (!conversation.participant_ids.includes(createMessageDto.senderId)) {
    throw new ForbiddenException('Utilisateur non autorisé à envoyer un message dans cette conversation');
  }

  // 📝 CRÉATION DU MESSAGE
  const newMessage = {
    _id: new Types.ObjectId(),
    senderId: createMessageDto.senderId,
    content: createMessageDto.content,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // 💾 AJOUT À LA CONVERSATION
  conversation.messages.push(newMessage);
  conversation.updatedAt = new Date();

  return await conversation.save();
}
```

### 📥 RÉCEPTION DE MESSAGE

#### Étape 1 : Event listener WebSocket (ConversationWebSocketContext.tsx)
```typescript
// 📩 ÉCOUTER LES NOUVEAUX MESSAGES DANS LES CONVERSATIONS
newSocket.on('newMessageInConversation', (data: {
  conversationId: string;
  message: MessageInConversation;
  conversation: {
    _id: string;
    participant_ids: string[];
    type: string;
    name?: string;
    updatedAt: string;
  };
}) => {
  console.log('📩 Nouveau message dans conversation reçu:', data);
  
  // ✨ AJOUT LOCAL IMMÉDIAT
  setMessages(prev => [...prev, data.message]);
  
  // 🌐 PROPAGATION : Événement DOM pour notifier les composants
  const conversationUpdateEvent = new CustomEvent('conversationUpdate', {
    detail: {
      type: 'newMessage',
      conversationId: data.conversationId,
      message: data.message,
      conversation: data.conversation
    }
  });
  window.dispatchEvent(conversationUpdateEvent);
});
```

#### Étape 2 : Hook de gestion des conversations (useNewConversations.ts)
```typescript
// 👂 ÉCOUTER LES ÉVÉNEMENTS DE MISE À JOUR DES CONVERSATIONS
useEffect(() => {
  const handleConversationUpdate = (event: CustomEvent) => {
    const { type, conversationId, message } = event.detail;
    
    if (type === 'newMessage' && currentUserId) {
      console.log('🔔 Mise à jour conversation pour nouveau message:', message);
      
      // 🔄 METTRE À JOUR LA LISTE DES CONVERSATIONS
      setConversations(prevConversations => {
        const existingIndex = prevConversations.findIndex(
          conv => conv.conversationId === conversationId
        );
        
        if (existingIndex !== -1) {
          const updatedConversations = [...prevConversations];
          const conversation = updatedConversations[existingIndex];
          
          // ✨ MISE À JOUR DES DÉTAILS
          conversation.lastMessage = message.content;
          conversation.time = formatTime(message.createdAt);
          
          // 🔝 DÉPLACER LA CONVERSATION EN HAUT
          updatedConversations.splice(existingIndex, 1);
          updatedConversations.unshift(conversation);
          
          return updatedConversations;
        }
      });
      
      // 🔢 MISE À JOUR DES COMPTEURS NON LUS
      setTimeout(async () => {
        try {
          if (isConnected) {
            const unreadCounts = await getUnreadCounts();
            setConversations(prevConversations => 
              prevConversations.map(conv => {
                const unreadData = unreadCounts.find(uc => uc.conversationId === conv.conversationId);
                return unreadData ? { ...conv, unread: unreadData.unreadCount } : conv;
              })
            );
          }
        } catch (error) {
          console.warn('Erreur lors de la mise à jour des compteurs:', error);
        }
      }, 200);
    }
  };

  window.addEventListener('conversationUpdate', handleConversationUpdate as EventListener);
  return () => {
    window.removeEventListener('conversationUpdate', handleConversationUpdate as EventListener);
  };
}, [currentUserId, loadConversations]);
```

#### Étape 3 : Interface utilisateur mise à jour
Les composants React se re-renderisent automatiquement grâce aux états mis à jour :
- `messages` dans le contexte → Affichage temps réel du nouveau message
- `conversations` dans le hook → Mise à jour de la liste avec dernier message
- `unread` counts → Badges de notification mis à jour

---

## Système de requêtes : WebSocket vs REST API

### Architecture hybride

MonVoisin3000 utilise une **stratégie hybride** combinant WebSocket et REST selon les cas d'usage :

#### 🚀 **WebSocket prioritaire pour :**
- **Messages temps réel** : Envoi/réception instantanés
- **Statuts utilisateurs** : En ligne/hors ligne
- **Notifications** : Messages lus, typing indicators
- **Données légères** : Requêtes rapides et fréquentes

#### 📡 **REST API pour :**
- **Initialisation** : Chargement des données de base
- **Opérations CRUD** : Création/modification des conversations
- **Pagination** : Chargement de gros volumes
- **Fallback** : Si WebSocket indisponible

### Exemples concrets

#### Messages - WebSocket uniquement
```typescript
// ✅ ENVOI
socket.emit('createMessageInConversation', { conversationId, content });

// ✅ RÉCEPTION  
socket.on('newMessageInConversation', (data) => { ... });
```

#### Conversations - Hybride WebSocket + REST
```typescript
// 🚀 ESSAI WEBSOCKET EN PREMIER
if (isConnected) {
  try {
    conversationData = await getUserConversations(1); // WebSocket
  } catch (wsError) {
    // 📡 FALLBACK REST
    const response = await fetch(`${apiUrl}/api/conversations`);
  }
}
```

#### Informations utilisateurs - REST uniquement
```typescript
// 📡 TOUJOURS REST (données statiques)
const response = await fetch(`${apiUrl}/api/users/${userId}`);
const friendsResponse = await fetch(`${apiUrl}/api/friends`);
```

### Stratégie de fallback intelligente

```typescript
const loadConversations = useCallback(async () => {
  // 🔍 DÉTECTION CAPACITÉS
  if (isConnected) {
    try {
      // 🚀 TENTATIVE WEBSOCKET
      conversationData = await getUserConversations(1);
      console.log('✅ Données récupérées via WebSocket');
    } catch (wsError) {
      console.warn('⚠️ WebSocket échoué, fallback REST:', wsError);
      // 📡 FALLBACK REST AUTOMATIQUE
      const response = await fetch(`${apiUrl}/api/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        conversationData = await response.json();
        console.log('✅ Données récupérées via REST');
      }
    }
  } else {
    // 📡 REST DIRECT si pas de WebSocket
    console.log('🔌 WebSocket non connecté, utilisation REST');
    const response = await fetch(`${apiUrl}/api/conversations`);
  }
}, [isConnected, getUserConversations]);
```

### Avantages de cette approche

1. **Résilience** : L'application fonctionne même si WebSocket échoue
2. **Performance** : WebSocket plus rapide quand disponible
3. **Compatibilité** : Supporte les réseaux restrictifs (proxy, firewall)
4. **Migration douce** : Transition progressive vers full-WebSocket
5. **Debugging** : Plus facile de débugger avec REST en fallback

---

## Event Listeners et propagation des événements

### Architecture des événements

MonVoisin3000 utilise **trois niveaux d'événements** :

1. **WebSocket Events** : Communication serveur ↔ client
2. **DOM Custom Events** : Communication inter-composants React  
3. **React State Events** : Re-rendering automatique des composants

### 1. WebSocket Event Listeners

#### Définition côté client (Contexts)
```typescript
// 📡 ÉCOUTE WEBSOCKET DEPUIS LE SERVEUR
newSocket.on('newMessageInConversation', (data) => {
  console.log('📩 WebSocket event reçu:', data);
  
  // ✨ MISE À JOUR STATE LOCAL
  setMessages(prev => [...prev, data.message]);
  
  // 🌐 CONVERSION EN CUSTOM EVENT DOM
  const conversationUpdateEvent = new CustomEvent('conversationUpdate', {
    detail: { type: 'newMessage', message: data.message }
  });
  window.dispatchEvent(conversationUpdateEvent);
});

newSocket.on('userStatusChanged', (data) => {
  console.log('👤 Changement statut:', data);
  
  // 🌐 PROPAGATION DOM
  window.dispatchEvent(new CustomEvent('userStatusChanged', { detail: data }));
});

newSocket.on('messagesMarkedAsRead', (data) => {
  console.log('👀 Messages lus:', data);
  
  // 🌐 PROPAGATION DOM
  window.dispatchEvent(new CustomEvent('conversationUpdate', {
    detail: { type: 'messagesRead', conversationId: data.conversationId }
  }));
});
```

#### Émission côté serveur (Gateways)
```typescript
// 📡 ÉMISSION WEBSOCKET VERS CLIENTS
@SubscribeMessage('createMessageInConversation')
async createMessage(data, client) {
  const conversation = await this.service.addMessage(data);
  
  // 🎯 CIBLAGE PARTICIPANTS (sans expéditeur)
  conversation.participant_ids.forEach(participantId => {
    if (participantId !== data.senderId) {
      this.server.to(`user_${participantId}`).emit('newMessageInConversation', {
        conversationId: conversation._id,
        message: newMessage,
        conversation: conversationMeta
      });
    }
  });
  
  return { success: true, data: newMessage };
}

// 🌐 BROADCAST GLOBAL (tous les utilisateurs connectés)
this.server.emit('userStatusChanged', { userId, isOnline: true });

// 🎯 ÉMISSION CIBLÉE (utilisateur spécifique)
this.server.to(`user_${recipientId}`).emit('newMessage', message);
```

### 2. DOM Custom Events

#### Pourquoi utiliser le DOM comme bus d'événements ?

**Problème** : Les contextes React sont isolés des composants enfants profonds
**Solution** : Utiliser `window` comme bus d'événements global

```typescript
// ❌ PROBLÈME : Ne fonctionne pas entre contexts et composants distants
const context = useContext(MyContext);
context.notifyOtherComponent(); // Impossible sans prop drilling

// ✅ SOLUTION : Événements DOM globaux
window.dispatchEvent(new CustomEvent('myEvent', { detail: data }));
```

#### Pattern d'utilisation

**Émission (dans les contexts) :**
```typescript
// 🌐 CRÉATION ET ÉMISSION D'ÉVÉNEMENT CUSTOM
const statusChangeEvent = new CustomEvent('userStatusChanged', {
  detail: { userId: 'user123', isOnline: true }
});
window.dispatchEvent(statusChangeEvent);

const conversationEvent = new CustomEvent('conversationUpdate', {
  detail: { 
    type: 'newMessage',
    conversationId: 'conv456', 
    message: messageData 
  }
});
window.dispatchEvent(conversationEvent);
```

**Écoute (dans les composants) :**
```typescript
// 👂 ÉCOUTE D'ÉVÉNEMENTS CUSTOM
useEffect(() => {
  const handleUserStatusChange = (event: CustomEvent) => {
    const { userId, isOnline } = event.detail;
    if (userId === conversation.userId) {
      setUserIsOnline(isOnline);
    }
  };

  const handleConversationUpdate = (event: CustomEvent) => {
    const { type, conversationId, message } = event.detail;
    if (type === 'newMessage') {
      updateConversationInList(conversationId, message);
    }
  };

  // 🔗 AJOUT DES LISTENERS
  window.addEventListener('userStatusChanged', handleUserStatusChange as EventListener);
  window.addEventListener('conversationUpdate', handleConversationUpdate as EventListener);
  
  // 🧹 NETTOYAGE AU DÉMONTAGE
  return () => {
    window.removeEventListener('userStatusChanged', handleUserStatusChange as EventListener);
    window.removeEventListener('conversationUpdate', handleConversationUpdate as EventListener);
  };
}, [conversation.userId]);
```

### 3. Flux complet des événements

```
[Serveur NestJS]
    ↓ (socket.emit)
[Client WebSocket Context] socket.on('newMessageInConversation')
    ↓ (setMessages) 
[React State Update]
    ↓ (window.dispatchEvent)
[DOM Custom Event] 'conversationUpdate'
    ↓ (window.addEventListener)
[Hook useNewConversations] handleConversationUpdate
    ↓ (setConversations)
[React State Update]
    ↓ (re-render)
[UI Component] Liste conversations mise à jour
```

### 4. Types d'événements personnalisés

#### `userStatusChanged`
```typescript
detail: {
  userId: string;
  isOnline: boolean;
}

// Utilisé pour : Statut en ligne/hors ligne dans l'interface
```

#### `conversationUpdate` 
```typescript
detail: {
  type: 'newMessage' | 'messagesRead';
  conversationId?: string;
  message?: MessageInConversation;
  conversation?: ConversationMeta;
  markedCount?: number;
}

// Utilisé pour : Mise à jour listes conversations, compteurs
```

### 5. Avantages de cette architecture

1. **Découplage** : Composants indépendants des contexts
2. **Scalabilité** : N'importe quel composant peut écouter
3. **Performance** : Événements légers, pas de prop drilling
4. **Flexibilité** : Facile d'ajouter de nouveaux listeners
5. **Debugging** : Events visibles dans DevTools

### 6. Event Listeners WebSocket complets

#### Dans `ConversationWebSocketContext`
```typescript
// 📩 NOUVEAU MESSAGE DANS CONVERSATION
newSocket.on('newMessageInConversation', (data) => { ... });

// 👀 MESSAGES MARQUÉS COMME LUS
newSocket.on('messagesMarkedAsRead', (data) => { ... });

// 👤 CHANGEMENT STATUT UTILISATEUR
newSocket.on('userStatusChanged', (data) => { ... });

// 🔌 ÉVÉNEMENTS CONNEXION
newSocket.on('connect', () => { ... });
newSocket.on('disconnect', (reason) => { ... });
newSocket.on('connect_error', (error) => { ... });
```

#### Dans `WebSocketContext` (legacy)
```typescript
// 📩 NOUVEAU MESSAGE DIRECT
newSocket.on('newMessage', (message) => { ... });

// ✏️ MESSAGE MIS À JOUR
newSocket.on('messageUpdated', (message) => { ... });

// 🗑️ MESSAGE SUPPRIMÉ
newSocket.on('messageDeleted', (data) => { ... });

// 👀 MESSAGE LU
newSocket.on('messageRead', (data) => { ... });

// 👤 CHANGEMENT STATUT UTILISATEUR
newSocket.on('userStatusChanged', (data) => { ... });
```

---

## Types de données et normalisation

### Architecture des données

MonVoisin3000 gère deux formats de données différents selon le système utilisé :

### 1. Messages directs (Legacy) - `Message`

```typescript
interface Message {
  id: string;                    // ID normalisé (depuis _id MongoDB)
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender?: {
    id: string;
    pseudo: string;
    avatar?: string;
  };
  recipient?: {
    id: string;
    pseudo: string;
    avatar?: string;
  };
}
```

### 2. Conversations modernes - Types complexes

#### `MessageInConversation`
```typescript
interface MessageInConversation {
  _id: string;                   // ID MongoDB (pas normalisé)
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;            // Soft delete
}
```

#### `ConversationData`
```typescript
interface ConversationData {
  _id: string;                   // ID MongoDB
  participant_ids: string[];     // Tous les participants
  type: 'private' | 'group';
  messages: MessageInConversation[];
  name?: string;                 // Pour les groupes
  description?: string;
  avatar?: string;
  adminIds?: string[];           // Administrateurs du groupe
  eventId?: string;              // Si conversation d'événement
  eventIcon?: string;            // Icône de l'événement
  createdAt: string;
  updatedAt: string;
}
```

#### `ConversationWithMessages` (avec pagination)
```typescript
interface ConversationWithMessages {
  conversation: {
    _id: string;
    participant_ids: string[];
    type: 'private' | 'group';
    name?: string;
    description?: string;
    avatar?: string;
    adminIds?: string[];
    createdAt: string;
    updatedAt: string;
  };
  messages: MessageInConversation[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
```

### 3. Types d'affichage - Interface utilisateur

#### `Conversation` (pour les listes)
```typescript
interface Conversation {
  id: string;                    // ID pour React keys
  name: string;                  // Nom affiché
  avatar: {
    type: 'image' | 'icon' | 'initials';
    value: string;               // URL, nom d'icône, ou initiales
    gradient: string;            // Classes CSS Tailwind
  };
  lastMessage: string;           // Dernier message affiché
  time: string;                  // Temps formaté ("Now", "14:30", "Lun")
  unread: number;                // Nombre de messages non lus
  isOnline: boolean;             // Statut en ligne (pour conv. privées)
  isGroup: boolean;              // true pour les groupes
  userId: string;                // ID autre utilisateur (conv. privées)
  conversationId: string;        // ID réel de la conversation
  participantIds: string[];      // Tous les participants
}
```

### 4. Processus de normalisation

#### Messages directs : MongoDB → Interface
```typescript
// 🔄 NORMALISATION dans WebSocketContext
const normalizedMessage: Message = {
  id: message._id || message.id,  // MongoDB _id → id standard
  senderId: message.senderId,
  recipientId: message.recipientId,
  content: message.content,
  createdAt: message.createdAt,
  isRead: message.isRead,
  sender: message.sender,
  recipient: message.recipient
};

setMessages(prev => [...prev, normalizedMessage]);
```

#### Conversations : MongoDB → Interface d'affichage
```typescript
// 🔄 TRANSFORMATION COMPLEXE dans useNewConversations
const formattedConversations: Conversation[] = conversationData.conversations.map((convData: ConversationData) => {
  // 👤 IDENTIFICATION AUTRE PARTICIPANT (conversations privées)
  let otherParticipant: Friend | undefined;
  if (convData.type === 'private') {
    const otherUserId = convData.participant_ids.find(id => id !== currentUserId);
    otherParticipant = allUsers.find(user => user.id === otherUserId);
  }

  // 💬 DERNIER MESSAGE
  const lastMessage = convData.messages && convData.messages.length > 0 
    ? convData.messages[convData.messages.length - 1] 
    : null;

  // 🔢 MESSAGES NON LUS
  const unreadData = unreadCounts.find(uc => uc.conversationId === convData._id);
  const unreadCount = unreadData ? unreadData.unreadCount : 0;

  // 🟢 STATUT EN LIGNE
  let isOnline = false;
  if (otherParticipant) {
    const userStatus = userStatuses.find(s => s.userId === otherParticipant!.id);
    isOnline = userStatus?.isOnline ?? false;
  }

  // 🎨 AVATAR INTELLIGENT
  let avatar;
  if (convData.type === 'group' && convData.eventId && convData.eventIcon) {
    // 🎉 Conversation d'événement : icône événement
    avatar = {
      type: 'icon' as const,
      value: convData.eventIcon,
      gradient: 'from-green-400 to-emerald-600'
    };
  } else if (avatarUrl) {
    // 🖼️ Image disponible
    avatar = { type: 'image' as const, value: avatarUrl };
  } else {
    // 🔤 Initiales comme fallback
    avatar = { 
      type: 'initials' as const, 
      value: name.substring(0, 2).toUpperCase(),
      gradient: `from-${getRandomColor()}-400 to-${getRandomColor()}-600`
    };
  }

  // ⏰ FORMATAGE TEMPS INTELLIGENT
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Now';
    else if (diffInHours < 24) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    else if (diffInHours < 168) return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    else return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return {
    id: convData._id,
    name: convData.type === 'group' ? (convData.name || 'Groupe') : (otherParticipant?.pseudo || 'Utilisateur'),
    avatar,
    lastMessage: lastMessage?.content || 'Aucun message',
    time: lastMessage ? formatTime(lastMessage.createdAt) : '',
    unread: unreadCount,
    isOnline,
    isGroup: convData.type === 'group',
    userId: convData.type === 'private' ? (otherParticipant?.id || '') : '',
    conversationId: convData._id,
    participantIds: convData.participant_ids
  };
});
```

### 5. Types utilitaires

#### `UnreadCount`
```typescript
interface UnreadCount {
  conversationId: string;
  unreadCount: number;
  lastMessage?: MessageInConversation;
}
```

#### `Friend` (utilisateurs amis)
```typescript
interface Friend {
  id: string;
  pseudo: string;
  avatar?: string;
  tag?: string;
  isOnline?: boolean;
}
```

#### `User` (utilisateurs génériques)
```typescript
interface User {
  id: string;
  pseudo: string;
  avatar?: string;
  tag?: string;
  isOnline?: boolean;
}
```

### 6. Validation et sécurité types

#### Côté serveur (NestJS + Zod)
```typescript
import { z } from 'zod';

export const createMessageInConversationSchema = z.object({
  conversationId: z.string().min(1, 'ID de conversation requis'),
  senderId: z.string().min(1, 'ID expéditeur requis'),
  content: z.string().min(1, 'Contenu requis').max(2000, 'Message trop long')
});

export type CreateMessageInConversationDto = z.infer<typeof createMessageInConversationSchema>;
```

#### Côté client (TypeScript strict)
```typescript
// 🔒 TYPES STRICTS pour éviter les erreurs runtime
const sendMessage = async (conversationId: string, content: string): Promise<MessageInConversation> => {
  if (!conversationId || !content.trim()) {
    throw new Error('Paramètres manquants');
  }
  
  // Types garantis par TypeScript
  const response = await socketEmit('createMessageInConversation', {
    conversationId,
    senderId: currentUserId.current!,
    content: content.trim()
  });
  
  return response.data.message as MessageInConversation;
};
```

Cette architecture de types permet de gérer la complexité des différents formats tout en maintenant la cohérence et la sécurité des données.

---

## Gestion des conversations

### Types de conversations supportées

MonVoisin3000 gère **trois types** de conversations :

1. **Conversations privées** : 2 utilisateurs uniquement
2. **Conversations de groupe** : 3+ utilisateurs, créées manuellement  
3. **Conversations d'événement** : Groupe automatique lié à un événement

### 1. Conversations privées

#### Création/Récupération automatique
```typescript
// 🔄 STRATÉGIE : Créer si n'existe pas, récupérer si existe
const createOrGetPrivateConversation = useCallback(async (otherUserId: string): Promise<ConversationData> => {
  if (!socketRef.current) {
    throw new Error('WebSocket non connecté');
  }

  return new Promise((resolve, reject) => {
    socketRef.current!.emit('createOrGetPrivateConversation', {
      otherUserId
    }, (response: any) => {
      if (response && response.success) {
        console.log('✅ Conversation privée créée/récupérée:', response.data);
        resolve(response.data);
      } else {
        reject(new Error(response?.error || 'Erreur conversation privée'));
      }
    });
  });
}, []);
```

#### Côté serveur - Logique intelligente
```typescript
// 🎯 RECHERCHE D'UNE CONVERSATION EXISTANTE
async findOrCreatePrivateConversation(userId1: string, userId2: string): Promise<ConversationDocument> {
  if (userId1 === userId2) {
    throw new BadRequestException('Un utilisateur ne peut pas avoir une conversation avec lui-même');
  }

  // 🔍 CHERCHER CONVERSATION EXISTANTE
  const existingConversation = await this.conversationModel.findOne({
    type: ConversationType.Private,
    participant_ids: { $all: [userId1, userId2] }  // MongoDB : tous les IDs présents
  });

  if (existingConversation) {
    return existingConversation; // ✅ RETOURNER L'EXISTANTE
  }

  // 🆕 CRÉER NOUVELLE CONVERSATION
  const newConversation = new this.conversationModel({
    participant_ids: [userId1, userId2],
    type: ConversationType.Private,
    messages: []
  });

  return await newConversation.save();
}
```

### 2. Conversations de groupe manuelles

#### Création avec participants multiples
```typescript
// 🏗️ CRÉATION GROUPE AVEC VALIDATION
async createGroupConversation(createConversationDto: CreateConversationDto): Promise<ConversationDocument> {
  if (createConversationDto.participant_ids.length < 3) {
    throw new BadRequestException('Une conversation de groupe doit avoir au moins 3 participants');
  }

  const newConversation = new this.conversationModel({
    participant_ids: createConversationDto.participant_ids,
    type: ConversationType.Group,
    name: createConversationDto.name,
    description: createConversationDto.description,
    avatar: createConversationDto.avatar,
    adminIds: createConversationDto.adminIds || [createConversationDto.participant_ids[0]], // Premier = admin
    messages: []
  });

  return await newConversation.save();
}
```

### 3. Conversations d'événement

#### Intégration avec le système d'événements
```typescript
// 🎉 CONVERSATION LIÉE À UN ÉVÉNEMENT
const createOrGetEventConversation = useCallback(async (eventId: string, eventTitle: string): Promise<ConversationData> => {
  if (!socketRef.current) {
    throw new Error('WebSocket non connecté');
  }

  return new Promise((resolve, reject) => {
    socketRef.current!.emit('createOrGetEventConversation', {
      eventId,
      eventTitle
    }, (response: any) => {
      if (response && response.success) {
        console.log('✅ Conversation d\'événement créée/récupérée:', response.data);
        resolve(response.data);
      } else {
        reject(new Error(response?.error || 'Erreur conversation événement'));
      }
    });
  });
}, []);
```

#### Côté serveur - Synchronisation avec les événements
```typescript
@SubscribeMessage('createOrGetEventConversation')
async createOrGetEventConversation(
  @MessageBody() data: { eventId: string; eventTitle: string },
  @ConnectedSocket() client: AuthenticatedSocket
) {
  try {
    if (!client.userId) {
      return { success: false, error: 'Utilisateur non authentifié' };
    }

    // 🎯 RÉCUPÉRER LES PARTICIPANTS DE L'ÉVÉNEMENT
    const eventDetails = await this.eventService.getEventForConversation(data.eventId);

    // 🔒 VÉRIFICATION : Utilisateur doit participer à l'événement
    if (!eventDetails.participantIds.includes(client.userId)) {
      return {
        success: false,
        error: 'Vous devez participer à cet événement pour accéder à sa discussion'
      };
    }

    // 🔄 CRÉER OU RÉCUPÉRER
    const conversation = await this.conversationService.findOrCreateEventConversation(
      data.eventId,
      data.eventTitle,
      eventDetails.eventIcon,
      eventDetails.participantIds
    );
    
    return { success: true, data: conversation };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

#### Service - Mise à jour dynamique des participants
```typescript
// 🔄 SYNCHRONISATION PARTICIPANTS ÉVÉNEMENT
async findOrCreateEventConversation(eventId: string, eventTitle: string, eventIcon: string, participantIds: string[]): Promise<ConversationDocument> {
  // 🔍 CHERCHER CONVERSATION ÉVÉNEMENT EXISTANTE
  const existingConversation = await this.conversationModel.findOne({
    type: ConversationType.Group,
    eventId: eventId
  });

  if (existingConversation) {
    // 🔄 METTRE À JOUR LES PARTICIPANTS (nouveaux inscrits)
    const newParticipants = participantIds.filter(id => !existingConversation.participant_ids.includes(id));
    if (newParticipants.length > 0) {
      existingConversation.participant_ids.push(...newParticipants);
      existingConversation.updatedAt = new Date();
      await existingConversation.save();
      console.log(`✅ ${newParticipants.length} nouveaux participants ajoutés à l'événement ${eventId}`);
    }
    return existingConversation;
  }

  // 🆕 CRÉER NOUVELLE CONVERSATION D'ÉVÉNEMENT
  const newConversation = new this.conversationModel({
    participant_ids: participantIds,
    type: ConversationType.Group,
    name: `${eventTitle}`,
    description: `Discussion pour l'événement: ${eventTitle}`,
    eventId: eventId,
    eventIcon: eventIcon,
    messages: [],
    adminIds: [] // Pas d'admin spécifique pour les événements
  });

  return await newConversation.save();
}
```

### 4. Gestion des permissions

#### Vérification des autorisations
```typescript
// 🔒 VALIDATION PERMISSIONS AVANT ENVOI MESSAGE
async addMessage(createMessageDto: CreateMessageInConversationDto): Promise<ConversationDocument> {
  const conversation = await this.conversationModel.findById(createMessageDto.conversationId);
  if (!conversation) {
    throw new NotFoundException('Conversation non trouvée');
  }

  // ✅ VÉRIFIER QUE L'UTILISATEUR FAIT PARTIE DE LA CONVERSATION
  if (!conversation.participant_ids.includes(createMessageDto.senderId)) {
    throw new ForbiddenException('Utilisateur non autorisé à envoyer un message dans cette conversation');
  }

  // 🆕 CRÉER ET AJOUTER LE MESSAGE
  const newMessage = {
    _id: new Types.ObjectId(),
    senderId: createMessageDto.senderId,
    content: createMessageDto.content,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  conversation.messages.push(newMessage);
  conversation.updatedAt = new Date();

  return await conversation.save();
}
```

### 5. Récupération et pagination

#### Chargement des messages d'une conversation
```typescript
// 📄 PAGINATION DES MESSAGES
async getConversationMessages({
  conversationId,
  userId,
  page = 1,
  limit = 50
}: GetConversationMessagesDto): Promise<ConversationWithMessages> {
  
  // 🔍 RÉCUPÉRER LA CONVERSATION
  const conversation = await this.conversationModel.findById(conversationId);
  if (!conversation) {
    throw new NotFoundException('Conversation non trouvée');
  }

  // 🔒 VÉRIFIER PERMISSIONS
  if (!conversation.participant_ids.includes(userId)) {
    throw new ForbiddenException('Accès non autorisé à cette conversation');
  }

  // 🗑️ FILTRER LES MESSAGES SUPPRIMÉS
  const activeMessages = conversation.messages.filter(msg => !msg.deletedAt);
  
  // 📄 CALCULS PAGINATION
  const totalCount = activeMessages.length;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  // 🔄 MESSAGES PAGINÉS (plus récents en premier)
  const sortedMessages = activeMessages.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const paginatedMessages = sortedMessages.slice(startIndex, endIndex);

  return {
    conversation: {
      _id: conversation._id,
      participant_ids: conversation.participant_ids,
      type: conversation.type,
      name: conversation.name,
      description: conversation.description,
      avatar: conversation.avatar,
      adminIds: conversation.adminIds,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    },
    messages: paginatedMessages,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
}
```

### 6. Compteurs de messages non lus

#### Par conversation
```typescript
// 🔢 COMPTEUR MESSAGES NON LUS PAR CONVERSATION
async getUnreadCountsByUser(userId: string): Promise<UnreadCount[]> {
  const conversations = await this.conversationModel.find({
    participant_ids: userId
  });

  return conversations.map(conversation => {
    const unreadMessages = conversation.messages.filter(msg => 
      msg.senderId !== userId &&  // Pas ses propres messages
      !msg.isRead &&             // Non lus
      !msg.deletedAt             // Non supprimés
    );

    return {
      conversationId: conversation._id.toString(),
      unreadCount: unreadMessages.length,
      lastMessage: unreadMessages[unreadMessages.length - 1] || undefined
    };
  }).filter(count => count.unreadCount > 0); // Seulement celles avec messages non lus
}
```

#### Total global
```typescript
// 🔢 COMPTEUR GLOBAL MESSAGES NON LUS
async getTotalUnreadCount(userId: string): Promise<number> {
  const unreadCounts = await this.getUnreadCountsByUser(userId);
  return unreadCounts.reduce((total, count) => total + count.unreadCount, 0);
}
```

### 7. Marquage comme lu

#### Messages d'un expéditeur spécifique
```typescript
// 👀 MARQUER MESSAGES COMME LUS
async markMessagesAsRead({
  conversationId,
  userId,
  fromSenderId
}: MarkMessagesAsReadDto): Promise<{ markedCount: number }> {
  
  const conversation = await this.conversationModel.findById(conversationId);
  if (!conversation) {
    throw new NotFoundException('Conversation non trouvée');
  }

  if (!conversation.participant_ids.includes(userId)) {
    throw new ForbiddenException('Accès non autorisé');
  }

  // 🎯 MESSAGES À MARQUER
  const messagesToMark = conversation.messages.filter(msg => 
    msg.senderId !== userId &&                    // Pas ses propres messages
    !msg.isRead &&                               // Non lus
    !msg.deletedAt &&                            // Non supprimés
    (!fromSenderId || msg.senderId === fromSenderId) // De l'expéditeur spécifique si précisé
  );

  // ✅ MARQUAGE
  messagesToMark.forEach(msg => {
    msg.isRead = true;
    msg.updatedAt = new Date();
  });

  await conversation.save();

  return { markedCount: messagesToMark.length };
}
```

Cette architecture de gestion des conversations permet une grande flexibilité tout en maintenant la cohérence et les performances du système.

---

## Sécurité et authentification

### Système d'authentification multicouche

MonVoisin3000 implémente une sécurité robuste à **plusieurs niveaux** :

1. **Authentification JWT** : Tokens sécurisés
2. **Autorisation WebSocket** : Vérification des permissions en temps réel  
3. **Validation des données** : Sanitisation et validation stricte
4. **Isolation des conversations** : Accès restreint aux participants

### 1. Authentification JWT

#### Stockage côté client
```typescript
// 🔐 RÉCUPÉRATION TOKEN DEPUIS STORAGE
const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

// 📡 UTILISATION DANS LES REQUÊTES
const response = await fetch(`${apiUrl}/api/users/me`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

#### Validation côté serveur
```typescript
// 🛡️ GUARD D'AUTHENTIFICATION (NestJS)
@Controller('api/conversations')
@UseGuards(AuthGuard)  // 🔒 PROTECTION GLOBALE DU CONTROLLER
export class ConversationController {
  
  @Post('private')
  async findOrCreatePrivateConversation(@Body() body: { otherUserId: string }, @Request() req) {
    const currentUserId = req.user.id;  // 🎯 ID UTILISATEUR DEPUIS TOKEN
    // ... logique métier
  }
}

// 🔍 IMPLÉMENTATION DU GUARD
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      request.user = payload;  // 💾 STOCKAGE INFO UTILISATEUR
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token invalide');
    }
  }
}
```

### 2. Sécurité WebSocket

#### Association utilisateur ↔ socket
```typescript
// 🔐 AUTHENTIFICATION WEBSOCKET
@SubscribeMessage('joinUserRoom')
handleJoinRoom(
  @MessageBody() data: { userId: string },
  @ConnectedSocket() client: AuthenticatedSocket
) {
  // 🔒 VALIDATION : L'utilisateur ne peut rejoindre que SA propre room
  // TODO: Ajouter validation JWT sur les WebSockets
  
  client.userId = data.userId;           // 💾 ASSOCIATION
  client.join(`user_${data.userId}`);    // 🏠 ROOM SÉCURISÉE
  
  this.connectedUsers.set(data.userId, client.id);
  
  return { success: true };
}

// 🚨 INTERFACE SOCKET AUTHENTIFIÉE
interface AuthenticatedSocket extends Socket {
  userId?: string;  // ID utilisateur lié à cette socket
}
```

#### Vérification des permissions en temps réel
```typescript
@SubscribeMessage('createMessageInConversation')
async createMessage(
  @MessageBody() data: CreateMessageInConversationDto,
  @ConnectedSocket() client: AuthenticatedSocket
) {
  // 🔒 VÉRIFICATION 1 : Socket authentifiée
  if (!client.userId) {
    return { success: false, error: 'Socket non authentifiée' };
  }

  // 🔒 VÉRIFICATION 2 : L'expéditeur est bien l'utilisateur connecté
  if (data.senderId !== client.userId) {
    return { success: false, error: 'Expéditeur non autorisé' };
  }

  try {
    // 🔒 VÉRIFICATION 3 : Permissions de la conversation (côté service)
    const conversation = await this.conversationService.addMessage(data);
    
    // ✅ AUTORISÉ : Diffuser le message
    return { success: true, data: conversation };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 3. Validation des données

#### Côté serveur avec Zod
```typescript
// 🔍 SCHÉMAS DE VALIDATION STRICT
export const createMessageInConversationSchema = z.object({
  conversationId: z.string()
    .min(1, 'ID de conversation requis')
    .regex(/^[0-9a-fA-F]{24}$/, 'Format ID MongoDB invalide'),
  senderId: z.string()
    .min(1, 'ID expéditeur requis')
    .regex(/^[0-9a-fA-F]{24}$/, 'Format ID MongoDB invalide'),
  content: z.string()
    .min(1, 'Contenu requis')
    .max(2000, 'Message trop long (max 2000 caractères)')
    .transform(content => content.trim()) // 🧹 NETTOYAGE AUTOMATIQUE
});

// 🛡️ VALIDATION AUTOMATIQUE
async addMessage(createMessageDto: CreateMessageInConversationDto): Promise<ConversationDocument> {
  try {
    // ✅ VALIDATION STRICTE
    const validatedData = createMessageInConversationSchema.parse(createMessageDto);
    
    // ... logique métier avec données validées
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestException({
        message: 'Données de validation invalides',
        errors: error.errors
      });
    }
    throw error;
  }
}
```

#### Côté client - Validation préalable
```typescript
// 🔒 VALIDATION CLIENT (défense en profondeur)
const sendMessageToConversation = async (conversationId: string, content: string): Promise<MessageInConversation> => {
  // 🧹 NETTOYAGE ET VALIDATION LOCALE
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error('Message vide non autorisé');
  }
  if (trimmedContent.length > 2000) {
    throw new Error('Message trop long (maximum 2000 caractères)');
  }
  if (!conversationId) {
    throw new Error('ID de conversation manquant');
  }

  // 🔒 VÉRIFICATION CONNEXION
  if (!socketRef.current || !currentUserId.current) {
    throw new Error('WebSocket non connecté');
  }

  // 📡 ENVOI SÉCURISÉ
  return new Promise((resolve, reject) => {
    socketRef.current!.emit('createMessageInConversation', {
      conversationId,
      senderId: currentUserId.current,  // 🔐 ID SÉCURISÉ
      content: trimmedContent
    }, (response: any) => {
      if (response?.success) {
        resolve(response.data.message);
      } else {
        reject(new Error(response?.error || 'Erreur serveur'));
      }
    });
  });
};
```

### 4. Isolation des conversations

#### Vérification d'appartenance
```typescript
// 🔒 CONTRÔLE D'ACCÈS AUX CONVERSATIONS
async getConversationMessages({
  conversationId,
  userId,
  page = 1,
  limit = 50
}: GetConversationMessagesDto): Promise<ConversationWithMessages> {
  
  const conversation = await this.conversationModel.findById(conversationId);
  if (!conversation) {
    throw new NotFoundException('Conversation non trouvée');
  }

  // 🚫 VÉRIFICATION CRITIQUE : Utilisateur doit être participant
  if (!conversation.participant_ids.includes(userId)) {
    throw new ForbiddenException('Accès non autorisé à cette conversation');
  }

  // ✅ AUTORISÉ : Retourner les messages
  return this.buildConversationWithMessages(conversation, page, limit);
}
```

#### Diffusion sécurisée des messages
```typescript
// 📡 ÉMISSION SEULEMENT AUX PARTICIPANTS AUTORISÉS
@SubscribeMessage('createMessageInConversation')
async createMessage(data, client) {
  const conversation = await this.service.addMessage(data);
  const newMessage = conversation.messages[conversation.messages.length - 1];

  // 🎯 DIFFUSION CIBLÉE : Seulement aux participants (pas l'expéditeur)
  conversation.participant_ids.forEach(participantId => {
    if (participantId !== data.senderId) {  // 🚫 Pas d'auto-diffusion
      this.server.to(`user_${participantId}`).emit('newMessageInConversation', {
        conversationId: conversation._id,
        message: newMessage,
        conversation: {
          _id: conversation._id,
          participant_ids: conversation.participant_ids,
          type: conversation.type,
          name: conversation.name,
          updatedAt: conversation.updatedAt
        }
      });
    }
  });

  return { success: true, data: { message: newMessage } };
}
```

### 5. Protection contre les attaques communes

#### Rate Limiting
```typescript
// 🛡️ LIMITATION DU TAUX DE MESSAGES (à implémenter)
const messageRateLimit = new Map<string, { count: number; lastReset: number }>();

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userLimit = messageRateLimit.get(userId) || { count: 0, lastReset: now };
  
  // Reset compteur toutes les minutes
  if (now - userLimit.lastReset > 60000) {
    userLimit.count = 0;
    userLimit.lastReset = now;
  }
  
  // Max 60 messages par minute
  if (userLimit.count >= 60) {
    return false;
  }
  
  userLimit.count++;
  messageRateLimit.set(userId, userLimit);
  return true;
};
```

#### Sanitisation HTML/XSS
```typescript
// 🧹 NETTOYAGE CONTENU CONTRE XSS
import DOMPurify from 'dompurify';

const sanitizeMessage = (content: string): string => {
  // 1. Suppression des scripts et HTML dangereux
  const cleaned = DOMPurify.sanitize(content, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
  
  // 2. Limitation de longueur
  return cleaned.substring(0, 2000);
};

// Usage dans le service
const newMessage = {
  content: sanitizeMessage(createMessageDto.content),
  // ... autres champs
};
```

#### Protection CORS
```typescript
// 🌐 CONFIGURATION CORS WEBSOCKET
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",  // 🔒 DOMAINES AUTORISÉS
    methods: ["GET", "POST"],
    credentials: true
  }
})
export class ConversationGateway {
  // ... implémentation
}
```

### 6. Logging et audit

#### Traçabilité des actions
```typescript
// 📋 LOGGING DES ACTIONS SENSIBLES
@SubscribeMessage('createMessageInConversation')
async createMessage(data, client) {
  console.log(`[AUDIT] Message créé par ${client.userId} dans conversation ${data.conversationId}`);
  
  try {
    const result = await this.service.addMessage(data);
    console.log(`[AUDIT] Message sauvé avec succès: ${result._id}`);
    return { success: true, data: result };
  } catch (error) {
    console.error(`[AUDIT] Échec création message: ${error.message}`);
    return { success: false, error: error.message };
  }
}
```

### 7. Variables d'environnement sécurisées

```env
# 🔐 SECRETS DE PRODUCTION
JWT_SECRET=your-super-secure-secret-key-256-bits-minimum
DB_CONNECTION_STRING=mongodb://username:password@host:port/database

# 🌐 CORS ET DOMAINES
FRONTEND_URL=https://monvoisin.fr
API_URL=https://api.monvoisin.fr

# 🔒 CONFIGURATION SÉCURITÉ
RATE_LIMIT_MESSAGES_PER_MINUTE=60
MAX_MESSAGE_LENGTH=2000
SESSION_TIMEOUT_MINUTES=60
```

Cette architecture de sécurité multicouche garantit que seuls les utilisateurs autorisés peuvent accéder aux conversations et envoyer des messages, tout en protégeant contre les attaques communes.

---

## Gestion des erreurs et fallbacks

### Stratégie de robustesse multiniveau

MonVoisin3000 implémente une **stratégie de fallback** à plusieurs niveaux pour assurer un fonctionnement continu même en cas de défaillances partielles :

### 1. Fallback WebSocket → REST API

#### Dans les hooks de données
```typescript
// 🔄 STRATÉGIE HYBRIDE AUTOMATIQUE
const loadConversations = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) throw new Error('Token d\'authentification manquant');

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    let conversationData;

    // 🚀 TENTATIVE WEBSOCKET EN PREMIER
    if (isConnected) {
      try {
        conversationData = await getUserConversations(1);
        console.log('✅ Données récupérées via WebSocket');
      } catch (wsError) {
        console.warn('⚠️ WebSocket échoué, fallback sur REST API:', wsError);
        
        // 📡 FALLBACK REST AUTOMATIQUE
        const response = await fetch(`${apiUrl}/api/conversations?page=1&limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          conversationData = data.success ? data.data : null;
          console.log('✅ Données récupérées via REST (fallback)');
        } else {
          throw new Error(`Erreur REST API: ${response.status}`);
        }
      }
    } else {
      // 📡 REST DIRECT si WebSocket non connecté
      console.log('🔌 WebSocket non connecté, utilisation REST directe');
      const response = await fetch(`${apiUrl}/api/conversations?page=1&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        conversationData = data.success ? data.data : null;
        console.log('✅ Données récupérées via REST');
      } else {
        throw new Error(`Erreur REST API: ${response.status}`);
      }
    }

    // 🔄 TRAITEMENT UNIFIÉ DES DONNÉES
    if (conversationData) {
      const formattedConversations = await processConversationData(conversationData);
      setConversations(formattedConversations);
    } else {
      setConversations([]);
    }

  } catch (err) {
    console.error('❌ Erreur lors du chargement des conversations:', err);
    setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    
    // 🔄 FALLBACK : Données en cache si disponibles
    const cachedConversations = getCachedConversations();
    if (cachedConversations.length > 0) {
      console.log('💾 Utilisation du cache local en fallback');
      setConversations(cachedConversations);
      setError('Mode hors ligne - Données du cache');
    }
  } finally {
    setLoading(false);
  }
}, [currentUserId, getUserConversations, isConnected]);
```

### 2. Reconnexion WebSocket intelligente

#### Gestion des déconnexions
```typescript
// 🔄 RECONNEXION AUTOMATIQUE AVEC BACKOFF
newSocket.on('disconnect', (reason) => {
  console.log('❌ Déconnecté du WebSocket. Raison:', reason);
  isConnecting.current = false;
  setIsConnected(false);
  
  // 📊 CLASSIFICATION DES RAISONS DE DÉCONNEXION
  switch (reason) {
    case 'io client disconnect':
      console.log('🔌 Déconnexion volontaire, pas de reconnexion');
      break;
      
    case 'transport close':
    case 'transport error':
      console.log('🌐 Problème réseau, reconnexion automatique...');
      attemptReconnection();
      break;
      
    case 'server disconnect':
      console.log('🖥️ Serveur fermé, tentative de reconnexion...');
      attemptReconnection();
      break;
      
    default:
      console.log('❓ Raison inconnue, tentative de reconnexion...');
      attemptReconnection();
  }
});

// 🔄 LOGIQUE DE RECONNEXION AVEC BACKOFF EXPONENTIEL
const attemptReconnection = () => {
  if (!currentUserId.current) return;
  
  let reconnectAttempts = 0;
  const maxAttempts = 5;
  
  const reconnectWithDelay = (delay: number) => {
    setTimeout(() => {
      if (reconnectAttempts < maxAttempts && !isConnected) {
        reconnectAttempts++;
        console.log(`🔄 Tentative de reconnexion ${reconnectAttempts}/${maxAttempts}`);
        
        try {
          connect(currentUserId.current!);
        } catch (error) {
          console.error('❌ Échec reconnexion:', error);
          
          // 📈 BACKOFF EXPONENTIEL : 1s, 2s, 4s, 8s, 16s
          const nextDelay = Math.min(delay * 2, 30000); // Max 30 secondes
          if (reconnectAttempts < maxAttempts) {
            reconnectWithDelay(nextDelay);
          } else {
            console.error('❌ Toutes les tentatives de reconnexion ont échoué');
            // 🔄 SWITCH VERS MODE REST PERMANENT
            setError('Connexion temps réel indisponible - Mode dégradé activé');
          }
        }
      }
    }, delay);
  };
  
  reconnectWithDelay(1000); // Commencer avec 1 seconde
};
```

### 3. Gestion des timeouts

#### Timeouts configurables
```typescript
// ⏱️ TIMEOUT INTELLIGENT AVEC RETRY
const sendMessageToConversation = useCallback(async (conversationId: string, content: string): Promise<MessageInConversation> => {
  if (!socketRef.current || !currentUserId.current) {
    throw new Error('WebSocket non connecté');
  }

  const maxRetries = 2;
  let attempt = 0;

  const attemptSend = (): Promise<MessageInConversation> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        attempt++;
        if (attempt < maxRetries) {
          console.warn(`⚠️ Timeout tentative ${attempt}, retry...`);
          attemptSend().then(resolve).catch(reject);
        } else {
          console.error('❌ Toutes les tentatives d\'envoi ont échoué');
          reject(new Error('Timeout lors de l\'envoi du message - Veuillez réessayer'));
        }
      }, 10000); // 10 secondes timeout

      socketRef.current!.emit('createMessageInConversation', {
        conversationId,
        senderId: currentUserId.current,
        content
      }, (response: any) => {
        clearTimeout(timeout);
        
        if (response && response.success) {
          console.log('✅ Message envoyé avec succès:', response.data);
          const newMessage = response.data.message;
          setMessages(prev => [...prev, newMessage]);
          resolve(newMessage);
        } else {
          console.error('❌ Erreur serveur:', response?.error);
          
          // 🔄 RETRY POUR CERTAINES ERREURS
          if (attempt < maxRetries && isRetryableError(response?.error)) {
            attempt++;
            console.warn(`⚠️ Erreur récupérable, retry ${attempt}/${maxRetries}`);
            attemptSend().then(resolve).catch(reject);
          } else {
            reject(new Error(response?.error || 'Erreur lors de l\'envoi du message'));
          }
        }
      });
    });
  };

  return attemptSend();
}, []);

// 🔍 CLASSIFICATION DES ERREURS
const isRetryableError = (error: string): boolean => {
  const retryableErrors = [
    'Timeout',
    'Connection lost',
    'Temporary server error',
    'Rate limit exceeded'
  ];
  
  return retryableErrors.some(retryable => 
    error?.toLowerCase().includes(retryable.toLowerCase())
  );
};
```

### 4. Cache local et mode hors ligne

#### Système de cache intelligent
```typescript
// 💾 CACHE LOCAL AVEC INVALIDATION
class ConversationCache {
  private static CACHE_KEY = 'monvoisin_conversations_cache';
  private static CACHE_EXPIRY = 'monvoisin_conversations_cache_expiry';
  private static CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  static save(conversations: Conversation[]): void {
    try {
      const cacheData = {
        conversations,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      localStorage.setItem(this.CACHE_EXPIRY, Date.now().toString());
      console.log('💾 Conversations sauvées en cache');
    } catch (error) {
      console.warn('⚠️ Impossible de sauver le cache:', error);
    }
  }

  static load(): Conversation[] {
    try {
      const cacheData = localStorage.getItem(this.CACHE_KEY);
      const expiryTime = localStorage.getItem(this.CACHE_EXPIRY);
      
      if (!cacheData || !expiryTime) {
        return [];
      }

      const expiry = parseInt(expiryTime);
      const isExpired = Date.now() - expiry > this.CACHE_DURATION;
      
      if (isExpired) {
        console.log('⏰ Cache expiré, suppression...');
        this.clear();
        return [];
      }

      const parsed = JSON.parse(cacheData);
      console.log('💾 Conversations chargées depuis le cache');
      return parsed.conversations || [];
    } catch (error) {
      console.warn('⚠️ Erreur lecture cache:', error);
      return [];
    }
  }

  static clear(): void {
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.CACHE_EXPIRY);
  }

  static isAvailable(): boolean {
    return this.load().length > 0;
  }
}

// 🔄 UTILISATION DU CACHE
const getCachedConversations = (): Conversation[] => {
  return ConversationCache.load();
};

const saveConversationsToCache = (conversations: Conversation[]): void => {
  ConversationCache.save(conversations);
};
```

### 5. Interface utilisateur adaptative

#### Indicateurs d'état réseau
```typescript
// 🚦 COMPOSANT D'ÉTAT DE CONNEXION
const ConnectionStatus: React.FC = () => {
  const { isConnected } = useConversationWebSocket();
  const [networkOnline, setNetworkOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setNetworkOnline(true);
    const handleOffline = () => setNetworkOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusInfo = () => {
    if (!networkOnline) {
      return { status: 'offline', message: 'Hors ligne', color: 'bg-red-500' };
    } else if (!isConnected) {
      return { status: 'degraded', message: 'Mode dégradé', color: 'bg-yellow-500' };
    } else {
      return { status: 'online', message: 'En ligne', color: 'bg-green-500' };
    }
  };

  const { status, message, color } = getStatusInfo();

  if (status === 'online') {
    return null; // Masquer quand tout va bien
  }

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 ${color} text-white px-4 py-2 rounded-full shadow-lg z-50`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full bg-white ${status === 'degraded' ? 'animate-pulse' : ''}`} />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};
```

#### Messages d'erreur contextuelle
```typescript
// 📝 GESTION ERREURS DANS L'ENVOI DE MESSAGES
const handleSendMessage = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!newMessage.trim() || isLoading) return;
  
  setIsLoading(true);
  setError(null);
  
  try {
    await sendMessageToConversation(conversation.conversationId!, newMessage);
    setNewMessage('');
  } catch (error) {
    console.error('❌ Erreur envoi message:', error);
    
    // 📊 CLASSIFICATION DES ERREURS POUR L'UTILISATEUR
    let userMessage = 'Erreur lors de l\'envoi du message';
    let actionButton = null;
    
    if (error.message.includes('WebSocket non connecté')) {
      userMessage = 'Connexion interrompue. Tentative de reconnexion...';
      actionButton = <button onClick={() => window.location.reload()}>Actualiser</button>;
    } else if (error.message.includes('Timeout')) {
      userMessage = 'Le message prend plus de temps à envoyer que prévu';
      actionButton = <button onClick={() => handleSendMessage(e)}>Réessayer</button>;
    } else if (error.message.includes('Conversation non trouvée')) {
      userMessage = 'Cette conversation n\'existe plus';
      actionButton = <button onClick={onBack}>Retour</button>;
    } else if (error.message.includes('non autorisé')) {
      userMessage = 'Vous n\'êtes plus autorisé à écrire dans cette conversation';
      actionButton = <button onClick={onBack}>Retour</button>;
    }
    
    setError({ message: userMessage, action: actionButton });
  } finally {
    setIsLoading(false);
  }
};
```

### 6. Monitoring et métriques

#### Détection automatique des problèmes
```typescript
// 📊 COLLECTE DE MÉTRIQUES DE SANTÉ
class HealthMonitor {
  private static metrics = {
    websocketConnections: 0,
    websocketErrors: 0,
    apiCalls: 0,
    apiErrors: 0,
    lastSuccessfulConnection: Date.now(),
    lastError: null as string | null
  };

  static recordWebSocketConnection(): void {
    this.metrics.websocketConnections++;
    this.metrics.lastSuccessfulConnection = Date.now();
    console.log('📊 WebSocket connection recorded');
  }

  static recordWebSocketError(error: string): void {
    this.metrics.websocketErrors++;
    this.metrics.lastError = error;
    console.error('📊 WebSocket error recorded:', error);
    
    // 🚨 ALERTE SI TROP D'ERREURS
    if (this.metrics.websocketErrors > 3) {
      console.warn('🚨 Nombreuses erreurs WebSocket détectées');
      // Possibilité d'envoyer des alertes ou métriques
    }
  }

  static recordAPICall(): void {
    this.metrics.apiCalls++;
  }

  static recordAPIError(error: string): void {
    this.metrics.apiErrors++;
    this.metrics.lastError = error;
    console.error('📊 API error recorded:', error);
  }

  static getHealthStatus(): 'healthy' | 'degraded' | 'critical' {
    const now = Date.now();
    const timeSinceLastSuccess = now - this.metrics.lastSuccessfulConnection;
    const errorRate = this.metrics.websocketErrors / Math.max(this.metrics.websocketConnections, 1);
    
    if (timeSinceLastSuccess > 5 * 60 * 1000) { // 5 minutes
      return 'critical';
    } else if (errorRate > 0.3) { // 30% d'erreurs
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  static getMetrics() {
    return { ...this.metrics, healthStatus: this.getHealthStatus() };
  }
}

// 🔍 UTILISATION DU MONITORING
const monitorConnection = () => {
  const healthStatus = HealthMonitor.getHealthStatus();
  
  if (healthStatus === 'critical') {
    console.warn('🚨 Connexion critique - Passage en mode dégradé');
    // Déclencher le mode fallback permanent
  } else if (healthStatus === 'degraded') {
    console.warn('⚠️ Connexion dégradée - Monitoring renforcé');
    // Augmenter la fréquence des checks de santé
  }
};
```

Cette architecture de gestion d'erreurs et de fallbacks assure que l'application continue de fonctionner même en cas de défaillances partielles, offrant toujours la meilleure expérience possible à l'utilisateur.

---

## Optimisations et performances

### Stratégies d'optimisation multicouches

MonVoisin3000 implémente plusieurs niveaux d'optimisation pour assurer des performances optimales même avec de nombreux utilisateurs et conversations :

### 1. Optimisations React et état

#### Éviter les re-renders inutiles avec useCallback et useMemo
```typescript
// 🚀 OPTIMISATION : useCallback pour fonctions stables
const sendMessageToConversation = useCallback(async (conversationId: string, content: string): Promise<MessageInConversation> => {
  // ... implémentation
}, []); // Pas de dépendances → fonction stable

const markConversationAsRead = useCallback(async (conversationId: string, fromSenderId?: string): Promise<{ markedCount: number }> => {
  // ... implémentation
}, []); // Fonction stable

// 🚀 OPTIMISATION : useMemo pour calculs coûteux
const sortedAndFilteredConversations = useMemo(() => {
  return conversations
    .filter(conv => 
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // 📊 PRIORITÉ : Messages non lus en premier
      if (a.unread !== b.unread) {
        return b.unread - a.unread;
      }
      // ⏰ PUIS : Par timestamp du dernier message
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });
}, [conversations, searchTerm]); // Recalculé seulement si nécessaire

// 🚀 OPTIMISATION : Memoization des composants lourds
const ConversationItem = React.memo<ConversationItemProps>(({ 
  conversation, 
  onClick, 
  isSelected 
}) => {
  return (
    <div 
      className={`conversation-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(conversation)}
    >
      {/* Interface conversation */}
    </div>
  );
}); // Ne re-render que si props changent
```

#### Gestion intelligente des références
```typescript
// 🎯 RÉFÉRENCES STABLES AVEC useRef
const socketRef = useRef<Socket | null>(null);
const currentUserId = useRef<string | null>(null);
const isConnecting = useRef<boolean>(false);
const hasUpdatedStatusesRef = useRef(false);

// 🔄 ÉVITER LES BOUCLES INFINIES
useEffect(() => {
  if (currentUserId && !hasUpdatedStatusesRef.current) {
    hasUpdatedStatusesRef.current = true;
    connect(currentUserId);
  }
}, [currentUserId, connect]); // hasUpdatedStatusesRef pas dans deps car ref
```

### 2. Optimisations WebSocket

#### Batch des événements pour réduire les re-renders
```typescript
// 📦 BATCHING DES MISES À JOUR D'ÉTAT
const [batchedUpdates, setBatchedUpdates] = useState<{
  messages: MessageInConversation[];
  statusChanges: { userId: string; isOnline: boolean }[];
  readUpdates: { conversationId: string; markedCount: number }[];
}>({
  messages: [],
  statusChanges: [],
  readUpdates: []
});

// ⏱️ DEBOUNCE DES MISES À JOUR
const batchTimeout = useRef<NodeJS.Timeout | null>(null);

const processBatchedUpdates = useCallback(() => {
  if (batchTimeout.current) {
    clearTimeout(batchTimeout.current);
  }
  
  batchTimeout.current = setTimeout(() => {
    setBatchedUpdates(current => {
      // 📦 TRAITEMENT EN LOT DES MISES À JOUR
      if (current.messages.length > 0) {
        setMessages(prev => [...prev, ...current.messages]);
      }
      
      if (current.statusChanges.length > 0) {
        // Émettre un seul événement DOM avec tous les changements
        window.dispatchEvent(new CustomEvent('batchedStatusChanges', {
          detail: current.statusChanges
        }));
      }
      
      // 🧹 RESET DU BATCH
      return { messages: [], statusChanges: [], readUpdates: [] };
    });
  }, 100); // 100ms de debounce
}, []);

// 📩 ACCUMULATION DES MESSAGES
newSocket.on('newMessageInConversation', (data) => {
  setBatchedUpdates(prev => ({
    ...prev,
    messages: [...prev.messages, data.message]
  }));
  processBatchedUpdates();
});
```

#### Limitation intelligente des listeners
```typescript
// 🎯 LISTENERS CONDITIONNELS
const setupWebSocketListeners = useCallback((socket: Socket) => {
  // 🔄 NETTOYAGE DES ANCIENS LISTENERS
  socket.removeAllListeners();
  
  // 📩 LISTENER OPTIMISÉ : Seulement si nécessaire
  if (currentConversationId.current) {
    socket.on('newMessageInConversation', (data) => {
      // ⚡ FILTRAGE LOCAL : Seulement messages de la conversation active
      if (data.conversationId === currentConversationId.current) {
        setMessages(prev => [...prev, data.message]);
      } else {
        // 💾 STOCKER POUR PLUS TARD
        addToOfflineMessageCache(data);
      }
    });
  }
  
  // 👤 STATUTS : Seulement pour les utilisateurs visibles
  socket.on('userStatusChanged', (data) => {
    if (visibleUserIds.current.has(data.userId)) {
      updateUserStatus(data.userId, data.isOnline);
    }
  });
  
}, []);
```

### 3. Optimisations base de données

#### Pagination et lazy loading côté serveur
```typescript
// 📄 PAGINATION OPTIMISÉE AVEC INDEXATION
async getConversationMessages({
  conversationId,
  userId,
  page = 1,
  limit = 50
}: GetConversationMessagesDto): Promise<ConversationWithMessages> {
  
  // 🔍 REQUÊTE AVEC INDEX MongoDB
  const conversation = await this.conversationModel
    .findOne({ 
      _id: conversationId,
      participant_ids: userId  // ⚡ INDEX sur participant_ids
    })
    .lean(); // 🚀 LEAN pour éviter Mongoose overhead
    
  if (!conversation) {
    throw new NotFoundException('Conversation non trouvée');
  }

  // 📊 PAGINATION DES MESSAGES EN MÉMOIRE (optimisé pour petites conv)
  // Pour grandes conversations : utiliser aggregation pipeline
  const activeMessages = conversation.messages.filter(msg => !msg.deletedAt);
  const totalCount = activeMessages.length;
  
  if (totalCount > 1000) {
    // 🏭 PIPELINE D'AGRÉGATION POUR GRANDES CONVERSATIONS
    return this.getPaginatedMessagesWithAggregation(conversationId, page, limit);
  }
  
  // 🚀 PAGINATION SIMPLE POUR PETITES CONVERSATIONS
  const startIndex = (page - 1) * limit;
  const sortedMessages = activeMessages
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(startIndex, startIndex + limit);

  return {
    conversation: {
      _id: conversation._id,
      participant_ids: conversation.participant_ids,
      type: conversation.type,
      name: conversation.name,
      // ... autres champs nécessaires uniquement
    },
    messages: sortedMessages,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasNextPage: startIndex + limit < totalCount,
      hasPrevPage: page > 1
    }
  };
}

// 🏭 PIPELINE D'AGRÉGATION POUR PERFORMANCES OPTIMALES
private async getPaginatedMessagesWithAggregation(conversationId: string, page: number, limit: number) {
  const pipeline = [
    { $match: { _id: new Types.ObjectId(conversationId) } },
    { $unwind: '$messages' },
    { $match: { 'messages.deletedAt': { $exists: false } } },
    { $sort: { 'messages.createdAt': -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    { $group: {
        _id: '$_id',
        conversation: { $first: '$$ROOT' },
        messages: { $push: '$messages' }
    }}
  ];
  
  const result = await this.conversationModel.aggregate(pipeline);
  return this.formatAggregationResult(result[0]);
}
```

#### Index MongoDB optimisés
```typescript
// 🚀 INDEXES MONGODB POUR PERFORMANCES
// À ajouter dans le service ou migration

// Index composé pour recherche de conversations
{
  participant_ids: 1,
  updatedAt: -1
} // Pour getUserConversations()

// Index pour recherche messages
{
  'messages.createdAt': -1,
  'messages.senderId': 1,
  'messages.isRead': 1
} // Pour getUnreadMessages()

// Index pour conversations d'événements
{
  eventId: 1,
  type: 1
} // Pour findOrCreateEventConversation()

// Index TTL pour nettoyage automatique des messages supprimés
{
  'messages.deletedAt': 1
}, { 
  expireAfterSeconds: 30 * 24 * 60 * 60 // 30 jours
}
```

### 4. Optimisations mémoire et cache

#### Cache intelligent côté client
```typescript
// 🧠 CACHE MULTI-NIVEAUX
class ConversationCache {
  private static memoryCache = new Map<string, {
    data: any;
    timestamp: number;
    hits: number;
  }>();
  
  private static maxMemoryEntries = 50;
  private static memoryTTL = 5 * 60 * 1000; // 5 minutes

  // 💾 CACHE MÉMOIRE (ultra-rapide)
  static setMemory(key: string, data: any): void {
    // 🧹 NETTOYAGE LRU SI NÉCESSAIRE
    if (this.memoryCache.size >= this.maxMemoryEntries) {
      this.evictLRU();
    }
    
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0
    });
  }

  static getMemory(key: string): any | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    
    // ⏰ VÉRIFICATION TTL
    if (Date.now() - entry.timestamp > this.memoryTTL) {
      this.memoryCache.delete(key);
      return null;
    }
    
    // 📊 COMPTAGE DES HITS POUR LRU
    entry.hits++;
    return entry.data;
  }

  // 🗑️ ÉVICTION LRU (Least Recently Used)
  private static evictLRU(): void {
    let lruKey = '';
    let lruHits = Infinity;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.hits < lruHits || (entry.hits === lruHits && entry.timestamp < oldestTime)) {
        lruKey = key;
        lruHits = entry.hits;
        oldestTime = entry.timestamp;
      }
    }
    
    if (lruKey) {
      this.memoryCache.delete(lruKey);
      console.log(`🗑️ Cache LRU eviction: ${lruKey}`);
    }
  }

  // 💽 CACHE PERSISTANT (localStorage)
  static setPersistent(key: string, data: any, ttl: number = 15 * 60 * 1000): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl
      };
      
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('⚠️ Cache persistant plein:', error);
      this.cleanupPersistentCache();
    }
  }

  static getPersistent(key: string): any | null {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;
      
      const { data, timestamp, ttl } = JSON.parse(cached);
      
      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('⚠️ Erreur lecture cache persistant:', error);
      return null;
    }
  }

  // 🧹 NETTOYAGE AUTOMATIQUE DU CACHE
  private static cleanupPersistentCache(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
    
    // Trier par âge et supprimer les plus anciens
    keys.sort((a, b) => {
      const aTime = this.getCacheTimestamp(a);
      const bTime = this.getCacheTimestamp(b);
      return aTime - bTime;
    }).slice(0, Math.floor(keys.length / 2)).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  private static getCacheTimestamp(key: string): number {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      return data.timestamp || 0;
    } catch {
      return 0;
    }
  }
}

// 🎯 UTILISATION DU CACHE INTELLIGENT
const loadConversationWithCache = async (conversationId: string) => {
  // 1️⃣ CACHE MÉMOIRE (plus rapide)
  let conversationData = ConversationCache.getMemory(`conv_${conversationId}`);
  if (conversationData) {
    console.log('⚡ Données depuis cache mémoire');
    return conversationData;
  }
  
  // 2️⃣ CACHE PERSISTANT
  conversationData = ConversationCache.getPersistent(`conv_${conversationId}`);
  if (conversationData) {
    console.log('💽 Données depuis cache persistant');
    // Promouvoir vers cache mémoire
    ConversationCache.setMemory(`conv_${conversationId}`, conversationData);
    return conversationData;
  }
  
  // 3️⃣ RÉSEAU (WebSocket ou REST)
  conversationData = await getConversation(conversationId);
  
  // 💾 SAUVEGARDER DANS LES DEUX CACHES
  ConversationCache.setMemory(`conv_${conversationId}`, conversationData);
  ConversationCache.setPersistent(`conv_${conversationId}`, conversationData);
  
  return conversationData;
};
```

### 5. Lazy loading et virtualisation

#### Virtualisation des listes de conversations
```typescript
// 📜 LISTE VIRTUALISÉE POUR PERFORMANCES
import { FixedSizeList as List } from 'react-window';

const ConversationList: React.FC<{ conversations: Conversation[] }> = ({ conversations }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ConversationItem 
        conversation={conversations[index]} 
        onClick={handleConversationClick}
        isSelected={selectedConversationId === conversations[index].id}
      />
    </div>
  );

  return (
    <List
      height={600}          // Hauteur conteneur
      itemCount={conversations.length}
      itemSize={80}         // Hauteur de chaque item
      width="100%"
    >
      {Row}
    </List>
  );
};
```

#### Chargement progressif des messages
```typescript
// 📄 INFINITE SCROLL POUR MESSAGES
const useInfiniteMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<MessageInConversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMoreMessages = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const result = await getConversation(conversationId, page);
      
      if (result.messages.length === 0) {
        setHasMore(false);
      } else {
        setMessages(prev => [...result.messages, ...prev]); // Prepend anciens messages
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, page, loading, hasMore]);

  // 🔄 INTERSECTION OBSERVER POUR DÉCLENCHEMENT AUTO
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreMessages();
        }
      },
      { rootMargin: '100px' } // Charger 100px avant d'atteindre le haut
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreMessages, hasMore, loading]);

  return {
    messages,
    loading,
    hasMore,
    sentinelRef,
    loadMoreMessages
  };
};
```

### 6. Optimisations réseau

#### Compression et minimisation des données
```typescript
// 📦 COMPRESSION DES DONNÉES WEBSOCKET
const compressMessage = (message: any) => {
  // 🗜️ SUPPRIMER LES CHAMPS INUTILES
  const { unnecessary, fields, ...compressed } = message;
  
  // 📏 RACCOURCIR LES NOMS DE CHAMPS
  return {
    id: compressed._id,
    s: compressed.senderId,
    c: compressed.content,
    t: compressed.createdAt,
    r: compressed.isRead
  };
};

// 📤 BATCH DES REQUÊTES
class RequestBatcher {
  private static batches = new Map<string, {
    requests: any[];
    timer: NodeJS.Timeout;
  }>();

  static add(type: string, request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.batches.has(type)) {
        this.batches.set(type, {
          requests: [],
          timer: setTimeout(() => this.flush(type), 50) // 50ms de batching
        });
      }

      const batch = this.batches.get(type)!;
      batch.requests.push({ request, resolve, reject });
    });
  }

  private static async flush(type: string): Promise<void> {
    const batch = this.batches.get(type);
    if (!batch) return;

    this.batches.delete(type);
    clearTimeout(batch.timer);

    try {
      // 📦 TRAITEMENT EN LOT
      const batchedRequests = batch.requests.map(r => r.request);
      const results = await this.processBatch(type, batchedRequests);
      
      // ✅ RÉSOLUTION DES PROMESSES
      batch.requests.forEach((req, index) => {
        req.resolve(results[index]);
      });
    } catch (error) {
      // ❌ REJET DE TOUTES LES PROMESSES
      batch.requests.forEach(req => req.reject(error));
    }
  }

  private static async processBatch(type: string, requests: any[]): Promise<any[]> {
    switch (type) {
      case 'userStatuses':
        const userIds = requests.map(r => r.userId);
        const statuses = await getUsersStatus(userIds);
        return requests.map(r => statuses.find(s => s.userId === r.userId));
        
      default:
        throw new Error(`Type de batch non supporté: ${type}`);
    }
  }
}
```

Cette architecture d'optimisation multicouche garantit des performances optimales même avec une utilisation intensive, tout en conservant une expérience utilisateur fluide.

---

## Conclusion

Cette documentation détaille l'architecture complète du système WebSocket et conversations de MonVoisin3000. Le système hybride WebSocket/REST assure robustesse et performances, avec des fallbacks intelligents et une gestion d'erreurs comprehensive. Les optimisations multiniveaux garantissent une expérience utilisateur fluide même à grande échelle.