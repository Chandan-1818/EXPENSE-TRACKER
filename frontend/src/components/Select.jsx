import React from 'react';
import './Select.css';

const Select = React.memo(React.forwardRef(({ 
  label, 
  error, 
  id, 
  className = '', 
  options = [],
  placeholder = 'Select an option',
  value,
  ...props 
}, ref) => {
  return (
    <div className={`select-group ${error ? 'has-error' : ''} ${className}`}>
      {label && <label htmlFor={id} className="select-label">{label}</label>}
      <div className="select-wrapper">
        <select 
          id={id} 
          ref={ref}
          className="select-field" 
          value={value !== undefined ? value : undefined}
          defaultValue={value === undefined ? "" : undefined}
          {...props}
        >
          <option value="" disabled hidden>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="select-icon">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {error && <span className="select-error">{error}</span>}
    </div>
  );
}));

Select.displayName = 'Select';

export default Select;
