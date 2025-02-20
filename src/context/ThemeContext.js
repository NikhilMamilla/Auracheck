import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const theme = {
    background: isDark ? 'bg-gray-900' : 'bg-gray-100',
    text: isDark ? 'text-gray-100' : 'text-gray-800',
    textBold: isDark ? 'text-white' : 'text-gray-900',
    card: isDark ? 'bg-gray-800/70 backdrop-blur-xl' : 'bg-white/70 backdrop-blur-xl shadow-md',
    border: isDark ? 'border-gray-600' : 'border-gray-300',
    button: isDark ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' : 'bg-gray-200 hover:bg-gray-300 text-indigo-700',
    accent: isDark ? 'text-yellow-300' : 'text-indigo-600',
    nav: isDark ? 'bg-gray-800/80 border-gray-600' : 'bg-white/70 border-gray-300'
  };

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
