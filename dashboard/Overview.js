import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../context/UserDataContext';
import { useTheme } from '../../context/ThemeContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

// This would be imported from a utils file in a larger application
const calculateMoodAverage = (moodData, days = 7) => {
  if (!moodData || moodData.length === 0) return 0;
  
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - days);
  
  const recentEntries = moodData.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= startDate && entryDate <= now;
  });
  
  if (recentEntries.length === 0) return 0;
  
  const sum = recentEntries.reduce((total, entry) => total + entry.score, 0);
  return (sum / recentEntries.length).toFixed(1);
};

const calculateSleepAverage = (sleepData, days = 7) => {
  if (!sleepData || sleepData.length === 0) return 0;
  
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - days);
  
  const recentEntries = sleepData.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= startDate && entryDate <= now;
  });
  
  if (recentEntries.length === 0) return 0;
  
  const sum = recentEntries.reduce((total, entry) => total + entry.hours, 0);
  return (sum / recentEntries.length).toFixed(1);
};

const calculateStressAverage = (stressData, days = 7) => {
  if (!stressData || stressData.length === 0) return 0;
  
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - days);
  
  const recentEntries = stressData.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= startDate && entryDate <= now;
  });
  
  if (recentEntries.length === 0) return 0;
  
  const sum = recentEntries.reduce((total, entry) => total + entry.level, 0);
  return (sum / recentEntries.length).toFixed(1);
};

const calculateTrend = (data, key, days = 7) => {
  if (!data || data.length < 2) return 'stable';
  
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - days);
  
  const recentEntries = data
    .filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= now;
    })
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  if (recentEntries.length < 2) return 'stable';
  
  const firstValue = recentEntries[0][key];
  const lastValue = recentEntries[recentEntries.length - 1][key];
  const difference = lastValue - firstValue;
  
  if (difference > 0.5) return 'improving';
  if (difference < -0.5) return 'declining';
  return 'stable';
};

const formatDate = (date) => {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const Overview = () => {
  const { currentUser } = useAuth();
  const { 
    userData,
    moodData,
    sleepData,
    stressData,
    journalEntries,
    addMoodEntry,
    addSleepEntry,
    addStressEntry,
    loading,
  } = useUserData();
  const { theme } = useTheme();
  
  // State for metrics
  const [metrics, setMetrics] = useState({
    moodAverage: 0,
    sleepAverage: 0,
    stressAverage: 0,
    moodTrend: 'stable',
    sleepTrend: 'stable',
    stressTrend: 'stable',
    lastJournalEntry: null,
    streakDays: 0
  });
  
  // State for quick entry forms
  const [quickEntry, setQuickEntry] = useState({
    mood: 5,
    sleep: 7,
    stress: 5,
  });
  
  // Calculate streak of consecutive days with entries
  const calculateStreak = () => {
    if (!moodData || moodData.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all dates with entries
    const datesWithEntries = moodData.map(entry => {
      const date = new Date(entry.timestamp);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });
    
    // Sort and remove duplicates
    const uniqueDates = [...new Set(datesWithEntries)].sort((a, b) => b - a);
    
    let streak = 0;
    let currentDate = today.getTime();
    
    // Check if there's an entry for today
    if (uniqueDates.includes(currentDate)) {
      streak = 1;
      
      // Check previous days
      let prevDate = new Date(today);
      while (true) {
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateTime = prevDate.getTime();
        
        if (uniqueDates.includes(prevDateTime)) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    return streak;
  };
  
  // Update metrics when data changes
  useEffect(() => {
    if (loading) return;
    
    const lastJournal = journalEntries && journalEntries.length > 0 
      ? journalEntries[0] 
      : null;
    
    setMetrics({
      moodAverage: calculateMoodAverage(moodData),
      sleepAverage: calculateSleepAverage(sleepData),
      stressAverage: calculateStressAverage(stressData),
      moodTrend: calculateTrend(moodData, 'score'),
      sleepTrend: calculateTrend(sleepData, 'hours'),
      stressTrend: calculateTrend(stressData, 'level'),
      lastJournalEntry: lastJournal,
      streakDays: calculateStreak()
    });
  }, [moodData, sleepData, stressData, journalEntries, loading]);
  
  // Handle quick entry changes
  const handleQuickEntryChange = (type, value) => {
    setQuickEntry({
      ...quickEntry,
      [type]: parseFloat(value)
    });
  };
  
  // Submit quick entries
  const handleQuickEntrySubmit = async (type) => {
    try {
      switch (type) {
        case 'mood':
          await addMoodEntry(quickEntry.mood);
          break;
        case 'sleep':
          await addSleepEntry(quickEntry.sleep);
          break;
        case 'stress':
          await addStressEntry(quickEntry.stress);
          break;
        default:
          break;
      }
      
      // Update last activity in Firestore
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          lastActive: serverTimestamp()
        });
      }
    } catch (error) {
      console.error(`Error submitting ${type} entry:`, error);
    }
  };
  
  // Get trend icon and color
  const getTrendDisplay = (trend, positiveIsGood = true) => {
    if (trend === 'improving') {
      return {
        icon: '↗️',
        color: positiveIsGood ? 'text-green-500' : 'text-red-500',
        text: 'Improving'
      };
    } else if (trend === 'declining') {
      return {
        icon: '↘️',
        color: positiveIsGood ? 'text-red-500' : 'text-green-500',
        text: 'Declining'
      };
    } else {
      return {
        icon: '→',
        color: 'text-yellow-500',
        text: 'Stable'
      };
    }
  };
  
  // Get appropriate mood emoji
  const getMoodEmoji = (score) => {
    if (score >= 8) return '😄';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '☹️';
    return '😢';
  };
  
  return (
    <div className="space-y-6">
      {/* Greeting card */}
      <div className={`${theme.card} rounded-xl p-6`}>
        <h1 className={`text-2xl font-bold ${theme.textBold}`}>
          {getGreeting()}, {userData?.displayName || 'there'}!
        </h1>
        <p className={`mt-2 ${theme.text}`}>
          {new Date().toLocaleDateString(undefined, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <div className="mt-4 flex items-center">
          <div className={`${theme.accent} font-bold text-lg`}>
            {metrics.streakDays} day{metrics.streakDays !== 1 ? 's' : ''} streak
          </div>
          <div className="ml-2">
            {metrics.streakDays > 0 ? '🔥' : ''}
          </div>
        </div>
      </div>
      
      {/* Metrics summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mood Card */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-bold ${theme.textBold}`}>Mood</h2>
            <span className="text-2xl">{getMoodEmoji(metrics.moodAverage)}</span>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <div className={`text-3xl font-bold ${theme.accent}`}>
                {metrics.moodAverage}
              </div>
              <div className={`text-sm ${theme.text}`}>7-day average</div>
            </div>
            
            <div className="flex items-center">
              <span className={getTrendDisplay(metrics.moodTrend).color}>
                {getTrendDisplay(metrics.moodTrend).icon}
              </span>
              <span className={`ml-1 text-sm ${theme.text}`}>
                {getTrendDisplay(metrics.moodTrend).text}
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="quickMood" className={`block text-sm font-medium ${theme.text} mb-1`}>
              How do you feel right now? (1-10)
            </label>
            <div className="flex items-center">
              <input
                type="range"
                id="quickMood"
                min="1"
                max="10"
                step="1"
                value={quickEntry.mood}
                onChange={(e) => handleQuickEntryChange('mood', e.target.value)}
                className="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-700"
              />
              <span className={`ml-3 ${theme.text}`}>{quickEntry.mood}</span>
            </div>
            <button
              onClick={() => handleQuickEntrySubmit('mood')}
              className={`mt-2 px-4 py-2 w-full rounded-lg ${theme.button}`}
            >
              Log Mood
            </button>
          </div>
        </div>
        
        {/* Sleep Card */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-bold ${theme.textBold}`}>Sleep</h2>
            <span className="text-2xl">💤</span>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <div className={`text-3xl font-bold ${theme.accent}`}>
                {metrics.sleepAverage}
              </div>
              <div className={`text-sm ${theme.text}`}>hours (7-day avg)</div>
            </div>
            
            <div className="flex items-center">
              <span className={getTrendDisplay(metrics.sleepTrend).color}>
                {getTrendDisplay(metrics.sleepTrend).icon}
              </span>
              <span className={`ml-1 text-sm ${theme.text}`}>
                {getTrendDisplay(metrics.sleepTrend).text}
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="quickSleep" className={`block text-sm font-medium ${theme.text} mb-1`}>
              How many hours did you sleep?
            </label>
            <div className="flex items-center">
              <input
                type="range"
                id="quickSleep"
                min="0"
                max="12"
                step="0.5"
                value={quickEntry.sleep}
                onChange={(e) => handleQuickEntryChange('sleep', e.target.value)}
                className="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-700"
              />
              <span className={`ml-3 ${theme.text}`}>{quickEntry.sleep}</span>
            </div>
            <button
              onClick={() => handleQuickEntrySubmit('sleep')}
              className={`mt-2 px-4 py-2 w-full rounded-lg ${theme.button}`}
            >
              Log Sleep
            </button>
          </div>
        </div>
        
        {/* Stress Card */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-bold ${theme.textBold}`}>Stress</h2>
            <span className="text-2xl">🧘</span>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <div className={`text-3xl font-bold ${theme.accent}`}>
                {metrics.stressAverage}
              </div>
              <div className={`text-sm ${theme.text}`}>7-day average</div>
            </div>
            
            <div className="flex items-center">
              <span className={getTrendDisplay(metrics.stressTrend, false).color}>
                {getTrendDisplay(metrics.stressTrend, false).icon}
              </span>
              <span className={`ml-1 text-sm ${theme.text}`}>
                {getTrendDisplay(metrics.stressTrend, false).text}
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="quickStress" className={`block text-sm font-medium ${theme.text} mb-1`}>
              Current stress level? (1-10)
            </label>
            <div className="flex items-center">
              <input
                type="range"
                id="quickStress"
                min="1"
                max="10"
                step="1"
                value={quickEntry.stress}
                onChange={(e) => handleQuickEntryChange('stress', e.target.value)}
                className="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-700"
              />
              <span className={`ml-3 ${theme.text}`}>{quickEntry.stress}</span>
            </div>
            <button
              onClick={() => handleQuickEntrySubmit('stress')}
              className={`mt-2 px-4 py-2 w-full rounded-lg ${theme.button}`}
            >
              Log Stress
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent activity and journal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Recent Activity</h2>
          
          {moodData && moodData.length > 0 ? (
            <div className="space-y-3">
              {moodData.slice(-3).reverse().map((entry, index) => (
                <div key={index} className={`p-3 rounded-lg ${theme.background} ${theme.border} border`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-xl mr-2">
                        {getMoodEmoji(entry.score)}
                      </span>
                      <span className={`font-medium ${theme.text}`}>
                        Mood: {entry.score}/10
                      </span>
                    </div>
                    <div className={`text-sm ${theme.text}`}>
                      {formatDate(entry.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-6 ${theme.text}`}>
              <p>No recent activity to display</p>
              <p className="mt-2 text-sm">Start logging your mood, sleep, and stress levels</p>
            </div>
          )}
        </div>
        
        {/* Latest Journal */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Latest Journal Entry</h2>
          
          {metrics.lastJournalEntry ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className={`font-medium ${theme.textBold}`}>
                  {metrics.lastJournalEntry.title || 'Untitled Entry'}
                </div>
                <div className={`text-sm ${theme.text}`}>
                  {formatDate(metrics.lastJournalEntry.timestamp)}
                </div>
              </div>
              
              <div className={`${theme.text}`}>
                {metrics.lastJournalEntry.content.length > 150
                  ? `${metrics.lastJournalEntry.content.substring(0, 150)}...`
                  : metrics.lastJournalEntry.content
                }
              </div>
              
              <button className={`mt-4 px-4 py-2 rounded-lg ${theme.button}`}>
                View Full Journal
              </button>
            </div>
          ) : (
            <div className={`text-center py-6 ${theme.text}`}>
              <p>No journal entries yet</p>
              <p className="mt-2 text-sm">Start journaling to track your thoughts and feelings</p>
              <button className={`mt-4 px-4 py-2 rounded-lg ${theme.button}`}>
                Create First Entry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;