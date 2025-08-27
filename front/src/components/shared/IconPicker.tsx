import React, { useState, useMemo } from 'react';
import { IonIcon } from './';
import { ionIcons, iconCategories, getIconsByCategory, searchIcons } from '../../data/ionIcons';

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
  className?: string;
}

const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelectIcon, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredIcons = useMemo(() => {
    if (searchQuery) {
      return searchIcons(searchQuery);
    }
    
    if (selectedCategory === 'All') {
      return ionIcons;
    }
    
    return getIconsByCategory(selectedCategory);
  }, [searchQuery, selectedCategory]);

  const handleIconSelect = (iconName: string) => {
    onSelectIcon(iconName);
    setIsOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de sélection d'icône */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between text-white"
      >
        <div className="flex items-center space-x-3">
          {selectedIcon ? (
            <>
              <IonIcon name={selectedIcon} className="text-xl" />
              <span className="text-sm">{selectedIcon}</span>
            </>
          ) : (
            <span className="text-white/60 text-sm">Choisir une icône</span>
          )}
        </div>
        <IonIcon 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          className="text-white/60"
        />
      </button>

      {/* Modal de sélection */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 z-50 max-h-96 flex flex-col">
          {/* Barre de recherche */}
          <div className="mb-4">
            <div className="relative">
              <IonIcon 
                name="search" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
              />
              <input
                type="text"
                placeholder="Rechercher une icône..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-white/40"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                >
                  <IonIcon name="close" />
                </button>
              )}
            </div>
          </div>

          {/* Filtres par catégorie */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Toutes
              </button>
              {iconCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Compteur de résultats */}
          <div className="mb-2">
            <span className="text-xs text-white/60">
              {filteredIcons.length} icône{filteredIcons.length !== 1 ? 's' : ''} trouvée{filteredIcons.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Grille d'icônes */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-8 gap-2">
              {filteredIcons.map((icon) => (
                <button
                  key={icon.name}
                  onClick={() => handleIconSelect(icon.name)}
                  title={`${icon.name} (${icon.category})`}
                  className={`p-2 rounded-lg transition-colors hover:bg-white/20 flex items-center justify-center ${
                    selectedIcon === icon.name
                      ? 'bg-blue-500 text-white'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <IonIcon name={icon.name} className="text-lg" />
                </button>
              ))}
            </div>

            {filteredIcons.length === 0 && (
              <div className="text-center py-8">
                <IonIcon name="search" className="text-4xl text-white/30 mb-2" />
                <p className="text-white/60 text-sm">Aucune icône trouvée</p>
                <button
                  onClick={handleClearSearch}
                  className="text-blue-400 hover:text-blue-300 text-xs mt-1 underline"
                >
                  Effacer la recherche
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex justify-end space-x-2 pt-2 border-t border-white/10">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
            >
              Fermer
            </button>
            {selectedIcon && (
              <button
                onClick={() => handleIconSelect('')}
                className="px-4 py-2 text-sm bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Overlay pour fermer */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default IconPicker;