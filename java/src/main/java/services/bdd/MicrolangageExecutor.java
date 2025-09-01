package services.bdd;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

/**
 * Gestionnaire pour exécuter le microlangage SQLUnification
 * Utilise l'exécutable compilé en production ou Python en développement
 */
public class MicrolangageExecutor {
    
    private static boolean isProduction = false;
    private static boolean executorReady = false;
    
    static {
        // Détecter si on est en production (exécutable présent) ou développement
        detectEnvironment();
    }
    
    private static void detectEnvironment() {
        Path executablePath = getExecutablePath();
        isProduction = Files.exists(executablePath);
        
        if (isProduction) {
            System.out.println("🚀 Mode production détecté - utilisation de l'exécutable compilé");
            executorReady = true;
        } else {
            System.out.println("🔧 Mode développement détecté - utilisation de Python");
            executorReady = checkPythonEnvironment();
        }
    }
    
    /**
     * Obtient le chemin vers l'exécutable selon l'OS et l'environnement
     */
    private static Path getExecutablePath() {
        boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
        String executableName = isWindows ? "SQLUnification.exe" : "SQLUnification";
        
        // Chemins à tester par ordre de priorité
        String[] possiblePaths = {
            // Production installée (répertoire courant)
            executableName,
            // Build local (répertoire parent)
            "../" + executableName,
            // Build dans dist
            "../dist/" + executableName,
            // Chemin absolu pour installation système
            isWindows ? "C:/Program Files/MonVoisin3000/" + executableName : "/opt/MonVoisin3000/" + executableName
        };
        
        for (String pathStr : possiblePaths) {
            Path path = Paths.get(pathStr);
            if (Files.exists(path) && Files.isExecutable(path)) {
                System.out.println("✅ Exécutable trouvé: " + path.toAbsolutePath());
                return path;
            }
        }
        
        System.out.println("❌ Exécutable non trouvé dans les chemins: " + String.join(", ", possiblePaths));
        return Paths.get(executableName); // Retourner le nom par défaut
    }
    
    /**
     * Vérifie l'environnement Python (mode développement)
     */
    private static boolean checkPythonEnvironment() {
        try {
            String venvPath = "../microlangage/venv";
            if (!Files.exists(Paths.get(venvPath))) {
                System.out.println("❌ Environnement virtuel Python non trouvé");
                return false;
            }
            
            boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
            if (!Files.exists(Paths.get(isWindows ? "../microlangage/venv/Scripts/python.exe" : "../microlangage/venv/bin/python3"))) {
                System.out.println("❌ Exécutable Python non trouvé dans l'environnement virtuel");
                return false;
            }
            
            System.out.println("✅ Environnement Python prêt");
            return true;
            
        } catch (Exception e) {
            System.out.println("❌ Erreur lors de la vérification Python: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Exécute une requête avec le microlangage
     */
    public static String executeQuery(String databaseType, String query) {
        if (!executorReady) {
            return "erreur: Microlangage non initialisé";
        }
        
        try {
            ProcessBuilder pb;
            
            if (isProduction) {
                // Mode production - utiliser l'exécutable
                Path executable = getExecutablePath();
                pb = new ProcessBuilder(
                    executable.toString(),
                    databaseType,
                    query
                );
                System.out.println("🚀 Exécution: " + executable + " " + databaseType + " \"" + query + "\"");
                
            } else {
                // Mode développement - utiliser Python
                boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
                
                if (isWindows) {
                    // Échapper les guillemets pour Windows cmd
                    String escapedQuery = query.replace("\"", "\\\"");
                    pb = new ProcessBuilder("cmd", "/c",
                        "cd ..\\microlangage && " +
                        "venv\\Scripts\\python.exe SQLUnification1.py " + databaseType + " \"" + escapedQuery + "\"");
                } else {
                    // Échapper les quotes pour bash
                    String escapedQuery = query.replace("'", "'\"'\"'");
                    pb = new ProcessBuilder("bash", "-c",
                        "cd ../microlangage && " +
                        "source venv/bin/activate > /dev/null 2>&1; " +
                        "python3 SQLUnification1.py " + databaseType + " '" + escapedQuery + "'");
                }
                System.out.println("🔧 Exécution Python: " + databaseType + " \"" + query + "\"");
            }
            
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            StringBuilder result = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    result.append(line).append("\n");
                }
            }
            
            boolean finished = process.waitFor(30, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return "erreur: Timeout lors de l'exécution de la requête";
            }
            
            if (process.exitValue() != 0) {
                return "erreur: Échec de l'exécution (code " + process.exitValue() + ")\n" + result.toString();
            }
            
            return result.toString().trim();
            
        } catch (Exception e) {
            return "erreur: Exception lors de l'exécution - " + e.getMessage();
        }
    }
    
    /**
     * Teste la disponibilité du microlangage
     */
    public static boolean testConnection() {
        String result = executeQuery("test", "SELECT 1");
        return !result.startsWith("erreur:");
    }
    
    /**
     * Obtient des informations sur l'environnement
     */
    public static String getEnvironmentInfo() {
        StringBuilder info = new StringBuilder();
        info.append("Mode: ").append(isProduction ? "Production (exécutable)" : "Développement (Python)").append("\n");
        info.append("Prêt: ").append(executorReady ? "Oui" : "Non").append("\n");
        
        if (isProduction) {
            Path executable = getExecutablePath();
            info.append("Exécutable: ").append(executable).append("\n");
            info.append("Existe: ").append(Files.exists(executable) ? "Oui" : "Non").append("\n");
        } else {
            info.append("Python venv: ../microlangage/venv\n");
        }
        
        return info.toString();
    }
}