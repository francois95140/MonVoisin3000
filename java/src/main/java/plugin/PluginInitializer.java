package plugin;

// Les plugins examples sont maintenant dans le dossier plugins/ et chargés dynamiquement

/**
 * Initialise et enregistre les plugins par défaut de l'application
 */
public class PluginInitializer {
    
    /**
     * Initialise tous les plugins par défaut
     */
    public static void initializeDefaultPlugins() {
        PluginManager pluginManager = PluginManager.getInstance();
        
        System.out.println("initialisation des plugins par défaut...");
        
        // Les plugins examples sont maintenant dans le dossier plugins/ 
        // et peuvent être chargés via l'interface utilisateur
        // Aucun plugin hardcodé n'est plus enregistré ici
        
        System.out.println("plugins par défaut initialisés");
    }
    
    /**
     * Nettoie tous les plugins lors de la fermeture de l'application
     */
    public static void shutdownPlugins() {
        System.out.println("arrêt des plugins...");
        PluginManager.getInstance().shutdown();
        System.out.println("plugins arrêtés");
    }
}