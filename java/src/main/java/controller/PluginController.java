package controller;

import application.Main;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.*;
import javafx.scene.control.cell.CheckBoxTableCell;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.input.DragEvent;
import javafx.scene.input.Dragboard;
import javafx.scene.input.MouseEvent;
import javafx.scene.input.TransferMode;
import javafx.scene.layout.Pane;
import javafx.stage.FileChooser;
import plugin.Plugin;
import plugin.PluginManager;
import services.alert.Alert;

import java.io.File;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ServiceLoader;

import java.net.URL;
import java.util.ResourceBundle;

/**
 * Contrôleur pour la gestion des plugins
 */
public class PluginController implements Initializable {

    @FXML
    private TableView<PluginTableRow> pluginTable;
    
    @FXML
    private TableColumn<PluginTableRow, Boolean> enabledColumn;
    
    @FXML
    private TableColumn<PluginTableRow, String> nameColumn;
    
    @FXML
    private TableColumn<PluginTableRow, String> versionColumn;
    
    @FXML
    private TableColumn<PluginTableRow, String> descriptionColumn;
    
    @FXML
    private Button refreshButton;
    
    @FXML
    private Button enableAllButton;
    
    @FXML
    private Button disableAllButton;
    
    @FXML
    private Label statusLabel;
    
    @FXML
    private Button dragDropArea;
    
    @FXML
    private Label selectedPluginTitle;
    
    @FXML
    private Label selectedPluginDescription;
    
    @FXML
    private Label selectedPluginVersion;
    
    @FXML
    private Button toggleButton;
    
    @FXML
    private Label activePluginsCount;
    
    @FXML
    private Label inactivePluginsCount;
    
    @FXML
    private Label totalPluginsCount;

    private ObservableList<PluginTableRow> pluginData;
    private PluginManager pluginManager;
    private Plugin selectedPlugin;

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        pluginManager = PluginManager.getInstance();
        pluginData = FXCollections.observableArrayList();
        
        setupTable();
        setupDragAndDrop();
        loadPlugins();
        updateStatus();
        updateStatistics();
    }

    private void setupTable() {
        // Configuration des colonnes
        enabledColumn.setCellValueFactory(new PropertyValueFactory<>("enabled"));
        enabledColumn.setCellFactory(CheckBoxTableCell.forTableColumn(enabledColumn));
        enabledColumn.setEditable(true);
        
        nameColumn.setCellValueFactory(new PropertyValueFactory<>("name"));
        versionColumn.setCellValueFactory(new PropertyValueFactory<>("version"));
        descriptionColumn.setCellValueFactory(new PropertyValueFactory<>("description"));
        
        // Rendre la table éditable
        pluginTable.setEditable(true);
        pluginTable.setItems(pluginData);
        
        // Listener pour la sélection de plugins
        pluginTable.getSelectionModel().selectedItemProperty().addListener((obs, oldSelection, newSelection) -> {
            if (newSelection != null) {
                selectedPlugin = pluginManager.getPlugin(newSelection.getName());
                updateSelectedPluginDetails();
            }
        });
    }

    private void loadPlugins() {
        pluginData.clear();
        
        for (Plugin plugin : pluginManager.getAllPlugins()) {
            PluginTableRow row = new PluginTableRow(plugin);
            
            // Listener pour les changements d'état
            row.enabledProperty().addListener((obs, oldVal, newVal) -> {
                if (newVal != null) {
                    plugin.setEnabled(newVal);
                    updateStatus();
                }
            });
            
            pluginData.add(row);
        }
        
        updateStatus();
        updateStatistics();
    }

    private void updateStatus() {
        int total = pluginManager.getAllPlugins().size();
        int active = pluginManager.getActivePlugins().size();
        if (statusLabel != null) {
            statusLabel.setText("Plugins: " + active + "/" + total + " actifs");
        }
    }
    
    private void updateStatistics() {
        int total = pluginManager.getAllPlugins().size();
        int active = pluginManager.getActivePlugins().size();
        int inactive = total - active;
        
        if (activePluginsCount != null) activePluginsCount.setText(String.valueOf(active));
        if (inactivePluginsCount != null) inactivePluginsCount.setText(String.valueOf(inactive));
        if (totalPluginsCount != null) totalPluginsCount.setText(String.valueOf(total));
    }
    
    private void updateSelectedPluginDetails() {
        if (selectedPlugin == null) {
            selectedPluginTitle.setText("Aucun plugin sélectionné");
            selectedPluginDescription.setText("Sélectionnez un plugin dans la liste pour voir ses détails et options de configuration.");
            selectedPluginVersion.setText("");
            toggleButton.setStyle(toggleButton.getStyle().replaceAll("-fx-background-color: [^;]+;", "-fx-background-color: #cccccc;"));
            toggleButton.setText("Activer/Désactiver");
        } else {
            selectedPluginTitle.setText(selectedPlugin.getName());
            selectedPluginDescription.setText(selectedPlugin.getDescription());
            selectedPluginVersion.setText("Version: " + selectedPlugin.getVersion());
            
            if (selectedPlugin.isEnabled()) {
                toggleButton.setStyle(toggleButton.getStyle().replaceAll("-fx-background-color: [^;]+;", "-fx-background-color: #e74c3c;"));  
                toggleButton.setText("Désactiver");
            } else {
                toggleButton.setStyle(toggleButton.getStyle().replaceAll("-fx-background-color: [^;]+;", "-fx-background-color: #27ae60;"));
                toggleButton.setText("Activer");
            }
        }
    }

    @FXML
    private void refreshPlugins(MouseEvent event) {
        loadPlugins();
        showInfoAlert("Actualisation", "Liste des plugins actualisée");
    }

    @FXML
    private void enableAllPlugins(MouseEvent event) {
        for (Plugin plugin : pluginManager.getAllPlugins()) {
            pluginManager.enablePlugin(plugin.getName());
        }
        loadPlugins();
        showInfoAlert("Activation", "Tous les plugins ont été activés");
    }

    @FXML
    private void disableAllPlugins(MouseEvent event) {
        for (Plugin plugin : pluginManager.getAllPlugins()) {
            pluginManager.disablePlugin(plugin.getName());
        }
        loadPlugins();
        showInfoAlert("Désactivation", "Tous les plugins ont été désactivés");
    }

    @FXML
    private void retourMain(MouseEvent event) {
        try {
            Main.changeScene("Main", new MainController(), "Tableau de bord - Ma Ville");
        } catch (Exception e) {
            showErrorAlert("Erreur de navigation", "Impossible de charger la page principale");
            e.printStackTrace();
        }
    }

    @FXML
    private void chargerJarPlugin(MouseEvent event) {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Charger un plugin JAR");
        fileChooser.getExtensionFilters().add(
            new FileChooser.ExtensionFilter("Fichiers JAR", "*.jar")
        );
        
        File selectedFile = fileChooser.showOpenDialog(refreshButton.getScene().getWindow());
        if (selectedFile != null) {
            chargerPluginDepuisJar(selectedFile);
        }
    }

    private void setupDragAndDrop() {
        // Configuration du glissé-déposé pour le bouton
        dragDropArea.setOnDragOver(this::handleDragOver);
        dragDropArea.setOnDragDropped(this::handleDragDropped);
        dragDropArea.setOnDragEntered(this::handleDragEntered);
        dragDropArea.setOnDragExited(this::handleDragExited);
    }

    private void handleDragOver(DragEvent event) {
        if (event.getGestureSource() != dragDropArea && event.getDragboard().hasFiles()) {
            // Vérifier si c'est un fichier JAR
            for (File file : event.getDragboard().getFiles()) {
                if (file.getName().toLowerCase().endsWith(".jar")) {
                    event.acceptTransferModes(TransferMode.COPY);
                    break;
                }
            }
        }
        event.consume();
    }

    private void handleDragDropped(DragEvent event) {
        Dragboard db = event.getDragboard();
        boolean success = false;
        
        if (db.hasFiles()) {
            for (File file : db.getFiles()) {
                if (file.getName().toLowerCase().endsWith(".jar")) {
                    chargerPluginDepuisJar(file);
                    success = true;
                    break; // Prendre seulement le premier fichier JAR
                }
            }
        }
        
        event.setDropCompleted(success);
        event.consume();
    }

    private void handleDragEntered(DragEvent event) {
        if (event.getGestureSource() != dragDropArea && event.getDragboard().hasFiles()) {
            // Effet visuel d'entrée de glissé - assombrir le bouton
            String currentStyle = dragDropArea.getStyle();
            if (!currentStyle.contains("-fx-opacity:")) {
                dragDropArea.setStyle(currentStyle + "; -fx-opacity: 0.7;");
            }
        }
        event.consume();
    }

    private void handleDragExited(DragEvent event) {
        // Restaurer l'opacité originale
        String currentStyle = dragDropArea.getStyle();
        dragDropArea.setStyle(currentStyle.replace("; -fx-opacity: 0.7;", ""));
        event.consume();
    }

    private void chargerPluginDepuisJar(File jarFile) {
        try {
            System.out.println("tentative de chargement du plugin: " + jarFile.getName());
            
            // Créer un ClassLoader pour le JAR
            URL jarUrl = jarFile.toURI().toURL();
            URLClassLoader classLoader = new URLClassLoader(new URL[]{jarUrl}, this.getClass().getClassLoader());
            
            // Utiliser ServiceLoader pour trouver les plugins
            ServiceLoader<Plugin> serviceLoader = ServiceLoader.load(Plugin.class, classLoader);
            
            boolean pluginTrouve = false;
            for (Plugin plugin : serviceLoader) {
                // Enregistrer le plugin trouvé
                pluginManager.registerPlugin(plugin);
                pluginTrouve = true;
                
                showInfoAlert("Plugin chargé", 
                    "Plugin '" + plugin.getName() + "' v" + plugin.getVersion() + " chargé avec succès !");
                System.out.println("plugin charge: " + plugin.getName() + " v" + plugin.getVersion());
            }
            
            if (!pluginTrouve) {
                showWarningAlert("Aucun plugin trouvé", 
                    "Le fichier JAR ne contient pas de plugin compatible.\n" +
                    "Assurez-vous que le JAR contient une classe qui implémente l'interface Plugin " +
                    "et qu'elle est déclarée dans META-INF/services/plugin.Plugin");
            }
            
            // Actualiser la liste
            loadPlugins();
            
        } catch (Exception e) {
            showErrorAlert("Erreur de chargement", 
                "Impossible de charger le plugin depuis le fichier JAR:\n" + e.getMessage());
            e.printStackTrace();
        }
    }

    @FXML
    private void toggleSelectedPlugin(MouseEvent event) {
        if (selectedPlugin != null) {
            if (selectedPlugin.isEnabled()) {
                pluginManager.disablePlugin(selectedPlugin.getName());
            } else {
                pluginManager.enablePlugin(selectedPlugin.getName());
            }
            loadPlugins();
            updateSelectedPluginDetails();
            updateStatistics();
        }
    }

    private void showWarningAlert(String title, String message) {
        Alert.showWarningAlert(title, message);
    }

    private void showInfoAlert(String title, String message) {
        Alert.showSuccessAlert(title, message);
    }

    private void showErrorAlert(String title, String message) {
        Alert.showErrorAlert(title, message);
    }

    /**
     * Classe pour représenter une ligne de plugin dans la table
     */
    public static class PluginTableRow {
        private final SimpleBooleanProperty enabled;
        private final SimpleStringProperty name;
        private final SimpleStringProperty version;
        private final SimpleStringProperty description;

        public PluginTableRow(Plugin plugin) {
            this.enabled = new SimpleBooleanProperty(plugin.isEnabled());
            this.name = new SimpleStringProperty(plugin.getName());
            this.version = new SimpleStringProperty(plugin.getVersion());
            this.description = new SimpleStringProperty(plugin.getDescription());
        }

        public SimpleBooleanProperty enabledProperty() {
            return enabled;
        }

        public boolean getEnabled() {
            return enabled.get();
        }

        public void setEnabled(boolean enabled) {
            this.enabled.set(enabled);
        }

        public String getName() {
            return name.get();
        }

        public String getVersion() {
            return version.get();
        }

        public String getDescription() {
            return description.get();
        }
    }
}