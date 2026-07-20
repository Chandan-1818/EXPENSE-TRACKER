import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ 
  progress = 0, 
  label, 
  showPercentage = false, 
  variant = 'primary', 
  height = '8px',
  className = '' 
}) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`progress-container ${className}`}>
      {(label || showPercentage) && (
        <div className="progress-header">
          {label && <span className="progress-label">{label}</span>}
          {showPercentage && <span className="progress-percentage">{Math.round(clampedProgress)}%</span>}
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <div 
          className={`progress-fill bg-${variant}`} 
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
