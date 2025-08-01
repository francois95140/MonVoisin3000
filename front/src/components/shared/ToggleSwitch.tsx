import React from 'react';

interface ToggleSwitchProps {
  id?: string;
  name?: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  name,
  defaultChecked = false,
  onChange,
  disabled = false,
  className = ""
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input 
        type="checkbox" 
        id={id}
        name={name}
        className="sr-only peer" 
        defaultChecked={defaultChecked}
        onChange={handleChange}
        disabled={disabled}
      />
      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
    </label>
  );
};

export default ToggleSwitch;