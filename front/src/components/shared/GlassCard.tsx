import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  padding = 'md' 
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`glass-card rounded-3xl fade-in ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;