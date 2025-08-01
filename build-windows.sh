#!/bin/bash
set -e

# Vérification
command -v makensis >/dev/null || { echo "Installer NSIS: sudo apt install nsis"; exit 1; }

# Nettoyage  
rm -rf build
mkdir -p build/win

# Build Java
cd java && mvn clean package -q && cd ..

# Copier app
cp -r java microlangage build/win/

# Launcher Windows
cat > build/win/run.bat << 'EOF'
@echo off
cd /d "%~dp0"
if not exist "microlangage\venv" (
    cd microlangage
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    cd ..
)
cd java
mvn javafx:run
EOF

# Script NSIS
cat > build/installer.nsi << 'EOF'
Name "MonVoisin3000"
OutFile "MonVoisin3000Installer.exe"
InstallDir "$PROGRAMFILES64\MonVoisin3000"
RequestExecutionLevel admin

Page directory
Page instfiles

Section "Install"
    SetOutPath "$INSTDIR"
    File /r "win\*.*"
    CreateShortCut "$DESKTOP\MonVoisin3000.lnk" "$INSTDIR\run.bat"
    WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd

Section "Uninstall"
    RMDir /r "$INSTDIR"
    Delete "$DESKTOP\MonVoisin3000.lnk"
SectionEnd
EOF

# Créer .exe
cd build && makensis installer.nsi && cd ..

# Nettoyage
rm -rf build/win build/installer.nsi

echo "✓ build/MonVoisin3000Installer.exe"