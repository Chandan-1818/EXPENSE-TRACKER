import React, { useEffect, useRef } from 'react';
import { MdClose } from 'react-icons/md';
import './Drawer.css';

const Drawer = ({ 
  isOpen, 
  onClose, 
  position = 'left', 
  children, 
  title = ''
}) => {
  const drawerRef = useRef(null);

  // Focus trap and Escape key handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }

      // Simple focus trap
      if (e.key === 'Tab' && isOpen && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div 
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        ref={drawerRef}
        className={`drawer drawer-${position} ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Drawer menu"}
        tabIndex={-1}
      >
        <div className="drawer-header">
          {title && <h2 className="drawer-title">{title}</h2>}
          <button 
            className="drawer-close" 
            onClick={onClose}
            aria-label="Close drawer"
          >
            <MdClose size={20} />
          </button>
        </div>
        <div className="drawer-content">
          {children}
        </div>
      </div>
    </>
  );
};

export default Drawer;
