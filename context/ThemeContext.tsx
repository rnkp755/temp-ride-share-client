import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Define theme colors
const lightTheme = {
  primary: '#4F46E5',
  background: '#F5F7FA',
  card: '#FFFFFF',
  text: '#1A202C',
  textSecondary: '#718096',
  border: '#E2E8F0',
  notification: '#FF4757',
  ripple: 'rgba(0, 0, 0, 0.1)',
};

const darkTheme = {
  primary: '#6366F1',
  background: '#1A202C',
  card: '#2D3748',
  text: '#F7FAFC',
  textSecondary: '#A0AEC0',
  border: '#4A5568',
  notification: '#FF6B78',
  ripple: 'rgba(255, 255, 255, 0.1)',
};

// Create context
const ThemeContext = createContext({
  theme: 'light',
  colors: lightTheme,
  toggleTheme: () => {},
});

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(colorScheme || 'light');
  
  // Update theme when system theme changes
  useEffect(() => {
    if (colorScheme) {
      setTheme(colorScheme);
    }
  }, [colorScheme]);
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  // Get current theme colors
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => useContext(ThemeContext);