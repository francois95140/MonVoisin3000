import React, { useState, useEffect } from 'react';
import { IonIcon, GlassCard, Button } from '../../components/shared';
import { UserProfileModalProps } from './types';
import { toast } from 'react-toastify';

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  currentUserId,
  onSendMessage,
  onAddFriend 
}) => {
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'friends' | 'sent'>('none');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user.id) {
      checkFriendshipStatus();
    }
  }, [isOpen, user.id]);

  const checkFriendshipStatus = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) return;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/friends/status/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFriendshipStatus(data.status || 'none');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut d\'amitié:', error);
    }
  };

  const handleSendFriendRequest = async () => {
    setLoading(true);
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
        body: JSON.stringify({ to: user.id })
      });

      if (response.ok) {
        setFriendshipStatus('sent');
        toast.success(`Demande d'ami envoyée à ${user.pseudo}`);
        onAddFriend(user.id);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi de la demande d\'ami');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande d\'ami:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    onSendMessage(user.id);
    onClose();
  };

  const renderUserAvatar = () => {
    if (user.avatar) {
      return (
        <img 
          src={user.avatar} 
          alt={user.pseudo} 
          className="w-full h-full object-cover"
        />
      );
    }

    const initials = (user.pseudo || user.tag || 'U').substring(0, 2).toUpperCase();
    const colors = ['from-blue-400 to-purple-600', 'from-green-400 to-teal-600', 'from-pink-400 to-red-600', 'from-yellow-400 to-orange-600'];
    const colorIndex = user.id.length % colors.length;
    
    return (
      <div className={`w-full h-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center`}>
        <span className="text-white font-bold text-2xl">{initials}</span>
      </div>
    );
  };

  const getFriendButtonText = () => {
    switch (friendshipStatus) {
      case 'friends': return 'Déjà ami';
      case 'sent': return 'Demande envoyée';
      case 'pending': return 'Accepter la demande';
      default: return 'Ajouter en ami';
    }
  };

  const getFriendButtonIcon = () => {
    switch (friendshipStatus) {
      case 'friends': return 'checkmark-circle';
      case 'sent': return 'time';
      case 'pending': return 'person-add';
      default: return 'person-add';
    }
  };

  const canSendFriendRequest = () => {
    return friendshipStatus === 'none';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <GlassCard className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 text-center">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl transition-colors"
          >
            <IonIcon name="close" />
          </button>

          {/* Profile Picture */}
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white/20">
            {renderUserAvatar()}
          </div>

          {/* Online Status */}
          {user.isOnline && (
            <div className="absolute top-20 left-1/2 transform translate-x-6 translate-y-6">
              <div className="w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
          )}

          {/* Name and Tag */}
          <h2 className="text-2xl font-bold text-white mb-1">{user.pseudo}</h2>
          {user.tag && (
            <p className="text-white/60 mb-2">@{user.tag}</p>
          )}

          {/* Status */}
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            <span className="text-white/70">
              {user.isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <div className="flex space-x-3 mb-6">
            <Button
              onClick={handleSendMessage}
              variant="primary"
              className="flex-1"
            >
              <IonIcon name="chatbubble" className="w-5 h-5 mr-2" />
              Envoyer un message
            </Button>

            <Button
              onClick={handleSendFriendRequest}
              variant="secondary"
              className="flex-1"
              disabled={!canSendFriendRequest() || loading}
            >
              <IonIcon name={getFriendButtonIcon()} className="w-5 h-5 mr-2" />
              {loading ? 'Envoi...' : getFriendButtonText()}
            </Button>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            {/* Bio */}
            {user.bio && (
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <IonIcon name="document-text" className="text-white/60 text-lg" />
                  <h3 className="text-white font-medium">À propos</h3>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{user.bio}</p>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <IonIcon name="information-circle" className="text-white/60 text-lg" />
                <h3 className="text-white font-medium">Informations</h3>
              </div>
              
              <div className="space-y-3">
                {/* Pseudo */}
                <div className="flex items-center space-x-3">
                  <IonIcon name="person" className="text-white/40 text-lg w-5" />
                  <div>
                    <p className="text-white/60 text-xs">Pseudo</p>
                    <p className="text-white text-sm">{user.pseudo}</p>
                  </div>
                </div>

                {/* Tag */}
                {user.tag && (
                  <div className="flex items-center space-x-3">
                    <IonIcon name="at" className="text-white/40 text-lg w-5" />
                    <div>
                      <p className="text-white/60 text-xs">Tag</p>
                      <p className="text-white text-sm">@{user.tag}</p>
                    </div>
                  </div>
                )}

                {/* Email (si ami) */}
                {friendshipStatus === 'friends' && user.email && (
                  <div className="flex items-center space-x-3">
                    <IonIcon name="mail" className="text-white/40 text-lg w-5" />
                    <div>
                      <p className="text-white/60 text-xs">Email</p>
                      <p className="text-white text-sm">{user.email}</p>
                    </div>
                  </div>
                )}

                {/* Phone (si ami) */}
                {friendshipStatus === 'friends' && user.phoneNumber && (
                  <div className="flex items-center space-x-3">
                    <IonIcon name="call" className="text-white/40 text-lg w-5" />
                    <div>
                      <p className="text-white/60 text-xs">Téléphone</p>
                      <p className="text-white text-sm">{user.phoneNumber}</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {user.address && (
                  <div className="flex items-start space-x-3">
                    <IonIcon name="location" className="text-white/40 text-lg w-5 mt-1" />
                    <div>
                      <p className="text-white/60 text-xs">Adresse</p>
                      <p className="text-white text-sm">
                        {user.ville || user.address}
                        {user.cp && ` (${user.cp})`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Member Since */}
                {user.createdAt && (
                  <div className="flex items-center space-x-3">
                    <IonIcon name="calendar" className="text-white/40 text-lg w-5" />
                    <div>
                      <p className="text-white/60 text-xs">Membre depuis</p>
                      <p className="text-white text-sm">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Notice */}
            {friendshipStatus !== 'friends' && (
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <IonIcon name="shield-checkmark" className="text-blue-400 text-lg mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-300 font-medium text-sm mb-1">Informations de contact</h4>
                    <p className="text-blue-200/80 text-xs">
                      Ajoutez cet utilisateur en ami pour voir ses informations de contact complètes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Fermer
            </Button>
            
            {friendshipStatus === 'friends' && (
              <Button
                onClick={() => {/* TODO: View full profile */}}
                variant="secondary"
                className="flex-1"
              >
                <IonIcon name="eye" className="w-4 h-4 mr-2" />
                Voir le profil complet
              </Button>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default UserProfileModal;