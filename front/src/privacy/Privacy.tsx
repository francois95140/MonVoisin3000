import React from 'react';
import { NavLink } from 'react-router-dom';
import { IonIcon, GlassCard, Button } from '../components/shared';

const Privacy: React.FC = () => {
  document.getElementById("indicator")?.classList.add("filter", "opacity-0");
  setTimeout(() => {
    const indicator = document.getElementById("indicator");
    if (indicator && indicator.parentNode) {
      const list = indicator.parentNode.children;
      Array.from(list).forEach((el) => el.classList.remove("active"));
    }
  }, 0);

  return (
    <>
      <div 
        className="min-h-screen pt-8 pb-8 px-4"
        style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center mb-8 fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Politique de Confidentialité</h1>
            <p className="text-white/70">Transparence sur la collecte et l'utilisation de vos données</p>
          </div>

          {/* Introduction */}
          <GlassCard>
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="shield-checkmark" className="w-8 h-8 text-white flex-shrink-0" />
              <h2 className="text-2xl font-semibold text-white">Notre Engagement</h2>
            </div>
            
            <p className="text-white/90 leading-relaxed mb-4">
              Chez MonVoisin3000, nous nous engageons à être totalement transparents sur la façon dont nous collectons, 
              utilisons et protégeons vos données personnelles. Cette politique de confidentialité vous informe de nos 
              pratiques en matière de données.
            </p>
            
            <div className="bg-orange-500/20 border border-orange-400/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <IonIcon name="warning" className="text-orange-400 text-xl mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-orange-300 font-medium text-sm mb-1">Information Importante</h4>
                  <p className="text-orange-200/90 text-sm">
                    <strong>Les messages sont stockés en texte clair</strong> dans notre base de données pour assurer 
                    le bon fonctionnement du service de messagerie et permettre la recherche dans l'historique.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Données collectées */}
          <GlassCard>
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="document-text" className="w-6 h-6 text-white flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white">Données que nous collectons</h2>
            </div>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="text-white font-medium mb-2">Informations de profil</h3>
                <ul className="text-white/80 space-y-1 text-sm">
                  <li>• Pseudo et tag utilisateur</li>
                  <li>• Adresse email (pour la connexion)</li>
                  <li>• Avatar et bio (optionnels)</li>
                  <li>• Adresse postale (rue, code postal, ville)</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="text-white font-medium mb-2">Messages et conversations</h3>
                <ul className="text-white/80 space-y-1 text-sm">
                  <li>• <strong>Messages privés et de groupe stockés en texte clair</strong></li>
                  <li>• Métadonnées des conversations (participants, horodatage)</li>
                  <li>• Statut de lecture des messages</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-400 pl-4">
                <h3 className="text-white font-medium mb-2">Activités sur la plateforme</h3>
                <ul className="text-white/80 space-y-1 text-sm">
                  <li>• Événements créés et participations</li>
                  <li>• Services proposés (trocs)</li>
                  <li>• Interactions sociales (demandes d'amis)</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-400 pl-4">
                <h3 className="text-white font-medium mb-2">Données techniques</h3>
                <ul className="text-white/80 space-y-1 text-sm">
                  <li>• Adresse IP et informations de connexion</li>
                  <li>• Données de navigation (cookies, session)</li>
                  <li>• Logs d'activité pour la sécurité</li>
                </ul>
              </div>
            </div>
          </GlassCard>

          {/* Utilisation des données */}
          <GlassCard>
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="settings" className="w-6 h-6 text-white flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white">Comment nous utilisons vos données</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-2">Fonctionnement du service</h3>
                  <p className="text-white/70 text-sm">
                    Gestion des comptes utilisateurs, messagerie, événements et services de proximité.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-2">Communication</h3>
                  <p className="text-white/70 text-sm">
                    Notifications importantes, mises à jour de sécurité, et réponses à vos demandes.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-2">Sécurité</h3>
                  <p className="text-white/70 text-sm">
                    Détection et prévention des abus, spam, et activités malveillantes.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="text-white font-medium mb-2">Amélioration</h3>
                  <p className="text-white/70 text-sm">
                    Analyses anonymisées pour améliorer l'expérience utilisateur et les fonctionnalités.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Sécurité */}
          <GlassCard>
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="lock-closed" className="w-6 h-6 text-white flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white">Sécurité des données</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4">
                <h3 className="text-green-300 font-medium mb-2">Mesures de protection</h3>
                <ul className="text-green-200/80 space-y-1 text-sm">
                  <li>✓ Chiffrement HTTPS pour toutes les communications</li>
                  <li>✓ Mots de passe hachés avec des algorithmes sécurisés</li>
                  <li>✓ Accès restreint aux données par notre équipe</li>
                  <li>✓ Sauvegardes régulières et sécurisées</li>
                </ul>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-xl p-4">
                <h3 className="text-yellow-300 font-medium mb-2">Limitations</h3>
                <p className="text-yellow-200/80 text-sm">
                  <strong>Important :</strong> Les messages sont stockés en texte clair pour permettre les fonctionnalités 
                  de recherche et de synchronisation. Évitez de partager des informations sensibles (mots de passe, 
                  données bancaires) via la messagerie.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Vos droits */}
          <GlassCard>
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="person-circle" className="w-6 h-6 text-white flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white">Vos droits</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <IonIcon name="eye" className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-white font-medium mb-2">Accès</h3>
                <p className="text-white/70 text-sm">
                  Consultez toutes les données que nous avons sur vous
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 text-center">
                <IonIcon name="create" className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-white font-medium mb-2">Modification</h3>
                <p className="text-white/70 text-sm">
                  Corrigez ou mettez à jour vos informations personnelles
                </p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 text-center">
                <IonIcon name="trash" className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <h3 className="text-white font-medium mb-2">Suppression</h3>
                <p className="text-white/70 text-sm">
                  Supprimez définitivement votre compte et vos données
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Contact */}
          <GlassCard>
            <div className="flex items-center space-x-4 mb-6">
              <IonIcon name="mail" className="w-6 h-6 text-white flex-shrink-0" />
              <h2 className="text-xl font-semibold text-white">Contact</h2>
            </div>
            
            <p className="text-white/80 mb-4">
              Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
              contactez-nous à : <span className="text-blue-300 font-mono">privacy@monvoisin3000.fr</span>
            </p>
            
            <div className="text-center">
              <NavLink to="/profile">
                <Button variant="primary" className="transform hover:scale-105">
                  <IonIcon name="arrow-back" className="w-4 h-4 mr-2" />
                  Retour au profil
                </Button>
              </NavLink>
            </div>
          </GlassCard>

          {/* Footer */}
          <div className="text-center text-white/60 text-sm">
            <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>

        </div>
      </div>
    </>
  );
};

export default Privacy;