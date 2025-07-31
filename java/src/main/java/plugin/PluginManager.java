package plugin;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Gestionnaire central des plugins de l'application
 */
public class PluginManager {
    
    private static PluginManager instance;
    private Map<String, Plugin> plugins;
    private String currentPage;
    private String previousPage;
    
    private PluginManager() {
        plugins = new HashMap<>();
        currentPage = null;
        previousPage = null;
    }
    
    /**
     * Retourne l'instance unique du PluginManager (Singleton)
     */
    public static PluginManager getInstance() {
        if (instance == null) {
            instance = new PluginManager();
        }
        return instance;
    }
    
    /**
     * Enregistre un nouveau plugin
     */
    public void registerPlugin(Plugin plugin) {
        if (plugin != null && plugin.getName() != null) {
            plugins.put(plugin.getName(), plugin);
            System.out.println("Plugin enregistré: " + plugin.getName() + " v" + plugin.getVersion());
        }
    }
    
    /**
     * Retire un plugin
     */
    public void unregisterPlugin(String pluginName) {
        Plugin plugin = plugins.get(pluginName);
        if (plugin != null) {
            plugin.setEnabled(false); // Désactiver avant de retirer
            plugins.remove(pluginName);
            System.out.println("Plugin retiré: " + pluginName);
        }
    }
    
    /**
     * Active un plugin
     */
    public void enablePlugin(String pluginName) {
        Plugin plugin = plugins.get(pluginName);
        if (plugin != null) {
            plugin.setEnabled(true);
            System.out.println("Plugin activé: " + pluginName);
        }
    }
    
    /**
     * Désactive un plugin
     */
    public void disablePlugin(String pluginName) {
        Plugin plugin = plugins.get(pluginName);
        if (plugin != null) {
            plugin.setEnabled(false);
            System.out.println("Plugin désactivé: " + pluginName);
        }
    }
    
    /**
     * Retourne la liste de tous les plugins
     */
    public List<Plugin> getAllPlugins() {
        return new ArrayList<>(plugins.values());
    }
    
    /**
     * Retourne la liste des plugins actifs
     */
    public List<Plugin> getActivePlugins() {
        return plugins.values().stream()
                .filter(Plugin::isEnabled)
                .toList();
    }
    
    /**
     * Retourne un plugin par son nom
     */
    public Plugin getPlugin(String name) {
        return plugins.get(name);
    }
    
    /**
     * Notifie tous les plugins actifs d'un changement de page
     */
    public void notifyPageChanged(String newPage) {
        this.previousPage = this.currentPage;
        this.currentPage = newPage;
        
        for (Plugin plugin : getActivePlugins()) {
            try {
                plugin.onPageChanged(newPage, previousPage);
            } catch (Exception e) {
                System.err.println("Erreur dans le plugin " + plugin.getName() + 
                                 " lors du changement de page: " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
    
    /**
     * Retourne la page actuelle
     */
    public String getCurrentPage() {
        return currentPage;
    }
    
    /**
     * Retourne la page précédente
     */
    public String getPreviousPage() {
        return previousPage;
    }
    
    /**
     * Nettoie tous les plugins (appelé lors de la fermeture de l'application)
     */
    public void shutdown() {
        for (Plugin plugin : getAllPlugins()) {
            if (plugin.isEnabled()) {
                plugin.setEnabled(false);
            }
        }
        plugins.clear();
        System.out.println("Tous les plugins ont été nettoyés");
    }
}