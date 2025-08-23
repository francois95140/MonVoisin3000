#!/bin/bash
set -e

# Nettoyage
rm -rf build
mkdir -p build/deb/MonVoisin3000_1.0.0/{DEBIAN,opt/MonVoisin3000,usr/share/{applications,pixmaps}}

# Build Java
cd java && mvn clean package -q && cd ..

# Build microlangage executable
echo "🔧 Compilation du microlangage..."
cd microlangage && chmod +x build-executable.sh && ./build-executable.sh && cd ..

# Structure .deb
DEB=build/deb/MonVoisin3000_1.0.0
cp -r java $DEB/opt/MonVoisin3000/
cp dist/SQLUnification $DEB/opt/MonVoisin3000/
[ -f icone.svg ] && cp icone.svg $DEB/usr/share/pixmaps/MonVoisin3000.svg

# Control
cat > $DEB/DEBIAN/control << EOF
Package: monvoisin3000
Version: 1.0.0
Architecture: all
Depends: openjdk-21-jre, maven
Maintainer: MonVoisin Team
Description: Application de gestion de voisinage
EOF

# Post-install
cat > $DEB/DEBIAN/postinst << 'EOF'
#!/bin/bash
chmod +x /opt/MonVoisin3000/run.sh
chmod +x /opt/MonVoisin3000/SQLUnification
EOF

# Launcher
cat > $DEB/opt/MonVoisin3000/run.sh << 'EOF'
#!/bin/bash
cd /opt/MonVoisin3000/java && mvn javafx:run
EOF

# Desktop
cat > $DEB/usr/share/applications/MonVoisin3000.desktop << EOF
[Desktop Entry]
Name=MonVoisin3000
Exec=/opt/MonVoisin3000/run.sh
Icon=MonVoisin3000
Type=Application
Categories=Utility;
EOF

chmod 755 $DEB/DEBIAN/postinst $DEB/opt/MonVoisin3000/run.sh

# Créer .deb
dpkg-deb --build $DEB build/MonVoisin3000Installer.deb

# Nettoyage
rm -rf build/deb

echo "✓ build/MonVoisin3000Installer.deb"