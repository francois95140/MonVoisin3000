#!/bin/bash
set -e

echo "🔧 Compilation du microlangage en exécutable standalone..."

# Créer un environnement virtuel temporaire pour la compilation
python3 -m venv build_env
source build_env/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Compilation avec PyInstaller
echo "📦 Création de l'exécutable avec PyInstaller..."
pyinstaller \
    --onefile \
    --name "SQLUnification" \
    --distpath "../dist" \
    --workpath "build_temp" \
    --specpath "build_temp" \
    --add-data "parser.out:." \
    --add-data "parsetab.py:." \
    SQLUnification1.py

# Nettoyage
deactivate
rm -rf build_env build_temp

echo "✅ Exécutable créé: ../dist/SQLUnification"
echo "   Usage: ./SQLUnification <type_bdd> \"<requête_sql>\""