import React from 'react';

interface IonIconProps {
  name: string;
  className?: string;
}

const IonIcon: React.FC<IonIconProps> = ({ name, className = "" }) => (
  <ion-icon name={name} className={className}></ion-icon>
);

export default IonIcon;