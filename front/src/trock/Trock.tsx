import React, { useState, useEffect } from 'react';

// Composant pour les icônes Ionicons
const IonIcon: React.FC<{ name: string; className?: string }> = ({ name, className = "" }) => (
  <ion-icon name={name} class={className}></ion-icon>
);

interface TrocItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  distance: string;
  time: string;
  user: {
    name: string;
    avatar: string;
    avatarBg: string;
  };
}

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
}

const Trock: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'troc' | 'services'>('troc');

  // Données des trocs
  const trocItems: TrocItem[] = [
    {
      id: 1,
      title: "Vélo d'appartement",
      description: "Vélo d'appartement en excellent état, peu utilisé. Échange contre table de jardin ou outils de bricolage.",
      icon: "bicycle",
      iconBg: "from-purple-400 to-pink-600",
      distance: "500m",
      time: "Il y a 2h",
      user: {
        name: "Marie",
        avatar: "M",
        avatarBg: "from-pink-500 to-purple-600"
      }
    },
    {
      id: 2,
      title: "Collection Livres de Cuisine",
      description: "15 livres de cuisine variés, recettes du monde entier. Échange contre plantes ou graines de légumes.",
      icon: "book",
      iconBg: "from-green-400 to-emerald-600",
      distance: "800m",
      time: "Il y a 5h",
      user: {
        name: "Antoine",
        avatar: "A",
        avatarBg: "from-green-500 to-teal-600"
      }
    },
    {
      id: 3,
      title: "PlayStation 4 + Jeux",
      description: "Console PS4 en bon état avec 5 jeux inclus. Cherche ordinateur portable ou tablette en échange.",
      icon: "game-controller",
      iconBg: "from-blue-400 to-indigo-600",
      distance: "1.2km",
      time: "Hier",
      user: {
        name: "Lucas",
        avatar: "L",
        avatarBg: "from-blue-500 to-purple-600"
      }
    },
    {
      id: 4,
      title: "Boutures et Graines",
      description: "Diverses boutures de plantes vertes et graines de légumes de mon jardin. Échange contre pots ou outils.",
      icon: "leaf",
      iconBg: "from-green-500 to-lime-600",
      distance: "300m",
      time: "Il y a 1 jour",
      user: {
        name: "Sophie",
        avatar: "S",
        avatarBg: "from-green-400 to-emerald-600"
      }
    }
  ];

  // Données des services
  const serviceItems: ServiceItem[] = [
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
      reviews: 28
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
      reviews: 15
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
      reviews: 42
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
      reviews: 18
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
      reviews: 35
    }
  ];

  const handleItemClick = (title: string) => {
    console.log(`Consultation de l'annonce: ${title}`);
  };

  const renderStars = (rating: number) => {
    return "⭐".repeat(rating);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            font-family: 'Inter', sans-serif;
        }

        .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .accent-text {
            color: #ffffff;
            font-weight: 800;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .btn-primary {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            transition: all 0.3s ease;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .tab-button {
            transition: all 0.3s ease;
        }

        .tab-button.active {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            color: white;
        }

        .tab-button:not(.active) {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.7);
        }

        .item-card {
            transition: all 0.3s ease;
        }

        .item-card:hover {
            transform: translateY(-4px);
        }

        .item-image {
            width: 80px;
            height: 80px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .service-avatar {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .price-tag {
            background: linear-gradient(45deg, #22c55e, #16a34a);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.875rem;
        }

        .distance-tag {
            background: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
            border: 1px solid rgba(59, 130, 246, 0.3);
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .fade-in {
            animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
      `}</style>

      {/* Script pour charger Ionicons */}
      <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
      <script noModule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>

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
            <button className="glass-card rounded-xl p-3 hover:bg-white/20 transition-all duration-200">
              <IonIcon name="add" className="text-white text-xl" />
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="px-6 mb-6 fade-in" style={{animationDelay: '0.1s'}}>
          <div className="glass-card rounded-2xl p-2 flex">
            <button 
              className={`tab-button flex-1 py-3 rounded-xl font-semibold ${activeTab === 'troc' ? 'active' : ''}`}
              onClick={() => setActiveTab('troc')}
            >
              Troc
            </button>
            <button 
              className={`tab-button flex-1 py-3 rounded-xl font-semibold ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              Services
            </button>
          </div>
        </div>

        {/* Contenu Troc */}
        {activeTab === 'troc' && (
          <main className="px-6 pb-8">
            <div className="space-y-4">
              {trocItems.map((item, index) => (
                <div 
                  key={item.id}
                  className="glass-card item-card rounded-2xl p-4 fade-in cursor-pointer"
                  style={{animationDelay: `${0.2 + index * 0.1}s`}}
                  onClick={() => handleItemClick(item.title)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`item-image bg-gradient-to-br ${item.iconBg}`}>
                      <IonIcon name={item.icon} className="text-white text-3xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-white/70 text-sm leading-relaxed mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="distance-tag">{item.distance}</span>
                          <span className="text-white/60 text-xs">{item.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${item.user.avatarBg} flex items-center justify-center`}>
                            <span className="text-white text-xs font-bold">{item.user.avatar}</span>
                          </div>
                          <span className="text-white/80 text-sm">{item.user.name}</span>
                        </div>
                      </div>
                      <button 
                        className="btn-primary px-6 py-2 rounded-xl text-white font-semibold text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`Échanger avec ${item.user.name}`);
                        }}
                      >
                        Échanger
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* Contenu Services */}
        {activeTab === 'services' && (
          <main className="px-6 pb-8">
            <div className="space-y-4">
              {serviceItems.map((service, index) => (
                <div 
                  key={service.id}
                  className="glass-card item-card rounded-2xl p-4 fade-in cursor-pointer"
                  style={{animationDelay: `${0.2 + index * 0.1}s`}}
                  onClick={() => handleItemClick(service.title)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`service-avatar bg-gradient-to-br ${service.iconBg}`}>
                      <IonIcon name={service.icon} className="text-white text-2xl" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-white">{service.title}</h3>
                          <p className="text-white/80 text-sm">{service.provider}</p>
                        </div>
                        <span className="price-tag">{service.price}</span>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed mb-3">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="distance-tag">{service.distance}</span>
                          <div className="flex items-center space-x-1">
                            <div className="text-sm" style={{color: '#fbbf24'}}>
                              {renderStars(service.rating)}
                            </div>
                            <span className="text-white/60 text-xs">({service.reviews} avis)</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        className="btn-primary px-6 py-2 rounded-xl text-white font-semibold text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`Contacter ${service.provider}`);
                        }}
                      >
                        Contacter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

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
    </>
  );
};

export default Trock;