package controller;

import application.Main;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Label;
import javafx.scene.input.MouseEvent;
import model.Article;
import services.bdd.Bdd;
import services.alert.Alert;
import services.webscrapper.News;

import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.ResourceBundle;

public class MainController implements Initializable {

    @FXML
    private Label derniereCollecte;

    private boolean bddStatusChecked = false;

    private List<Article> articles;

    private final News newsService;

    private final int LIMITE_ARTICLES = 10;


    public MainController(){
        this.newsService = new News();
    }

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        // Initialisation spécifique du MainController
        if (derniereCollecte != null) {
            derniereCollecte.setText("Dernière collecte: " +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        }
    }

    @FXML
    private void accueil(MouseEvent event) {
        Main.changeScene("Main", new MainController(), "Tableau de bord - Ma Ville");
    }

    @FXML
    private void theme(MouseEvent event) {
        Main.swichTheme();
        Main.changeScene("Main", new MainController(), "Main pannel");
    }

    @FXML
    private void deconnexion(MouseEvent event) {
        if (Alert.showConfirmationAlert("Confirmation", "Déconnexion", "Etes vous sur de vouloir vous déconnecter ?")) {
            Main.changeScene("Accueil", new AccueilController(), "accueil");
        }
    }

    @FXML
    private void lancerScrapingComplet(MouseEvent event) {

        this.chargerArticles();

    }

    @FXML
    private void ouvrirOutilScraping(MouseEvent event) {
        Main.changeScene("Custom", new CustomController(), "Outil de WebScraping Personnalisé");
    }

    @FXML
    private void ouvrirGestionnairePlugins(MouseEvent event) {
        //Main.changeScene("Plugins", new PluginController(), "Gestion des plugins");
    }


    private void chargerArticles() {
        try {
            List<String> villes = getVillesDistinctFromUsers();
            StringBuilder jsonBuilder = new StringBuilder("{\"news\":{");

            boolean premierVille = true;
            for (String ville : villes) {
                System.out.println(ville);
                articles = newsService.getNews(ville, LIMITE_ARTICLES);
                if (articles != null && !articles.isEmpty()) {
                    if (!premierVille) jsonBuilder.append(",");
                    premierVille = false;

                    jsonBuilder.append("\"").append(ville.toLowerCase()).append("\":[");
                    for (int i = 0; i < articles.size(); i++) {
                        Article article = articles.get(i);
                        if (i > 0) jsonBuilder.append(",");
                        jsonBuilder.append("{")
                                .append("\"titre\":\"").append(escapeJson(article.getTitre())).append("\",")
                                .append("\"description\":\"").append(escapeJson(article.getDescription())).append("\",")
                                .append("\"url\":\"").append(escapeJson(article.getUrl())).append("\",")
                                .append("\"source\":\"").append(escapeJson(article.getSource())).append("\",")
                                .append("\"datePublication\":\"").append(escapeJson(article.getDatePublication())).append("\",")
                                .append("\"imageUrl\":\"").append(escapeJson(article.getImageUrl())).append("\",")
                                .append("\"tags\":[");

                        List<String> tags = article.getTags();
                        if (tags != null) {
                            for (int j = 0; j < tags.size(); j++) {
                                if (j > 0) jsonBuilder.append(",");
                                jsonBuilder.append("\"").append(escapeJson(tags.get(j))).append("\"");
                            }
                        }
                        jsonBuilder.append("],\"sentiment\":").append(article.getSentiment()).append("}");
                    }
                    jsonBuilder.append("]");
                }
            }
            jsonBuilder.append("}}");

            String mongoResult = Bdd.request("mongo", "INSERT INTO news_collection VALUES ('" + jsonBuilder.toString().replace("'", "\\'") + "')");
            if (mongoResult != null && !mongoResult.startsWith("erreur:")) {
                Alert.showSuccessAlert("Succès", "Articles sauvegardés dans MongoDB");
            }
        } catch (Exception e) {
            Alert.showErrorAlert("erreur", "erreur lors du chargement des articles.");
        }
    }

    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }

    private List<String> getVillesDistinctFromUsers() {
        try {
            String usersResult = Bdd.request("postgres", "SELECT * FROM users");
            if (usersResult == null || usersResult.startsWith("erreur:")) return new ArrayList<>();

            ArrayList<String> toutesLesVilles = new ArrayList<>();
            String[] lignes = usersResult.split("\n");
            for (String ligne : lignes) {
                if (ligne.contains("\"ville\":")) {
                    int debut = ligne.indexOf("\"", ligne.indexOf("\"ville\":") + 9) + 1;
                    int fin = ligne.indexOf("\"", ligne.indexOf("\"", ligne.indexOf("\"ville\":") + 9) + 1);
                    if (debut > 0 && fin > debut) {
                        String ville = ligne.substring(debut, fin);
                        if (!ville.trim().isEmpty()) toutesLesVilles.add(ville);
                    }
                }
            }
            return new ArrayList<>(new HashSet<>(toutesLesVilles));
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

}