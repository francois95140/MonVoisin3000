import { useState, useEffect, useCallback, useRef } from 'react';
import { Conversation } from '../section/conversations/types';
import { useWebSocket } from '../contexts/WebSocketContext';

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
  
  const { getUsersStatus, isConnected } = useWebSocket();

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

      // Récupérer tous les participants de conversations
      const conversationParticipantsResponse = await fetch(
        `${apiUrl}/api/messages/conversation-participants/${currentUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let conversationUserIds: string[] = [];
      if (conversationParticipantsResponse.ok) {
        const participantsData = await conversationParticipantsResponse.json();
        if (participantsData.success) {
          conversationUserIds = participantsData.data || [];
        }
      }

      // Récupérer les messages non lus par conversation
      const conversationsUnreadResponse = await fetch(
        `${apiUrl}/api/messages/conversations-unread/${currentUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let unreadCounts: Record<string, number> = {};
      if (conversationsUnreadResponse.ok) {
        const unreadData = await conversationsUnreadResponse.json();
        if (unreadData.success) {
          // Créer un map des comptes de messages non lus par senderId
          unreadCounts = unreadData.data.reduce((acc: Record<string, number>, item: { senderId: string; unreadCount: number }) => {
            acc[item.senderId] = item.unreadCount;
            return acc;
          }, {});
        }
      }

      // Récupérer les amis
      const friendsResponse = await fetch(`${apiUrl}/api/friends`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let friends: Friend[] = [];
      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json();
        friends = friendsData.data || [];
      }

      // Combiner les amis avec les personnes avec qui on a des conversations
      const friendIds = friends.map(f => f.id);
      const allUserIds = [...new Set([...friendIds, ...conversationUserIds])];

      // Récupérer les infos des utilisateurs qui ne sont pas dans la liste d'amis mais avec qui on a des conversations
      const missingUserIds = allUserIds.filter(id => !friendIds.includes(id));
      const missingUsersPromises = missingUserIds.map(async (userId) => {
        try {
          const userResponse = await fetch(`${apiUrl}/api/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            return {
              id: userData.id,
              pseudo: userData.pseudo,
              tag: userData.tag,
              avatar: userData.avatar,
              isOnline: false // Par défaut
            } as Friend;
          } else if (userResponse.status === 404) {
            // Utilisateur supprimé, créer un placeholder
            console.warn(`Utilisateur ${userId} non trouvé (peut-être supprimé)`);
            return {
              id: userId,
              pseudo: 'Utilisateur supprimé',
              tag: 'deleted',
              avatar: undefined,
              isOnline: false
            } as Friend;
          }
        } catch (error) {
          console.warn(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
        }
        return null;
      });

      const missingUsers = (await Promise.all(missingUsersPromises)).filter(Boolean) as Friend[];
      const allUsers = [...friends, ...missingUsers];

      // Récupérer les statuts de tous les utilisateurs
      let userStatuses: { userId: string; isOnline: boolean }[] = [];
      if (allUsers.length > 0 && isConnected) {
        try {
          const userIds = allUsers.map(user => user.id);
          userStatuses = await getUsersStatus(userIds);
          console.log('✅ Statuts récupérés avant génération des conversations:', userStatuses);
        } catch (error) {
          console.warn('Erreur lors de la récupération des statuts:', error);
        }
      } else if (allUsers.length > 0) {
        console.log('⚠️ WebSocket non connecté, les statuts seront définis à "hors ligne"');
      }

      // Pour chaque utilisateur, récupérer la dernière conversation
      const conversationPromises = allUsers.map(async (user) => {
        try {
          // Récupérer la conversation (1 seul message pour avoir le dernier)
          const conversationResponse = await fetch(
            `${apiUrl}/api/messages/conversation/${currentUserId}/${user.id}?page=1&limit=1`,
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

          return {
            friendId: user.id,
            friend: user,
            lastMessage,
            unreadCount: unreadCounts[user.id] || 0
          } as ConversationSummary;
        } catch (error) {
          console.warn(`Erreur lors du chargement de la conversation avec ${user.pseudo}:`, error);
          return {
            friendId: user.id,
            friend: user,
            lastMessage: undefined,
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
              return 'Now';
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

          // Récupérer le statut de cet utilisateur  
          const userStatus = userStatuses.find(s => s.userId === friend.id);
          const isOnline = userStatus?.isOnline ?? false;

          return {
            id: friend.id,
            name: friend.pseudo || friend.tag || 'Utilisateur',
            avatar,
            lastMessage: lastMessage?.content || 'Aucun message',
            time: lastMessage ? formatTime(lastMessage.createdAt) : '',
            unread: unreadCount,
            isOnline: isOnline,
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
  }, [currentUserId, getUsersStatus]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Flag pour savoir si on a déjà récupéré les statuts via WebSocket
  const hasUpdatedStatusesRef = useRef(false);

  // Mettre à jour les statuts quand le WebSocket se connecte et qu'on a des conversations
  useEffect(() => {
    if (isConnected && conversations.length > 0 && !hasUpdatedStatusesRef.current) {
      console.log('🔌 WebSocket connecté, mise à jour des statuts');
      hasUpdatedStatusesRef.current = true;
      
      const updateStatuses = async () => {
        try {
          const userIds = conversations.map(conv => conv.userId).filter((id): id is string => id !== undefined);
          const userStatuses = await getUsersStatus(userIds);
          console.log('🔄 Mise à jour des statuts utilisateurs:', userStatuses);
          
          setConversations(prevConversations =>
            prevConversations.map(conv => {
              const userStatus = userStatuses.find(s => s.userId === conv.userId);
              return userStatus ? { ...conv, isOnline: userStatus.isOnline } : conv;
            })
          );
        } catch (error) {
          console.warn('Erreur lors de la mise à jour des statuts:', error);
        }
      };
      
      updateStatuses();
    }
  }, [isConnected, conversations.length, getUsersStatus]);

  // Écouter les événements de mise à jour des conversations
  useEffect(() => {
    const handleConversationUpdate = (event: CustomEvent) => {
      const { type, message, conversationParticipant } = event.detail;
      
      if (type === 'newMessage' && currentUserId) {
        console.log('🔔 Mise à jour conversation pour nouveau message:', message);
        
        // Mettre à jour la conversation existante ou en créer une nouvelle
        setConversations(prevConversations => {
          const existingIndex = prevConversations.findIndex(
            conv => conv.userId === conversationParticipant
          );
          
          // Formater l'heure du message
          const formatTime = (dateString: string) => {
            const date = new Date(dateString);
            const now = new Date();
            const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
            
            if (diffInHours < 1) {
              return 'Now';
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
          
          if (existingIndex !== -1) {
            // Mettre à jour la conversation existante
            const updatedConversations = [...prevConversations];
            const conversation = updatedConversations[existingIndex];
            
            // Mettre à jour les détails
            conversation.lastMessage = message.content;
            conversation.time = formatTime(message.createdAt);
            
            // Récupérer le vrai compteur de messages non lus depuis l'API si c'est pas nous qui avons envoyé
            if (message.senderId !== currentUserId) {
              // Récupérer le compteur réel depuis l'API
              const updateUnreadCount = async () => {
                try {
                  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                  if (!token) return;

                  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                  const response = await fetch(`${apiUrl}/api/messages/unread-count/${currentUserId}/${message.senderId}`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });

                  if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                      // Mettre à jour le compteur avec la vraie valeur
                      setConversations(prevConvs => 
                        prevConvs.map(conv => 
                          conv.userId === message.senderId 
                            ? { ...conv, unread: data.data.count }
                            : conv
                        )
                      );
                    }
                  }
                } catch (error) {
                  console.warn('Erreur lors de la récupération du compteur:', error);
                  // En cas d'erreur, faire l'incrémentation manuelle comme fallback
                  conversation.unread += 1;
                }
              };
              
              updateUnreadCount();
            }
            
            // Déplacer la conversation en haut de la liste
            updatedConversations.splice(existingIndex, 1);
            updatedConversations.unshift(conversation);
            
            return updatedConversations;
          } else {
            // La conversation n'existe pas, la créer (cela devrait déclencher un rechargement)
            console.log('💬 Nouvelle conversation détectée, rechargement...');
            loadConversations();
            return prevConversations;
          }
        });
      } else if (type === 'messagesRead' && currentUserId) {
        console.log('👀 Messages marqués comme lus pour:', conversationParticipant);
        
        // Remettre à zéro le compteur de messages non lus
        setConversations(prevConversations => {
          const updatedConversations = [...prevConversations];
          const conversation = updatedConversations.find(conv => conv.userId === conversationParticipant);
          
          if (conversation) {
            conversation.unread = 0;
          }
          
          return updatedConversations;
        });
      }
    };

    window.addEventListener('conversationUpdate', handleConversationUpdate as EventListener);
    
    return () => {
      window.removeEventListener('conversationUpdate', handleConversationUpdate as EventListener);
    };
  }, [currentUserId, loadConversations]);

  // Écouter les changements de statut des utilisateurs
  useEffect(() => {
    const handleUserStatusChange = (event: CustomEvent) => {
      const { userId, isOnline } = event.detail;
      console.log('👤 Mise à jour statut utilisateur:', userId, isOnline ? 'en ligne' : 'hors ligne');
      
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.userId === userId 
            ? { ...conv, isOnline }
            : conv
        )
      );
    };

    window.addEventListener('userStatusChanged', handleUserStatusChange as EventListener);
    
    return () => {
      window.removeEventListener('userStatusChanged', handleUserStatusChange as EventListener);
    };
  }, []);

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