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


    private static boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }

    public static boolean checkEnvironment() {
        try {
            String venvPath = "../microlangage/venv";
            if (!Files.exists(Paths.get(venvPath))) {
                System.out.println("environnement virtuel non trouve");
                return false;
            }
            if (!Files.exists(Paths.get(isWindows() ? "../microlangage/venv/Scripts/python.exe" : "../microlangage/venv/bin/python3"))) {
                System.out.println("executable python non trouve dans l'environnement virtuel");
                return false;
            }

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
                System.out.println("environnement python fonctionnel");
            } else {
                System.out.println("environnement python dysfonctionnel");
            }

            return isOk;

        } catch (Exception e) {
            System.out.println("erreur lors de la verification: " + e.getMessage());
            return false;
        }
    }

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
                System.out.println("dependances python installees");
            } else {
                System.out.println("dependances python manquantes");
            }

            return depsOk;

        } catch (Exception e) {
            System.out.println("erreur lors de la verification des dependances: " + e.getMessage());
            return false;
        }
    }

    public static void fullInit() {
        System.out.println("initialisation complete de l'environnement python...");
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
                throw new RuntimeException("erreur lors de l'initialisation (code: " + p.exitValue() + ")");
            }

            System.out.println("initialisation complete terminee");

        } catch (IOException e) {
            throw new RuntimeException("erreur d'initialisation BDD: " + e.getMessage(), e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Initialisation BDD interrompue: " + e.getMessage(), e);
        }
    }

    public static void initBdd() {
        if (environmentChecked && environmentReady) {
            System.out.println("environnement deja verifie et pret");
            return;
        }

        System.out.println("verification de l'environnement python...");

        // Vérification rapide
        if (checkEnvironment() && checkDependencies()) {
            System.out.println("environnement deja pret, pas de reinstallation necessaire");
            environmentReady = true;
        } else {
            System.out.println("environnement non fonctionnel, initialisation complete...");
            fullInit();

            // Double vérification après installation
            if (checkEnvironment() && checkDependencies()) {
                environmentReady = true;
                System.out.println("environnement initialise avec succes");
            } else {
                throw new RuntimeException("Échec de l'initialisation de l'environnement Python");
            }
        }

        environmentChecked = true;
    }

    public static void forceReinit() {
        System.out.println("reinitialisation forcee...");
        environmentChecked = false;
        environmentReady = false;
        fullInit();
        environmentChecked = true;
        environmentReady = checkEnvironment() && checkDependencies();
    }

    public static String request(String bdd, String query) {
        // Vérifier que l'environnement est pret
        if (!environmentReady) {
            return "erreur: Environnement Python non initialisé";
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
                return "erreur: Timeout - La requête a pris trop de temps";
            }

            return result.toString().trim();

        } catch (Exception e) {
            return "erreur: " + e.getMessage();
        }
    }

    public static String requestWithDebug(String bdd, String query) {
        if (!environmentReady) {
            return "erreur: Environnement Python non initialisé";
        }

        try {
            System.out.println("debug: os detecte = " + (isWindows() ? "windows" : "linux/mac"));

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

            System.out.println("debug: commande = " + command);

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
                return "erreur: Timeout - La requête a pris trop de temps";
            }

            int exitCode = p.exitValue();
            System.out.println("debug: code de sortie = " + exitCode);

            String finalResult = result.toString().trim();
            System.out.println("debug: resultat = " + finalResult);

            return finalResult;

        } catch (Exception e) {
            System.out.println("debug: exception = " + e.getMessage());
            e.printStackTrace();
            return "erreur: " + e.getMessage();
        }
    }

    public static void testCompatibility() {
        System.out.println("=== test de compatibilite ===");
        System.out.println("os: " + System.getProperty("os.name"));
        System.out.println("version: " + System.getProperty("os.version"));
        System.out.println("architecture: " + System.getProperty("os.arch"));
        System.out.println("est windows: " + isWindows());
        System.out.println("repertoire courant: " + System.getProperty("user.dir"));

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
            System.out.println("test commande: " + result);

        } catch (Exception e) {
            System.out.println("erreur test: " + e.getMessage());
        }
    }


    public static boolean isEnvironmentReady() {
        return environmentReady;
    }

    public static void main(String[] args) {
        testCompatibility();
        System.out.println("\n=== initialisation bdd ===");
        initBdd();
        System.out.println("\n=== test requetes ===");
        String result = requestWithDebug("mongo", "select * from conversations_db");
        System.out.println("resultat final: " + result);
    }
}