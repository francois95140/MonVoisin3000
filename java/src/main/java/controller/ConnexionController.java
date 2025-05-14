package controller;

import application.Main;

import javafx.fxml.FXML;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.event.ActionEvent;

public class ConnexionController {

    @FXML
    private TextField emailField;

    @FXML
    private PasswordField passwordField;

    @FXML
    public void handleLogin() {
        String email = emailField.getText();
        String password = passwordField.getText();

        // for test
        if (email.equals("test@example.com") && password.equals("password123")) {
            System.out.println("Connexion réussie !");
        } else {
            System.out.println("Email ou mot de passe incorrect.");
        }
    }

    
    @FXML
    void motdepasseoublie(ActionEvent event) {
        Main.changeScene("MotDePasseOublie", new MotDePasseOublieController(), "MotDePasseOublie");
    }
}
