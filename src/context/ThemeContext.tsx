import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const existing = useContext(ThemeContext);
  if (existing) {
    return <>{children}</>;
  }

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('vitalshell_theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const computeEffectiveTheme = (): 'light' | 'dark' => {
      if (theme === 'light') return 'light';
      if (theme === 'dark') return 'dark';
      return mediaQuery.matches ? 'dark' : 'light';
    };

    const updateTheme = () => {
      const eff = computeEffectiveTheme();
      setEffectiveTheme(eff);

      const root = document.documentElement;
      if (eff === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.style.colorScheme = 'light';
      }
    };

    updateTheme();

    const handler = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('vitalshell_theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback to prevent crashes if rendered outside ThemeProvider
    const isDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return {
      theme: 'system',
      effectiveTheme: isDark ? 'dark' : 'dark', // default to dark for tactical vitalshell archetype
      setTheme: () => {},
    };
  }
  return context;
};
