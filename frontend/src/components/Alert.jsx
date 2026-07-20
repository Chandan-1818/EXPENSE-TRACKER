import React, { useState } from 'react';
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from 'react-icons/md';
import './Alert.css';

const Alert = ({ 
  type = 'info', 
  title, 
  children, 
  dismissible = false,
  onDismiss,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const icons = {
    success: <MdCheckCircle className="alert-icon" />,
    error: <MdError className="alert-icon" />,
    warning: <MdWarning className="alert-icon" />,
    info: <MdInfo className="alert-icon" />
  };

  return (
    <div className={`alert alert-${type} ${className}`} role="alert">
      <div className="alert-icon-wrapper">
        {icons[type]}
      </div>
      <div className="alert-content">
        {title && <h4 className="alert-title">{title}</h4>}
        <div className="alert-body">{children}</div>
      </div>
      {dismissible && (
        <button className="alert-close" onClick={handleDismiss} aria-label="Dismiss alert">
          <MdClose />
        </button>
      )}
    </div>
  );
};

export default Alert;
