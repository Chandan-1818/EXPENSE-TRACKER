import React, { useEffect } from 'react';
import { MdCheckCircle, MdError, MdInfo, MdClose } from 'react-icons/md';
import './Toast.css';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  isVisible 
}) => {
  useEffect(() => {
    if (isVisible && duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: <MdCheckCircle className="toast-icon success" />,
    error: <MdError className="toast-icon error" />,
    info: <MdInfo className="toast-icon info" />
  };

  return (
    <div className={`toast toast-${type}`}>
      {icons[type]}
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Close">
        <MdClose />
      </button>
    </div>
  );
};

export default Toast;
