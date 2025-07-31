package plugin.examples;

import plugin.AbstractPlugin;

/**
 * Plugin d'exemple qui monitore les performances et temps passés sur chaque page
 */
public class PerformanceMonitorPlugin extends AbstractPlugin {
    
    private long pageStartTime;
    private String currentPageName;
    private long totalTimeSpent = 0;
    
    @Override
    public String getName() {
        return "Performance Monitor";
    }
    
    @Override
    public String getVersion() {
        return "1.1.0";
    }
    
    @Override
    public String getDescription() {
        return "Plugin qui monitore le temps passé sur chaque page et les performances de navigation";
    }
    
    @Override
    public void initialize() {
        super.initialize();
        pageStartTime = System.currentTimeMillis();
        totalTimeSpent = 0;
        System.out.println("⏱️ Plugin Performance Monitor activé - Monitoring des performances démarré");
    }
    
    @Override
    public void cleanup() {
        super.cleanup();
        if (currentPageName != null) {
            long timeOnLastPage = System.currentTimeMillis() - pageStartTime;
            totalTimeSpent += timeOnLastPage;
            System.out.println("⏱️ [Performance] Temps final sur " + currentPageName + ": " + timeOnLastPage + "ms");
        }
        System.out.println("⏱️ Plugin Performance Monitor désactivé - Temps total de session: " + totalTimeSpent + "ms");
    }
    
    @Override
    public void onPageChanged(String pageName, String previousPage) {
        if (enabled) {
            long currentTime = System.currentTimeMillis();
            
            // Calculer le temps passé sur la page précédente
            if (previousPage != null && pageStartTime > 0) {
                long timeSpent = currentTime - pageStartTime;
                totalTimeSpent += timeSpent;
                System.out.println("⏱️ [Performance] Temps sur " + previousPage + ": " + timeSpent + "ms");
                
                // Alertes pour les pages où l'utilisateur reste longtemps
                if (timeSpent > 30000) { // Plus de 30 secondes
                    System.out.println("🐌 [Performance] ALERTE: L'utilisateur a passé beaucoup de temps sur " + previousPage + " (" + (timeSpent/1000) + "s)");
                }
            }
            
            // Démarrer le chronométrage pour la nouvelle page
            pageStartTime = currentTime;
            currentPageName = pageName;
            
            // Statistiques générales
            System.out.println("⚡ [Performance] Navigation vers " + pageName + " - Temps de session total: " + (totalTimeSpent/1000) + "s");
            
            // Suggestions selon la page
            switch (pageName) {
                case "Main":
                    System.out.println("📊 [Performance] Tableau de bord chargé - Prêt pour les opérations");
                    break;
                case "Plugin":
                    System.out.println("🔧 [Performance] Interface plugins chargée - Configuration disponible");
                    break;
                case "Custom":
                    System.out.println("⚙️ [Performance] Outil personnalisé ouvert - Prêt pour le scraping");
                    break;
            }
        }
    }
}