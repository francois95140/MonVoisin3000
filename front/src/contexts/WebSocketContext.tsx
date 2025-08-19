import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  ConversationData, 
  MessageInConversation, 
  ConversationWithMessages,
  ConversationListItem,
  UnreadCount
} from '../types/conversation.types';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  messages: MessageInConversation[];
  connect: (userId: string) => void;
  disconnect: () => void;
  
  // Nouvelles méthodes (conversations)
  sendMessageToConversation: (conversationId: string, content: string) => Promise<MessageInConversation>;
  createOrGetPrivateConversation: (otherUserId: string) => Promise<ConversationData>;
  createOrGetEventConversation: (eventId: string, eventTitle: string) => Promise<ConversationData>;
  getConversationById: (conversationId: string, page?: number) => Promise<ConversationWithMessages | null>;
  getUserConversations: (page?: number) => Promise<ConversationListItem | null>;
  markConversationAsRead: (conversationId: string, fromSenderId?: string) => Promise<{ markedCount: number }>;
  getUnreadCounts: () => Promise<UnreadCount[]>;
  getTotalUnreadCount: () => Promise<number>;
  getUsersStatus: (userIds: string[]) => Promise<{ userId: string; isOnline: boolean }[]>;
  
  // Méthodes de compatibilité (ancien système émulé)
  sendMessage: (recipientId: string, content: string) => Promise<void>;
  getUnreadCount: (userId: string) => Promise<number>;
  markAsRead: (messageId: string, userId: string) => Promise<void>;
  getConversation: (userId1: string, userId2: string, page?: number) => Promise<any>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MessageInConversation[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const currentUserId = useRef<string | null>(null);
  const isConnecting = useRef<boolean>(false);

  const connect = useCallback((userId: string) => {
    // Éviter les connexions multiples
    if (isConnecting.current || (socketRef.current && socketRef.current.connected)) {
      console.log('⚠️ Connexion WebSocket déjà active, ignorée');
      return;
    }

    // Si l'utilisateur est le même et qu'on a déjà une socket, ne pas reconnecter
    if (currentUserId.current === userId && socketRef.current) {
      console.log('⚠️ Même utilisateur, connexion existante conservée');
      return;
    }

    isConnecting.current = true;

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    console.log('🔌 Connexion WebSocket Conversations pour utilisateur:', userId);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    const newSocket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 3,
      timeout: 10000,
      forceNew: false
    });

    socketRef.current = newSocket;
    currentUserId.current = userId;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connecté au WebSocket Conversations');
      isConnecting.current = false;
      setIsConnected(true);
      
      // Rejoindre la room de l'utilisateur
      console.log('🏠 Rejoindre la room pour utilisateur:', userId);
      newSocket.emit('joinUserRoom', { userId }, (response: any) => {
        if (response && response.success) {
          console.log('✅ Room rejointe avec succès:', response.message);
        } else {
          console.error('❌ Erreur lors de la jointure de room:', response);
        }
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Déconnecté du WebSocket Conversations. Raison:', reason);
      isConnecting.current = false;
      setIsConnected(false);
      
      // Reconnexion automatique après déconnexion (sauf si c'est volontaire)
      if (reason !== 'io client disconnect' && currentUserId.current) {
        console.log('🔄 Tentative de reconnexion automatique dans 3 secondes...');
        setTimeout(() => {
          if (currentUserId.current && !socketRef.current?.connected) {
            console.log('🔄 Reconnexion automatique...');
            connect(currentUserId.current);
          }
        }, 3000);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion WebSocket Conversations:', error);
      isConnecting.current = false;
      setIsConnected(false);
    });

    // Écouter les nouveaux messages dans les conversations
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
      
      // Ajouter le message à la liste locale si c'est la conversation active
      setMessages(prev => [...prev, data.message]);
      
      // Émettre un événement personnalisé pour notifier les composants
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

    // Écouter les messages marqués comme lus
    newSocket.on('messagesMarkedAsRead', (data: {
      conversationId: string;
      userId: string;
      markedCount: number;
    }) => {
      console.log('👀 Messages marqués comme lus dans conversation:', data);
      
      // Mettre à jour les messages locaux
      setMessages(prev => 
        prev.map(msg => 
          msg.senderId === currentUserId.current ? { ...msg, isRead: true } : msg
        )
      );

      // Émettre un événement personnalisé
      const readEvent = new CustomEvent('conversationUpdate', {
        detail: {
          type: 'messagesRead',
          conversationId: data.conversationId,
          markedCount: data.markedCount
        }
      });
      window.dispatchEvent(readEvent);
    });

    // Écouter les changements de statut des utilisateurs
    newSocket.on('userStatusChanged', (data: { userId: string; isOnline: boolean }) => {
      console.log('👤 Changement de statut utilisateur:', data);
      
      // Émettre un événement personnalisé pour les composants
      const statusChangeEvent = new CustomEvent('userStatusChanged', {
        detail: data
      });
      window.dispatchEvent(statusChangeEvent);
    });

  }, []);

  const disconnect = useCallback(() => {
    console.log('🔌 Déconnexion WebSocket Conversations demandée');
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      isConnecting.current = false;
      currentUserId.current = null;
    }
  }, []);

  const sendMessageToConversation = useCallback(async (conversationId: string, content: string): Promise<MessageInConversation> => {
    if (!socketRef.current || !currentUserId.current) {
      throw new Error('WebSocket non connecté');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout lors de l\'envoi du message'));
      }, 10000);

      socketRef.current!.emit('createMessageInConversation', {
        conversationId,
        senderId: currentUserId.current,
        content
      }, (response: any) => {
        clearTimeout(timeout);
        if (response && response.success) {
          console.log('✅ Message envoyé dans conversation avec succès:', response.data);
          
          // Ajouter le message immédiatement à la liste locale
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

  const createOrGetPrivateConversation = useCallback(async (otherUserId: string): Promise<ConversationData> => {
    if (!socketRef.current) {
      throw new Error('WebSocket non connecté');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout lors de la création/récupération de la conversation'));
      }, 10000);

      socketRef.current!.emit('createOrGetPrivateConversation', {
        otherUserId
      }, (response: any) => {
        clearTimeout(timeout);
        if (response && response.success) {
          console.log('✅ Conversation privée créée/récupérée:', response.data);
          resolve(response.data);
        } else {
          console.error('❌ Erreur lors de la création/récupération de la conversation:', response?.error || 'Erreur inconnue');
          reject(new Error(response?.error || 'Erreur lors de la création/récupération de la conversation'));
        }
      });
    });
  }, []);

  const createOrGetEventConversation = useCallback(async (eventId: string, eventTitle: string): Promise<ConversationData> => {
    console.log('🔥 createOrGetEventConversation appelée avec:', { eventId, eventTitle });
    console.log('🔥 Socket connecté:', !!socketRef.current, 'isConnected:', isConnected);
    
    if (!socketRef.current) {
      console.error('❌ WebSocket non connecté dans createOrGetEventConversation');
      throw new Error('WebSocket non connecté');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout lors de la création/récupération de la conversation d\'événement'));
      }, 10000);

      console.log('🔥 Émission WebSocket createOrGetEventConversation...');
      socketRef.current!.emit('createOrGetEventConversation', {
        eventId,
        eventTitle
      }, (response: any) => {
        console.log('🔥 Réponse WebSocket reçue:', response);
        clearTimeout(timeout);
        if (response && response.success) {
          console.log('✅ Conversation d\'événement créée/récupérée:', response.data);
          resolve(response.data);
        } else {
          console.error('❌ Erreur lors de la création/récupération de la conversation d\'événement:', response?.error || 'Erreur inconnue');
          reject(new Error(response?.error || 'Erreur lors de la création/récupération de la conversation d\'événement'));
        }
      });
    });
  }, []);

  const getConversationById = useCallback(async (
    conversationId: string, 
    page = 1
  ): Promise<ConversationWithMessages | null> => {
    if (!socketRef.current) {
      throw new Error('WebSocket non connecté');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout lors de la récupération de la conversation'));
      }, 10000);

      socketRef.current!.emit('getConversation', {
        conversationId,
        page,
        limit: 50
      }, (response: any) => {
        clearTimeout(timeout);
        if (response && response.success) {
          console.log('✅ Conversation récupérée:', response.data);
          
          // Mettre à jour les messages locaux
          setMessages(response.data.messages);
          resolve(response.data);
        } else {
          console.error('❌ Erreur lors de la récupération de la conversation:', response?.error || 'Erreur inconnue');
          reject(new Error(response?.error || 'Erreur lors de la récupération de la conversation'));
        }
      });
    });
  }, []);

  const getUserConversations = useCallback(async (page = 1): Promise<ConversationListItem | null> => {
    if (!socketRef.current) {
      throw new Error('WebSocket non connecté');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout lors de la récupération des conversations'));
      }, 10000);

      socketRef.current!.emit('getUserConversations', {
        page,
        limit: 50
      }, (response: any) => {
        clearTimeout(timeout);
        if (response && response.success) {
          console.log('✅ Conversations utilisateur récupérées:', response.data);
          resolve(response.data);
        } else {
          console.error('❌ Erreur lors de la récupération des conversations:', response?.error || 'Erreur inconnue');
          reject(new Error(response?.error || 'Erreur lors de la récupération des conversations'));
        }
      });
    });
  }, []);

  const markConversationAsRead = useCallback(async (conversationId: string, fromSenderId?: string): Promise<{ markedCount: number }> => {
    if (!socketRef.current) {
      throw new Error('WebSocket non connecté');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout lors du marquage comme lu'));
      }, 10000);

      socketRef.current!.emit('markConversationAsRead', {
        conversationId,
        fromSenderId
      }, (response: any) => {
        clearTimeout(timeout);
        if (response && response.success) {
          console.log('✅ Conversation marquée comme lue:', response.data);
          resolve(response.data);
        } else {
          console.error('❌ Erreur lors du marquage comme lu:', response?.error || 'Erreur inconnue');
          reject(new Error(response?.error || 'Erreur lors du marquage comme lu'));
        }
      });
    });
  }, []);

  const getUnreadCounts = useCallback(async (): Promise<UnreadCount[]> => {
    if (!socketRef.current) {
      throw new Error('WebSocket non connecté');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout lors de la récupération des compteurs non lus'));
      }, 10000);

      socketRef.current!.emit('getUnreadCounts', {}, (response: any) => {
        clearTimeout(timeout);
        if (response && response.success) {
          console.log('✅ Compteurs non lus récupérés:', response.data);
          resolve(response.data);
        } else {
          console.error('❌ Erreur lors de la récupération des compteurs non lus:', response?.error || 'Erreur inconnue');
          reject(new Error(response?.error || 'Erreur lors de la récupération des compteurs non lus'));
        }
      });
    });
  }, []);

  const getTotalUnreadCount = useCallback(async (): Promise<number> => {
    if (!socketRef.current) {
      throw new Error('WebSocket non connecté');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout lors de la récupération du nombre total non lu'));
      }, 10000);

      socketRef.current!.emit('getTotalUnreadCount', {}, (response: any) => {
        clearTimeout(timeout);
        if (response && response.success) {
          console.log('✅ Nombre total non lu récupéré:', response.data.count);
          resolve(response.data.count);
        } else {
          console.error('❌ Erreur lors de la récupération du nombre total non lu:', response?.error || 'Erreur inconnue');
          reject(new Error(response?.error || 'Erreur lors de la récupération du nombre total non lu'));
        }
      });
    });
  }, []);

  const getUsersStatus = useCallback(async (userIds: string[]): Promise<{ userId: string; isOnline: boolean }[]> => {
    if (!socketRef.current) {
      throw new Error('WebSocket non connecté');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout lors de la récupération des statuts utilisateurs'));
      }, 10000);

      socketRef.current!.emit('getUsersStatus', {
        userIds
      }, (response: any) => {
        clearTimeout(timeout);
        if (response && response.success) {
          console.log('✅ Statuts des utilisateurs:', response.data);
          resolve(response.data);
        } else {
          console.error('❌ Erreur lors de la récupération des statuts:', response?.error || 'Erreur inconnue');
          reject(new Error(response?.error || 'Erreur lors de la récupération des statuts'));
        }
      });
    });
  }, []);

  // 🔄 MÉTHODES DE COMPATIBILITÉ AVEC L'ANCIEN SYSTÈME
  const sendMessage = useCallback(async (recipientId: string, content: string): Promise<void> => {
    // Émulation : créer une conversation privée puis envoyer le message
    try {
      const conversation = await createOrGetPrivateConversation(recipientId);
      await sendMessageToConversation(conversation._id, content);
    } catch (error) {
      console.error('❌ Erreur sendMessage (compatibilité):', error);
      throw error;
    }
  }, [createOrGetPrivateConversation, sendMessageToConversation]);

  const getUnreadCount = useCallback(async (_userId: string): Promise<number> => {
    // Émulation : récupérer le total des messages non lus
    try {
      return await getTotalUnreadCount();
    } catch (error) {
      console.error('❌ Erreur getUnreadCount (compatibilité):', error);
      throw error;
    }
  }, [getTotalUnreadCount]);

  const markAsRead = useCallback(async (_messageId: string, _userId: string): Promise<void> => {
    // Émulation : cette méthode n'a pas d'équivalent direct dans le nouveau système
    // On ne fait rien car les messages sont marqués comme lus par conversation
    console.warn('⚠️ markAsRead (legacy) appelée - pas d\'équivalent direct dans le nouveau système');
  }, []);

  const getConversation = useCallback(async (_userId1: string, userId2: string, page = 1): Promise<any> => {
    // Émulation : créer/récupérer conversation privée puis charger les messages
    try {
      const conversation = await createOrGetPrivateConversation(userId2);
      const conversationData = await getConversationById(conversation._id, page);
      
      // Retourner dans le format attendu par l'ancien système
      return {
        messages: conversationData?.messages || [],
        totalCount: conversationData?.pagination?.totalCount || 0,
        hasNextPage: conversationData?.pagination?.hasNextPage || false
      };
    } catch (error) {
      console.error('❌ Erreur getConversation (compatibilité):', error);
      throw error;
    }
  }, [createOrGetPrivateConversation, getConversationById]);

  // Nettoyage lors du démontage du provider - seulement quand l'app se ferme vraiment
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };

    // Se déconnecter seulement quand l'onglet/fenêtre se ferme
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Ne pas déconnecter automatiquement sur unmount en dev mode
      // disconnect();
    };
  }, []);

  const contextValue: WebSocketContextType = {
    socket,
    isConnected,
    messages,
    connect,
    disconnect,
    
    // Nouvelles méthodes
    sendMessageToConversation,
    createOrGetPrivateConversation,
    createOrGetEventConversation,
    getConversationById,
    getUserConversations,
    markConversationAsRead,
    getUnreadCounts,
    getTotalUnreadCount,
    getUsersStatus,
    
    // Méthodes de compatibilité
    sendMessage,
    getUnreadCount,
    markAsRead,
    getConversation
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};