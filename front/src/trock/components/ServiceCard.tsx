import React from 'react';
import { IonIcon, Button } from '../../components/shared';

export enum ServiceType {
  HELP = 'help',
  EXCHANGE = 'exchange',
  DONATION = 'donation'
}

interface ServiceCardProps {
  id: number;
  title: string;
  provider: string;
  description: string;
  price: string;
  icon: string;
  iconBg?: string;
  distance?: string;
  rating?: number;
  reviews?: number;
  type: ServiceType;
  createdAt: Date;
  animationDelay?: number;
  onClick?: () => void;
  onAction?: (e: React.MouseEvent) => void;
  actionText?: string;
  showAction?: boolean;
  className?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  title,
  provider,
  description,
  price,
  icon,
  iconBg,
  distance,
  rating = 5,
  reviews = 0,
  type,
  createdAt,
  animationDelay = 0,
  onClick,
  onAction,
  actionText,
  showAction = true,
  className = ""
}) => {
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

  const getTimeAgo = (date: Date): string => {
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

  const getActionText = () => {
    if (actionText) return actionText;
    
    switch (type) {
      case ServiceType.HELP:
        return 'Aidée';
      case ServiceType.EXCHANGE:
        return 'Échangée';
      case ServiceType.DONATION:
        return 'Récupérée';
      default:
        return 'Action';
    }
  };

  return (
    <div 
      className={`glass-card item-card rounded-2xl p-4 fade-in cursor-pointer ${className}`}
      style={{animationDelay: `${0.2 + animationDelay * 0.1}s`}}
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div className={`item-image bg-gradient-to-br ${iconBg || getServiceTypeColor(type)}`}>
          <IonIcon name={icon} className="text-white text-3xl" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
              <p className="text-white/80 text-sm">{provider}</p>
            </div>
            <span className="price-tag">{price}</span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed mb-3">
            {description}
          </p>
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/60 text-xs">{getTimeAgo(createdAt)}</span>
            {distance && (
              <span className="text-white/60 text-xs">{distance}</span>
            )}
          </div>
          {showAction && onAction && (
            <Button 
              onClick={onAction}
              variant="primary"
              size="sm"
              className="btn-primary"
            >
              {getActionText()}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;