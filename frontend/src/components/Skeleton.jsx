import React from 'react';
import './Skeleton.css';

const Skeleton = ({ 
  type = 'text', 
  width, 
  height, 
  className = '',
  count = 1
}) => {
  const elements = [];
  
  for (let i = 0; i < count; i++) {
    elements.push(
      <div 
        key={i}
        className={`skeleton skeleton-${type} ${className}`}
        style={{ width, height }}
      ></div>
    );
  }

  return <>{elements}</>;
};

export default Skeleton;
