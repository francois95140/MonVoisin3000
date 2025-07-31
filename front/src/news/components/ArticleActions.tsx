import React from 'react';
import IonIcon from './IonIcon';

interface ArticleActionsProps {
  onShare: () => void;
}

const ArticleActions: React.FC<ArticleActionsProps> = ({ onShare }) => {
  return (
    <div className="flex items-center space-x-3">
      <button 
        className="btn-secondary px-4 py-2 rounded-xl text-white/80 text-sm flex items-center space-x-2"
        onClick={onShare}
      >
        <IonIcon name="share-social" className="text-base" />
        <span>Partager</span>
      </button>
    </div>
  );
};

export default ArticleActions;