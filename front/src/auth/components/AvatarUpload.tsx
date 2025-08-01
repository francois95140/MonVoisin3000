import React from 'react';
import { IonIcon } from '../../components/shared';

interface AvatarUploadProps {
  id?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      const photoback = document.getElementById(`${id}back`);
      if (photoback) {
        photoback.style.backgroundImage = `url(${base64String})`;
        photoback.style.backgroundSize = "cover";
        photoback.style.backgroundPosition = "center";
        photoback.classList.remove("bg-indigo-500");
      }
    };

    if (e.target.files && e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    if (onChange) {
      onChange(e);
    }
  };

  const containerStyle = defaultImage ? {
    backgroundImage: `url(${defaultImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  } : {};

  return (
    <div className={`relative mb-4 flex justify-center ${className}`}>
      <div
        id={`${id}back`}
        className={`h-32 w-32 ${!defaultImage ? 'bg-indigo-500' : ''} overflow-hidden rounded-full photo cursor-pointer`}
        style={containerStyle}
      >
        <input
          type="file"
          id={id}
          name={name}
          className="opacity-0 h-full w-full cursor-pointer"
          accept="image/*"
          onChange={handleFileChange}
        />
        <IonIcon
          name="camera"
          className="text-6xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 photoicon"
        />
      </div>
    </div>
  );
};

export default AvatarUpload;