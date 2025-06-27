package controller;

import application.Main;
import model.User;
import repository.UserRepository;
import javafx.fxml.FXML;
import javafx.scene.control.Alert;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.event.ActionEvent;
import javafx.scene.input.MouseEvent;
import services.bdd.Bdd;

import java.awt.Desktop;
import java.net.URI;
import java.io.IOException;

public class ConnexionController {

    @FXML
    private TextField email;

    @FXML
    private PasswordField mdp;

    @FXML
    void connexion(MouseEvent event) {
        String emailText = email.getText().trim();
        String motDePasse = mdp.getText();

        // Validation des champs
        if (emailText.isEmpty() || motDePasse.isEmpty()) {
            showAlert("Erreur", "Veuillez remplir tous les champs", Alert.AlertType.WARNING);
            return;
        }

        // Validation format email
        if (!isValidEmail(emailText)) {
            showAlert("Erreur", "Format d'email invalide", Alert.AlertType.WARNING);
            return;
        }

        // Tentative de connexion
        if (authenticateUser(emailText, motDePasse)) {
            try {
                // Redirection vers le dashboard après connexion réussie
                // TODO: Remplacer par votre contrôleur Dashboard
                Main.changeScene("Main", new MainController(), "Tableau de bord - Ma Ville");
            } catch (Exception e) {
                showAlert("Erreur", "Impossible de charger le tableau de bord", Alert.AlertType.ERROR);
                e.printStackTrace();
            }
        } else {
            showAlert("Accès refusé",
                    "Seuls les administrateurs peuvent accéder à cette application.\n" +
                            "Vérifiez vos identifiants ou contactez un administrateur.",
                    Alert.AlertType.ERROR);

            // Vider le champ mot de passe pour la sécurité
            mdp.clear();
        }
    }

    @FXML
    void forgotpass(ActionEvent event) {
        String url = "https://forgottenmessage.monvoisin.con";

        try {
            // Essayer d'abord avec Desktop si supporté
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(new URI(url));
            } else {
                // Fallback pour Linux
                Runtime.getRuntime().exec("xdg-open " + url);
            }
        } catch (Exception e) {
            // Si tout échoue, afficher l'URL à l'utilisateur
            showAlert("Accès au lien",
                    "Veuillez copier et coller ce lien dans votre navigateur :\n\n" + url,
                    Alert.AlertType.INFORMATION);
        }
    }


    @FXML
    void retourAccueil(MouseEvent event) {
        try {
            Main.changeScene("Accueil", new controller.AccueilController(), "Bienvenue - Ma Ville");
        } catch (Exception e) {
            showAlert("Erreur", "Impossible de retourner à l'accueil", Alert.AlertType.ERROR);
            e.printStackTrace();
        }
    }

    /**
     * Méthode d'authentification des utilisateurs
     * Seuls les utilisateurs avec le rôle ADMIN peuvent se connecter
     */
    private boolean authenticateUser(String email, String password) {
        try {
            // Utiliser le UserRepository pour la connexion
            User user = UserRepository.connect(email, password);

            if (user != null) {
                // Vérifier que l'utilisateur a le rôle ADMIN
                if ("admin".equals(user.getRole())) {
                    System.out.println("Connexion admin réussie: " + user.getPseudo() + " (" + user.getEmail() + ")");
                    return true;
                } else {
                    System.out.println("Accès refusé: l'utilisateur " + user.getPseudo() + " n'a pas les droits administrateur");
                    return false;
                }
            } else {
                System.out.println("Identifiant ou mot de passe incorrect");
            }

            return false;

        } catch (Exception e) {
            System.err.println("Erreur lors de l'authentification: " + e.getMessage());
            return false;
        }
    }

    /**
     * Validation du format email
     */
    private boolean isValidEmail(String email) {
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$";
        return email.matches(emailRegex);
    }

    /**
     * Affichage des alertes
     */
    private void showAlert(String title, String message, Alert.AlertType type) {
        Alert alert = new Alert(type);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    /**
     * Méthode appelée lors de l'initialisation du contrôleur
     * Utile pour configurer des éléments par défaut
     */
    @FXML
    private void initialize() {
        // Optionnel : Focus automatique sur le champ email
        if (email != null) {
            email.requestFocus();
        }

        // Optionnel : Connexion avec la touche Entrée
        if (mdp != null) {
            mdp.setOnAction(e -> connexion(null));
        }


    }
}