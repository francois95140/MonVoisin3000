import React from 'react';
import { NavLink } from 'react-router-dom';



const HomePage = () => {
  return (
    <>
      {/* <!-- Header avec logo --> */}
    <header className="pt-safe-top">
        <div className="px-6 py-6">
            <div className="flex items-center justify-center">
                <div className="glass-card rounded-2xl px-4 py-2">
                    <h1 className="text-2xl font-bold text-white">
                        Mon<span className="accent-text">Voisin</span>3000
                    </h1>
                </div>
            </div>
        </div>
    </header>

    {/* <!-- Hero Section --> */}
    <main className="px-6 pb-8">
        <div className="text-center mb-12 fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Votre quartier
                <br/>
                <span className="accent-text">connecté</span>
            </h2>
            <p className="text-white/80 text-lg leading-relaxed max-w-md mx-auto">
                Découvrez une nouvelle façon d'interagir avec vos voisins : troc, services, événements et bien plus.
            </p>
        </div>

        {/* <!-- Boutons d'action --> */}
        <div style={{animationDelay: '0.2s'}} className="space-y-4 mb-12 fade-in">
            <a href="./inscription.html" className="btn-primary w-full py-4 rounded-2xl text-white font-semibold text-lg shadow-lg flex items-center justify-center space-x-2">
                <ion-icon name="rocket" className="text-xl"></ion-icon>
                <span>Commencer l'aventure</span>
            </a>
            <a href="./login.html" className="btn-secondary w-full py-4 rounded-2xl text-white font-medium flex items-center justify-center space-x-2">
                <ion-icon name="phone-portrait" className="text-xl"></ion-icon>
                <span>J'ai déjà un compte</span>
            </a>
        </div>

        {/* <!-- Statistiques --> */}
        <div className="glass-card rounded-3xl p-6 mb-8 fade-in" style={{animationDelay: '0.4s'}}>
            <h3 className="text-white font-semibold text-center mb-6">La communauté MonVoisin3000</h3>
            <div className="stats-grid">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">2.8K</div>
                    <div className="text-white/70 text-sm">Voisins</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">156</div>
                    <div className="text-white/70 text-sm">Échanges/jour</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">24</div>
                    <div className="text-white/70 text-sm">Événements</div>
                </div>
            </div>
        </div>

        {/* <!-- Fonctionnalités principales --> */}
        <div style={{animationDelay: '0.6s'}} className="space-y-4 fade-in">
            <h3 className="text-white font-semibold text-xl text-center mb-6">Que pouvez-vous faire ?</h3>
            
            <div className="glass-card feature-card rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
                        <ion-icon name="swap-horizontal" className="text-white text-2xl"></ion-icon>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-2">Troc & Services</h4>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Échangez des objets, proposez vos services ou trouvez l'aide dont vous avez besoin près de chez vous.
                        </p>
                    </div>
                </div>
            </div>

            <div className="glass-card feature-card rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                        <ion-icon name="calendar" className="text-white text-2xl"></ion-icon>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-2">Événements</h4>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Participez aux événements du quartier : vide-greniers, nettoyages collectifs, soirées conviviales.
                        </p>
                    </div>
                </div>
            </div>

            <div className="glass-card feature-card rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <ion-icon name="chatbubbles" className="text-white text-2xl"></ion-icon>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-2">Messagerie</h4>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Restez en contact avec vos voisins grâce à la messagerie intégrée et aux groupes de discussion.
                        </p>
                    </div>
                </div>
            </div>

            <div className="glass-card feature-card rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <ion-icon name="location" className="text-white text-2xl"></ion-icon>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-2">TrackMap</h4>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Partagez votre position avec vos amis proches pour vous retrouver plus facilement.
                        </p>
                    </div>
                </div>
            </div>

            <div className="glass-card feature-card rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <ion-icon name="newspaper" className="text-white text-2xl"></ion-icon>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-2">Actualités</h4>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Suivez les dernières nouvelles de votre quartier et les informations de la mairie.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* <!-- Témoignage --> */}
        <div style={{animationDelay: '0.8s'}} className="glass-card rounded-3xl p-6 mt-8 fade-in">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">MC</span>
                </div>
                <blockquote className="text-white/90 italic mb-3">
                    "Grâce à MonVoisin3000, j'ai trouvé une baby-sitter de confiance et participé au nettoyage du parc. Notre quartier n'a jamais été aussi uni !"
                </blockquote>
                <cite className="text-white/70 font-medium">Marie-Claire, utilisatrice depuis 6 mois</cite>
            </div>
        </div>

        {/* <!-- Footer --> */}
        <footer className="text-center mt-12 pb-8 fade-in" style={{ animationDelay: '1s' }}>
            <p className="text-white/60 text-sm">
                MonVoisin3000 - Connecter les communautés locales
            </p>
            <div className="flex justify-center space-x-6 mt-4">
                <a href="#" className="text-white/60 hover:text-white text-sm">À propos</a>
                <a href="#" className="text-white/60 hover:text-white text-sm">Confidentialité</a>
                <a href="#" className="text-white/60 hover:text-white text-sm">Support</a>
            </div>
        </footer>
    </main>
    </>
  );
};

export default HomePage;