import React from 'react';
import { NavLink } from 'react-router-dom';

interface UserHeaderProps {
  profileImage?: string;
  pseudo?: string;
}

const UserHeader: React.FC<UserHeaderProps> = ({ 
  profileImage, 
  pseudo
}) => {
  return (
    <>
    <div style={{ height: 'calc(var(--spacing)* 8 + var(--spacing) * 10)' }}>
    </div>
    <div className="fixed top-0 left-0 w-full z-50 flex items-center /justify-between justify-center p-4 bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-md border-b border-white/20">
      {/* Photo de profil à gauche */}
      <div className="flex-shrink-0">
        <NavLink to="/profile" className="block">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 border-2 border-white shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer">
            {profileImage ? (
              <img 
                src={profileImage} 
                alt={`Photo de profil de ${pseudo}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {pseudo ? pseudo.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            )}
          </div>
        </NavLink>
      </div>

      {/* Pseudo au centre */}
      <div className="/flex-1 text-center px-4">
        <h2 className="text-white font-semibold text-lg truncate">
          {pseudo || 'Utilisateur'}
        </h2>
      </div>

      {/* Icône paramètres à droite */}
      <div className="hidden flex-shrink-0">
        <NavLink 
          to="/settings"
          className="w-10 h-10 p-1 block rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20"
          aria-label="Paramètres"
        >
          <ion-icon name="settings" className="w-full h-full text-white text-xl"></ion-icon>
        </NavLink>
      </div>
    </div>
    </>
  );
};

export default UserHeader;

