@echo off
echo === SETUP ENVIRONNEMENT PYTHON ===

REM Suppression des anciens dossiers
if exist venv (
    echo Suppression de l'ancien environnement virtuel...
    rmdir /s /q venv
)

if exist __pycache__ (
    echo Suppression du cache Python...
    rmdir /s /q __pycache__
)

REM Création du nouvel environnement virtuel
echo Creation de l'environnement virtuel...
python -m venv venv

REM Vérification que l'environnement a été créé
if not exist venv\Scripts\activate.bat (
    echo ERREUR: Impossible de creer l'environnement virtuel
    echo Verifiez que Python est installe et accessible via 'python'
    pause
    exit /b 1
)

REM Activation de l'environnement virtuel
echo Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

REM Mise à jour de pip
echo Mise a jour de pip...
python -m pip install --upgrade pip

REM Installation des dépendances
echo Installation des dependances...
if exist requirements.txt (
    pip install -r requirements.txt
    echo === SETUP TERMINE AVEC SUCCES ===
) else (
    echo ATTENTION: Fichier requirements.txt non trouve
    echo === SETUP TERMINE (sans installation des dependances) ===
)

