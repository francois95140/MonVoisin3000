package controller;

import application.Main;

import javafx.fxml.FXML;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.event.ActionEvent;
import javafx.scene.input.MouseEvent;

public class ConnexionController {

    @FXML
    private TextField email;

    @FXML
    private PasswordField mdp;

    @FXML
    void connexion(MouseEvent event) {

    }

    @FXML
    void forgotpass(ActionEvent event) {
        Main.changeScene("MotDePasseOublie", new MotDePasseOublieController(), "MotDePasseOublie");

    }

}
