package repository;

import model.User;
import services.bdd.Bdd;
import services.security.Security;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;

/**
 * Repository pour la gestion des utilisateurs
 * Utilise PostgreSQL via le module Bdd et BCrypt pour les mots de passe
 */
public class UserRepository {

    private static final String DATABASE = "postgres";
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final int MAX_TAG_LENGTH = 20;

    /**
     * Méthode de connexion - vérifie email et mot de passe
     * @param email Email de l'utilisateur
     * @param password Mot de passe en clair
     * @return User si connexion réussie, null sinon
     */
    public static User connect(String email, String password) {
        if (email == null || password == null || email.trim().isEmpty() || password.trim().isEmpty()) {
            return null;
        }

        try {
            // Requête pour récupérer l'utilisateur par email
            String query = String.format(
                    "SELECT * FROM users WHERE email = '%s' AND isActive = TRUE AND deletedAt IS NULL",
                    email.replace("'", "''")
            );
            System.out.println("requete: "+query);
            String result = Bdd.request(DATABASE, query);
            System.out.println("retour: "+result);

            if (result == null || result.contains("Erreur") || result.trim().isEmpty() || result.equals("[]")) {
                return null;
            }

            // Parser le résultat JSON
            System.out.println("parsage du json en cours");
            JsonNode jsonResult = objectMapper.readTree(result);
            if (jsonResult.isArray() && jsonResult.size() > 0) {
                JsonNode userNode = jsonResult.get(0);
                String storedHash = userNode.get("password").asText();

                // Vérifier le mot de passe avec BCrypt
                System.out.println("verrification du mot de passe: "+password+"avec le hash: "+storedHash);
                if (Security.checkBcrypt(password, storedHash)) {
                    System.out.println("mot de passe correct");
                    User user = mapJsonToUser(userNode);

                    // Mettre à jour la date de dernière connexion
                    updateLastLogin(user.getId());
                    user.setLastLogin(LocalDateTime.now());

                    return user;
                }
                System.out.println("mot de passe incorrect");
            }

            return null;

        } catch (Exception e) {
            System.err.println("Erreur lors de la connexion: " + e.getMessage());
            return null;
        }
    }


    /**
     * Met à jour la date de dernière connexion
     */
    private static void updateLastLogin(Long userId) {
        try {
            String query = String.format(
                    "UPDATE users SET lastLogin = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = %d",
                    userId
            );

            System.out.println(query);
            Bdd.request(DATABASE, query);
        } catch (Exception e) {
            System.err.println("Erreur lors de la mise à jour de lastLogin: " + e.getMessage());
        }
    }

    /**
     * Mappe un JsonNode vers un objet User
     */
    private static User mapJsonToUser(JsonNode node) {
        User user = new User();

        user.setId(node.has("id") ? node.get("id").asLong() : null);
        user.setTag(node.has("tag") && !node.get("tag").isNull() ? node.get("tag").asText() : null);
        user.setEmail(node.has("email") && !node.get("email").isNull() ? node.get("email").asText() : null);
        user.setPassword(node.has("password") && !node.get("password").isNull() ? node.get("password").asText() : null);
        user.setPseudo(node.has("pseudo") && !node.get("pseudo").isNull() ? node.get("pseudo").asText() : null);
        user.setAvatar(node.has("avatar") && !node.get("avatar").isNull() ? node.get("avatar").asText() : null);
        user.setBio(node.has("bio") && !node.get("bio").isNull() ? node.get("bio").asText() : null);
        user.setIsVerified(node.has("isverified") ? node.get("isverified").asBoolean() : false);
        user.setIsActive(node.has("isactive") ? node.get("isactive").asBoolean() : true);
        user.setRole(node.has("role") && !node.get("role").isNull() ? node.get("role").asText() : "USER");
        user.setPasswordResetCode(node.has("passwordresetcode") && !node.get("passwordresetcode").isNull() ?
                node.get("passwordresetcode").asText() : null);
        user.setPreferences(node.has("preferences") && !node.get("preferences").isNull() ?
                node.get("preferences").asText() : null);
        user.setPhoneNumber(node.has("phonenumber") && !node.get("phonenumber").isNull() ?
                node.get("phonenumber").asText() : null);
        user.setLocation(node.has("location") && !node.get("location").isNull() ?
                node.get("location").asText() : null);
        user.setTimezone(node.has("timezone") && !node.get("timezone").isNull() ?
                node.get("timezone").asText() : null);
        user.setLanguage(node.has("language") && !node.get("language").isNull() ?
                node.get("language").asText() : null);
        user.setConversationCount(node.has("conversationcount") ? node.get("conversationcount").asInt() : 0);
        user.setFriendCount(node.has("friendcount") ? node.get("friendcount").asInt() : 0);
        user.setRefreshToken(node.has("refreshtoken") && !node.get("refreshtoken").isNull() ?
                node.get("refreshtoken").asText() : null);

        // Parse dates avec gestion robuste des null
        try {
            if (node.has("lastlogin") && !node.get("lastlogin").isNull()) {
                String dateStr = node.get("lastlogin").asText();
                if (dateStr != null && !dateStr.trim().isEmpty()) {
                    user.setLastLogin(LocalDateTime.parse(dateStr.replace(" ", "T")));
                }
            }
            if (node.has("createdat") && !node.get("createdat").isNull()) {
                String dateStr = node.get("createdat").asText();
                if (dateStr != null && !dateStr.trim().isEmpty()) {
                    user.setCreatedAt(LocalDateTime.parse(dateStr.replace(" ", "T")));
                }
            }
            if (node.has("updatedat") && !node.get("updatedat").isNull()) {
                String dateStr = node.get("updatedat").asText();
                if (dateStr != null && !dateStr.trim().isEmpty()) {
                    user.setUpdatedAt(LocalDateTime.parse(dateStr.replace(" ", "T")));
                }
            }
            if (node.has("deletedat") && !node.get("deletedat").isNull()) {
                String dateStr = node.get("deletedat").asText();
                if (dateStr != null && !dateStr.trim().isEmpty()) {
                    user.setDeletedAt(LocalDateTime.parse(dateStr.replace(" ", "T")));
                }
            }
        } catch (Exception e) {
            System.err.println("Erreur lors du parsing des dates: " + e.getMessage());
        }

        return user;
    }

}