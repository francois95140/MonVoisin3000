package controller;

import application.Main;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Label;
import javafx.scene.input.MouseEvent;
import services.bdd.Bdd;
import services.alert.Alert;

import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ResourceBundle;

public class MainController implements Initializable {

    @FXML
    private Label derniereCollecte;

    private boolean bddStatusChecked = false;

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        // Initialisation spécifique du MainController
        if (derniereCollecte != null) {
            derniereCollecte.setText("Dernière collecte: " +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        }
    }

    @FXML
    private void accueil(MouseEvent event) {
        Main.changeScene("Main", new MainController(), "Tableau de bord - Ma Ville");
    }

    @FXML
    private void theme(MouseEvent event) {
        Main.swichTheme();
        Main.changeScene("Main", new MainController(), "Main pannel");
    }

    @FXML
    private void deconnexion(MouseEvent event) {
        if (Alert.showConfirmationAlert("Confirmation", "Déconnexion", "Etes vous sur de vouloir vous déconnecter ?")) {
            Main.changeScene("Accueil", new AccueilController(), "accueil");
        }
    }

    @FXML
    private void lancerScrapingComplet(MouseEvent event) {
        if (Alert.showConfirmationAlert("Lancer le Scraping Complet", "Collecte d'actualités", "Cette opération peut prendre plusieurs minutes. Continuer ?")) {
            Bdd.request("postgres", "select ville from users");
            System.out.println("scrap");
        }
    }

    @FXML
    private void ouvrirOutilScraping(MouseEvent event) {
        Main.changeScene("Custom", new CustomController(), "Outil de WebScraping Personnalisé");
    }

    @FXML
    private void ouvrirGestionnairePlugins(MouseEvent event) {
        Main.changeScene("Plugins", new PluginController(), "Gestion des plugins");
    }
}