import React, { useState, useEffect } from 'react';
import { IonIcon } from '../../components/shared';
import { ServiceType } from './ServiceModal';

const apiUrl = import.meta.env.VITE_API_URL;

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
  creator?: {
    id: string;
    pseudo: string;
    avatar?: string;
  };
}

interface TrocDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: number;
  currentUserId: string;
  onDelete?: (serviceId: number) => void;
  onOpenChat?: (serviceId: number, serviceTitle: string) => void;
}

const TrocDetailsModal: React.FC<TrocDetailsModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  currentUserId,
  onDelete,
  onOpenChat
}) => {
  const [service, setService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && serviceId) {
      fetchServiceDetails();
    }
  }, [isOpen, serviceId]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Vous devez être connecté pour voir les détails');
      }

      const response = await fetch(`${apiUrl}/api/services/${serviceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Service introuvable');
        }
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error('Erreur lors du chargement des détails');
      }

      const data = await response.json();
      
      // Transformer les données pour correspondre à notre interface
      const transformedService: ServiceItem = {
        id: data.id,
        title: data.title,
        provider: data.creator?.pseudo || data.creator?.email || 'Utilisateur',
        description: data.description,
        price: data.provider || 'Service',
        icon: data.imageUrl || 'help-circle',
        iconBg: getServiceTypeColor(data.type === 'help' ? ServiceType.HELP : 
                data.type === 'exchange' ? ServiceType.EXCHANGE : 
                data.type === 'donation' ? ServiceType.DONATION : ServiceType.HELP),
        distance: 'Distance inconnue',
        rating: 5,
        reviews: 0,
        type: data.type === 'help' ? ServiceType.HELP : 
              data.type === 'exchange' ? ServiceType.EXCHANGE : 
              data.type === 'donation' ? ServiceType.DONATION : ServiceType.HELP,
        createdAt: new Date(data.createdAt || Date.now()),
        creator: data.creator
      };
      
      setService(transformedService);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

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

  const getServiceTypeName = (type: ServiceType): string => {
    switch (type) {
      case ServiceType.HELP:
        return 'Aide';
      case ServiceType.EXCHANGE:
        return 'Échange';
      case ServiceType.DONATION:
        return 'Don';
      default:
        return 'Service';
    }
  };

  const formatTime = (date: Date): string => {
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

  const handleDelete = async () => {
    if (!service || !window.confirm(`Êtes-vous sûr de vouloir supprimer "${service.title}" ?`)) {
      return;
    }

    try {
      const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${apiUrl}/api/services/${service.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        onDelete?.(service.id);
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression');
    }
  };

  const isOwner = service?.creator?.id === currentUserId;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Détails du service</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <IonIcon name="close" className="text-white text-xl" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/70">Chargement des détails...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
                <IonIcon name="alert-circle" className="text-red-400 text-2xl" />
              </div>
              <h3 className="text-red-400 font-semibold mb-2">Erreur</h3>
              <p className="text-white/70 text-sm">{error}</p>
            </div>
          ) : service ? (
            <>
              {/* Service principal */}
              <div className="flex items-start space-x-6 mb-8">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${service.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <IonIcon name={service.icon} className="text-white text-3xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-1">{service.title}</h1>
                      <p className="text-white/80">{service.provider}</p>
                    </div>
                  </div>
                  <p className="text-white/70 leading-relaxed mb-4">{service.description}</p>
                  
                  {/* Métadonnées */}
                  <div className="flex items-center space-x-4 text-sm text-white/60">
                    <span className="flex items-center">
                      <IonIcon name="time" className="mr-1" />
                      {formatTime(service.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Organisateur */}
              {service.creator && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-3">👤 Proposé par</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                      {service.creator.avatar ? (
                        <img src={service.creator.avatar} alt={service.creator.pseudo} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {service.creator.pseudo.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-white">{service.creator.pseudo}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                {/* Discussion - disponible pour tous */}
                <button 
                  onClick={() => onOpenChat?.(service.id, service.title)}
                  className="w-full btn-primary px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <IonIcon name="chatbubbles" className="mr-2" />
                  Discussion avec {isOwner ? 'les intéressés' : 'le propriétaire'}
                </button>

                {/* Actions du propriétaire */}
                {isOwner && (
                  <button 
                    onClick={handleDelete}
                    className="w-full btn-secondary px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  >
                    <IonIcon name="trash" className="mr-2" />
                    Supprimer le service
                  </button>
                )}

                {/* Action pour les non-propriétaires */}
                {!isOwner && (
                  <button 
                    className="w-full btn-primary px-6 py-3 rounded-xl text-white font-semibold"
                    onClick={() => {
                      const actionText = service.type === ServiceType.HELP ? 'Proposer mon aide' : 
                                       service.type === ServiceType.EXCHANGE ? 'Proposer un échange' : 
                                       'Récupérer';
                      // Cette logique pourrait être déplacée vers le parent si nécessaire
                      alert(`${actionText} pour "${service.title}"`);
                    }}
                  >
                    <IonIcon name="hand-right" className="mr-2" />
                    {service.type === ServiceType.HELP ? 'Proposer mon aide' : 
                     service.type === ServiceType.EXCHANGE ? 'Proposer un échange' : 'Récupérer'}
                  </button>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TrocDetailsModal;