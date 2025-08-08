import React from 'react';
import { IonIcon, GlassCard } from '../../components/shared';
import { ConversationItemProps } from './types';

const ConversationItem: React.FC<ConversationItemProps> = ({ 
  conversation, 
  animationDelay, 
  onClick 
}) => {
  const getTimeColor = () => {
    // Recent messages get cyan color, older ones get muted color
    return conversation.unread > 0 || conversation.time.includes(':') 
      ? 'text-cyan-400 font-medium' 
      : 'text-white/50';
  };

  const renderAvatar = () => {
    const { avatar, isOnline } = conversation;
    
    return (
      <div className={`avatar bg-gradient-to-br ${avatar.gradient} relative`}>
        {avatar.type === 'initials' && (
          <span className="text-white font-bold text-lg">{avatar.value}</span>
        )}
        {avatar.type === 'icon' && (
          <IonIcon name={avatar.value} className="text-white text-2xl" />
        )}
        {avatar.type === 'image' && (
          <img 
            src={avatar.value} 
            alt={conversation.name}
            className="w-full h-full object-cover rounded-2xl"
          />
        )}
        
        {/* Status indicator */}
        <div className={isOnline ? 'status-online' : 'status-offline'}></div>
      </div>
    );
  };

  return (
    <GlassCard 
      className="conversation-card rounded-2xl p-4 cursor-pointer fade-in hover:bg-white/15 hover:transform hover:-translate-y-0.5 transition-all duration-300" 
      style={{animationDelay: `${animationDelay}s`}}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        {renderAvatar()}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-white truncate">{conversation.name}</h3>
            <span className={`text-sm ${getTimeColor()}`}>{conversation.time}</span>
          </div>
          <p className="text-white/70 text-sm truncate">{conversation.lastMessage}</p>
        </div>
        
        {/* Unread badge */}
        {conversation.unread > 0 && (
          <div className="unread-badge flex-shrink-0">
            {conversation.unread}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default ConversationItem;