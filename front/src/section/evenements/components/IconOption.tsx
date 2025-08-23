import React from 'react';

const IconOption: React.FC<{ dataIcon: string }> = ({ dataIcon }) => {
  return (
    <ion-icon name={dataIcon} className="text-white text-xl"></ion-icon>
  );
};

export default IconOption;