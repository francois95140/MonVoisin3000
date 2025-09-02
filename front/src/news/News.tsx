import React, { useState, useEffect } from 'react';
import NewsHeader from './components/NewsHeader';
import ArticleCard from './components/ArticleCard';

const apiUrl = import.meta.env.VITE_API_URL;

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
  url?: string;
}

const News: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('Vous devez être connecté pour voir les actualités');
      }

      const response = await fetch(`${apiUrl}/api/journal-mongo/news`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
        throw new Error('Erreur lors du chargement des actualités');
      }

      const data = await response.json();
      
      // Transformer les données de l'API pour correspondre à l'interface Article
      const transformedArticles: Article[] = data.map((item: any, index: number) => ({
        id: item._id || index,
        title: item.titre || item.title || 'Titre non disponible',
        sentiment: getSentimentFromNumber(item.sentiment),
        sentimentIcon: getSentimentIcon(getSentimentFromNumber(item.sentiment)),
        sentimentLabel: getSentimentLabel(getSentimentFromNumber(item.sentiment)),
        tags: (item.tags || []).map((tag: string) => ({
          label: tag,
          color: getTagColor(tag)
        })),
        publishDate: item.datePublication || new Date().toLocaleDateString('fr-FR'),
        source: item.source || 'Source inconnue',
        animationDelay: `${0.2 + index * 0.1}s`,
        url: item.url
      }));

      setArticles(transformedArticles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string): string => {
    switch (sentiment) {
      case 'positive':
        return 'happy';
      case 'negative':
        return 'sad';
      default:
        return 'remove';
    }
  };

  const getSentimentLabel = (sentiment: string): string => {
    switch (sentiment) {
      case 'positive':
        return 'Positif';
      case 'negative':
        return 'Négatif';
      default:
        return 'Neutre';
    }
  };

  const getSentimentFromNumber = (sentimentNumber: number): 'positive' | 'negative' | 'neutral' => {
    if (sentimentNumber > 0) return 'positive';
    if (sentimentNumber < 0) return 'negative';
    return 'neutral';
  };

  const getTagColor = (tag: string): string => {
    // Couleurs par défaut pour les tags
    const colors = [
      'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'bg-green-500/20 text-green-400 border-green-500/30',
      'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'bg-red-500/20 text-red-400 border-red-500/30',
      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'bg-gray-500/20 text-gray-400 border-gray-500/30'
    ];
    
    // Simple hash pour avoir une couleur cohérente par tag
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = ((hash << 5) - hash + tag.charCodeAt(i)) & 0xffffffff;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleShare = async (article: Article) => {
    console.log(`Partage de l'article: ${article.title}`);
    
    const urlToShare = article.url || window.location.href;
    
    if (navigator.share && navigator.canShare) {
      try {
        await navigator.share({
          title: article.title,
          text: 'Découvrez cette actualité de notre ville',
          url: urlToShare
        });
        return;
      } catch (error) {
        console.log('Partage annulé ou échoué, fallback vers copie');
      }
    }
    
    // Fallback: copier dans le presse-papiers
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(urlToShare);
        alert('Lien copié dans le presse-papiers !');
      } else {
        // Fallback pour navigateurs plus anciens
        const textArea = document.createElement('textarea');
        textArea.value = urlToShare;
        textArea.style.position = 'fixed';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          alert('Lien copié dans le presse-papiers !');
        } else {
          // Si tout échoue, afficher l'URL pour copie manuelle
          prompt('Copiez ce lien:', urlToShare);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      // Dernier recours: afficher l'URL
      prompt('Copiez ce lien:', urlToShare);
    }
  };

  const handleReadMore = (article: Article) => {
    console.log(`Ouverture de l'article complet: ${article.title}`);
    if (article.url) {
      window.open(article.url, '_blank');
    }
  };


  const handleArticleClick = (title: string) => {
    console.log(`Consultation rapide de: ${title}`);
  };

  return (
    <>
      {/* Script pour charger Ionicons */}
      <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
      <script noModule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>

      <div className="news-container antialiased">
        <NewsHeader />

        <main className="px-6 pb-8">
          {loading && (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white/70">Chargement des actualités...</p>
            </div>
          )}

          {error && (
            <div className="glass-card rounded-2xl p-6 text-center border border-red-500/30">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/20 flex items-center justify-center">
                <ion-icon name="alert-circle" className="text-red-400 text-2xl"></ion-icon>
              </div>
              <h3 className="text-red-400 font-semibold mb-2">Erreur</h3>
              <p className="text-white/70 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-6">
              {articles.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <ion-icon name="newspaper" className="text-white text-2xl"></ion-icon>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Aucune actualité</h3>
                  <p className="text-white/70 text-sm">Il n'y a pas encore d'actualités pour votre ville.</p>
                </div>
              ) : (
                articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onShare={() => handleShare(article)}
                    onReadMore={() => handleReadMore(article)}
                    onArticleClick={handleArticleClick}
                  />
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default News;