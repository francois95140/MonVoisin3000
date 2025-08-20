import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { IonIcon, GlassCard, Button, FormField, TextArea } from '../components/shared';
import { toast } from 'react-toastify';

const Help: React.FC = () => {
  document.getElementById("indicator")?.classList.add("filter", "opacity-0");
  setTimeout(() => {
    const indicator = document.getElementById("indicator");
    if (indicator && indicator.parentNode) {
      const list = indicator.parentNode.children;
      Array.from(list).forEach((el) => el.classList.remove("active"));
    }
  }, 0);

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'normale'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulation d'envoi - à remplacer par un vrai endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
      setFormData({ subject: '', message: '', priority: 'normale' });
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        className="min-h-screen pt-8 pb-8 px-4"
        style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center mb-8 fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Aide & Support</h1>
            <p className="text-white/70">Nous sommes là pour vous aider</p>
          </div>

          {/* FAQ Section */}
          <GlassCard>
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="help-circle" className="w-8 h-8 text-white flex-shrink-0" />
              <h2 className="text-2xl font-semibold text-white">Questions Fréquentes</h2>
            </div>
            
            <div className="space-y-4">
              <details className="bg-white/5 rounded-xl p-4 cursor-pointer">
                <summary className="text-white font-medium mb-2 cursor-pointer hover:text-blue-300">
                  Comment modifier mes informations de profil ?
                </summary>
                <p className="text-white/80 text-sm mt-2">
                  Rendez-vous dans votre profil, puis cliquez sur "Modifier mes informations". 
                  Vous pourrez y changer votre pseudo, bio, adresse et avatar.
                </p>
              </details>

              <details className="bg-white/5 rounded-xl p-4 cursor-pointer">
                <summary className="text-white font-medium mb-2 cursor-pointer hover:text-blue-300">
                  Mes messages sont-ils privés et sécurisés ?
                </summary>
                <p className="text-white/80 text-sm mt-2">
                  Les messages sont stockés en texte clair dans notre base de données pour permettre 
                  les fonctionnalités de recherche. Évitez de partager des informations sensibles 
                  comme des mots de passe ou données bancaires. Consultez notre 
                  <NavLink to="/privacy" className="text-blue-300 hover:underline ml-1">
                    politique de confidentialité
                  </NavLink> pour plus d'informations.
                </p>
              </details>

              <details className="bg-white/5 rounded-xl p-4 cursor-pointer">
                <summary className="text-white font-medium mb-2 cursor-pointer hover:text-blue-300">
                  Comment supprimer mon compte ?
                </summary>
                <p className="text-white/80 text-sm mt-2">
                  Dans votre profil, descendez jusqu'à la "Zone de danger" et cliquez sur 
                  "Supprimer mon compte". Cette action est irréversible et supprimera définitivement 
                  toutes vos données.
                </p>
              </details>

              <details className="bg-white/5 rounded-xl p-4 cursor-pointer">
                <summary className="text-white font-medium mb-2 cursor-pointer hover:text-blue-300">
                  Comment quitter un groupe de conversation ?
                </summary>
                <p className="text-white/80 text-sm mt-2">
                  Ouvrez la conversation de groupe, cliquez sur les détails de la conversation, 
                  puis sur "Quitter le groupe". Pour les conversations privées, vous pouvez 
                  également les quitter de cette façon.
                </p>
              </details>

              <details className="bg-white/5 rounded-xl p-4 cursor-pointer">
                <summary className="text-white font-medium mb-2 cursor-pointer hover:text-blue-300">
                  Comment signaler un utilisateur ou un contenu inapproprié ?
                </summary>
                <p className="text-white/80 text-sm mt-2">
                  Dans le profil de l'utilisateur, cliquez sur "Signaler cet utilisateur". 
                  Pour signaler un contenu spécifique, contactez-nous directement via le 
                  formulaire ci-dessous.
                </p>
              </details>
            </div>
          </GlassCard>

          {/* Contact Form */}
          <GlassCard>
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="mail" className="w-6 h-6 text-white flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white">Contactez notre équipe</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  id="subject"
                  name="subject"
                  label="Sujet"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  placeholder="Décrivez brièvement votre problème"
                />
                
                <div className="relative mb-4">
                  <label htmlFor="priority" className="leading-7 text-sm text-gray-600">
                    Priorité <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                  >
                    <option value="faible">Faible</option>
                    <option value="normale">Normale</option>
                    <option value="elevee">Élevée</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <TextArea
                id="message"
                name="message"
                label="Votre message"
                value={formData.message}
                onChange={handleInputChange}
                required
                placeholder="Décrivez votre problème en détail..."
                maxLength={1000}
              />

              <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <IonIcon name="information-circle" className="text-blue-400 text-lg mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-300 font-medium text-sm mb-1">Temps de réponse</h4>
                    <p className="text-blue-200/80 text-xs">
                      • <strong>Urgente :</strong> Sous 2 heures (problèmes de sécurité)<br/>
                      • <strong>Élevée :</strong> Sous 24 heures (bugs importants)<br/>
                      • <strong>Normale :</strong> 2-3 jours ouvrables<br/>
                      • <strong>Faible :</strong> 1 semaine maximum
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isSubmitting}
                  className="px-8 py-3 transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <IonIcon name="hourglass" className="w-4 h-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <IonIcon name="send" className="w-4 h-4 mr-2" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </div>
            </form>
          </GlassCard>

          {/* Contact Info */}
          <GlassCard>
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="business" className="w-6 h-6 text-white flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white">Autres moyens de contact</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <IonIcon name="mail-outline" className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-white font-medium mb-2">Email</h3>
                <p className="text-white/70 text-sm font-mono">
                  support@monvoisin3000.fr
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 text-center">
                <IonIcon name="time-outline" className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-white font-medium mb-2">Horaires</h3>
                <p className="text-white/70 text-sm">
                  Lun-Ven: 9h-18h<br/>
                  Sam: 9h-12h
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 text-center">
                <IonIcon name="document-text-outline" className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <h3 className="text-white font-medium mb-2">Documentation</h3>
                <p className="text-white/70 text-sm">
                  Guide utilisateur disponible prochainement
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Emergency Contact */}
          <GlassCard>
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="warning" className="w-6 h-6 text-red-400 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white">Contact d'urgence</h2>
            </div>
            
            <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-4">
              <p className="text-red-200/90 text-sm mb-3">
                <strong>Pour les problèmes de sécurité urgents</strong> (compte piraté, contenu dangereux, etc.):
              </p>
              <div className="flex items-center space-x-2">
                <IonIcon name="shield-checkmark" className="text-red-400" />
                <span className="text-red-300 font-mono">security@monvoisin3000.fr</span>
              </div>
            </div>
          </GlassCard>

          {/* Back Button */}
          <div className="text-center">
            <NavLink to="/profile">
              <Button variant="secondary" className="transform hover:scale-105">
                <IonIcon name="arrow-back" className="w-4 h-4 mr-2" />
                Retour au profil
              </Button>
            </NavLink>
          </div>

        </div>
      </div>
    </>
  );
};

export default Help;