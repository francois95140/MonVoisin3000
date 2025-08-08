import React, { useState, useEffect } from 'react';
import { IonIcon, GlassCard, Button } from '../../components/shared';

const Messages: React.FC = () => {
  // Navigation indicator management
  document.getElementById("indicator")?.classList.remove("filter", "opacity-0");
  setTimeout(() => {
    const indicator = document.getElementById("indicator");
    if (indicator && indicator.parentNode) {
      const list = indicator.parentNode.children;
      Array.from(list).forEach((el) => el.classList.remove("active"));
      
      // Find and activate the correct nav item based on current path
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/convs")) {
        const convsItem = Array.from(list).find(el => 
          el.querySelector('a')?.getAttribute('href') === '/convs'
        );
        if (convsItem) convsItem.classList.add("active");
      }
    }
  }, 10);

  const [conversations] = useState([
    {
      id: '1',
      name: 'Marie Dubois',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150',
      lastMessage: 'Salut ! Tu as vu le nouveau service de jardinage ?',
      time: '14:32',
      unread: 2,
      online: true
    },
    {
      id: '2', 
      name: 'Jean Martin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      lastMessage: 'Merci pour ton aide avec le déménagement !',
      time: '12:15',
      unread: 0,
      online: false
    },
    {
      id: '3',
      name: 'Sophie Laurent',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      lastMessage: 'Est-ce que tu serais disponible ce weekend ?',
      time: '10:45',
      unread: 1,
      online: true
    },
    {
      id: '4',
      name: 'Groupe Voisins',
      avatar: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=150',
      lastMessage: 'Paul: Quelqu\'un a vu mon chat Tiger ?',
      time: 'Hier',
      unread: 5,
      online: false,
      isGroup: true
    }
  ]);

  return (
    <div 
      className="min-h-screen pt-8 pb-24 px-4"
      style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
          <p className="text-white/70">Vos conversations avec les voisins</p>
        </div>

        {/* Search bar */}
        <GlassCard className="fade-in">
          <div className="flex items-center space-x-3">
            <IonIcon name="search" className="text-white/60 text-xl" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              className="flex-1 bg-transparent text-white placeholder-white/50 border-none outline-none"
            />
          </div>
        </GlassCard>

        {/* New conversation button */}
        <Button variant="primary" className="w-full fade-in-1">
          <IonIcon name="add-circle" className="w-5 h-5 mr-2" />
          Nouvelle conversation
        </Button>

        {/* Conversations list */}
        <div className="space-y-4">
          {conversations.map((conv, index) => (
            <GlassCard 
              key={conv.id} 
              className={`conversation-card p-4 cursor-pointer fade-in-${index + 2}`}
            >
              <div className="flex items-center space-x-4">
                
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500">
                    <img 
                      src={conv.avatar} 
                      alt={conv.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {conv.online && (
                    <div className="status-online"></div>
                  )}
                  {conv.isGroup && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                      <IonIcon name="people" className="text-white text-xs" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white truncate">{conv.name}</h3>
                    <span className="text-xs text-white/60 flex-shrink-0">{conv.time}</span>
                  </div>
                  <p className="text-sm text-white/70 truncate">{conv.lastMessage}</p>
                </div>

                {/* Unread badge */}
                {conv.unread > 0 && (
                  <div className="unread-badge flex-shrink-0">
                    {conv.unread}
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Empty state if no conversations */}
        {conversations.length === 0 && (
          <GlassCard className="text-center py-12">
            <IonIcon name="chatbubbles" className="text-6xl text-white/30 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Aucune conversation</h3>
            <p className="text-white/60 mb-6">
              Commencez à discuter avec vos voisins !
            </p>
            <Button variant="primary">
              <IonIcon name="add" className="w-5 h-5 mr-2" />
              Démarrer une conversation
            </Button>
          </GlassCard>
        )}

        {/* Tips */}
        <GlassCard className="fade-in-5">
          <div className="flex items-start space-x-3">
            <IonIcon name="bulb" className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-100 text-sm font-medium">Conseil</p>
              <p className="text-yellow-200/80 text-xs mt-1">
                Utilisez les messages pour organiser des événements, échanger des services ou simplement faire connaissance avec vos voisins !
              </p>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default Messages;