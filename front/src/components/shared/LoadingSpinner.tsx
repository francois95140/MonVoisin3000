import React from 'react';
import IonIcon from './IonIcon';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Chargement...", 
  size = 'md',
  className = ""
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`text-center py-8 ${className}`}>
      <div className={`${sizeClasses[size]} mx-auto mb-4 border-4 border-purple-400 border-t-transparent rounded-full animate-spin`}></div>
      <p className="text-white/70">{message}</p>
    </div>
  );
};

export default LoadingSpinner;