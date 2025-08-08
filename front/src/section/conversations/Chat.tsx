import React, { useState, useEffect, useRef } from 'react';
import { IonIcon, GlassCard } from '../../components/shared';
import { ChatProps, Message } from './types';
import { useWebSocket } from '../../contexts/WebSocketContext';

const Chat: React.FC<ChatProps> = ({ conversation, currentUserId, onBack }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isConnected,
    sendMessage,
    getConversation,
    markAsRead,
    messages,
    connect
  } = useWebSocket();

  // Le WebSocket est géré par le contexte parent, pas besoin de reconnexion ici

  // Charger la conversation
  useEffect(() => {
    if (isConnected && conversation.userId && currentUserId) {
      loadConversation();
    }
  }, [isConnected, conversation.userId, currentUserId]);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    if (!conversation.userId) return;
    
    setIsLoading(true);
    try {
      await getConversation(currentUserId, conversation.userId);
    } catch (error) {
      console.error('Erreur lors du chargement de la conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !conversation.userId || isLoading) return;
    
    setIsLoading(true);
    try {
      await sendMessage(conversation.userId, newMessage.trim());
      setNewMessage('');
      
      // Redimensionner le textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
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

  return (
    <div 
      className="min-h-screen flex flex-col antialiased"
      style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
    >
      {/* Header */}
      <div className="flex items-center space-x-4 p-4 glass-card border-0 rounded-none">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
        >
          <IonIcon name="arrow-back" className="text-white text-xl" />
        </button>
        
        {renderAvatar()}
        
        <div className="flex-1">
          <h2 className="text-white font-semibold">{conversation.name}</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${conversation.isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
            <span className="text-white/60 text-sm">
              {conversation.isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>

        <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <IonIcon name="call" className="text-white text-xl" />
        </button>
        
        <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <IonIcon name="videocam" className="text-white text-xl" />
        </button>
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
            {messages.map((message: Message, index) => {
              const isCurrentUser = message.senderId === currentUserId;
              const showAvatar = !isCurrentUser && 
                (index === 0 || messages[index - 1]?.senderId !== message.senderId);
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                >
                  {!isCurrentUser && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {showAvatar && renderAvatar()}
                    </div>
                  )}
                  
                  <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-1' : ''}`}>
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
    </div>
  );
};

export default Chat;