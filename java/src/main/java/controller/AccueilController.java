package controller;

import java.net.URL;
import java.util.ResourceBundle;

import application.Main;
import javafx.fxml.FXML;
import javafx.scene.input.MouseEvent;
import model.User;

public class AccueilController {

    @FXML
    private ResourceBundle resources;

    @FXML
    private URL location;

    public AccueilController() {}

    @FXML
    void connexion(MouseEvent event) {Main.changeScene("Connexion", new ConnexionController(), "Connectez vous ;)");}

    @FXML
    void initialize() {

    }
}
