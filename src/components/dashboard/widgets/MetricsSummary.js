// src/components/dashboard/widgets/MetricsSummary.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useUserData } from '../../../context/UserDataContext';
import { useTheme } from '../../../context/ThemeContext';

// Metric types
const METRIC_TYPES = {
  MOOD: 'mood',
  SLEEP: 'sleep',
  STRESS: 'stress',
  ACTIVITY: 'activity',
  STREAK: 'streak',
  JOURNAL: 'journal'
};

const MetricsSummary = ({ 
  metrics = [
    METRIC_TYPES.MOOD, 
    METRIC_TYPES.SLEEP, 
    METRIC_TYPES.STRESS, 
    METRIC_TYPES.STREAK
  ],
  period = 'week', // 'day', 'week', 'month', 'year'
  showTrends = true,
  compact = false,
  onMetricClick = null
}) => {
  const { currentUser } = useAuth();
  const { 
    moodData, 
    sleepData, 
    stressData, 
    journalEntries,
    activityData,
    loading 
  } = useUserData();
  const { theme } = useTheme();
  
  // State for metrics values
  const [metricValues, setMetricValues] = useState({
    [METRIC_TYPES.MOOD]: {
      value: 0,
      trend: 'stable',
      entries: 0
    },
    [METRIC_TYPES.SLEEP]: {
      value: 0,
      trend: 'stable',
      entries: 0
    },
    [METRIC_TYPES.STRESS]: {
      value: 0,
      trend: 'stable',
      entries: 0
    },
    [METRIC_TYPES.ACTIVITY]: {
      value: 0,
      trend: 'stable',
      entries: 0
    },
    [METRIC_TYPES.STREAK]: {
      value: 0,
      trend: 'stable'
    },
    [METRIC_TYPES.JOURNAL]: {
      value: 0,
      trend: 'stable',
      entries: 0
    }
  });
  
  // Calculate metrics when data changes
  useEffect(() => {
    if (loading) return;
    
    // Get date range based on period
    const { startDate, endDate } = getDateRange(period);
    
    // Calculate all metrics
    const moodMetric = calculateMoodMetric(startDate, endDate);
    const sleepMetric = calculateSleepMetric(startDate, endDate);
    const stressMetric = calculateStressMetric(startDate, endDate);
    const activityMetric = calculateActivityMetric(startDate, endDate);
    const streakMetric = calculateStreakMetric();
    const journalMetric = calculateJournalMetric(startDate, endDate);
    
    // Update state
    setMetricValues({
      [METRIC_TYPES.MOOD]: moodMetric,
      [METRIC_TYPES.SLEEP]: sleepMetric,
      [METRIC_TYPES.STRESS]: stressMetric,
      [METRIC_TYPES.ACTIVITY]: activityMetric,
      [METRIC_TYPES.STREAK]: streakMetric,
      [METRIC_TYPES.JOURNAL]: journalMetric
    });
  }, [moodData, sleepData, stressData, journalEntries, activityData, period, loading]);
  
  // Get date range based on period
  const getDateRange = (periodType) => {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);
    
    switch (periodType) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7); // Default to week
    }
    
    return { startDate, endDate };
  };
  
  // Calculate mood metric
  const calculateMoodMetric = (startDate, endDate) => {
    if (!moodData || moodData.length === 0) {
      return { value: 0, trend: 'stable', entries: 0 };
    }
    
    // Filter entries within the date range
    const filteredEntries = moodData.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    if (filteredEntries.length === 0) {
      return { value: 0, trend: 'stable', entries: 0 };
    }
    
    // Calculate average mood
    const totalMood = filteredEntries.reduce((sum, entry) => sum + entry.score, 0);
    const avgMood = parseFloat((totalMood / filteredEntries.length).toFixed(1));
    
    // Calculate trend if multiple entries exist
    let trend = 'stable';
    
    if (filteredEntries.length >= 3 && showTrends) {
      // Sort entries by date
      const sortedEntries = [...filteredEntries].sort((a, b) => {
        return new Date(a.timestamp) - new Date(b.timestamp);
      });
      
      // Split into two halves
      const halfIndex = Math.floor(sortedEntries.length / 2);
      const firstHalf = sortedEntries.slice(0, halfIndex);
      const secondHalf = sortedEntries.slice(halfIndex);
      
      // Calculate average for each half
      const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.score, 0) / secondHalf.length;
      
      // Determine trend
      if (secondAvg - firstAvg > 0.5) {
        trend = 'improving';
      } else if (firstAvg - secondAvg > 0.5) {
        trend = 'declining';
      }
    }
    
    return { 
      value: avgMood, 
      trend, 
      entries: filteredEntries.length 
    };
  };
  
  // Calculate sleep metric
  const calculateSleepMetric = (startDate, endDate) => {
    if (!sleepData || sleepData.length === 0) {
      return { value: 0, trend: 'stable', entries: 0 };
    }
    
    // Filter entries within the date range
    const filteredEntries = sleepData.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    if (filteredEntries.length === 0) {
      return { value: 0, trend: 'stable', entries: 0 };
    }
    
    // Calculate average sleep
    const totalSleep = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const avgSleep = parseFloat((totalSleep / filteredEntries.length).toFixed(1));
    
    // Calculate trend if multiple entries exist
    let trend = 'stable';
    
    if (filteredEntries.length >= 3 && showTrends) {
      // Sort entries by date
      const sortedEntries = [...filteredEntries].sort((a, b) => {
        return new Date(a.timestamp) - new Date(b.timestamp);
      });
      
      // Split into two halves
      const halfIndex = Math.floor(sortedEntries.length / 2);
      const firstHalf = sortedEntries.slice(0, halfIndex);
      const secondHalf = sortedEntries.slice(halfIndex);
      
      // Calculate average for each half
      const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.hours, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.hours, 0) / secondHalf.length;
      
      // Determine trend
      if (secondAvg - firstAvg > 0.5) {
        trend = 'improving';
      } else if (firstAvg - secondAvg > 0.5) {
        trend = 'declining';
      }
    }
    
    return { 
      value: avgSleep, 
      trend, 
      entries: filteredEntries.length 
    };
  };
  
  // Calculate stress metric
  const calculateStressMetric = (startDate, endDate) => {
    if (!stressData || stressData.length === 0) {
      return { value: 0, trend: 'stable', entries: 0 };
    }
    
    // Filter entries within the date range
    const filteredEntries = stressData.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    if (filteredEntries.length === 0) {
      return { value: 0, trend: 'stable', entries: 0 };
    }
    
    // Calculate average stress
    const totalStress = filteredEntries.reduce((sum, entry) => sum + entry.level, 0);
    const avgStress = parseFloat((totalStress / filteredEntries.length).toFixed(1));
    
    // Calculate trend if multiple entries exist
    let trend = 'stable';
    
    if (filteredEntries.length >= 3 && showTrends) {
      // Sort entries by date
      const sortedEntries = [...filteredEntries].sort((a, b) => {
        return new Date(a.timestamp) - new Date(b.timestamp);
      });
      
      // Split into two halves
      const halfIndex = Math.floor(sortedEntries.length / 2);
      const firstHalf = sortedEntries.slice(0, halfIndex);
      const secondHalf = sortedEntries.slice(halfIndex);
      
      // Calculate average for each half
      const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.level, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.level, 0) / secondHalf.length;
      
      // Determine trend
      if (secondAvg - firstAvg > 0.5) {
        trend = 'declining'; // Higher stress is bad
      } else if (firstAvg - secondAvg > 0.5) {
        trend = 'improving'; // Lower stress is good
      }
    }
    
    return { 
      value: avgStress, 
      trend, 
      entries: filteredEntries.length 
    };
  };
  
  // Calculate activity metric
  const calculateActivityMetric = (startDate, endDate) => {
    if (!activityData || activityData.length === 0) {
      return { value: 0, trend: 'stable', entries: 0 };
    }
    
    // Filter entries within the date range
    const filteredEntries = activityData.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    if (filteredEntries.length === 0) {
      return { value: 0, trend: 'stable', entries: 0 };
    }
    
    // Count positive impact activities
    const positiveActivities = filteredEntries.filter(entry => entry.impact > 0);
    const positiveRatio = parseFloat((positiveActivities.length / filteredEntries.length * 100).toFixed(0));
    
    // Calculate trend if multiple entries exist
    let trend = 'stable';
    
    if (filteredEntries.length >= 6 && showTrends) {
      // Sort entries by date
      const sortedEntries = [...filteredEntries].sort((a, b) => {
        return new Date(a.timestamp) - new Date(b.timestamp);
      });
      
      // Split into two halves
      const halfIndex = Math.floor(sortedEntries.length / 2);
      const firstHalf = sortedEntries.slice(0, halfIndex);
      const secondHalf = sortedEntries.slice(halfIndex);
      
      // Calculate positive ratio for each half
      const firstPositive = firstHalf.filter(entry => entry.impact > 0).length;
      const firstRatio = firstPositive / firstHalf.length * 100;
      
      const secondPositive = secondHalf.filter(entry => entry.impact > 0).length;
      const secondRatio = secondPositive / secondHalf.length * 100;
      
      // Determine trend
      if (secondRatio - firstRatio > 10) {
        trend = 'improving';
      } else if (firstRatio - secondRatio > 10) {
        trend = 'declining';
      }
    }
    
    return { 
      value: positiveRatio, 
      trend, 
      entries: filteredEntries.length 
    };
  };
  
  // Calculate streak metric
  const calculateStreakMetric = () => {
    if (!moodData || moodData.length === 0) {
      return { value: 0, trend: 'stable' };
    }
    
    // Get all dates with entries
    const entriesByDate = {};
    
    // Process mood entries
    moodData.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      entriesByDate[dateKey] = true;
    });
    
    // Calculate streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = today.toISOString().split('T')[0];
    
    let streakCount = 0;
    let currentDate = new Date(today);
    
    // Check if there's an entry for today
    if (entriesByDate[todayKey]) {
      streakCount = 1;
      
      // Check previous days
      let keepChecking = true;
      while (keepChecking) {
        currentDate.setDate(currentDate.getDate() - 1);
        const dateKey = currentDate.toISOString().split('T')[0];
        
        if (entriesByDate[dateKey]) {
          streakCount++;
        } else {
          keepChecking = false;
        }
      }
    }
    
    // Determine trend
    let trend = 'stable';
    
    if (streakCount > 3) {
      trend = 'improving';
    } else if (streakCount === 0) {
      trend = 'declining';
    }
    
    return { value: streakCount, trend };
  };
  
  // Calculate journal metric
  const calculateJournalMetric = (startDate, endDate) => {
    if (!journalEntries || journalEntries.length === 0) {
      return { value: 0, trend: 'stable', entries: 0 };
    }
    
    // Filter entries within the date range
    const filteredEntries = journalEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    if (filteredEntries.length === 0) {
      return { value: 0, trend: 'stable', entries: 0 };
    }
    
    // Average words per entry as a measure of journal engagement
    const totalWords = filteredEntries.reduce((sum, entry) => {
      const wordCount = entry.content ? entry.content.split(/\s+/).length : 0;
      return sum + wordCount;
    }, 0);
    
    const avgWords = parseFloat((totalWords / filteredEntries.length).toFixed(0));
    
    // Calculate trend if multiple entries exist
    let trend = 'stable';
    
    if (filteredEntries.length >= 3 && showTrends) {
      // Sort entries by date
      const sortedEntries = [...filteredEntries].sort((a, b) => {
        return new Date(a.timestamp) - new Date(b.timestamp);
      });
      
      // Split into two halves
      const halfIndex = Math.floor(sortedEntries.length / 2);
      const firstHalf = sortedEntries.slice(0, halfIndex);
      const secondHalf = sortedEntries.slice(halfIndex);
      
      // Calculate frequency trend
      if (secondHalf.length > firstHalf.length) {
        trend = 'improving';
      } else if (firstHalf.length > secondHalf.length) {
        trend = 'declining';
      }
    }
    
    return { 
      value: filteredEntries.length, 
      averageWords: avgWords,
      trend, 
      entries: filteredEntries.length 
    };
  };
  
  // Get trend icon and color
  const getTrendIndicator = (trend, isPositiveGood = true) => {
    if (trend === 'improving') {
      return {
        icon: '↗️',
        color: isPositiveGood ? 'text-green-500' : 'text-red-500'
      };
    } else if (trend === 'declining') {
      return {
        icon: '↘️',
        color: isPositiveGood ? 'text-red-500' : 'text-green-500'
      };
    } else {
      return {
        icon: '→',
        color: 'text-yellow-500'
      };
    }
  };
  
  // Get period label
  const getPeriodLabel = () => {
    switch (period) {
      case 'day':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      default:
        return 'This Week';
    }
  };
  
  // Get mood emoji
  const getMoodEmoji = (value) => {
    if (value >= 8) return '😄';
    if (value >= 6) return '🙂';
    if (value >= 4) return '😐';
    if (value >= 2) return '☹️';
    return '😢';
  };
  
  // Get stress emoji
  const getStressEmoji = (value) => {
    if (value <= 2) return '😌';
    if (value <= 4) return '🙂';
    if (value <= 6) return '😐';
    if (value <= 8) return '😟';
    return '😫';
  };
  
  // Render compact mode
  const renderCompactMode = () => (
    <div className="flex flex-wrap gap-4">
      {metrics.map(metricType => {
        // Early return if no data
        if (metricValues[metricType].entries === 0 && metricType !== METRIC_TYPES.STREAK) {
          return null;
        }
        
        return (
          <div 
            key={metricType} 
            className={`p-3 rounded-lg ${theme.background} border ${theme.border} cursor-pointer hover:border-indigo-300 transition-colors flex items-center space-x-3`}
            onClick={() => onMetricClick && onMetricClick(metricType)}
          >
            <div className="text-2xl">
              {metricType === METRIC_TYPES.MOOD && getMoodEmoji(metricValues[metricType].value)}
              {metricType === METRIC_TYPES.SLEEP && '💤'}
              {metricType === METRIC_TYPES.STRESS && getStressEmoji(metricValues[metricType].value)}
              {metricType === METRIC_TYPES.ACTIVITY && '🏃'}
              {metricType === METRIC_TYPES.STREAK && '🔥'}
              {metricType === METRIC_TYPES.JOURNAL && '📓'}
            </div>
            
            <div>
              <div className={`font-bold ${theme.textBold}`}>
                {metricType === METRIC_TYPES.MOOD && `${metricValues[metricType].value}/10`}
                {metricType === METRIC_TYPES.SLEEP && `${metricValues[metricType].value} hrs`}
                {metricType === METRIC_TYPES.STRESS && `${metricValues[metricType].value}/10`}
                {metricType === METRIC_TYPES.ACTIVITY && `${metricValues[metricType].value}%`}
                {metricType === METRIC_TYPES.STREAK && `${metricValues[metricType].value} days`}
                {metricType === METRIC_TYPES.JOURNAL && `${metricValues[metricType].value} entries`}
              </div>
              
              {showTrends && (
                <div className="flex items-center">
                  <span className={getTrendIndicator(
                    metricValues[metricType].trend, 
                    metricType !== METRIC_TYPES.STRESS
                  ).color}>
                    {getTrendIndicator(
                      metricValues[metricType].trend, 
                      metricType !== METRIC_TYPES.STRESS
                    ).icon}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
  
  // Render expanded mode
  const renderExpandedMode = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {metrics.includes(METRIC_TYPES.MOOD) && (
        <div 
          className={`p-4 rounded-lg ${theme.background} border ${theme.border} cursor-pointer hover:border-indigo-300 transition-colors`}
          onClick={() => onMetricClick && onMetricClick(METRIC_TYPES.MOOD)}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className={`font-medium ${theme.textBold}`}>Mood</h3>
            <span className="text-2xl">{getMoodEmoji(metricValues[METRIC_TYPES.MOOD].value)}</span>
          </div>
          
          <div className={`text-2xl font-bold ${theme.accent}`}>
            {metricValues[METRIC_TYPES.MOOD].value > 0 
              ? `${metricValues[METRIC_TYPES.MOOD].value}/10` 
              : 'No data'
            }
          </div>
          
          {showTrends && metricValues[METRIC_TYPES.MOOD].value > 0 && (
            <div className="flex items-center mt-1">
              <span className={getTrendIndicator(metricValues[METRIC_TYPES.MOOD].trend).color}>
                {getTrendIndicator(metricValues[METRIC_TYPES.MOOD].trend).icon}
              </span>
              <span className={`ml-1 text-sm ${theme.text}`}>
                {metricValues[METRIC_TYPES.MOOD].entries} entries
              </span>
            </div>
          )}
        </div>
      )}
      
      {metrics.includes(METRIC_TYPES.SLEEP) && (
        <div 
          className={`p-4 rounded-lg ${theme.background} border ${theme.border} cursor-pointer hover:border-indigo-300 transition-colors`}
          onClick={() => onMetricClick && onMetricClick(METRIC_TYPES.SLEEP)}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className={`font-medium ${theme.textBold}`}>Sleep</h3>
            <span className="text-2xl">💤</span>
          </div>
          
          <div className={`text-2xl font-bold ${theme.accent}`}>
            {metricValues[METRIC_TYPES.SLEEP].value > 0 
              ? `${metricValues[METRIC_TYPES.SLEEP].value} hrs` 
              : 'No data'
            }
          </div>
          
          {showTrends && metricValues[METRIC_TYPES.SLEEP].value > 0 && (
            <div className="flex items-center mt-1">
              <span className={getTrendIndicator(metricValues[METRIC_TYPES.SLEEP].trend).color}>
                {getTrendIndicator(metricValues[METRIC_TYPES.SLEEP].trend).icon}
              </span>
              <span className={`ml-1 text-sm ${theme.text}`}>
                {metricValues[METRIC_TYPES.SLEEP].entries} entries
              </span>
            </div>
          )}
        </div>
      )}
      
      {metrics.includes(METRIC_TYPES.STRESS) && (
        <div 
          className={`p-4 rounded-lg ${theme.background} border ${theme.border} cursor-pointer hover:border-indigo-300 transition-colors`}
          onClick={() => onMetricClick && onMetricClick(METRIC_TYPES.STRESS)}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className={`font-medium ${theme.textBold}`}>Stress</h3>
            <span className="text-2xl">{getStressEmoji(metricValues[METRIC_TYPES.STRESS].value)}</span>
          </div>
          
          <div className={`text-2xl font-bold ${theme.accent}`}>
            {metricValues[METRIC_TYPES.STRESS].value > 0 
              ? `${metricValues[METRIC_TYPES.STRESS].value}/10` 
              : 'No data'
            }
          </div>
          
          {showTrends && metricValues[METRIC_TYPES.STRESS].value > 0 && (
            <div className="flex items-center mt-1">
              <span className={getTrendIndicator(metricValues[METRIC_TYPES.STRESS].trend, false).color}>
                {getTrendIndicator(metricValues[METRIC_TYPES.STRESS].trend, false).icon}
              </span>
              <span className={`ml-1 text-sm ${theme.text}`}>
                {metricValues[METRIC_TYPES.STRESS].entries} entries
              </span>
            </div>
          )}
        </div>
      )}
      
      {metrics.includes(METRIC_TYPES.ACTIVITY) && (
        <div 
          className={`p-4 rounded-lg ${theme.background} border ${theme.border} cursor-pointer hover:border-indigo-300 transition-colors`}
          onClick={() => onMetricClick && onMetricClick(METRIC_TYPES.ACTIVITY)}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className={`font-medium ${theme.textBold}`}>Positive Activities</h3>
            <span className="text-2xl">🏃</span>
          </div>
          
          <div className={`text-2xl font-bold ${theme.accent}`}>
            {metricValues[METRIC_TYPES.ACTIVITY].entries > 0 
              ? `${metricValues[METRIC_TYPES.ACTIVITY].value}%` 
              : 'No data'
            }
          </div>
          
          {showTrends && metricValues[METRIC_TYPES.ACTIVITY].entries > 0 && (
            <div className="flex items-center mt-1">
              <span className={getTrendIndicator(metricValues[METRIC_TYPES.ACTIVITY].trend).color}>
                {getTrendIndicator(metricValues[METRIC_TYPES.ACTIVITY].trend).icon}
              </span>
              <span className={`ml-1 text-sm ${theme.text}`}>
                {metricValues[METRIC_TYPES.ACTIVITY].entries} entries
              </span>
            </div>
          )}
        </div>
      )}
      
      {metrics.includes(METRIC_TYPES.STREAK) && (
        <div 
          className={`p-4 rounded-lg ${theme.background} border ${theme.border} cursor-pointer hover:border-indigo-300 transition-colors`}
          onClick={() => onMetricClick && onMetricClick(METRIC_TYPES.STREAK)}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className={`font-medium ${theme.textBold}`}>Streak</h3>
            <span className="text-2xl">🔥</span>
          </div>
          
          <div className={`text-2xl font-bold ${theme.accent}`}>
            {`${metricValues[METRIC_TYPES.STREAK].value} days`}
          </div>
          
          {showTrends && (
            <div className="flex items-center mt-1">
              <span className={getTrendIndicator(metricValues[METRIC_TYPES.STREAK].trend).color}>
                {getTrendIndicator(metricValues[METRIC_TYPES.STREAK].trend).icon}
              </span>
              <span className={`ml-1 text-sm ${theme.text}`}>
                {metricValues[METRIC_TYPES.STREAK].value > 0 
                  ? 'Keep it up!' 
                  : 'Start today!'}
              </span>
            </div>
          )}
        </div>
      )}
      
      {metrics.includes(METRIC_TYPES.JOURNAL) && (
        <div 
          className={`p-4 rounded-lg ${theme.background} border ${theme.border} cursor-pointer hover:border-indigo-300 transition-colors`}
          onClick={() => onMetricClick && onMetricClick(METRIC_TYPES.JOURNAL)}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className={`font-medium ${theme.textBold}`}>Journal Entries</h3>
            <span className="text-2xl">📓</span>
          </div>
          
          <div className={`text-2xl font-bold ${theme.accent}`}>
            {metricValues[METRIC_TYPES.JOURNAL].value > 0 
              ? metricValues[METRIC_TYPES.JOURNAL].value 
              : 'No entries'
            }
          </div>
          
          {showTrends && metricValues[METRIC_TYPES.JOURNAL].value > 0 && (
            <div className="flex items-center mt-1">
              <span className={getTrendIndicator(metricValues[METRIC_TYPES.JOURNAL].trend).color}>
                {getTrendIndicator(metricValues[METRIC_TYPES.JOURNAL].trend).icon}
              </span>
              <span className={`ml-1 text-sm ${theme.text}`}>
                Avg. {metricValues[METRIC_TYPES.JOURNAL].averageWords || 0} words
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
  
  return (
    <div className={theme.card}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-bold ${theme.textBold}`}>Metrics Summary</h2>
          <span className={`text-sm ${theme.text}`}>{getPeriodLabel()}</span>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : compact ? renderCompactMode() : renderExpandedMode()}
      </div>
    </div>
  );
};

// Export metric types for easy reference
export const MetricTypes = METRIC_TYPES;

export default MetricsSummary;