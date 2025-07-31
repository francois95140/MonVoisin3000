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
import javafx.scene.input.MouseEvent;
import plugin.Plugin;
import plugin.PluginManager;

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

    private ObservableList<PluginTableRow> pluginData;
    private PluginManager pluginManager;

    @Override
    public void initialize(URL location, ResourceBundle resources) {
        pluginManager = PluginManager.getInstance();
        pluginData = FXCollections.observableArrayList();
        
        setupTable();
        loadPlugins();
        updateStatus();
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
        
        // Listener pour les changements d'état des plugins
        pluginTable.setRowFactory(tv -> {
            TableRow<PluginTableRow> row = new TableRow<>();
            return row;
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
    }

    private void updateStatus() {
        int total = pluginManager.getAllPlugins().size();
        int active = pluginManager.getActivePlugins().size();
        statusLabel.setText("Plugins: " + active + "/" + total + " actifs");
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

    private void showInfoAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.show();
    }

    private void showErrorAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
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