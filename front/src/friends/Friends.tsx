import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { IonIcon, GlassCard, Button } from '../components/shared';
import { toast } from 'react-toastify';

interface Friend {
  id?: string;
  userPgId?: string;
  pseudo: string;
  tag: string;
  avatar?: string;
  bio?: string;
  isOnline?: boolean;
  status: 'friends' | 'pending' | 'received';
  requestDate?: string;
}

const Friends: React.FC = () => {
  document.getElementById("indicator")?.classList.add("filter", "opacity-0");
  setTimeout(() => {
    const indicator = document.getElementById("indicator");
    if (indicator && indicator.parentNode) {
      const list = indicator.parentNode.children;
      Array.from(list).forEach((el) => el.classList.remove("active"));
    }
  }, 0);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'received'>('friends');

  // Fonction utilitaire pour obtenir l'ID utilisateur
  const getUserId = (user: Friend): string => {
    return user.id || user.userPgId || '';
  };

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const fetchFriendsData = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Vous devez être connecté pour voir vos amis');
        return;
      }

      // Récupérer les amis
      const friendsResponse = await fetch(`${apiUrl}/api/friends`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Récupérer les demandes envoyées
      const pendingResponse = await fetch(`${apiUrl}/api/friends/requests/outgoing`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Récupérer les demandes reçues
      const receivedResponse = await fetch(`${apiUrl}/api/friends/requests/incoming`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json();
        setFriends(friendsData.map((friend: any) => ({ ...friend, status: 'friends' as const })));
      }

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingRequests(pendingData.map((friend: any) => ({ ...friend, status: 'pending' as const })));
      }

      if (receivedResponse.ok) {
        const receivedData = await receivedResponse.json();
        setReceivedRequests(receivedData.map((friend: any) => ({ ...friend, status: 'received' as const })));
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des amis:', error);
      toast.error('Erreur lors du chargement des données d\'amitié');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (friendId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      const response = await fetch(`${apiUrl}/api/friends/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ from: friendId })
      });

      if (response.ok) {
        toast.success('Demande d\'ami acceptée');
        fetchFriendsData(); // Refresh data
      } else {
        throw new Error('Erreur lors de l\'acceptation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'acceptation de la demande');
    }
  };

  const handleRejectRequest = async (friendId: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      const response = await fetch(`${apiUrl}/api/friends/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ from: friendId })
      });

      if (response.ok) {
        toast.success('Demande d\'ami refusée');
        fetchFriendsData(); // Refresh data
      } else {
        throw new Error('Erreur lors du refus');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du refus de la demande');
    }
  };

  const handleCancelRequest = async (friendId: string) => {
    try {
      console.log('🔥 Annulation demande ami - ID:', friendId);
      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      console.log('🔥 API URL:', apiUrl);
      console.log('🔥 Payload:', { to: friendId });
      
      const response = await fetch(`${apiUrl}/api/friends/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to: friendId })
      });

      console.log('🔥 Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🔥 Success result:', result);
        toast.success('Demande d\'ami annulée');
        fetchFriendsData(); // Refresh data
      } else {
        const errorData = await response.json();
        console.error('🔥 Error response:', errorData);
        throw new Error(`Erreur ${response.status}: ${errorData.message || 'Erreur lors de l\'annulation'}`);
      }
    } catch (error) {
      console.error('🔥 Erreur complète:', error);
      toast.error('Erreur lors de l\'annulation de la demande');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cet ami ?')) return;

    try {
      // TODO: Implémenter l'endpoint remove friend dans le backend
      toast.info('Fonctionnalité de suppression d\'ami à implémenter');
      console.log('Remove friend:', friendId);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression de l\'ami');
    }
  };

  const renderUserAvatar = (user: Friend) => {
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

  const renderFriendCard = (user: Friend, actions: React.ReactNode) => (
    <div key={user.id || user.userPgId || user.pseudo || Math.random()} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
      <div className="flex items-center space-x-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/20">
          {renderUserAvatar(user)}
          {user.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-white font-medium">{user.pseudo}</h3>
          <p className="text-white/60 text-sm">@{user.tag}</p>
          {user.bio && (
            <p className="text-white/50 text-xs mt-1 line-clamp-1">{user.bio}</p>
          )}
          {user.requestDate && (
            <p className="text-white/40 text-xs mt-1">
              Demande du {new Date(user.requestDate).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      </div>
    </div>
  );

  const currentData = activeTab === 'friends' ? friends : 
                     activeTab === 'pending' ? pendingRequests : 
                     receivedRequests;

  return (
    <>
      <div 
        className="min-h-screen pt-8 pb-8 px-4"
        style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center mb-8 fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Mes Amis</h1>
            <p className="text-white/70">Gérez vos amitiés et demandes</p>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <NavLink to="/profile">
              <Button variant="secondary" className="transform hover:scale-105 p-3">
                <IonIcon name="arrow-back" className="w-5 h-5" />
              </Button>
            </NavLink>
            
            <NavLink to="/convs">
              <Button variant="primary" className="transform hover:scale-105 p-3">
                <IonIcon name="person-add" className="w-5 h-5" />
              </Button>
            </NavLink>
          </div>

          {/* Tabs */}
          <GlassCard>
            <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex flex-col items-center justify-center space-y-1 ${
                  activeTab === 'friends' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <IonIcon name="people" className="w-5 h-5" />
                <span className="text-sm">Amis ({friends.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('received')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex flex-col items-center justify-center space-y-1 relative ${
                  activeTab === 'received' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <IonIcon name="person-add" className="w-5 h-5" />
                <span className="text-sm">À accepter ({receivedRequests.length})</span>
                {receivedRequests.length > 0 && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 flex flex-col items-center justify-center space-y-1 ${
                  activeTab === 'pending' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <IonIcon name="time" className="w-5 h-5" />
                <span className="text-sm">En attente ({pendingRequests.length})</span>
              </button>
            </div>
          </GlassCard>

          {/* Content */}
          <GlassCard>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white/70">Chargement...</p>
              </div>
            ) : currentData.length === 0 ? (
              <div className="text-center py-8">
                <IonIcon 
                  name={activeTab === 'friends' ? 'people-outline' : 
                        activeTab === 'received' ? 'person-add-outline' : 
                        'time-outline'} 
                  className="w-16 h-16 text-white/30 mx-auto mb-4" 
                />
                <h3 className="text-white font-medium mb-2">
                  {activeTab === 'friends' && 'Aucun ami pour le moment'}
                  {activeTab === 'received' && 'Aucune demande reçue'}
                  {activeTab === 'pending' && 'Aucune demande en attente'}
                </h3>
                <p className="text-white/60 text-sm">
                  {activeTab === 'friends' && 'Commencez à ajouter des amis pour créer votre réseau'}
                  {activeTab === 'received' && 'Les demandes d\'amitié que vous recevez apparaîtront ici'}
                  {activeTab === 'pending' && 'Les demandes que vous avez envoyées apparaîtront ici'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTab === 'friends' && friends.map(friend => 
                  renderFriendCard(friend, (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {/* TODO: Open chat */}}
                        className="flex items-center space-x-1"
                      >
                        <IonIcon name="chatbubble" className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveFriend(getUserId(friend))}
                        className="flex items-center space-x-1"
                      >
                        <IonIcon name="person-remove" className="w-4 h-4" />
                      </Button>
                    </>
                  ))
                )}

                {activeTab === 'received' && receivedRequests.map(request => 
                  renderFriendCard(request, (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleAcceptRequest(getUserId(request))}
                        className="flex items-center space-x-1"
                      >
                        <IonIcon name="checkmark" className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRejectRequest(getUserId(request))}
                        className="flex items-center space-x-1"
                      >
                        <IonIcon name="close" className="w-4 h-4" />
                      </Button>
                    </>
                  ))
                )}

                {activeTab === 'pending' && pendingRequests.map(request => 
                  renderFriendCard(request, (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCancelRequest(getUserId(request))}
                      className="flex items-center space-x-1"
                    >
                      <IonIcon name="close" className="w-4 h-4" />
                      <span>Annuler</span>
                    </Button>
                  ))
                )}
              </div>
            )}
          </GlassCard>


        </div>
      </div>
    </>
  );
};

export default Friends;