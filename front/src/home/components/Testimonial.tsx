import React from 'react';

const Testimonial = () => {
  return (
    <div style={{animationDelay: '0.8s'}} className="glass-card rounded-3xl p-6 mt-8 fade-in">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
          <span className="text-white font-bold text-lg">MC</span>
        </div>
        <blockquote className="text-white/90 italic mb-3">
          "Grâce à MonVoisin3000, j'ai trouvé une baby-sitter de confiance et participé au nettoyage du parc. Notre quartier n'a jamais été aussi uni !"
        </blockquote>
        <cite className="text-white/70 font-medium">Marie-Claire, utilisatrice depuis 6 mois</cite>
      </div>
    </div>
  );
};

export default Testimonial;