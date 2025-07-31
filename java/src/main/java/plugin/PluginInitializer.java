package plugin;

import plugin.examples.PageTrackerPlugin;
import plugin.examples.PerformanceMonitorPlugin;
import plugin.examples.WelcomePlugin;

/**
 * Initialise et enregistre les plugins par défaut de l'application
 */
public class PluginInitializer {
    
    /**
     * Initialise tous les plugins par défaut
     */
    public static void initializeDefaultPlugins() {
        PluginManager pluginManager = PluginManager.getInstance();
        
        System.out.println("🔌 Initialisation des plugins par défaut...");
        
        // Enregistrer les plugins d'exemple
        pluginManager.registerPlugin(new PageTrackerPlugin());
        pluginManager.registerPlugin(new WelcomePlugin());
        pluginManager.registerPlugin(new PerformanceMonitorPlugin());
        
        // Activer les plugins par défaut (optionnel)
        // pluginManager.enablePlugin("Page Tracker");
        // pluginManager.enablePlugin("Welcome Messages");
        // pluginManager.enablePlugin("Performance Monitor");
        
        System.out.println("✅ Plugins par défaut initialisés");
    }
    
    /**
     * Nettoie tous les plugins lors de la fermeture de l'application
     */
    public static void shutdownPlugins() {
        System.out.println("🔌 Arrêt des plugins...");
        PluginManager.getInstance().shutdown();
        System.out.println("✅ Plugins arrêtés");
    }
}