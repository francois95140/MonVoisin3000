import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField, Button, IonIcon, GlassCard } from '../components/shared';
import { toast } from 'react-toastify';

const apiUrl = import.meta.env.VITE_API_URL;

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Navigation indicator management
  document.getElementById("indicator")?.classList.add("filter", "opacity-0");
  setTimeout(() => {
    const indicator = document.getElementById("indicator");
    if (indicator && indicator.parentNode) {
      const list = indicator.parentNode.children;
      Array.from(list).forEach((el) => el.classList.remove("active"));
    }
  }, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      toast.error('Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        navigate('/connexion');
        return;
      }

      const response = await fetch(`${apiUrl}/api/users/me/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Mot de passe modifié avec succès !');
        
        // Rediriger vers le profil après un court délai
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
        
      } else {
        const errorData = await response.json();
        
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          toast.error('Session expirée. Veuillez vous reconnecter.');
          navigate('/connexion');
          return;
        }
        
        // Gestion spécifique des erreurs de validation
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((error: any) => {
            const field = error.path ? error.path.join('.') : 'Champ';
            toast.error(`${field}: ${error.message}`);
          });
        } else {
          toast.error(errorData.message || 'Erreur lors de la modification du mot de passe');
        }
      }
      
    } catch (error) {
      console.error('Erreur réseau:', error);
      toast.error('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/profile');
  };

  return (
    <div 
      className="min-h-screen pt-8 pb-8 px-4"
      style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
    >
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">Changer le mot de passe</h1>
          <p className="text-white/70">Sécurisez votre compte avec un nouveau mot de passe</p>
        </div>

        {/* Formulaire de modification */}
        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="lock-closed" className="w-6 h-6 text-white flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white">Informations de sécurité</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Mot de passe actuel *
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full py-3 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Saisissez votre mot de passe actuel"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Nouveau mot de passe *
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full py-3 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Minimum 8 caractères avec majuscule, minuscule et chiffre"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Confirmer le nouveau mot de passe *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full py-3 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Confirmez votre nouveau mot de passe"
                />
              </div>
            </div>

            {/* Conseils de sécurité */}
            <div className="p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
              <div className="flex items-start space-x-3">
                <IonIcon name="shield-checkmark" className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-100 text-sm font-medium">Conseils pour un mot de passe sécurisé</p>
                  <ul className="text-blue-200/80 text-xs mt-1 space-y-1">
                    <li>• Au moins 8 caractères</li>
                    <li>• Une majuscule et une minuscule</li>
                    <li>• Au moins un chiffre</li>
                    <li>• Évitez les mots de passe évidents</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                onClick={handleGoBack}
                variant="secondary"
                className="flex-1"
                disabled={loading}
              >
                <IonIcon name="arrow-back" className="w-4 h-4 mr-2" />
                Retour
              </Button>
              
              <Button
                type="submit"
                variant="success"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Modification...
                  </>
                ) : (
                  <>
                    <IonIcon name="checkmark" className="w-4 h-4 mr-2" />
                    Modifier
                  </>
                )}
              </Button>
            </div>
          </form>
        </GlassCard>

        {/* Informations supplémentaires */}
        <GlassCard>
          <div className="flex items-center space-x-4 mb-4">
            <IonIcon name="information-circle" className="w-6 h-6 text-white flex-shrink-0" />
            <h3 className="text-lg font-semibold text-white">Important</h3>
          </div>
          <div className="text-white/70 text-sm space-y-2">
            <p>• Après la modification, vous resterez connecté sur cet appareil</p>
            <p>• Vous serez automatiquement déconnecté des autres appareils</p>
            <p>• Conservez votre nouveau mot de passe en sécurité</p>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default ChangePassword;