import React from 'react';

const CommunityStats = () => {
  return (
    <div className="glass-card rounded-3xl p-6 mb-8 fade-in" style={{animationDelay: '0.4s'}}>
      <h3 className="text-white font-semibold text-center mb-6">La communauté MonVoisin3000</h3>
      <div className="stats-grid">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">2.8K</div>
          <div className="text-white/70 text-sm">Voisins</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">156</div>
          <div className="text-white/70 text-sm">Échanges/jour</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">24</div>
          <div className="text-white/70 text-sm">Événements</div>
        </div>
      </div>
    </div>
  );
};

export default CommunityStats;