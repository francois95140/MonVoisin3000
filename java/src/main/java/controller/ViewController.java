package controller;

import application.Main;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.effect.DropShadow;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.input.Clipboard;
import javafx.scene.input.ClipboardContent;
import model.Article;
import services.alert.Alert;
import services.browser.Browser;
import services.webscrapper.News;

import java.awt.Desktop;
import java.net.URI;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.ResourceBundle;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ViewController implements Initializable {

    private static final Logger LOGGER = Logger.getLogger(ViewController.class.getName());
    private static final int LIMITE_ARTICLES = 5;

    @FXML private Label villeSelectionnee;
    @FXML private Label nomVilleTitre;
    @FXML private Label nombreArticles;
    @FXML private Label derniereMAJ;
    @FXML private VBox articlesContainer;

    private final String sujet;
    private List<Article> articles;
    private final News newsService;

    public ViewController(String sujet) {
        this.sujet = sujet;
        this.newsService = new News();
    }

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        // Initialiser les labels avec le sujet
        villeSelectionnee.setText("Articles pour " + sujet);
        nomVilleTitre.setText("Actualités de " + sujet);

        // Charger les articles
        chargerArticles();
    }

    private void chargerArticles() {
        try {
            articles = newsService.getNews(sujet, LIMITE_ARTICLES);
            nombreArticles.setText(articles.size() + " articles trouvés");
            derniereMAJ.setText("Dernière mise à jour : " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

            // Vider le conteneur et ajouter les nouveaux articles
            articlesContainer.getChildren().clear();

            if (articles.isEmpty()) {
                articlesContainer.getChildren().add(creerPaneArticle(new Article("Aucun article trouvé...","", "","","", "", null,  0), 0));
            } else {
                for (int i = 0; i < articles.size(); i++) {articlesContainer.getChildren().add(creerPaneArticle(articles.get(i), i));}
            }

        } catch (Exception e) {
            Alert.showErrorAlert("erreur", "erreur lors du chargement des articles.");
        }
    }

    private Pane creerPaneArticle(Article article, int index) {
        Pane articlePane = new Pane();
        articlePane.setPrefHeight(180.0);
        articlePane.setPrefWidth(910.0);
        articlePane.setStyle("-fx-background-color: " + (Main.theme ? "#1e1e2e90" : "#ffffff95") + "; -fx-background-radius: 15;");

        HBox hbox = new HBox();
        hbox.setAlignment(Pos.CENTER_LEFT);
        hbox.setFillHeight(false);
        hbox.setPrefHeight(180.0);
        hbox.setPrefWidth(910.0);
        hbox.setSpacing(20.0);
        hbox.setPadding(new Insets(20));

        VBox contentBox = new VBox();
        contentBox.setAlignment(Pos.TOP_LEFT);
        contentBox.setPrefWidth(650.0);
        contentBox.setSpacing(10.0);

        Label titreLabel = new Label(article.getTitre());
        titreLabel.setStyle("-fx-font-family: sans-serif; -fx-text-fill: " + (Main.theme ? "#ffffff" : "#333333") + "; " +
                "-fx-font-weight: bold; -fx-font-size: 18px;");
        titreLabel.setWrapText(true);

        Label descriptionLabel = new Label(article.getShortDescription(200));
        descriptionLabel.setPrefWidth(630.0);
        descriptionLabel.setStyle("-fx-font-family: sans-serif; -fx-text-fill: " + (Main.theme ? "#cccccc" : "#333333") + "; " +
                "-fx-font-size: 14px;");
        descriptionLabel.setWrapText(true);

        HBox metaBox = new HBox();
        metaBox.setAlignment(Pos.CENTER_LEFT);
        metaBox.setSpacing(20.0);

        Label dateLabel = new Label("📅 " + article.getDatePublication());
        dateLabel.setStyle("-fx-font-family: sans-serif; -fx-text-fill: " + (Main.theme ? "#9ca3af" : "#555555") + "; -fx-font-size: 12px;");

        Label sourceLabel = new Label("📰 " + article.getSource());
        sourceLabel.setStyle("-fx-font-family: sans-serif; -fx-text-fill: " + (Main.theme ? "#9ca3af" : "#555555") + "; -fx-font-size: 12px;");

        String tagColor = article.getColorForSentiment();
        Label tagLabel = new Label("🏷️ " + article.getSentimentEmoji() + " " +
                (article.getTags().isEmpty() ? "Général" : article.getTags().get(0)));
        tagLabel.setStyle("-fx-font-family: sans-serif; -fx-text-fill: " + tagColor + "; " +
                "-fx-font-weight: bold; -fx-font-size: 12px;");

        metaBox.getChildren().addAll(dateLabel, sourceLabel, tagLabel);
        contentBox.getChildren().addAll(titreLabel, descriptionLabel, metaBox);

        VBox actionBox = new VBox();
        actionBox.setAlignment(Pos.CENTER);
        actionBox.setSpacing(10.0);

        Button voirPlusBtn = new Button("En savoir plus");
        voirPlusBtn.setPrefHeight(45.0);
        voirPlusBtn.setPrefWidth(180.0);
        voirPlusBtn.setStyle("-fx-font-family: sans-serif; " +
                "-fx-background-color: linear-gradient(to right, " + (Main.theme ? "#4a69bd, #6c5ce7" : "#667eea, #764ba2") + "); " +
                "-fx-background-radius: 22; -fx-border-radius: 22; " +
                "-fx-cursor: hand; -fx-text-fill: white; " +
                "-fx-font-weight: bold; -fx-font-size: 14px;");
        voirPlusBtn.setEffect(new DropShadow(8.0, Color.web(Main.theme ? "#4a69bd80" : "#667eea40")));
        voirPlusBtn.setOnMouseClicked(e -> Browser.open(article.getUrl()));

        Button partagerBtn = new Button("Partager");
        partagerBtn.setPrefHeight(35.0);
        partagerBtn.setPrefWidth(180.0);
        partagerBtn.setStyle("-fx-font-family: sans-serif; " +
                "-fx-background-color: transparent; " +
                "-fx-border-color: " + (Main.theme ? "#4a69bd" : "#667eea") + "; -fx-border-width: 1; " +
                "-fx-border-radius: 18; -fx-background-radius: 18; " +
                "-fx-cursor: hand; -fx-text-fill: " + (Main.theme ? "#4a69bd" : "#667eea") + "; " +
                "-fx-font-size: 12px;");
        partagerBtn.setOnMouseClicked(e -> partagerArticle(article));

        actionBox.getChildren().addAll(voirPlusBtn, partagerBtn);
        hbox.getChildren().addAll(contentBox, actionBox);
        articlePane.getChildren().add(hbox);

        articlePane.setEffect(new DropShadow(10.0, Color.web(Main.theme ? "#00000040" : "#00000015")));

        return articlePane;
    }


    private void partagerArticle(Article article) {
        Clipboard clipboard = Clipboard.getSystemClipboard();
        ClipboardContent content = new ClipboardContent();
        content.putString(article.getUrl());
        clipboard.setContent(content);

        Alert.showSuccessAlert("Copié avec succès", "Le lien de l'article a été copié avec succès !!");
    }

    @FXML
    private void retourAccueil(MouseEvent event) {Main.changeScene("Main", new MainController(), "Main");}

    @FXML
    private void retourDashboard(MouseEvent event) {Main.changeScene("Custom", new CustomController(), "Outil de WebScraping Personnalisé");}

    @FXML
    private void deconnexion(MouseEvent event) {Main.changeScene("Accueil", new AccueilController(), "accueil");}

}