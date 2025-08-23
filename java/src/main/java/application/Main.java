package application;

import controller.AccueilController;
import javafx.application.Application;
import javafx.concurrent.Task;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.stage.Stage;
import plugin.PluginInitializer;
import plugin.PluginManager;
import services.bdd.BddNew;
import services.security.Security;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.ServiceLoader;

public class Main extends Application {
    public static Stage stage;
    public static boolean theme = false;


    public static void swichTheme() {
        Main.theme = !Main.theme;
        saveThemeConfig();
    }

    private static void saveThemeConfig() {
        try {
            Files.write(Paths.get("theme.config"), String.valueOf(Main.theme).getBytes());
        } catch (Exception e) {
            System.err.println("Erreur sauvegarde: " + e.getMessage());
        }
    }

    public static void loadThemeConfig() {
        try {
            if (Files.exists(Paths.get("theme.config"))) {
                String content = Files.readString(Paths.get("theme.config"));
                Main.theme = Boolean.parseBoolean(content.trim());
            }
        } catch (Exception e) {
            Main.theme = false;
        }
    }

    @Override
    public void start(Stage stage) throws IOException {
        Main.stage = stage;
        changeScene("Accueil", new AccueilController(), "Bienvenue");
    }
    
    public static void changeScene(String fxml, Object controller, String title) {
        try {
            // Notifier les plugins du changement de page
            PluginManager.getInstance().notifyPageChanged(fxml);
            
            FXMLLoader fxmlLoader = new FXMLLoader(Main.class.getResource("/fxml/" + (theme?"dark/":"light/") + fxml + ".fxml"));
            fxmlLoader.setController(controller);
            fxmlLoader.setCharset(StandardCharsets.UTF_8);
            Scene scene = new Scene(fxmlLoader.load());
            
            stage.setTitle(title);
            stage.setScene(scene);
            stage.show();

        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }


    public static void initBddAsync() {


        Task<Void> bddTask = new Task<Void>() {
            @Override
            protected Void call() throws Exception {
                BddNew.initBdd();
                System.out.println("bdd initialisée avec succès");
                return null;
            }
            @Override
            protected void failed() {
                System.out.println("mince alors, la mise en place du microlangage pour la bdd est un echec:\n " + getException().getMessage());
            }
        };

        // Exécuter en arrière-plan
        Thread bddThread = new Thread(bddTask);
        bddThread.setDaemon(true);
        bddThread.setName("BDD-Init-Thread");
        bddThread.start();
    }

    public static void main(String[] args) {
        Security.setDefaultKey("adupngrx3GXZThd7");

        // Initialiser les plugins
        PluginInitializer.initializeDefaultPlugins();

        // Charger la configuration du thème
        loadThemeConfig();

        // Initialisation BDD en arrière-plan
        System.out.println("lancement en mode asynchrone");
        initBddAsync();

        // Ajouter un hook de fermeture pour nettoyer les plugins
        Runtime.getRuntime().addShutdownHook(new Thread(PluginInitializer::shutdownPlugins));

        // Lancement de l'interface JavaFX
        launch(args);
        
    }
}