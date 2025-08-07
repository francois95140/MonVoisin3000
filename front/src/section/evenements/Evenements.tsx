import { useState, useEffect } from 'react';
import Card from './components/Card';
import Add from './components/Add';

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
    const [showMyEvents, setShowMyEvents] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<Event | undefined>(undefined);
    const [isEditMode, setIsEditMode] = useState(false);

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
        if (showMyEvents) {
            fetchMyEvents();
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
        if (showMyEvents) {
            fetchMyEvents();
        }
    };

    const handleParticipate = async (eventId: string) => {
        try {
            const token = sessionStorage.getItem('authToken');
            if (!token) {
                setError('Vous devez être connecté pour participer à un événement.');
                return;
            }

            const response = await fetch(`${apiUrl}/api/events/${eventId}/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                setError('Session expirée. Veuillez vous reconnecter.');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Erreur lors de l\'inscription');
                return;
            }

            // Succès - rafraîchir la liste des événements inscrits
            alert('Inscription réussie à l\'événement');
            await fetchRegisteredEvents();
            
        } catch (err) {
            console.error('Erreur lors de l\'inscription:', err);
            setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription à l\'événement');
        }
    };

    const handleUnregister = async (eventId: string) => {
        try {
            const token = sessionStorage.getItem('authToken');
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
                localStorage.removeItem('token');
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

    const toggleView = () => {
        setShowMyEvents(!showMyEvents);
        setError(null);
        if (!showMyEvents) {
            fetchMyEvents();
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
                    <button 
                        onClick={toggleView}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            showMyEvents 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                    >
                        {showMyEvents ? 'Tous les événements' : 'Mes événements'}
                    </button>
                    <Add 
                        eventToEdit={eventToEdit}
                        isEditMode={isEditMode}
                        onEventUpdated={handleEventUpdated}
                        onEventDeleted={handleEventDeleted}
                    />
                </div>
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
                    {(showMyEvents ? myEvents : events).length === 0 ? (
                        <div className="glass-card rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                                <ion-icon name="calendar" className="text-white text-2xl"></ion-icon>
                            </div>
                            <h3 className="text-white font-semibold mb-2">
                                {showMyEvents ? 'Aucun événement créé' : 'Aucun événement'}
                            </h3>
                            <p className="text-white/70 text-sm">
                                {showMyEvents 
                                    ? 'Vous n\'avez pas encore créé d\'événements. Commencez dès maintenant !'
                                    : 'Il n\'y a pas encore d\'événements dans votre quartier. Soyez le premier à en créer un !'
                                }
                            </p>
                        </div>
                    ) : (
                        (showMyEvents ? myEvents : events).map((event, index) => {
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
                                            showMyEvents 
                                                ? "Modifier" 
                                                : isRegistered 
                                                    ? "Ne plus participer" 
                                                    : "Participer"
                                        }
                                        buttonType={
                                            showMyEvents 
                                                ? "secondary" 
                                                : isRegistered 
                                                    ? "secondary" 
                                                    : "primary"
                                        }
                                        animationDelay={index}
                                        onClick={
                                            showMyEvents 
                                                ? () => handleEditEvent(event) 
                                                : isRegistered 
                                                    ? () => handleUnregister(event.id) 
                                                    : () => handleParticipate(event.id)
                                        }
                                    />
                                </div>
                            );
                        })
                    )}
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
