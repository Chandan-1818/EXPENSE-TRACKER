import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Tabs.css';

const Tabs = ({ 
  tabs = [], 
  defaultTab = 0, 
  onChange 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabListRef = useRef(null);

  const updateIndicator = useCallback(() => {
    if (!tabListRef.current) return;
    const activeTabElement = tabListRef.current.querySelector(`[aria-selected="true"]`);
    if (activeTabElement) {
      setIndicatorStyle({
        width: activeTabElement.offsetWidth,
        left: activeTabElement.offsetLeft
      });
    }
  }, []);

  useEffect(() => {
    updateIndicator();
  }, [activeTab, tabs, updateIndicator]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const handleTabClick = (index, disabled) => {
    if (disabled) return;
    setActiveTab(index);
    if (onChange) {
      onChange(tabs[index].value || index);
    }
  };

  const handleKeyDown = (e, index, disabled) => {
    if (disabled) return;
    
    let nextIndex = index;
    const enabledTabs = tabs.map((t, i) => ({ ...t, i })).filter(t => !t.disabled);
    const currentIndexInEnabled = enabledTabs.findIndex(t => t.i === index);

    if (e.key === 'ArrowRight') {
      const next = (currentIndexInEnabled + 1) % enabledTabs.length;
      nextIndex = enabledTabs[next].i;
    } else if (e.key === 'ArrowLeft') {
      const prev = (currentIndexInEnabled - 1 + enabledTabs.length) % enabledTabs.length;
      nextIndex = enabledTabs[prev].i;
    }

    if (nextIndex !== index) {
      e.preventDefault();
      const nextTabElement = tabListRef.current.children[nextIndex];
      if (nextTabElement) {
        nextTabElement.focus();
        handleTabClick(nextIndex, false);
      }
    }
  };

  return (
    <div className="tabs-container">
      <div 
        className="tabs-list" 
        role="tablist" 
        ref={tabListRef}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;
          return (
            <button
              key={tab.id || index}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id || index}`}
              id={`tab-${tab.id || index}`}
              tabIndex={isActive ? 0 : -1}
              className={`tab-btn ${isActive ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
              onClick={() => handleTabClick(index, tab.disabled)}
              onKeyDown={(e) => handleKeyDown(e, index, tab.disabled)}
              disabled={tab.disabled}
            >
              {tab.icon && <span className="tab-icon">{tab.icon}</span>}
              {tab.label}
            </button>
          );
        })}
        <div className="tab-indicator" style={indicatorStyle} />
      </div>
      <div className="tabs-panels">
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;
          if (!isActive) return null; // Unmount inactive tabs
          return (
            <div
              key={tab.id || index}
              role="tabpanel"
              id={`panel-${tab.id || index}`}
              aria-labelledby={`tab-${tab.id || index}`}
              className="tab-panel active"
            >
              {tab.content}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
