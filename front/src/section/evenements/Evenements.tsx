import { useState, useEffect } from 'react';
import Card from './components/Card';
import Add from './components/Add';
import EventDetails from './components/EventDetails';

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
}

export default function Evenements() {
    const [events, setEvents] = useState<Event[]>([]);
    const [myEvents, setMyEvents] = useState<Event[]>([]);
    const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<'all' | 'my' | 'participating'>('all');
    const [eventToEdit, setEventToEdit] = useState<Event | undefined>(undefined);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Récupération du token d'authentification
                const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                
                if (!token) {
                    console.warn('Aucun token d\'authentification trouvé');
                    return;
                }

                const response = await fetch(`${apiUrl}/api/users/me`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                console.log("Réponse utilisateur:", response);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log("Utilisateur:", data.user);
                    
                    // Mise à jour du localStorage avec les nouvelles données
                    localStorage.setItem("user", JSON.stringify(data.user));
                } else {
                    console.error('Erreur lors de la récupération des données utilisateur:', response.status);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données utilisateur:', error);
            }
        };

        const fetchEvents = async () => {
            try {
                setLoading(true);
                
                // Récupération du token d'authentification
                const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
                
                if (!authToken) {
                    throw new Error('Vous devez être connecté pour voir les événements');
                }
                
                const response = await fetch(`${apiUrl}/api/events`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Session expirée. Veuillez vous reconnecter.');
                    }
                    throw new Error('Erreur lors du chargement des événements');
                }
                
                const data = await response.json();
                setEvents(data);
                
                // Récupérer aussi les événements auxquels l'utilisateur est inscrit
                await fetchRegisteredEvents();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            } finally {
                setLoading(false);
            }
        };

        // Récupération des données utilisateur puis des événements
        const initializeData = async () => {
            await fetchUser();
            await fetchEvents();
        };

        initializeData();
    }, []);

    const fetchRegisteredEvents = async () => {
        try {
            const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
            
            if (!authToken) {
                return;
            }
            
            const response = await fetch(`${apiUrl}/api/events/registered/my-registrations`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setRegisteredEvents(data);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des événements inscrits:', err);
        }
    };

    const fetchMyEvents = async () => {
        try {
            setLoading(true);
            
            const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
            
            if (!authToken) {
                throw new Error('Vous devez être connecté pour voir vos événements');
            }
            
            const response = await fetch(`${apiUrl}/api/events/my-events`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
                throw new Error('Erreur lors du chargement de vos événements');
            }
            
            const data = await response.json();
            setMyEvents(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const handleEditEvent = (event: Event) => {
        setEventToEdit(event);
        setIsEditMode(true);
    };

    const handleEventUpdated = () => {
        setIsEditMode(false);
        setEventToEdit(undefined);
        if (currentView === 'my') {
            fetchMyEvents();
        } else if (currentView === 'participating') {
            fetchRegisteredEvents();
        } else {
            // Recharger tous les événements
            const fetchEvents = async () => {
                try {
                    const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
                    if (!authToken) return;
                    
                    const response = await fetch(`${apiUrl}/api/events`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        setEvents(data);
                    }
                } catch (err) {
                    console.error('Erreur lors du rechargement:', err);
                }
            };
            fetchEvents();
        }
    };

    const handleEventDeleted = () => {
        setIsEditMode(false);
        setEventToEdit(undefined);
        if (currentView === 'my') {
            fetchMyEvents();
        } else if (currentView === 'participating') {
            fetchRegisteredEvents();
        }
    };

    const handleParticipate = async (eventId: string) => {
        try {
            const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
            console.log('🔑 Token trouvé:', token ? 'Oui' : 'Non');
            if (!token) {
                setError('Vous devez être connecté pour participer à un événement.');
                return;
            }

            console.log('📤 Envoi requête de participation pour événement:', eventId);
            const response = await fetch(`${apiUrl}/api/events/${eventId}/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📥 Réponse API participation:', response.status, response.ok);

            if (response.status === 401) {
                localStorage.removeItem('authToken');
                sessionStorage.removeItem('authToken');
                setError('Session expirée. Veuillez vous reconnecter.');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Erreur API participation:', errorData);
                setError(errorData.message || 'Erreur lors de l\'inscription');
                return;
            }

            // Succès - rafraîchir la liste des événements inscrits
            console.log('✅ Inscription réussie');
            alert('Inscription réussie à l\'événement');
            await fetchRegisteredEvents();
            
        } catch (err) {
            console.error('Erreur lors de l\'inscription:', err);
            setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription à l\'événement');
        }
    };

    const handleUnregister = async (eventId: string) => {
        try {
            const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
            if (!token) {
                setError('Vous devez être connecté pour vous désinscrire d\'un événement.');
                return;
            }

            const response = await fetch(`${apiUrl}/api/events/${eventId}/unregister`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('authToken');
                sessionStorage.removeItem('authToken');
                setError('Session expirée. Veuillez vous reconnecter.');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Erreur lors de la désinscription');
                return;
            }

            // Succès - rafraîchir la liste des événements inscrits
            alert('Désinscription réussie de l\'événement');
            await fetchRegisteredEvents();
            
        } catch (err) {
            console.error('Erreur lors de la désinscription:', err);
            setError(err instanceof Error ? err.message : 'Erreur lors de la désinscription de l\'événement');
        }
    };

    const handleViewChange = (view: 'all' | 'my' | 'participating') => {
        setCurrentView(view);
        setError(null);
        if (view === 'my') {
            fetchMyEvents();
        } else if (view === 'participating') {
            fetchRegisteredEvents();
        }
    };

    const handleEventClick = (eventId: string) => {
        setSelectedEventId(eventId);
    };

    const handleBackToList = () => {
        setSelectedEventId(null);
        // Rafraîchir les données selon la vue actuelle
        if (currentView === 'my') {
            fetchMyEvents();
        } else if (currentView === 'participating') {
            fetchRegisteredEvents();
        } else {
            // Recharger tous les événements
            const fetchEvents = async () => {
                try {
                    const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
                    if (!authToken) return;
                    
                    const response = await fetch(`${apiUrl}/api/events`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        setEvents(data);
                    }
                } catch (err) {
                    console.error('Erreur lors du rechargement:', err);
                }
            };
            fetchEvents();
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

    // Si un événement est sélectionné, afficher la vue détails
    if (selectedEventId) {
        const getCurrentUserId = () => {
            const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    return user.id;
                } catch (e) {
                    return null;
                }
            }
            return null;
        };

        const currentUserId = getCurrentUserId();
        const isOwner = currentView === 'my'; // Si on est dans "Mes événements", on est le propriétaire
        const isRegistered = registeredEvents.some(event => event.id === selectedEventId);

        return (
            <EventDetails
                eventId={selectedEventId}
                onBack={handleBackToList}
                onParticipate={handleParticipate}
                onUnregister={handleUnregister}
                onEdit={handleEditEvent}
                isRegistered={isRegistered}
                isOwner={isOwner}
            />
        );
    }

    return (
    <>
        {/* Titre principal */}
        <div className="px-6 mb-6 pt-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        <span className="accent-text">Événements</span> du quartier
                    </h2>
                    <p className="text-white/70">
                        Participez à la vie de votre communauté
                    </p>
                </div>
                
                <div className="flex space-x-3">
                    <Add 
                        eventToEdit={eventToEdit}
                        isEditMode={isEditMode}
                        onEventUpdated={handleEventUpdated}
                        onEventDeleted={handleEventDeleted}
                    />
                </div>
            </div>
        </div>

        {/* Navigation des vues */}
        <div className="px-6 mb-6 fade-in" style={{animationDelay: '0.1s'}}>
            <div className="flex space-x-1 bg-white/10 rounded-lg p-1 w-fit">
                <button 
                    onClick={() => handleViewChange('all')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentView === 'all' 
                            ? 'bg-purple-600 text-white shadow-sm' 
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                >
                    Tous les événements
                </button>
                <button 
                    onClick={() => handleViewChange('my')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentView === 'my' 
                            ? 'bg-purple-600 text-white shadow-sm' 
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                >
                    Mes événements
                </button>
                <button 
                    onClick={() => handleViewChange('participating')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentView === 'participating' 
                            ? 'bg-purple-600 text-white shadow-sm' 
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                >
                    Je participe
                </button>
            </div>
        </div>

        {/* Liste des événements */}
        <main className="px-6 pb-8">
            {loading && (
                <div className="glass-card rounded-2xl p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white/70">Chargement des événements...</p>
                </div>
            )}

            {error && (
                <div className="glass-card rounded-2xl p-6 text-center border border-red-500/30">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
                        <ion-icon name="alert-circle" className="text-red-400 text-2xl"></ion-icon>
                    </div>
                    <h3 className="text-red-400 font-semibold mb-2">Erreur</h3>
                    <p className="text-white/70 text-sm">{error}</p>
                </div>
            )}

            {!loading && !error && (
                <div className="space-y-4">
                    {(() => {
                        const currentEvents = currentView === 'my' ? myEvents : 
                                            currentView === 'participating' ? registeredEvents : events;
                        
                        if (currentEvents.length === 0) {
                            return (
                                <div className="glass-card rounded-2xl p-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                        <ion-icon name="calendar" className="text-white text-2xl"></ion-icon>
                                    </div>
                                    <h3 className="text-white font-semibold mb-2">
                                        {currentView === 'my' ? 'Aucun événement créé' : 
                                         currentView === 'participating' ? 'Aucune participation' : 
                                         'Aucun événement'}
                                    </h3>
                                    <p className="text-white/70 text-sm">
                                        {currentView === 'my' 
                                            ? 'Vous n\'avez pas encore créé d\'événements. Commencez dès maintenant !'
                                            : currentView === 'participating'
                                            ? 'Vous ne participez à aucun événement pour le moment. Découvrez les événements disponibles !'
                                            : 'Il n\'y a pas encore d\'événements dans votre quartier. Soyez le premier à en créer un !'
                                        }
                                    </p>
                                </div>
                            );
                        }

                        return currentEvents.map((event, index) => {
                            const isRegistered = registeredEvents.some(regEvent => regEvent.id === event.id);
                            
                            return (
                                <div key={event.id || `${event.titre}-${event.startDate}-${index}`} className="relative">
                                    <Card
                                        title={event.titre}
                                        description={event.description}
                                        date={formatDate(event.startDate)}
                                        timestart={event.startTime}
                                        timeend={event.endTime}
                                        location={event.location}
                                        icon={event.imageUrl || "calendar"}
                                        buttonText={
                                            currentView === 'my' 
                                                ? "Modifier"
                                                : currentView === 'participating'
                                                ? "Ne plus participer"
                                                : isRegistered 
                                                    ? "Ne plus participer" 
                                                    : "Participer"
                                        }
                                        buttonType={
                                            currentView === 'my' 
                                                ? "secondary"
                                                : currentView === 'participating'
                                                ? "secondary"
                                                : isRegistered 
                                                    ? "secondary" 
                                                    : "primary"
                                        }
                                        animationDelay={index}
                                        onClick={
                                            currentView === 'my' 
                                                ? () => handleEditEvent(event)
                                                : currentView === 'participating'
                                                ? () => handleUnregister(event.id)
                                                : isRegistered 
                                                    ? () => handleUnregister(event.id) 
                                                    : () => handleParticipate(event.id)
                                        }
                                        onCardClick={() => handleEventClick(event.id!)}
                                    />
                                </div>
                            );
                        });
                    })()}
                </div>
            )}

            {/* Message d'encouragement */}
            <div className="glass-card rounded-2xl p-6 mt-8 fade-in"  style={{animationDelay: `0.7s`}}>
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                        <ion-icon name="heart" className="text-white text-2xl"></ion-icon>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Créez votre événement !</h3>
                    <p className="text-white/70 text-sm mb-4 leading-relaxed">
                        Vous avez une idée d'activité pour le quartier ? Organisez votre propre événement et rassemblez vos voisins !
                    </p>
                    <button className="flex justify-center items-center btn-primary px-6 py-3 rounded-xl text-white font-semibold">
                        <ion-icon name="add-circle" className="mr-2"></ion-icon>
                        Organiser un événement
                    </button>
                </div>
            </div>
        </main>
        </>

    );
}
