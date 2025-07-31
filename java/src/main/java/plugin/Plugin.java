package plugin;

/**
 * Interface de base pour tous les plugins de l'application
 */
public interface Plugin {
    
    /**
     * Retourne le nom du plugin
     */
    String getName();
    
    /**
     * Retourne la version du plugin
     */
    String getVersion();
    
    /**
     * Retourne la description du plugin
     */
    String getDescription();
    
    /**
     * Initialise le plugin
     * Appelé lors de l'activation du plugin
     */
    void initialize();
    
    /**
     * Nettoie les ressources du plugin
     * Appelé lors de la désactivation du plugin
     */
    void cleanup();
    
    /**
     * Méthode appelée lors du changement de page
     * @param pageName nom de la nouvelle page
     * @param previousPage nom de la page précédente (peut être null)
     */
    void onPageChanged(String pageName, String previousPage);
    
    /**
     * Indique si le plugin est actuellement actif
     */
    boolean isEnabled();
    
    /**
     * Active ou désactive le plugin
     */
    void setEnabled(boolean enabled);
}