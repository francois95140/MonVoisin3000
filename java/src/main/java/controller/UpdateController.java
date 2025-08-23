package controller;

import javafx.application.Platform;
import javafx.concurrent.Task;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;
import services.updater.AutoUpdateService;

/**
 * Contrôleur pour gérer les mises à jour de l'application
 */
public class UpdateController {
    
    @FXML private VBox updateContainer;
    @FXML private Label updateStatusLabel;
    @FXML private ProgressBar updateProgressBar;
    @FXML private Button checkUpdateButton;
    @FXML private Button downloadButton;
    @FXML private Button installButton;
    
    private AutoUpdateService updateService;
    private String downloadedInstallerPath;
    
    public void initialize() {
        updateService = new AutoUpdateService();
        setupUpdateListener();
        updateProgressBar.setVisible(false);
        downloadButton.setVisible(false);
        installButton.setVisible(false);
    }
    
    private void setupUpdateListener() {
        updateService.setUpdateListener(new AutoUpdateService.UpdateListener() {
            @Override
            public void onUpdateAvailable(String newVersion) {
                Platform.runLater(() -> {
                    updateStatusLabel.setText("✨ Nouvelle version disponible: v" + newVersion);
                    updateStatusLabel.setStyle("-fx-text-fill: #4CAF50;");
                    downloadButton.setVisible(true);
                    checkUpdateButton.setDisable(false);
                });
            }
            
            @Override
            public void onUpdateProgress(int progress) {
                Platform.runLater(() -> {
                    updateProgressBar.setProgress(progress / 100.0);
                    updateStatusLabel.setText("Téléchargement en cours... " + progress + "%");
                });
            }
            
            @Override
            public void onUpdateComplete(String installerPath) {
                Platform.runLater(() -> {
                    downloadedInstallerPath = installerPath;
                    updateProgressBar.setVisible(false);
                    updateStatusLabel.setText("✅ Mise à jour téléchargée avec succès !");
                    updateStatusLabel.setStyle("-fx-text-fill: #4CAF50;");
                    downloadButton.setVisible(false);
                    installButton.setVisible(true);
                });
            }
            
            @Override
            public void onUpdateError(String error) {
                Platform.runLater(() -> {
                    updateStatusLabel.setText("❌ " + error);
                    updateStatusLabel.setStyle("-fx-text-fill: #F44336;");
                    updateProgressBar.setVisible(false);
                    checkUpdateButton.setDisable(false);
                    downloadButton.setDisable(false);
                });
            }
            
            @Override
            public void onNoUpdateAvailable() {
                Platform.runLater(() -> {
                    updateStatusLabel.setText("✅ Vous avez déjà la dernière version");
                    updateStatusLabel.setStyle("-fx-text-fill: #4CAF50;");
                    checkUpdateButton.setDisable(false);
                });
            }
        });
    }
    
    @FXML
    private void checkForUpdates() {
        checkUpdateButton.setDisable(true);
        updateStatusLabel.setText("🔍 Vérification des mises à jour...");
        updateStatusLabel.setStyle("-fx-text-fill: #2196F3;");
        
        Task<Boolean> task = new Task<Boolean>() {
            @Override
            protected Boolean call() throws Exception {
                return updateService.checkForUpdates().get();
            }
        };
        
        new Thread(task).start();
    }
    
    @FXML
    private void downloadUpdate() {
        downloadButton.setDisable(true);
        updateProgressBar.setVisible(true);
        updateProgressBar.setProgress(0);
        updateStatusLabel.setText("📦 Téléchargement de la mise à jour...");
        updateStatusLabel.setStyle("-fx-text-fill: #2196F3;");
        
        Task<String> task = new Task<String>() {
            @Override
            protected String call() throws Exception {
                return updateService.downloadUpdate().get();
            }
        };
        
        new Thread(task).start();
    }
    
    @FXML
    private void installUpdate() {
        if (downloadedInstallerPath != null) {
            Alert confirmDialog = new Alert(Alert.AlertType.CONFIRMATION);
            confirmDialog.setTitle("Installer la mise à jour");
            confirmDialog.setHeaderText("Êtes-vous sûr de vouloir installer la mise à jour ?");
            confirmDialog.setContentText("L'application sera fermée pour permettre l'installation.");
            
            if (confirmDialog.showAndWait().get() == ButtonType.OK) {
                updateService.installUpdate(downloadedInstallerPath);
            }
        }
    }
    
    @FXML
    private void showUpdateDialog() {
        Alert updateDialog = new Alert(Alert.AlertType.INFORMATION);
        updateDialog.setTitle("Mises à jour automatiques");
        updateDialog.setHeaderText("Comment fonctionnent les mises à jour");
        updateDialog.setContentText(
            "• L'application vérifie automatiquement les nouvelles versions sur GitHub\n" +
            "• Vous pouvez télécharger et installer les mises à jour en un clic\n" +
            "• Les mises à jour incluent les améliorations Java et du microlangage\n" +
            "• Vos données et configurations sont préservées"
        );
        updateDialog.showAndWait();
    }
}