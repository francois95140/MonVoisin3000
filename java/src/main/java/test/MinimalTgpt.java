package test;

import java.io.*;
import java.util.concurrent.TimeUnit;

public class MinimalTgpt {
    public static void main(String[] args) {
        try {
            Process p = new ProcessBuilder("bash", "-c", "./tgpt 'coucou comment ça va ?'").start();
            p.getOutputStream().close();
            BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()));
            String line;
            StringBuilder total = new StringBuilder();
            while ((line = r.readLine()) != null) total.append(line).append("\n");
            System.out.println(total);
            p.waitFor(30, TimeUnit.SECONDS);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }
}