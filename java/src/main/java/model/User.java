package model;

import java.time.LocalDateTime;

/**
 * Entité User correspondant à la structure de la table
 */
public class User {
    private Long id;
    private String tag;
    private String email;
    private String password; // Hash BCrypt
    private String pseudo;
    private String avatar;
    private String bio;
    private Boolean isVerified;
    private Boolean isActive;
    private String role;
    private LocalDateTime lastLogin;
    private String passwordResetCode;
    private String preferences; // JSON string
    private String phoneNumber;
    private String location;
    private String timezone;
    private String language;
    private Integer conversationCount;
    private Integer friendCount;
    private String refreshToken;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    // Constructeurs
    public User() {}

    public User(String email, String password, String pseudo) {
        this.email = email;
        this.password = password;
        this.pseudo = pseudo;
        this.isVerified = false;
        this.isActive = true;
        this.role = "USER";
        this.conversationCount = 0;
        this.friendCount = 0;
        this.language = "fr";
        this.timezone = "Europe/Paris";
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPseudo() { return pseudo; }
    public void setPseudo(String pseudo) { this.pseudo = pseudo; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

    public String getPasswordResetCode() { return passwordResetCode; }
    public void setPasswordResetCode(String passwordResetCode) { this.passwordResetCode = passwordResetCode; }

    public String getPreferences() { return preferences; }
    public void setPreferences(String preferences) { this.preferences = preferences; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public Integer getConversationCount() { return conversationCount; }
    public void setConversationCount(Integer conversationCount) { this.conversationCount = conversationCount; }

    public Integer getFriendCount() { return friendCount; }
    public void setFriendCount(Integer friendCount) { this.friendCount = friendCount; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", tag='" + tag + '\'' +
                ", email='" + email + '\'' +
                ", pseudo='" + pseudo + '\'' +
                ", isActive=" + isActive +
                ", role='" + role + '\'' +
                ", lastLogin=" + lastLogin +
                '}';
    }
}
