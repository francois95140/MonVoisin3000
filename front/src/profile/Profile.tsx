import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

// Composant pour les icônes Ionicons
const IonIcon: React.FC<{ name: string; className?: string }> = ({ name, className = "" }) => (
  <ion-icon name={name} class={className}></ion-icon>
);

interface ProfilePageProps {}

const ProfilePage: React.FC<ProfilePageProps> = () => {

  document.getElementById("indicator")?.classList.add("filter", "opacity-0");
  setTimeout(() => {
    const list = document.getElementById("indicator").parentNode.children;
    Array.from(list).forEach((el) => el.classList.remove("active"));
  }, 0);

  const [formData, setFormData] = useState({
    pseudo: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    tag:'',
    geoPermission: 'friends-only'
  });

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
        
        const response = await fetch(`${apiUrl}/users/me`, {
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

        const userData = await response.json();
        setFormData({
          pseudo: userData.pseudo || '',
          email: userData.email || '',
          phone: userData.phoneNumber || '',
          address: userData.address || '',
          bio: userData.bio || '',
          tag: userData.tag || '',
          geoPermission: userData.geoPermission || 'friends-only'
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
      console.log('Déconnexion');
      // Redirection vers login
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('⚠️ ATTENTION : Cette action est irréversible !\n\nÊtes-vous absolument sûr de vouloir supprimer votre compte ? Toutes vos données seront perdues définitivement.')) {
      console.log('Suppression de compte');
      alert('Compte supprimé');
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
            <div className="glass-card rounded-3xl p-6 fade-in text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span className="text-white">Chargement des informations...</span>
              </div>
            </div>
          )}

          {/* Affichage d'erreur */}
          {error && (
            <div className="glass-card rounded-3xl p-6 fade-in">
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <ion-icon name="alert-circle" className="text-red-400 text-xl"></ion-icon>
                  <span className="text-red-400 font-medium">Erreur de chargement</span>
                </div>
                <p className="text-red-300 mt-2 text-sm">{error}</p>
                <div className="flex space-x-2 mt-3">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                  >
                    Réessayer
                  </button>
                  {error.includes('authentification') || error.includes('Session expirée') ? (
                    <NavLink 
                      to="/login"
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                    >
                      Se connecter
                    </NavLink>
                  ) : null}
                </div>
              </div>
            </div>
          )}
          
          {/* Informations personnelles */}
          {!loading && !error && (
          <div className="glass-card rounded-3xl p-6 fade-in">
          <div className="relative mb-4 flex justify-center">
              
              <div
                id="photoback"
                className="h-32 w-32 bg-indigo-500 overflow-hidden rounded-full photo cursor-pointer"
              >
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  className="opacity-0 h-full w-full"
                  accept="image/*"
                  onChange={(e) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const base64String = event.target?.result as string;
                      const photoback = document.getElementById("photoback");
                      if (photoback) {
                        photoback.style.backgroundImage = `url(${base64String})`;
                        photoback.style.backgroundSize = "cover";
                        photoback.style.backgroundPosition = "center";
                        photoback.classList.remove("bg-indigo-500");
                      }
                    };

                    if (e.target.files && e.target.files[0]) {
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                />
                <ion-icon
                  name="camera"
                  className="text-6xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 photoicon"
                ></ion-icon>
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
                    // Extraction des composants d'adresse si disponibles
                    rue: formData.address?.split(',')[0] || '',
                    ville: formData.address?.split(',').pop()?.trim() || '',
                    codePostal: formData.address?.match(/\d{5}/) ? formData.address.match(/\d{5}/)[0] : ''
                  }
                }}
                className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Modifier mes informations
              </NavLink>
            </div>
          </div>
          )}

          {/* Sécurité et mot de passe */}
          <div className="glass-card rounded-3xl p-6 fade-in">
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="lock-closed" className="w-6 h-6 text-white flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white">Sécurité</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-white/70 text-sm">
                Modifiez votre mot de passe pour sécuriser votre compte
              </p>

              <NavLink 
                to="/changepassword"
                className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold transition-all duration-200"
              >
                Modifier le mot de passe
              </NavLink>
            </div>
          </div>

          {/* Paramètres de géolocalisation */}
          <div className="glass-card rounded-3xl p-6 fade-in">
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
                  <option value="everyone" className="bg-gray-800">Tout le monde</option>
                  <option value="friends-only" className="bg-gray-800">Mes amis uniquement</option>
                  <option value="authorized-friends" className="bg-gray-800">Amis avec autorisation</option>
                  <option value="nobody" className="bg-gray-800">Personne</option>
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
          </div>

          {/* Paramètres de notifications */}
          <div className="glass-card rounded-3xl p-6 fade-in">
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
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Événements du quartier</h3>
                  <p className="text-white/60 text-sm">Être notifié des nouveaux événements près de chez vous</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Troc & Services</h3>
                  <p className="text-white/60 text-sm">Recevoir les notifications des nouveaux trocs et services disponibles</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Nouvelles demandes d'amis</h3>
                  <p className="text-white/60 text-sm">Recevoir les notifications des demandes d'amis</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Liens rapides */}
          <div className="glass-card rounded-3xl p-6 fade-in">
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
          </div>

          {/* Actions de compte */}
          <div className="space-y-4 fade-in">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-3 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold transition-all duration-200"
            >
              <IonIcon name="log-out" className="w-5 h-5" />
              <span>Se déconnecter</span>
            </button>

            <div className="danger-zone rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <IonIcon name="trash" className="w-6 h-6 text-red-400 flex-shrink-0" />
                <h2 className="text-xl font-semibold text-red-400">Zone de danger</h2>
              </div>
              
              <p className="text-red-200/80 text-sm mb-4">
                Une fois supprimé, votre compte ne pourra pas être récupéré. Cette action est irréversible.
              </p>
              
              <button 
                onClick={handleDeleteAccount}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-200"
              >
                Supprimer mon compte
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProfilePage;