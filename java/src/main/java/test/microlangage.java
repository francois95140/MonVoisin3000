package test;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;

class Microlangage {
    public static void main1(String[] args) {
        Process p;
        try {
            p = Runtime.getRuntime().exec("python3 ../microlangage/SQLUnification1.py mongo 'select * from conversations_db'");
            p.waitFor();
            BufferedReader reader =
                    new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        Process p;
        try {
            ProcessBuilder pb = new ProcessBuilder("tgpt", "'coucou comment ça va ?'");
            pb.redirectOutput(new File("output.txt"));
            p = pb.start();
            p.waitFor();
            BufferedReader reader =
                    new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
