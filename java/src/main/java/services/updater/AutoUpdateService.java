package services.updater;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonArray;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.*;
import java.util.concurrent.CompletableFuture;

/**
 * Service d'auto-update pour télécharger les nouvelles versions depuis GitHub
 */
public class AutoUpdateService {
    
    private static final String GITHUB_API_URL = "https://api.github.com/repos/francois95140/MonVoisin3000/releases/latest";
    private static final String CURRENT_VERSION = "1.0.0";
    
    private UpdateListener listener;
    
    public interface UpdateListener {
        void onUpdateAvailable(String newVersion);
        void onUpdateProgress(int progress);
        void onUpdateComplete(String installerPath);
        void onUpdateError(String error);
        void onNoUpdateAvailable();
    }
    
    public void setUpdateListener(UpdateListener listener) {
        this.listener = listener;
    }
    
    /**
     * Vérifie s'il y a une nouvelle version disponible
     */
    public CompletableFuture<Boolean> checkForUpdates() {
        return CompletableFuture.supplyAsync(() -> {
            try {
                HttpURLConnection conn = (HttpURLConnection) new URL(GITHUB_API_URL).openConnection();
                conn.setRequestProperty("Accept", "application/vnd.github.v3+json");
                conn.setRequestProperty("User-Agent", "MonVoisin3000-AutoUpdater");
                
                if (conn.getResponseCode() != 200) {
                    if (listener != null) {
                        listener.onUpdateError("Erreur lors de la vérification des mises à jour: " + conn.getResponseCode());
                    }
                    return false;
                }
                
                StringBuilder response = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                }
                
                JsonObject release = new Gson().fromJson(response.toString(), JsonObject.class);
                String latestVersion = release.get("tag_name").getAsString().replace("v", "");
                
                if (isNewerVersion(latestVersion, CURRENT_VERSION)) {
                    if (listener != null) {
                        listener.onUpdateAvailable(latestVersion);
                    }
                    return true;
                } else {
                    if (listener != null) {
                        listener.onNoUpdateAvailable();
                    }
                    return false;
                }
                
            } catch (Exception e) {
                if (listener != null) {
                    listener.onUpdateError("Erreur: " + e.getMessage());
                }
                return false;
            }
        });
    }
    
    /**
     * Télécharge la nouvelle version
     */
    public CompletableFuture<String> downloadUpdate() {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Récupérer les infos de la dernière release
                HttpURLConnection conn = (HttpURLConnection) new URL(GITHUB_API_URL).openConnection();
                conn.setRequestProperty("Accept", "application/vnd.github.v3+json");
                conn.setRequestProperty("User-Agent", "MonVoisin3000-AutoUpdater");
                
                StringBuilder response = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                }
                
                JsonObject release = new Gson().fromJson(response.toString(), JsonObject.class);
                JsonArray assets = release.getAsJsonArray("assets");
                
                // Déterminer le bon fichier selon l'OS
                String os = System.getProperty("os.name").toLowerCase();
                String targetFile = os.contains("win") ? "MonVoisin3000Installer.exe" : "MonVoisin3000Installer.deb";
                
                String downloadUrl = null;
                for (int i = 0; i < assets.size(); i++) {
                    JsonObject asset = assets.get(i).getAsJsonObject();
                    if (asset.get("name").getAsString().equals(targetFile)) {
                        downloadUrl = asset.get("browser_download_url").getAsString();
                        break;
                    }
                }
                
                if (downloadUrl == null) {
                    if (listener != null) {
                        listener.onUpdateError("Fichier d'installation non trouvé pour votre OS");
                    }
                    return null;
                }
                
                // Télécharger le fichier
                Path downloadsDir = Paths.get(System.getProperty("user.home"), "Downloads");
                Path targetPath = downloadsDir.resolve(targetFile);
                
                URL url = new URL(downloadUrl);
                HttpURLConnection downloadConn = (HttpURLConnection) url.openConnection();
                
                long fileSize = downloadConn.getContentLengthLong();
                
                try (InputStream in = downloadConn.getInputStream();
                     FileOutputStream out = new FileOutputStream(targetPath.toFile())) {
                    
                    byte[] buffer = new byte[8192];
                    long downloaded = 0;
                    int bytesRead;
                    
                    while ((bytesRead = in.read(buffer)) != -1) {
                        out.write(buffer, 0, bytesRead);
                        downloaded += bytesRead;
                        
                        if (listener != null && fileSize > 0) {
                            int progress = (int) ((downloaded * 100) / fileSize);
                            listener.onUpdateProgress(progress);
                        }
                    }
                }
                
                if (listener != null) {
                    listener.onUpdateComplete(targetPath.toString());
                }
                
                return targetPath.toString();
                
            } catch (Exception e) {
                if (listener != null) {
                    listener.onUpdateError("Erreur lors du téléchargement: " + e.getMessage());
                }
                return null;
            }
        });
    }
    
    /**
     * Lance l'installation de la mise à jour
     */
    public void installUpdate(String installerPath) {
        try {
            String os = System.getProperty("os.name").toLowerCase();
            
            if (os.contains("win")) {
                // Windows - lancer l'exe
                new ProcessBuilder(installerPath).start();
            } else {
                // Linux - ouvrir avec le gestionnaire de paquets par défaut
                new ProcessBuilder("xdg-open", installerPath).start();
            }
            
            // Fermer l'application actuelle pour permettre la mise à jour
            System.exit(0);
            
        } catch (Exception e) {
            if (listener != null) {
                listener.onUpdateError("Erreur lors du lancement de l'installation: " + e.getMessage());
            }
        }
    }
    
    /**
     * Compare deux versions (format x.y.z)
     */
    private boolean isNewerVersion(String newVersion, String currentVersion) {
        String[] newParts = newVersion.split("\\.");
        String[] currentParts = currentVersion.split("\\.");
        
        for (int i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
            int newPart = i < newParts.length ? Integer.parseInt(newParts[i]) : 0;
            int currentPart = i < currentParts.length ? Integer.parseInt(currentParts[i]) : 0;
            
            if (newPart > currentPart) return true;
            if (newPart < currentPart) return false;
        }
        
        return false;
    }
}