package services.bdd;

import com.mysql.cj.xdevapi.JsonArray;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;

public class Bdd {

    public static void initBdd() {
        ProcessBuilder pb = new ProcessBuilder("bash", "-c",
                "cd ../microlangage/ && source ./setup.sh");

        try {
            Process p = pb.start();
            p.waitFor(40, TimeUnit.SECONDS);
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
    public static String request(String bdd, String query) {
        try {
            ProcessBuilder pb = new ProcessBuilder("bash", "-c",
                    "cd ./../microlangage && source venv/bin/activate > /dev/null 2>&1; python3 SQLUnification1.py "+bdd+" \"" + query + "\"");
            pb.redirectErrorStream(true);
            Process p = pb.start();
            p.getOutputStream().close();

            BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line;
            StringBuilder result = new StringBuilder();
            while ((line = r.readLine()) != null) {
                result.append(line).append("\n");
            }

            p.waitFor(30, TimeUnit.SECONDS);
            return result.toString().trim();

        } catch (Exception e) {
            return "Erreur: " + e.getMessage();
        }


    }

    public static void main(String[] args) {
        // Test
        initBdd();
        String result = request("mongo", "select * from conversations_db");
        System.out.println("Résultat: " + result);
         result = request("mongo", "select * from conversations_db");
        System.out.println("Résultat: " + result);
         result = request("mongo", "select * from conversations_db");
        System.out.println("Résultat: " + result);
    }
}



