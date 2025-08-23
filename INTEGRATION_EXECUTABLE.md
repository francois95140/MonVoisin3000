# 🔧 Intégration exécutable microlangage

## ✅ **Modifications effectuées**

### 1. **Nouveau système d'exécution**
- `MicrolangageExecutor.java` - Gestionnaire intelligent qui choisit automatiquement entre:
  - **Mode production**: Utilise l'exécutable compilé `SQLUnification`
  - **Mode développement**: Utilise Python avec l'environnement virtuel

### 2. **Modernisation du code BDD**
- `BddNew.java` - Version simplifiée qui utilise `MicrolangageExecutor`
- Remplacement de tous les appels `Bdd.` par `BddNew.` dans:
  - `Main.java` 
  - `MainController.java`
  - `UserRepository.java`

### 3. **Détection automatique d'environnement**
- **Production détectée** si l'exécutable `SQLUnification` existe
- **Développement détecté** sinon (utilise Python + venv)
- Chemins de recherche intelligents:
  - `./SQLUnification` (répertoire courant)
  - `../SQLUnification` (build local)
  - `../dist/SQLUnification` (build dans dist)
  - `/opt/MonVoisin3000/SQLUnification` (installation système)

### 4. **Scripts de build mis à jour**
- `build-deb.sh` et `build-windows.sh` compilent automatiquement le microlangage
- Plus de dépendances Python dans les packages
- Launchers simplifiés

## 🧪 **Test de l'intégration**

Utilise le script de test :
```bash
./test-integration.sh
```

Ou manuellement :
```bash
# 1. Compiler le microlangage
cd microlangage && ./build-executable.sh && cd ..

# 2. Tester l'exécutable
./dist/SQLUnification test "SELECT 1"

# 3. Tester l'intégration Java
cd java && mvn exec:java -Dexec.mainClass="services.bdd.BddNew"
```

## 🔄 **Fonctionnement automatique**

### En développement
```
Java détecte: Pas d'exécutable SQLUnification
→ Mode développement activé
→ Utilise: cd ../microlangage && python3 SQLUnification1.py
```

### En production
```
Java détecte: Exécutable SQLUnification présent
→ Mode production activé  
→ Utilise: ./SQLUnification directement
```

## 📋 **Avantages**

- ✅ **Pas d'environnement Python** requis sur les machines clientes
- ✅ **Transition transparente** dev → production
- ✅ **Performance améliorée** (exécutable natif)
- ✅ **Simplicité d'installation** (un seul fichier)
- ✅ **Compatibilité maintenue** avec le code existant

## 🔍 **Debug**

Pour voir quel mode est utilisé :
```java
System.out.println(MicrolangageExecutor.getEnvironmentInfo());
```

## 📁 **Structure finale**

### Développement
```
MonVoisin3000/
├── java/                    # Code Java
├── microlangage/           # Code Python source
│   ├── venv/              # Environnement virtuel
│   └── SQLUnification1.py # Script principal
└── dist/                  # (créé après build)
    └── SQLUnification     # Exécutable compilé
```

### Production (installée)
```
/opt/MonVoisin3000/
├── java/                  # Application Java
├── SQLUnification         # Microlangage compilé
└── run.sh                # Launcher
```

## ⚡ **Prochaines étapes**

1. Tester avec tes vraies bases de données
2. Valider les performances
3. Builder et tester les packages .deb/.exe
4. Déployer une release sur GitHub

L'intégration est prête ! 🚀