import Card from './components/Card';
import Add from './components/Add';

export default function Evenements() {

    const events = [
        {
            title: "Vide-grenier Géant",
            description: "Le plus grand vide-grenier de l'année ! Venez chiner, vendre vos trésors cachés et rencontrer vos voisins. Stands de restauration et animations pour enfants.",
            date: "Samedi 25 Juillet 2025",
            timestart: "9h00",
            timeend: "18h00",
            location: "Place de la Mairie, 75001 Paris",
            icon: "storefront",
            buttonText: "Participer",
            buttonType: "primary"
        },
        {
            title: "Yoga en Plein Air",
            description: "Séances de yoga gratuites dans le parc. Détendez-vous après le travail et reconnectez-vous avec la nature. Tous niveaux bienvenus ! Apportez votre tapis.",
            date: "Mardi 22 Juillet 2025",
            timestart: "19h00",
            timeend: "20h00",
            location: "Parc Municipal, Avenue des Tilleuls",
            icon: "flower",
            buttonText: "S'inscrire",
            buttonType: "primary"
        },
        {
            title: "Nettoyage Collectif du Parc",
            description: "Rejoignez l'effort collectif pour remettre en état notre parc après les intempéries. Matériel fourni, collation offerte. Ensemble, rendons notre quartier plus beau !",
            date: "Samedi 20 Juillet 2025",
            timestart: "9h00",
            timeend: "12h00",
            location: "Entrée du Parc, Rue des Jardins",
            icon: "leaf",
            buttonText: "Participer",
            buttonType: "primary"
        },
        {
            title: "Soirée Jeux de Société",
            description: "Venez passer une soirée conviviale autour de jeux de société. Apportez vos jeux préférés ou découvrez de nouveaux jeux ! Boissons et snacks fournis.",
            date: "Vendredi 2 Août 2025",
            timestart: "19h30",
            timeend: "23h00",
            location: "Salle des Fêtes, 12 Rue de la République",
            icon: "game-controller",
            buttonText: "Participer",
            buttonType: "primary"
        },
        {
            title: "Marché des Producteurs",
            description: "Marché de producteurs locaux. Fruits, légumes de saison, pain frais et produits artisanaux de la région. Venez soutenir nos producteurs locaux !",
            date: "Samedi 26 Juillet 2025",
            timestart: "8h00",
            timeend: "13h00",
            location: "Place du Marché, Centre-ville",
            icon: "basket",
            buttonText: "Plus d'infos",
            buttonType: "primary"
        },
        {
            title: "Atelier Jardinage Bio",
            description: "Apprenez les bases du jardinage biologique avec notre expert local. Techniques de compostage, plantation et entretien naturel. Outils fournis.",
            date: "Dimanche 28 Juillet 2025",
            timestart: "14h00",
            timeend: "17h00",
            location: "Jardin Partagé, 45 Rue des Roses",
            icon: "rose",
            buttonText: "S'inscrire",
            buttonType: "primary"
        }
    ];

    return (
    <>
        {/* Titre principal */}
        <div className="px-6 mb-6 pt-6 fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        <span className="accent-text">Événements</span> du quartier
                    </h2>
                    <p className="text-white/70">
                        Participez à la vie de votre communauté
                    </p>
                </div>
                
                <Add />
            </div>
        </div>

        {/* Liste des événements */}
        <main className="px-6 pb-8">
            <div className="space-y-4">
                {events.map((event, index) => (
                    <Card
                        key={`${event.title}-${event.date}-${index}`}
                        title={event.title}
                        description={event.description}
                        date={event.date}
                        timestart={event.timestart}
                        timeend={event.timeend}
                        location={event.location}
                        icon={event.icon}
                        animationDelay={index}
                    />
                ))}
            </div>

            {/* Message d'encouragement */}
            <div className="glass-card rounded-2xl p-6 mt-8 fade-in"  style={{animationDelay: `0.7s`}}>
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                        <ion-icon name="heart" className="text-white text-2xl"></ion-icon>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Créez votre événement !</h3>
                    <p className="text-white/70 text-sm mb-4 leading-relaxed">
                        Vous avez une idée d'activité pour le quartier ? Organisez votre propre événement et rassemblez vos voisins !
                    </p>
                    <button className="flex justify-center items-center btn-primary px-6 py-3 rounded-xl text-white font-semibold">
                        <ion-icon name="add-circle" className="mr-2"></ion-icon>
                        Organiser un événement
                    </button>
                </div>
            </div>
        </main>
        </>

    );
}
