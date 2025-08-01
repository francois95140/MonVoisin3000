import React from 'react';
import IonIcon from './IonIcon';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  icon,
  iconPosition = 'left'
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-500',
    secondary: 'text-white bg-indigo-400 hover:bg-indigo-500 focus:ring-indigo-400',
    danger: 'text-white bg-red-500 hover:bg-red-600 focus:ring-red-500',
    success: 'text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:ring-green-500',
    ghost: 'text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-gray-400'
  };
  
  const sizeClasses = {
    sm: 'py-1 px-4 text-sm',
    md: 'py-2 px-8 text-lg',
    lg: 'py-3 px-10 text-xl'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {icon && iconPosition === 'left' && (
        <IonIcon name={icon} className="mr-2" />
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <IonIcon name={icon} className="ml-2" />
      )}
    </button>
  );
};

export default Button;