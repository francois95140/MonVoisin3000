package services.webscrapper;

import model.Article;
import services.tgpt.Tgpt;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class News {

    private static final WebFetcher webFetcher = new WebFetcher();

    public News() {

    }

    public static List<Article> getNews(String sujet, int limite) throws IOException, InterruptedException {
        if (sujet == null || sujet.trim().isEmpty()) {
            throw new IllegalArgumentException("Le sujet ne peut pas être vide");
        }

        String encodedSujet = URLEncoder.encode(sujet.trim(), StandardCharsets.UTF_8);
        String googleNewsUrl = String.format(
                "https://news.google.com/search?q=%s&hl=fr&gl=FR&ceid=FR:fr",
                encodedSujet
        );
        try {
            String html = webFetcher.fetch(googleNewsUrl, WebFetcher.createHeaders());
            Document doc = webFetcher.parseHtml(html);
            List<Article> articles = parseArticles(doc, limite);
            return articles;
        } catch (IOException e) {return new ArrayList<>();}
    }

    private static List<Article> parseArticles(Document doc, int limite) {
        List<Article> articles = new ArrayList<>();

        String[] selectors = {
                "article",
                "article[role='article']",
                "div[role='article']"
        };

        Elements articleElements = null;
        for (String selector : selectors) {
            articleElements = doc.select(selector);
            if (!articleElements.isEmpty()) {break;}
        }
        if (articleElements == null || articleElements.isEmpty()) {return articles;}

        int count = 0;
        for (Element element : articleElements) {
            if (count >= limite) break;

            try {
                Article article = extractArticle(element);
                if (article == null) {continue;}
                if (isValidArticle(article)) {
                    articles.add(article);
                    count++;
                }
            } catch (Exception e) {
                System.out.println("erreur lors de l'extraction de l'article: " + e.getMessage());
            }
        }
        return articles;
    }

    private static Article extractArticle(Element element) {
        String titre = extractTitle(element);
        if (titre == null || titre.trim().isEmpty()) {return null;}

        String url = extractUrl(element);
        String source = extractSource(element);
        String date = extractDate(element);
        String imageUrl = extractImageUrl(element);

        // analyse IA pour les tags et sentiment
        List<String> tags = new ArrayList<>();
        int sentiment = 0;

            try {
                AIAnalysisResult aiResult = analyzeWithAI(titre, source);
                tags = aiResult.tags;
                sentiment = aiResult.sentiment;
                Thread.sleep(1000);
            } catch (Exception e) {
                System.out.println("erreur IA pour l'article '" + titre + "': " + e.getMessage());
                // Fallback: tags et sentiment par défaut
                tags = Collections.singletonList("actu");
                sentiment = 0;
            }

        return new Article(titre, null, url, source, date, imageUrl, tags, sentiment);
    }

    private static AIAnalysisResult analyzeWithAI(String titre, String source) {
        String prompt = String.format(
                "Analyse ce titre d article de presse: \"%s\" (source: %s)\n\n" +
                        "Réponds EXACTEMENT dans ce format:\n" +
                        "TAGS: tag1,tag2,tag3\n" +
                        "SENTIMENT: -1|0|1\n\n" +
                        "Pour les TAGS: 3-5 mots-clés pertinents en français, séparés par des virgules (politique, économie, technologie, sport, santé, etc.)\n" +
                        "Pour le SENTIMENT: int entre 1 et -1,  -1 pour un sentiment négatif, 0 pour neutre ou 1 pour un sentiment positif",
                titre, source != null ? source : "inconnue"
        );


        try {
            String aiResponse = Tgpt.executeTgpt(prompt);
            //System.out.println(aiResponse);
            return parseAIResponse(aiResponse);
        } catch (Exception e) {
            throw new RuntimeException("erreur lors de l'appel à l'IA: " + e.getMessage());
        }
    }

    private static AIAnalysisResult parseAIResponse(String response) {
        List<String> tags = new ArrayList<>();
        int sentiment = 0;

        try {
            String[] lines = response.split("\n");

            for (String line : lines) {
                line = line.trim();

                if (line.toUpperCase().startsWith("TAGS:")) {
                    String tagsStr = line.substring(5).trim();
                    if (!tagsStr.isEmpty()) {
                        String[] tagArray = tagsStr.split(",");
                        for (String tag : tagArray) {
                            String cleanTag = tag.trim();
                            if (!cleanTag.isEmpty() && cleanTag.length() <= 20) {
                                tags.add(cleanTag);
                            }
                        }
                    }
                }

                if (line.toUpperCase().startsWith("SENTIMENT:")) {
                    String sentimentStr = line.substring(10).trim();
                    try {
                        sentiment = Integer.parseInt(sentimentStr);
                        // Validation des valeurs
                        if (sentiment < -1 || sentiment > 1) {
                            sentiment = 0;
                        }
                    } catch (NumberFormatException e) {
                        sentiment = 0;
                    }
                }
            }

            // Si aucun tag n'a été extrait, ajouter un tag par défaut
            if (tags.isEmpty()) {
                tags.add("actualité");
            }

        } catch (Exception e) {
            System.out.println("erreur lors du parsing de la réponse IA: " + e.getMessage());
            tags.add("actualité");
            sentiment = 0;
        }

        return new AIAnalysisResult(tags, sentiment);
    }

    private static class AIAnalysisResult {
        final List<String> tags;
        final int sentiment;

        AIAnalysisResult(List<String> tags, int sentiment) {
            this.tags = tags;
            this.sentiment = sentiment;
        }
    }

    private static String extractTitle(Element element) {
        String[] titleSelectors = {"h3 a", "h4 a", "a h3", "a h4", "h1", "h2", "h3", "a", "span"};

        for (String selector : titleSelectors) {
            Elements titleElements = element.select(selector);
            if (!titleElements.isEmpty()) {
                for (Element titleElement : titleElements) {
                    String titre = titleElement.text().trim();
                    if (titre.length() > 5) {
                        return titre.trim().replaceAll("^(\\d+\\s*)?(h|min|j)\\s*", "")
                                .replaceAll("\\s*-\\s*Google\\s*Actualités?$", "")
                                .replaceAll("\\s*\\|\\s*[^|]*$", "")
                                .trim();
                    }
                }
            }
        }

        String allText = element.text().trim();
        if (allText.length() > 10) {
            return allText.substring(0, Math.min(200, allText.length()));
        }

        return null;
    }

    private static String extractUrl(Element element) {
        Elements links = element.select("a[href]");

        if (!links.isEmpty()) {
            for (int i = 0; i < Math.min(3, links.size()); i++) {
                String href = links.get(i).attr("href");

                if (!href.isEmpty()) {
                    if (href.startsWith("./read/")) {
                        return "https://news.google.com" + href.substring(1);
                    } else if (href.startsWith("./articles/")) {
                        return "https://news.google.com" + href.substring(1);
                    } else if (href.startsWith("/articles/") || href.startsWith("/read/")) {
                        return "https://news.google.com" + href;
                    } else if (href.startsWith("https://") || href.startsWith("http://")) {
                        return href;
                    } else if (href.startsWith("/")) {
                        return "https://news.google.com" + href;
                    }
                }
            }
        }
        return "";
    }

    private static String extractSource(Element element) {
        Elements sourceElements = element.select(".source, .publisher, [data-source]");

        if (!sourceElements.isEmpty()) {
            String source = sourceElements.first().text().trim();
            if (!source.isEmpty()) {
                return source;
            }
        }

        String[] otherSelectors = {"cite", "div[data-n-tid]", "[role='text']", "time + span", "div > span"};
        for (String selector : otherSelectors) {
            Elements elements = element.select(selector);
            for (Element el : elements) {
                String text = el.text().trim();
                if (text.length() > 2 && text.length() < 50 &&
                        !text.equals("Plus") &&
                        !text.equals(element.select("a").first().text())) {
                    return text;
                }
            }
        }
        return "Source inconnue";
    }

    private static String extractDate(Element element) {
        Elements dateElements = element.select("time, .date, .timestamp, [datetime]");
        if (!dateElements.isEmpty()) {
            Element dateElement = dateElements.first();

            String datetime = dateElement.attr("datetime");
            if (!datetime.isEmpty()) {return formatDate(datetime);}
            String dateText = dateElement.text().trim();
            if (!dateText.isEmpty()) {return dateText;}
        }
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
    }

    private static String extractImageUrl(Element element) {
        Elements images = element.select("img[src]");
        if (!images.isEmpty()) {return images.first().attr("src");}
        return "";
    }

    private static String formatDate(String datetime) {
        try {
            if (datetime.contains("T")) {
                LocalDateTime date = LocalDateTime.parse(datetime.replace("Z", ""));
                return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            }
        } catch (Exception e) {System.out.println(e.getMessage());}
        return datetime;
    }

    private static boolean isValidArticle(Article article) {
        if (article == null || article.getTitre() == null) return false;
        String titre = article.getTitre().trim();
        if (titre.length() < 5 || titre.length() > 500) return false;
        String titreLower = titre.toLowerCase();
        String[] filtres = {"cookies", "javascript", "loading", "error", "404", "connexion", "login"};
        for (String filtre : filtres) {
            if (titreLower.contains(filtre)) {
                return false;
            }
        }
        return true;
    }


    public static void main(String[] args) {
        News newsService = new News(); // Activer l'IA

        try {
            System.out.println("=== TEST DÉTAILLÉ AVEC IA INTÉGRÉE ===");
            List<Article> articlesTest = newsService.getNews("Paris", 5);
            for (Article article : articlesTest) {
                System.out.println(article.toFormattedString());
            }

        } catch (Exception e) {
            System.out.println("❌ erreur: " + e.getMessage());
            e.printStackTrace();
        }
    }
}