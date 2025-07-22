import React, { useState } from 'react';

const apiUrl = import.meta.env.VITE_API_URL;

// Composant pour les icônes Ionicons
const IonIcon: React.FC<{ name: string; className?: string }> = ({ name, className = "" }) => (
  <ion-icon name={name} class={className}></ion-icon>
);

// Enum pour les types de service
export enum ServiceType {
  HELP = 'help',         // Aide (ex: promener un chien)
  EXCHANGE = 'exchange', // Échange (ex: vélo contre machine à laver)
  DONATION = 'donation'  // Don (ex: donner un sac)
}

// Composant pour afficher une option d'icône
const IconOption: React.FC<{ dataIcon: string }> = ({ dataIcon }) => (
  <IonIcon name={dataIcon} className="text-2xl" />
);

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (serviceData: {
    title: string;
    description: string;
    type: ServiceType;
    icon: string;
  }) => void;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>(ServiceType.HELP);
  const [selectedIcon, setSelectedIcon] = useState<string>('home');

  const iconOptions = [
    "calendar", "musical-notes", "restaurant", "fitness", "library",
    "cafe", "basketball", "camera", "boat", "bicycle", "book", "gift",
    "heart", "home", "medical", "people", "school", "car", "airplane",
    "build", "flash", "leaf", "paw", "pizza", "game-controller"
  ];

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const serviceData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      type: selectedServiceType,
      imageUrl: selectedIcon
    };

    try {
      // Récupération du token d'authentification
      const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      if (!authToken) {
        alert('Vous devez être connecté pour créer un service.');
        return;
      }

      // Envoi des données à l'API
      const response = await fetch(`${apiUrl}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(serviceData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Service créé avec succès !');
        onSubmit(serviceData);
        onClose();
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de la création du service:', errorData);
        alert(`Erreur lors de la création du service: ${errorData.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      alert('Erreur de connexion. Veuillez réessayer.');
    }
  };

  if (!isOpen) return null;

  return (
    <div id="serviceModal" className="modal flex-col show">
      <div className="modal-content m-auto mt-4 mb-8">
        <div className="p-6">
          {/* Header de la modale */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Créer un service</h2>
            <button className="text-white/70 hover:text-white text-2xl" onClick={onClose}>
              <IonIcon name="close" />
            </button>
          </div>

          {/* Formulaire */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Sélection d'icône */}
            <div>
              <label className="block text-white font-medium mb-3">Choisir une icône</label>
              <div className="icon-grid">
                {iconOptions.map((icon, index) => (
                  <div 
                    key={index} 
                    className={`icon-option ${selectedIcon === icon ? 'selected' : ''}`}
                    onClick={() => handleIconSelect(icon)}
                  >
                    <IconOption dataIcon={icon} />
                  </div>
                ))}
              </div>
              <input type="hidden" name="icon" value={selectedIcon}/>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-white font-medium mb-2">Titre du service</label>
              <input 
                type="text" 
                name="title" 
                className="form-input" 
                placeholder="Ex: Promener votre chien" 
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-medium mb-2">Description</label>
              <textarea 
                name="description" 
                rows={3} 
                className="form-input resize-none" 
                placeholder="Décrivez votre service..." 
                required
              ></textarea>
            </div>

            {/* Type de service */}
            <div>
              <label className="block text-white font-medium mb-3">Type de service</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedServiceType === ServiceType.HELP
                      ? 'border-blue-400 bg-blue-400/20 text-white'
                      : 'border-white/30 text-white/70 hover:border-white/50'
                  }`}
                  onClick={() => setSelectedServiceType(ServiceType.HELP)}
                >
                  <IonIcon name="hand-left" className="text-xl mb-1" />
                  <div className="text-sm font-medium">Aide</div>
                </button>
                <button
                  type="button"
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedServiceType === ServiceType.EXCHANGE
                      ? 'border-green-400 bg-green-400/20 text-white'
                      : 'border-white/30 text-white/70 hover:border-white/50'
                  }`}
                  onClick={() => setSelectedServiceType(ServiceType.EXCHANGE)}
                >
                  <IonIcon name="swap-horizontal" className="text-xl mb-1" />
                  <div className="text-sm font-medium">Échange</div>
                </button>
                <button
                  type="button"
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedServiceType === ServiceType.DONATION
                      ? 'border-purple-400 bg-purple-400/20 text-white'
                      : 'border-white/30 text-white/70 hover:border-white/50'
                  }`}
                  onClick={() => setSelectedServiceType(ServiceType.DONATION)}
                >
                  <IonIcon name="gift" className="text-xl mb-1" />
                  <div className="text-sm font-medium">Don</div>
                </button>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex space-x-4 pt-4">
              <button 
                type="button" 
                className="btn-secondary px-6 py-3 rounded-xl text-white font-semibold flex-1" 
                onClick={onClose}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn-primary px-6 py-3 rounded-xl text-white font-semibold flex-1"
              >
                Créer le service
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
