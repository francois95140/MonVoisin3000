package model;

import java.util.List;

public class Article {

    private final String titre;
    private String description;
    private final String url;
    private final String source;
    private final String datePublication;
    private final String imageUrl;
    private final List<String> tags;
    private final int sentiment; // -1: négatif, 0: neutre, 1: positif

    public Article(
            String titre,
            String description,
            String url,
            String source,
            String datePublication,
            String imageUrl,
            List<String> tags,
            int sentiment
    ) {
        this.titre = titre;
        this.description = description;
        this.url = url;
        this.source = source;
        this.datePublication = datePublication;
        this.imageUrl = imageUrl;
        this.tags = tags;
        this.sentiment = sentiment;
    }

    // Getters pour tous les champs
    public String getTitre() {
        return titre;
    }

    public String getDescription() {
        return description;
    }

    public String getUrl() {
        return url;
    }

    public String getSource() {
        return source;
    }

    public String getDatePublication() {
        return datePublication;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public List<String> getTags() {
        return tags;
    }

    public int getSentiment() {
        return sentiment;
    }

    // Seul setter pour la description (pour permettre l'ajout du résumé IA)
    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return String.format("Article{titre='%s', source='%s', date='%s', sentiment=%s, tags=%s, url='%s'}",
                titre, source, datePublication, getSentimentText(), tags, url);
    }

    public String toFormattedString() {
        StringBuilder sb = new StringBuilder();
        sb.append("📰 ").append(titre).append("\n");
        sb.append("🔗 Source: ").append(source).append("\n");

        if (datePublication != null && !datePublication.isEmpty()) {
            sb.append("📅 Date: ").append(datePublication).append("\n");
        }

        // Ajout du sentiment avec emoji
        sb.append("💭 Sentiment: ").append(getSentimentEmoji()).append(" ").append(getSentimentText()).append("\n");

        // Ajout des tags
        if (tags != null && !tags.isEmpty()) {
            sb.append("🏷️ Tags: ");
            for (int i = 0; i < tags.size(); i++) {
                sb.append(tags.get(i));
                if (i < tags.size() - 1) {
                    sb.append(", ");
                }
            }
            sb.append("\n");
        }

        if (description != null && !description.isEmpty()) {
            sb.append("📝 ").append(description).append("\n");
        }

        sb.append("🌐 URL: ").append(url).append("\n");
        sb.append("─".repeat(50)).append("\n");
        return sb.toString();
    }

    // Méthodes utilitaires pour le sentiment
    public String getSentimentText() {
        switch (sentiment) {
            case -1: return "Négatif";
            case 0: return "Neutre";
            case 1: return "Positif";
            default: return "Inconnu";
        }
    }

    public String getSentimentEmoji() {
        switch (sentiment) {
            case -1: return "😞";
            case 0: return "😐";
            case 1: return "😊";
            default: return "❓";
        }
    }

    // Méthode utilitaire pour vérifier si l'article a une description
    public boolean hasDescription() {
        return description != null && !description.trim().isEmpty();
    }

    // Méthode utilitaire pour obtenir une description courte (pour affichage)
    public String getShortDescription(int maxLength) {
        if (description == null || description.trim().isEmpty()) {
            return "Aucune description disponible";
        }

        if (description.length() <= maxLength) {
            return description;
        }

        return description.substring(0, maxLength - 3) + "...";
    }

    // Méthode utilitaire pour obtenir les tags sous forme de chaîne
    public String getTagsAsString() {
        if (tags == null || tags.isEmpty()) {
            return "Aucun tag";
        }
        return String.join(", ", tags);
    }

    public String getColorForSentiment() {
        switch (this.sentiment) {
            case -1: return "#dc3545"; // Rouge pour négatif
            case 1: return "#28a745";  // Vert pour positif
            default: return "#667eea"; // Violet par défaut pour neutre
        }
    }
}