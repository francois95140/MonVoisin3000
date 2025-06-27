package controller;

import javafx.application.Platform;
import javafx.concurrent.Task;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import javafx.scene.control.Label;
import javafx.scene.input.MouseEvent;

import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.ResourceBundle;

public class MainController implements Initializable {

    @FXML
    private Label derniereCollecte;

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        // Initialiser l'affichage de la dernière collecte
        updateDerniereCollecte();
    }

    /**
     * Met à jour l'affichage de la dernière collecte
     */
    private void updateDerniereCollecte() {
        // Ici vous pouvez récupérer la vraie date depuis votre base de données
        // Pour l'exemple, j'utilise une date fictive
        LocalDateTime maintenant = LocalDateTime.now();
        LocalDateTime derniereDate = maintenant.minusHours(2); // Il y a 2 heures

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm");
        String dateFormatee = derniereDate.format(formatter);

        Platform.runLater(() -> {
            derniereCollecte.setText("Le " + dateFormatee);
        });
    }

    /**
     * Gestionnaire pour le clic sur le logo - retour à l'accueil
     */
    @FXML
    private void accueil(MouseEvent event) {
        try {
            application.Main.changeScene("Main", new MainController(), "Tableau de bord - Ma Ville");
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
        // Confirmation de déconnexion
        Alert alert = new Alert(Alert.AlertType.CONFIRMATION);
        alert.setTitle("Confirmation");
        alert.setHeaderText("Déconnexion");
        alert.setContentText("Êtes-vous sûr de vouloir vous déconnecter ?");

        Optional<ButtonType> result = alert.showAndWait();
        if (result.isPresent() && result.get() == ButtonType.OK) {
            try {
                // Nettoyage de la session utilisateur
                clearUserSession();

                // Redirection vers la page de connexion
                application.Main.changeScene("Connexion", new ConnexionController(), "Connexion");

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
        // Confirmation avant lancement
        Alert confirmAlert = new Alert(Alert.AlertType.CONFIRMATION);
        confirmAlert.setTitle("Lancer le Scraping Complet");
        confirmAlert.setHeaderText("Collecte d'actualités");
        confirmAlert.setContentText("Cette opération peut prendre plusieurs minutes. Continuer ?");

        Optional<ButtonType> result = confirmAlert.showAndWait();
        if (result.isPresent() && result.get() == ButtonType.OK) {

            // Création d'une tâche en arrière-plan pour le scraping
            Task<Void> scrapingTask = new Task<Void>() {
                @Override
                protected Void call() throws Exception {
                    // Mise à jour du message de progression
                    Platform.runLater(() -> {
                        showInfoAlert("Scraping en cours", "La collecte d'actualités a commencé...");
                    });

                    // Simulation du processus de scraping
                    // Remplacez cette partie par votre logique de scraping réelle
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
                        showErrorAlert("Erreur de scraping", "Une erreur s'est produite pendant la collecte.");
                    });
                }
            };

            // Lancement de la tâche dans un thread séparé
            Thread scrapingThread = new Thread(scrapingTask);
            scrapingThread.setDaemon(true);
            scrapingThread.start();
        }
    }

    /**
     * Ouvre l'outil de scraping personnalisé
     */
    @FXML
    private void ouvrirOutilScraping(MouseEvent event) {
        try {
            // Utilisation de changeScene pour ouvrir l'outil de scraping
            application.Main.changeScene("OutilScraping", null, "Outil de WebScraping Personnalisé");

        } catch (Exception e) {
            showErrorAlert("Erreur d'ouverture", "Impossible de charger l'outil de scraping personnalisé");
            e.printStackTrace();
        }
    }

    /**
     * Exécute le processus de scraping complet
     * À remplacer par votre logique métier
     */
    private void executerScrapingComplet() {
        try {
            // Simulation - remplacez par votre logique réelle
            System.out.println("🚀 Début du scraping complet...");

            // Exemple de sources à scraper
            String[] sources = {
                    "Site actualités local 1",
                    "Site actualités local 2",
                    "Réseaux sociaux",
                    "Flux RSS"
            };

            for (String source : sources) {
                System.out.println("📡 Scraping de: " + source);
                Thread.sleep(1000); // Simulation du temps de traitement
            }

            System.out.println("✅ Scraping complet terminé !");

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Scraping interrompu", e);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du scraping: " + e.getMessage(), e);
        }
    }

    /**
     * Nettoie la session utilisateur
     */
    private void clearUserSession() {
        // Implémentez ici la logique de nettoyage de session
        // Par exemple : suppression des tokens, cache, etc.
        System.out.println("Session utilisateur nettoyée");
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

    private void showInfoAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.show(); // Non-bloquant
    }
}