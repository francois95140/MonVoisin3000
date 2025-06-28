package model;

import java.util.List;

public class Article {

    private final String titre;
    private String description;  // Non final pour permettre la modification
    private final String url;
    private final String source;
    private final String datePublication;
    private final String imageUrl;

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

    // Seul setter pour la description (pour permettre l'ajout du résumé IA)
    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return String.format("Article{titre='%s', source='%s', date='%s', url='%s'}",
                titre, source, datePublication, url);
    }

    public String toFormattedString() {
        StringBuilder sb = new StringBuilder();
        sb.append("📰 ").append(titre).append("\n");
        sb.append("🔗 Source: ").append(source).append("\n");
        if (datePublication != null && !datePublication.isEmpty()) {
            sb.append("📅 Date: ").append(datePublication).append("\n");
        }
        if (description != null && !description.isEmpty()) {
            sb.append("📝 ").append(description).append("\n");
        }
        sb.append("🌐 URL: ").append(url).append("\n");
        sb.append("─".repeat(50)).append("\n");
        return sb.toString();
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
}