@echo off
echo 🔧 Compilation du microlangage en exécutable standalone...

REM Créer un environnement virtuel temporaire pour la compilation
python -m venv build_env
call build_env\Scripts\activate.bat

REM Installer les dépendances
pip install -r requirements.txt

REM Compilation avec PyInstaller
echo 📦 Création de l'exécutable avec PyInstaller...
pyinstaller ^
    --onefile ^
    --name "SQLUnification" ^
    --distpath "../dist" ^
    --workpath "build_temp" ^
    --specpath "build_temp" ^
    --add-data "parser.out;." ^
    --add-data "parsetab.py;." ^
    SQLUnification1.py

REM Nettoyage
call deactivate
rmdir /s /q build_env build_temp

echo ✅ Exécutable créé: ../dist/SQLUnification.exe
echo    Usage: SQLUnification.exe ^<type_bdd^> "^<requête_sql^>"