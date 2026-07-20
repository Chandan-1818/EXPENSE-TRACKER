import React, { useState, useRef, useEffect } from 'react';
import './DropdownMenu.css';

const DropdownMenu = ({ 
  trigger, 
  items = [], 
  align = 'left' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleKeyDown = (e, index, item) => {
    if (item.disabled) return;

    const menuItems = dropdownRef.current.querySelectorAll('.dropdown-item:not([disabled])');
    const currentIndex = Array.from(menuItems).findIndex(el => el === document.activeElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % menuItems.length;
      menuItems[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
      menuItems[prevIndex]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (item.onClick) {
        item.onClick();
        setIsOpen(false);
      }
    }
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <div 
        className="dropdown-trigger" 
        onClick={toggleDropdown}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>
      
      {isOpen && (
        <div className={`dropdown-content align-${align}`} role="menu">
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return <div key={index} className="dropdown-divider" role="separator" />;
            }
            if (item.type === 'group') {
              return (
                <div key={index} className="dropdown-group">
                  {item.label && <div className="dropdown-group-label">{item.label}</div>}
                  {item.children.map((child, childIndex) => (
                    <button
                      key={`${index}-${childIndex}`}
                      className="dropdown-item"
                      role="menuitem"
                      disabled={child.disabled}
                      onClick={() => {
                        if (!child.disabled && child.onClick) {
                          child.onClick();
                          setIsOpen(false);
                        }
                      }}
                      onKeyDown={(e) => handleKeyDown(e, childIndex, child)}
                    >
                      {child.icon && <span className="dropdown-item-icon">{child.icon}</span>}
                      {child.label}
                    </button>
                  ))}
                </div>
              );
            }

            return (
              <button
                key={index}
                className="dropdown-item"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled && item.onClick) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, index, item)}
              >
                {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
