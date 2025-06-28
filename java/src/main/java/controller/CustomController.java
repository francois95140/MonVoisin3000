package controller;

import application.Main;
import javafx.application.Platform;
import javafx.concurrent.Task;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;
import javafx.scene.input.MouseEvent;
import services.bdd.Bdd;

import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.ResourceBundle;

public class CustomController implements Initializable {

    @FXML
    private TextField champVille;

    private boolean rechercheEnCours = false;

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        setupInterface();
    }

    /**
     * Configuration initiale de l'interface
     */
    private void setupInterface() {
        // Configuration du champ ville avec auto-completion simulée
        champVille.setOnKeyPressed(event -> {
            switch (event.getCode()) {
                case ENTER:
                    rechercherActualites(null);
                    break;
                default:
                    break;
            }
        });

        // Focus automatique sur le champ ville
        Platform.runLater(() -> champVille.requestFocus());
    }

    /**
     * Retour à la page d'accueil (connexion)
     */
    @FXML
    private void retourAccueil(MouseEvent event) {
        try {
            Main.changeScene("Accueil", new AccueilController(), "Connexion - Ma Ville");
        } catch (Exception e) {
            showErrorAlert("Erreur de navigation", "Impossible de retourner à l'accueil");
            e.printStackTrace();
        }
    }

    /**
     * Retour au tableau de bord principal
     */
    @FXML
    private void retourDashboard(MouseEvent event) {
        try {
            Main.changeScene("Main", new MainController(), "Tableau de bord - Ma Ville");
        } catch (Exception e) {
            showErrorAlert("Erreur de navigation", "Impossible de retourner au tableau de bord");
            e.printStackTrace();
        }
    }

    /**
     * Déconnexion de l'utilisateur
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
                // Log de déconnexion
                logRechercheEvent("LOGOUT", "Déconnexion depuis la recherche par ville");

                // Redirection vers la page de connexion
                Main.changeScene("Accueil", new AccueilController(), "Connexion - Ma Ville");

            } catch (Exception e) {
                showErrorAlert("Erreur de déconnexion", "Impossible de charger la page de connexion");
                e.printStackTrace();
            }
        }
    }

    /**
     * Recherche des actualités pour la ville saisie
     */
    @FXML
    private void rechercherActualites(MouseEvent event) {
        String ville = champVille.getText().trim();

        if (ville.isEmpty()) {
            showWarningAlert("Ville manquante", "Veuillez saisir le nom d'une ville pour rechercher les actualités.");
            champVille.requestFocus();
            return;
        }

        if (rechercheEnCours) {
            showInfoAlert("Recherche en cours", "Une recherche est déjà en cours. Veuillez patienter.");
            return;
        }

        executerRechercheActualites(ville);
    }

    /**
     * Accès rapide - Paris
     */
    @FXML
    private void villeRapide1(MouseEvent event) {
        champVille.setText("Paris");
        executerRechercheActualites("Paris");
    }

    /**
     * Accès rapide - Lyon
     */
    @FXML
    private void villeRapide2(MouseEvent event) {
        champVille.setText("Lyon");
        executerRechercheActualites("Lyon");
    }

    /**
     * Accès rapide - Marseille
     */
    @FXML
    private void villeRapide3(MouseEvent event) {
        champVille.setText("Marseille");
        executerRechercheActualites("Marseille");
    }

    /**
     * Exécute la recherche d'actualités pour une ville donnée
     */
    private void executerRechercheActualites(String ville) {
        rechercheEnCours = true;

        // Affichage d'un indicateur de chargement
        showInfoAlert("Recherche en cours",
                "Recherche des actualités pour " + ville + " en cours...\nCela peut prendre quelques instants.");

        Task<String> rechercheTask = new Task<String>() {
            @Override
            protected String call() throws Exception {
                return rechercherActualitesVille(ville);
            }

            @Override
            protected void succeeded() {
                Platform.runLater(() -> {
                    rechercheEnCours = false;
                    String resultats = getValue();

                    if (resultats != null && !resultats.isEmpty()) {
                        // Redirection vers une page de résultats ou affichage des résultats
                        afficherResultatsRecherche(ville, resultats);
                    } else {
                        showWarningAlert("Aucun résultat",
                                "Aucune actualité trouvée pour " + ville + ". Essayez avec une autre ville.");
                    }
                });
            }

            @Override
            protected void failed() {
                Platform.runLater(() -> {
                    rechercheEnCours = false;
                    Throwable exception = getException();
                    String errorMessage = exception != null ? exception.getMessage() : "Erreur inconnue";
                    showErrorAlert("Erreur de recherche",
                            "Impossible de rechercher les actualités pour " + ville + ":\n" + errorMessage);
                });
            }
        };

        Thread rechercheThread = new Thread(rechercheTask);
        rechercheThread.setDaemon(true);
        rechercheThread.start();
    }

    /**
     * Recherche les actualités pour une ville spécifique
     */
    private String rechercherActualitesVille(String ville) {
        try {
            System.out.println("🔍 Recherche d'actualités pour: " + ville);

            // Log du début de recherche
            logRechercheEvent("START_SEARCH", "Début recherche pour: " + ville);

            // Simulation du processus de recherche
            // Dans un vrai projet, ici vous feriez appel à vos services de scraping

            // 1. Vérifier si la ville existe en base
            Thread.sleep(1000);
            boolean villeValide = verifierVilleValide(ville);

            if (!villeValide) {
                logRechercheEvent("INVALID_CITY", "Ville non reconnue: " + ville);
                return null;
            }

            // 2. Rechercher dans les sources configurées
            Thread.sleep(2000);
            String resultatsRecherche = effectuerRechercheMultiSources(ville);

            // 3. Sauvegarder la recherche en BDD
            sauvegarderRecherche(ville, resultatsRecherche);

            // Log du succès
            logRechercheEvent("SUCCESS_SEARCH", "Recherche réussie pour: " + ville);

            return resultatsRecherche;

        } catch (Exception e) {
            logRechercheEvent("ERROR_SEARCH", "Erreur recherche pour " + ville + ": " + e.getMessage());
            throw new RuntimeException("Erreur lors de la recherche pour " + ville + ": " + e.getMessage(), e);
        }
    }

    /**
     * Vérifie si la ville est valide (existe dans la base ou dans une liste)
     */
    private boolean verifierVilleValide(String ville) {
        try {
            // Simulation - dans un vrai projet, vérification en base ou via API
            String villeNormalisee = ville.toLowerCase().trim();

            // Liste des villes supportées (exemple)
            String[] villesSupportees = {
                    "paris", "lyon", "marseille", "toulouse", "nice", "nantes",
                    "montpellier", "strasbourg", "bordeaux", "lille", "rennes",
                    "reims", "saint-étienne", "toulon", "grenoble", "dijon"
            };

            for (String villeSupportee : villesSupportees) {
                if (villeNormalisee.contains(villeSupportee) || villeSupportee.contains(villeNormalisee)) {
                    return true;
                }
            }

            // Si la ville n'est pas dans la liste prédéfinie, on peut quand même essayer
            // (pour gérer les petites villes)
            return ville.length() >= 2; // Minimum 2 caractères

        } catch (Exception e) {
            System.err.println("Erreur lors de la vérification de ville: " + e.getMessage());
            return false;
        }
    }

    /**
     * Effectue la recherche sur multiple sources
     */
    private String effectuerRechercheMultiSources(String ville) {
        try {
            StringBuilder resultats = new StringBuilder();

            // Sources simulées
            String[] sources = {
                    "Site actualités local",
                    "Flux RSS municipal",
                    "Réseaux sociaux",
                    "Presse régionale",
                    "Site officiel ville"
            };

            int articlesTotal = 0;

            for (String source : sources) {
                System.out.println("📡 Recherche sur: " + source);
                Thread.sleep(500); // Simulation du temps de traitement

                // Simulation de résultats
                int nbArticles = (int) (Math.random() * 5) + 1; // 1 à 5 articles par source
                articlesTotal += nbArticles;

                resultats.append("Source: ").append(source).append(" - ")
                        .append(nbArticles).append(" article(s) trouvé(s)\n");
            }

            // Résumé final
            resultats.append("\n=== RÉSUMÉ ===\n");
            resultats.append("Ville: ").append(ville).append("\n");
            resultats.append("Total articles: ").append(articlesTotal).append("\n");
            resultats.append("Sources consultées: ").append(sources.length).append("\n");
            resultats.append("Recherche effectuée le: ")
                    .append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm")))
                    .append("\n");

            return resultats.toString();

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la recherche multi-sources: " + e.getMessage(), e);
        }
    }

    /**
     * Sauvegarde la recherche en base de données
     */
    private void sauvegarderRecherche(String ville, String resultats) {
        try {
            if (Main.isBddReady()) {
                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                String query = String.format(
                        "INSERT INTO recherches_ville (ville, resultats, timestamp) VALUES ('%s', '%s', '%s')",
                        ville.replace("'", "''"),
                        resultats.replace("'", "''").substring(0, Math.min(500, resultats.length())), // Limiter la taille
                        timestamp
                );

                Bdd.request("mongo", query);
                System.out.println("✅ Recherche sauvegardée en BDD");
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de la sauvegarde de recherche: " + e.getMessage());
        }
    }

    /**
     * Affiche les résultats de recherche à l'utilisateur
     */
    private void afficherResultatsRecherche(String ville, String resultats) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("Résultats de recherche");
        alert.setHeaderText("Actualités pour " + ville);
        alert.setContentText(resultats);

        // Rendre la boîte de dialogue redimensionnable
        alert.setResizable(true);
        alert.getDialogPane().setPrefSize(600, 400);

        // Ajouter un bouton pour voir plus de détails
        ButtonType voirDetailsButton = new ButtonType("Voir plus de détails");
        ButtonType fermerButton = new ButtonType("Fermer", ButtonBar.ButtonData.CANCEL_CLOSE);

        alert.getButtonTypes().setAll(voirDetailsButton, fermerButton);

        Optional<ButtonType> result = alert.showAndWait();
        if (result.isPresent() && result.get() == voirDetailsButton) {
            // Rediriger vers une page de détails (à créer)
            ouvrirPageDetails(ville, resultats);
        }
    }

    /**
     * Ouvre une page avec les détails des résultats (à implémenter)
     */
    private void ouvrirPageDetails(String ville, String resultats) {
        try {
            // Ici vous pourriez rediriger vers une page de détails
            // Main.changeScene("Resultats", new ResultatsController(ville, resultats), "Résultats - " + ville);

            // Pour l'instant, affichage dans une nouvelle fenêtre d'alerte plus détaillée
            Alert detailAlert = new Alert(Alert.AlertType.INFORMATION);
            detailAlert.setTitle("Détails des actualités");
            detailAlert.setHeaderText("Actualités détaillées pour " + ville);

            TextArea textArea = new TextArea(resultats);
            textArea.setEditable(false);
            textArea.setWrapText(true);
            textArea.setPrefRowCount(20);
            textArea.setPrefColumnCount(80);

            detailAlert.getDialogPane().setContent(textArea);
            detailAlert.setResizable(true);
            detailAlert.showAndWait();

        } catch (Exception e) {
            showErrorAlert("Erreur d'affichage", "Impossible d'afficher les détails");
            e.printStackTrace();
        }
    }

    /**
     * Log un événement de recherche
     */
    private void logRechercheEvent(String type, String message) {
        try {
            if (Main.isBddReady()) {
                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                String query = String.format(
                        "INSERT INTO recherche_log (timestamp, type, message) VALUES ('%s', '%s', '%s')",
                        timestamp, type, message.replace("'", "''")
                );

                Bdd.request("mongo", query);
            }
        } catch (Exception e) {
            System.err.println("Erreur lors du logging de recherche: " + e.getMessage());
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
