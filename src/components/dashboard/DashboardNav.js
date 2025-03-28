import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../context/UserDataContext';
import { useTheme } from '../../context/ThemeContext';

const DashboardNav = ({ activeSection, onSectionChange }) => {
  const { currentUser, logout } = useAuth();
  const { userData, loading } = useUserData();
  const { theme, isDark, toggleTheme } = useTheme();
  
  // State for mobile navigation
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // State for logout confirmation modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Navigation items with modern icons
  const navItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      )
    },
    { 
      id: 'mood', 
      label: 'Mood Tracker', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    },
    { 
      id: 'sleep', 
      label: 'Sleep Tracker', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
      )
    },
    { 
      id: 'stress', 
      label: 'Stress Tracker', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      )
    },
    { 
      id: 'journal', 
      label: 'Journal', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
      )
    },
    { 
      id: 'community', 
      label: 'Community', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      )
    },
    { 
      id: 'resources', 
      label: 'Resources', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      )
    }
  ];
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Close mobile menu when section changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeSection]);
  
  // Handle section change
  const handleSectionChange = (section) => {
    onSectionChange(section);
    setIsMobileMenuOpen(false);
  };
  
  // Handle logout function
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect handled by AuthContext
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <>
      {/* Mobile navigation */}
      <div className="block md:hidden relative z-20">
        <div className={`${theme.nav || 'bg-white dark:bg-gray-800'} border-b ${theme.border} px-4 py-3 flex items-center justify-between bg-opacity-70 backdrop-filter backdrop-blur-md shadow-sm`}>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
              <span className="text-sm font-bold">A</span>
            </div>
            <h1 className={`text-xl font-bold ml-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600`}>AuraCheck</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme.buttonSecondary || 'bg-gray-100 dark:bg-gray-700'} transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
              )}
            </button>
            
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className={`p-2 rounded-full ${theme.buttonSecondary || 'bg-gray-100 dark:bg-gray-700'} transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600`}
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu - Enhanced glassmorphism design */}
        {isMobileMenuOpen && (
          <div className={`${theme.nav || 'bg-white dark:bg-gray-800'} border-b ${theme.border} bg-opacity-70 backdrop-filter backdrop-blur-md shadow-lg absolute w-full z-30 transition-all duration-300 ease-in-out`}>
            <nav className="px-4 py-4 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-all duration-200 ${
                    activeSection === item.id 
                      ? `bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 font-medium`
                      : theme.text
                  }`}
                  onClick={() => handleSectionChange(item.id)}
                >
                  <span className={`mr-3 ${activeSection === item.id ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
              
              <button
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-all duration-200 ${
                  activeSection === 'profile' 
                    ? `bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 font-medium`
                    : theme.text
                }`}
                onClick={() => handleSectionChange('profile')}
              >
                <span className={`mr-3 ${activeSection === 'profile' ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </span>
                Profile
              </button>

              {/* Logout button for mobile */}
              <button
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20`}
                onClick={() => setShowLogoutConfirm(true)}
              >
                <span className="mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </span>
                Logout
              </button>
            </nav>
          </div>
        )}
      </div>
      
      {/* Desktop navigation - Enhanced with glassmorphism and gradient highlights */}
      <aside className={`hidden md:flex w-64 ${theme.nav || 'bg-white dark:bg-gray-800'} border-r ${theme.border} flex-col relative z-20 bg-opacity-70 backdrop-filter backdrop-blur-md shadow-md`}>
        <div className={`px-6 py-6 border-b ${theme.border} flex items-center`}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <span className="text-lg font-bold">A</span>
          </div>
          <div className="ml-3">
            <h1 className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600`}>AuraCheck</h1>
            <p className={`${theme.textMuted || 'text-gray-500 dark:text-gray-400'} text-sm mt-0.5`}>Mental Wellness Dashboard</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-all duration-200 group hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  activeSection === item.id 
                    ? `bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 font-medium shadow-sm`
                    : theme.text
                }`}
                onClick={() => handleSectionChange(item.id)}
              >
                <span className={`mr-3 ${
                  activeSection === item.id 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'group-hover:text-indigo-500 dark:group-hover:text-indigo-400'
                }`}>
                  {item.icon}
                </span>
                {item.label}
                {activeSection === item.id && (
                  <span className="ml-auto w-1.5 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600"></span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className={`p-4 border-t ${theme.border}`}>
          {!loading && userData && (
            <div className="flex items-center mb-4 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              {/* Human logo instead of initials or photo */}
              <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center mr-3 ring-2 ring-white dark:ring-gray-800 shadow-md overflow-hidden">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" fill="currentColor" className="text-gray-700 dark:text-gray-300" />
                  <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" fill="currentColor" className="text-gray-700 dark:text-gray-300" />
                </svg>
              </div>
              <div>
                <div className={`font-medium ${theme.textBold || theme.text}`}>
                  {userData.displayName || 'User'}
                </div>
                <div className={`text-xs truncate max-w-[140px] ${theme.textMuted || 'text-gray-500 dark:text-gray-400'}`}>
                  {currentUser?.email}
                </div>
              </div>
            </div>
          )}
          
          <button
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-all duration-200 group hover:bg-gray-100 dark:hover:bg-gray-700 ${
              activeSection === 'profile' 
                ? `bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 font-medium shadow-sm`
                : theme.text
            }`}
            onClick={() => handleSectionChange('profile')}
          >
            <span className={`mr-3 ${
              activeSection === 'profile' 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'group-hover:text-indigo-500 dark:group-hover:text-indigo-400'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </span>
            Profile
            {activeSection === 'profile' && (
              <span className="ml-auto w-1.5 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-purple-600"></span>
            )}
          </button>
          
          {/* Logout Button - Desktop */}
          <button
            className="w-full text-left px-4 py-3 mt-2 rounded-lg flex items-center transition-all duration-200 group hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <span className="mr-3 group-hover:text-red-600 dark:group-hover:text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </span>
            Logout
          </button>
          
          <div className="mt-6 flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <span className={`text-sm ${theme.text}`}>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                isDark ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className="sr-only">Toggle Theme</span>
              <span
                className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </aside>
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`${theme.nav || 'bg-white dark:bg-gray-800'} max-w-md w-full rounded-xl shadow-xl p-6 border ${theme.border} transform transition-all`}>
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
              </div>
              <h3 className={`text-lg font-medium ${theme.textBold || theme.text}`}>Sign out from AuraCheck?</h3>
              <p className={`${theme.textMuted || 'text-gray-500 dark:text-gray-400'} mt-2`}>Your session will end and you'll need to sign in again next time.</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className={`flex-1 px-4 py-2 text-center rounded-lg transition-colors ${theme.buttonSecondary || 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all hover:from-red-600 hover:to-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardNav;