import React from 'react';

const NewsHeader = () => {
  return (
    <div className="px-6 mb-6 pt-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            <span className="accent-text">Actualités</span> de la ville
          </h2>
          <p className="text-white/70">
            Restez informé de tout ce qui se passe près de chez vous
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsHeader;