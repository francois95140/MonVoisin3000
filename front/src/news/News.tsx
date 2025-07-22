import React from 'react';

// Composant pour les icônes Ionicons
const IonIcon: React.FC<{ name: string; className?: string }> = ({ name, className = "" }) => (
  <ion-icon name={name} class={className}></ion-icon>
);

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

const News: React.FC = () => {
  const articles: Article[] = [
    {
      id: 1,
      title: "Ouverture d'une nouvelle boulangerie artisanale",
      sentiment: 'positive',
      sentimentIcon: 'happy',
      sentimentLabel: 'Positif',
      tags: [
        { label: 'Commerce', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
        { label: 'Alimentation', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
        { label: 'Artisanat', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
      ],
      publishDate: '30 Juin 2025',
      source: 'Journal Municipal',
      animationDelay: '0.2s'
    },
    {
      id: 2,
      title: "Importants embouteillages dus aux travaux",
      sentiment: 'negative',
      sentimentIcon: 'sad',
      sentimentLabel: 'Négatif',
      tags: [
        { label: 'Travaux', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
        { label: 'Circulation', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
        { label: 'Transport', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
      ],
      publishDate: '29 Juin 2025',
      source: 'Radio Locale',
      animationDelay: '0.3s'
    },
    {
      id: 3,
      title: "Vote du budget municipal 2025",
      sentiment: 'neutral',
      sentimentIcon: 'remove',
      sentimentLabel: 'Neutre',
      tags: [
        { label: 'Politique', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
        { label: 'Budget', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
        { label: 'Administration', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
      ],
      publishDate: '28 Juin 2025',
      source: 'Mairie Officielle',
      animationDelay: '0.4s'
    },
    {
      id: 4,
      title: "Festival d'été : programmation exceptionnelle",
      sentiment: 'positive',
      sentimentIcon: 'happy',
      sentimentLabel: 'Positif',
      tags: [
        { label: 'Culture', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
        { label: 'Musique', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
        { label: 'Événement', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
      ],
      publishDate: '27 Juin 2025',
      source: 'Service Culturel',
      animationDelay: '0.5s'
    },
    {
      id: 5,
      title: "Augmentation des cambriolages en centre-ville",
      sentiment: 'negative',
      sentimentIcon: 'warning',
      sentimentLabel: 'Négatif',
      tags: [
        { label: 'Sécurité', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
        { label: 'Prévention', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
        { label: 'Police', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
      ],
      publishDate: '26 Juin 2025',
      source: 'Police Municipale',
      animationDelay: '0.6s'
    },
    {
      id: 6,
      title: "Record de recyclage battu en 2024",
      sentiment: 'positive',
      sentimentIcon: 'checkmark-circle',
      sentimentLabel: 'Positif',
      tags: [
        { label: 'Environnement', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
        { label: 'Recyclage', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
        { label: 'Écologie', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
      ],
      publishDate: '25 Juin 2025',
      source: 'Service Environnement',
      animationDelay: '0.7s'
    }
  ];

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

  const handleShare = (title: string) => {
    console.log(`Partage de l'article: ${title}`);
    
    if (navigator.share) {
      navigator.share({
        title: title,
        text: 'Découvrez cette actualité de notre ville',
        url: window.location.href
      });
    } else {
      // Fallback pour les navigateurs ne supportant pas l'API Web Share
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Lien copié dans le presse-papiers !');
      });
    }
  };

  const handleReadMore = (title: string) => {
    console.log(`Ouverture de l'article complet: ${title}`);
    // Ici vous pouvez rediriger vers la page détaillée de l'article
  };

  const handleArticleClick = (title: string) => {
    console.log(`Consultation rapide de: ${title}`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            font-family: 'Inter', sans-serif;
        }

        .glass-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .accent-text {
            color: #ffffff;
            font-weight: 800;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .btn-primary {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            transition: all 0.3s ease;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-1px);
        }

        .article-card {
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .article-card:hover {
            transform: translateY(-4px);
        }

        .category-tag {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            border-width: 1px;
        }

        .sentiment-positive {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.3);
            color: #00ff5e;
        }

        .sentiment-negative {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #ff3a3a;
        }

        .sentiment-neutral {
            background: rgba(156, 163, 175, 0.1);
            border: 1px solid rgba(156, 163, 175, 0.3);
            color: #003caa;
        }

        .fade-in {
            animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
      `}</style>

      {/* Script pour charger Ionicons */}
      <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
      <script noModule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>

      <div 
        className="min-h-screen antialiased"
        style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
      >
        {/* Titre principal */}
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

        {/* Liste des actualités */}
        <main className="px-6 pb-8">
          <div className="space-y-6">
            {articles.map((article) => (
              <article 
                key={article.id}
                className="glass-card article-card rounded-2xl p-6 fade-in"
                style={{animationDelay: article.animationDelay}}
                onClick={() => handleArticleClick(article.title)}
              >
                {/* Titre */}
                <h3 className="text-2xl font-bold text-white mb-3">{article.title}</h3>
                
                {/* Sentiment */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className={`${getSentimentClass(article.sentiment)} rounded-full px-3 py-1 flex items-center space-x-2`}>
                    <IonIcon name={article.sentimentIcon} className="text-lg" />
                    <span className="text-sm font-medium">{article.sentimentLabel}</span>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.map((tag, index) => (
                    <span key={index} className={`category-tag ${tag.color}`}>
                      {tag.label}
                    </span>
                  ))}
                </div>
                
                {/* Date et Source */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-white/60 text-sm">Publié le:</span>
                    <span className="text-white/80 text-sm font-medium">{article.publishDate}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white/60 text-sm">Source:</span>
                    <span className="text-white/80 text-sm font-medium">{article.source}</span>
                  </div>
                </div>
                
                {/* Boutons d'action */}
                <div className="flex items-center space-x-3">
                  <button 
                    className="btn-secondary px-4 py-2 rounded-xl text-white/80 text-sm flex items-center space-x-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(article.title);
                    }}
                  >
                    <IonIcon name="share-social" className="text-base" />
                    <span>Partager</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default News;