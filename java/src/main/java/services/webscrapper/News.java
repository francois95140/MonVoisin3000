package services.webscrapper;

import model.Article;
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

    private final WebFetcher webFetcher;
    private static final int MAX_AI_CHARACTERS = 4000;
    private static final int MAX_SUMMARY_LENGTH = 500;

    public News() {
        this.webFetcher = new WebFetcher();
    }

    public List<Article> getNews(String sujet, int limite) throws IOException, InterruptedException {
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

    private List<Article> parseArticles(Document doc, int limite) {
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
            } catch (Exception e) {System.out.println(e.getMessage());}
        }
        return articles;
    }

    private Article extractArticle(Element element) {
        String titre = extractTitle(element);
        if (titre == null || titre.trim().isEmpty()) {return null;}
        String url = extractUrl(element);
        String source = extractSource(element);
        String date = extractDate(element);
        String imageUrl = extractImageUrl(element);

        return new Article(titre, null, url, source, date, imageUrl, new List<String>() {
            @Override
            public int size() {
                return 0;
            }

            @Override
            public boolean isEmpty() {
                return false;
            }

            @Override
            public boolean contains(Object o) {
                return false;
            }

            @Override
            public Iterator<String> iterator() {
                return null;
            }

            @Override
            public Object[] toArray() {
                return new Object[0];
            }

            @Override
            public <T> T[] toArray(T[] a) {
                return null;
            }

            @Override
            public boolean add(String s) {
                return false;
            }

            @Override
            public boolean remove(Object o) {
                return false;
            }

            @Override
            public boolean containsAll(Collection<?> c) {
                return false;
            }

            @Override
            public boolean addAll(Collection<? extends String> c) {
                return false;
            }

            @Override
            public boolean addAll(int index, Collection<? extends String> c) {
                return false;
            }

            @Override
            public boolean removeAll(Collection<?> c) {
                return false;
            }

            @Override
            public boolean retainAll(Collection<?> c) {
                return false;
            }

            @Override
            public void clear() {

            }

            @Override
            public boolean equals(Object o) {
                return false;
            }

            @Override
            public int hashCode() {
                return 0;
            }

            @Override
            public String get(int index) {
                return "";
            }

            @Override
            public String set(int index, String element) {
                return "";
            }

            @Override
            public void add(int index, String element) {

            }

            @Override
            public String remove(int index) {
                return "";
            }

            @Override
            public int indexOf(Object o) {
                return 0;
            }

            @Override
            public int lastIndexOf(Object o) {
                return 0;
            }

            @Override
            public ListIterator<String> listIterator() {
                return null;
            }

            @Override
            public ListIterator<String> listIterator(int index) {
                return null;
            }

            @Override
            public List<String> subList(int fromIndex, int toIndex) {
                return List.of();
            }
        }, 0);
    }

    private String extractTitle(Element element) {
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


    private String extractUrl(Element element) {
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

    private String extractSource(Element element) {
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

    private String extractDate(Element element) {
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

    private String extractImageUrl(Element element) {
        Elements images = element.select("img[src]");
        if (!images.isEmpty()) {return images.first().attr("src");}
        return "";
    }

    private String formatDate(String datetime) {
        try {
            if (datetime.contains("T")) {
                LocalDateTime date = LocalDateTime.parse(datetime.replace("Z", ""));
                return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
            }
        } catch (Exception e) {System.out.println(e.getMessage());}
        return datetime;
    }

    private boolean isValidArticle(Article article) {
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
        News newsService = new News();

        try {
            System.out.println("=== TEST DÉTAILLÉ AVEC 1 ARTICLE ===");
            List<Article> articlesTest = newsService.getNews("Intelligence artificielle", 1);
            for (Article article : articlesTest) {
                System.out.println(article.toFormattedString());
            }

        } catch (Exception e) {
            System.err.println("❌ Erreur: " + e.getMessage());
            e.printStackTrace();
        }
    }
}