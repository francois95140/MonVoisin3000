import React from 'react';
import IonIcon from './IonIcon';
import Button from './Button';

interface ErrorMessageProps {
  title?: string;
  message: string;
  icon?: string;
  onRetry?: () => void;
  retryText?: string;
  showRetry?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "Erreur",
  message,
  icon = "alert-circle",
  onRetry,
  retryText = "Réessayer",
  showRetry = true,
  actions,
  className = ""
}) => {
  return (
    <div className={`glass-card rounded-2xl p-6 text-center border border-red-500/30 ${className}`}>
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
        <IonIcon name={icon} className="text-red-400 text-2xl" />
      </div>
      <h3 className="text-red-400 font-semibold mb-2">{title}</h3>
      <p className="text-white/70 text-sm mb-4">{message}</p>
      
      {(showRetry && onRetry) || actions ? (
        <div className="flex space-x-2 justify-center">
          {showRetry && onRetry && (
            <Button 
              onClick={onRetry}
              variant="danger"
              size="sm"
            >
              {retryText}
            </Button>
          )}
          {actions}
        </div>
      ) : null}
    </div>
  );
};

export default ErrorMessage;