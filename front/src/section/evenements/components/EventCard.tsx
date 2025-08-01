import React from 'react';
import { IonIcon, Button } from '../../../components/shared';

interface EventCardProps {
  title: string;
  description: string;
  date: string;
  timestart: string;
  timeend: string;
  location: string;
  icon: string;
  animationDelay?: number;
  buttonText?: string;
  buttonType?: 'primary' | 'secondary';
  onClick?: () => void;
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({ 
  title, 
  description, 
  date, 
  timestart, 
  timeend, 
  location, 
  icon, 
  animationDelay = 0,
  buttonText = 'Participer',
  buttonType = 'primary',
  onClick,
  className = ""
}) => {
  return (
    <div 
      className={`glass-card event-card rounded-2xl p-6 fade-in ${className}`} 
      style={{animationDelay: `${animationDelay * 0.2}s`}}
    >
      <div className="flex items-start space-x-4">
        <div className="event-image">
          <IonIcon name={icon} className="text-white text-3xl" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">
            {title || "Titre de l'événement non fourni."}
          </h3>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            {description || "Description de l'événement non fournie."}
          </p>
          <div className="space-y-1 mb-4">
            <div className="flex items-center text-white/80 text-sm">
              <IonIcon name="calendar-outline" className="mr-2 text-cyan-400 text-base" />
              {date || "Date de l'événement non fournie."}
            </div>
            <div className="flex items-center text-white/80 text-sm">
              <IonIcon name="time-outline" className="mr-2 text-cyan-400 text-base" />
              {timestart || "Heure de commencement de l'événement non fournie."} - {timeend || "Heure de fin de l'événement non fournie."}
            </div>
            <div className="flex items-center text-white/80 text-sm">
              <IonIcon name="location-outline" className="mr-2 text-cyan-400 text-base" />
              {location || "Lieu de l'événement non fourni."}
            </div>
          </div>
          <Button 
            onClick={onClick}
            variant={buttonType}
            size="sm"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;