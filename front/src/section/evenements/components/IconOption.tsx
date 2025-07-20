import React from 'react';

const IconOption: React.FC<{ dataIcon: string }> = ({ dataIcon }) => {
  return (
    <div className="icon-option" data-icon={dataIcon}>
      <ion-icon name={dataIcon} className="text-white text-xl"></ion-icon>
    </div>
  );
};

export default IconOption;