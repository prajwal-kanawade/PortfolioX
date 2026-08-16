import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { settingsAPI } from '../services/api';

export const ThemeContext = createContext();

export const THEMES = ['light', 'dark', 'ocean', 'sunset', 'midnight-purple'];

function getInitialTheme() {
  const stored = localStorage.getItem('theme');
  return THEMES.includes(stored) ? stored : 'light';
}

export const ThemeProvider = ({ children }) => {
  const auth = useContext(AuthContext);
  const isAuthenticated = !!auth?.user;
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Pull the user's saved theme on login so it follows them across devices,
  // mirroring AppearanceContext's accentColor/fontSize sync.
  useEffect(() => {
    if (!isAuthenticated) return;
    settingsAPI.get()
      .then((res) => {
        if (THEMES.includes(res.data.themeName)) setThemeState(res.data.themeName);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const setTheme = useCallback((t) => {
    if (THEMES.includes(t)) setThemeState(t);
  }, []);

  // Kept as a light/dark shim for any call site not yet migrated to the picker.
  const toggleTheme = useCallback(() => {
    setThemeState(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState(t => {
      const i = THEMES.indexOf(t);
      return THEMES[(i + 1) % THEMES.length];
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, cycleTheme, THEMES }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
