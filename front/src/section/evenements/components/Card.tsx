import React, { useState } from 'react';

interface CardProps {
    title: string;
    description: string;
    date: string;
    timestart: string;
    timeend: string;
    location: string;
    icon: string;
    animationDelay?: number;
}

const Card: React.FC<CardProps> = ({ 
    title, 
    description, 
    date, 
    timestart, 
    timeend, 
    location, 
    icon, 
    animationDelay = 0,
}) => {




    return (
      <div className="glass-card event-card rounded-2xl p-6 fade-in" style={{animationDelay: `${animationDelay*0.2}s`}}>
        <div className="flex items-start space-x-4">
            <div className="event-image">
                <ion-icon name={icon} className="text-white text-3xl"></ion-icon>
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{title || "Titre de l'événement non fourni."}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                    {description || "Description de l'événement non fournie."}
                </p>
                <div className="space-y-1 mb-4">
                    <div className="flex items-center text-white/80 text-sm">
                        <ion-icon name="calendar-outline" className="mr-2 text-cyan-400 text-base"></ion-icon>
                        {date || "Date de l'événement non fournie."}
                    </div>
                    <div className="flex items-center text-white/80 text-sm">
                        <ion-icon name="time-outline" className="mr-2 text-cyan-400 text-base"></ion-icon>
                        {timestart || "Heure de commencement de l'événement non fournie."} - {timeend || "Heure de fin de l'événement non fournie."}
                    </div>
                    <div className="flex items-center text-white/80 text-sm">
                        <ion-icon name="location-outline" className="mr-2 text-cyan-400 text-base"></ion-icon>
                        {location || "Lieu de l'événement non fourni."}
                    </div>
                </div>
                <button className="btn-primary px-6 py-2 rounded-xl text-white font-semibold text-sm">
                    Participer
                </button>
            </div>
        </div>
    </div>
  );
};

export default Card;