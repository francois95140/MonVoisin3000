import React from 'react';
import { IonIcon, Button } from '../../../components/shared';

interface InfoCardProps {
  title: string;
  description: string;
  icon: string;
  iconBg?: string;
  actionText?: string;
  onAction?: () => void;
  animationDelay?: string;
  className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon,
  iconBg = "from-purple-400 to-pink-500",
  actionText,
  onAction,
  animationDelay = "0.7s",
  className = ""
}) => {
  return (
    <div 
      className={`glass-card rounded-2xl p-6 fade-in text-center ${className}`}
      style={{animationDelay}}
    >
      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${iconBg} flex items-center justify-center`}>
        <IonIcon name={icon} className="text-white text-2xl" />
      </div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-white/70 text-sm mb-4 leading-relaxed">{description}</p>
      
      {actionText && onAction && (
        <Button 
          onClick={onAction}
          variant="primary"
          icon="add-circle"
          className="mx-auto"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default InfoCard;