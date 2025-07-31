package services.webscrapper;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

public class WebFetcher {
    private final HttpClient client;

    public WebFetcher() {
        this.client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL) // Suivre les redirections
                .build();
    }

    public String fetch(String url, Map<String, String> headers) throws IOException, InterruptedException {
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .timeout(Duration.ofSeconds(30));

        // Ajouter les headers en filtrant ceux qui sont restreints
        headers.forEach((key, value) -> {
            try {
                // Vérifier si le header est autorisé
                if (isAllowedHeader(key)) {
                    requestBuilder.header(key, value);
                }
            } catch (IllegalArgumentException e) {
                System.out.println("Header restreint ignoré: " + key);
            }
        });

        HttpRequest request = requestBuilder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        int statusCode = response.statusCode();
        if (statusCode >= 200 && statusCode < 300) {
            return response.body();
        } else if (statusCode >= 300 && statusCode < 400) {
            String location = response.headers().firstValue("Location").orElse("");
            if (!location.isEmpty()) {
                System.out.println("Redirection vers: " + location);
                return fetch(location, headers);
            }
            throw new IOException("HTTP " + statusCode + " - Redirection sans location");
        } else if (statusCode == 403) {
            throw new IOException("HTTP 403 - Accès interdit (possiblement bloqué par anti-bot)");
        } else if (statusCode == 429) {
            throw new IOException("HTTP 429 - Trop de requêtes (rate limit)");
        } else {
            throw new IOException("HTTP " + statusCode + " - " + getStatusMessage(statusCode));
        }
    }

    public String fetch(String url) throws IOException, InterruptedException {
        Map<String, String> defaultHeaders = Map.of(
                "User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language", "fr-FR,fr;q=0.9,en;q=0.8"
        );
        return fetch(url, defaultHeaders);
    }

    public String fetchWithRetry(String url, Map<String, String> headers, int maxRetries) throws IOException, InterruptedException {
        IOException lastException = null;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 1) {
                    System.out.println("Tentative " + attempt + "/" + maxRetries + " pour: " + url);
                    // Délai exponentiel entre les tentatives
                    Thread.sleep(1000 * attempt);
                }

                return fetch(url, headers);

            } catch (IOException e) {
                lastException = e;
                System.out.println("❌ Tentative " + attempt + " échouée: " + e.getMessage());

                if (attempt == maxRetries) {
                    break;
                }

                // Ne pas retry pour certains codes d'erreur définitifs
                if (e.getMessage().contains("403") || e.getMessage().contains("404")) {
                    break;
                }
            }
        }

        throw new IOException("Échec après " + maxRetries + " tentatives: " +
                (lastException != null ? lastException.getMessage() : "erreur inconnue"));
    }

    public Document parseHtml(String html) {
        if (html == null || html.trim().isEmpty()) {
            throw new IllegalArgumentException("HTML content is null or empty");
        }
        return Jsoup.parse(html);
    }

    public Document parseHtml(String html, String baseUri) {
        if (html == null || html.trim().isEmpty()) {
            throw new IllegalArgumentException("HTML content is null or empty");
        }
        return Jsoup.parse(html, baseUri);
    }


    private boolean isAllowedHeader(String headerName) {
        // Headers restreints par HttpClient (liste non exhaustive)
        String[] restrictedHeaders = {"connection", "content-length", "expect", "host", "upgrade"};

        String lowerCaseHeader = headerName.toLowerCase();

        // Vérifier les headers explicitement restreints
        for (String restricted : restrictedHeaders) {
            if (lowerCaseHeader.equals(restricted)) {
                return false;
            }
        }

        // Headers commençant par "sec-" sont souvent restreints
        return !lowerCaseHeader.startsWith("sec-");
    }

    private String getStatusMessage(int statusCode) {
        return switch (statusCode) {
            case 400 -> "Bad Request";
            case 401 -> "Unauthorized";
            case 403 -> "Forbidden";
            case 404 -> "Not Found";
            case 405 -> "Method Not Allowed";
            case 429 -> "Too Many Requests";
            case 500 -> "Internal Server Error";
            case 502 -> "Bad Gateway";
            case 503 -> "Service Unavailable";
            case 504 -> "Gateway Timeout";
            default -> "HTTP Error " + statusCode;
        };
    }

    public static Map<String, String> createHeaders() {
        Map<String, String> headers = new HashMap<>();
        headers.put("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        headers.put("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
        headers.put("Accept-Language", "fr-FR,fr;q=0.9,en;q=0.8");
        return headers;
    }

}