package services.bdd;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;

public class Bdd {

    /**
     * Détecte le système d'exploitation
     */
    private static boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }

    /**
     * Initialise la base de données selon l'OS
     */
    public static void initBdd() {
        ProcessBuilder pb;

        if (isWindows()) {
            // Commande Windows (CMD)
            pb = new ProcessBuilder("cmd", "/c",
                    "cd ..\\microlangage && setup.bat");
        } else {
            // Commande Linux/Mac (Bash)
            pb = new ProcessBuilder("bash", "-c",
                    "cd ../microlangage/ && source ./setup.sh");
        }

        try {
            Process p = pb.start();
            p.waitFor(40, TimeUnit.SECONDS);
        } catch (IOException e) {
            throw new RuntimeException("Erreur d'initialisation BDD: " + e.getMessage(), e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Initialisation BDD interrompue: " + e.getMessage(), e);
        }
    }

    /**
     * Exécute une requête sur la base de données
     */
    public static String request(String bdd, String query) {
        try {
            ProcessBuilder pb;

            if (isWindows()) {
                // Commande Windows
                pb = new ProcessBuilder("cmd", "/c",
                        "cd ..\\microlangage && " +
                                "venv\\Scripts\\activate.bat && " +
                                "python SQLUnification1.py " + bdd + " \"" + query + "\"");
            } else {
                // Commande Linux/Mac
                pb = new ProcessBuilder("bash", "-c",
                        "cd ./../microlangage && " +
                                "source venv/bin/activate > /dev/null 2>&1; " +
                                "python3 SQLUnification1.py " + bdd + " \"" + query + "\"");
            }

            pb.redirectErrorStream(true);
            Process p = pb.start();
            p.getOutputStream().close();

            BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line;
            StringBuilder result = new StringBuilder();
            while ((line = r.readLine()) != null) {
                result.append(line).append("\n");
            }

            boolean finished = p.waitFor(30, TimeUnit.SECONDS);
            if (!finished) {
                p.destroyForcibly();
                return "Erreur: Timeout - La requête a pris trop de temps";
            }

            return result.toString().trim();

        } catch (Exception e) {
            return "Erreur: " + e.getMessage();
        }
    }

    /**
     * Version alternative avec gestion d'erreur améliorée
     */
    public static String requestWithDebug(String bdd, String query) {
        try {
            System.out.println("🔍 DEBUG: OS détecté = " + (isWindows() ? "Windows" : "Linux/Mac"));

            ProcessBuilder pb;
            String command;

            if (isWindows()) {
                command = "cd ..\\microlangage && " +
                        "venv\\Scripts\\activate.bat && " +
                        "venv\\Scripts\\python.exe SQLUnification1.py " + bdd + " \"" + query + "\"";
                pb = new ProcessBuilder("cmd", "/c", command);
            } else {
                command = "cd ./../microlangage && " +
                        "source venv/bin/activate > /dev/null 2>&1; " +
                        "python3 SQLUnification1.py " + bdd + " \"" + query + "\"";
                pb = new ProcessBuilder("bash", "-c", command);
            }

            System.out.println("🔍 DEBUG: Commande = " + command);

            pb.redirectErrorStream(true);
            Process p = pb.start();
            p.getOutputStream().close();

            BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line;
            StringBuilder result = new StringBuilder();
            while ((line = r.readLine()) != null) {
                result.append(line).append("\n");
            }

            boolean finished = p.waitFor(30, TimeUnit.SECONDS);
            if (!finished) {
                p.destroyForcibly();
                return "Erreur: Timeout - La requête a pris trop de temps";
            }

            int exitCode = p.exitValue();
            System.out.println("🔍 DEBUG: Code de sortie = " + exitCode);

            String finalResult = result.toString().trim();
            System.out.println("🔍 DEBUG: Résultat = " + finalResult);

            return finalResult;

        } catch (Exception e) {
            System.err.println("🔍 DEBUG: Exception = " + e.getMessage());
            e.printStackTrace();
            return "Erreur: " + e.getMessage();
        }
    }

    /**
     * Test de compatibilité OS
     */
    public static void testCompatibility() {
        System.out.println("=== TEST DE COMPATIBILITÉ ===");
        System.out.println("OS: " + System.getProperty("os.name"));
        System.out.println("Version: " + System.getProperty("os.version"));
        System.out.println("Architecture: " + System.getProperty("os.arch"));
        System.out.println("Est Windows: " + isWindows());
        System.out.println("Répertoire courant: " + System.getProperty("user.dir"));

        // Test de commande simple
        try {
            ProcessBuilder pb;
            if (isWindows()) {
                pb = new ProcessBuilder("cmd", "/c", "echo Test Windows OK");
            } else {
                pb = new ProcessBuilder("bash", "-c", "echo 'Test Linux OK'");
            }

            Process p = pb.start();
            BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String result = r.readLine();
            System.out.println("Test commande: " + result);

        } catch (Exception e) {
            System.err.println("Erreur test: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        // Test de compatibilité
        testCompatibility();

        // Test d'initialisation
        System.out.println("\n=== INITIALISATION BDD ===");
        initBdd();

        // Test de requêtes
        System.out.println("\n=== TEST REQUÊTES ===");
        String result = requestWithDebug("mongo", "select * from conversations_db");
        System.out.println("Résultat final: " + result);
    }
}