package services.browser;



import java.awt.*;
import java.net.URI;
import services.alert.Alert;

public class Browser {

    public static void open(String url) {

        try {
            // Essayer dabord avec desktop si supporté
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(new URI(url));
            } else {
                // pour Linux
                Runtime.getRuntime().exec("xdg-open " + url);
            }
        } catch (Exception e) {
            Alert.showInfoAlert("Accès au lien", "Veuillez copier et coller ce lien dans votre navigateur :\n\n" + url);
        }
    }
}
