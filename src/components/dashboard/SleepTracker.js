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
  Area,
  AreaChart,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const SleepTracker = () => {
  const { currentUser } = useAuth();
  const { sleepData, addSleepEntry, loading } = useUserData();
  const { theme, isDark } = useTheme();
  
  // State for new sleep entry
  const [newSleepEntry, setNewSleepEntry] = useState({
    hours: 7,
    quality: 3, // 1-5 scale
    bedtime: '22:30',
    wakeTime: '06:30',
    factors: [],
    notes: ''
  });
  
  // State for visualizations
  const [visualizationData, setVisualizationData] = useState({
    timeline: [],
    weekdayAverages: [],
    qualityDistribution: [],
    durationDistribution: []
  });
  
  // State for filters
  const [filters, setFilters] = useState({
    dateRange: '30d', // Options: '7d', '30d', '90d', '1y', 'all'
    groupBy: 'day' // Options: 'day', 'week', 'month'
  });
  
  // State for insights
  const [insights, setInsights] = useState({
    averageSleep: 0,
    sleepTrend: 'stable',
    qualityAverage: 0,
    bestDay: null,
    worstDay: null,
    sleepDebt: 0,
    recommendedBedtime: ''
  });
  
  // Sleep factor options
  const factorOptions = [
    { id: 'stress', label: 'Stress' },
    { id: 'exercise', label: 'Exercise' },
    { id: 'caffeine', label: 'Caffeine' },
    { id: 'alcohol', label: 'Alcohol' },
    { id: 'screenTime', label: 'Screen Time' },
    { id: 'lateFood', label: 'Late Meal' },
    { id: 'noise', label: 'Noise' },
    { id: 'temperature', label: 'Temperature' }
  ];
  
  // Process sleep data when it changes or filters change
  useEffect(() => {
    if (loading || !sleepData || sleepData.length === 0) return;
    
    // Process data for visualizations based on filters
    processDataForVisualizations();
    
    // Generate insights from the data
    generateInsights();
  }, [sleepData, filters, loading]);
  
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
  
  // Get sleep quality emoji
  const getSleepQualityEmoji = (quality) => {
    switch(Math.round(quality)) {
      case 1: return '😫'; // Very poor
      case 2: return '😕'; // Poor
      case 3: return '😐'; // Fair
      case 4: return '🙂'; // Good
      case 5: return '😴'; // Excellent
      default: return '😐'; // Default
    }
  };
  
  // Get sleep quality description
  const getSleepQualityText = (quality) => {
    switch(Math.round(quality)) {
      case 1: return 'Very Poor';
      case 2: return 'Poor';
      case 3: return 'Fair';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return 'Unknown';
    }
  };
  
  // Get sleep duration quality
  const getSleepDurationQuality = (hours) => {
    if (hours < 5) return 'Too Little';
    if (hours < 6) return 'Poor';
    if (hours < 7) return 'Fair';
    if (hours <= 9) return 'Optimal';
    return 'Too Much';
  };
  
  // Get color based on sleep hours
  const getSleepDurationColor = (hours) => {
    if (hours < 5) return '#F44336'; // Red
    if (hours < 6) return '#FF9800'; // Orange
    if (hours < 7) return '#FFC107'; // Yellow
    if (hours <= 9) return '#4CAF50'; // Green
    return '#FF9800'; // Orange for too much
  };
  
  // Process data for visualizations based on filters
  const processDataForVisualizations = () => {
    if (!sleepData || sleepData.length === 0) return;
    
    // Filter data based on date range
    const filteredData = filterDataByDateRange(sleepData, filters.dateRange);
    
    // Generate timeline data
    const timelineData = generateTimelineData(filteredData, filters.groupBy);
    
    // Generate weekday averages
    const weekdayAverages = generateWeekdayAverages(filteredData);
    
    // Generate quality distribution
    const qualityDistribution = generateQualityDistribution(filteredData);
    
    // Generate duration distribution
    const durationDistribution = generateDurationDistribution(filteredData);
    
    // Update state with new visualization data
    setVisualizationData({
      timeline: timelineData,
      weekdayAverages: weekdayAverages,
      qualityDistribution: qualityDistribution,
      durationDistribution: durationDistribution
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
          totalHours: 0,
          totalQuality: 0,
          count: 0
        };
      }
      
      groupedData[groupKey].totalHours += entry.hours;
      // If entry has quality, add it - otherwise assume average quality (3)
      groupedData[groupKey].totalQuality += entry.quality || 3;
      groupedData[groupKey].count += 1;
    });
    
    // Calculate averages for each group
    const result = Object.values(groupedData).map(group => ({
      date: group.date,
      displayDate: group.displayDate,
      hours: parseFloat((group.totalHours / group.count).toFixed(1)),
      quality: parseFloat((group.totalQuality / group.count).toFixed(1))
    }));
    
    // Sort by date
    return result.sort((a, b) => a.date.localeCompare(b.date));
  };
  
  // Generate weekday averages
  const generateWeekdayAverages = (data) => {
    if (!data || data.length === 0) return [];
    
    const weekdays = [
      { day: 0, name: 'Sunday', totalHours: 0, count: 0 },
      { day: 1, name: 'Monday', totalHours: 0, count: 0 },
      { day: 2, name: 'Tuesday', totalHours: 0, count: 0 },
      { day: 3, name: 'Wednesday', totalHours: 0, count: 0 },
      { day: 4, name: 'Thursday', totalHours: 0, count: 0 },
      { day: 5, name: 'Friday', totalHours: 0, count: 0 },
      { day: 6, name: 'Saturday', totalHours: 0, count: 0 }
    ];
    
    data.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dayOfWeek = date.getDay();
      
      weekdays[dayOfWeek].totalHours += entry.hours;
      weekdays[dayOfWeek].count += 1;
    });
    
    return weekdays.map(day => ({
      name: day.name,
      hours: day.count > 0 ? parseFloat((day.totalHours / day.count).toFixed(1)) : 0,
      entries: day.count
    }));
  };
  
  // Generate quality distribution
  const generateQualityDistribution = (data) => {
    if (!data || data.length === 0) return [];
    
    const distribution = [
      { quality: 1, label: 'Very Poor', count: 0 },
      { quality: 2, label: 'Poor', count: 0 },
      { quality: 3, label: 'Fair', count: 0 },
      { quality: 4, label: 'Good', count: 0 },
      { quality: 5, label: 'Excellent', count: 0 }
    ];
    
    data.forEach(entry => {
      // If entry has quality, use it - otherwise assume average quality (3)
      const quality = entry.quality || 3;
      const roundedQuality = Math.min(Math.max(Math.round(quality), 1), 5);
      distribution[roundedQuality - 1].count += 1;
    });
    
    return distribution;
  };
  
  // Generate duration distribution
  const generateDurationDistribution = (data) => {
    if (!data || data.length === 0) return [];
    
    const distribution = [
      { range: '<5', label: 'Less than 5 hrs', count: 0 },
      { range: '5-6', label: '5-6 hrs', count: 0 },
      { range: '6-7', label: '6-7 hrs', count: 0 },
      { range: '7-8', label: '7-8 hrs', count: 0 },
      { range: '8-9', label: '8-9 hrs', count: 0 },
      { range: '>9', label: 'More than 9 hrs', count: 0 }
    ];
    
    data.forEach(entry => {
      if (entry.hours < 5) {
        distribution[0].count += 1;
      } else if (entry.hours < 6) {
        distribution[1].count += 1;
      } else if (entry.hours < 7) {
        distribution[2].count += 1;
      } else if (entry.hours < 8) {
        distribution[3].count += 1;
      } else if (entry.hours < 9) {
        distribution[4].count += 1;
      } else {
        distribution[5].count += 1;
      }
    });
    
    return distribution;
  };
  
  // Generate insights from the sleep data
  const generateInsights = () => {
    if (!sleepData || sleepData.length === 0) return;
    
    // Filter data based on date range
    const filteredData = filterDataByDateRange(sleepData, filters.dateRange);
    
    if (filteredData.length === 0) return;
    
    // Calculate average sleep
    const totalHours = filteredData.reduce((sum, entry) => sum + entry.hours, 0);
    const avgSleep = parseFloat((totalHours / filteredData.length).toFixed(1));
    
    // Calculate average quality if available
    let qualityAvg = 3; // Default to middle value
    if (filteredData.some(entry => 'quality' in entry)) {
      const totalQuality = filteredData.reduce((sum, entry) => sum + (entry.quality || 3), 0);
      qualityAvg = parseFloat((totalQuality / filteredData.length).toFixed(1));
    }
    
    // Determine trend
    const sortedByDate = [...filteredData].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    let trendType = 'stable';
    if (sortedByDate.length >= 5) {
      const firstHalf = sortedByDate.slice(0, Math.floor(sortedByDate.length / 2));
      const secondHalf = sortedByDate.slice(Math.floor(sortedByDate.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + entry.hours, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + entry.hours, 0) / secondHalf.length;
      
      if (secondHalfAvg - firstHalfAvg > 0.5) {
        trendType = 'improving';
      } else if (firstHalfAvg - secondHalfAvg > 0.5) {
        trendType = 'declining';
      }
    }
    
    // Find best and worst days
    const weekdayData = generateWeekdayAverages(filteredData);
    
    const bestDayObj = weekdayData.reduce((best, current) => 
      (current.hours > best.hours && current.entries > 0) ? current : best, 
      { name: 'None', hours: 0 }
    );
    
    const worstDayObj = weekdayData.reduce((worst, current) => 
      (current.hours < worst.hours && current.entries > 0 && current.hours > 0) ? current : worst, 
      { name: 'None', hours: 24 }
    );
    
    // Calculate sleep debt (assuming 8 hours is optimal)
    const optimalSleep = 8; // hours
    const lastWeekData = filterDataByDateRange(sleepData, '7d');
    let sleepDebt = 0;
    
    if (lastWeekData.length > 0) {
      const totalHoursLastWeek = lastWeekData.reduce((sum, entry) => sum + entry.hours, 0);
      const avgSleepLastWeek = totalHoursLastWeek / lastWeekData.length;
      sleepDebt = parseFloat((optimalSleep - avgSleepLastWeek) * lastWeekData.length).toFixed(1);
    }
    
    // Recommend a bedtime based on average wake time
    let recommendedBedtime = '22:00';
    
    if (lastWeekData.length > 0 && lastWeekData.some(entry => entry.wakeTime)) {
      // Get average wake time if available
      const wakeTimeEntries = lastWeekData.filter(entry => entry.wakeTime);
      if (wakeTimeEntries.length > 0) {
        const avgWakeTimeMinutes = wakeTimeEntries.reduce((sum, entry) => {
          const [hours, minutes] = entry.wakeTime.split(':').map(Number);
          return sum + (hours * 60 + minutes);
        }, 0) / wakeTimeEntries.length;
        
        // Convert back to hours:minutes
        const avgWakeTimeHours = Math.floor(avgWakeTimeMinutes / 60);
        const avgWakeTimeRemainder = Math.round(avgWakeTimeMinutes % 60);
        
        // Calculate recommended bedtime (wake time - 8 hours)
        const bedtimeMinutes = (avgWakeTimeHours * 60 + avgWakeTimeRemainder) - (optimalSleep * 60);
        const bedtimeHours = Math.floor(bedtimeMinutes / 60);
        const bedtimeRemainder = Math.round(bedtimeMinutes % 60);
        
        // Format with leading zeros
        const formattedHours = String(((bedtimeHours % 24) + 24) % 24).padStart(2, '0');
        const formattedMinutes = String(bedtimeRemainder).padStart(2, '0');
        
        recommendedBedtime = `${formattedHours}:${formattedMinutes}`;
      }
    }
    
    setInsights({
      averageSleep: avgSleep,
      sleepTrend: trendType,
      qualityAverage: qualityAvg,
      bestDay: bestDayObj.name !== 'None' ? bestDayObj.name : null,
      worstDay: worstDayObj.name !== 'None' ? worstDayObj.name : null,
      sleepDebt: sleepDebt > 0 ? sleepDebt : 0,
      recommendedBedtime
    });
  };
  
  // Handle input change for sleep hours
  const handleHoursChange = (e) => {
    setNewSleepEntry({
      ...newSleepEntry,
      hours: parseFloat(e.target.value)
    });
  };
  
  // Handle input change for sleep quality
  const handleQualityChange = (e) => {
    setNewSleepEntry({
      ...newSleepEntry,
      quality: parseInt(e.target.value)
    });
  };
  
  // Handle input change for bedtime
  const handleBedtimeChange = (e) => {
    setNewSleepEntry({
      ...newSleepEntry,
      bedtime: e.target.value
    });
  };
  
  // Handle input change for wake time
  const handleWakeTimeChange = (e) => {
    setNewSleepEntry({
      ...newSleepEntry,
      wakeTime: e.target.value
    });
  };
  
  // Handle notes change
  const handleNotesChange = (e) => {
    setNewSleepEntry({
      ...newSleepEntry,
      notes: e.target.value
    });
  };
  
  // Toggle a sleep factor
  const toggleFactor = (factorId) => {
    if (newSleepEntry.factors.includes(factorId)) {
      setNewSleepEntry({
        ...newSleepEntry,
        factors: newSleepEntry.factors.filter(id => id !== factorId)
      });
    } else {
      setNewSleepEntry({
        ...newSleepEntry,
        factors: [...newSleepEntry.factors, factorId]
      });
    }
  };
  
  // Calculate hours between bedtime and wake time
  const calculateHours = () => {
    if (!newSleepEntry.bedtime || !newSleepEntry.wakeTime) return newSleepEntry.hours;
    
    const [bedHours, bedMinutes] = newSleepEntry.bedtime.split(':').map(Number);
    const [wakeHours, wakeMinutes] = newSleepEntry.wakeTime.split(':').map(Number);
    
    let totalMinutes = (wakeHours * 60 + wakeMinutes) - (bedHours * 60 + bedMinutes);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Add 24 hours if wake time is the next day
    
    return parseFloat((totalMinutes / 60).toFixed(1));
  };
  
  // Update hours when bedtime or wake time changes
  useEffect(() => {
    const calculatedHours = calculateHours();
    if (calculatedHours !== newSleepEntry.hours) {
      setNewSleepEntry({
        ...newSleepEntry,
        hours: calculatedHours
      });
    }
  }, [newSleepEntry.bedtime, newSleepEntry.wakeTime]);
  
  // Submit new sleep entry
  const handleSubmitSleep = async () => {
    try {
      // Call addSleepEntry from UserDataContext
      await addSleepEntry(newSleepEntry.hours);
      
      // Reset form
      setNewSleepEntry({
        hours: 7,
        quality: 3,
        bedtime: '22:30',
        wakeTime: '06:30',
        factors: [],
        notes: ''
      });
      
      // Update last activity in Firestore
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          lastActive: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error submitting sleep entry:', error);
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
            <span className="font-medium">Sleep:</span> {payload[0].value} hours
          </p>
          {payload[1] && (
            <p className={theme.text}>
              <span className="font-medium">Quality:</span> {getSleepQualityText(payload[1].value)}
            </p>
          )}
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
          <h1 className={`text-2xl font-bold ${theme.textBold}`}>Sleep Tracker</h1>
          
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
        
        {/* Sleep insights summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${theme.background} ${theme.border} border`}>
            <div className="flex justify-between items-center">
              <span className={`font-medium ${theme.text}`}>Average Sleep</span>
              <span className="text-2xl">💤</span>
            </div>
            <div className={`text-3xl font-bold mt-1 ${theme.accent}`}>
              {insights.averageSleep} hrs
            </div>
            <div className="flex items-center mt-2">
              <span className={getTrendDisplay(insights.sleepTrend).color}>
                {getTrendDisplay(insights.sleepTrend).icon}
              </span>
              <span className={`ml-1 text-sm ${theme.text}`}>
                {getTrendDisplay(insights.sleepTrend).text} trend
              </span>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${theme.background} ${theme.border} border`}>
            <div className={`font-medium ${theme.text} mb-2`}>
              Sleep Patterns
            </div>
            <div className={`${theme.text} text-sm`}>
              <div className="flex justify-between mb-1">
                <span>Quality:</span>
                <span className="font-medium flex items-center">
                  {getSleepQualityText(insights.qualityAverage)}
                  <span className="ml-1">{getSleepQualityEmoji(insights.qualityAverage)}</span>
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Best night:</span>
                <span className="font-medium">{insights.bestDay || 'Insufficient data'}</span>
              </div>
              <div className="flex justify-between">
                <span>Worst night:</span>
                <span className="font-medium">{insights.worstDay || 'Insufficient data'}</span>
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${theme.background} ${theme.border} border`}>
            <div className={`font-medium ${theme.text} mb-2`}>
              Sleep Health
            </div>
            <div className={`${theme.text} text-sm`}>
              <div className="flex justify-between mb-1">
                <span>Sleep debt:</span>
                <span className="font-medium">
                  {insights.sleepDebt > 0 ? `${insights.sleepDebt} hours` : 'None'}
                </span>
              </div>
              <div className="flex justify-between mb-3">
                <span>Recommended bedtime:</span>
                <span className="font-medium">{insights.recommendedBedtime}</span>
              </div>
              <div className={`text-xs ${parseFloat(insights.sleepDebt) > 5 ? 'text-red-500' : theme.text}`}>
                {parseFloat(insights.sleepDebt) > 5 
                  ? 'Warning: Significant sleep debt detected!' 
                  : parseFloat(insights.sleepDebt) > 2
                    ? 'Tip: Try to get more sleep this week.'
                    : 'Your sleep schedule looks healthy.'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sleep timeline chart */}
      <div className={`${theme.card} rounded-xl p-6`}>
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Sleep Duration</h2>
        
        {visualizationData.timeline.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={visualizationData.timeline}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                />
                <YAxis 
                  domain={[0, 12]} 
                  tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  name="Sleep Duration" 
                  stroke={isDark ? '#60A5FA' : '#3B82F6'} 
                  fill={isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.2)'} 
                />
                {visualizationData.timeline.some(item => 'quality' in item) && (
                  <Line 
                    type="monotone" 
                    dataKey="quality" 
                    name="Sleep Quality" 
                    stroke={isDark ? '#F59E0B' : '#D97706'} 
                    strokeWidth={2}
                    dot={true}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={`text-center py-8 ${theme.text}`}>
            No sleep data available for the selected time period
          </div>
        )}
      </div>
      
      {/* Sleep patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekday averages */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Sleep by Day of Week</h2>
          
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
                  />
                  <YAxis 
                    domain={[0, 12]}
                    tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                  />
                  <Tooltip />
                  <Bar dataKey="hours" fill={isDark ? '#60A5FA' : '#3B82F6'}>
                    {visualizationData.weekdayAverages.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getSleepDurationColor(entry.hours)} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`text-center py-8 ${theme.text}`}>
              No sleep data available for the selected time period
            </div>
          )}
        </div>
        
        {/* Duration distribution */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Sleep Duration Distribution</h2>
          
          {visualizationData.durationDistribution.length > 0 && visualizationData.durationDistribution.some(item => item.count > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={visualizationData.durationDistribution}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                  />
                  <YAxis 
                    tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill={isDark ? '#60A5FA' : '#3B82F6'}>
                    {visualizationData.durationDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          index === 0 ? '#F44336' : // Less than 5 hrs
                          index === 1 ? '#FF9800' : // 5-6 hrs
                          index === 2 ? '#FFC107' : // 6-7 hrs
                          index === 3 ? '#4CAF50' : // 7-8 hrs
                          index === 4 ? '#8BC34A' : // 8-9 hrs
                          '#FF9800'                  // More than 9 hrs
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`text-center py-8 ${theme.text}`}>
              No sleep data available for the selected time period
            </div>
          )}
        </div>
      </div>
      
      {/* Sleep entry form */}
      <div className={`${theme.card} rounded-xl p-6`}>
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Log Your Sleep</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-6">
              <label htmlFor="sleepHours" className={`block font-medium ${theme.text} mb-2`}>
                Hours of Sleep
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id="sleepHours"
                  min="0"
                  max="12"
                  step="0.5"
                  value={newSleepEntry.hours}
                  onChange={handleHoursChange}
                  className="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-700"
                />
                <span className={`${theme.text} font-bold text-xl min-w-[2.5rem] text-center`}>
                  {newSleepEntry.hours}
                </span>
              </div>
              <div className={`text-sm ${theme.text} mt-1`}>
                Quality: {getSleepDurationQuality(newSleepEntry.hours)}
              </div>
            </div>
            
            <div className="mb-6">
              <label className={`block font-medium ${theme.text} mb-2`}>
                Sleep Time
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bedtime" className={`block text-sm ${theme.text} mb-1`}>
                    Bedtime
                  </label>
                  <input
                    type="time"
                    id="bedtime"
                    value={newSleepEntry.bedtime}
                    onChange={handleBedtimeChange}
                    className={`w-full p-2 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                <div>
                  <label htmlFor="wakeTime" className={`block text-sm ${theme.text} mb-1`}>
                    Wake Time
                  </label>
                  <input
                    type="time"
                    id="wakeTime"
                    value={newSleepEntry.wakeTime}
                    onChange={handleWakeTimeChange}
                    className={`w-full p-2 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="sleepQuality" className={`block font-medium ${theme.text} mb-2`}>
                Sleep Quality
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id="sleepQuality"
                  min="1"
                  max="5"
                  step="1"
                  value={newSleepEntry.quality}
                  onChange={handleQualityChange}
                  className="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-700"
                />
                <span className="text-xl">
                  {getSleepQualityEmoji(newSleepEntry.quality)}
                </span>
              </div>
              <div className={`text-sm ${theme.text} mt-1`}>
                {getSleepQualityText(newSleepEntry.quality)}
              </div>
            </div>
          </div>
          
          <div>
            <div className="mb-6">
              <label className={`block font-medium ${theme.text} mb-2`}>
                Factors Affecting Your Sleep
              </label>
              <div className="flex flex-wrap gap-2">
                {factorOptions.map(factor => (
                  <button
                    key={factor.id}
                    onClick={() => toggleFactor(factor.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      newSleepEntry.factors.includes(factor.id)
                        ? 'bg-indigo-500 text-white'
                        : `${theme.background} ${theme.text} border ${theme.border}`
                    }`}
                  >
                    {factor.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="sleepNotes" className={`block font-medium ${theme.text} mb-2`}>
                Notes (optional)
              </label>
              <textarea
                id="sleepNotes"
                value={newSleepEntry.notes}
                onChange={handleNotesChange}
                placeholder="Anything notable about your sleep?"
                rows="3"
                className={`w-full p-3 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              ></textarea>
            </div>
            
            <button
              onClick={handleSubmitSleep}
              className={`w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              Save Sleep Entry
            </button>
          </div>
        </div>
      </div>
      
      {/* Recent entries */}
      <div className={`${theme.card} rounded-xl p-6`}>
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Recent Sleep Entries</h2>
        
        {sleepData && sleepData.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {[...sleepData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 10)
              .map((entry, index) => (
                <div key={index} className={`p-4 rounded-lg ${theme.background} ${theme.border} border`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">💤</span>
                      <div>
                        <div className={`font-medium ${theme.textBold}`}>
                          {entry.hours} hours
                          {entry.quality && (
                            <span className="ml-2">
                              {getSleepQualityEmoji(entry.quality)}
                            </span>
                          )}
                        </div>
                        <div className={`text-sm ${theme.text}`}>
                          {formatDate(entry.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      entry.hours >= 7 && entry.hours <= 9
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : entry.hours >= 6
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {getSleepDurationQuality(entry.hours)}
                    </div>
                  </div>
                  
                  {entry.bedtime && entry.wakeTime && (
                    <div className={`mt-2 text-sm ${theme.text}`}>
                      {entry.bedtime} - {entry.wakeTime}
                    </div>
                  )}
                  
                  {entry.notes && (
                    <div className={`mt-2 ${theme.text}`}>
                      {entry.notes}
                    </div>
                  )}
                  
                  {entry.factors && entry.factors.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.factors.map(factor => {
                        const factorObj = factorOptions.find(f => f.id === factor);
                        return factorObj ? (
                          <span 
                            key={factor} 
                            className={`px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200`}
                          >
                            {factorObj.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${theme.text}`}>
            No sleep entries yet. Start logging your sleep to see your history.
          </div>
        )}
      </div>
    </div>
  );
};

export default SleepTracker;