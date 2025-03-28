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
  Cell,
  AreaChart,
  Area
} from 'recharts';

const StressTracker = () => {
  const { currentUser } = useAuth();
  const { stressData, addStressEntry, loading } = useUserData();
  const { theme, isDark } = useTheme();
  
  // State for new stress entry
  const [newStressEntry, setNewStressEntry] = useState({
    level: 5, // 1-10 scale
    sources: [],
    symptoms: [],
    notes: ''
  });
  
  // State for visualizations
  const [visualizationData, setVisualizationData] = useState({
    timeline: [],
    sourcesImpact: [],
    symptomsFrequency: [],
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
    averageStress: 0,
    stressTrend: 'stable',
    topSources: [],
    commonSymptoms: [],
    highestDay: null,
    lowestDay: null
  });
  
  // Stress source options
  const sourceOptions = [
    { id: 'work', label: 'Work' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'health', label: 'Health' },
    { id: 'finances', label: 'Finances' },
    { id: 'family', label: 'Family' },
    { id: 'environment', label: 'Environment' },
    { id: 'future', label: 'Future Concerns' },
    { id: 'social', label: 'Social Pressure' }
  ];
  
  // Stress symptom options
  const symptomOptions = [
    { id: 'tension', label: 'Muscle Tension' },
    { id: 'headache', label: 'Headaches' },
    { id: 'fatigue', label: 'Fatigue' },
    { id: 'digestive', label: 'Digestive Issues' },
    { id: 'sleep', label: 'Sleep Problems' },
    { id: 'focus', label: 'Poor Concentration' },
    { id: 'mood', label: 'Mood Changes' },
    { id: 'heart', label: 'Racing Heart' }
  ];
  
  // Process stress data when it changes or filters change
  useEffect(() => {
    if (loading || !stressData || stressData.length === 0) return;
    
    // Process data for visualizations based on filters
    processDataForVisualizations();
    
    // Generate insights from the data
    generateInsights();
  }, [stressData, filters, loading]);
  
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
  
  // Get stress level emoji
  const getStressEmoji = (level) => {
    if (level <= 2) return '😌'; // Very calm
    if (level <= 4) return '🙂'; // Calm
    if (level <= 6) return '😐'; // Neutral
    if (level <= 8) return '😟'; // Stressed
    return '😫'; // Very stressed
  };
  
  // Get stress level text
  const getStressLevelText = (level) => {
    if (level <= 2) return 'Very Calm';
    if (level <= 4) return 'Calm';
    if (level <= 6) return 'Moderate';
    if (level <= 8) return 'Stressed';
    return 'Very Stressed';
  };
  
  // Get color based on stress level
  const getStressLevelColor = (level) => {
    if (level <= 2) return '#4CAF50'; // Green
    if (level <= 4) return '#8BC34A'; // Light Green
    if (level <= 6) return '#FFC107'; // Yellow
    if (level <= 8) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };
  
  // Process data for visualizations based on filters
  const processDataForVisualizations = () => {
    if (!stressData || stressData.length === 0) return;
    
    // Filter data based on date range
    const filteredData = filterDataByDateRange(stressData, filters.dateRange);
    
    // Generate timeline data
    const timelineData = generateTimelineData(filteredData, filters.groupBy);
    
    // Generate sources impact data
    const sourcesImpact = generateSourcesImpact(filteredData);
    
    // Generate symptoms frequency data
    const symptomsFrequency = generateSymptomsFrequency(filteredData);
    
    // Generate weekday averages
    const weekdayAverages = generateWeekdayAverages(filteredData);
    
    // Generate time of day averages
    const timeOfDayAverages = generateTimeOfDayAverages(filteredData);
    
    // Update state with new visualization data
    setVisualizationData({
      timeline: timelineData,
      sourcesImpact,
      symptomsFrequency,
      weekdayAverages,
      timeOfDayAverages
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
          totalLevel: 0,
          count: 0
        };
      }
      
      groupedData[groupKey].totalLevel += entry.level;
      groupedData[groupKey].count += 1;
    });
    
    // Calculate averages for each group
    const result = Object.values(groupedData).map(group => ({
      date: group.date,
      displayDate: group.displayDate,
      level: parseFloat((group.totalLevel / group.count).toFixed(1))
    }));
    
    // Sort by date
    return result.sort((a, b) => a.date.localeCompare(b.date));
  };
  
  // Generate sources impact data
  const generateSourcesImpact = (data) => {
    if (!data || data.length === 0) return [];
    
    const sourcesCount = {};
    
    // Count occurrences of each source
    data.forEach(entry => {
      if (entry.sources && entry.sources.length > 0) {
        entry.sources.forEach(source => {
          if (!sourcesCount[source]) {
            sourcesCount[source] = 0;
          }
          sourcesCount[source] += 1;
        });
      }
    });
    
    // Convert to array for visualization
    return Object.entries(sourcesCount).map(([sourceId, count]) => {
      const source = sourceOptions.find(s => s.id === sourceId);
      return {
        id: sourceId,
        name: source ? source.label : sourceId,
        count
      };
    }).sort((a, b) => b.count - a.count);
  };
  
  // Generate symptoms frequency data
  const generateSymptomsFrequency = (data) => {
    if (!data || data.length === 0) return [];
    
    const symptomsCount = {};
    
    // Count occurrences of each symptom
    data.forEach(entry => {
      if (entry.symptoms && entry.symptoms.length > 0) {
        entry.symptoms.forEach(symptom => {
          if (!symptomsCount[symptom]) {
            symptomsCount[symptom] = 0;
          }
          symptomsCount[symptom] += 1;
        });
      }
    });
    
    // Convert to array for visualization
    return Object.entries(symptomsCount).map(([symptomId, count]) => {
      const symptom = symptomOptions.find(s => s.id === symptomId);
      return {
        id: symptomId,
        name: symptom ? symptom.label : symptomId,
        count
      };
    }).sort((a, b) => b.count - a.count);
  };
  
  // Generate weekday averages
  const generateWeekdayAverages = (data) => {
    if (!data || data.length === 0) return [];
    
    const weekdays = [
      { day: 0, name: 'Sunday', totalLevel: 0, count: 0 },
      { day: 1, name: 'Monday', totalLevel: 0, count: 0 },
      { day: 2, name: 'Tuesday', totalLevel: 0, count: 0 },
      { day: 3, name: 'Wednesday', totalLevel: 0, count: 0 },
      { day: 4, name: 'Thursday', totalLevel: 0, count: 0 },
      { day: 5, name: 'Friday', totalLevel: 0, count: 0 },
      { day: 6, name: 'Saturday', totalLevel: 0, count: 0 }
    ];
    
    data.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dayOfWeek = date.getDay();
      
      weekdays[dayOfWeek].totalLevel += entry.level;
      weekdays[dayOfWeek].count += 1;
    });
    
    return weekdays.map(day => ({
      name: day.name,
      level: day.count > 0 ? parseFloat((day.totalLevel / day.count).toFixed(1)) : 0,
      entries: day.count
    }));
  };
  
  // Generate time of day averages
  const generateTimeOfDayAverages = (data) => {
    if (!data || data.length === 0) return [];
    
    const timeSlots = [
      { slot: 'morning', label: 'Morning (5-11)', totalLevel: 0, count: 0 },
      { slot: 'afternoon', label: 'Afternoon (12-16)', totalLevel: 0, count: 0 },
      { slot: 'evening', label: 'Evening (17-21)', totalLevel: 0, count: 0 },
      { slot: 'night', label: 'Night (22-4)', totalLevel: 0, count: 0 }
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
      
      timeSlots[slotIndex].totalLevel += entry.level;
      timeSlots[slotIndex].count += 1;
    });
    
    return timeSlots.map(slot => ({
      name: slot.label,
      level: slot.count > 0 ? parseFloat((slot.totalLevel / slot.count).toFixed(1)) : 0,
      entries: slot.count
    }));
  };
  
  // Generate insights from the stress data
  const generateInsights = () => {
    if (!stressData || stressData.length === 0) return;
    
    // Filter data based on date range
    const filteredData = filterDataByDateRange(stressData, filters.dateRange);
    
    if (filteredData.length === 0) return;
    
    // Calculate average stress
    const totalLevel = filteredData.reduce((sum, entry) => sum + entry.level, 0);
    const avgStress = parseFloat((totalLevel / filteredData.length).toFixed(1));
    
    // Determine trend
    const sortedByDate = [...filteredData].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    let trendType = 'stable';
    if (sortedByDate.length >= 5) {
      const firstHalf = sortedByDate.slice(0, Math.floor(sortedByDate.length / 2));
      const secondHalf = sortedByDate.slice(Math.floor(sortedByDate.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + entry.level, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + entry.level, 0) / secondHalf.length;
      
      if (secondHalfAvg - firstHalfAvg > 0.5) {
        trendType = 'increasing';
      } else if (firstHalfAvg - secondHalfAvg > 0.5) {
        trendType = 'decreasing';
      }
    }
    
    // Find top sources
    const sourcesData = generateSourcesImpact(filteredData);
    const topSources = sourcesData.slice(0, 3);
    
    // Find common symptoms
    const symptomsData = generateSymptomsFrequency(filteredData);
    const commonSymptoms = symptomsData.slice(0, 3);
    
    // Find highest and lowest stress days
    const weekdayData = generateWeekdayAverages(filteredData);
    
    // Find the day with the highest average stress level (with at least one entry)
    const highestDayObj = weekdayData.reduce((highest, current) => 
      (current.level > highest.level && current.entries > 0) ? current : highest, 
      { name: null, level: 0 }
    );
    
    // Find the day with the lowest average stress level (with at least one entry)
    const lowestDayObj = weekdayData.reduce((lowest, current) => 
      (current.level < lowest.level && current.entries > 0 && current.level > 0) ? current : lowest, 
      { name: null, level: 11 }
    );
    
    setInsights({
      averageStress: avgStress,
      stressTrend: trendType,
      topSources,
      commonSymptoms,
      highestDay: highestDayObj.name,
      lowestDay: lowestDayObj.name
    });
  };
  
  // Handle change in stress level
  const handleLevelChange = (e) => {
    setNewStressEntry({
      ...newStressEntry,
      level: parseInt(e.target.value)
    });
  };
  
  // Handle notes change
  const handleNotesChange = (e) => {
    setNewStressEntry({
      ...newStressEntry,
      notes: e.target.value
    });
  };
  
  // Toggle a stress source
  const toggleSource = (sourceId) => {
    if (newStressEntry.sources.includes(sourceId)) {
      setNewStressEntry({
        ...newStressEntry,
        sources: newStressEntry.sources.filter(id => id !== sourceId)
      });
    } else {
      setNewStressEntry({
        ...newStressEntry,
        sources: [...newStressEntry.sources, sourceId]
      });
    }
  };
  
  // Toggle a stress symptom
  const toggleSymptom = (symptomId) => {
    if (newStressEntry.symptoms.includes(symptomId)) {
      setNewStressEntry({
        ...newStressEntry,
        symptoms: newStressEntry.symptoms.filter(id => id !== symptomId)
      });
    } else {
      setNewStressEntry({
        ...newStressEntry,
        symptoms: [...newStressEntry.symptoms, symptomId]
      });
    }
  };
  
  // Submit new stress entry
  const handleSubmitStress = async () => {
    try {
      // Call addStressEntry from UserDataContext
      await addStressEntry(newStressEntry.level);
      
      // Reset form
      setNewStressEntry({
        level: 5,
        sources: [],
        symptoms: [],
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
      console.error('Error submitting stress entry:', error);
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
    if (trend === 'increasing') {
      return {
        icon: '↗️',
        color: 'text-red-500',
        text: 'Increasing'
      };
    } else if (trend === 'decreasing') {
      return {
        icon: '↘️',
        color: 'text-green-500',
        text: 'Decreasing'
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
            <span className="font-medium">Stress Level:</span> {payload[0].value}/10
          </p>
          <p className={theme.text}>
            <span className="font-medium">Status:</span> {getStressLevelText(payload[0].value)}
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
          <h1 className={`text-2xl font-bold ${theme.textBold}`}>Stress Tracker</h1>
          
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
        
        {/* Stress insights summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${theme.background} ${theme.border} border`}>
            <div className="flex justify-between items-center">
              <span className={`font-medium ${theme.text}`}>Average Stress</span>
              <span className="text-2xl">{getStressEmoji(insights.averageStress)}</span>
            </div>
            <div className={`text-3xl font-bold mt-1 ${theme.accent}`}>
              {insights.averageStress}/10
            </div>
            <div className="flex items-center mt-2">
              <span className={getTrendDisplay(insights.stressTrend).color}>
                {getTrendDisplay(insights.stressTrend).icon}
              </span>
              <span className={`ml-1 text-sm ${theme.text}`}>
                {getTrendDisplay(insights.stressTrend).text} trend
              </span>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${theme.background} ${theme.border} border`}>
            <div className={`font-medium ${theme.text} mb-2`}>
              Top Stress Sources
            </div>
            <div className={`${theme.text} text-sm`}>
              {insights.topSources && insights.topSources.length > 0 ? (
                <div className="space-y-1">
                  {insights.topSources.map((source, index) => (
                    <div key={source.id} className="flex justify-between">
                      <span>{index + 1}. {source.name}</span>
                      <span>{Math.round((source.count / stressData.length) * 100)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-1">No data available</div>
              )}
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${theme.background} ${theme.border} border`}>
            <div className={`font-medium ${theme.text} mb-2`}>
              Stress Patterns
            </div>
            <div className={`${theme.text} text-sm`}>
              <div className="flex justify-between mb-1">
                <span>Highest stress day:</span>
                <span className="font-medium">{insights.highestDay || 'Insufficient data'}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Lowest stress day:</span>
                <span className="font-medium">{insights.lowestDay || 'Insufficient data'}</span>
              </div>
              <div className="mt-2 text-xs">
                {insights.stressTrend === 'decreasing' 
                  ? 'Great job! Your stress levels are trending down.' 
                  : insights.stressTrend === 'increasing'
                    ? 'Try some stress management techniques to reduce your stress.'
                    : 'Your stress levels have been consistent recently.'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stress timeline chart */}
      <div className={`${theme.card} rounded-xl p-6`}>
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Stress Levels Over Time</h2>
        
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
                  domain={[0, 10]} 
                  tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? "#ef4444" : "#ef4444"} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={isDark ? "#ef4444" : "#ef4444"} stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="level" 
                  stroke={isDark ? "#ef4444" : "#ef4444"} 
                  fillOpacity={1} 
                  fill="url(#stressGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={`text-center py-8 ${theme.text}`}>
            No stress data available for the selected time period
          </div>
        )}
      </div>
      
      {/* Stress patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekday stress patterns */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Stress by Day of Week</h2>
          
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
                    domain={[0, 10]}
                    tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                  />
                  <Tooltip />
                  <Bar dataKey="level" name="Stress Level">
                    {visualizationData.weekdayAverages.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getStressLevelColor(entry.level)} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`text-center py-8 ${theme.text}`}>
              No stress data available for the selected time period
            </div>
          )}
        </div>
        
        {/* Stress sources */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Top Stress Sources</h2>
          
          {visualizationData.sourcesImpact.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={visualizationData.sourcesImpact.slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    type="number"
                    tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category"
                    tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill={isDark ? "#f87171" : "#ef4444"} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`text-center py-8 ${theme.text}`}>
              No stress source data available
            </div>
          )}
        </div>
      </div>
      
      {/* Common symptoms and time of day */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Common symptoms */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Common Symptoms</h2>
          
          {visualizationData.symptomsFrequency.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={visualizationData.symptomsFrequency.slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    type="number"
                    tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category"
                    tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill={isDark ? "#a3e635" : "#84cc16"} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`text-center py-8 ${theme.text}`}>
              No symptom data available
            </div>
          )}
        </div>
        
        {/* Time of day analysis */}
        <div className={`${theme.card} rounded-xl p-6`}>
          <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Stress by Time of Day</h2>
          
          {visualizationData.timeOfDayAverages.length > 0 && visualizationData.timeOfDayAverages.some(item => item.entries > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={visualizationData.timeOfDayAverages}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                  />
                  <YAxis 
                    domain={[0, 10]}
                    tick={{ fill: isDark ? '#e5e7eb' : '#374151' }}
                  />
                  <Tooltip />
                  <Bar dataKey="level" name="Stress Level">
                    {visualizationData.timeOfDayAverages.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getStressLevelColor(entry.level)} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className={`text-center py-8 ${theme.text}`}>
              No time of day data available
            </div>
          )}
        </div>
      </div>
      
      {/* Stress entry form */}
      <div className={`${theme.card} rounded-xl p-6`}>
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Log Your Stress Level</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-6">
              <label htmlFor="stressLevel" className={`block font-medium ${theme.text} mb-2`}>
                Current Stress Level
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id="stressLevel"
                  min="1"
                  max="10"
                  step="1"
                  value={newStressEntry.level}
                  onChange={handleLevelChange}
                  className="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-700"
                />
                <span className={`${theme.text} font-bold text-xl min-w-[2.5rem] text-center`}>
                  {newStressEntry.level}
                </span>
                <span className="text-2xl">
                  {getStressEmoji(newStressEntry.level)}
                </span>
              </div>
              <div className={`text-sm ${theme.text} mt-1`}>
                {getStressLevelText(newStressEntry.level)}
              </div>
            </div>
            
            <div className="mb-6">
              <label className={`block font-medium ${theme.text} mb-2`}>
                Stress Sources
              </label>
              <div className="flex flex-wrap gap-2">
                {sourceOptions.map(source => (
                  <button
                    key={source.id}
                    onClick={() => toggleSource(source.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      newStressEntry.sources.includes(source.id)
                        ? 'bg-red-500 text-white'
                        : `${theme.background} ${theme.text} border ${theme.border}`
                    }`}
                  >
                    {source.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className="mb-6">
              <label className={`block font-medium ${theme.text} mb-2`}>
                Symptoms Experienced
              </label>
              <div className="flex flex-wrap gap-2">
                {symptomOptions.map(symptom => (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      newStressEntry.symptoms.includes(symptom.id)
                        ? 'bg-lime-500 text-white'
                        : `${theme.background} ${theme.text} border ${theme.border}`
                    }`}
                  >
                    {symptom.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="stressNotes" className={`block font-medium ${theme.text} mb-2`}>
                Notes (optional)
              </label>
              <textarea
                id="stressNotes"
                value={newStressEntry.notes}
                onChange={handleNotesChange}
                placeholder="Additional details about your stress..."
                rows="3"
                className={`w-full p-3 rounded-lg ${theme.background} ${theme.text} border ${theme.border} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              ></textarea>
            </div>
            
            <button
              onClick={handleSubmitStress}
              className={`w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              Save Stress Entry
            </button>
          </div>
        </div>
      </div>
      
      {/* Stress management tips */}
      <div className={`${theme.card} rounded-xl p-6`}>
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Stress Management Tips</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${theme.background} ${theme.border} border`}>
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🧘</span>
              <h3 className={`font-medium ${theme.textBold}`}>Mindfulness & Breathing</h3>
            </div>
            <ul className={`${theme.text} text-sm space-y-1 list-disc pl-5`}>
              <li>Practice 4-7-8 breathing (inhale for 4, hold for 7, exhale for 8)</li>
              <li>Try a 5-minute guided meditation</li>
              <li>Take a mindful walk focusing on your surroundings</li>
            </ul>
          </div>
          
          <div className={`p-4 rounded-lg ${theme.background} ${theme.border} border`}>
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🏃</span>
              <h3 className={`font-medium ${theme.textBold}`}>Physical Activity</h3>
            </div>
            <ul className={`${theme.text} text-sm space-y-1 list-disc pl-5`}>
              <li>Take a 10-minute walk to clear your mind</li>
              <li>Do gentle stretching to release muscle tension</li>
              <li>Try yoga poses specifically for stress relief</li>
            </ul>
          </div>
          
          <div className={`p-4 rounded-lg ${theme.background} ${theme.border} border`}>
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🌿</span>
              <h3 className={`font-medium ${theme.textBold}`}>Lifestyle Changes</h3>
            </div>
            <ul className={`${theme.text} text-sm space-y-1 list-disc pl-5`}>
              <li>Limit caffeine and alcohol which can worsen anxiety</li>
              <li>Prioritize 7-9 hours of quality sleep</li>
              <li>Practice setting boundaries and saying "no"</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-center">
          <p className={theme.text}>
            {insights.stressTrend === 'increasing' ? 
              'Your stress is trending upward. Consider trying some of these techniques to help reduce your stress levels.' : 
              insights.stressTrend === 'decreasing' ? 
              'Great job! Your stress levels are trending down. Keep using techniques that work for you.' :
              'Remember to take regular breaks and practice self-care to manage your stress levels.'}
          </p>
        </div>
      </div>
      
      {/* Recent entries */}
      <div className={`${theme.card} rounded-xl p-6`}>
        <h2 className={`text-lg font-bold ${theme.textBold} mb-4`}>Recent Stress Entries</h2>
        
        {stressData && stressData.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {[...stressData].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 10)
              .map((entry, index) => (
                <div key={index} className={`p-4 rounded-lg ${theme.background} ${theme.border} border`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {getStressEmoji(entry.level)}
                      </span>
                      <div>
                        <div className={`font-medium ${theme.textBold}`}>
                          Level: {entry.level}/10 - {getStressLevelText(entry.level)}
                        </div>
                        <div className={`text-sm ${theme.text}`}>
                          {formatDate(entry.timestamp)} at {formatTime(entry.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${
                      entry.level <= 4
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : entry.level <= 7
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {entry.level <= 4 ? 'Low' : entry.level <= 7 ? 'Moderate' : 'High'}
                    </div>
                  </div>
                  
                  {(entry.sources && entry.sources.length > 0) || 
                   (entry.symptoms && entry.symptoms.length > 0) || 
                   entry.notes ? (
                    <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                      {entry.sources && entry.sources.length > 0 && (
                        <div className="mb-1">
                          <span className={`text-sm font-medium ${theme.text}`}>Sources: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.sources.map(sourceId => {
                              const source = sourceOptions.find(s => s.id === sourceId);
                              return source ? (
                                <span 
                                  key={sourceId} 
                                  className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                >
                                  {source.label}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                      
                      {entry.symptoms && entry.symptoms.length > 0 && (
                        <div className="mb-1">
                          <span className={`text-sm font-medium ${theme.text}`}>Symptoms: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.symptoms.map(symptomId => {
                              const symptom = symptomOptions.find(s => s.id === symptomId);
                              return symptom ? (
                                <span 
                                  key={symptomId} 
                                  className="px-2 py-0.5 text-xs rounded-full bg-lime-100 text-lime-800 dark:bg-lime-800 dark:text-lime-100"
                                >
                                  {symptom.label}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                      
                      {entry.notes && (
                        <div className={`mt-2 text-sm ${theme.text}`}>
                          {entry.notes}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${theme.text}`}>
            No stress entries yet. Start logging your stress levels to see your history.
          </div>
        )}
      </div>
    </div>
  );
};

export default StressTracker;