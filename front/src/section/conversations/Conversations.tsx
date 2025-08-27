import React, { useState, useEffect } from 'react';
import { IonIcon, GlassCard, Button } from '../../components/shared';
import ConversationItem from './ConversationItem';
import Chat from './Chat';
import UserSearchModal from './UserSearchModal';
import UserProfileModal from './UserProfileModal';
import { Conversation, User } from './types';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { useConversations } from '../../hooks/useConversations';
import { toast } from 'react-toastify';

const Conversations: React.FC = () => {
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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // WebSocket hook
  const { connect, disconnect, isConnected, getUnreadCount } = useWebSocket();

  // Conversations hook
  const { conversations, loading: conversationsLoading, error: conversationsError, refetch } = useConversations(currentUserId);

  // Récupérer l'ID de l'utilisateur connecté
  useEffect(() => {
    const getUserId = async () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) return;

      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      }
    };

    getUserId();
  }, []);

  // WebSocket connecté globalement via main.tsx
  useEffect(() => {
    if (currentUserId && isConnected) {
      console.log('✅ WebSocket déjà connecté globalement pour utilisateur:', currentUserId);
    }
  }, [currentUserId, isConnected]);


  // Filtrer les conversations selon le terme de recherche
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConversationClick = (conversation: Conversation) => {
    console.log(`Ouverture de la conversation avec: ${conversation.name}`);
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    // Rafraîchir les conversations pour mettre à jour les compteurs
    refetch();
  };

  const handleNewConversation = () => {
    setShowUserSearch(true);
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setShowUserSearch(false);
    setShowUserProfile(true);
  };

  const handleSendMessage = (userId: string) => {
    // Créer ou trouver une conversation avec cet utilisateur
    const existingConversation = conversations.find(conv => conv.userId === userId);
    
    if (existingConversation) {
      // Si la conversation existe déjà, l'ouvrir
      setSelectedConversation(existingConversation);
    } else {
      // Créer une nouvelle conversation
      const newConversation: Conversation = {
        id: userId,
        name: selectedUser?.pseudo || 'Utilisateur',
        avatar: selectedUser?.avatar 
          ? { type: 'image', value: selectedUser.avatar, gradient: 'from-blue-400 to-purple-600' }
          : { 
              type: 'initials', 
              value: (selectedUser?.pseudo || 'U').substring(0, 2).toUpperCase(),
              gradient: 'from-blue-400 to-purple-600'
            },
        lastMessage: '',
        time: '',
        unread: 0,
        isOnline: selectedUser?.isOnline ?? false,
        isGroup: false,
        userId: userId
      };
      
      setSelectedConversation(newConversation);
    }
    
    setShowUserProfile(false);
    setSelectedUser(null);
  };

  const handleAddFriend = async (userId: string) => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/friends/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to: userId })
      });

      if (response.ok) {
        console.log('Demande d\'ami envoyée avec succès à:', userId);
        // Optionnel: mettre à jour l'interface ou afficher un message de succès
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi de la demande d\'ami');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande d\'ami:', error);
      // L'erreur est déjà gérée dans UserProfileModal
    }
  };

  const handleCloseUserSearch = () => {
    setShowUserSearch(false);
  };

  const handleCloseUserProfile = () => {
    setShowUserProfile(false);
    setSelectedUser(null);
  };

  // Si une conversation est sélectionnée et on a l'ID utilisateur, afficher le chat
  if (selectedConversation && currentUserId) {
    return (
      <Chat
        conversation={selectedConversation}
        currentUserId={currentUserId}
        onBack={handleBackToList}
        onConversationUpdate={refetch}
      />
    );
  }

  // Sinon, afficher la liste des conversations
  
  return (
    <div 
      className="min-h-screen pt-6 pb-24 antialiased"
      style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
    >
      {/* Header */}
      <div className="px-6 mb-6 fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              <span className="accent-text">Conversations</span>
            </h2>
            <div className="flex items-center space-x-2">
              <p className="text-white/70">
                Restez en contact avec vos voisins
              </p>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} title={isConnected ? 'Connecté' : 'Déconnecté'} />
            </div>
          </div>
          <button 
            onClick={handleNewConversation}
            className="glass-card rounded-xl p-3 hover:bg-white/20 transition-all duration-300"
          >
            <IonIcon name="add" className="text-white text-xl" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-6 fade-in" style={{animationDelay: '0.1s'}}>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Rechercher une conversation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input w-full py-4 pl-12 pr-4 rounded-2xl text-white placeholder-white/50 bg-white/10 border border-white/20 focus:bg-white/15 focus:border-white/40 focus:outline-none transition-all duration-300"
          />
          <IonIcon 
            name="search" 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 text-xl"
          />
        </div>
      </div>

      {/* Loading state */}
      {conversationsLoading && (
        <div className="px-6 mb-6">
          <GlassCard className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Chargement des conversations...</p>
          </GlassCard>
        </div>
      )}

      {/* Error state */}
      {conversationsError && (
        <div className="px-6 mb-6">
          <GlassCard className="text-center py-8">
            <IonIcon name="alert-circle" className="text-4xl text-red-400 mb-4" />
            <h3 className="text-white font-semibold mb-2">Erreur de chargement</h3>
            <p className="text-white/60 text-sm mb-4">{conversationsError}</p>
            <Button onClick={refetch} variant="primary" size="sm">
              Réessayer
            </Button>
          </GlassCard>
        </div>
      )}

      {/* Conversations List */}
      {!conversationsLoading && !conversationsError && (
        <main className="px-6 pb-8">
          <div className="space-y-3">
            {filteredConversations.map((conversation, index) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                animationDelay={0.2 + index * 0.1}
                onClick={() => handleConversationClick(conversation)}
              />
            ))}

            {/* No results message */}
            {filteredConversations.length === 0 && searchTerm && (
              <GlassCard className="text-center py-8 fade-in">
                <IonIcon name="search" className="text-4xl text-white/30 mb-4" />
                <h3 className="text-white font-semibold mb-2">Aucun résultat</h3>
                <p className="text-white/60 text-sm">
                  Aucune conversation ne correspond à votre recherche "{searchTerm}"
                </p>
              </GlassCard>
            )}

            {/* No conversations message */}
            {conversations.length === 0 && !searchTerm && (
              <GlassCard className="text-center py-8 fade-in">
                <IonIcon name="chatbubbles-outline" className="text-4xl text-white/30 mb-4" />
                <h3 className="text-white font-semibold mb-2">Aucune conversation</h3>
                <p className="text-white/60 text-sm">
                  Vous n'avez pas encore de conversations. Ajoutez des amis pour commencer à discuter !
                </p>
              </GlassCard>
            )}
          </div>

          {/* Call to Action */}
          <GlassCard className="rounded-2xl p-6 mt-8 fade-in" style={{animationDelay: '1s'}}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <IonIcon name="chatbubbles" className="text-white text-2xl" />
              </div>
              <h3 className="text-white font-semibold mb-2">Démarrez une conversation !</h3>
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                Contactez vos voisins pour échanger, organiser des événements ou simplement faire connaissance.
              </p>
              <Button 
                variant="primary" 
                onClick={handleNewConversation}
                className="px-6 py-3"
              >
                <IonIcon name="add-circle" className="w-5 h-5 mr-2" />
                Nouvelle conversation
              </Button>
            </div>
          </GlassCard>
        </main>
      )}

      {/* Modales */}
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={handleCloseUserSearch}
        onUserSelect={handleUserSelect}
        currentUserId={currentUserId || ''}
      />

      {selectedUser && (
        <UserProfileModal
          isOpen={showUserProfile}
          onClose={handleCloseUserProfile}
          user={selectedUser}
          currentUserId={currentUserId || ''}
          onSendMessage={handleSendMessage}
          onAddFriend={handleAddFriend}
        />
      )}
    </div>
  );
};

export default Conversations;