import React from 'react';
import './Input.css';

const Input = React.memo(React.forwardRef(({ 
  label, 
  error, 
  id, 
  className = '', 
  type = 'text',
  prefix,
  ...props 
}, ref) => {
  return (
    <div className={`input-group ${error ? 'has-error' : ''} ${className}`}>
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <div className="input-wrapper">
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input 
          id={id} 
          type={type} 
          inputMode={props.inputMode}
          ref={ref}
          className={`input-field ${prefix ? 'has-prefix' : ''}`}
          {...props} 
        />
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}));

Input.displayName = 'Input';

export default Input;
