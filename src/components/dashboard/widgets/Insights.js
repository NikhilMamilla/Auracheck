// src/components/dashboard/widgets/Insights.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useUserData } from '../../../context/UserDataContext';
import { useTheme } from '../../../context/ThemeContext';

// Insight categories
const INSIGHT_CATEGORIES = {
  MOOD: 'mood',
  SLEEP: 'sleep',
  STRESS: 'stress',
  CORRELATION: 'correlation',
  SUGGESTION: 'suggestion',
  STREAK: 'streak'
};

const Insights = ({ 
  categories = Object.values(INSIGHT_CATEGORIES),
  maxInsights = 3,
  timePeriod = 'week', // 'day', 'week', 'month', 'year'
  onInsightClick = null
}) => {
  const { currentUser } = useAuth();
  const { 
    moodData, 
    sleepData, 
    stressData, 
    activityData,
    predictions, 
    loading 
  } = useUserData();
  const { theme } = useTheme();
  
  // State for insights
  const [insights, setInsights] = useState([]);
  const [insightLoading, setInsightLoading] = useState(true);
  
  // Generate insights when data changes
  useEffect(() => {
    if (loading) return;
    
    // Start insight generation
    setInsightLoading(true);
    
    // Get date range based on period
    const { startDate, endDate } = getDateRange(timePeriod);
    
    // Generate all possible insights
    const allInsights = [];
    
    // Add mood insights
    if (categories.includes(INSIGHT_CATEGORIES.MOOD)) {
      const moodInsights = generateMoodInsights(startDate, endDate);
      allInsights.push(...moodInsights);
    }
    
    // Add sleep insights
    if (categories.includes(INSIGHT_CATEGORIES.SLEEP)) {
      const sleepInsights = generateSleepInsights(startDate, endDate);
      allInsights.push(...sleepInsights);
    }
    
    // Add stress insights
    if (categories.includes(INSIGHT_CATEGORIES.STRESS)) {
      const stressInsights = generateStressInsights(startDate, endDate);
      allInsights.push(...stressInsights);
    }
    
    // Add correlation insights
    if (categories.includes(INSIGHT_CATEGORIES.CORRELATION)) {
      const correlationInsights = generateCorrelationInsights(startDate, endDate);
      allInsights.push(...correlationInsights);
    }
    
    // Add suggestion insights
    if (categories.includes(INSIGHT_CATEGORIES.SUGGESTION)) {
      const suggestionInsights = generateSuggestionInsights(startDate, endDate);
      allInsights.push(...suggestionInsights);
    }
    
    // Add streak insights
    if (categories.includes(INSIGHT_CATEGORIES.STREAK)) {
      const streakInsights = generateStreakInsights();
      allInsights.push(...streakInsights);
    }
    
    // Add any custom predictions from the backend
    if (predictions && predictions.insights) {
      allInsights.push(...predictions.insights);
    }
    
    // Sort insights by priority (higher is more important)
    allInsights.sort((a, b) => b.priority - a.priority);
    
    // Limit to maxInsights
    const limitedInsights = allInsights.slice(0, maxInsights);
    
    // Update state
    setInsights(limitedInsights);
    setInsightLoading(false);
  }, [moodData, sleepData, stressData, activityData, predictions, categories, timePeriod, maxInsights, loading]);
  
  // Get date range based on period
  const getDateRange = (period) => {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);
    
    switch (period) {
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
  
  // Generate mood insights
  const generateMoodInsights = (startDate, endDate) => {
    const insights = [];
    
    if (!moodData || moodData.length === 0) {
      return insights;
    }
    
    // Filter entries within the date range
    const filteredEntries = moodData.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    if (filteredEntries.length === 0) {
      return insights;
    }
    
    // Calculate average mood
    const totalMood = filteredEntries.reduce((sum, entry) => sum + entry.score, 0);
    const avgMood = parseFloat((totalMood / filteredEntries.length).toFixed(1));
    
    // Find highest and lowest mood days
    let highestMood = -1;
    let highestMoodDate = null;
    let lowestMood = 11;
    let lowestMoodDate = null;
    
    filteredEntries.forEach(entry => {
      if (entry.score > highestMood) {
        highestMood = entry.score;
        highestMoodDate = new Date(entry.timestamp);
      }
      if (entry.score < lowestMood) {
        lowestMood = entry.score;
        lowestMoodDate = new Date(entry.timestamp);
      }
    });
    
    // Calculate trend
    let trend = 'stable';
    
    if (filteredEntries.length >= 3) {
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
    
    // Insight 1: Overall mood trend
    if (trend === 'improving') {
      insights.push({
        category: INSIGHT_CATEGORIES.MOOD,
        title: 'Your mood is improving! 🎉',
        description: `Your average mood has been trending upward over the ${timePeriod}. Great job on your progress!`,
        icon: '📈',
        priority: 80
      });
    } else if (trend === 'declining' && avgMood < 5) {
      insights.push({
        category: INSIGHT_CATEGORIES.MOOD,
        title: 'Your mood has been declining',
        description: `Your average mood has been trending downward over the ${timePeriod}. Consider using some self-care strategies.`,
        icon: '📉',
        priority: 90
      });
    }
    
    // Insight 2: Mood variability
    if (filteredEntries.length >= 5) {
      // Calculate standard deviation
      const mean = avgMood;
      const squaredDiffs = filteredEntries.map(entry => Math.pow(entry.score - mean, 2));
      const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
      const stdDev = Math.sqrt(avgSquaredDiff);
      
      if (stdDev > 2.5) {
        insights.push({
          category: INSIGHT_CATEGORIES.MOOD,
          title: 'Your mood varies significantly',
          description: `Your mood has high variability, with scores ranging from ${lowestMood} to ${highestMood}. Stabilizing routines may help.`,
          icon: '🔄',
          priority: 70
        });
      } else if (stdDev < 0.8 && filteredEntries.length >= 7) {
        insights.push({
          category: INSIGHT_CATEGORIES.MOOD,
          title: 'Your mood is very consistent',
          description: 'Your mood shows little variation day-to-day, which can be a sign of emotional stability.',
          icon: '📊',
          priority: 60
        });
      }
    }
    
    // Insight 3: High or low average mood
    if (avgMood >= 8) {
      insights.push({
        category: INSIGHT_CATEGORIES.MOOD,
        title: 'Your mood has been excellent!',
        description: `Your average mood of ${avgMood}/10 is excellent. Whatever you're doing, keep it up!`,
        icon: '🌟',
        priority: 75
      });
    } else if (avgMood <= 4) {
      insights.push({
        category: INSIGHT_CATEGORIES.MOOD,
        title: 'Your mood has been lower than ideal',
        description: `Your average mood of ${avgMood}/10 indicates you might be going through a difficult time. Reach out for support if needed.`,
        icon: '💭',
        priority: 85
      });
    }
    
    return insights;
  };
  
  // Generate sleep insights
  const generateSleepInsights = (startDate, endDate) => {
    const insights = [];
    
    if (!sleepData || sleepData.length === 0) {
      return insights;
    }
    
    // Filter entries within the date range
    const filteredEntries = sleepData.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    if (filteredEntries.length === 0) {
      return insights;
    }
    
    // Calculate average sleep
    const totalSleep = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const avgSleep = parseFloat((totalSleep / filteredEntries.length).toFixed(1));
    
    // Calculate consistency (standard deviation)
    const mean = avgSleep;
    const squaredDiffs = filteredEntries.map(entry => Math.pow(entry.hours - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
    const stdDev = Math.sqrt(avgSquaredDiff);
    
    // Calculate sleep debt (based on 8 hours optimal)
    const optimalSleep = 8;
    const sleepDebt = parseFloat((optimalSleep - avgSleep) * filteredEntries.length).toFixed(1);
    
    // Insight 1: Sleep duration
    if (avgSleep < 6) {
      insights.push({
        category: INSIGHT_CATEGORIES.SLEEP,
        title: 'You may not be getting enough sleep',
        description: `Your average of ${avgSleep} hours is below the recommended 7-9 hours for adults. This can affect mood and energy.`,
        icon: '⏰',
        priority: 95
      });
    } else if (avgSleep > 9.5) {
      insights.push({
        category: INSIGHT_CATEGORIES.SLEEP,
        title: 'You might be oversleeping',
        description: `Your average of ${avgSleep} hours is above the typical recommendation. Excessive sleep can sometimes indicate other issues.`,
        icon: '🛌',
        priority: 75
      });
    } else if (avgSleep >= 7 && avgSleep <= 9) {
      insights.push({
        category: INSIGHT_CATEGORIES.SLEEP,
        title: 'Your sleep duration is optimal',
        description: `Your average of ${avgSleep} hours falls within the recommended range for adults. Great job!`,
        icon: '✨',
        priority: 60
      });
    }
    
    // Insight 2: Sleep consistency
    if (stdDev > 1.5 && filteredEntries.length >= 5) {
      insights.push({
        category: INSIGHT_CATEGORIES.SLEEP,
        title: 'Your sleep schedule is inconsistent',
        description: 'Your sleep duration varies significantly from day to day. A more consistent schedule may improve sleep quality.',
        icon: '📆',
        priority: 85
      });
    } else if (stdDev < 0.8 && filteredEntries.length >= 5) {
      insights.push({
        category: INSIGHT_CATEGORIES.SLEEP,
        title: 'Your sleep schedule is very consistent',
        description: 'You maintain a consistent sleep duration, which is excellent for your circadian rhythm and overall well-being.',
        icon: '🏆',
        priority: 65
      });
    }
    
    // Insight 3: Sleep debt
    if (sleepDebt > 7) {
      insights.push({
        category: INSIGHT_CATEGORIES.SLEEP,
        title: 'You have significant sleep debt',
        description: `You're about ${sleepDebt} hours short of recommended sleep over the past ${timePeriod}. Consider catching up gradually.`,
        icon: '💤',
        priority: 90
      });
    }
    
    return insights;
  };
  
  // Generate stress insights
  const generateStressInsights = (startDate, endDate) => {
    const insights = [];
    
    if (!stressData || stressData.length === 0) {
      return insights;
    }
    
    // Filter entries within the date range
    const filteredEntries = stressData.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    if (filteredEntries.length === 0) {
      return insights;
    }
    
    // Calculate average stress
    const totalStress = filteredEntries.reduce((sum, entry) => sum + entry.level, 0);
    const avgStress = parseFloat((totalStress / filteredEntries.length).toFixed(1));
    
    // Calculate trend
    let trend = 'stable';
    
    if (filteredEntries.length >= 3) {
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
        trend = 'increasing';
      } else if (firstAvg - secondAvg > 0.5) {
        trend = 'decreasing';
      }
    }
    
    // Find peak stress days
    let maxStress = -1;
    let maxStressDate = null;
    
    filteredEntries.forEach(entry => {
      if (entry.level > maxStress) {
        maxStress = entry.level;
        maxStressDate = new Date(entry.timestamp);
      }
    });
    
    // Insight 1: Stress level
    if (avgStress > 7) {
      insights.push({
        category: INSIGHT_CATEGORIES.STRESS,
        title: 'Your stress levels are high',
        description: `Your average stress level of ${avgStress}/10 is high. Consider stress management techniques like meditation or exercise.`,
        icon: '😰',
        priority: 95
      });
    } else if (avgStress < 4) {
      insights.push({
        category: INSIGHT_CATEGORIES.STRESS,
        title: 'Your stress levels are low',
        description: `Your average stress level of ${avgStress}/10 indicates you're managing stress well. Great job!`,
        icon: '😌',
        priority: 60
      });
    }
    
    // Insight 2: Stress trend
    if (trend === 'increasing' && avgStress > 5) {
      insights.push({
        category: INSIGHT_CATEGORIES.STRESS,
        title: 'Your stress is increasing',
        description: `Your stress levels have been trending upward over the ${timePeriod}. Consider taking steps to address potential stressors.`,
        icon: '📈',
        priority: 90
      });
    } else if (trend === 'decreasing' && filteredEntries.length >= 5) {
      insights.push({
        category: INSIGHT_CATEGORIES.STRESS,
        title: 'Your stress is decreasing',
        description: `Your stress levels have been trending downward over the ${timePeriod}. Whatever you're doing seems to be working!`,
        icon: '📉',
        priority: 70
      });
    }
    
    // Insight 3: Peak stress
    if (maxStress >= 9 && filteredEntries.length >= 5) {
      const dayName = maxStressDate.toLocaleDateString(undefined, { weekday: 'long' });
      insights.push({
        category: INSIGHT_CATEGORIES.STRESS,
        title: 'You experienced peak stress recently',
        description: `You recorded very high stress (${maxStress}/10) on ${dayName}. Identifying triggers on high-stress days can help with management.`,
        icon: '🔍',
        priority: 85
      });
    }
    
    return insights;
  };
  
  // Generate correlation insights
  const generateCorrelationInsights = (startDate, endDate) => {
    const insights = [];
    
    // Need at least mood and sleep data to find correlations
    if (!moodData || !sleepData || moodData.length === 0 || sleepData.length === 0) {
      return insights;
    }
    
    // Create a combined timeline with dates as keys
    const timeline = {};
    
    // Add mood data to timeline
    moodData.forEach(entry => {
      const date = new Date(entry.timestamp);
      if (date >= startDate && date <= endDate) {
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!timeline[dateKey]) {
          timeline[dateKey] = {};
        }
        
        timeline[dateKey].mood = entry.score;
      }
    });
    
    // Add sleep data to timeline
    sleepData.forEach(entry => {
      const date = new Date(entry.timestamp);
      if (date >= startDate && date <= endDate) {
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!timeline[dateKey]) {
          timeline[dateKey] = {};
        }
        
        timeline[dateKey].sleep = entry.hours;
      }
    });
    
    // Add stress data to timeline
    if (stressData && stressData.length > 0) {
      stressData.forEach(entry => {
        const date = new Date(entry.timestamp);
        if (date >= startDate && date <= endDate) {
          const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
          
          if (!timeline[dateKey]) {
            timeline[dateKey] = {};
          }
          
          timeline[dateKey].stress = entry.level;
        }
      });
    }
    
    // Need at least 5 days with both mood and sleep data to find correlations
    const daysBothMoodAndSleep = Object.values(timeline).filter(day => day.mood !== undefined && day.sleep !== undefined);
    if (daysBothMoodAndSleep.length < 5) {
      return insights;
    }
    
    // Calculate sleep-mood correlation
    let sumProduct = 0;
    let sumMood = 0;
    let sumSleep = 0;
    let sumMoodSquared = 0;
    let sumSleepSquared = 0;
    let n = 0;
    
    daysBothMoodAndSleep.forEach(day => {
      sumProduct += day.mood * day.sleep;
      sumMood += day.mood;
      sumSleep += day.sleep;
      sumMoodSquared += day.mood * day.mood;
      sumSleepSquared += day.sleep * day.sleep;
      n++;
    });
    
    // Pearson correlation coefficient
    const numerator = sumProduct - (sumMood * sumSleep / n);
    const denominator = Math.sqrt((sumMoodSquared - (sumMood * sumMood / n)) * (sumSleepSquared - (sumSleep * sumSleep / n)));
    const sleepMoodCorrelation = numerator / denominator;
    
    // Insight based on sleep-mood correlation
    if (Math.abs(sleepMoodCorrelation) > 0.4) {
      if (sleepMoodCorrelation > 0) {
        insights.push({
          category: INSIGHT_CATEGORIES.CORRELATION,
          title: 'Sleep appears to affect your mood',
          description: 'There is a positive correlation between your sleep hours and mood scores. Getting enough sleep might help maintain a better mood.',
          icon: '🧠',
          priority: 85
        });
      } else {
        insights.push({
          category: INSIGHT_CATEGORIES.CORRELATION,
          title: 'Unusual sleep-mood pattern detected',
          description: 'There appears to be a negative correlation between sleep duration and mood in your data. This is uncommon and might be worth exploring.',
          icon: '🔍',
          priority: 75
        });
      }
    }
    
    // If we have stress data, calculate stress-mood correlation
    const daysBothMoodAndStress = Object.values(timeline).filter(day => day.mood !== undefined && day.stress !== undefined);
    if (daysBothMoodAndStress.length >= 5 && stressData && stressData.length > 0) {
      let sumProduct = 0;
      let sumMood = 0;
      let sumStress = 0;
      let sumMoodSquared = 0;
      let sumStressSquared = 0;
      let n = 0;
      
      daysBothMoodAndStress.forEach(day => {
        sumProduct += day.mood * day.stress;
        sumMood += day.mood;
        sumStress += day.stress;
        sumMoodSquared += day.mood * day.mood;
        sumStressSquared += day.stress * day.stress;
        n++;
      });
      
      // Pearson correlation coefficient
      const numerator = sumProduct - (sumMood * sumStress / n);
      const denominator = Math.sqrt((sumMoodSquared - (sumMood * sumMood / n)) * (sumStressSquared - (sumStress * sumStress / n)));
      const stressMoodCorrelation = numerator / denominator;
      
      // Insight based on stress-mood correlation
      if (stressMoodCorrelation < -0.4) {
        insights.push({
          category: INSIGHT_CATEGORIES.CORRELATION,
          title: 'Stress seems to affect your mood',
          description: 'There is a negative correlation between your stress levels and mood. Managing stress might help improve your overall mood.',
          icon: '🧘',
          priority: 80
        });
      }
    }
    
    // Activity impact analysis
    if (activityData && activityData.length > 0) {
      // Get activities with positive impacts
      const positiveActivities = activityData
        .filter(entry => {
          const date = new Date(entry.timestamp);
          return date >= startDate && date <= endDate && entry.impact > 2;
        })
        .map(entry => entry.activity)
        .filter(activity => activity); // Filter out undefined/null
      
      // Count frequency of each positive activity
      const activityCounts = {};
      positiveActivities.forEach(activity => {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1;
      });
      
      // Find most frequent positive activity
      let topActivity = null;
      let topCount = 0;
      
      Object.keys(activityCounts).forEach(activity => {
        if (activityCounts[activity] > topCount) {
          topActivity = activity;
          topCount = activityCounts[activity];
        }
      });
      
      if (topActivity && topCount >= 2) {
        insights.push({
          category: INSIGHT_CATEGORIES.CORRELATION,
          title: `${topActivity} seems to boost your mood`,
          description: `${topActivity} appears ${topCount} times as a positive activity. Consider making it a regular part of your routine.`,
          icon: '🌱',
          priority: 75
        });
      }
    }
    
    return insights;
  };
  
  // Generate suggestion insights
  const generateSuggestionInsights = (startDate, endDate) => {
    const insights = [];
    
    // Suggestions based on mood data
    if (moodData && moodData.length > 0) {
      const filteredEntries = moodData.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && entryDate <= endDate;
      });
      
      // Average mood
      const totalMood = filteredEntries.reduce((sum, entry) => sum + entry.score, 0);
      const avgMood = filteredEntries.length > 0 ? 
        parseFloat((totalMood / filteredEntries.length).toFixed(1)) : 0;
      
      // Low mood suggestions
      if (avgMood < 5 && avgMood > 0) {
        insights.push({
          category: INSIGHT_CATEGORIES.SUGGESTION,
          title: 'Activities that might help your mood',
          description: 'Consider physical exercise, social connection, or spending time in nature - these are scientifically shown to improve mood.',
          icon: '💡',
          priority: 80
        });
      }
      
      // Mood tracking encouragement if few entries
      if (filteredEntries.length < 3 && timePeriod === 'week') {
        insights.push({
          category: INSIGHT_CATEGORIES.SUGGESTION,
          title: 'Try tracking your mood more often',
          description: 'More frequent mood tracking can help you identify patterns and improve self-awareness.',
          icon: '📝',
          priority: 65
        });
      }
    }
    
    // Suggestions based on sleep data
    if (sleepData && sleepData.length > 0) {
      const filteredEntries = sleepData.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && entryDate <= endDate;
      });
      
      // Average sleep
      const totalSleep = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0);
      const avgSleep = filteredEntries.length > 0 ? 
        parseFloat((totalSleep / filteredEntries.length).toFixed(1)) : 0;
      
      // Sleep quality suggestions
      if (avgSleep < 6.5 && avgSleep > 0) {
        insights.push({
          category: INSIGHT_CATEGORIES.SUGGESTION,
          title: 'Tips for better sleep',
          description: 'Try establishing a consistent sleep schedule, reducing screen time before bed, and creating a relaxing bedtime routine.',
          icon: '🌙',
          priority: 85
        });
      }
    }
    
    // Suggestions based on stress data
    if (stressData && stressData.length > 0) {
      const filteredEntries = stressData.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && entryDate <= endDate;
      });
      
      // Average stress
      const totalStress = filteredEntries.reduce((sum, entry) => sum + entry.level, 0);
      const avgStress = filteredEntries.length > 0 ? 
        parseFloat((totalStress / filteredEntries.length).toFixed(1)) : 0;
      
      // Stress management suggestions
      if (avgStress > 6.5) {
        insights.push({
          category: INSIGHT_CATEGORIES.SUGGESTION,
          title: 'Stress reduction techniques',
          description: 'Deep breathing, mindfulness meditation, and regular exercise can help reduce stress levels and improve well-being.',
          icon: '🧘',
          priority: 85
        });
      }
    }
    
    // General wellbeing suggestion (lower priority)
    insights.push({
      category: INSIGHT_CATEGORIES.SUGGESTION,
      title: 'Small steps toward well-being',
      description: 'Remember that small daily actions like brief walks, gratitude practices, or moments of mindfulness can have cumulative benefits.',
      icon: '✨',
      priority: 50
    });
    
    return insights;
  };
  
  // Generate streak insights
  const generateStreakInsights = () => {
    const insights = [];
    
    if (!moodData || moodData.length === 0) {
      return insights;
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
    
    // Generate streak insights
    if (streakCount >= 7) {
      insights.push({
        category: INSIGHT_CATEGORIES.STREAK,
        title: `${streakCount}-day streak! 🔥`,
        description: `You've been tracking your mood for ${streakCount} consecutive days. Impressive consistency!`,
        icon: '🏆',
        priority: 90
      });
    } else if (streakCount >= 3) {
      insights.push({
        category: INSIGHT_CATEGORIES.STREAK,
        title: `${streakCount}-day streak`,
        description: `You've logged your mood for ${streakCount} days in a row. Keep going!`,
        icon: '🔥',
        priority: 75
      });
    } else if (streakCount === 0) {
      // Check when the last entry was
      const dateKeys = Object.keys(entriesByDate).sort();
      if (dateKeys.length > 0) {
        const lastEntryDate = new Date(dateKeys[dateKeys.length - 1]);
        const daysSinceLastEntry = Math.floor((today - lastEntryDate) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastEntry <= 3) {
          insights.push({
            category: INSIGHT_CATEGORIES.STREAK,
            title: 'Continue your tracking journey',
            description: `It's been ${daysSinceLastEntry} day${daysSinceLastEntry !== 1 ? 's' : ''} since your last entry. Log your mood today to build consistency.`,
            icon: '📊',
            priority: 70
          });
        } else if (daysSinceLastEntry <= 7) {
          insights.push({
            category: INSIGHT_CATEGORIES.STREAK,
            title: 'Welcome back!',
            description: `It's been ${daysSinceLastEntry} days since your last mood entry. Tracking regularly helps you gain more insights.`,
            icon: '👋',
            priority: 65
          });
        }
      } else if (moodData.length === 0) {
        insights.push({
          category: INSIGHT_CATEGORIES.STREAK,
          title: 'Start your tracking journey',
          description: 'Log your first mood entry today to begin tracking your mental health journey.',
          icon: '🚀',
          priority: 60
        });
      }
    }
    
    return insights;
  };
  
  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case INSIGHT_CATEGORIES.MOOD:
        return '😊';
      case INSIGHT_CATEGORIES.SLEEP:
        return '💤';
      case INSIGHT_CATEGORIES.STRESS:
        return '🧘';
      case INSIGHT_CATEGORIES.CORRELATION:
        return '🔄';
      case INSIGHT_CATEGORIES.SUGGESTION:
        return '💡';
      case INSIGHT_CATEGORIES.STREAK:
        return '🔥';
      default:
        return '📊';
    }
  };
  
  // Handle insight click
  const handleInsightClick = (insight) => {
    if (onInsightClick) {
      onInsightClick(insight);
    }
  };
  
  // Get time period label
  const getTimePeriodLabel = () => {
    switch (timePeriod) {
      case 'day':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      default:
        return 'Recently';
    }
  };
  
  return (
    <div className={theme.card}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-bold ${theme.textBold}`}>Insights</h2>
          <span className={`text-sm ${theme.text}`}>{getTimePeriodLabel()}</span>
        </div>
        
        {insightLoading || loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div 
                key={`insight-${index}`}
                className={`p-4 rounded-lg ${theme.background} border ${theme.border} cursor-pointer hover:border-indigo-300 transition-colors`}
                onClick={() => handleInsightClick(insight)}
              >
                <div className="flex">
                  <div className="text-2xl mr-3 flex-shrink-0">
                    {insight.icon || getCategoryIcon(insight.category)}
                  </div>
                  
                  <div>
                    <div className={`font-medium ${theme.textBold}`}>
                      {insight.title}
                    </div>
                    
                    <div className={`${theme.text} text-sm mt-1`}>
                      {insight.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-4 ${theme.text}`}>
            <p>Not enough data to generate insights yet.</p>
            <p className="mt-2 text-sm">Continue tracking your mood, sleep, and stress to receive personalized insights.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Export insight categories for easy reference
export const InsightCategories = INSIGHT_CATEGORIES;

export default Insights;
    
    