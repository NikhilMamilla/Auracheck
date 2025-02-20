import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
    const { isDark, toggleTheme, theme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            type="button"
            className={`${theme.button} p-2 rounded-lg transition-all duration-200`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <Sun className="w-6 h-6 text-yellow-400" />
            ) : (
                <Moon className="w-6 h-6 text-indigo-800" />
            )}
        </button>
    );
};

export default ThemeToggle;
