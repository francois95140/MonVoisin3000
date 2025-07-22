import React, { useState, useEffect } from 'react';
import ServiceModal, { ServiceType } from './components/ServiceModal';

const apiUrl = import.meta.env.VITE_API_URL;

// Composant pour les icônes Ionicons
const IonIcon: React.FC<{ name: string; className?: string }> = ({ name, className = "" }) => (
  <ion-icon name={name} class={className}></ion-icon>
);

interface ServiceItem {
  id: number;
  title: string;
  provider: string;
  description: string;
  price: string;
  icon: string;
  iconBg: string;
  distance: string;
  rating: number;
  reviews: number;
  type: ServiceType;
  createdAt: Date;
}

const Trock: React.FC = () => {
  const [activeServiceTab, setActiveServiceTab] = useState<ServiceType>(ServiceType.HELP);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [myServices, setMyServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  // Fonction pour récupérer les services depuis l'API
  const fetchServices = async (type: ServiceType, page: number = 1, reset: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      if (!authToken) {
        setError('Token d\'authentification manquant');
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/services?type=${type}&limit=${limit}&page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
       
       // Transformer les données de l'API pour correspondre à notre interface
       const transformedServices: ServiceItem[] = data.items?.map((item: any) => ({
         id: item.id,
         title: item.title,
         provider: item.creator?.pseudo || item.creator?.email || 'Utilisateur',
         description: item.description,
         price: item.provider || 'Service',
         icon: item.imageUrl || 'help-circle',
         iconBg: 'from-gray-400 to-gray-600',
         distance: 'Distance inconnue',
         rating: 5,
         reviews: 0,
         type: item.type === 'help' ? ServiceType.HELP : 
               item.type === 'exchange' ? ServiceType.EXCHANGE : 
               item.type === 'donation' ? ServiceType.DONATION : ServiceType.HELP,
         createdAt: new Date(item.createdAt || Date.now())
       })) || [];

       if (reset || page === 1) {
         setServices(transformedServices);
       } else {
         setServices(prev => [...prev, ...transformedServices]);
       }
       
       setHasMore(data.page < data.totalPages);
       setCurrentPage(data.page);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des services:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
      
      // En cas d'erreur, utiliser les données de fallback
      if (reset || page === 1) {
        setServices(fallbackServices.filter(service => service.type === type));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ouvrir/fermer la modale
  const toggleServiceModal = () => {
    setIsServiceModalOpen(!isServiceModalOpen);
  };

  // Fonction pour récupérer les services créés par l'utilisateur
  const fetchMyServices = async () => {
    try {
      const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      if (!authToken) {
        return;
      }

      const response = await fetch(`${apiUrl}/services/my-services`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
       
       // Transformer les données de l'API pour correspondre à notre interface
       const transformedMyServices: ServiceItem[] = data.items?.map((item: any) => ({
         id: item.id,
         title: item.title,
         provider: item.creator?.pseudo || item.creator?.email || 'Utilisateur',
         description: item.description,
         price: item.provider || 'Service',
         icon: item.imageUrl || 'help-circle',
         iconBg: 'from-gray-400 to-gray-600',
         distance: 'Distance inconnue',
         rating: 5,
         reviews: 0,
         type: item.type === 'help' ? ServiceType.HELP : 
               item.type === 'exchange' ? ServiceType.EXCHANGE : 
               item.type === 'donation' ? ServiceType.DONATION : ServiceType.HELP,
         createdAt: new Date(item.createdAt || Date.now())
       })) || [];

       setMyServices(transformedMyServices);
      
    } catch (error) {
      console.error('Erreur lors de la récupération de mes services:', error);
    }
  };

  // Fonction pour charger plus de services
  const loadMoreServices = () => {
    if (!loading && hasMore) {
      fetchServices(activeServiceTab, currentPage + 1, false);
    }
  };

  // Fonction pour vérifier si un service appartient à l'utilisateur
  const isMyService = (serviceId: number): boolean => {
    return myServices.some(myService => myService.id === serviceId);
  };

  // Fonction pour calculer le temps écoulé
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes}min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Il y a ${days}j`;
    }
  };

  // Fonction pour gérer la soumission du formulaire
  const handleServiceSubmit = (serviceData: {
    title: string;
    description: string;
    type: ServiceType;
    icon: string;
  }) => {
    console.log('Nouveau service:', serviceData);
    // Ici vous pouvez ajouter la logique pour envoyer les données à votre API
  };

  // Fonction pour obtenir la couleur de fond selon le type de service
  const getServiceTypeColor = (type: ServiceType): string => {
    switch (type) {
      case ServiceType.HELP:
        return 'from-blue-400 to-blue-600';
      case ServiceType.EXCHANGE:
        return 'from-green-400 to-green-600';
      case ServiceType.DONATION:
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  

  // Données de fallback pour les services
  const fallbackServices: ServiceItem[] = [
    {
      id: 1,
      title: "Bricolage & Réparations",
      provider: "Jean-Pierre M.",
      description: "Petits travaux de bricolage, montage de meubles, réparations diverses. 20 ans d'expérience dans le bâtiment.",
      price: "15€/h",
      icon: "hammer",
      iconBg: "from-orange-400 to-red-600",
      distance: "300m",
      rating: 5,
      reviews: 28,
      type: ServiceType.EXCHANGE,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // Il y a 2h
    },
    {
      id: 2,
      title: "Jardinage & Entretien",
      provider: "Marie L.",
      description: "Entretien de jardin, plantation, taille, conseils jardinage. Passionnée de jardinage depuis toujours.",
      price: "12€/h",
      icon: "leaf",
      iconBg: "from-green-400 to-emerald-600",
      distance: "600m",
      rating: 5,
      reviews: 15,
      type: ServiceType.HELP,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // Il y a 1h
    },
    {
      id: 3,
      title: "Cours Particuliers",
      provider: "Sophie R.",
      description: "Mathématiques et physique niveau collège/lycée. Enseignante certifiée avec 10 ans d'expérience.",
      price: "20€/h",
      icon: "school",
      iconBg: "from-blue-400 to-purple-600",
      distance: "450m",
      rating: 5,
      reviews: 42,
      type: ServiceType.EXCHANGE,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // Il y a 5h
    },
    {
      id: 4,
      title: "Baby-sitting",
      provider: "Emma D.",
      description: "Garde d'enfants à domicile, aide aux devoirs. Étudiante en éducation, expérience avec enfants 3-12 ans.",
      price: "10€/h",
      icon: "heart",
      iconBg: "from-pink-400 to-rose-600",
      distance: "200m",
      rating: 5,
      reviews: 18,
      type: ServiceType.HELP,
      createdAt: new Date(Date.now() - 30 * 60 * 1000) // Il y a 30min
    },
    {
      id: 5,
      title: "Dépannage Informatique",
      provider: "Thomas B.",
      description: "Réparation ordinateurs, installation logiciels, formation informatique. Technicien certifié.",
      price: "25€/h",
      icon: "laptop",
      iconBg: "from-indigo-400 to-blue-600",
      distance: "900m",
      rating: 5,
      reviews: 35,
      type: ServiceType.EXCHANGE,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // Il y a 3h
    },
    {
      id: 6,
      title: "Don de Vêtements",
      provider: "Marie",
      description: "Vêtements enfants en bon état, tailles 6-10 ans. Gratuit pour familles dans le besoin.",
      price: "Gratuit",
      icon: "gift",
      iconBg: "from-purple-400 to-pink-600",
      distance: "400m",
      rating: 5,
      reviews: 3,
      type: ServiceType.DONATION,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // Il y a 4h
    }
  ];

  // Utiliser useEffect pour charger les services au changement d'onglet
  useEffect(() => {
    fetchServices(activeServiceTab, 1, true);
  }, [activeServiceTab]);

  // Charger les services de l'utilisateur au démarrage
  useEffect(() => {
    fetchMyServices();
  }, []);

  // Filtrer les services par type (pour les données actuelles)
  const filteredServices = services.filter(service => service.type === activeServiceTab);

  const handleItemClick = (title: string) => {
    console.log(`Consultation de l'annonce: ${title}`);
  };

  const renderStars = (rating: number) => {
    return "⭐".repeat(rating);
  };

  return (
    <>
      <div 
        className="min-h-screen antialiased"
        style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
      >
        {/* Titre principal */}
        <div className="px-6 mb-6 pt-6 fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                <span className="accent-text">Troc</span> & Services
              </h2>
              <p className="text-white/70">
                Échangez, partagez et entraidez-vous
              </p>
            </div>
            <button 
              className="glass-card rounded-xl p-3 hover:bg-white/20 transition-all duration-200"
              onClick={toggleServiceModal}
            >
              <IonIcon name="add" className="text-white text-xl" />
            </button>
          </div>
        </div>

        {/* Onglets de filtrage des services */}
        <div className="px-6 mb-6 fade-in" style={{animationDelay: '0.1s'}}>
          <div className="glass-card rounded-2xl p-2 flex">
            <button 
              className={`tab-button flex-1 py-3 rounded-xl font-semibold text-sm ${activeServiceTab === ServiceType.HELP ? 'active' : ''}`}
              onClick={() => setActiveServiceTab(ServiceType.HELP)}
            >
              <IonIcon name="hand-left" className="mr-1" />
              Aide
            </button>
            <button 
              className={`tab-button flex-1 py-3 rounded-xl font-semibold text-sm ${activeServiceTab === ServiceType.EXCHANGE ? 'active' : ''}`}
              onClick={() => setActiveServiceTab(ServiceType.EXCHANGE)}
            >
              <IonIcon name="swap-horizontal" className="mr-1" />
              Échange
            </button>
            <button 
              className={`tab-button flex-1 py-3 rounded-xl font-semibold text-sm ${activeServiceTab === ServiceType.DONATION ? 'active' : ''}`}
              onClick={() => setActiveServiceTab(ServiceType.DONATION)}
            >
              <IonIcon name="gift" className="mr-1" />
              Don
            </button>
          </div>
        </div>

        {/* Affichage d'erreur */}
        {error && (
          <div className="px-6 mb-4">
            <div className="glass-card rounded-2xl p-4 bg-red-500/20 border border-red-500/30">
              <div className="flex items-center space-x-3">
                <IonIcon name="warning" className="text-red-400 text-xl" />
                <div>
                  <h4 className="text-red-400 font-semibold">Erreur de chargement</h4>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenu Services */}
        <main className="px-6 pb-8">
          <div className="space-y-4">
            {filteredServices.map((service, index) => (
              <div 
                key={service.id}
                className="glass-card item-card rounded-2xl p-4 fade-in cursor-pointer"
                style={{animationDelay: `${0.2 + index * 0.1}s`}}
                onClick={() => handleItemClick(service.title)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`item-image bg-gradient-to-br ${getServiceTypeColor(service.type)}`}>
                    <IonIcon name={service.icon} className="text-white text-3xl" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{service.title}</h3>
                        <p className="text-white/80 text-sm">{service.provider}</p>
                      </div>
                      <span className="price-tag">{service.price}</span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed mb-3">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/60 text-xs">{getTimeAgo(service.createdAt)}</span>
                    </div>
                    {!isMyService(service.id) && (
                      <button 
                        className="btn-primary px-6 py-2 rounded-xl text-white font-semibold text-sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const actionText = service.type === ServiceType.HELP ? 'Aidée' : 
                                           service.type === ServiceType.EXCHANGE ? 'Échangée' : 'Récupérée';
                          
                          try {
                            const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
                            
                            if (!authToken) {
                              console.error('Token d\'authentification manquant');
                              return;
                            }

                            // Récupérer l'ID du provider (utilisateur connecté)
                            // Vous devrez adapter cette partie selon votre système d'authentification
                            const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || localStorage.getItem('userInfo') || '{}');
                            const providerId = userInfo.id;

                            if (!providerId) {
                              console.error('ID du provider manquant');
                              return;
                            }

                            const response = await fetch(`${apiUrl}/services/${service.id}/assign/${providerId}`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${authToken}`
                              }
                            });

                            if (!response.ok) {
                              throw new Error(`Erreur ${response.status}: ${response.statusText}`);
                            }

                            const result = await response.json();
                            console.log(`${actionText} - ${service.title}:`, result);
                            
                            // Optionnel: rafraîchir la liste des services
                            fetchServices(activeServiceTab, 1, true);
                            
                          } catch (error) {
                            console.error('Erreur lors de l\'assignation du service:', error);
                          }
                        }}
                      >
                        {service.type === ServiceType.HELP ? 'Aidée' : 
                         service.type === ServiceType.EXCHANGE ? 'Échangée' : 'Récupérée'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Indicateur de chargement */}
            {loading && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center animate-pulse">
                  <IonIcon name="refresh" className="text-white text-2xl" />
                </div>
                <h3 className="text-white font-semibold mb-2">Chargement...</h3>
                <p className="text-white/70 text-sm">
                  Récupération des services en cours
                </p>
              </div>
            )}
            
            {/* Message quand aucun service */}
            {!loading && filteredServices.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                  <IonIcon name="search" className="text-white text-2xl" />
                </div>
                <h3 className="text-white font-semibold mb-2">Aucun service trouvé</h3>
                <p className="text-white/70 text-sm">
                  Soyez le premier à proposer un service de ce type !
                </p>
              </div>
            )}
            
            {/* Bouton Charger plus */}
            {!loading && filteredServices.length > 0 && hasMore && (
              <div className="text-center pt-4">
                <button 
                  className="glass-card px-6 py-3 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-200"
                  onClick={loadMoreServices}
                >
                  <IonIcon name="chevron-down" className="mr-2" />
                  Charger plus de services
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Message d'encouragement */}
        <div className="px-6 pb-8">
          <div className="glass-card rounded-2xl p-6 fade-in" style={{animationDelay: '0.7s'}}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <IonIcon name="swap-horizontal" className="text-white text-2xl" />
              </div>
              <h3 className="text-white font-semibold mb-2">Proposez vos objets ou services !</h3>
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                Vous avez des objets à échanger ou des compétences à partager ? Créez votre annonce et aidez votre communauté.
              </p>
              <button 
                className="btn-primary px-6 py-3 rounded-xl text-white font-semibold flex items-center justify-center mx-auto"
                onClick={() => console.log('Créer une annonce')}
              >
                <IonIcon name="add-circle" className="mr-2" />
                Créer une annonce
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modale d'ajout de service */}
       <ServiceModal 
         isOpen={isServiceModalOpen}
         onClose={toggleServiceModal}
         onSubmit={handleServiceSubmit}
       />
    </>
  );
};

export default Trock;