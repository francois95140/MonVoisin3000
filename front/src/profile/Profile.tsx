import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { IonIcon, GlassCard, ToggleSwitch, Button } from '../components/shared';
import { toast } from 'react-toastify';
import { useTheme } from '../contexts/ThemeContext';

interface ProfilePageProps {}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  const { theme, toggleTheme } = useTheme();

  document.getElementById("indicator")?.classList.add("filter", "opacity-0");
  setTimeout(() => {
    const indicator = document.getElementById("indicator");
    if (indicator && indicator.parentNode) {
      const list = indicator.parentNode.children;
      Array.from(list).forEach((el) => el.classList.remove("active"));
    }
  }, 0);

  const [formData, setFormData] = useState({
    pseudo: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    tag:'',
    avatar: '',
    geoPermission: 'friends-only'
  });

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupération des informations utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL;
        // Récupération du token d'authentification
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('Token d\'authentification manquant. Veuillez vous reconnecter.');
        }
        
        const response = await fetch(`${apiUrl}/api/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expiré ou invalide
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            throw new Error('Session expirée. Veuillez vous reconnecter.');
          }
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const userDataResponse = await response.json();
        setUserData(userDataResponse);
        setFormData({
          pseudo: userDataResponse.pseudo || '',
          email: userDataResponse.email || '',
          phone: userDataResponse.phoneNumber || '',
          address: userDataResponse.address || '',
          bio: userDataResponse.bio || '',
          tag: userDataResponse.tag || '',
          avatar: userDataResponse.avatar || '',
          geoPermission: userDataResponse.geoPermission || 'friends-only'
        });
      } catch (err) {
        console.error('Erreur lors de la récupération des données utilisateur:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const [avatar, setAvatar] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      // Supprimer les tokens de connexion
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      
      // Redirection vers la page de connexion
      window.location.href = '/connexion';
    }
  };

  const handleDeleteAccount = async () => {
    const confirmMessage = '⚠️ ATTENTION : Cette action est irréversible !\n\n' +
                          'Êtes-vous absolument sûr de vouloir supprimer votre compte ?\n' +
                          'Toutes vos données seront perdues définitivement.\n\n' +
                          'Tapez "SUPPRIMER" pour confirmer (en majuscules) :';
    
    const userInput = window.prompt(confirmMessage);
    
    if (userInput === 'SUPPRIMER') {
      const doubleConfirm = window.confirm(
        'Dernière confirmation !\n\n' +
        'Vous êtes sur le point de supprimer définitivement votre compte.\n' +
        'Cette action ne peut pas être annulée.\n\n' +
        'Confirmer la suppression ?'
      );
      
      if (doubleConfirm) {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          
          if (!token) {
            toast.error('Session expirée. Veuillez vous reconnecter.');
            setTimeout(() => {
              window.location.href = '/connexion';
            }, 2000);
            return;
          }

          const response = await fetch(`${apiUrl}/api/users/me`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          });

          if (response.ok) {
            const data = await response.json();
            
            // Nettoyer toutes les données utilisateur du localStorage/sessionStorage
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');
            localStorage.removeItem('UserImage');
            sessionStorage.removeItem('UserImage');
            localStorage.removeItem('UserPseudo');
            sessionStorage.removeItem('UserPseudo');
            
            toast.success('Votre compte a été supprimé avec succès. Redirection en cours...');
            
            // Redirection vers la page d'accueil après un délai
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
            
          } else {
            const errorData = await response.json();
            
            if (response.status === 401) {
              localStorage.removeItem('authToken');
              sessionStorage.removeItem('authToken');
              toast.error('Session expirée. Veuillez vous reconnecter.');
              setTimeout(() => {
                window.location.href = '/connexion';
              }, 2000);
              return;
            }
            
            console.error('Erreur lors de la suppression:', errorData);
            toast.error(`Erreur lors de la suppression du compte: ${errorData.message || 'Une erreur est survenue'}`);
          }
          
        } catch (error) {
          console.error('Erreur réseau:', error);
          toast.error('Erreur de connexion. Veuillez réessayer.');
        }
      }
    } else if (userInput !== null) {
      toast.warning('Suppression annulée. Vous devez taper exactement "SUPPRIMER" pour confirmer.');
    }
  };

  return (
    <>
      
      <div 
        className="min-h-screen pt-8 pb-8 px-4"
        style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
      >
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center mb-8 fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Mon Profil</h1>
            <p className="text-white/70">Gérez vos informations personnelles <br/> et paramètres</p>
          </div>

          {/* État de chargement */}
          {loading && (
            <GlassCard className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className="text-white">Chargement des informations...</span>
              </div>
            </GlassCard>
          )}

          {/* Affichage d'erreur */}
          {error && (
            <GlassCard>
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <IonIcon name="alert-circle" className="text-red-400 text-xl" />
                  <span className="text-red-400 font-medium">Erreur de chargement</span>
                </div>
                <p className="text-red-300 mt-2 text-sm">{error}</p>
                <div className="flex space-x-2 mt-3">
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="danger"
                    size="sm"
                  >
                    Réessayer
                  </Button>
                  {error.includes('authentification') || error.includes('Session expirée') ? (
                    <NavLink to="/login">
                      <Button variant="primary" size="sm">
                        Se connecter
                      </Button>
                    </NavLink>
                  ) : null}
                </div>
              </div>
            </GlassCard>
          )}
          
          {/* Informations personnelles */}
          {!loading && !error && (
          <GlassCard>
          <div className="relative mb-4 flex justify-center">
              <div className="h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                {formData.avatar ? (
                  <img 
                    src={formData.avatar} 
                    alt="Avatar" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <IonIcon 
                    name="person" 
                    className="text-white text-4xl"
                  />
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/70">
                <div>
                  <span className="text-sm">Pseudo :</span>
                  <p className="font-medium text-white">{formData.pseudo}</p>
                </div>
                <div>
                  <span className="text-sm">Email :</span>
                  <p className="font-medium text-white">{formData.email}</p>
                </div>
                <div>
                  <span className="text-sm">Téléphone :</span>
                  <p className="font-medium text-white">{formData.phone}</p>
                </div>
                <div>
                  <span className="text-sm">Adresse :</span>
                  <p className="font-medium text-white">{formData.address}</p>
                </div>
              </div>
              
              <div className="text-white/70">
                <span className="text-sm">Bio :</span>
                <p className="font-medium text-white mt-1">{formData.bio}</p>
              </div>

              <NavLink 
                to="/editprofil"
                state={{ 
                  userData: {
                    pseudo: formData.pseudo,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    bio: formData.bio,
                    tag: formData.tag,
                    avatar: formData.avatar,
                    // Extraction des composants d'adresse si disponibles  
                    rue: userData?.rue || formData.address?.split(',')[0] || '',
                    ville: userData?.ville || formData.address?.split(',').pop()?.trim() || '',
                    codePostal: userData?.cp || (formData.address?.match(/\d{5}/)?.[0]) || '',
                    cp: userData?.cp || (formData.address?.match(/\d{5}/)?.[0]) || ''
                  }
                }}
                className="w-full"
              >
                <Button variant="success" className="w-full transform hover:scale-105">
                  Modifier mes informations
                </Button>
              </NavLink>
            </div>
          </GlassCard>
          )}

          {/* Sécurité et mot de passe */}
          <GlassCard>
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="lock-closed" className="w-6 h-6 text-white flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white">Sécurité</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-white/70 text-sm">
                Modifiez votre mot de passe pour sécuriser votre compte
              </p>

              <NavLink to="/changepassword" className="w-full">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  Modifier le mot de passe
                </Button>
              </NavLink>
            </div>
          </GlassCard>

          {/* Paramètres de géolocalisation */}
          <GlassCard>
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="location" className="w-6 h-6 text-white flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white">Géolocalisation</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-white/70 text-sm">
                Choisissez qui peut voir votre localisation en temps réel
              </p>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">Visibilité de ma position</label>
                <select 
                  name="geoPermission"
                  value={formData.geoPermission}
                  onChange={handleInputChange}
                  className="w-full py-3 px-4 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="everyone" className="bg-gray-800 text-white">Tout le monde</option>
                  <option value="friends-only" className="bg-gray-800 text-white">Mes amis uniquement</option>
                  <option value="authorized-friends" className="bg-gray-800 text-white">Amis avec autorisation</option>
                  <option value="nobody" className="bg-gray-800 text-white">Personne</option>
                </select>
              </div>

              <div className="p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
                <div className="flex items-start space-x-3">
                  <IonIcon name="shield-checkmark" className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Note de confidentialité</p>
                    <p className="text-blue-200/80 text-xs mt-1">
                      Vos données de localisation sont chiffrées et ne sont jamais partagées avec des tiers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Paramètres d'apparence */}
          <GlassCard>
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="color-palette" className="w-6 h-6 text-white flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white">Apparence</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Mode sombre</h3>
                  <p className="text-white/60 text-sm">Basculer vers le thème sombre pour un confort visuel</p>
                </div>
                <ToggleSwitch 
                  defaultChecked={theme === 'dark'} 
                  onChange={toggleTheme}
                />
              </div>
            </div>
          </GlassCard>

          {/* Paramètres de notifications */}
          <GlassCard>
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="notifications" className="w-6 h-6 text-white flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Messages privés</h3>
                  <p className="text-white/60 text-sm">Recevoir les notifications des nouveaux messages</p>
                </div>
                <ToggleSwitch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Événements du quartier</h3>
                  <p className="text-white/60 text-sm">Être notifié des nouveaux événements près de chez vous</p>
                </div>
                <ToggleSwitch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Troc & Services</h3>
                  <p className="text-white/60 text-sm">Recevoir les notifications des nouveaux trocs et services disponibles</p>
                </div>
                <ToggleSwitch defaultChecked={true} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Nouvelles demandes d'amis</h3>
                  <p className="text-white/60 text-sm">Recevoir les notifications des demandes d'amis</p>
                </div>
                <ToggleSwitch defaultChecked={false} />
              </div>
            </div>
          </GlassCard>

          {/* Liens rapides */}
          <GlassCard>
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="people" className="w-6 h-6 text-white flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white">Liens rapides</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NavLink 
                to="/friends" 
                className="flex items-center space-x-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/20"
              >
                <IonIcon name="people-circle" className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Mes amis</span>
              </NavLink>

              <NavLink 
                to="/blocked-users" 
                className="hidden flex items-center space-x-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/20"
              >
                <IonIcon name="remove-circle" className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Utilisateurs bloqués</span>
              </NavLink>

              <NavLink 
                to="/privacy" 
                className="flex items-center space-x-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/20"
              >
                <IonIcon name="shield-checkmark" className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Confidentialité</span>
              </NavLink>

              <NavLink 
                to="/help" 
                className="flex items-center space-x-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/20 md:col-span-2"
              >
                <IonIcon name="help-circle" className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Aide & Support</span>
              </NavLink>
            </div>
          </GlassCard>

          {/* Actions de compte */}
          <div className="space-y-4 fade-in">
            <Button 
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 space-x-3 py-4"
              icon="log-out"
            >
              Se déconnecter
            </Button>

            <div className="danger-zone rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <IonIcon name="trash" className="w-6 h-6 text-red-400 flex-shrink-0" />
                <h2 className="text-xl font-semibold text-red-400">Zone de danger</h2>
              </div>
              
              <p className="text-red-200/80 text-sm mb-4">
                Une fois supprimé, votre compte ne pourra pas être récupéré. Cette action est irréversible.
              </p>
              
              <Button 
                onClick={handleDeleteAccount}
                variant="danger"
                className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                Supprimer mon compte
              </Button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProfilePage;