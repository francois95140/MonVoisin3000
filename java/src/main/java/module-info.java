module com.MonVoisin {
    requires javafx.controls;  // ✅ Ajout manquant !
    requires javafx.fxml;
    requires org.apache.commons.lang3;
    requires jakarta.mail;
    requires io.github.cdimascio.dotenv.java;
    requires java.net.http;
    requires mysql.connector.j;
    requires jbcrypt;
    requires org.jsoup;
    requires javafx.graphics;
    requires com.fasterxml.jackson.databind;
    requires java.desktop;  // ✅ Pour Desktop.getDesktop() dans ConnexionController

    opens application to javafx.fxml;
    exports application;
    opens controller to javafx.fxml;
    exports controller;
    opens services.webscrapper to javafx.fxml;  // ✅ Si vous l'utilisez dans FXML
    exports services.webscrapper;
}