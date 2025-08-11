import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { IonIcon, GlassCard, Button } from '../../components/shared';
import { Conversation, User } from './types';
import { useNewConversations } from '../../hooks/useNewConversations';
import { useConversationWebSocket } from '../../contexts/ConversationWebSocketContext';
import ConversationItem from './ConversationItem';
import NewChat from './NewChat';
import UserSearchModal from './UserSearchModal';
import UserProfileModal from './UserProfileModal';

const NewConversations: React.FC = () => {
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

  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { conversations, loading, error, refetch } = useNewConversations(currentUserId);
  const { connect, isConnected, createOrGetEventConversation } = useConversationWebSocket();

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

  // Connecter au WebSocket une seule fois quand l'utilisateur est disponible
  useEffect(() => {
    if (currentUserId) {
      console.log('🔌 Initialisation de la connexion WebSocket Conversations pour:', currentUserId);
      connect(currentUserId);
    }
  }, [currentUserId, connect]);

  // Effet pour créer automatiquement la conversation d'événement si on arrive avec ces paramètres
  useEffect(() => {
    const handleEventConversation = async () => {
      // Vérifier si on a les paramètres d'événement dans l'état de navigation
      const state = location.state as any;
      if (state?.openEventChat && state?.eventId && state?.eventTitle && currentUserId && isConnected) {
        console.log('🎯 Création automatique de conversation événement:', state.eventId, state.eventTitle);
        
        try {
          const conversationData = await createOrGetEventConversation(state.eventId, state.eventTitle);
          console.log('✅ Conversation événement créée:', conversationData);
          
          // Créer la conversation pour l'affichage
          const eventConversation: Conversation = {
            id: conversationData._id,
            name: `💬 ${state.eventTitle}`,
            avatar: { type: 'icon', value: 'people', gradient: 'from-green-400 to-emerald-600' },
            lastMessage: 'Bienvenue dans la discussion de l\'événement !',
            time: 'Now',
            unread: 0,
            isOnline: true,
            isGroup: true,
            userId: '',
            conversationId: conversationData._id,
            participantIds: conversationData.participant_ids
          };
          
          // Ouvrir directement cette conversation
          setSelectedConversation(eventConversation);
          
          // Nettoyer l'état de navigation pour éviter de recréer la conversation
          window.history.replaceState(null, '', location.pathname);
          
        } catch (error) {
          console.error('❌ Erreur lors de la création de conversation événement:', error);
        }
      }
    };
    
    handleEventConversation();
  }, [location.state, currentUserId, isConnected, createOrGetEventConversation]);

  // Déclarations des fonctions avant leur utilisation
  const handleBackToList = () => {
    setSelectedConversation(null);
    // Rafraîchir les conversations pour mettre à jour les compteurs
    refetch();
  };

  const handleConversationClick = (conversation: Conversation) => {
    console.log(`Ouverture de la conversation avec: ${conversation.name}`);
    setSelectedConversation(conversation);
  };

  // Si une conversation est sélectionnée et on a l'ID utilisateur, afficher le chat
  if (selectedConversation && currentUserId) {
    return (
      <NewChat
        conversation={selectedConversation}
        currentUserId={currentUserId}
        onBack={handleBackToList}
        onConversationUpdate={refetch}
      />
    );
  }

  // Filtrer les conversations selon le terme de recherche
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleAddFriend = (userId: string) => {
    // La demande d'ami a été envoyée
    console.log('Demande d\'ami envoyée à:', userId);
  };

  const handleCloseUserSearch = () => {
    setShowUserSearch(false);
  };

  const handleCloseUserProfile = () => {
    setShowUserProfile(false);
    setSelectedUser(null);
  };

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
      {loading && (
        <div className="px-6 mb-6">
          <GlassCard className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Chargement des conversations...</p>
          </GlassCard>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="px-6 mb-6">
          <GlassCard className="text-center py-8">
            <IonIcon name="alert-circle" className="text-4xl text-red-400 mb-4" />
            <h3 className="text-white font-semibold mb-2">Erreur de chargement</h3>
            <p className="text-white/60 text-sm mb-4">{error}</p>
            <Button onClick={refetch} variant="primary" size="sm">
              Réessayer
            </Button>
          </GlassCard>
        </div>
      )}

      {/* Conversations List */}
      {!loading && !error && (
        <main className="px-6 pb-8">
          <div className="space-y-3">
            {filteredConversations.map((conversation, index) => (
              <ConversationItem
                key={conversation.conversationId || conversation.id}
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

export default NewConversations;