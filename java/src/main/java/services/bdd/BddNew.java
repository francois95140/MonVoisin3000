package services.bdd;

/**
 * Version modernisée de Bdd qui utilise MicrolangageExecutor
 * Fonctionne avec l'exécutable compilé en production et Python en développement
 */
public class BddNew {

    private static boolean initialized = false;

    /**
     * Initialise le système de base de données
     */
    public static void initBdd() {
        if (initialized) {
            System.out.println("✅ Système BDD déjà initialisé");
            return;
        }

        System.out.println("🔧 Initialisation du système BDD...");
        System.out.println(MicrolangageExecutor.getEnvironmentInfo());

        // Tester la disponibilité du microlangage
        if (MicrolangageExecutor.testConnection()) {
            initialized = true;
            System.out.println("✅ Système BDD initialisé avec succès");
        } else {
            System.out.println("❌ Échec de l'initialisation du système BDD");
            throw new RuntimeException("Impossible d'initialiser le microlangage");
        }
    }

    /**
     * Exécute une requête SQL via le microlangage
     */
    public static String request(String databaseType, String query) {
        if (!initialized) {
            initBdd();
        }

        System.out.println("📊 Exécution requête: " + databaseType + " -> " + query);
        return MicrolangageExecutor.executeQuery(databaseType, query);
    }

    /**
     * Version avec debug pour le développement
     */
    public static String requestWithDebug(String databaseType, String query) {
        if (!initialized) {
            initBdd();
        }

        System.out.println("🔍 [DEBUG] Base: " + databaseType);
        System.out.println("🔍 [DEBUG] Requête: " + query);
        System.out.println("🔍 [DEBUG] " + MicrolangageExecutor.getEnvironmentInfo());

        String result = MicrolangageExecutor.executeQuery(databaseType, query);
        System.out.println("🔍 [DEBUG] Résultat: " + result);

        return result;
    }

    /**
     * Vérifie si l'environnement est prêt
     */
    public static boolean isEnvironmentReady() {
        return initialized && MicrolangageExecutor.testConnection();
    }

    /**
     * Force la réinitialisation (pour les cas d'erreur)
     */
    public static void forceReinit() {
        System.out.println("🔄 Réinitialisation forcée du système BDD");
        initialized = false;
        initBdd();
    }

    /**
     * Obtient des informations sur l'environnement
     */
    public static String getEnvironmentInfo() {
        return MicrolangageExecutor.getEnvironmentInfo() + 
               "Initialisé: " + initialized + "\n";
    }

    /**
     * Test de compatibilité
     */
    public static void testCompatibility() {
        System.out.println("=== Test de compatibilité BDD ===");
        System.out.println("OS: " + System.getProperty("os.name"));
        System.out.println("Version: " + System.getProperty("os.version"));
        System.out.println("Architecture: " + System.getProperty("os.arch"));
        System.out.println("Répertoire: " + System.getProperty("user.dir"));
        System.out.println();
        System.out.println(getEnvironmentInfo());
    }

    /**
     * Test principal
     */
    public static void main(String[] args) {
        testCompatibility();
        System.out.println("\n=== Initialisation BDD ===");
        initBdd();
        System.out.println("\n=== Test requête ===");
        String result = requestWithDebug("mongo", "SELECT * FROM conversations_db");
        System.out.println("Résultat final: " + result);
    }
}