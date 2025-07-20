import { useState } from 'react'
import IconOption from './IconOption';

export default function Add() {
    const [isOpen, setIsOpen] = useState(false);

    const iconOptions = [
        "calendar", "musical-notes", "restaurant", "fitness", "library",
        "cafe", "basketball", "camera", "boat", "bicycle", "book", "gift",
        "heart", "home", "medical", "people", "school", "school", "school",
        "calendar", "musical-notes", "restaurant", "fitness", "library",
        "cafe", "basketball", "camera", "boat", "bicycle", "book", "gift",
        "heart", "home", "medical", "people", "school", "school", "school"
    ];

    const toggleModal = () => {
        setIsOpen(!isOpen);
        console.log('Toggle modal', !isOpen);
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
                        <form id="eventForm" className="space-y-6">
                            {/* Sélection d'icône */}
                            <div>
                                <label className="block text-white font-medium mb-3">Choisir une icône</label>
                                <div className="icon-grid">

                                    {iconOptions.map((icon, index) => (
                                        <IconOption key={index} dataIcon={icon} />
                                    ))}
                                    
                                </div>
                                <input type="hidden" id="selectedIcon" name="icon" value=""/>
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
                            <div>
                                <label className="block text-white font-medium mb-2">Date</label>
                                <input type="date" id="eventDate" name="date" className="form-input" required/>
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
                                <button type="button" id="cancelBtn" className="btn-secondary px-6 py-3 rounded-xl text-white font-semibold flex-1">
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

