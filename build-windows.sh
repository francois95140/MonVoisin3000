#!/bin/bash
set -e

# Vérification
command -v makensis >/dev/null || { echo "Installer NSIS: sudo apt install nsis"; exit 1; }

# Nettoyage  
rm -rf build
mkdir -p build/win

# Build Java
cd java && mvn clean package -q && cd ..

# Build microlangage executable
echo "🔧 Compilation du microlangage..."
cd microlangage && ./build-executable.bat && cd ..

# Copier app
cp -r java build/win/
cp dist/SQLUnification.exe build/win/

# Launcher Windows
cat > build/win/run.bat << 'EOF'
@echo off
cd /d "%~dp0\java"
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