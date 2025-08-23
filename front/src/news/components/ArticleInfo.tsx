import React from 'react';

interface ArticleInfoProps {
  publishDate: string;
  source: string;
}

const ArticleInfo: React.FC<ArticleInfoProps> = ({ publishDate, source }) => {
  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center space-x-2">
        <span className="text-white/60 text-sm">Publié le:</span>
        <span className="text-white/80 text-sm font-medium">{publishDate}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-white/60 text-sm">Source:</span>
        <span className="text-white/80 text-sm font-medium">{source}</span>
      </div>
    </div>
  );
};

export default ArticleInfo;