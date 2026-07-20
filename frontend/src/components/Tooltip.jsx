import React, { useState, useRef, useLayoutEffect } from 'react';
import './Tooltip.css';

const Tooltip = ({ 
  content, 
  children, 
  position = 'top',
  delay = 200
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(position);
  const tooltipRef = useRef(null);
  const wrapperRef = useRef(null);
  let timeout;

  // Unique ID for ARIA
  const tooltipId = React.useId();

  useLayoutEffect(() => {
    if (isVisible && tooltipRef.current && wrapperRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let newPos = position;

      // Basic collision detection
      if (position === 'top' && tooltipRect.top < 0) newPos = 'bottom';
      if (position === 'bottom' && tooltipRect.bottom > window.innerHeight) newPos = 'top';
      if (position === 'left' && tooltipRect.left < 0) newPos = 'right';
      if (position === 'right' && tooltipRect.right > window.innerWidth) newPos = 'left';
      
      if (newPos !== currentPosition) {
        setCurrentPosition(newPos);
      }
    }
  }, [isVisible, position, currentPosition]);

  const showTooltip = () => {
    timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeout);
    setIsVisible(false);
    setCurrentPosition(position); // reset to default when hidden
  };

  // Add aria-describedby to children if they are valid React elements
  const childElement = React.isValidElement(children) 
    ? React.cloneElement(children, {
        'aria-describedby': isVisible ? tooltipId : undefined,
      })
    : children;

  return (
    <div 
      className="tooltip-wrapper"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      ref={wrapperRef}
    >
      {childElement}
      {isVisible && (
        <div 
          id={tooltipId}
          ref={tooltipRef}
          className={`tooltip-box tooltip-${currentPosition}`} 
          role="tooltip"
        >
          {content}
          <span className="tooltip-arrow"></span>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
