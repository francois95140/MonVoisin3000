package controller;

import javafx.fxml.FXML;
import javafx.scene.control.TextField;

public class MotDePasseOublieController {

    @FXML
    private TextField emailField;

    @FXML
    public void handleSend() {
        String email = emailField.getText();

        // envoyer l'email ici
        System.out.println("Un lien de réinitialisation a été envoyé à " + email);
    }
}
