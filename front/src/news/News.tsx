import React from 'react';
import NewsHeader from './components/NewsHeader';
import ArticleCard from './components/ArticleCard';

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
      {/* Script pour charger Ionicons */}
      <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
      <script noModule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>

      <div className="news-container antialiased">
        <NewsHeader />

        <main className="px-6 pb-8">
          <div className="space-y-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onShare={handleShare}
                onArticleClick={handleArticleClick}
              />
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default News;