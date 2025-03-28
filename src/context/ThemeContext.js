import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [isDark, setIsDark] = useState(false);
  
  // Theme styles
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

  // Load theme preference from localStorage or user settings
  useEffect(() => {
    // First check localStorage for theme preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else if (currentUser) {
      // If no localStorage theme but user is logged in, check Firestore
      const fetchUserTheme = async () => {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists() && userDoc.data().settings?.theme) {
            const userTheme = userDoc.data().settings.theme;
            setIsDark(userTheme === 'dark');
            localStorage.setItem('theme', userTheme);
          }
        } catch (error) {
          console.error('Error fetching user theme:', error);
        }
      };
      
      fetchUserTheme();
    } else {
      // If no saved theme and no user, check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }
  }, [currentUser]);

  // Apply theme to document
  useEffect(() => {
    // Add or remove dark class from body
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-theme');
    }
  }, [isDark]);

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    const newThemeString = newIsDark ? 'dark' : 'light';
    
    // Update state
    setIsDark(newIsDark);
    
    // Save to localStorage
    localStorage.setItem('theme', newThemeString);
    
    // If user is logged in, save to Firestore
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          'settings.theme': newThemeString
        });
      } catch (error) {
        console.error('Error updating theme preference:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
