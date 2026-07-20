import React from 'react';
import './Badge.css';

const Badge = ({ 
  children, 
  text, 
  variant = 'default', 
  size = 'md',
  color, // Optional custom hex/rgb color
  className = '' 
}) => {
  const style = color ? { backgroundColor: color, color: '#fff' } : {};
  const variantClass = color ? '' : `badge-${variant}`;

  return (
    <span 
      className={`badge badge-${size} ${variantClass} ${className}`}
      style={style}
    >
      {text || children}
    </span>
  );
};

export default Badge;
