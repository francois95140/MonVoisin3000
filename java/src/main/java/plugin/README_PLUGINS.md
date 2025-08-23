# Système de Plugins - Guide d'utilisation

## Vue d'ensemble

Le système de plugins permet d'étendre les fonctionnalités de l'application de manière modulaire. Chaque plugin peut :
- Être activé/désactivé individuellement
- Recevoir des notifications lors des changements de page
- Exécuter des actions personnalisées selon les pages visitées

## Structure du système

### Classes principales
- `Plugin` : Interface de base pour tous les plugins
- `AbstractPlugin` : Classe abstraite facilitant l'implémentation
- `PluginManager` : Gestionnaire central des plugins (Singleton)
- `PluginController` : Interface graphique de gestion
- `PluginInitializer` : Initialisation des plugins par défaut

### Interface utilisateur
- Bouton "🔌 Plugins" sur la page principale
- Interface de gestion avec table des plugins
- Activation/désactivation par case à cocher
- Boutons pour activer/désactiver tous les plugins

## Comment créer un plugin personnalisé

### 1. Créer la classe du plugin

```java
package plugin.custom;

import plugin.AbstractPlugin;

public class MonPlugin extends AbstractPlugin {
    
    @Override
    public String getName() {
        return "Mon Plugin Personnalisé";
    }
    
    @Override
    public String getVersion() {
        return "1.0.0";
    }
    
    @Override
    public String getDescription() {
        return "Description de ce que fait mon plugin";
    }
    
    @Override
    public void initialize() {
        super.initialize();
        // Code d'initialisation
        System.out.println("Mon plugin initialisé !");
    }
    
    @Override
    public void cleanup() {
        super.cleanup();
        // Nettoyage des ressources
        System.out.println("Mon plugin nettoyé !");
    }
    
    @Override
    public void onPageChanged(String pageName, String previousPage) {
        if (enabled) {
            // Actions à effectuer lors du changement de page
            switch (pageName) {
                case "Main":
                    // Action sur la page principale
                    break;
                case "Plugin":
                    // Action sur la page de plugins
                    break;
                // ... autres pages
            }
        }
    }
}
```

### 2. Enregistrer le plugin

Dans `PluginInitializer.java`, ajoutez votre plugin :

```java
pluginManager.registerPlugin(new MonPlugin());
```

### 3. Pages disponibles

Les pages actuellement détectées :
- `"Accueil"` : Page d'accueil/connexion
- `"Main"` : Tableau de bord principal
- `"Plugin"` : Gestion des plugins
- `"Custom"` : Outil de scraping personnalisé

## Plugins d'exemple fournis

### 1. Page Tracker
- **Nom** : "Page Tracker"
- **Fonction** : Trace tous les changements de page
- **Utilité** : Debugging et audit de navigation

### 2. Welcome Messages
- **Nom** : "Welcome Messages"
- **Fonction** : Affiche des messages de bienvenue
- **Utilité** : Améliorer l'expérience utilisateur
- **Fonctionnalités** : Compte les visites, messages spéciaux

### 3. Performance Monitor
- **Nom** : "Performance Monitor"
- **Fonction** : Monitore le temps passé sur chaque page
- **Utilité** : Analyse des performances et comportements utilisateur
- **Fonctionnalités** : Chronométrage, alertes pour temps élevés

## Utilisation

### Via l'interface graphique
1. Lancez l'application
2. Cliquez sur le bouton "🔌 Plugins" sur la page principale
3. Activez/désactivez les plugins souhaités
4. Utilisez les boutons "Tout Activer" / "Tout Désactiver" au besoin

### Par programmation
```java
PluginManager manager = PluginManager.getInstance();

// Activer un plugin
manager.enablePlugin("Page Tracker");

// Désactiver un plugin
manager.disablePlugin("Welcome Messages");

// Lister les plugins actifs
List<Plugin> activePlugins = manager.getActivePlugins();
```

## Bonnes pratiques

1. **Gestion d'erreurs** : Encapsulez votre code dans des try-catch
2. **Performance** : Évitez les opérations lourdes dans `onPageChanged`
3. **Resources** : Libérez les ressources dans `cleanup()`
4. **Logs** : Utilisez des logs informatifs pour le debugging
5. **Noms uniques** : Donnez des noms uniques à vos plugins

## Extension du système

Le système peut être étendu pour :
- Sauvegarder l'état des plugins (base de données)
- Charger des plugins depuis des fichiers JAR externes
- Interface de configuration avancée par plugin
- API d'événements plus riche (avant/après actions)
- Plugins avec interface graphique intégrée

## Dépannage

### Plugin non visible
- Vérifiez que le plugin est enregistré dans `PluginInitializer`
- Vérifiez les logs de console pour les erreurs

### Plugin ne répond pas
- Vérifiez que le plugin est activé
- Contrôlez la méthode `isEnabled()`
- Vérifiez les exceptions dans les logs