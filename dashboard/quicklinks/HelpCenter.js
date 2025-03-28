import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

const HelpCenter = () => {
  const { theme, isDark } = useTheme();

  // Help categories with icons
  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      ),
      description: 'Learn the basics of AuraCheck and set up your account'
    },
    {
      id: 'mood-tracking',
      title: 'Mood Tracking',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      description: 'How to record and analyze your mood patterns'
    },
    {
      id: 'sleep-tracking',
      title: 'Sleep Tracking',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
      ),
      description: 'Track your sleep patterns and improve sleep quality'
    },
    {
      id: 'stress-management',
      title: 'Stress Management',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
      ),
      description: 'Tools and techniques for managing stress levels'
    },
    {
      id: 'community',
      title: 'Community Features',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      ),
      description: 'How to connect and interact with the AuraCheck community'
    },
    {
      id: 'account',
      title: 'Account Settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      ),
      description: 'Manage your profile, notifications, and privacy settings'
    }
  ];

  // Common help topics
  const commonTopics = [
    "How do I reset my password?",
    "Can I delete my account?",
    "How to track my mood daily",
    "Connecting with others safely",
    "Understanding mood patterns",
    "Data privacy and security",
    "How to use the journal feature",
    "Setting wellness goals"
  ];

  return (
    <div className={`p-6 ${theme.background}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-4">
            AuraCheck Help Center
          </h1>
          <p className={`${theme.textMuted || 'text-gray-500 dark:text-gray-400'} max-w-2xl mx-auto`}>
            Find answers to common questions and learn how to get the most out of AuraCheck for your mental wellness journey.
          </p>
          {/* Search bar */}
          <div className="mt-6 relative max-w-xl mx-auto">
            <input 
              type="text" 
              placeholder="Search for help..." 
              className={`w-full pl-10 pr-4 py-3 rounded-lg ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            />
            <div className="absolute left-3 top-3 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {helpCategories.map((category) => (
            <div 
              key={category.id} 
              className={`p-6 rounded-xl border ${isDark ? 'bg-gray-800/70 border-gray-700' : 'bg-white border-gray-200'} hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700`}
            >
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full inline-flex mb-4 text-indigo-600 dark:text-indigo-400">
                {category.icon}
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                {category.title}
              </h3>
              <p className={`${theme.textMuted || 'text-gray-500 dark:text-gray-400'} text-sm`}>
                {category.description}
              </p>
            </div>
          ))}
        </div>

        {/* Common Help Topics */}
        <div className={`rounded-xl border ${isDark ? 'bg-gray-800/70 border-gray-700' : 'bg-white border-gray-200'} p-6 mb-12`}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Common Help Topics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonTopics.map((topic, index) => (
              <a 
                key={index} 
                href="#" 
                className={`flex items-center py-2 px-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ${isDark ? 'text-gray-300' : 'text-gray-700'} hover:text-indigo-600 dark:hover:text-indigo-400`}
              >
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
                {topic}
              </a>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className={`rounded-xl border ${isDark ? 'bg-gray-800/70 border-gray-700' : 'bg-white border-gray-200'} p-6 text-center`}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Still Need Help?
          </h2>
          <p className={`${theme.textMuted || 'text-gray-500 dark:text-gray-400'} mb-4`}>
            Our support team is here to assist you with any questions or issues you may have.
          </p>
          <button className="px-6 py-3 rounded-full font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white transition-all duration-300 hover:shadow-lg hover:opacity-90 transform hover:scale-105">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;