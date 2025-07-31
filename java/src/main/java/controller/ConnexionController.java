package controller;

import application.Main;
import model.User;
import repository.UserRepository;
import javafx.fxml.FXML;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.event.ActionEvent;
import javafx.scene.input.MouseEvent;
import services.alert.Alert;
import services.browser.Browser;


public class ConnexionController {

    @FXML
    private TextField email;

    @FXML
    private PasswordField mdp;

    @FXML
    void connexion(MouseEvent event) {
        String emailText = email.getText().trim();
        String motDePasse = mdp.getText();
        if (emailText.isEmpty() || motDePasse.isEmpty()) {
            Alert.showWarningAlert("erreur", "Veuillez remplir tous les champs");
            return;
        }
        if (!emailText.matches("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$")) {
            Alert.showErrorAlert("erreur", "Format d'email invalide");
            return;
        }
        User user = UserRepository.connect(emailText, motDePasse);
        if (user != null && "admin".equals(user.getRole())) {
            Main.changeScene("Main", new MainController(), "Tableau de bord - Ma Ville");
        } else {
            Alert.showErrorAlert("Accès refusé",
                        user != null ?
                        (
                        "Seuls les administrateurs peuvent accéder à cette application.\n" +
                            "Vérifiez vos identifiants ou contactez un administrateur."
                        ) :
                        (
                        "L'identifiant ou le mot de passe \n" +
                        "ne sont pas correct."
                        )
            );
            mdp.clear();
        }
    }

    @FXML
    void inscription(MouseEvent event) {Browser.open("https://forgottenmessage.monvoisin.con");}

    @FXML
    void forgotpass(ActionEvent event) {Browser.open("https://forgottenmessage.monvoisin.con");}

    @FXML
    void retourAccueil(MouseEvent event) {Main.changeScene("Accueil", new controller.AccueilController(), "Bienvenue - Ma Ville");}

    @FXML
    private void initialize() {
        email.requestFocus();
        mdp.setOnAction(e -> connexion(null));
    }
}