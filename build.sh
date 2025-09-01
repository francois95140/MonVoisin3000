#!/bin/bash

echo "🔨 Building Backend..."
cd voisin-api
npm run build
cd ..

echo "🔨 Building Frontend..."
cd front
npm run build
cd ..

echo "✅ Build completed!"