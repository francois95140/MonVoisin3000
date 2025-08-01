import React from 'react';

interface SeparatorProps {
  text?: string;
  bgColor?: string;
  className?: string;
}

const Separator: React.FC<SeparatorProps> = ({ 
  text = "Ou continuer avec", 
  bgColor = "bg-gray-100",
  className = ""
}) => {
  return (
    <div className={`relative my-4 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t"></span>
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className={`${bgColor} px-2 text-muted-foreground`}>
          {text}
        </span>
      </div>
    </div>
  );
};

export default Separator;