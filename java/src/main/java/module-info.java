module com.MonVoisin {
    requires javafx.controls;
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
    requires org.seleniumhq.selenium.support;
    requires org.seleniumhq.selenium.chrome_driver;
    requires io.github.bonigarcia.webdrivermanager;
    requires com.google.gson;

    uses plugin.Plugin;

    opens application to javafx.fxml;
    exports application;
    opens controller to javafx.fxml;
    exports controller;
    opens model to javafx.fxml;
    exports model;
    opens services.webscrapper to javafx.fxml;  // ✅ Si vous l'utilisez dans FXML
    exports services.webscrapper;
    exports plugin;
    opens plugin to javafx.fxml;
}