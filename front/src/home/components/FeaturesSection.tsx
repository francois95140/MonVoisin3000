import React from 'react';
import FeatureCard from './FeatureCard';

const FeaturesSection = () => {
  const features = [
    {
      icon: "swap-horizontal",
      title: "Troc & Services",
      description: "Échangez des objets, proposez vos services ou trouvez l'aide dont vous avez besoin près de chez vous.",
      gradientColors: "bg-gradient-to-br from-orange-400 to-red-500"
    },
    {
      icon: "calendar",
      title: "Événements",
      description: "Participez aux événements du quartier : vide-greniers, nettoyages collectifs, soirées conviviales.",
      gradientColors: "bg-gradient-to-br from-green-400 to-emerald-500"
    },
    {
      icon: "chatbubbles",
      title: "Messagerie",
      description: "Restez en contact avec vos voisins grâce à la messagerie intégrée et aux groupes de discussion.",
      gradientColors: "bg-gradient-to-br from-blue-400 to-indigo-500"
    },
    {
      icon: "location",
      title: "TrackMap",
      description: "Partagez votre position avec vos amis proches pour vous retrouver plus facilement.",
      gradientColors: "bg-gradient-to-br from-purple-400 to-pink-500"
    },
    {
      icon: "newspaper",
      title: "Actualités",
      description: "Suivez les dernières nouvelles de votre quartier et les informations de la mairie.",
      gradientColors: "bg-gradient-to-br from-yellow-400 to-orange-500"
    }
  ];

  return (
    <div style={{animationDelay: '0.6s'}} className="space-y-4 fade-in">
      <h3 className="text-white font-semibold text-xl text-center mb-6">Que pouvez-vous faire ?</h3>
      
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          gradientColors={feature.gradientColors}
        />
      ))}
    </div>
  );
};

export default FeaturesSection;