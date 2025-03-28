import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../context/UserDataContext';
import { useTheme } from '../../context/ThemeContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const MoodTracker = () => {
  const { currentUser } = useAuth();
  const { moodData, addMoodEntry, loading } = useUserData();
  const { theme, isDark } = useTheme();
  
  // State for new mood entry
  const [newMood, setNewMood] = useState({
    score: 5,
    notes: '',
    triggers: [],
    activities: []
  });
  
  // State for visualizations
  const [visualizationData, setVisualizationData] = useState({
    timeline: [],
    distribution: [],
    weekdayAverages: [],
    timeOfDayAverages: []
  });
  
  // State for filters
  const [filters, setFilters] = useState({
    dateRange: '30d', // Options: '7d', '30d', '90d', '1y', 'all'
    groupBy: 'day' // Options: 'day', 'week', 'month'
  });
  
  // State for insights
  const [insights, setInsights] = useState({
    averageMood: 0,
    moodTrend: 'stable',
    highestDay: null,
    lowestDay: null,
    bestTimeOfDay: null,
    bestDayOfWeek: null,
    moodVariability: 0
  });
  
  // Trigger options
  const triggerOptions = [
    { id: 'work', label: 'Work' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'health', label: 'Health' },
    { id: 'finances', label: 'Finances' },
    { id: 'family', label: 'Family' },
    { id: 'social', label: 'Social Activities' },
    { id: 'weather', label: 'Weather' },
    { id: 'sleep', label: 'Sleep' }
  ];
  
  // Activity options
  const activityOptions = [
    { id: 'exercise', label: 'Exercise' },
    { id: 'meditation', label: 'Meditation' },
    { id: 'reading', label: 'Reading' },
    { id: 'nature', label: 'Time in Nature' },
    { id: 'hobbies', label: 'Hobbies' },
    { id: 'socializing', label: 'Socializing' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'work', label: 'Productive Work' }
  ];
  
  // Process mood data when it changes or filters change
  useEffect(() => {
    if (loading || !moodData || moodData.length === 0) return;
    
    // Process data for visualizations based on filters
    processDataForVisualizations();
    
    // Generate insights from the data
    generateInsights();
  }, [moodData, filters, loading]);
  
  // Get mood emoji based on score
  const getMoodEmoji = (score) => {
    if (score >= 9) return '😄';
    if (score >= 7) return '🙂';
    if (score >= 5) return '😐';
    if (score >= 3) return '☹️';
    return '😢';
  };
  
  // Get mood color based on score
  const getMoodColor = (score) => {
    if (score >= 9) return '#4CAF50'; // Green
    if (score >= 7) return '#8BC34A'; // Light Green
    if (score >= 5) return '#FFC107'; // Yellow
    if (score >= 3) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    const options = { hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  // Process data for visualizations based on filters
  const processDataForVisualizations = () => {
    if (!moodData || moodData.length === 0) return;
    
    // Filter data based on date range
    const filteredData = filterDataByDateRange(moodData, filters.dateRange);
    
    // Generate timeline data
    const timelineData = generateTimelineData(filteredData, filters.groupBy);
    
    // Generate distribution data
    const distributionData = generateDistributionData(filteredData);
    
    // Generate weekday averages
    const weekdayAverages = generateWeekdayAverages(filteredData);
    
    // Generate time of day averages
    const timeOfDayAverages = generateTimeOfDayAverages(filteredData);
    
    // Update state with new visualization data
    setVisualizationData({
      timeline: timelineData,
      distribution: distributionData,
      weekdayAverages: weekdayAverages,
      timeOfDayAverages: timeOfDayAverages
    });
  };
  
  // Filter data by date range
  const filterDataByDateRange = (data, range) => {
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    return data.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= now;
    });
  };
  
  // Generate timeline data grouped by day, week, or month
  const generateTimelineData = (data, groupBy) => {
    if (!data || data.length === 0) return [];
    
    const groupedData = {};
    
    data.forEach(entry => {
      const date = new Date(entry.timestamp);
      let groupKey;
      
      if (groupBy === 'day') {
        groupKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (groupBy === 'week') {
        // Get the week number and year
        const onejan = new Date(date.getFullYear(), 0, 1);
        const weekNum = Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
        groupKey = `${date.getFullYear()}-W${weekNum}`;
      } else if (groupBy === 'month') {
        groupKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-MM
      }
      
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          date: groupKey,
          displayDate: formatDate(date),
          totalScore: 0,
          count: 0
        };
      }
      
      groupedData[groupKey].totalScore += entry.score;
      groupedData[groupKey].count += 1;
    });
    
    // Calculate averages for each group
    const result = Object.values(groupedData).map(group => ({
      date: group.date,
      displayDate: group.displayDate,
      score: parseFloat((group.totalScore / group.count).toFixed(1))
    }));
    
    // Sort by date
    return result.sort((a, b) => a.date.localeCompare(b.date));
  };
  
  // Generate mood distribution data
  const generateDistributionData = (data) => {
    if (!data || data.length === 0) return [];
    
    const distribution = [
      { range: '1-2', label: 'Very Low', count: 0 },
      { range: '3-4', label: 'Low', count: 0 },
      { range: '5-6', label: 'Neutral', count: 0 },
      { range: '7-8', label: 'Good', count: 0 },
      { range: '9-10', label: 'Excellent', count: 0 }
    ];
    
    data.forEach(entry => {
      if (entry.score <= 2) {
        distribution[0].count += 1;
      } else if (entry.score <= 4) {
        distribution[1].count += 1;
      } else if (entry.score <= 6) {
        distribution[2].count += 1;
      } else if (entry.score <= 8) {
        distribution[3].count += 1;
      } else {
        distribution[4].count += 1;
      }
    });
    
    return distribution;
  };
  
  // Generate weekday averages
  const generateWeekdayAverages = (data) => {
    if (!data || data.length === 0) {
      // Return all weekdays with zero values if no data
      return [
        { name: 'Sunday', score: 0, entries: 0 },
        { name: 'Monday', score: 0, entries: 0 },
        { name: 'Tuesday', score: 0, entries: 0 },
        { name: 'Wednesday', score: 0, entries: 0 },
        { name: 'Thursday', score: 0, entries: 0 },
        { name: 'Friday', score: 0, entries: 0 },
        { name: 'Saturday', score: 0, entries: 0 }
      ];
    }
      
    const weekdays = [
      { day: 0, name: 'Sunday', totalScore: 0, count: 0 },
      { day: 1, name: 'Monday', totalScore: 0, count: 0 },
      { day: 2, name: 'Tuesday', totalScore: 0, count: 0 },
      { day: 3, name: 'Wednesday', totalScore: 0, count: 0 },
      { day: 4, name: 'Thursday', totalScore: 0, count: 0 },
      { day: 5, name: 'Friday', totalScore: 0, count: 0 },
      { day: 6, name: 'Saturday', totalScore: 0, count: 0 }
    ];
      
    data.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dayOfWeek = date.getDay();
        
      weekdays[dayOfWeek].totalScore += entry.score;
      weekdays[dayOfWeek].count += 1;
    });
      
    // Always return all days, even if they have zero entries
    return weekdays.map(day => ({
      name: day.name,
      score: day.count > 0 ? parseFloat((day.totalScore / day.count).toFixed(1)) : 0,
      entries: day.count
    }));
  };
  
  // Generate time of day averages
  const generateTimeOfDayAverages = (data) => {
    if (!data || data.length === 0) return [];
    
    const timeSlots = [
      { slot: 'morning', label: 'Morning (5-11)', totalScore: 0, count: 0 },
      { slot: 'afternoon', label: 'Afternoon (12-16)', totalScore: 0, count: 0 },
      { slot: 'evening', label: 'Evening (17-21)', totalScore: 0, count: 0 },
      { slot: 'night', label: 'Night (22-4)', totalScore: 0, count: 0 }
    ];
    
    data.forEach(entry => {
      const date = new Date(entry.timestamp);
      const hour = date.getHours();
      
      let slotIndex;
      if (hour >= 5 && hour <= 11) {
        slotIndex = 0; // Morning
      } else if (hour >= 12 && hour <= 16) {
        slotIndex = 1; // Afternoon
      } else if (hour >= 17 && hour <= 21) {
        slotIndex = 2; // Evening
      } else {
        slotIndex = 3; // Night
      }
      
      timeSlots[slotIndex].totalScore += entry.score;
      timeSlots[slotIndex].count += 1;
    });
    
    return timeSlots.map(slot => ({
      name: slot.label,
      score: slot.count > 0 ? parseFloat((slot.totalScore / slot.count).toFixed(1)) : 0,
      entries: slot.count
    }));
  };
  
  // Generate insights from the mood data
  const generateInsights = () => {
    if (!moodData || moodData.length === 0) return;
    
    // Filter data based on date range
    const filteredData = filterDataByDateRange(moodData, filters.dateRange);
    
    if (filteredData.length === 0) return;
    
    // Calculate average mood
    const totalScore = filteredData.reduce((sum, entry) => sum + entry.score, 0);
    const avgMood = parseFloat((totalScore / filteredData.length).toFixed(1));
    
    // Determine trend
    const sortedByDate = [...filteredData].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    let trendType = 'stable';
    if (sortedByDate.length >= 5) {
      const firstHalf = sortedByDate.slice(0, Math.floor(sortedByDate.length / 2));
      const secondHalf = sortedByDate.slice(Math.floor(sortedByDate.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + entry.score, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + entry.score, 0) / secondHalf.length;
      
      if (secondHalfAvg - firstHalfAvg > 0.5) {
        trendType = 'improving';
      } else if (firstHalfAvg - secondHalfAvg > 0.5) {
        trendType = 'declining';
      }
    }
    
    // Find highest and lowest days
    let highestScore = -1;
    let highestDay = null;
    let lowestScore = 11;
    let lowestDay = null;
    
    filteredData.forEach(entry => {
      if (entry.score > highestScore) {
        highestScore = entry.score;
        highestDay = entry.timestamp;
      }
      if (entry.score < lowestScore) {
        lowestScore = entry.score;
        lowestDay = entry.timestamp;
      }
    });
    
    // Find best day of week
    const weekdayData = generateWeekdayAverages(filteredData);
    const bestDayOfWeek = weekdayData.reduce((best, current) => 
      (current.score > best.score && current.entries > 0) ? current : best, 
      { name: 'None', score: 0 }
    );
    
    // Find best time of day
    const timeData = generateTimeOfDayAverages(filteredData);
    const bestTimeOfDay = timeData.reduce((best, current) => 
      (current.score > best.score && current.entries > 0) ? current : best, 
      { name: 'None', score: 0 }
    );
    
    // Calculate mood variability (standard deviation)
    const mean = avgMood;
    const squaredDiffs = filteredData.map(entry => Math.pow(entry.score - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
    const moodVariability = parseFloat(Math.sqrt(avgSquaredDiff).toFixed(1));
    
    setInsights({
      averageMood: avgMood,
      moodTrend: trendType,
      highestDay: highestDay ? formatDate(highestDay) : null,
      lowestDay: lowestDay ? formatDate(lowestDay) : null,
      bestTimeOfDay: bestTimeOfDay.name !== 'None' ? bestTimeOfDay.name : null,
      bestDayOfWeek: bestDayOfWeek.name !== 'None' ? bestDayOfWeek.name : null,
      moodVariability
    });
  };
  
  // Handle change in mood score
  const handleMoodScoreChange = (e) => {
    setNewMood({
      ...newMood,
      score: parseFloat(e.target.value)
    });
  };
  
  // Handle change in notes
  const handleNotesChange = (e) => {
    setNewMood({
      ...newMood,
      notes: e.target.value
    });
  };
  
  // Toggle a trigger
  const toggleTrigger = (triggerId) => {
    if (newMood.triggers.includes(triggerId)) {
      setNewMood({
        ...newMood,
        triggers: newMood.triggers.filter(id => id !== triggerId)
      });
    } else {
      setNewMood({
        ...newMood,
        triggers: [...newMood.triggers, triggerId]
      });
    }
  };
  
  // Toggle an activity
  const toggleActivity = (activityId) => {
    if (newMood.activities.includes(activityId)) {
      setNewMood({
        ...newMood,
        activities: newMood.activities.filter(id => id !== activityId)
      });
    } else {
      setNewMood({
        ...newMood,
        activities: [...newMood.activities, activityId]
      });
    }
  };
  
  // Submit new mood entry
  const handleSubmitMood = async () => {
    try {
      // Add timestamp to the mood entry
      const moodEntry = {
        ...newMood,
        timestamp: new Date().toISOString()
      };
      
      // Call addMoodEntry from UserDataContext
      await addMoodEntry(moodEntry.score);
      
      // Reset form
      setNewMood({
        score: 5,
        notes: '',
        triggers: [],
        activities: []
      });
      
      // Update last activity in Firestore
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          lastActive: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error submitting mood entry:', error);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (type, value) => {
    setFilters({
      ...filters,
      [type]: value
    });
  };
  
  // Get trend display information
  const getTrendDisplay = (trend) => {
    if (trend === 'improving') {
      return {
        icon: '↗️',
        color: 'text-green-500',
        text: 'Improving'
      };
    } else if (trend === 'declining') {
      return {
        icon: '↘️',
        color: 'text-red-500',
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
  
  // Custom tooltip for the timeline chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 ${theme.card} border ${theme.border} rounded`}>
          <p className={`font-bold ${theme.textBold}`}>{payload[0].payload.displayDate}</p>
          <p className={theme.text}>
            <span className="font-medium">Mood:</span> {payload[0].value}/10
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className={`${theme.card} rounded-xl p-6`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h1 className={`text-2xl font-bold ${theme.textBold}`}>Mood Tracker</h1>
          
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className={`px-3 py-1 rounded ${theme.background} ${theme.text} border ${theme.border}`}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
            
            <select
              value={filters.groupBy}
              onChange={(e) => handleFilterChange('groupBy', e.target.value)}
              className={`px-3 py-1 rounded ${theme.background} ${theme.text} border ${theme.border}`}
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
        </div>
        
        {/* Mood insights summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${theme.background} ${theme.border} border`}>
            <div className="flex justify-between items-center">
              <span className={`font-medium ${theme.text}`}>Average Mood</span>
              <span className="text-2xl">{getMoodEmoji(insights.averageMood)}</span>
            </div>
            <div className={`text-3xl font-bold mt-1 ${theme.accent}`}>
              {insights.averageMood}/10
            </div>
            <div className="flex items-center mt-2">
              <span className={getTrendDisplay(insights.moodTrend).color}>
                {getTrendDisplay(insights.moodTrend).icon}
              </span>
              <span className={`ml-1 text-sm ${theme.text}`}>
                {getTrendDisplay(insights.moodTrend).text} trend
              </span>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${theme.background} ${theme.border} border`}>
            <div className={`font-medium ${theme.text} mb-2`}>
              Mood Patterns
            </div>
            <div className={`${theme.text} text-sm`}>
              <div className="flex justify-between mb-1">
                <span>Best day:</span>
                <span className="font-medium">{insights.bestDayOfWeek || 'Insufficient data'}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Best time:</span>
                <span className="font-medium">{insights.bestTimeOfDay || 'Insufficient data'}</span>
              </div>
              <div className="flex justify-between">
                <span>Variability:</span>
                <span className="font-medium">{insights.moodVariability} points</span>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${theme.background} ${theme.border} border`}>
            <div className={`font-medium ${theme.text} mb-2`}>
              Mood Extremes
            </div>
            <div className={`${theme.text} text-sm`}>
              <div className="flex justify-between mb-1">
                <span>Highest mood:</span>
                <span className="font-medium">{insights.highestDay || 'Insufficient data'}</span>
              </div>
              <div className="flex justify-between">
                <span>Lowest mood:</span>
                <span className="font-medium">{insights.lowestDay || 'Insufficient data'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mood timeline chart */}
      <div className={`${theme.card} rounded-xl p-6`}>
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Mood Timeline</h2>
        
        {visualizationData.timeline.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={visualizationData.timeline}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                  tickLine={{ stroke: isDark ? '#e5e7eb' : '#374151' }}
                />
                <YAxis 
                  domain={[0, 10]} 
                  tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                  tickLine={{ stroke: isDark ? '#e5e7eb' : '#374151' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke={isDark ? '#FFD700' : '#4F46E5'} 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={`text-center py-8 ${theme.text}`}>
            No mood data available for the selected time period
          </div>
        )}
      </div>
      
      {/* Mood distribution and patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mood distribution */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Mood Distribution</h2>
          
          {visualizationData.distribution.length > 0 && visualizationData.distribution.some(item => item.count > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={visualizationData.distribution}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                    tickLine={{ stroke: isDark ? '#e5e7eb' : '#374151' }}
                  />
                  <YAxis 
                    tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                    tickLine={{ stroke: isDark ? '#e5e7eb' : '#374151' }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill={isDark ? '#FFD700' : '#4F46E5'}>
                    {visualizationData.distribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          index === 0 ? '#F44336' : // Very Low
                          index === 1 ? '#FF9800' : // Low
                          index === 2 ? '#FFC107' : // Neutral
                          index === 3 ? '#8BC34A' : // Good
                          '#4CAF50'                 // Excellent
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`text-center py-8 ${theme.text}`}>
              No mood data available for the selected time period
            </div>
          )}
        </div>
        
        {/* Weekday patterns */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Weekday Patterns</h2>
          
          {visualizationData.weekdayAverages.length > 0 && visualizationData.weekdayAverages.some(item => item.entries > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={visualizationData.weekdayAverages}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                    tickLine={{ stroke: isDark ? '#e5e7eb' : '#374151' }}
                  />
                  <YAxis 
                    domain={[0, 10]}
                    tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                    tickLine={{ stroke: isDark ? '#e5e7eb' : '#374151' }}
                  />
                  <Tooltip />
                  <Bar dataKey="score" fill={isDark ? '#FFD700' : '#4F46E5'}>
                    {visualizationData.weekdayAverages.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getMoodColor(entry.score)} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`text-center py-8 ${theme.text}`}>
              No mood data available for the selected time period
            </div>
          )}
        </div>
      </div>
      
      {/* New mood entry form */}
      <div className={`${theme.card} rounded-xl p-6`}>
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Log Your Mood</h2>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="moodScore" className={`block font-medium ${theme.text}`}>
              How are you feeling right now? (1-10)
            </label>
            <span className="text-2xl">{getMoodEmoji(newMood.score)}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <input
              type="range"
              id="moodScore"
              min="1"
              max="10"
              step="1"
              value={newMood.score}
              onChange={handleMoodScoreChange}
              className="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-700"
            />
            <span className={`${theme.text} font-bold text-xl min-w-[2rem] text-center`}>
              {newMood.score}
            </span>
          </div>
          
          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Very Bad</span>
            <span>Neutral</span>
            <span>Excellent</span>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="moodNotes" className={`block font-medium ${theme.text} mb-2`}>
            Notes (optional)
          </label>
          <textarea
            id="moodNotes"
            value={newMood.notes}
            onChange={handleNotesChange}
            placeholder="What's on your mind today?"
            rows="3"
            className={`w-full p-3 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label className={`block font-medium ${theme.text} mb-2`}>
            What's affecting your mood? (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {triggerOptions.map(trigger => (
              <button
                key={trigger.id}
                onClick={() => toggleTrigger(trigger.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  newMood.triggers.includes(trigger.id)
                    ? 'bg-indigo-500 text-white'
                    : `${theme.background} ${theme.text} border ${theme.border}`
                }`}
              >
                {trigger.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label className={`block font-medium ${theme.text} mb-2`}>
            Activities today (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {activityOptions.map(activity => (
              <button
                key={activity.id}
                onClick={() => toggleActivity(activity.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  newMood.activities.includes(activity.id)
                    ? 'bg-green-500 text-white'
                    : `${theme.background} ${theme.text} border ${theme.border}`
                }`}
              >
                {activity.label}
              </button>
            ))}
          </div>
        </div>
        
        <button
          onClick={handleSubmitMood}
          className={`w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        >
          Save Mood Entry
        </button>
      </div>
      
      {/* Recent entries */}
      <div className={`${theme.card} rounded-xl p-6`}>
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Recent Entries</h2>
        
        {moodData && moodData.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {[...moodData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 10)
              .map((entry, index) => (
                <div key={index} className={`p-4 rounded-lg ${theme.background} ${theme.border} border`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {getMoodEmoji(entry.score)}
                      </span>
                      <div>
                        <div className={`font-medium ${theme.textBold}`}>
                          Mood: {entry.score}/10
                        </div>
                        <div className={`text-sm ${theme.text}`}>
                          {formatDate(entry.timestamp)} at {formatTime(entry.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {entry.notes && (
                    <div className={`mt-2 ${theme.text}`}>
                      {entry.notes}
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${theme.text}`}>
            No mood entries yet. Start logging your mood to see your history.
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;