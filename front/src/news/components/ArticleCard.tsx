import React from 'react';
import SentimentBadge from './SentimentBadge';
import TagList from './TagList';
import ArticleInfo from './ArticleInfo';
import ArticleActions from './ArticleActions';

interface ArticleTag {
  label: string;
  color: string;
}

interface Article {
  id: number;
  title: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentIcon: string;
  sentimentLabel: string;
  tags: ArticleTag[];
  publishDate: string;
  source: string;
  animationDelay: string;
}

interface ArticleCardProps {
  article: Article;
  onShare: () => void;
  onReadMore: () => void;
  onArticleClick: (title: string) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  onShare,
  onReadMore, 
  onArticleClick 
}) => {
  return (
    <article 
      className="glass-card article-card rounded-2xl p-6 fade-in cursor-pointer"
      style={{animationDelay: article.animationDelay}}
      onClick={() => onArticleClick(article.title)}
    >
      <h3 className="text-2xl font-bold text-white mb-3">{article.title}</h3>
      
      <div className="flex items-center space-x-2 mb-4">
        <SentimentBadge 
          sentiment={article.sentiment}
          sentimentIcon={article.sentimentIcon}
          sentimentLabel={article.sentimentLabel}
        />
      </div>
      
      <TagList tags={article.tags} />
      
      <ArticleInfo 
        publishDate={article.publishDate}
        source={article.source}
      />
      
      <ArticleActions 
        onShare={onShare}
        onReadMore={onReadMore}
      />
    </article>
  );
};

export default ArticleCard;