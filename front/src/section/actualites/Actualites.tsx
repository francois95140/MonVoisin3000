import React, { useState, useEffect } from 'react';
import "./App.css";

interface ArticleItem {
  titre: string;
  description?: string;
  url: string;
  source: string;
  datePublication: string;
  imageUrl?: string;
  tags?: string[];
  sentiment?: number;
}

function App() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        if (!token) {
          setError('Token d\'authentification manquant');
          return;
        }
        
        const response = await fetch(`${apiUrl}/api/journal-mongo/news`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setArticles(data);
      } catch (err) {
        console.error('Erreur lors de la récupération des articles:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const formatDate = (dateString: string) => {
    // Format: "30/08/2025 05:01"
    const [datePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const date = new Date(`${year}-${month}-${day}`);
    
    return {
      month: date.toLocaleDateString('fr-FR', { month: 'short' }),
      day: day
    };
  };

  if (loading) {
    return (
      <section className="text-gray-400 bg-gray-900 body-font">
        <div className="container px-5 py-12 mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
            <p className="mt-4 text-gray-400">Chargement des actualités...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="text-gray-400 bg-gray-900 body-font">
        <div className="container px-5 py-12 mx-auto">
          <div className="text-center">
            <p className="text-red-400">Erreur: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="text-gray-400 bg-gray-900 body-font">
        <div className="container px-5 py-12 mx-auto">
          <div className="flex flex-wrap -mx-4 -my-8">
            {articles.length === 0 ? (
              <div className="w-full text-center py-12">
                <p className="text-gray-400">Aucun article disponible pour votre ville</p>
              </div>
            ) : (
              articles.map((article, index) => {
                const dateInfo = formatDate(article.datePublication);
                return (
                  <div key={index} className="py-8 px-4 lg:w-1/3">
                    <div className="h-full flex items-start">
                      <div className="w-12 flex-shrink-0 flex flex-col text-center leading-none">
                        <span className="text-gray-400 pb-2 mb-2 border-b-2 border-gray-700">
                          {dateInfo.month}
                        </span>
                        <span className="font-medium text-lg leading-none text-gray-300 title-font">
                          {dateInfo.day}
                        </span>
                      </div>
                      <div className="flex-grow pl-6">
                        <h2 className="tracking-widest text-xs title-font font-medium text-indigo-400 mb-1">
                          {article.source}
                        </h2>
                        <h1 className="title-font text-xl font-medium text-white mb-3">
                          <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
                            {article.titre}
                          </a>
                        </h1>
                        <p className="leading-relaxed mb-5">
                          {article.description || 'Pas de description disponible'}
                        </p>
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {article.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span key={tagIndex} className="text-xs bg-indigo-900 text-indigo-300 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 transition-colors">
                          <span className="flex-grow flex flex-col">
                            <span className="title-font font-medium">Lire l'article</span>
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default App;
