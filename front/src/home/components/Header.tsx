import React from 'react';

const Header = () => {
  return (
    <header className="pt-safe-top">
      <div className="px-6 py-6">
        <div className="flex items-center justify-center">
          <div className="glass-card rounded-2xl px-4 py-2">
            <h1 className="text-2xl font-bold text-white">
              Mon<span className="accent-text">Voisin</span>3000
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;