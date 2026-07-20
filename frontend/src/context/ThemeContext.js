import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();
const VALID_THEMES = ['classic', 'modern-light', 'glass-dark', 'dark'];

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && VALID_THEMES.includes(savedTheme)) {
      return savedTheme;
    }
    return 'classic';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (VALID_THEMES.includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
