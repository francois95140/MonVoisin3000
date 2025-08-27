import React from 'react';
import { IonIcon } from '../../components/shared';

interface SocialButtonsProps {
  onGitHubClick?: () => void;
  onGoogleClick?: () => void;
}

const SocialButtons: React.FC<SocialButtonsProps> = ({ 
  onGitHubClick, 
  onGoogleClick 
}) => {
  return (
    <div className="grid grid-cols-2 gap-6 my-4">
      <button 
        onClick={onGitHubClick}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
      >
        <IonIcon name="logo-github" className="text-2xl" />
        GitHub
      </button>
      <button 
        onClick={onGoogleClick}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
      >
        <IonIcon name="logo-google" className="text-2xl" />
        Google
      </button>
    </div>
  );
};

export default SocialButtons;