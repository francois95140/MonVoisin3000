package application;

import controller.AccueilController;
import javafx.application.Application;
import javafx.concurrent.Task;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;
import plugin.PluginInitializer;
import plugin.PluginManager;
import services.bdd.Bdd;
import services.security.Security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

public class Main extends Application {
    public static Stage stage;
    private static boolean bddInitialized = false;

    @Override
    public void start(Stage stage) throws IOException {
        Main.stage = stage;
        changeScene("Accueil", new AccueilController(), "Bienvenue");
    }

    public static void changeScene(String fxml, Object controller, String title) {
        try {
            // Notifier les plugins du changement de page
            PluginManager.getInstance().notifyPageChanged(fxml);
            
            FXMLLoader fxmlLoader = new FXMLLoader(Main.class.getResource("/fxml/" + fxml + ".fxml"));
            fxmlLoader.setController(controller);
            fxmlLoader.setCharset(StandardCharsets.UTF_8);
            Scene scene = new Scene(fxmlLoader.load());
            scene.getStylesheets().add(Main.class.getResource("/style/main.css").toExternalForm());
            stage.setTitle(title);
            stage.setScene(scene);
            stage.show();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Initialise la BDD de manière asynchrone pour ne pas bloquer l'interface
     */
    public static void initBddAsync() {
        if (bddInitialized) {
            System.out.println("✅ BDD déjà initialisée");
            return;
        }

        Task<Void> bddTask = new Task<Void>() {
            @Override
            protected Void call() throws Exception {
                System.out.println("🔄 Initialisation BDD en arrière-plan...");
                Bdd.initBdd();
                bddInitialized = true;
                System.out.println("✅ BDD initialisée avec succès");
                return null;
            }

            @Override
            protected void failed() {
                System.err.println("❌ Échec de l'initialisation BDD: " + getException().getMessage());
                getException().printStackTrace();
            }
        };

        // Exécuter en arrière-plan
        Thread bddThread = new Thread(bddTask);
        bddThread.setDaemon(true); // Thread daemon pour que l'app puisse se fermer proprement
        bddThread.setName("BDD-Init-Thread");
        bddThread.start();
    }

    /**
     * Initialise la BDD de manière synchrone (bloquante)
     */
    public static void initBddSync() {
        if (bddInitialized) {
            System.out.println("✅ BDD déjà initialisée");
            return;
        }

        System.out.println("🔄 Initialisation BDD...");
        long startTime = System.currentTimeMillis();

        try {
            Bdd.initBdd();
            bddInitialized = true;
            long duration = System.currentTimeMillis() - startTime;
            System.out.println("✅ BDD initialisée en " + duration + "ms");
        } catch (Exception e) {
            System.err.println("❌ Échec de l'initialisation BDD: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Vérifie si la BDD est prête à être utilisée
     */
    public static boolean isBddReady() {
        return bddInitialized && Bdd.isEnvironmentReady();
    }

    /**
     * Force la réinitialisation de la BDD (en cas de problème)
     */
    public static void resetBdd() {
        System.out.println("🔄 Réinitialisation forcée de la BDD...");
        bddInitialized = false;
        Bdd.forceReinit();
        bddInitialized = true;
    }

    public static void main(String[] args) {
        // Configuration de sécurité (rapide)
        Security.setDefaultKey("adupngrx3GXZThd7");

        // Initialiser les plugins
        PluginInitializer.initializeDefaultPlugins();

        // Choix du mode d'initialisation BDD
        boolean asyncInit = true; // Changez en false si vous voulez une init synchrone

        if (asyncInit) {
            // Mode asynchrone : l'interface se lance rapidement, la BDD s'initialise en arrière-plan
            System.out.println("🚀 Lancement en mode asynchrone");
            initBddAsync();
        } else {
            // Mode synchrone : attend que la BDD soit prête avant de lancer l'interface
            System.out.println("🚀 Lancement en mode synchrone");
            initBddSync();
        }

        // Ajouter un hook de fermeture pour nettoyer les plugins
        Runtime.getRuntime().addShutdownHook(new Thread(PluginInitializer::shutdownPlugins));

        // Lancement de l'interface JavaFX
        launch(args);
    }
}