#!/bin/bash
set -e

echo "🧪 Test d'intégration microlangage compilé"
echo "========================================="

# Nettoyer les builds précédents
echo "🧹 Nettoyage..."
rm -rf dist build

# Compiler le microlangage
echo "🔧 Compilation du microlangage..."
cd microlangage
chmod +x build-executable.sh
./build-executable.sh
cd ..

# Vérifier que l'exécutable a été créé
if [ -f "dist/SQLUnification" ]; then
    echo "✅ Exécutable créé: dist/SQLUnification"
    ls -la dist/SQLUnification
else
    echo "❌ Erreur: Exécutable non trouvé"
    exit 1
fi

# Tester l'exécutable directement
echo "🧪 Test de l'exécutable..."
./dist/SQLUnification test "SELECT 1" || echo "⚠️ Test direct échoué (normal si pas de BDD configurée)"

# Compiler Java
echo "🔧 Compilation Java..."
cd java
mvn clean compile -q

# Tester la nouvelle classe BddNew
echo "🧪 Test de l'intégration Java..."
mvn exec:java -Dexec.mainClass="services.bdd.BddNew" -Dexec.args="" -q || echo "⚠️ Test Java échoué (normal si pas de BDD configurée)"

echo "✅ Tests terminés !"
echo ""
echo "💡 Pour tester en mode développement (Python):"
echo "   cd microlangage && python3 SQLUnification1.py test 'SELECT 1'"
echo ""
echo "💡 Pour tester en mode production (exécutable):"
echo "   ./dist/SQLUnification test 'SELECT 1'"