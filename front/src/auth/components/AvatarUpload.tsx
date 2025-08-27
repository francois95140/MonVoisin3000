import React, { useState } from 'react';
import { IonIcon } from '../../components/shared';

interface AvatarUploadProps {
  id?: string;
  name?: string;
  onChange?: (base64: string) => void;
  className?: string;
  defaultImage?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  id = "photo", 
  name = "photo",
  onChange,
  className = "",
  defaultImage
}) => {
  const [previewImage, setPreviewImage] = useState<string>(defaultImage || '');

  // Fonction pour redimensionner l'image à 512x512px
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Définir la taille du canvas à 512x512
        canvas.width = 512;
        canvas.height = 512;

        // Calculer les dimensions pour un crop centré et carré
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        // Dessiner l'image redimensionnée sur le canvas
        ctx?.drawImage(img, x, y, size, size, 0, 0, 512, 512);

        // Convertir en base64 avec une qualité de 0.8 pour réduire la taille
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(base64);
      };

      // Lire le fichier comme URL pour l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      try {
        // Redimensionner l'image et obtenir le base64
        const resizedBase64 = await resizeImage(file);
        
        // Mettre à jour la preview
        setPreviewImage(resizedBase64);
        
        // Appeler le callback onChange avec le base64
        if (onChange) {
          onChange(resizedBase64);
        }
      } catch (error) {
        console.error('Erreur lors du redimensionnement de l\'image:', error);
      }
    }
  };

  return (
    <div className={`relative mb-4 flex justify-center ${className}`}>
      <div className="relative group cursor-pointer">
        {/* Input file qui couvre tout le composant */}
        <input
          type="file"
          id={id}
          name={name}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          accept="image/*"
          onChange={handleFileChange}
        />
        
        <div
          id={`${id}back`}
          className="h-32 w-32 overflow-hidden rounded-full photo bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl group-hover:scale-105 group-hover:shadow-xl focus-within:scale-105 focus-within:shadow-xl focus-within:ring-2 focus-within:ring-cyan-400 focus-within:ring-opacity-50"
        >
          {previewImage ? (
            <img 
              src={previewImage} 
              alt="Avatar preview" 
              className="h-full w-full object-cover"
            />
          ) : (
            <IonIcon
              name="person"
              className="text-white text-4xl"
            />
          )}
        </div>
        
        <div className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 shadow-lg transition-all duration-300 group-hover:bg-indigo-700 group-hover:scale-110">
          <IonIcon
            name="camera"
            className="text-white text-base transition-all duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;