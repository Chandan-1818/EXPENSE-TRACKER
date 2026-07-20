import React from 'react';
import './Button.css';

const Button = React.memo(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isFullWidth = false, 
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const fullWidthClass = isFullWidth ? 'btn-full' : '';
  const loadingClass = isLoading ? 'btn-loading' : '';

  return (
    <button 
      type={type}
      className={`${baseClass} ${variantClass} ${sizeClass} ${fullWidthClass} ${loadingClass} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? <span className="loader"></span> : children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
