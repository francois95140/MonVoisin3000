package model;

public class Utilisateur {

    private int id_utilisateur;
    private String nom;
    private String prenom;
    private String email;
    private String mot_de_passe;
    private Role role;

    public enum Role {
        Default,
        Secretaire,
        Professeur,
        Gestionnaire_de_stock,
        Admin
    }



    // Constructors

    public Utilisateur(int id_utilisateur, String nom, String prenom, String email, String mot_de_passe, Role role) {
        this.id_utilisateur = id_utilisateur;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.mot_de_passe = mot_de_passe;
        this.role = role;
    }

    public Utilisateur(String nom, String prenom, String email, String mot_de_passe, Role role) {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.mot_de_passe = mot_de_passe;
        this.role = role;
    }

    // Getters and Setters

    public int getId_utilisateur() {
        return id_utilisateur;
    }
    public void setId_utilisateur(int id_utilisateur) {
        this.id_utilisateur = id_utilisateur;
    }
    public String getNom() {
        return nom;
    }
    public void setNom(String nom) {
        this.nom = nom;
    }
    public String getPrenom() {
        return prenom;
    }
    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getMot_de_passe() {
        return mot_de_passe;
    }
    public void setMot_de_passe(String mot_de_passe) {
        this.mot_de_passe = mot_de_passe;
    }
    public Role getRole() {
        return role;
    }
    public void setRole(Role role) {
        this.role = role;
    }
}
