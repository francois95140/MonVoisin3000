import React, { useState, useEffect } from 'react';
import { IonIcon, GlassCard } from '../../components/shared';
import { Conversation } from './types';
import UserProfileModal from './UserProfileModal';

const apiUrl = import.meta.env.VITE_API_URL;

interface User {
  id: string;
  pseudo: string;
  tag?: string;
  avatar?: string;
}

interface ConversationDetailsModalProps {
  conversation: Conversation;
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
  onLeaveGroup?: (conversationId: string) => void;
}

const ConversationDetailsModal: React.FC<ConversationDetailsModalProps> = ({
  conversation,
  currentUserId,
  isOpen,
  onClose,
  onLeaveGroup
}) => {
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Charger les détails des participants
  useEffect(() => {
    if (isOpen && conversation.participantIds && conversation.participantIds.length > 0) {
      loadParticipants();
    }
  }, [isOpen, conversation.participantIds]);

  const loadParticipants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) return;

      // Récupérer les détails de chaque participant
      const participantPromises = conversation.participantIds.map(async (userId) => {
        try {
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
              tag: userData.tag,
              avatar: userData.avatar
            };
          }
        } catch (error) {
          console.warn(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
        }
        return null;
      });

      const participantsData = (await Promise.all(participantPromises)).filter(Boolean) as User[];
      setParticipants(participantsData);
    } catch (error) {
      console.error('Erreur lors du chargement des participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: User) => {
    if (user.id !== currentUserId) {
      setSelectedUser(user);
      setShowUserProfile(true);
    }
  };

  const handleLeaveGroup = () => {
    if (onLeaveGroup) {
      onLeaveGroup(conversation.conversationId || conversation.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        style={{ paddingBottom: '6.6rem' }}
        onClick={onClose}
      >
        <GlassCard 
          className="w-full max-w-md max-h-full overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${conversation.avatar.gradient} flex items-center justify-center`}>
                {conversation.avatar.type === 'initials' && (
                  <span className="text-white font-bold text-xl">{conversation.avatar.value}</span>
                )}
                {conversation.avatar.type === 'icon' && (
                  <IonIcon name={conversation.avatar.value} className="text-white text-3xl" />
                )}
                {conversation.avatar.type === 'image' && (
                  <img 
                    src={conversation.avatar.value} 
                    alt={conversation.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{conversation.name}</h2>
                <p className="text-white/70 text-sm">
                  {conversation.isGroup ? 'Conversation de groupe' : 'Conversation privée'}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <IonIcon name="close" className="text-white text-xl" />
              </button>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Participants */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {conversation.isGroup ? `Membres (${participants.length})` : 'Participant'}
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {participants.map((user) => (
                    <div 
                      key={user.id}
                      className={`flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors ${
                        user.id !== currentUserId ? 'cursor-pointer' : 'cursor-default'
                      }`}
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.pseudo}
                            className="w-full h-full rounded-full object-cover" 
                          />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {user.pseudo.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {user.pseudo}
                          {user.id === currentUserId && (
                            <span className="text-cyan-400 text-sm ml-2">(Vous)</span>
                          )}
                        </p>
                        {user.tag && (
                          <p className="text-white/60 text-sm">#{user.tag}</p>
                        )}
                      </div>
                      {user.id !== currentUserId && (
                        <IonIcon name="chevron-forward" className="text-white/50" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 space-y-3">
              <button
                onClick={handleLeaveGroup}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-orange-600 hover:bg-orange-700 rounded-xl text-white font-medium transition-colors"
              >
                <IonIcon name="exit-outline" />
                <span>Quitter le groupe</span>
              </button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Modale de profil utilisateur */}
      {showUserProfile && selectedUser && (
        <UserProfileModal
          user={selectedUser}
          isOpen={showUserProfile}
          onClose={() => {
            setShowUserProfile(false);
            setSelectedUser(null);
          }}
          onStartConversation={(user) => {
            setShowUserProfile(false);
            setSelectedUser(null);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default ConversationDetailsModal;