import { useState } from 'react';
import IconOption from './IconOption';

const apiUrl = import.meta.env.VITE_API_URL;

export default function Add() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState('');

    // Fonction de validation du formulaire
    const validateForm = (formData: FormData) => {
        const errors: string[] = [];
        
        // Vérification des champs obligatoires
        const requiredFields = [
            { name: 'icon', label: 'Icône' },
            { name: 'title', label: 'Titre' },
            { name: 'description', label: 'Description' },
            { name: 'startDate', label: 'Date de début' },
            { name: 'endDate', label: 'Date de fin' },
            { name: 'startTime', label: 'Heure de début' },
            { name: 'endTime', label: 'Heure de fin' },
            { name: 'location', label: 'Lieu' }
        ];

        requiredFields.forEach(field => {
            const value = formData.get(field.name) as string;
            if (!value || value.trim() === '') {
                errors.push(`Le champ "${field.label}" est obligatoire.`);
            }
        });

        // Vérification de la sélection d'icône
        const selectedIconInput = document.getElementById('selectedIcon') as HTMLInputElement;
        if (!selectedIconInput?.value || selectedIconInput.value.trim() === '') {
            errors.push('Veuillez sélectionner une icône.');
        }

        // Vérification des dates et heures
        const startDate = formData.get('startDate') as string;
        const endDate = formData.get('endDate') as string;
        const startTime = formData.get('startTime') as string;
        const endTime = formData.get('endTime') as string;

        if (startDate && endDate) {
            const startDateObj = new Date(startDate);
            const endDateObj = new Date(endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Réinitialiser l'heure pour comparer seulement les dates

            // Vérifier que la date de début est après aujourd'hui
            if (startDateObj < today) {
                errors.push('La date de début doit être postérieure à aujourd\'hui.');
            }

            // Vérifier que la date de fin est après ou égale à la date de début
            if (endDateObj < startDateObj) {
                errors.push('La date de fin doit être postérieure ou égale à la date de début.');
            }

            // Si les dates sont égales, vérifier que l'heure de fin est supérieure à l'heure de début
            if (startTime && endTime && startDateObj.getTime() === endDateObj.getTime()) {
                if (endTime <= startTime) {
                    errors.push('Si les dates sont identiques, l\'heure de fin doit être supérieure à l\'heure de début.');
                }
            }
        }

        return errors;
    };

    // Fonction de soumission du formulaire
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const formData = new FormData(event.currentTarget);

        // Ajouter l'icône sélectionnée au FormData
        const selectedIcon = document.getElementById('selectedIcon') as HTMLInputElement;
        if (selectedIcon?.value) {
            formData.set('icon', selectedIcon.value);
        }

        // Validation du formulaire
        const errors = validateForm(formData);
        
        if (errors.length > 0) {
            alert(`Erreurs de validation:\n${errors.join('\n')}`);
            return;
        }

        // Si tout est valide, envoyer les données à l'API
        try {
            // Récupération du token d'authentification
            const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
            
            if (!authToken) {
                alert('Vous devez être connecté pour créer un événement.');
                return;
            }

            // Construction du body selon le schéma Zod de l'API
            const startDateStr = formData.get('startDate') as string;
            const endDateStr = formData.get('endDate') as string;
            
            const eventData = {
                titre: formData.get('title') as string,
                description: formData.get('description') as string,
                startDate: startDateStr ? new Date(startDateStr).toISOString() : null,
                endDate: endDateStr ? new Date(endDateStr).toISOString() : null,
                startTime: formData.get('startTime') as string,
                endTime: formData.get('endTime') as string,
                location: formData.get('location') as string,
                imageUrl: selectedIcon?.value || undefined
            };

            const response = await fetch(`${apiUrl}/api/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                const result = await response.json();
                alert('Événement créé avec succès !');
            } else {
                const errorData = await response.json();
                console.error('Erreur lors de la création:', errorData);
                alert(`Erreur lors de la création de l'événement: ${errorData.message || 'Erreur inconnue'}`);
                return;
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
            return;
        }
        
        // Fermer la modal et réinitialiser le formulaire
        toggleModal();
        const form = document.getElementById('eventForm') as HTMLFormElement;
        if (form) form.reset();
        const selectedIconInput = document.getElementById('selectedIcon') as HTMLInputElement;
        if (selectedIconInput) selectedIconInput.value = '';
        setSelectedIcon('');
    };

    const iconOptions = [
        "calendar", "musical-notes", "restaurant", "fitness", "library",
        "cafe", "basketball", "camera", "boat", "bicycle", "book", "gift",
        "heart", "home", "medical", "people", "school", "school", "school",
        "calendar", "musical-notes", "restaurant", "fitness", "library",
        "cafe", "basketball", "camera", "boat", "bicycle", "book", "gift",
        "heart", "home", "medical", "people", "school", "school", "school"
    ];

    const handleIconSelect = (iconName: string) => {
        setSelectedIcon(iconName);
        const selectedIconInput = document.getElementById('selectedIcon') as HTMLInputElement;
        if (selectedIconInput) {
            selectedIconInput.value = iconName;
        }
    };

    const toggleModal = () => {
        setIsOpen(!isOpen);
        const modal = document.getElementById('eventModal');
        if (modal) {
            if (isOpen) {
                modal.classList.remove('show');
            } else {
                modal.classList.add('show');
            }
        }
    }
   

    return (
        <>
        <button className="flex content-center items-center glass-card rounded-xl p-3" onClick={toggleModal}>
            <ion-icon name="add" className="text-white text-xl"></ion-icon>
        </button>
        { (
            <>
            {/* Modal d'ajout d'événement */}
            <div id="eventModal" className="modal flex-col">
                <div className="modal-content m-auto mt-4 mb-8">
                    <div className="p-6">
                        {/* Header de la modal */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Créer un événement</h2>
                            <button id="closeModal" className="text-white/70 hover:text-white text-2xl" onClick={toggleModal}>
                                <ion-icon name="close"></ion-icon>
                            </button>
                        </div>

                        {/* Formulaire */}
                        <form id="eventForm" className="space-y-6" onSubmit={handleSubmit}>
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
                                <input type="hidden" id="selectedIcon" name="icon" value={selectedIcon}/>
                            </div>

                            {/* Titre */}
                            <div>
                                <label className="block text-white font-medium mb-2">Titre de l'événement</label>
                                <input type="text" id="eventTitle" name="title" className="form-input" placeholder="Ex: Atelier cuisine du monde" required/>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-white font-medium mb-2">Description</label>
                                <textarea id="eventDescription" name="description" rows="3" className="form-input resize-none" placeholder="Décrivez votre événement..." required></textarea>
                            </div>

                            {/* Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white font-medium mb-2">Date de début</label>
                                    <input type="date" id="startDate" name="startDate" className="form-input" required/>
                                </div>
                                <div>
                                    <label className="block text-white font-medium mb-2">Date de fin</label>
                                    <input type="date" id="endDate" name="endDate" className="form-input" required/>
                                </div>
                            </div>

                            {/* Heures */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white font-medium mb-2">Heure de début</label>
                                    <input type="time" id="startTime" name="startTime" className="form-input" required/>
                                </div>
                                <div>
                                    <label className="block text-white font-medium mb-2">Heure de fin</label>
                                    <input type="time" id="endTime" name="endTime" className="form-input" required/>
                                </div>
                            </div>

                            {/* Localisation */}
                            <div>
                                <label className="block text-white font-medium mb-2">Lieu</label>
                                <input type="text" id="eventLocation" name="location" className="form-input" placeholder="Ex: Salle des fêtes, 123 Rue de la Paix" required/>
                            </div>

                            {/* Boutons */}
                            <div className="flex space-x-4 pt-4">
                                <button type="button" id="cancelBtn" className="btn-secondary px-6 py-3 rounded-xl text-white font-semibold flex-1" onClick={toggleModal}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn-primary px-6 py-3 rounded-xl text-white font-semibold flex-1">
                                    Créer l'événement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="navheight"></div>
            </div>
            </>
        )}
        </>
    )
}

