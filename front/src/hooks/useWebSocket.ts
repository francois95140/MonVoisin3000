import { useState, useEffect, useRef, useCallback } from 'react';
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

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (recipientId: string, content: string) => Promise<void>;
  getConversation: (userId1: string, userId2: string, page?: number) => Promise<ConversationData | null>;
  markAsRead: (messageId: string, userId: string) => Promise<void>;
  getUnreadCount: (userId: string) => Promise<number>;
  messages: Message[];
  connect: (userId: string) => void;
  disconnect: () => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const currentUserId = useRef<string | null>(null);
  const isConnecting = useRef<boolean>(false);

  const connect = useCallback((userId: string) => {
    // Éviter les connexions multiples
    if (isConnecting.current || (socketRef.current && socketRef.current.connected)) {
      return;
    }

    isConnecting.current = true;

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    console.log('Tentative de connexion WebSocket pour utilisateur:', userId);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    const newSocket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000
    });

    socketRef.current = newSocket;
    currentUserId.current = userId;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connecté au WebSocket');
      isConnecting.current = false;
      setIsConnected(true);
      
      // Rejoindre la room de l'utilisateur
      newSocket.emit('joinUserRoom', { userId });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Déconnecté du WebSocket. Raison:', reason);
      isConnecting.current = false;
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion WebSocket:', error);
      isConnecting.current = false;
      setIsConnected(false);
    });

    // Écouter les nouveaux messages
    newSocket.on('newMessage', (message: Message) => {
      console.log('Nouveau message reçu:', message);
      setMessages(prev => [...prev, message]);
    });

    // Écouter les messages mis à jour
    newSocket.on('messageUpdated', (message: Message) => {
      console.log('Message mis à jour:', message);
      setMessages(prev => 
        prev.map(msg => msg.id === message.id ? message : msg)
      );
    });

    // Écouter les messages supprimés
    newSocket.on('messageDeleted', (data: { id: string }) => {
      console.log('Message supprimé:', data.id);
      setMessages(prev => prev.filter(msg => msg.id !== data.id));
    });

    // Écouter les messages lus
    newSocket.on('messageRead', (data: { id: string }) => {
      console.log('Message lu:', data.id);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === data.id ? { ...msg, isRead: true } : msg
        )
      );
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
          console.log('Message envoyé avec succès:', response.data);
          resolve();
        } else {
          console.error('Erreur lors de l\'envoi du message:', response?.error || 'Erreur inconnue');
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
      socketRef.current!.emit('getConversation', {
        userId1,
        userId2,
        page,
        limit: 50
      }, (response: any) => {
        if (response.success) {
          console.log('Conversation récupérée:', response.data);
          setMessages(response.data.messages);
          resolve(response.data);
        } else {
          console.error('Erreur lors de la récupération de la conversation:', response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  const markAsRead = useCallback(async (messageId: string, userId: string): Promise<void> => {
    if (!socketRef.current) {
      throw new Error('WebSocket non connecté');
    }

    return new Promise((resolve, reject) => {
      socketRef.current!.emit('markAsRead', {
        id: messageId,
        userId
      }, (response: any) => {
        if (response.success) {
          console.log('Message marqué comme lu:', response.data);
          resolve();
        } else {
          console.error('Erreur lors du marquage comme lu:', response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  const getUnreadCount = useCallback(async (userId: string): Promise<number> => {
    if (!socketRef.current) {
      throw new Error('WebSocket non connecté');
    }

    return new Promise((resolve, reject) => {
      socketRef.current!.emit('getUnreadCount', {
        userId
      }, (response: any) => {
        if (response.success) {
          console.log('Nombre de messages non lus:', response.data.count);
          resolve(response.data.count);
        } else {
          console.error('Erreur lors de la récupération du nombre de messages non lus:', response.error);
          reject(new Error(response.error));
        }
      });
    });
  }, []);

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket,
    isConnected,
    sendMessage,
    getConversation,
    markAsRead,
    getUnreadCount,
    messages,
    connect,
    disconnect
  };
};