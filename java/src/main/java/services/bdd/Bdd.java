package services.bdd;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

public class Bdd {

    private static boolean environmentChecked = false;
    private static boolean environmentReady = false;

    /**
     * Détecte le système d'exploitation
     */
    private static boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }

    /**
     * Vérifie si l'environnement virtuel Python existe et fonctionne
     */
    public static boolean checkEnvironment() {
        try {
            // Vérifier si le dossier venv existe
            String venvPath = isWindows() ? "../microlangage/venv" : "../microlangage/venv";
            if (!Files.exists(Paths.get(venvPath))) {
                System.out.println("⚠️  Environnement virtuel non trouvé");
                return false;
            }

            // Vérifier si l'exécutable Python existe
            String pythonPath = isWindows() ?
                    "../microlangage/venv/Scripts/python.exe" :
                    "../microlangage/venv/bin/python3";

            if (!Files.exists(Paths.get(pythonPath))) {
                System.out.println("⚠️  Exécutable Python non trouvé dans l'environnement virtuel");
                return false;
            }

            // Test rapide : vérifier que Python fonctionne
            ProcessBuilder pb;
            if (isWindows()) {
                pb = new ProcessBuilder("cmd", "/c",
                        "cd ..\\microlangage && " +
                                "venv\\Scripts\\python.exe -c \"import sys; print('OK')\"");
            } else {
                pb = new ProcessBuilder("bash", "-c",
                        "cd ../microlangage && " +
                                "source venv/bin/activate > /dev/null 2>&1; " +
                                "python3 -c \"import sys; print('OK')\"");
            }

            pb.redirectErrorStream(true);
            Process p = pb.start();

            BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String result = r.readLine();

            boolean finished = p.waitFor(10, TimeUnit.SECONDS);
            if (!finished) {
                p.destroyForcibly();
                return false;
            }

            boolean isOk = "OK".equals(result) && p.exitValue() == 0;
            if (isOk) {
                System.out.println("✅ Environnement Python fonctionnel");
            } else {
                System.out.println("⚠️  Environnement Python dysfonctionnel");
            }

            return isOk;

        } catch (Exception e) {
            System.out.println("⚠️  Erreur lors de la vérification: " + e.getMessage());
            return false;
        }
    }

    /**
     * Vérifie si les dépendances requises sont installées
     */
    public static boolean checkDependencies() {
        try {
            ProcessBuilder pb;
            if (isWindows()) {
                pb = new ProcessBuilder("cmd", "/c",
                        "cd ..\\microlangage && " +
                                "venv\\Scripts\\python.exe -c \"import ply, pymongo, py2neo, psycopg2, dotenv; print('DEPS_OK')\"");
            } else {
                pb = new ProcessBuilder("bash", "-c",
                        "cd ../microlangage && " +
                                "source venv/bin/activate > /dev/null 2>&1; " +
                                "python3 -c \"import ply, pymongo, py2neo, psycopg2, dotenv; print('DEPS_OK')\"");
            }

            pb.redirectErrorStream(true);
            Process p = pb.start();

            BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line;
            StringBuilder result = new StringBuilder();
            while ((line = r.readLine()) != null) {
                result.append(line);
            }

            boolean finished = p.waitFor(15, TimeUnit.SECONDS);
            if (!finished) {
                p.destroyForcibly();
                return false;
            }

            boolean depsOk = result.toString().contains("DEPS_OK") && p.exitValue() == 0;
            if (depsOk) {
                System.out.println("✅ Dépendances Python installées");
            } else {
                System.out.println("⚠️  Dépendances Python manquantes");
            }

            return depsOk;

        } catch (Exception e) {
            System.out.println("⚠️  Erreur lors de la vérification des dépendances: " + e.getMessage());
            return false;
        }
    }

    /**
     * Initialisation complète de l'environnement (lente)
     */
    public static void fullInit() {
        System.out.println("🔄 Initialisation complète de l'environnement Python...");
        ProcessBuilder pb;

        if (isWindows()) {
            pb = new ProcessBuilder("cmd", "/c",
                    "cd ..\\microlangage && setup.bat");
        } else {
            pb = new ProcessBuilder("bash", "-c",
                    "cd ../microlangage/ && source ./setup.sh");
        }

        try {
            Process p = pb.start();
            boolean finished = p.waitFor(60, TimeUnit.SECONDS); // Augmenté à 60s

            if (!finished) {
                p.destroyForcibly();
                throw new RuntimeException("Timeout lors de l'initialisation complète");
            }

            if (p.exitValue() != 0) {
                throw new RuntimeException("Erreur lors de l'initialisation (code: " + p.exitValue() + ")");
            }

            System.out.println("✅ Initialisation complète terminée");

        } catch (IOException e) {
            throw new RuntimeException("Erreur d'initialisation BDD: " + e.getMessage(), e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Initialisation BDD interrompue: " + e.getMessage(), e);
        }
    }

    /**
     * Initialisation intelligente : rapide si l'environnement existe déjà
     */
    public static void initBdd() {
        if (environmentChecked && environmentReady) {
            System.out.println("✅ Environnement déjà vérifié et prêt");
            return;
        }

        System.out.println("🔍 Vérification de l'environnement Python...");

        // Vérification rapide
        if (checkEnvironment() && checkDependencies()) {
            System.out.println("✅ Environnement déjà prêt, pas de réinstallation nécessaire");
            environmentReady = true;
        } else {
            System.out.println("🔄 Environnement non fonctionnel, initialisation complète...");
            fullInit();

            // Double vérification après installation
            if (checkEnvironment() && checkDependencies()) {
                environmentReady = true;
                System.out.println("✅ Environnement initialisé avec succès");
            } else {
                throw new RuntimeException("Échec de l'initialisation de l'environnement Python");
            }
        }

        environmentChecked = true;
    }

    /**
     * Force la réinitialisation complète (pour le debug ou en cas de problème)
     */
    public static void forceReinit() {
        System.out.println("🔄 Réinitialisation forcée...");
        environmentChecked = false;
        environmentReady = false;
        fullInit();
        environmentChecked = true;
        environmentReady = checkEnvironment() && checkDependencies();
    }

    /**
     * Exécute une requête sur la base de données
     */
    public static String request(String bdd, String query) {
        // Vérifier que l'environnement est prêt
        if (!environmentReady) {
            return "Erreur: Environnement Python non initialisé";
        }

        try {
            ProcessBuilder pb;

            if (isWindows()) {
                pb = new ProcessBuilder("cmd", "/c",
                        "cd ..\\microlangage && " +
                                "venv\\Scripts\\activate.bat && " +
                                "venv\\Scripts\\python.exe SQLUnification1.py " + bdd + " \"" + query + "\"");
            } else {
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
        if (!environmentReady) {
            return "Erreur: Environnement Python non initialisé";
        }

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

    /**
     * Retourne l'état de l'environnement
     */
    public static boolean isEnvironmentReady() {
        return environmentReady;
    }

    public static void main(String[] args) {
        testCompatibility();
        System.out.println("\n=== INITIALISATION BDD ===");
        initBdd();
        System.out.println("\n=== TEST REQUÊTES ===");
        String result = requestWithDebug("mongo", "select * from conversations_db");
        System.out.println("Résultat final: " + result);
    }
}