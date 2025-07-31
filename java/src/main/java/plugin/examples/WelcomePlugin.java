package plugin.examples;

import plugin.AbstractPlugin;

/**
 * Plugin d'exemple qui affiche des messages de bienvenue
 */
public class WelcomePlugin extends AbstractPlugin {
    
    private int pageVisitCount = 0;
    
    @Override
    public String getName() {
        return "Welcome Messages";
    }
    
    @Override
    public String getVersion() {
        return "1.2.0";
    }
    
    @Override
    public String getDescription() {
        return "Plugin qui affiche des messages de bienvenue et compte les visites de pages";
    }
    
    @Override
    public void initialize() {
        super.initialize();
        pageVisitCount = 0;
        System.out.println("👋 Plugin Welcome Messages activé - Messages de bienvenue activés");
    }
    
    @Override
    public void cleanup() {
        super.cleanup();
        System.out.println("👋 Plugin Welcome Messages désactivé - Total de pages visitées: " + pageVisitCount);
        pageVisitCount = 0;
    }
    
    @Override
    public void onPageChanged(String pageName, String previousPage) {
        if (enabled) {
            pageVisitCount++;
            
            switch (pageName) {
                case "Main":
                    System.out.println("🎉 [Welcome] Bienvenue sur le tableau de bord ! (Visite #" + pageVisitCount + ")");
                    break;
                case "Plugin":
                    System.out.println("🔧 [Welcome] Configuration des plugins en cours... (Visite #" + pageVisitCount + ")");
                    break;
                case "Custom":
                    System.out.println("⚡ [Welcome] Outil personnalisé ouvert - Bon scraping ! (Visite #" + pageVisitCount + ")");
                    break;
                case "Accueil":
                    System.out.println("🌟 [Welcome] Retour à l'accueil - Bon retour ! (Visite #" + pageVisitCount + ")");
                    break;
                default:
                    System.out.println("🚀 [Welcome] Nouvelle page explorée: " + pageName + " (Visite #" + pageVisitCount + ")");
                    break;
            }
            
            // Message spécial tous les 5 changements de page
            if (pageVisitCount % 5 == 0) {
                System.out.println("🎊 [Welcome] Félicitations ! Vous avez visité " + pageVisitCount + " pages !");
            }
        }
    }
}