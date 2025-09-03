import React, { useState, useEffect } from 'react';
import { Modal, Button, IonIcon } from '../components/shared';
import { toast } from 'react-toastify';

interface Suggestion {
  user: {
    id: string;
    pseudo: string;
    tag: string;
    avatar?: string;
    bio?: string;
  };
  mutualFriends: number;
  friendScore: number;
}

interface FriendSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFriendAdded: () => void;
}

const FriendSuggestionModal: React.FC<FriendSuggestionModalProps> = ({
  isOpen,
  onClose,
  onFriendAdded
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Vous devez être connecté');
        return;
      }

      const response = await fetch(`${apiUrl}/api/friends/suggestions?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.data || data || []);
      } else {
        throw new Error('Erreur lors de la récupération des suggestions');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des suggestions');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      setSendingRequest(userId);
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      const response = await fetch(`${apiUrl}/api/friends/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to: userId })
      });

      if (response.ok) {
        toast.success('Demande d\'ami envoyée');
        setSuggestions(prev => prev.filter(s => s.user.id !== userId));
        onFriendAdded();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi de la demande');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'envoi de la demande d\'ami');
    } finally {
      setSendingRequest(null);
    }
  };

  const renderUserAvatar = (user: Suggestion['user']) => {
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
    const colorIndex = (user.id?.length || user.pseudo?.length || user.tag?.length || 1) % colors.length;
    
    return (
      <div className={`w-full h-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center`}>
        <span className="text-white font-bold text-lg">{initials}</span>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Suggestions d'amis"
      size="md"
    >
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Chargement des suggestions...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8">
            <IonIcon name="people-outline" className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Aucune suggestion disponible</h3>
            <p className="text-white/60 text-sm">
              Revenez plus tard pour voir de nouvelles suggestions d'amis
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.user.id} 
                className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/20">
                    {renderUserAvatar(suggestion.user)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{suggestion.user.pseudo}</h3>
                    <p className="text-white/60 text-sm">@{suggestion.user.tag}</p>
                    {suggestion.user.bio && (
                      <p className="text-white/50 text-xs mt-1 line-clamp-2">{suggestion.user.bio}</p>
                    )}
                    {suggestion.mutualFriends > 0 && (
                      <p className="text-white/40 text-xs mt-1">
                        {suggestion.mutualFriends} ami{suggestion.mutualFriends > 1 ? 's' : ''} en commun
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => sendFriendRequest(suggestion.user.id)}
                      disabled={sendingRequest === suggestion.user.id}
                      className="flex items-center space-x-2"
                    >
                      {sendingRequest === suggestion.user.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <IonIcon name="person-add" className="w-4 h-4" />
                      )}
                      <span>Ajouter</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
        {suggestions.length > 0 && (
          <Button variant="primary" onClick={fetchSuggestions} disabled={loading}>
            <IonIcon name="refresh" className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default FriendSuggestionModal;