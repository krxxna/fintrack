import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('ft_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('ft_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const isDark  = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark }}>
      <div className={theme === 'light' ? 'light' : ''} style={{ minHeight: '100vh' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
