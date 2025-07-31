package controller;

import application.Main;
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;
import javafx.scene.input.MouseEvent;
import javafx.util.Duration;
import services.webscrapper.News;
import services.alert.Alert;

import java.net.URL;
import java.util.Optional;
import java.util.ResourceBundle;

import static javafx.scene.input.KeyCode.ENTER;

public class CustomController implements Initializable {

    @FXML
    private TextField champVille;

    @FXML
    private Button boutonRechercher;

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        champVille.setOnKeyPressed(event -> {if (event.getCode() == ENTER){rechercherActualites(null);}});
        Platform.runLater(() -> champVille.requestFocus());
    }

    @FXML
    private void retourAccueil(MouseEvent event) {Main.changeScene("Accueil", new AccueilController(), "Connexion - Ma Ville");}

    @FXML
    private void retourDashboard(MouseEvent event) {Main.changeScene("Main", new MainController(), "Tableau de bord - Ma Ville");}

    @FXML
    private void deconnexion(MouseEvent event) {
        if (Alert.showConfirmationAlert("Confirmation", "Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?")) {Main.changeScene("Accueil", new AccueilController(), "Connexion - Ma Ville");}
    }

    @FXML
    private void rechercherActualites(MouseEvent event) {executerRechercheActualites(champVille.getText().trim());}

    @FXML
    private void villeRapide1(MouseEvent event) {executerRechercheActualites("Paris");}

    @FXML
    private void villeRapide2(MouseEvent event) {executerRechercheActualites("Lyon");}

    @FXML
    private void villeRapide3(MouseEvent event) {executerRechercheActualites("Marseille");}

    private void executerRechercheActualites(String sujet) {
        champVille.setDisable(true);
        champVille.setText(sujet + " Chargement...");
        boutonRechercher.setDisable(true);
        boutonRechercher.setText("Chargement...");
            Timeline timeline = new Timeline(new KeyFrame(Duration.millis(100), e -> {Main.changeScene("View", new ViewController(sujet), "Résultats d'articles pour: " + sujet);}));
            timeline.play();
    }


}