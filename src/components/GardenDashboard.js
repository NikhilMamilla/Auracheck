import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './shared/ThemeToggle';
import { useUserData } from '../context/UserDataContext';
import { 
  Home, 
  ClipboardCheck, 
  LineChart, 
  Users, 
  Heart, 
  User, 
  LogOut,
  Bell,
  Sun,
  Moon,
  Settings
} from 'lucide-react';
import Profile from './Profile'; // Import Profile component

const GardenDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { userData, updateUserData } = useUserData();
  const [notifications, setNotifications] = useState([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [wellnessScore, setWellnessScore] = useState(userData?.wellnessScore || 48);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getPlantState = (score) => {
    if (score <= 25) return 'wilting';
    if (score <= 50) return 'sprout';
    if (score <= 75) return 'growing';
    return 'blooming';
  };

  const navItems = [
    { 
      icon: Home, 
      label: 'Garden View', 
      color: 'text-green-600',
      onClick: () => navigate('/dashboard')
    },
    { 
      icon: ClipboardCheck, 
      label: 'Daily Check-in', 
      color: 'text-emerald-600',
      onClick: () => setShowAssessment(true)
    },
    { 
      icon: LineChart, 
      label: 'Progress Tracker', 
      color: 'text-yellow-600',
      onClick: () => setShowTracker(true)
    },
    { 
      icon: Users, 
      label: 'Community Garden', 
      color: 'text-blue-600',
      onClick: () => setShowCommunity(true)
    },
    { 
      icon: Heart, 
      label: 'Support & Resources', 
      color: 'text-red-600',
      onClick: () => setShowSupport(true)
    },
    { 
      icon: User, 
      label: 'My Profile', 
      color: 'text-purple-600',
      onClick: () => setShowProfile(true)
    }
  ];

  const [showAssessment, setShowAssessment] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  // Modal Components
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      >
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gradient-to-br from-green-50 to-blue-50'}`}>
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-white dark:bg-gray-800 bg-opacity-90 shadow-lg"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-8">AuraCheck</h1>
          <nav>
            {navItems.map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.05, x: 5 }}
                className="flex items-center p-3 mb-2 rounded-lg cursor-pointer hover:bg-green-50 dark:hover:bg-gray-700"
                onClick={item.onClick}
              >
                <item.icon className={`w-5 h-5 ${item.color} mr-3`} />
                <span className="text-gray-700 dark:text-gray-200">{item.label}</span>
              </motion.div>
            ))}
            <motion.div
              whileHover={{ scale: 1.05, x: 5 }}
              className="flex items-center p-3 mb-2 rounded-lg cursor-pointer hover:bg-green-50 dark:hover:bg-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 text-gray-600 mr-3" />
              <span className="text-gray-700 dark:text-gray-200">Logout</span>
            </motion.div>
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Top Bar */}
        <div className="flex justify-end items-center mb-8 space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? 
              <Sun className="w-6 h-6 text-yellow-400" /> : 
              <Moon className="w-6 h-6 text-gray-600" />
            }
          </motion.button>
          
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="relative cursor-pointer"
            onClick={() => setShowNotificationPanel(!showNotificationPanel)}
          >
            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm cursor-pointer"
            onClick={() => setShowProfile(true)}
          >
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center mr-2">
              {currentUser?.displayName?.charAt(0) || 'U'}
            </div>
            <span className="text-gray-700 dark:text-gray-200">
              {currentUser?.displayName || 'User'}
            </span>
          </motion.div>
        </div>

        {/* Wellness Score */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-xl p-6 mb-8 shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-4">Your Garden's Growth</h2>
          <div className="relative h-32">
            <motion.div 
              className="absolute bottom-0 left-0 w-full bg-green-100 rounded-full overflow-hidden"
              style={{ height: '24px' }}
            >
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${wellnessScore}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-green-400 to-green-600"
              />
            </motion.div>
            <motion.div 
              className={`absolute bottom-0 left-${wellnessScore}% transform -translate-x-1/2`}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {getPlantState(wellnessScore) === 'blooming' && (
                <div className="text-6xl">🌸</div>
              )}
              {getPlantState(wellnessScore) === 'growing' && (
                <div className="text-6xl">🌱</div>
              )}
              {getPlantState(wellnessScore) === 'sprout' && (
                <div className="text-6xl">🌿</div>
              )}
              {getPlantState(wellnessScore) === 'wilting' && (
                <div className="text-6xl">🥀</div>
              )}
            </motion.div>
          </div>
          <div className="text-center mt-4">
            <span className="text-2xl font-bold text-green-600">{wellnessScore}%</span>
            <span className="text-gray-600 ml-2">Wellness Score</span>
          </div>
        </motion.div>

        {/* Health Insights & Activity Trends */}
        <div className="grid grid-cols-2 gap-8">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-4">Health Insights</h3>
            <div className="relative h-48">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <div className="text-6xl">🌻</div>
                <motion.div 
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-1 bg-blue-400"
                  initial={{ height: 0 }}
                  animate={{ height: 100 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-4">Seasonal Progress</h3>
            <div className="flex justify-around">
              <div className="text-center">
                <div className="text-4xl">🌸</div>
                <span className="text-sm text-gray-600">Spring</span>
              </div>
              <div className="text-center opacity-50">
                <div className="text-4xl">☀️</div>
                <span className="text-sm text-gray-600">Summer</span>
              </div>
              <div className="text-center opacity-50">
                <div className="text-4xl">🍂</div>
                <span className="text-sm text-gray-600">Fall</span>
              </div>
              <div className="text-center opacity-50">
                <div className="text-4xl">❄️</div>
                <span className="text-sm text-gray-600">Winter</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Modals */}
        <Modal 
          isOpen={showAssessment} 
          onClose={() => setShowAssessment(false)}
          title="Daily Wellness Check-in"
        >
          <div className="p-4">
            <h3 className="text-lg mb-4">How are you feeling today?</h3>
            {/* Add your assessment form components here */}
          </div>
        </Modal>

        <Modal 
          isOpen={showTracker} 
          onClose={() => setShowTracker(false)}
          title="Progress Tracker"
        >
          <div className="p-4">
            {/* Add your tracking visualization components here */}
          </div>
        </Modal>

        <Modal 
          isOpen={showCommunity} 
          onClose={() => setShowCommunity(false)}
          title="Community Garden"
        >
          <div className="p-4">
            {/* Add your community components here */}
          </div>
        </Modal>

        <Modal 
          isOpen={showSupport} 
          onClose={() => setShowSupport(false)}
          title="Support & Resources"
        >
          <div className="p-4">
            {/* Add your support resources here */}
          </div>
        </Modal>

        <Modal 
          isOpen={showProfile} 
          onClose={() => setShowProfile(false)}
          title="My Profile"
        >
          <div className="p-4">
            <Profile />
          </div>
        </Modal>

        {/* Main Garden View */}
        {/* ... Your existing garden visualization code ... */}
      </div>
    </div>
  );
};

export default GardenDashboard;