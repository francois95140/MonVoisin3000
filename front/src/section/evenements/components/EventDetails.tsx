import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

interface Event {
    id?: string;
    titre: string;
    description: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    location: string;
    imageUrl?: string;
    creator?: {
        id: string;
        pseudo: string;
        avatar?: string;
    };
    participants?: Array<{
        id: string;
        pseudo: string;
        avatar?: string;
    }>;
    participantCount?: number;
}

interface EventDetailsProps {
    eventId: string;
    onBack: () => void;
    onParticipate?: (eventId: string) => void;
    onUnregister?: (eventId: string) => void;
    onEdit?: (event: Event) => void;
    onOpenEventChat?: (eventId: string, eventTitle: string) => void;
    isRegistered?: boolean;
    isOwner?: boolean;
}

const EventDetails: React.FC<EventDetailsProps> = ({
    eventId,
    onBack,
    onParticipate,
    onUnregister,
    onEdit,
    onOpenEventChat,
    isRegistered = false,
    isOwner = false
}) => {
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
            if (!authToken) {
                throw new Error('Vous devez être connecté pour voir les détails');
            }

            const response = await fetch(`${apiUrl}/api/events/${eventId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Événement introuvable');
                }
                if (response.status === 401) {
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                throw new Error('Erreur lors du chargement des détails');
            }

            const data = await response.json();
            setEvent(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        return timeString;
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-6 pb-24 antialiased" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <div className="px-6">
                    <div className="glass-card rounded-2xl p-8 text-center">
                        <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-white/70">Chargement des détails...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-6 pb-24 antialiased" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <div className="px-6">
                    <div className="glass-card rounded-2xl p-8 text-center border border-red-500/30">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
                            <ion-icon name="alert-circle" className="text-red-400 text-2xl"></ion-icon>
                        </div>
                        <h3 className="text-red-400 font-semibold mb-2">Erreur</h3>
                        <p className="text-white/70 text-sm mb-4">{error}</p>
                        <button 
                            onClick={onBack}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                            Retour
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!event) {
        return null;
    }

    return (
        <div className="min-h-screen pt-6 pb-24 antialiased" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            {/* Header avec bouton retour */}
            <div className="px-6 mb-6 fade-in">
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        title="Retour à la liste"
                    >
                        <ion-icon name="arrow-back" className="text-white text-xl"></ion-icon>
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Détails de l'événement
                        </h2>
                        <p className="text-white/70 text-sm">
                            Informations complètes
                        </p>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <main className="px-6 pb-8">
                <div className="glass-card rounded-2xl p-8 fade-in" style={{animationDelay: '0.1s'}}>
                    {/* Titre et image */}
                    <div className="flex items-start space-x-6 mb-8">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <ion-icon name={event.imageUrl || "calendar"} className="text-white text-3xl"></ion-icon>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-3">{event.titre}</h1>
                            <p className="text-white/70 leading-relaxed">{event.description}</p>
                        </div>
                    </div>

                    {/* Informations de l'événement */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Date et heure */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white mb-3">📅 Date et heure</h3>
                            <div className="space-y-3">
                                <div className="flex items-center text-white/80">
                                    <ion-icon name="calendar-outline" className="mr-3 text-cyan-400 text-lg"></ion-icon>
                                    <span>{formatDate(event.startDate)}</span>
                                </div>
                                <div className="flex items-center text-white/80">
                                    <ion-icon name="time-outline" className="mr-3 text-cyan-400 text-lg"></ion-icon>
                                    <span>De {formatTime(event.startTime)} à {formatTime(event.endTime)}</span>
                                </div>
                                {event.endDate !== event.startDate && (
                                    <div className="flex items-center text-white/80">
                                        <ion-icon name="calendar" className="mr-3 text-cyan-400 text-lg"></ion-icon>
                                        <span>Jusqu'au {formatDate(event.endDate)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Lieu */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white mb-3">📍 Lieu</h3>
                            <div className="flex items-start text-white/80">
                                <ion-icon name="location-outline" className="mr-3 text-cyan-400 text-lg mt-0.5"></ion-icon>
                                <span>{event.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Organisateur et participants */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Organisateur */}
                        {event.creator && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white mb-3">👤 Organisateur</h3>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                                        {event.creator.avatar ? (
                                            <img src={event.creator.avatar} alt={event.creator.pseudo} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="text-white font-bold text-sm">
                                                {event.creator.pseudo.substring(0, 2).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-white">{event.creator.pseudo}</span>
                                </div>
                            </div>
                        )}

                        {/* Participants */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white mb-3">
                                👥 Participants ({event.participants?.length || 0})
                            </h3>
                            {event.participants && event.participants.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {event.participants.slice(0, 8).map((participant) => (
                                        <div key={participant.id} className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-1">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                                                {participant.avatar ? (
                                                    <img src={participant.avatar} alt={participant.pseudo} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <span className="text-white font-bold text-xs">
                                                        {participant.pseudo.substring(0, 1).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-white/80 text-sm">{participant.pseudo}</span>
                                        </div>
                                    ))}
                                    {event.participants.length > 8 && (
                                        <div className="flex items-center bg-white/10 rounded-lg px-3 py-1">
                                            <span className="text-white/60 text-sm">
                                                +{event.participants.length - 8} autres
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-white/60 text-sm">Aucun participant pour le moment</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4 pt-6 border-t border-white/10">
                        {/* Première ligne - Actions principales */}
                        <div className="flex space-x-4">
                            {isOwner ? (
                                <button 
                                    onClick={() => onEdit?.(event)}
                                    className="flex-1 btn-secondary px-6 py-3 rounded-xl text-white font-semibold"
                                >
                                    <ion-icon name="create-outline" className="mr-2"></ion-icon>
                                    Modifier l'événement
                                </button>
                            ) : (
                                <>
                                    {isRegistered ? (
                                        <button 
                                            onClick={async () => {
                                                await onUnregister?.(event.id!);
                                                // Rafraîchir les données après l'action
                                                fetchEventDetails();
                                            }}
                                            className="flex-1 btn-secondary px-6 py-3 rounded-xl text-white font-semibold"
                                        >
                                            <ion-icon name="remove-circle-outline" className="mr-2"></ion-icon>
                                            Ne plus participer
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={async () => {
                                                await onParticipate?.(event.id!);
                                                // Rafraîchir les données après l'action
                                                fetchEventDetails();
                                            }}
                                            className="flex-1 btn-primary px-6 py-3 rounded-xl text-white font-semibold"
                                        >
                                            <ion-icon name="add-circle-outline" className="mr-2"></ion-icon>
                                            Participer à l'événement
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Deuxième ligne - Discussion (seulement pour les participants ou propriétaires) */}
                        {(isRegistered || isOwner) && (
                            <button 
                                onClick={() => onOpenEventChat?.(event.id!, event.titre)}
                                className="w-full btn-primary px-6 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                            >
                                <ion-icon name="chatbubbles" className="mr-2"></ion-icon>
                                Discussion de l'événement
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EventDetails;