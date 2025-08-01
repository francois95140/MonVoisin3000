import React from 'react';
import IonIcon from './IonIcon';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: string;
  iconBg?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  iconBg = "from-purple-400 to-pink-500",
  actionText,
  onAction,
  className = ""
}) => {
  return (
    <div className={`glass-card rounded-2xl p-8 text-center ${className}`}>
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

export default EmptyState;