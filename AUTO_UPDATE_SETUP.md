# 🔄 Configuration du système d'auto-update

## 📋 Ce qui a été ajouté

### ✅ Compilation du microlangage
- Scripts `microlangage/build-executable.sh` et `microlangage/build-executable.bat`
- PyInstaller ajouté aux dépendances
- Plus besoin d'environnement Python sur les machines clientes

### ✅ Système d'auto-update Java
- `AutoUpdateService.java` - Service de vérification et téléchargement
- `UpdateController.java` - Interface utilisateur
- Fichiers FXML pour les thèmes light/dark
- Dépendance Gson ajoutée au pom.xml

### ✅ Scripts de build modifiés
- `build-deb.sh` et `build-windows.sh` compilent maintenant le microlangage
- Suppression des dépendances Python dans les packages
- Launchers simplifiés

### ✅ GitHub Actions
- Workflow `.github/workflows/release.yml`
- Build automatique Linux et Windows
- Création automatique de releases avec assets

## 🔧 Configuration requise sur GitHub

### 1. Activer GitHub Actions
- Aller dans `Settings > Actions > General`
- Cocher "Allow all actions and reusable workflows"

### 2. Permissions des tokens
- Aller dans `Settings > Actions > General > Workflow permissions`
- Cocher "Read and write permissions"

### 3. Créer votre première release
```bash
# Taguer une version
git add .
git commit -m "Setup auto-update system"
git tag v1.0.0
git push origin main
git push origin v1.0.0
```

### 4. Vérifier le workflow
- Aller dans l'onglet `Actions` de votre repo
- Le workflow devrait se déclencher automatiquement

## 🎯 Utilisation côté application

### Interface d'auto-update
Ajouter un bouton dans votre interface principale :
```java
// Dans votre contrôleur principal
@FXML
private void showUpdateInterface() {
    // Charger la vue Update.fxml
    // Afficher dans un nouvel onglet ou popup
}
```

### Vérification automatique au démarrage
```java
// Dans votre Main.java
public void start(Stage primaryStage) {
    // ... votre code existant ...
    
    // Vérification automatique des MAJ (optionnel)
    AutoUpdateService updateService = new AutoUpdateService();
    updateService.checkForUpdates();
}
```

## 🚀 Workflow de release

1. **Développement** : Faire vos modifications
2. **Commit** : `git add . && git commit -m "Nouvelle fonctionnalité"`
3. **Tag** : `git tag v1.1.0` (incrémenter la version)
4. **Push** : `git push origin main && git push origin v1.1.0`
5. **Automatique** : GitHub Actions build et crée la release
6. **Client** : L'application détecte automatiquement la nouvelle version

## 📦 Structure des packages

### Linux (.deb)
```
/opt/MonVoisin3000/
├── java/               # Application Java
├── SQLUnification      # Microlangage compilé
└── run.sh             # Launcher
```

### Windows (.exe)
```
C:\Program Files\MonVoisin3000\
├── java\              # Application Java
├── SQLUnification.exe # Microlangage compilé
└── run.bat           # Launcher
```

## 🔍 Résolution de problèmes

### Build qui échoue
- Vérifier que tous les scripts sont exécutables
- Vérifier les dépendances Python (requirements.txt)
- Regarder les logs dans l'onglet Actions

### Auto-update qui ne fonctionne pas
- Vérifier la connexion internet
- Vérifier l'URL de l'API GitHub
- Regarder les logs dans la console Java

### Version non détectée
- Mettre à jour `CURRENT_VERSION` dans `AutoUpdateService.java`
- Mettre à jour `version.json`
- Vérifier le format des tags (v1.0.0)

## 💡 Améliorations futures

- [ ] Signature des packages pour la sécurité
- [ ] Update différentiel (delta updates)
- [ ] Backup automatique avant update
- [ ] Channel de release (stable/beta/alpha)
- [ ] Vérification d'intégrité (checksums)