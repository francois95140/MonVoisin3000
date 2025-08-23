import React from 'react';
import { NavLink } from 'react-router-dom';

const ActionButtons = () => {
  return (
    <div style={{animationDelay: '0.2s'}} className="space-y-4 mb-12 fade-in">
      <NavLink to="/inscription" className="btn-primary w-full py-4 rounded-2xl text-white font-semibold text-lg shadow-lg flex items-center justify-center space-x-2">
        <ion-icon name="rocket" className="text-xl"></ion-icon>
        <span>Commencer l'aventure</span>
      </NavLink>
      <NavLink to="/connexion" className="btn-secondary w-full py-4 rounded-2xl text-white font-medium flex items-center justify-center space-x-2">
        <ion-icon name="phone-portrait" className="text-xl"></ion-icon>
        <span>J'ai déjà un compte</span>
      </NavLink>
    </div>
  );
};

export default ActionButtons;