import React from 'react';
import Button from './Button';
import './EmptyState.css';

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  primaryAction, 
  primaryActionText,
  secondaryAction,
  secondaryActionText,
  action
}) => {
  // Support both old action prop and new primaryAction/secondaryAction
  const handlePrimaryAction = action?.onClick || primaryAction;
  const handlePrimaryActionText = action?.label || primaryActionText;

  return (
    <div className="empty-state-container">
      {icon && (
        <div className="empty-state-icon">
          {icon}
        </div>
      )}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      
      {(handlePrimaryAction || secondaryAction) && (
        <div className="empty-state-actions">
          {handlePrimaryAction && (
            <Button variant="primary" onClick={handlePrimaryAction}>
              {handlePrimaryActionText}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="secondary" onClick={secondaryAction}>
              {secondaryActionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
