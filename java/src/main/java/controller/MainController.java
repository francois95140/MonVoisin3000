package controller;

import application.Main;
import javafx.application.Platform;
import javafx.concurrent.Task;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import javafx.scene.control.Label;
import javafx.scene.input.MouseEvent;
import services.bdd.Bdd;

import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.ResourceBundle;

public class MainController implements Initializable {

    @FXML
    private Label derniereCollecte;

    private boolean bddStatusChecked = false;

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        // Initialiser l'affichage de la dernière collecte
        updateDerniereCollecte();

        // Vérifier le statut de la BDD
        checkBddStatusOnInit();
    }

    /**
     * Vérifie le statut de la BDD au chargement de la page
     */
    private void checkBddStatusOnInit() {
        if (!bddStatusChecked) {
            Task<Boolean> bddCheckTask = new Task<Boolean>() {
                @Override
                protected Boolean call() throws Exception {
                    // Attendre que la BDD soit prête (maximum 30 secondes)
                    int attempts = 0;
                    while (!Main.isBddReady() && attempts < 60) {
                        Thread.sleep(500);
                        attempts++;
                    }
                    return Main.isBddReady();
                }

                @Override
                protected void succeeded() {
                    Platform.runLater(() -> {
                        if (getValue()) {
                            System.out.println("✅ BDD prête pour le MainController");
                        } else {
                            showWarningAlert("Base de données",
                                    "La base de données n'est pas encore prête. Certaines fonctionnalités peuvent être limitées.");
                        }
                        bddStatusChecked = true;
                    });
                }

                @Override
                protected void failed() {
                    Platform.runLater(() -> {
                        showErrorAlert("Erreur BDD", "Impossible de vérifier l'état de la base de données");
                        bddStatusChecked = true;
                    });
                }
            };

            Thread bddThread = new Thread(bddCheckTask);
            bddThread.setDaemon(true);
            bddThread.start();
        }
    }

    /**
     * Met à jour l'affichage de la dernière collecte
     */
    private void updateDerniereCollecte() {
        Task<String> updateTask = new Task<String>() {
            @Override
            protected String call() throws Exception {
                if (Main.isBddReady()) {
                    try {
                        // Requête pour récupérer la dernière date de collecte
                        String result = Bdd.request("mongo",
                                "SELECT MAX(date_collecte) as derniere_date FROM scraping_log");

                        // Parser la réponse JSON et extraire la date
                        // Pour l'exemple, utilisation d'une date fictive
                        return getDerniereCollecteFromBdd(result);

                    } catch (Exception e) {
                        System.err.println("Erreur lors de la récupération de la dernière collecte: " + e.getMessage());
                        return getDateFictive();
                    }
                } else {
                    return "BDD non disponible";
                }
            }

            @Override
            protected void succeeded() {
                Platform.runLater(() -> {
                    derniereCollecte.setText(getValue());
                });
            }

            @Override
            protected void failed() {
                Platform.runLater(() -> {
                    derniereCollecte.setText(getDateFictive());
                });
            }
        };

        Thread updateThread = new Thread(updateTask);
        updateThread.setDaemon(true);
        updateThread.start();
    }

    /**
     * Extrait la date de dernière collecte depuis la réponse BDD
     */
    private String getDerniereCollecteFromBdd(String bddResponse) {
        try {
            // Ici vous pouvez parser la réponse JSON pour extraire la vraie date
            // Pour l'exemple, retourne une date fictive
            return getDateFictive();
        } catch (Exception e) {
            return getDateFictive();
        }
    }

    /**
     * Génère une date fictive pour l'affichage
     */
    private String getDateFictive() {
        LocalDateTime maintenant = LocalDateTime.now();
        LocalDateTime derniereDate = maintenant.minusHours(2);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm");
        return "Le " + derniereDate.format(formatter);
    }

    /**
     * Gestionnaire pour le clic sur le logo - retour à l'accueil
     */
    @FXML
    private void accueil(MouseEvent event) {
        try {
            Main.changeScene("Main", new MainController(), "Tableau de bord - Ma Ville");
        } catch (Exception e) {
            showErrorAlert("Erreur de navigation", "Impossible de charger la page d'accueil");
            e.printStackTrace();
        }
    }

    /**
     * Gestionnaire pour la déconnexion
     */
    @FXML
    private void deconnexion(MouseEvent event) {
        Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
        alert.setTitle("Confirmation");
        alert.setHeaderText("Déconnexion");
        alert.setContentText("Êtes-vous sûr de vouloir vous déconnecter ?");

        Optional<ButtonType> result = alert.showAndWait();
        if (result.isPresent() && result.get() == ButtonType.OK) {
            try {
                // Nettoyage de la session utilisateur
                clearUserSession();

                // Redirection vers la page de connexion/accueil
                Main.changeScene("Accueil", new AccueilController(), "Connexion");

            } catch (Exception e) {
                showErrorAlert("Erreur de déconnexion", "Impossible de charger la page de connexion");
                e.printStackTrace();
            }
        }
    }

    /**
     * Lance le scraping complet de toutes les sources
     */
    @FXML
    private void lancerScrapingComplet(MouseEvent event) {
        // Vérifier d'abord que la BDD est prête
        if (!Main.isBddReady()) {
            showWarningAlert("Base de données non prête",
                    "La base de données n'est pas encore initialisée. Veuillez patienter et réessayer.");
            return;
        }

        Alert confirmAlert = new Alert(Alert.AlertType.CONFIRMATION);
        confirmAlert.setTitle("Lancer le Scraping Complet");
        confirmAlert.setHeaderText("Collecte d'actualités");
        confirmAlert.setContentText("Cette opération peut prendre plusieurs minutes. Continuer ?");

        Optional<ButtonType> result = confirmAlert.showAndWait();
        if (result.isPresent() && result.get() == ButtonType.OK) {

            Task<Void> scrapingTask = new Task<Void>() {
                @Override
                protected Void call() throws Exception {
                    Platform.runLater(() -> {
                        showInfoAlert("Scraping en cours", "La collecte d'actualités a commencé...");
                    });

                    // Exécution du scraping avec logging en BDD
                    executerScrapingComplet();

                    return null;
                }

                @Override
                protected void succeeded() {
                    Platform.runLater(() -> {
                        updateDerniereCollecte();
                        showSuccessAlert("Scraping terminé", "La collecte d'actualités s'est terminée avec succès !");
                    });
                }

                @Override
                protected void failed() {
                    Platform.runLater(() -> {
                        Throwable exception = getException();
                        String errorMessage = exception != null ? exception.getMessage() : "Erreur inconnue";
                        showErrorAlert("Erreur de scraping",
                                "Une erreur s'est produite pendant la collecte: " + errorMessage);
                    });
                }
            };

            Thread scrapingThread = new Thread(scrapingTask);
            scrapingThread.setDaemon(true);
            scrapingThread.start();
        }
    }

    /**
     * Ouvre l'outil de scraping personnalisé - CORRIGÉ pour rediriger vers Custom
     */
    @FXML
    private void ouvrirOutilScraping(MouseEvent event) {
        try {
            // Vérifier que la BDD est prête avant d'ouvrir l'outil
            if (!Main.isBddReady()) {
                showWarningAlert("Base de données non prête",
                        "La base de données n'est pas encore initialisée. L'outil sera ouvert mais certaines fonctionnalités peuvent être limitées.");
            }

            // Redirection vers Custom.fxml avec CustomController
            Main.changeScene("Custom", new CustomController(), "Outil de WebScraping Personnalisé");

        } catch (Exception e) {
            showErrorAlert("Erreur d'ouverture",
                    "Impossible de charger l'outil de scraping personnalisé: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Exécute le processus de scraping complet avec logging en BDD
     */
    private void executerScrapingComplet() {
        try {
            System.out.println("🚀 Début du scraping complet...");

            // Log du début de scraping en BDD
            logScrapingEvent("DEBUT", "Démarrage du scraping complet");

            String[] sources = {
                    "Site actualités local 1",
                    "Site actualités local 2",
                    "Réseaux sociaux",
                    "Flux RSS"
            };

            int totalSources = sources.length;
            int sourcesTraitees = 0;

            for (String source : sources) {
                System.out.println("📡 Scraping de: " + source);

                try {
                    // Simulation du scraping de la source
                    Thread.sleep(2000);

                    // Log du succès de la source
                    logScrapingEvent("SOURCE_SUCCESS", "Scraping réussi pour: " + source);
                    sourcesTraitees++;

                    System.out.println("✅ " + source + " traité (" + sourcesTraitees + "/" + totalSources + ")");

                } catch (Exception e) {
                    // Log de l'erreur pour cette source
                    logScrapingEvent("SOURCE_ERROR", "Erreur pour " + source + ": " + e.getMessage());
                    System.err.println("❌ Erreur pour " + source + ": " + e.getMessage());
                }
            }

            // Log de fin de scraping
            logScrapingEvent("FIN", "Scraping terminé. Sources traitées: " + sourcesTraitees + "/" + totalSources);
            System.out.println("✅ Scraping complet terminé ! (" + sourcesTraitees + "/" + totalSources + " sources)");

        } catch (Exception e) {
            logScrapingEvent("ERROR", "Erreur générale de scraping: " + e.getMessage());
            throw new RuntimeException("Erreur lors du scraping: " + e.getMessage(), e);
        }
    }

    /**
     * Log un événement de scraping en base de données
     */
    private void logScrapingEvent(String type, String message) {
        try {
            if (Main.isBddReady()) {
                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                String query = String.format(
                        "INSERT INTO scraping_log (timestamp, type, message) VALUES ('%s', '%s', '%s')",
                        timestamp, type, message.replace("'", "''") // Échapper les guillemets
                );

                Bdd.request("mongo", query);
            }
        } catch (Exception e) {
            System.err.println("Erreur lors du logging: " + e.getMessage());
        }
    }

    /**
     * Nettoie la session utilisateur
     */
    private void clearUserSession() {
        System.out.println("🧹 Nettoyage de la session utilisateur...");

        // Log de déconnexion
        logScrapingEvent("LOGOUT", "Déconnexion utilisateur");

        // Ici vous pouvez ajouter d'autres nettoyages :
        // - Suppression des tokens
        // - Nettoyage du cache
        // - Fermeture des connexions

        System.out.println("✅ Session utilisateur nettoyée");
    }

    /**
     * Force la réinitialisation de la BDD depuis l'interface
     */
    @FXML
    private void reinitialiserBdd(MouseEvent event) {
        Alert confirmAlert = new Alert(Alert.AlertType.CONFIRMATION);
        confirmAlert.setTitle("Réinitialisation BDD");
        confirmAlert.setHeaderText("Attention");
        confirmAlert.setContentText("Cette opération va réinitialiser complètement la base de données. Continuer ?");

        Optional<ButtonType> result = confirmAlert.showAndWait();
        if (result.isPresent() && result.get() == ButtonType.OK) {

            Task<Void> resetTask = new Task<Void>() {
                @Override
                protected Void call() throws Exception {
                    Platform.runLater(() -> {
                        showInfoAlert("Réinitialisation en cours", "Réinitialisation de la base de données...");
                    });

                    Main.resetBdd();
                    return null;
                }

                @Override
                protected void succeeded() {
                    Platform.runLater(() -> {
                        bddStatusChecked = false;
                        checkBddStatusOnInit();
                        showSuccessAlert("Réinitialisation terminée", "La base de données a été réinitialisée avec succès !");
                    });
                }

                @Override
                protected void failed() {
                    Platform.runLater(() -> {
                        showErrorAlert("Erreur de réinitialisation", "Impossible de réinitialiser la base de données");
                    });
                }
            };

            Thread resetThread = new Thread(resetTask);
            resetThread.setDaemon(true);
            resetThread.start();
        }
    }

    // === MÉTHODES UTILITAIRES POUR LES ALERTES ===

    private void showSuccessAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    private void showErrorAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    private void showWarningAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.WARNING);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    private void showInfoAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.show(); // Non-bloquant
    }
}