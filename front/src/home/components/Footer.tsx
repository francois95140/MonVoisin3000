import React from 'react';

const Footer = () => {
  return (
    <footer className="text-center mt-12 pb-8 fade-in" style={{ animationDelay: '1s' }}>
      <p className="text-white/60 text-sm">
        MonVoisin3000 - Connecter les communautés locales
      </p>
      <div className="flex justify-center space-x-6 mt-4">
        <a href="#" className="text-white/60 hover:text-white text-sm">À propos</a>
        <a href="#" className="text-white/60 hover:text-white text-sm">Confidentialité</a>
        <a href="#" className="text-white/60 hover:text-white text-sm">Support</a>
      </div>
    </footer>
  );
};

export default Footer;