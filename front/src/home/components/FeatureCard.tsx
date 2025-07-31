import React from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  gradientColors: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, gradientColors }) => {
  return (
    <div className="glass-card feature-card rounded-2xl p-6">
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 rounded-xl ${gradientColors} flex items-center justify-center flex-shrink-0`}>
          <ion-icon name={icon} className="text-white text-2xl"></ion-icon>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2">{title}</h4>
          <p className="text-white/70 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;