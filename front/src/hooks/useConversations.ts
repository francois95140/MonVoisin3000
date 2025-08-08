import { useState, useEffect, useCallback } from 'react';
import { Conversation } from '../section/conversations/types';

interface Friend {
  id: string;
  pseudo: string;
  avatar?: string;
  tag?: string;
  isOnline?: boolean;
}

interface ConversationSummary {
  friendId: string;
  friend: Friend;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    isRead: boolean;
  };
  unreadCount: number;
}

export const useConversations = (currentUserId: string | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (!currentUserId) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      // Récupérer les amis
      const friendsResponse = await fetch(`${apiUrl}/api/friends`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!friendsResponse.ok) {
        throw new Error('Erreur lors de la récupération des amis');
      }

      const friendsData = await friendsResponse.json();
      const friends: Friend[] = friendsData.data || [];

      // Pour chaque ami, récupérer la dernière conversation et le nombre de messages non lus
      const conversationPromises = friends.map(async (friend) => {
        try {
          // Récupérer la conversation (1 seul message pour avoir le dernier)
          const conversationResponse = await fetch(
            `${apiUrl}/api/messages/conversation/${currentUserId}/${friend.id}?page=1&limit=1`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          let lastMessage = null;
          if (conversationResponse.ok) {
            const conversationData = await conversationResponse.json();
            if (conversationData.success && conversationData.data.messages.length > 0) {
              lastMessage = conversationData.data.messages[0];
            }
          }

          // Compter les messages non lus de cet ami
          const unreadResponse = await fetch(
            `${apiUrl}/api/messages/unread/${currentUserId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          let unreadCount = 0;
          if (unreadResponse.ok) {
            const unreadData = await unreadResponse.json();
            if (unreadData.success) {
              // Filtrer les messages non lus de cet ami spécifique
              unreadCount = unreadData.data.filter((msg: any) => msg.senderId === friend.id).length;
            }
          }

          return {
            friendId: friend.id,
            friend,
            lastMessage,
            unreadCount
          } as ConversationSummary;
        } catch (error) {
          console.warn(`Erreur lors du chargement de la conversation avec ${friend.pseudo}:`, error);
          return {
            friendId: friend.id,
            friend,
            lastMessage: null,
            unreadCount: 0
          } as ConversationSummary;
        }
      });

      const conversationSummaries = await Promise.all(conversationPromises);

      // Convertir en format Conversation
      const formattedConversations: Conversation[] = conversationSummaries
        .map((summary) => {
          const { friend, lastMessage, unreadCount } = summary;
          
          // Créer l'avatar
          const avatar = friend.avatar 
            ? { type: 'image' as const, value: friend.avatar, gradient: 'from-blue-400 to-purple-600' }
            : { 
                type: 'initials' as const, 
                value: (friend.pseudo || friend.tag || 'U').substring(0, 2).toUpperCase(),
                gradient: `from-${getRandomColor()}-400 to-${getRandomColor()}-600`
              };

          // Format du temps
          const formatTime = (dateString: string) => {
            const date = new Date(dateString);
            const now = new Date();
            const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
            
            if (diffInHours < 1) {
              return 'À l\'instant';
            } else if (diffInHours < 24) {
              return date.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              });
            } else if (diffInHours < 168) { // 7 jours
              return date.toLocaleDateString('fr-FR', { weekday: 'short' });
            } else {
              return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short'
              });
            }
          };

          return {
            id: friend.id,
            name: friend.pseudo || friend.tag || 'Utilisateur',
            avatar,
            lastMessage: lastMessage?.content || 'Aucun message',
            time: lastMessage ? formatTime(lastMessage.createdAt) : '',
            unread: unreadCount,
            isOnline: friend.isOnline ?? Math.random() > 0.5, // Random pour test
            isGroup: false,
            userId: friend.id
          };
        })
        .sort((a, b) => {
          // Trier par : messages non lus d'abord, puis par heure du dernier message
          if (a.unread !== b.unread) {
            return b.unread - a.unread;
          }
          return b.time.localeCompare(a.time);
        });

      setConversations(formattedConversations);

    } catch (err) {
      console.error('Erreur lors du chargement des conversations:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loading,
    error,
    refetch: loadConversations
  };
};

// Fonction utilitaire pour générer des couleurs aléatoires
const getRandomColor = () => {
  const colors = ['blue', 'green', 'purple', 'pink', 'indigo', 'red', 'yellow', 'orange'];
  return colors[Math.floor(Math.random() * colors.length)];
};