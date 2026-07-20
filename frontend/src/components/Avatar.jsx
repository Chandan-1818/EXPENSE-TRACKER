import React from 'react';
import './Avatar.css';

const Avatar = ({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  status, 
  className = '' 
}) => {
  const getInitials = (nameStr) => {
    if (!nameStr) return '?';
    const parts = nameStr.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <div className={`avatar-container avatar-${size} ${className}`}>
      {src ? (
        <img src={src} alt={alt || name} className="avatar-image" />
      ) : (
        <div className="avatar-initials">
          {getInitials(name)}
        </div>
      )}
      
      {status && (
        <span className={`avatar-status status-${status}`} />
      )}
    </div>
  );
};

export default Avatar;
