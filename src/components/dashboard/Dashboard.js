import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../context/UserDataContext';
import { useTheme } from '../../context/ThemeContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Dashboard components
import Overview from './Overview';
import MoodTracker from './MoodTracker';
import SleepTracker from './SleepTracker';
import StressTracker from './StressTracker';
import Journal from './Journal';
import Community from './Community';
import Resources from './Resources';
import Profile from './Profile';

// Chart components
import ActivityChart from './charts/ActivityChart';
import MoodChart from './charts/MoodChart';
import SleepChart from './charts/SleepChart';
import StressChart from './charts/StressChart';

// Utility imports
import { createDailyAggregation, getMoodColors, getSleepColors, getStressColors } from './utils/chartUtils';
import { getMetricSummary, calculateTrend, filterEntriesByDateRange } from './utils/dataUtils';

// Widget components
import Insights from './widgets/Insights';
import MetricsSummary from './widgets/MetricsSummary';
import QuickEntry from './widgets/QuickEntry';
import RecentActivity from './widgets/RecentActivity';
import DashboardNav from './DashboardNav';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { userData, loading, error } = useUserData();
  const { theme, isDark, toggleTheme } = useTheme();
  
  // State for active tab/section
  const [activeSection, setActiveSection] = useState('overview');
  
  // State for last activity timestamp
  const [lastActivity, setLastActivity] = useState(null);
  
  // Process user data for charts if available
  const last30Days = userData?.entries ? filterEntriesByDateRange(userData.entries, 30) : [];
  const metricSummary = userData ? getMetricSummary(userData) : null;
  const trendData = userData?.entries ? calculateTrend(userData.entries, 'mood') : null;
  
  // Update last activity timestamp
  useEffect(() => {
    if (currentUser) {
      const updateLastActive = async () => {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, {
            lastActive: serverTimestamp()
          });
          setLastActivity(new Date());
        } catch (err) {
          console.error('Error updating last active timestamp:', err);
        }
      };
      
      // Update timestamp on component mount
      updateLastActive();
      
      // Set up interval to update timestamp every 5 minutes while active
      const interval = setInterval(() => {
        updateLastActive();
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearInterval(interval);
    }
  }, [currentUser]);
  
  // Handle section change
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };
  
  // If loading, show enhanced loading indicator
  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${theme.background} relative overflow-hidden`}>
        {/* Enhanced Background with Animated Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-0 -left-4 w-24 h-24 md:w-72 md:h-72 ${
              isDark ? 'bg-purple-600' : 'bg-purple-400'
          } rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float`} />
          <div className={`absolute -bottom-8 left-20 w-24 h-24 md:w-72 md:h-72 ${
              isDark ? 'bg-pink-600' : 'bg-pink-400'
          } rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float delay-300`} />
          <div className={`absolute top-40 right-10 w-20 h-20 md:w-36 md:h-36 ${
              isDark ? 'bg-blue-600' : 'bg-blue-400'
          } rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float delay-700`} />
        </div>
        
        <div className="flex flex-col items-center backdrop-blur-md p-4 md:p-8 rounded-xl shadow-2xl border border-white/10 bg-white/10 dark:bg-gray-900/30 z-10 transform transition-all mx-4 md:mx-0">
          <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <div className={`mt-6 text-center ${theme.text}`}>
            <h3 className="text-lg md:text-xl font-bold mb-2">Loading your wellness dashboard...</h3>
            <p className="text-xs md:text-sm opacity-80">Preparing your personalized experience</p>
          </div>
        </div>
      </div>
    );
  }
  
  // If error, show enhanced error message
  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${theme.background} ${theme.text} relative overflow-hidden`}>
        {/* Enhanced Background with Animated Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-0 -left-4 w-24 h-24 md:w-72 md:h-72 ${
              isDark ? 'bg-purple-600' : 'bg-purple-400'
          } rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float`} />
          <div className={`absolute -bottom-8 left-20 w-24 h-24 md:w-72 md:h-72 ${
              isDark ? 'bg-pink-600' : 'bg-pink-400'
          } rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float delay-300`} />
          <div className={`absolute top-40 right-10 w-20 h-20 md:w-36 md:h-36 ${
              isDark ? 'bg-red-600' : 'bg-red-400'
          } rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float delay-700`} />
        </div>
        
        <div className="text-center max-w-lg p-6 md:p-8 rounded-xl shadow-2xl border border-white/10 bg-white/10 dark:bg-gray-900/30 z-10 backdrop-blur-md mx-4 md:mx-0">
          <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-full inline-flex mb-4">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-6 opacity-90 text-sm md:text-base">{error}</p>
          <button 
            className="px-4 py-2 md:px-6 md:py-3 rounded-full font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white transition-all duration-300 hover:shadow-lg hover:opacity-90 transform hover:scale-105 text-sm md:text-base"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // If no user is authenticated, redirect to login
  if (!currentUser || !userData) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${theme.background} ${theme.text} relative overflow-hidden`}>
        {/* Enhanced Background with Animated Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-0 -left-4 w-24 h-24 md:w-72 md:h-72 ${
              isDark ? 'bg-purple-600' : 'bg-purple-400'
          } rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float`} />
          <div className={`absolute -bottom-8 left-20 w-24 h-24 md:w-72 md:h-72 ${
              isDark ? 'bg-pink-600' : 'bg-pink-400'
          } rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float delay-300`} />
          <div className={`absolute top-40 right-10 w-20 h-20 md:w-36 md:h-36 ${
              isDark ? 'bg-blue-600' : 'bg-blue-400'
          } rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float delay-700`} />
        </div>
        
        <div className="text-center max-w-lg p-6 md:p-8 rounded-xl shadow-2xl border border-white/10 bg-white/10 dark:bg-gray-900/30 z-10 backdrop-blur-md mx-4 md:mx-0">
          <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full inline-flex mb-4">
            <svg className="w-8 h-8 md:w-10 md:h-10 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">Please log in</h2>
          <p className="mb-6 opacity-90 text-sm md:text-base">You need to be logged in to access your wellness dashboard.</p>
          <button 
            className="px-4 py-2 md:px-6 md:py-3 rounded-full font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white transition-all duration-300 hover:shadow-lg hover:opacity-90 transform hover:scale-105 text-sm md:text-base"
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  // Helper function to render widgets for overview section with enhanced UI
  const renderOverviewWidgets = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 md:p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
          <Insights userData={userData} />
        </div>
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 md:p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
          <MetricsSummary userData={userData} />
        </div>
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 md:p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
          <QuickEntry userData={userData} />
        </div>
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 md:p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
          <RecentActivity userData={userData} />
        </div>
      </div>
    );
  };
  
  // Helper function to render charts for specific sections with enhanced UI
  const renderCharts = (section) => {
    if (!userData?.entries || userData.entries.length === 0) return null;
    
    switch (section) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 md:p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base md:text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Activity Overview</h3>
                <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium leading-none text-indigo-100 bg-indigo-600 rounded-full">Last 30 days</div>
              </div>
              <div className="h-64 md:h-auto">
                <ActivityChart data={userData.entries.slice(-30)} />
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 md:p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base md:text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Mood Trends</h3>
                <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium leading-none text-indigo-100 bg-indigo-600 rounded-full">Last 30 days</div>
              </div>
              <div className="h-64 md:h-auto">
                <MoodChart data={userData.entries.slice(-30)} colors={getMoodColors()} />
              </div>
            </div>
          </div>
        );
      case 'mood':
        return (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 md:p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 mt-4 md:mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base md:text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Mood Analysis</h3>
              <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium leading-none text-indigo-100 bg-indigo-600 rounded-full">All Data</div>
            </div>
            <div className="h-64 md:h-auto">
              <MoodChart data={userData.entries} colors={getMoodColors()} showDetails={true} />
            </div>
          </div>
        );
      case 'sleep':
        return (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 md:p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 mt-4 md:mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base md:text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Sleep Patterns</h3>
              <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium leading-none text-indigo-100 bg-indigo-600 rounded-full">All Data</div>
            </div>
            <div className="h-64 md:h-auto">
              <SleepChart data={userData.entries} colors={getSleepColors()} showDetails={true} />
            </div>
          </div>
        );
      case 'stress':
        return (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 md:p-5 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 mt-4 md:mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base md:text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Stress Levels</h3>
              <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium leading-none text-indigo-100 bg-indigo-600 rounded-full">All Data</div>
            </div>
            <div className="h-64 md:h-auto">
              <StressChart data={userData.entries} colors={getStressColors()} showDetails={true} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  // Helper function to render the active section
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <>
            {renderOverviewWidgets()}
            {renderCharts('overview')}
          </>
        );
      case 'mood':
        return (
          <>
            <MoodTracker userData={userData} />
            {renderCharts('mood')}
          </>
        );
      case 'sleep':
        return (
          <>
            <SleepTracker userData={userData} />
            {renderCharts('sleep')}
          </>
        );
      case 'stress':
        return (
          <>
            <StressTracker userData={userData} />
            {renderCharts('stress')}
          </>
        );
      case 'journal':
        return <Journal userData={userData} />;
      case 'community':
        return <Community userData={userData} />;
      case 'resources':
        return <Resources userData={userData} />;
      case 'profile':
        return <Profile userData={userData} />;
      default:
        return (
          <>
            {renderOverviewWidgets()}
            {renderCharts('overview')}
          </>
        );
    }
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${theme.background} relative overflow-hidden`}>
      {/* Enhanced Background with Animated Shapes */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className={`absolute top-0 -left-4 w-24 h-24 md:w-72 md:h-72 ${
            isDark ? 'bg-purple-600/30' : 'bg-purple-400/30'
        } rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float`} />
        <div className={`absolute -bottom-8 left-20 w-24 h-24 md:w-72 md:h-72 ${
            isDark ? 'bg-pink-600/30' : 'bg-pink-400/30'
        } rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float delay-300`} />
        <div className={`absolute top-40 right-10 w-20 h-20 md:w-36 md:h-36 ${
            isDark ? 'bg-blue-600/30' : 'bg-blue-400/30'
        } rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-float delay-700`} />
      </div>
      
      {/* Main content area with sidebar and content */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Use the DashboardNav component for navigation */}
        <DashboardNav 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange}
        />
        
        {/* Main content */}
        <main className={`flex-1 overflow-y-auto bg-opacity-70 ${theme.background} backdrop-filter backdrop-blur-md`}>
          {/* Page header with enhanced visual design */}
          <div className={`px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-filter backdrop-blur-md shadow-sm sticky top-0 z-10`}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600`}>
                    {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                  </h2>
                  <p className={`${theme.textMuted || 'text-gray-500 dark:text-gray-400'} mt-1 text-xs md:text-sm`}>
                    {activeSection === 'overview' && 'Your wellness at a glance'}
                    {activeSection === 'mood' && 'Track your emotional wellbeing'}
                    {activeSection === 'sleep' && 'Monitor your sleep patterns'}
                    {activeSection === 'stress' && 'Manage your stress levels'}
                    {activeSection === 'journal' && 'Record your thoughts and reflections'}
                    {activeSection === 'community' && 'Connect with others on their wellness journey'}
                    {activeSection === 'resources' && 'Helpful tools and guidance'}
                    {activeSection === 'profile' && 'Manage your account settings'}
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {lastActivity ? new Date(lastActivity).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now'}
                  </div>
                  <button className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </button>
                </div>
                <div className="flex md:hidden">
                  <button 
                    className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    onClick={() => window.location.reload()}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content area */}
          <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {renderActiveSection()}
            
            {/* Footer with helpful information */}
            <div className="mt-8 md:mt-10 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                AuraCheck dashboard | Supporting your mental wellness journey
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
