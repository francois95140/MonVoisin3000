import React, { useState, useEffect, useRef } from 'react';
import { IonIcon } from '../../components/shared';
import { ChatProps } from './types';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { MessageInConversation } from '../../types/conversation.types';
import ConversationDetailsModal from './ConversationDetailsModal';

interface UserInfo {
  id: string;
  pseudo: string;
  avatar?: string;
}

const NewChat: React.FC<ChatProps> = ({ conversation, currentUserId, onBack, onConversationUpdate }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userIsOnline, setUserIsOnline] = useState(conversation.isOnline);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [users, setUsers] = useState<Map<string, UserInfo>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isConnected,
    sendMessageToConversation,
    getConversationById,
    markConversationAsRead,
    messages,
    getUsersStatus,
    createOrGetPrivateConversation
  } = useWebSocket();

  // Charger la conversation
  useEffect(() => {
    if (isConnected && currentUserId) {
      if (conversation.conversationId) {
        // Si on a un conversationId, charger directement
        loadConversation();
        markConversationAsReadOnOpen();
      } else if (conversation.userId && !conversation.isGroup) {
        // Si on a seulement un userId, essayer de récupérer ou créer la conversation
        loadOrCreatePrivateConversation();
      }
      loadUserStatus();
    }
  }, [isConnected, conversation.conversationId, conversation.userId, currentUserId]);

  // Écouter les changements de statut de l'utilisateur
  useEffect(() => {
    const handleUserStatusChange = (event: CustomEvent) => {
      const { userId, isOnline } = event.detail;
      if (userId === conversation.userId) {
        console.log('👤 Statut utilisateur chat mis à jour:', userId, isOnline);
        setUserIsOnline(isOnline);
      }
    };

    window.addEventListener('userStatusChanged', handleUserStatusChange as EventListener);
    
    return () => {
      window.removeEventListener('userStatusChanged', handleUserStatusChange as EventListener);
    };
  }, [conversation.userId]);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    if (!conversation.conversationId) return;
    
    setIsLoading(true);
    try {
      await getConversationById(conversation.conversationId);
    } catch (error) {
      console.error('Erreur lors du chargement de la conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrCreatePrivateConversation = async () => {
    if (!conversation.userId) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Chargement/création de conversation privée avec:', conversation.userId);
      const conversationData = await createOrGetPrivateConversation(conversation.userId);
      console.log('✅ Conversation chargée/créée:', conversationData._id);
      
      // Charger les messages de cette conversation
      await getConversationById(conversationData._id);
    } catch (error) {
      console.error('Erreur lors du chargement/création de la conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStatus = async () => {
    if (!conversation.userId || !isConnected || conversation.isGroup) return;
    
    try {
      const statuses = await getUsersStatus([conversation.userId]);
      if (statuses.length > 0) {
        setUserIsOnline(statuses[0].isOnline);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du statut utilisateur:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markConversationAsReadOnOpen = async () => {
    if (!conversation.conversationId) return;
    
    try {
      await markConversationAsRead(conversation.conversationId);
      
      // Émettre un événement pour remettre à jour les compteurs de messages non lus
      const conversationUpdateEvent = new CustomEvent('conversationUpdate', {
        detail: {
          type: 'messagesRead',
          conversationId: conversation.conversationId
        }
      });
      window.dispatchEvent(conversationUpdateEvent);
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

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
        console.log('✅ Conversation créée/récupérée:', conversationId);
      }
      
      if (!conversationId) {
        throw new Error('Impossible de déterminer l\'ID de la conversation');
      }
      
      await sendMessageToConversation(conversationId, newMessage.trim());
      setNewMessage('');
      
      // Redimensionner le textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Notifier la liste des conversations qu'il faut se rafraîchir
      if (onConversationUpdate) {
        onConversationUpdate();
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 jours
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handleLeaveGroup = async (conversationId: string) => {
    try {
      // TODO: Implémenter l'API pour quitter un groupe
      console.log('Quitter le groupe:', conversationId);
      onBack(); // Retourner à la liste des conversations
      onConversationUpdate?.(); // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur lors de la sortie du groupe:', error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      // TODO: Implémenter l'API pour supprimer une conversation
      console.log('Supprimer la conversation:', conversationId);
      onBack(); // Retourner à la liste des conversations
      onConversationUpdate?.(); // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation:', error);
    }
  };

  // Fonction pour charger les infos des utilisateurs qui ont envoyé des messages
  const loadUserInfo = async (userId: string): Promise<UserInfo | null> => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) return null;

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        return {
          id: userData.id,
          pseudo: userData.pseudo,
          avatar: userData.avatar
        };
      }
    } catch (error) {
      console.warn(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
    }
    return null;
  };

  // Charger les informations des utilisateurs quand les messages changent
  useEffect(() => {
    if (conversation.isGroup && messages.length > 0) {
      const uniqueSenderIds = [...new Set(messages.map(msg => msg.senderId))];
      
      uniqueSenderIds.forEach(async (senderId) => {
        if (!users.has(senderId)) {
          const userInfo = await loadUserInfo(senderId);
          if (userInfo) {
            setUsers(prev => new Map(prev.set(senderId, userInfo)));
          }
        }
      });
    }
  }, [messages, conversation.isGroup]);

  const renderAvatar = () => {
    const { avatar } = conversation;
    
    return (
      <div className={`w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br ${avatar.gradient} flex items-center justify-center flex-shrink-0`}>
        {avatar.type === 'initials' && (
          <span className="text-white font-bold text-sm">
            {avatar.value}
          </span>
        )}
        {avatar.type === 'icon' && (
          <IonIcon name={avatar.value} className="text-white text-xl" />
        )}
        {avatar.type === 'image' && (
          <img src={avatar.value} alt={conversation.name} className="w-full h-full object-cover" />
        )}
      </div>
    );
  };

  // Fonction pour rendre l'avatar d'un utilisateur spécifique (pour les groupes)
  const renderUserAvatar = (userId: string) => {
    const userInfo = users.get(userId);
    const colors = ['from-blue-400 to-purple-600', 'from-green-400 to-teal-600', 'from-pink-400 to-red-600', 'from-yellow-400 to-orange-600'];
    const colorIndex = userId.length % colors.length;
    
    return (
      <div className={`w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center flex-shrink-0`}>
        {userInfo?.avatar ? (
          <img 
            src={userInfo.avatar} 
            alt={userInfo.pseudo}
            className="w-full h-full object-cover" 
          />
        ) : (
          <span className="text-white font-bold text-xs">
            {userInfo?.pseudo ? userInfo.pseudo.substring(0, 2).toUpperCase() : '??'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div 
      className="flex flex-col antialiased"
      style={{
        height: 'calc(100vh - ( 4.2rem + 0.4rem ) - ( 6.6rem ) )',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div className="flex items-center space-x-4 p-4 glass-card border-0 rounded-none">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          title="Retour aux conversations"
        >
          <IonIcon name="arrow-back" className="text-white text-xl" />
        </button>
        
        {/* Section cliquable du header (avatar + infos) */}
        <div 
          className="flex items-center space-x-3 flex-1 cursor-pointer hover:bg-white/5 rounded-xl p-2 transition-colors"
          onClick={() => setShowDetailsModal(true)}
          title="Voir les détails de la conversation"
        >
          {renderAvatar()}
          
          <div className="flex-1">
            <h2 className="text-white font-semibold">{conversation.name}</h2>
            <div className="flex items-center space-x-2">
              {!conversation.isGroup && (
                <>
                  <div className={`w-2 h-2 rounded-full ${userIsOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <span className="text-white/60 text-sm">
                    {userIsOnline ? 'En ligne' : 'Hors ligne'}
                  </span>
                </>
              )}
              {conversation.isGroup && (
                <span className="text-white/60 text-sm">
                  {conversation.participantIds?.length || 0} participants
                </span>
              )}
            </div>
          </div>
        </div>

        {/*
        <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <IonIcon name="call" className="text-white text-xl" />
        </button>
        
        <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <IonIcon name="videocam" className="text-white text-xl" />
        </button>
        */}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="text-white ml-3">Chargement des messages...</span>
          </div>
        ) : (
          <>
            {messages.map((message: MessageInConversation, index) => {
              const isCurrentUser = message.senderId === currentUserId;
              const showAvatar = !isCurrentUser && 
                (index === 0 || messages[index - 1]?.senderId !== message.senderId);
              const showSenderName = conversation.isGroup && !isCurrentUser && showAvatar;
              const senderInfo = users.get(message.senderId);
              
              return (
                <div
                  key={message._id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                >
                  {!isCurrentUser && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {showAvatar && (
                        conversation.isGroup ? renderUserAvatar(message.senderId) : renderAvatar()
                      )}
                    </div>
                  )}
                  
                  <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-1' : ''}`}>
                    {/* Nom de l'expéditeur pour les groupes */}
                    {showSenderName && (
                      <p className="text-xs text-white/60 mb-1 ml-1">
                        {senderInfo?.pseudo || 'Utilisateur inconnu'}
                      </p>
                    )}
                    
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isCurrentUser
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          : 'glass-card text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                    
                    <div className={`flex items-center space-x-1 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-white/50">
                        {formatTime(message.createdAt)}
                      </span>
                      {isCurrentUser && (
                        <IonIcon
                          name={message.isRead ? 'checkmark-done' : 'checkmark'}
                          className={`text-xs ${message.isRead ? 'text-blue-300' : 'text-white/50'}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <IonIcon name="chatbubbles-outline" className="text-6xl text-white/30 mb-4" />
                <h3 className="text-white font-medium mb-2">Aucun message</h3>
                <p className="text-white/60 text-sm">
                  Commencez la conversation en envoyant un message
                </p>
              </div>
            )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 glass-card border-0 rounded-none">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              rows={1}
              className="w-full resize-none py-3 px-4 pr-12 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:bg-white/15 focus:border-white/40 focus:outline-none transition-all duration-300 max-h-32 overflow-y-auto"
              disabled={isLoading || !isConnected}
            />
            
            <button
              type="button"
              className="absolute right-3 bottom-3 p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <IonIcon name="attach" className="text-white/60 text-lg" />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || isLoading || !isConnected}
            className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex-shrink-0"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <IonIcon name="send" className="text-lg" />
            )}
          </button>
        </form>
      </div>

      {/* Modale des détails de la conversation */}
      <ConversationDetailsModal
        conversation={conversation}
        currentUserId={currentUserId}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onLeaveGroup={handleLeaveGroup}
        onDeleteConversation={handleDeleteConversation}
      />
    </div>
  );
};

export default NewChat;