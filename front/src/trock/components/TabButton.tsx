import React from 'react';
import { IonIcon } from '../../components/shared';

interface TabButtonProps {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  icon?: string;
  className?: string;
}

const TabButton: React.FC<TabButtonProps> = ({
  children,
  isActive,
  onClick,
  icon,
  className = ""
}) => {
  return (
    <button 
      className={`tab-button flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center ${
        isActive ? 'active' : ''
      } ${className}`}
      onClick={onClick}
    >
      {icon && <IonIcon name={icon} className="mr-1" />}
      {children}
    </button>
  );
};

export default TabButton;