#!/bin/bash
set -e

# Nettoyage
rm -rf build
mkdir -p build/deb/MonVoisin3000_1.0.0/{DEBIAN,opt/MonVoisin3000,usr/share/{applications,pixmaps}}

# Build Java
cd java && mvn clean package -q && cd ..

# Structure .deb
DEB=build/deb/MonVoisin3000_1.0.0
cp -r java microlangage $DEB/opt/MonVoisin3000/
[ -f icone.svg ] && cp icone.svg $DEB/usr/share/pixmaps/MonVoisin3000.svg

# Control
cat > $DEB/DEBIAN/control << EOF
Package: monvoisin3000
Version: 1.0.0
Architecture: all
Depends: openjdk-21-jre, python3, python3-pip, python3-venv, maven
Maintainer: MonVoisin Team
Description: Application de gestion de voisinage
EOF

# Post-install
cat > $DEB/DEBIAN/postinst << 'EOF'
#!/bin/bash
cd /opt/MonVoisin3000/microlangage
python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
chmod +x /opt/MonVoisin3000/run.sh
EOF

# Launcher
cat > $DEB/opt/MonVoisin3000/run.sh << 'EOF'
#!/bin/bash
cd /opt/MonVoisin3000
[ ! -d microlangage/venv ] && cd microlangage && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && cd ..
cd java && mvn javafx:run
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