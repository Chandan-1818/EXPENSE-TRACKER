import React from 'react';
import './CurrencyInput.css';

const CurrencyInput = React.forwardRef(({ 
  label, 
  error, 
  id, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className={`currency-group ${error ? 'has-error' : ''} ${className}`}>
      {label && <label htmlFor={id} className="currency-label">{label}</label>}
      <div className="currency-wrapper">
        <span className="currency-prefix">₹</span>
        <input 
          id={id} 
          type="number"
          step="0.01"
          ref={ref}
          className="currency-field" 
          {...props} 
        />
      </div>
      {error && <span className="currency-error">{error}</span>}
    </div>
  );
});

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;
