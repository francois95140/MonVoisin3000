package controller;

import application.Main;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Label;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.HBox;
import model.Article;
import plugin.PluginManager;
import services.bdd.BddNew;
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
    
    @FXML
    private HBox menuContainer;
    
    @FXML
    private HBox pluginContainer;

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
        
        // Intégration des plugins
        integratePlugins();
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
        try {
            Main.changeScene("Plugin", new PluginController(), "Gestion des plugins");
        } catch (Exception e) {
            Alert.showErrorAlert("Erreur d'ouverture",
                    "Impossible de charger la gestion des plugins: " + e.getMessage());
            e.printStackTrace();
        }
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

            String mongoResult = BddNew.request("mongo", "INSERT INTO news_collection VALUES ('" + jsonBuilder.toString().replace("'", "\\'") + "')");
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
            String usersResult = BddNew.request("postgres", "SELECT * FROM users");
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
    
    /**
     * Intègre les boutons et widgets des plugins dans l'interface
     */
    private void integratePlugins() {
        try {
            PluginManager pluginManager = PluginManager.getInstance();
            
            // Pour chaque plugin actif, essayer d'obtenir ses éléments UI
            for (plugin.Plugin plugin : pluginManager.getActivePlugins()) {
                try {
                    // Si le plugin a une méthode pour obtenir un bouton
                    if (plugin.getClass().getMethod("getGameButton") != null) {
                        Object button = plugin.getClass().getMethod("getGameButton").invoke(plugin);
                        if (button instanceof javafx.scene.control.Button && pluginContainer != null) {
                            pluginContainer.getChildren().add((javafx.scene.control.Button) button);
                            System.out.println("bouton ajoute pour le plugin: " + plugin.getName());
                        }
                    }
                } catch (NoSuchMethodException e) {
                    // Le plugin n'a pas de méthode getGameButton, c'est normal
                } catch (Exception e) {
                    System.err.println("Erreur lors de l'intégration du plugin " + plugin.getName() + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de l'intégration des plugins: " + e.getMessage());
            e.printStackTrace();
        }
    }

}