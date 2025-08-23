package plugin;

/**
 * Classe abstraite de base pour faciliter l'implémentation des plugins
 */
public abstract class AbstractPlugin implements Plugin {
    
    protected boolean enabled = false;
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
    
    @Override
    public void setEnabled(boolean enabled) {
        if (this.enabled != enabled) {
            this.enabled = enabled;
            if (enabled) {
                initialize();
            } else {
                cleanup();
            }
        }
    }
    
    @Override
    public void initialize() {
        System.out.println("plugin " + getName() + " initialise");
    }
    
    @Override
    public void cleanup() {
        System.out.println("plugin " + getName() + " nettoye");
    }
    
    @Override
    public void onPageChanged(String pageName, String previousPage) {
        if (enabled) {
            System.out.println("plugin " + getName() + " - changement de page: " + 
                             (previousPage != null ? previousPage + " -> " : "") + pageName);
        }
    }
}