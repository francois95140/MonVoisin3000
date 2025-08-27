import React, { useState, useEffect } from 'react';
import { IonIcon } from '.';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const checkIfInstalled = () => {
      // Pour Chrome/Edge
      if (window.navigator && 'getInstalledRelatedApps' in window.navigator) {
        (window.navigator as any).getInstalledRelatedApps().then((relatedApps: any[]) => {
          setIsInstalled(relatedApps.length > 0);
        });
      }
      
      // Pour Safari iOS
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
      
      // Pour Android Chrome
      if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        setIsInstalled(true);
      }
    };

    checkIfInstalled();

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('💾 Prompt d\'installation PWA disponible');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      console.log('🎉 PWA installée avec succès !');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    console.log('📱 Déclenchement du prompt d\'installation');
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    console.log(`👤 Choix utilisateur: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('✅ Utilisateur a accepté l\'installation');
    } else {
      console.log('❌ Utilisateur a refusé l\'installation');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Cacher le prompt pour cette session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Ne pas afficher si déjà installé ou si l'utilisateur a dismissé
  if (isInstalled || !showInstallPrompt || sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl shadow-2xl z-50 border border-white/20">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <IonIcon name="download-outline" className="text-2xl" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">Installer MonVoisin</h3>
          <p className="text-xs text-white/90 mb-3">
            Accédez plus rapidement à vos conversations et recevez des notifications même hors ligne !
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-white text-blue-600 py-2 px-3 rounded-lg font-medium text-xs hover:bg-white/90 transition-colors"
            >
              Installer
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-xs text-white/80 hover:text-white transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
        >
          <IonIcon name="close" className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;