import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useUserData } from '../../../context/UserDataContext';
import { useTheme } from '../../../context/ThemeContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

const PrivacySettings = () => {
  const { currentUser } = useAuth();
  const { userData, loading } = useUserData();
  const { theme, isDark } = useTheme();
  
  // State for privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: userData?.privacySettings?.profileVisibility || 'public',
    showMoodJourney: userData?.privacySettings?.showMoodJourney || true,
    allowDataUsage: userData?.privacySettings?.allowDataUsage || true,
    emailNotifications: userData?.privacySettings?.emailNotifications || true,
    communityVisibility: userData?.privacySettings?.communityVisibility || 'all',
    shareProgress: userData?.privacySettings?.shareProgress || false,
    showRealName: userData?.privacySettings?.showRealName || false
  });
  
  // State for saving status
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: null, text: null });
  
  // Handle toggle change
  const handleToggleChange = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Handle select change
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setPrivacySettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Save privacy settings
  const saveSettings = async () => {
    if (!currentUser) return;
    
    setIsSaving(true);
    setSaveMessage({ type: null, text: null });
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        privacySettings: privacySettings,
        updatedAt: new Date()
      });
      
      setSaveMessage({ 
        type: 'success', 
        text: 'Your privacy settings have been updated successfully.' 
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      setSaveMessage({ 
        type: 'error', 
        text: 'Failed to update privacy settings. Please try again.' 
      });
    } finally {
      setIsSaving(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setSaveMessage({ type: null, text: null });
      }, 5000);
    }
  };
  
  // Toggle switch component
  const ToggleSwitch = ({ isEnabled, onToggle, label, description }) => (
    <div className="flex items-start justify-between py-4">
      <div className="flex-1 pr-4">
        <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</h4>
        {description && <p className={`text-xs ${theme.textMuted || 'text-gray-500 dark:text-gray-400'} mt-1`}>{description}</p>}
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex flex-shrink-0 h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          isEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
        aria-pressed={isEnabled}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
  
  if (loading) {
    return (
      <div className={`p-6 ${theme.background} flex justify-center items-center min-h-screen`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <div className={`p-6 ${theme.background}`}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-2">
            Privacy Settings
          </h1>
          <p className={`${theme.textMuted || 'text-gray-500 dark:text-gray-400'}`}>
            Control how your information is used and shared on AuraCheck
          </p>
        </div>
        
        {/* Settings sections */}
        <div className={`rounded-xl border ${isDark ? 'bg-gray-800/70 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden shadow-sm mb-6`}>
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile Visibility</h2>
            <p className={`text-sm ${theme.textMuted || 'text-gray-500 dark:text-gray-400'} mt-1`}>
              Control who can see your profile and activity on AuraCheck
            </p>
          </div>
          
          <div className="px-5">
            <div className="py-4">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Who can see my profile
              </label>
              <select
                name="profileVisibility"
                value={privacySettings.profileVisibility}
                onChange={handleSelectChange}
                className={`block w-full rounded-md border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              >
                <option value="public">Everyone (Public)</option>
                <option value="community">Community Members Only</option>
                <option value="friends">My Connections Only</option>
                <option value="private">Only Me (Private)</option>
              </select>
            </div>
            
            <div className="py-4">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Community visibility
              </label>
              <select
                name="communityVisibility"
                value={privacySettings.communityVisibility}
                onChange={handleSelectChange}
                className={`block w-full rounded-md border ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              >
                <option value="all">Show in all community spaces</option>
                <option value="selected">Only in selected groups</option>
                <option value="none">Hide my activity in community</option>
              </select>
            </div>
            
            <ToggleSwitch
              isEnabled={privacySettings.showRealName}
              onToggle={() => handleToggleChange('showRealName')}
              label="Show my real name"
              description="When disabled, only your username will be visible to others"
            />
          </div>
        </div>
        
        <div className={`rounded-xl border ${isDark ? 'bg-gray-800/70 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden shadow-sm mb-6`}>
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Data Sharing</h2>
            <p className={`text-sm ${theme.textMuted || 'text-gray-500 dark:text-gray-400'} mt-1`}>
              Manage how your mental wellness data is shared
            </p>
          </div>
          
          <div className="px-5">
            <ToggleSwitch
              isEnabled={privacySettings.showMoodJourney}
              onToggle={() => handleToggleChange('showMoodJourney')}
              label="Share mood tracking journey"
              description="Allow others to see your mood progress charts and trends"
            />
            
            <ToggleSwitch
              isEnabled={privacySettings.shareProgress}
              onToggle={() => handleToggleChange('shareProgress')}
              label="Share wellness achievements"
              description="Let others celebrate your mental wellness milestones and achievements"
            />
            
            <ToggleSwitch
              isEnabled={privacySettings.allowDataUsage}
              onToggle={() => handleToggleChange('allowDataUsage')}
              label="Allow anonymous data usage"
              description="Help us improve AuraCheck by allowing anonymous usage of your data for research"
            />
          </div>
        </div>
        
        <div className={`rounded-xl border ${isDark ? 'bg-gray-800/70 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden shadow-sm mb-6`}>
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Communication</h2>
            <p className={`text-sm ${theme.textMuted || 'text-gray-500 dark:text-gray-400'} mt-1`}>
              Control how we communicate with you
            </p>
          </div>
          
          <div className="px-5">
            <ToggleSwitch
              isEnabled={privacySettings.emailNotifications}
              onToggle={() => handleToggleChange('emailNotifications')}
              label="Email notifications"
              description="Receive updates, reminders and tips via email"
            />
          </div>
        </div>
        
        {/* Data download and account deletion */}
        <div className={`rounded-xl border ${isDark ? 'bg-gray-800/70 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden shadow-sm mb-8`}>
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Data</h2>
            <p className={`text-sm ${theme.textMuted || 'text-gray-500 dark:text-gray-400'} mt-1`}>
              Download or delete your data from AuraCheck
            </p>
          </div>
          
          <div className="p-5 space-y-4">
            <button className="w-full md:w-auto px-4 py-2 rounded-lg border border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-sm font-medium">
              Download my data
            </button>
            
            <button className="w-full md:w-auto px-4 py-2 rounded-lg border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium">
              Request account deletion
            </button>
          </div>
        </div>
        
        {/* Save button */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            {saveMessage.text && (
              <div className={`rounded-lg px-4 py-2 text-sm ${
                saveMessage.type === 'success' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {saveMessage.text}
              </div>
            )}
          </div>
          
          <button 
            onClick={saveSettings}
            disabled={isSaving}
            className={`px-6 py-3 rounded-full font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white transition-all duration-300 hover:shadow-lg hover:opacity-90 transform hover:scale-105 ${
              isSaving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;