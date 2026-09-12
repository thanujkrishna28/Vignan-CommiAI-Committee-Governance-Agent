import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getAppTheme } from '../theme/theme';

const ThemeContext = createContext({
  mode: 'light',
  toggleColorMode: () => {},
  setMode: () => {},
});

export function ThemeModeProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    const saved = localStorage.getItem('vignan_theme_mode');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Check user system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('vignan_theme_mode', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  const toggleColorMode = () => {
    setModeState((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const setMode = (newMode) => {
    if (newMode === 'light' || newMode === 'dark') {
      setModeState(newMode);
    }
  };

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  const contextValue = useMemo(
    () => ({
      mode,
      toggleColorMode,
      setMode,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};
