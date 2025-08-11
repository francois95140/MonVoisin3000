import React, { useState, useEffect, useCallback } from 'react';
import { IonIcon, GlassCard, Button } from '../../components/shared';
import { UserSearchModalProps, User } from './types';

const UserSearchModal: React.FC<UserSearchModalProps> = ({ 
  isOpen, 
  onClose, 
  onUserSelect, 
  currentUserId 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Recherche par pseudo ou tag - les paramètres seront convertis par le schema Zod
      const response = await fetch(`${apiUrl}/api/users/search?query=${encodeURIComponent(query)}&page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setUsers([]);
          return;
        }
        throw new Error('Erreur lors de la recherche d\'utilisateurs');
      }

      const data = await response.json();
      // L'API renvoie directement { users: User[], total: number }
      const foundUsers = data.users || [];
      
      // Filtrer l'utilisateur current
      const filteredUsers = foundUsers.filter((user: User) => user.id !== currentUserId);
      setUsers(filteredUsers);

    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Debounce la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchUsers]);

  const handleUserClick = (user: User) => {
    onUserSelect(user);
  };

  const renderUserAvatar = (user: User) => {
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
        <span className="text-white font-bold text-lg">{initials}</span>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      style={{ paddingBottom: '6.6rem' }}
    >
      <GlassCard className="w-full max-w-md max-h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Nouvelle conversation</h2>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl transition-colors"
          >
            <IonIcon name="close" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-white/10">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par pseudo ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:bg-white/15 focus:border-white/40 focus:outline-none transition-all duration-300"
              autoFocus
            />
            <IonIcon 
              name="search" 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 text-xl"
            />
          </div>
          
          {searchTerm.length > 0 && searchTerm.length < 2 && (
            <p className="text-white/60 text-sm mt-2">
              Tapez au moins 2 caractères pour rechercher
            </p>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              <span className="text-white/70">Recherche en cours...</span>
            </div>
          )}

          {error && (
            <div className="p-6 text-center">
              <IonIcon name="alert-circle" className="text-red-400 text-4xl mb-3" />
              <p className="text-red-300 mb-4">{error}</p>
              <Button 
                onClick={() => searchUsers(searchTerm)} 
                variant="primary" 
                size="sm"
              >
                Réessayer
              </Button>
            </div>
          )}

          {!loading && !error && users.length === 0 && searchTerm.length >= 2 && (
            <div className="p-6 text-center">
              <IonIcon name="people" className="text-white/30 text-4xl mb-3" />
              <h3 className="text-white font-medium mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-white/60 text-sm">
                Aucun utilisateur ne correspond à votre recherche "{searchTerm}"
              </p>
            </div>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="space-y-2 p-4">
              {users.map((user, index) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    {renderUserAvatar(user)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-white font-medium truncate">
                        {user.pseudo}
                      </h3>
                      {user.tag && (
                        <span className="text-white/60 text-sm">@{user.tag}</span>
                      )}
                    </div>
                    
                    {user.bio && (
                      <p className="text-white/60 text-sm truncate">
                        {user.bio}
                      </p>
                    )}
                    
                    {user.address && (
                      <div className="flex items-center space-x-1 mt-1">
                        <IonIcon name="location-outline" className="text-white/50 text-xs" />
                        <span className="text-white/50 text-xs truncate">
                          {user.ville || user.address}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    {user.isOnline && (
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    )}
                    <IonIcon name="chevron-forward" className="text-white/40 text-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && searchTerm.length === 0 && (
            <div className="p-6 text-center">
              <IonIcon name="search" className="text-white/30 text-4xl mb-3" />
              <h3 className="text-white font-medium mb-2">Rechercher des voisins</h3>
              <p className="text-white/60 text-sm">
                Utilisez le champ de recherche pour trouver vos voisins par pseudo ou tag
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <Button 
            onClick={onClose}
            variant="secondary"
            className="w-full"
          >
            Annuler
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

export default UserSearchModal;