import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  ConversationData, 
  MessageInConversation, 
  ConversationWithMessages,
  ConversationListItem,
  UnreadCount
} from '../types/conversation.types';

interface ConversationWebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  messages: MessageInConversation[];
  connect: (userId: string) => void;
  disconnect: () => void;
  sendMessageToConversation: (conversationId: string, content: string) => Promise<MessageInConversation>;
  createOrGetPrivateConversation: (otherUserId: string) => Promise<ConversationData>;
  getConversation: (conversationId: string, page?: number) => Promise<ConversationWithMessages | null>;
  getUserConversations: (page?: number) => Promise<ConversationListItem | null>;
  markConversationAsRead: (conversationId: string, fromSenderId?: string) => Promise<{ markedCount: number }>;
  getUnreadCounts: () => Promise<UnreadCount[]>;
  getTotalUnreadCount: () => Promise<number>;
  getUsersStatus: (userIds: string[]) => Promise<{ userId: string; isOnline: boolean }[]>;
}

const ConversationWebSocketContext = createContext<ConversationWebSocketContextType | undefined>(undefined);

export const useConversationWebSocket = () => {
  const context = useContext(ConversationWebSocketContext);
  if (context === undefined) {
    throw new Error('useConversationWebSocket must be used within a ConversationWebSocketProvider');
  }
  return context;
};

interface ConversationWebSocketProviderProps {
  children: React.ReactNode;
}

export const ConversationWebSocketProvider: React.FC<ConversationWebSocketProviderProps> = ({ children }) => {
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

  const getConversation = useCallback(async (
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

  // Nettoyage lors du démontage du provider
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const contextValue: ConversationWebSocketContextType = {
    socket,
    isConnected,
    messages,
    connect,
    disconnect,
    sendMessageToConversation,
    createOrGetPrivateConversation,
    getConversation,
    getUserConversations,
    markConversationAsRead,
    getUnreadCounts,
    getTotalUnreadCount,
    getUsersStatus
  };

  return (
    <ConversationWebSocketContext.Provider value={contextValue}>
      {children}
    </ConversationWebSocketContext.Provider>
  );
};