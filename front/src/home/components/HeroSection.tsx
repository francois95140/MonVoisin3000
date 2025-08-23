import React from 'react';

const HeroSection = () => {
  return (
    <div className="text-center mb-12 fade-in">
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
        Votre quartier
        <br/>
        <span className="accent-text">connecté</span>
      </h2>
      <p className="text-white/80 text-lg leading-relaxed max-w-md mx-auto">
        Découvrez une nouvelle façon d'interagir avec vos voisins : troc, services, événements et bien plus.
      </p>
    </div>
  );
};

export default HeroSection;