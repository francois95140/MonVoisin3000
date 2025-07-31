package plugin.examples;

import plugin.AbstractPlugin;

/**
 * Plugin d'exemple qui trace les changements de page
 */
public class PageTrackerPlugin extends AbstractPlugin {
    
    @Override
    public String getName() {
        return "Page Tracker";
    }
    
    @Override
    public String getVersion() {
        return "1.0.0";
    }
    
    @Override
    public String getDescription() {
        return "Plugin qui trace et log tous les changements de page dans l'application";
    }
    
    @Override
    public void initialize() {
        super.initialize();
        System.out.println("🚀 Plugin Page Tracker initialisé - Surveillance des pages activée");
    }
    
    @Override
    public void cleanup() {
        super.cleanup();
        System.out.println("🛑 Plugin Page Tracker désactivé - Surveillance des pages arrêtée");
    }
    
    @Override
    public void onPageChanged(String pageName, String previousPage) {
        if (enabled) {
            if (previousPage != null) {
                System.out.println("📄 [Page Tracker] Navigation: " + previousPage + " → " + pageName);
            } else {
                System.out.println("📄 [Page Tracker] Page initiale: " + pageName);
            }
            
            // Actions spécifiques selon la page
            switch (pageName) {
                case "Main":
                    System.out.println("🏠 [Page Tracker] Utilisateur sur le tableau de bord principal");
                    break;
                case "Plugin":
                    System.out.println("🔌 [Page Tracker] Utilisateur dans la gestion des plugins");
                    break;
                case "Custom":
                    System.out.println("🛠️ [Page Tracker] Utilisateur dans l'outil personnalisé");
                    break;
                case "Accueil":
                    System.out.println("👋 [Page Tracker] Utilisateur sur la page d'accueil");
                    break;
                default:
                    System.out.println("❓ [Page Tracker] Page inconnue: " + pageName);
                    break;
            }
        }
    }
}