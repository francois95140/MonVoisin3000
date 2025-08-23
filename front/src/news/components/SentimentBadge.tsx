import React from 'react';
import IonIcon from './IonIcon';

interface SentimentBadgeProps {
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentIcon: string;
  sentimentLabel: string;
}

const SentimentBadge: React.FC<SentimentBadgeProps> = ({ 
  sentiment, 
  sentimentIcon, 
  sentimentLabel 
}) => {
  const getSentimentClass = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'sentiment-positive';
      case 'negative':
        return 'sentiment-negative';
      case 'neutral':
        return 'sentiment-neutral';
      default:
        return 'sentiment-neutral';
    }
  };

  return (
    <div className={`${getSentimentClass(sentiment)} rounded-full px-3 py-1 flex items-center space-x-2`}>
      <IonIcon name={sentimentIcon} className="text-lg" />
      <span className="text-sm font-medium">{sentimentLabel}</span>
    </div>
  );
};

export default SentimentBadge;