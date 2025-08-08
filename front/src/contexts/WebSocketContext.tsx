import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
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

interface ConversationData {
  messages: Message[];
  totalCount: number;
  hasNextPage: boolean;
}

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  connect: (userId: string) => void;
  disconnect: () => void;
  sendMessage: (recipientId: string, content: string) => Promise<void>;
  getConversation: (userId1: string, userId2: string, page?: number) => Promise<ConversationData | null>;
  markAsRead: (messageId: string, userId: string) => Promise<void>;
  getUnreadCount: (userId: string) => Promise<number>;
  getUsersStatus: (userIds: string[]) => Promise<{ userId: string; isOnline: boolean }[]>;
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
  const [messages, setMessages] = useState<Message[]>([]);
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

    console.log('🔌 Connexion WebSocket pour utilisateur:', userId);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    const newSocket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 3,
      timeout: 10000,
      forceNew: false // Réutiliser la connexion si possible
    });

    socketRef.current = newSocket;
    currentUserId.current = userId;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connecté au WebSocket');
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
      console.log('❌ Déconnecté du WebSocket. Raison:', reason);
      isConnecting.current = false;
      setIsConnected(false);
      
      // Ne pas tenter de reconnecter automatiquement pour éviter les boucles
      if (reason === 'io client disconnect') {
        console.log('🔌 Déconnexion volontaire, pas de reconnexion');
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion WebSocket:', error);
      isConnecting.current = false;
      setIsConnected(false);
    });

    // Écouter les nouveaux messages
    newSocket.on('newMessage', (message: any) => {
      console.log('📩 Nouveau message reçu:', message);
      
      // Normaliser les données du message (MongoDB _id -> id)
      const normalizedMessage: Message = {
        id: message._id || message.id,
        senderId: message.senderId,
        recipientId: message.recipientId,
        content: message.content,
        createdAt: message.createdAt,
        isRead: message.isRead,
        sender: message.sender,
        recipient: message.recipient
      };
      
      setMessages(prev => [...prev, normalizedMessage]);
      
      // Émettre un événement personnalisé pour notifier les composants
      const conversationUpdateEvent = new CustomEvent('conversationUpdate', {
        detail: {
          type: 'newMessage',
          message: normalizedMessage,
          conversationParticipant: normalizedMessage.senderId
        }
      });
      window.dispatchEvent(conversationUpdateEvent);
    });

    // Écouter les messages mis à jour
    newSocket.on('messageUpdated', (message: any) => {
      console.log('✏️ Message mis à jour:', message);
      
      const normalizedMessage: Message = {
        id: message._id || message.id,
        senderId: message.senderId,
        recipientId: message.recipientId,
        content: message.content,
        createdAt: message.createdAt,
        isRead: message.isRead,
        sender: message.sender,
        recipient: message.recipient
      };
      
      setMessages(prev => 
        prev.map(msg => msg.id === normalizedMessage.id ? normalizedMessage : msg)
      );
    });

    // Écouter les messages supprimés
    newSocket.on('messageDeleted', (data: { id: string }) => {
      console.log('🗑️ Message supprimé:', data.id);
      setMessages(prev => prev.filter(msg => msg.id !== data.id));
    });

    // Écouter les messages lus
    newSocket.on('messageRead', (data: { id: string }) => {
      console.log('👀 Message lu:', data.id);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === data.id ? { ...msg, isRead: true } : msg
        )
      );
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
    console.log('🔌 Déconnexion WebSocket demandée');
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      isConnecting.current = false;
      currentUserId.current = null;
    }
  }, []);

  const sendMessage = useCallback(async (recipientId: string, content: string): Promise<void> => {
    if (!socketRef.current || !currentUserId.current) {
      throw new Error('WebSocket non connecté');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout lors de l\'envoi du message'));
      }, 10000);

      socketRef.current!.emit('createMessage', {
        senderId: currentUserId.current,
        recipientId,
        content
      }, (response: any) => {
        clearTimeout(timeout);
        if (response && response.success) {
          console.log('✅ Message envoyé avec succès:', response.data);
          
          // Ajouter le message immédiatement à la liste locale
          const newMessage: Message = {
            id: response.data._id,
            senderId: response.data.senderId,
            recipientId: response.data.recipientId,
            content: response.data.content,
            createdAt: response.data.createdAt,
            isRead: response.data.isRead,
            sender: {
              id: response.data.senderId,
              pseudo: 'Vous', // Sera mis à jour si besoin
              avatar: ''
            }
          };
          
          setMessages(prev => [...prev, newMessage]);
          
          // Émettre un événement pour mettre à jour les conversations
          const conversationUpdateEvent = new CustomEvent('conversationUpdate', {
            detail: {
              type: 'newMessage',
              message: newMessage,
              conversationParticipant: newMessage.recipientId // Le destinataire pour les messages qu'on envoie
            }
          });
          window.dispatchEvent(conversationUpdateEvent);
          
          resolve();
        } else {
          console.error('❌ Erreur lors de l\'envoi du message:', response?.error || 'Erreur inconnue');
          reject(new Error(response?.error || 'Erreur lors de l\'envoi du message'));
        }
      });
    });
  }, []);

  const getConversation = useCallback(async (
    userId1: string, 
    userId2: string, 
    page = 1
  ): Promise<ConversationData | null> => {
    if (!socketRef.current) {
      throw new Error('WebSocket non connecté');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout lors de la récupération de la conversation'));
      }, 10000);

      socketRef.current!.emit('getConversation', {
        userId1,
        userId2,
        page,
        limit: 50
      }, (response: any) => {
        clearTimeout(timeout);
        if (response && response.success) {
          console.log('✅ Conversation récupérée:', response.data);
          
          // Normaliser les messages de la conversation
          const normalizedMessages = response.data.messages.map((msg: any) => ({
            id: msg._id || msg.id,
            senderId: msg.senderId,
            recipientId: msg.recipientId,
            content: msg.content,
            createdAt: msg.createdAt,
            isRead: msg.isRead,
            sender: msg.sender,
            recipient: msg.recipient
          }));
          
          setMessages(normalizedMessages);
          resolve({
            ...response.data,
            messages: normalizedMessages
          });
        } else {
          console.error('❌ Erreur lors de la récupération de la conversation:', response?.error || 'Erreur inconnue');
          reject(new Error(response?.error || 'Erreur lors de la récupération de la conversation'));
        }
      });
    });
  }, []);

  const markAsRead = useCallback(async (messageId: string, userId: string): Promise<void> => {
    if (!socketRef.current) {
      throw new Error('WebSocket non connecté');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout lors du marquage comme lu'));
      }, 10000);

      socketRef.current!.emit('markAsRead', {
        id: messageId,
        userId
      }, (response: any) => {
        clearTimeout(timeout);
        if (response && response.success) {
          console.log('✅ Message marqué comme lu:', response.data);
          resolve();
        } else {
          console.error('❌ Erreur lors du marquage comme lu:', response?.error || 'Erreur inconnue');
          reject(new Error(response?.error || 'Erreur lors du marquage comme lu'));
        }
      });
    });
  }, []);

  const getUnreadCount = useCallback(async (userId: string): Promise<number> => {
    if (!socketRef.current) {
      throw new Error('WebSocket non connecté');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout lors de la récupération du nombre de messages non lus'));
      }, 10000);

      socketRef.current!.emit('getUnreadCount', {
        userId
      }, (response: any) => {
        clearTimeout(timeout);
        if (response && response.success) {
          console.log('✅ Nombre de messages non lus:', response.data.count);
          resolve(response.data.count);
        } else {
          console.error('❌ Erreur lors de la récupération du nombre de messages non lus:', response?.error || 'Erreur inconnue');
          reject(new Error(response?.error || 'Erreur lors de la récupération du nombre de messages non lus'));
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

  const contextValue: WebSocketContextType = {
    socket,
    isConnected,
    messages,
    connect,
    disconnect,
    sendMessage,
    getConversation,
    markAsRead,
    getUnreadCount,
    getUsersStatus
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};