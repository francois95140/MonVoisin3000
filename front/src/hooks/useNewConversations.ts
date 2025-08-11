import { useState, useEffect, useCallback, useRef } from 'react';
import { Conversation } from '../section/conversations/types';
import { useConversationWebSocket } from '../contexts/ConversationWebSocketContext';
import { ConversationData, UnreadCount } from '../types/conversation.types';

interface Friend {
  id: string;
  pseudo: string;
  avatar?: string;
  tag?: string;
  isOnline?: boolean;
}

export const useNewConversations = (currentUserId: string | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getUserConversations, getUnreadCounts, getUsersStatus, isConnected } = useConversationWebSocket();

  // Flag pour savoir si on a déjà récupéré les statuts via WebSocket
  const hasUpdatedStatusesRef = useRef(false);

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

      // Récupérer les conversations via WebSocket
      let conversationData;
      if (isConnected) {
        try {
          conversationData = await getUserConversations(1);
        } catch (wsError) {
          console.warn('Erreur WebSocket, fallback sur REST API:', wsError);
          // Fallback vers REST API
          const response = await fetch(`${apiUrl}/api/conversations?page=1&limit=50`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            conversationData = data.success ? data.data : null;
          }
        }
      } else {
        // Utiliser REST API si WebSocket non connecté
        const response = await fetch(`${apiUrl}/api/conversations?page=1&limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          conversationData = data.success ? data.data : null;
        }
      }

      if (!conversationData || !conversationData.conversations) {
        setConversations([]);
        return;
      }

      // Récupérer les compteurs de messages non lus
      let unreadCounts: UnreadCount[] = [];
      if (isConnected) {
        try {
          unreadCounts = await getUnreadCounts();
        } catch (error) {
          console.warn('Erreur lors de la récupération des compteurs non lus:', error);
        }
      }

      // Récupérer les informations des participants (amis)
      const allParticipantIds = new Set<string>();
      conversationData.conversations.forEach((conv: ConversationData) => {
        conv.participant_ids.forEach(id => {
          if (id !== currentUserId) {
            allParticipantIds.add(id);
          }
        });
      });

      const participantIds = Array.from(allParticipantIds);
      const friendsData: Friend[] = [];

      // Récupérer les infos des amis via l'API friends
      const friendsResponse = await fetch(`${apiUrl}/api/friends`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let friends: Friend[] = [];
      if (friendsResponse.ok) {
        const friendsResult = await friendsResponse.json();
        friends = friendsResult.data || [];
      }

      // Récupérer les infos des utilisateurs qui ne sont pas dans la liste d'amis
      const friendIds = friends.map(f => f.id);
      const missingUserIds = participantIds.filter(id => !friendIds.includes(id));
      
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
              isOnline: false
            } as Friend;
          } else if (userResponse.status === 404) {
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

      // Récupérer les statuts des utilisateurs
      let userStatuses: { userId: string; isOnline: boolean }[] = [];
      if (allUsers.length > 0 && isConnected) {
        try {
          const userIds = allUsers.map(user => user.id);
          userStatuses = await getUsersStatus(userIds);
          console.log('✅ Statuts récupérés pour conversations:', userStatuses);
        } catch (error) {
          console.warn('Erreur lors de la récupération des statuts:', error);
        }
      }

      // Convertir les conversations en format d'affichage
      const formattedConversations: Conversation[] = conversationData.conversations.map((convData: ConversationData) => {
        // Pour une conversation privée, trouver l'autre participant
        let otherParticipant: Friend | undefined;
        if (convData.type === 'private') {
          const otherUserId = convData.participant_ids.find(id => id !== currentUserId);
          otherParticipant = allUsers.find(user => user.id === otherUserId);
        }

        // Récupérer le dernier message
        const lastMessage = convData.messages && convData.messages.length > 0 
          ? convData.messages[convData.messages.length - 1] 
          : null;

        // Récupérer le nombre de messages non lus
        const unreadData = unreadCounts.find(uc => uc.conversationId === convData._id);
        const unreadCount = unreadData ? unreadData.unreadCount : 0;

        // Récupérer le statut en ligne
        let isOnline = false;
        if (otherParticipant) {
          const userStatus = userStatuses.find(s => s.userId === otherParticipant!.id);
          isOnline = userStatus?.isOnline ?? false;
        }

        // Créer l'avatar
        const name = convData.type === 'group' 
          ? (convData.name || 'Groupe') 
          : (otherParticipant?.pseudo || otherParticipant?.tag || 'Utilisateur');
          
        const avatarUrl = convData.type === 'group' 
          ? convData.avatar 
          : otherParticipant?.avatar;

        // Pour les conversations d'événement, utiliser l'icône de l'événement
        let avatar;
        if (convData.type === 'group' && convData.eventId && convData.eventIcon) {
          // Conversation d'événement : utiliser l'icône de l'événement
          avatar = {
            type: 'icon' as const,
            value: convData.eventIcon,
            gradient: 'from-green-400 to-emerald-600'
          };
        } else if (avatarUrl) {
          // Image d'avatar disponible
          avatar = { type: 'image' as const, value: avatarUrl, gradient: 'from-blue-400 to-purple-600' };
        } else {
          // Pas d'image : utiliser les initiales
          avatar = { 
            type: 'initials' as const, 
            value: name.substring(0, 2).toUpperCase(),
            gradient: `from-${getRandomColor()}-400 to-${getRandomColor()}-600`
          };
        }

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

        return {
          id: convData._id,
          name,
          avatar,
          lastMessage: lastMessage?.content || 'Aucun message',
          time: lastMessage ? formatTime(lastMessage.createdAt) : '',
          unread: unreadCount,
          isOnline,
          isGroup: convData.type === 'group',
          userId: convData.type === 'private' ? (otherParticipant?.id || '') : '', // Pour les conversations privées
          conversationId: convData._id, // ID de la conversation
          participantIds: convData.participant_ids // Tous les participants
        };
      });

      // Trier par : messages non lus d'abord, puis par heure du dernier message
      const sortedConversations = formattedConversations.sort((a, b) => {
        if (a.unread !== b.unread) {
          return b.unread - a.unread;
        }
        // Trier par temps (plus récent en premier)
        if (a.time && b.time) {
          return b.time.localeCompare(a.time);
        }
        return 0;
      });

      setConversations(sortedConversations);

    } catch (err) {
      console.error('Erreur lors du chargement des conversations:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [currentUserId, getUserConversations, getUnreadCounts, getUsersStatus, isConnected]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Mettre à jour les statuts quand le WebSocket se connecte et qu'on a des conversations
  useEffect(() => {
    if (isConnected && conversations.length > 0 && !hasUpdatedStatusesRef.current) {
      console.log('🔌 WebSocket connecté, mise à jour des statuts');
      hasUpdatedStatusesRef.current = true;
      
      const updateStatuses = async () => {
        try {
          const userIds = conversations
            .filter(conv => !conv.isGroup && conv.userId)
            .map(conv => conv.userId);
            
          if (userIds.length === 0) return;
          
          const userStatuses = await getUsersStatus(userIds);
          console.log('🔄 Mise à jour des statuts utilisateurs:', userStatuses);
          
          setConversations(prevConversations =>
            prevConversations.map(conv => {
              if (conv.isGroup || !conv.userId) return conv;
              
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
      const { type, conversationId, message } = event.detail;
      
      if (type === 'newMessage' && currentUserId) {
        console.log('🔔 Mise à jour conversation pour nouveau message:', message);
        
        // Mettre à jour la conversation existante
        setConversations(prevConversations => {
          const existingIndex = prevConversations.findIndex(
            conv => conv.conversationId === conversationId
          );
          
          if (existingIndex !== -1) {
            const updatedConversations = [...prevConversations];
            const conversation = updatedConversations[existingIndex];
            
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
            
            // Mettre à jour les détails
            conversation.lastMessage = message.content;
            conversation.time = formatTime(message.createdAt);
            
            // Déplacer la conversation en haut de la liste
            updatedConversations.splice(existingIndex, 1);
            updatedConversations.unshift(conversation);
            
            return updatedConversations;
          } else {
            // La conversation n'existe pas, la créer (recharger les conversations)
            console.log('💬 Nouvelle conversation détectée, rechargement...');
            loadConversations();
            return prevConversations;
          }
        });
        
        // Mettre à jour les compteurs non lus après un court délai
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
      } else if (type === 'messagesRead' && currentUserId) {
        console.log('👀 Messages marqués comme lus pour conversation:', conversationId);
        
        // Remettre à zéro le compteur de messages non lus
        setConversations(prevConversations => {
          return prevConversations.map(conv => 
            conv.conversationId === conversationId 
              ? { ...conv, unread: 0 }
              : conv
          );
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