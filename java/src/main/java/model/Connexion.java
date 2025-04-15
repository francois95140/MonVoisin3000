package model;


import java.time.LocalDateTime;

public class Connexion {

    private int id_connexion;
    private LocalDateTime date_heure_connexion;
    private int ref_utilisateur;



    // Constructors

    public Connexion(int id_connexion, LocalDateTime date_heure_connexion, int ref_utilisateur) {
        this.id_connexion = id_connexion;
        this.date_heure_connexion = date_heure_connexion;
        this.ref_utilisateur = ref_utilisateur;
    }
    
    public Connexion(LocalDateTime date_heure_connexion, int ref_utilisateur) {
        this.date_heure_connexion = date_heure_connexion;
        this.ref_utilisateur = ref_utilisateur;
    }

    // Getters and Setters

    public int getId_connexion() {
        return id_connexion;
    }
    public void setId_connexion(int id_connexion) {
        this.id_connexion = id_connexion;
    }
    public LocalDateTime getDate_heure_connexion() {
        return date_heure_connexion;
    }
    public void setDate_heure_connexion(LocalDateTime date_heure_connexion) {
        this.date_heure_connexion = date_heure_connexion;
    }
    public int getRef_utilisateur() {
        return ref_utilisateur;
    }
    public void setRef_utilisateur(int ref_utilisateur) {
        this.ref_utilisateur = ref_utilisateur;
    }
}