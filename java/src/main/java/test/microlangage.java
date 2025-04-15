package test;

import java.io.BufferedReader;
import java.io.InputStreamReader;

class Microlangage {
    public static void main(String[] args) {
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
}
