// src/components/dashboard/utils/dataUtils.js

/**
 * Utility functions for processing and analyzing mental health data
 * Used across dashboard components for consistent calculations
 */

/**
 * Get date range based on period type
 * @param {string} periodType - 'day', 'week', 'month', 'year'
 * @param {Date} [baseDate] - Optional base date (defaults to now)
 * @returns {Object} Object containing startDate and endDate
 */
export const getDateRange = (periodType, baseDate = new Date()) => {
    const now = new Date(baseDate);
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
  
  /**
   * Filter entries within a date range
   * @param {Array} entries - Array of entries with timestamp property
   * @param {Date} startDate - Start of date range
   * @param {Date} endDate - End of date range
   * @returns {Array} Filtered entries
   */
  export const filterEntriesByDateRange = (entries, startDate, endDate) => {
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return [];
    }
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  };
  
  /**
   * Group entries by time period (day, week, month)
   * @param {Array} entries - Array of entries with timestamp and value properties
   * @param {string} valueKey - Key for the value to aggregate
   * @param {string} groupBy - 'day', 'week', 'month'
   * @returns {Array} Aggregated entries with date, displayDate, and value
   */
  export const groupEntriesByTimePeriod = (entries, valueKey, groupBy = 'day') => {
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return [];
    }
    
    const groupedData = {};
    
    entries.forEach(entry => {
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
          displayDate: formatDate(date, { type: groupBy }),
          totalValue: 0,
          count: 0
        };
      }
      
      groupedData[groupKey].totalValue += entry[valueKey] || 0;
      groupedData[groupKey].count += 1;
    });
    
    // Calculate averages for each group
    const result = Object.values(groupedData).map(group => ({
      date: group.date,
      displayDate: group.displayDate,
      value: parseFloat((group.totalValue / group.count).toFixed(1))
    }));
    
    // Sort by date
    return result.sort((a, b) => a.date.localeCompare(b.date));
  };
  
  /**
   * Get entries for weekdays to analyze patterns by day of week
   * @param {Array} entries - Array of entries with timestamp and value properties
   * @param {string} valueKey - Key for the value to aggregate
   * @returns {Array} Array with data for each day of week
   */
  export const getWeekdayAverages = (entries, valueKey) => {
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return [];
    }
    
    const weekdays = [
      { day: 0, name: 'Sunday', totalValue: 0, count: 0 },
      { day: 1, name: 'Monday', totalValue: 0, count: 0 },
      { day: 2, name: 'Tuesday', totalValue: 0, count: 0 },
      { day: 3, name: 'Wednesday', totalValue: 0, count: 0 },
      { day: 4, name: 'Thursday', totalValue: 0, count: 0 },
      { day: 5, name: 'Friday', totalValue: 0, count: 0 },
      { day: 6, name: 'Saturday', totalValue: 0, count: 0 }
    ];
    
    entries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dayOfWeek = date.getDay();
      
      weekdays[dayOfWeek].totalValue += entry[valueKey] || 0;
      weekdays[dayOfWeek].count += 1;
    });
    
    return weekdays.map(day => ({
      name: day.name,
      value: day.count > 0 ? parseFloat((day.totalValue / day.count).toFixed(1)) : 0,
      entries: day.count
    }));
  };
  
  /**
   * Get entries grouped by time of day to analyze patterns
   * @param {Array} entries - Array of entries with timestamp and value properties
   * @param {string} valueKey - Key for the value to aggregate
   * @returns {Array} Array with data for each time of day
   */
  export const getTimeOfDayAverages = (entries, valueKey) => {
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return [];
    }
    
    const timeSlots = [
      { slot: 'morning', label: 'Morning (5-11)', totalValue: 0, count: 0 },
      { slot: 'afternoon', label: 'Afternoon (12-16)', totalValue: 0, count: 0 },
      { slot: 'evening', label: 'Evening (17-21)', totalValue: 0, count: 0 },
      { slot: 'night', label: 'Night (22-4)', totalValue: 0, count: 0 }
    ];
    
    entries.forEach(entry => {
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
      
      timeSlots[slotIndex].totalValue += entry[valueKey] || 0;
      timeSlots[slotIndex].count += 1;
    });
    
    return timeSlots.map(slot => ({
      name: slot.label,
      value: slot.count > 0 ? parseFloat((slot.totalValue / slot.count).toFixed(1)) : 0,
      entries: slot.count
    }));
  };
  
  /**
   * Calculate streak of consecutive days with entries
   * @param {Array} entries - Array of entries with timestamp property
   * @returns {number} Number of consecutive days
   */
  export const calculateStreak = (entries) => {
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return 0;
    }
    
    // Get all dates with entries
    const entriesByDate = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      entriesByDate[dateKey] = true;
    });
    
    // Calculate streak from today backward
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
    
    return streakCount;
  };
  
  /**
   * Calculate average value for entries
   * @param {Array} entries - Array of entries with value property
   * @param {string} valueKey - Key for the value to average
   * @returns {number} Average value, rounded to 1 decimal place
   */
  export const calculateAverage = (entries, valueKey) => {
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return 0;
    }
    
    const sum = entries.reduce((total, entry) => total + (entry[valueKey] || 0), 0);
    return parseFloat((sum / entries.length).toFixed(1));
  };
  
  /**
   * Calculate trend based on comparing older vs. newer entries
   * @param {Array} entries - Array of entries with timestamp and value properties
   * @param {string} valueKey - Key for the value to analyze
   * @param {number} threshold - Threshold for considering a significant change
   * @returns {string} 'improving', 'declining', or 'stable'
   */
  export const calculateTrend = (entries, valueKey, threshold = 0.5) => {
    if (!entries || !Array.isArray(entries) || entries.length < 3) {
      return 'stable';
    }
    
    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
    
    // Split into two halves
    const halfIndex = Math.floor(sortedEntries.length / 2);
    const firstHalf = sortedEntries.slice(0, halfIndex);
    const secondHalf = sortedEntries.slice(halfIndex);
    
    // Calculate average for each half
    const firstAvg = calculateAverage(firstHalf, valueKey);
    const secondAvg = calculateAverage(secondHalf, valueKey);
    
    // Determine trend
    if (secondAvg - firstAvg > threshold) {
      return 'improving';
    } else if (firstAvg - secondAvg > threshold) {
      return 'declining';
    } else {
      return 'stable';
    }
  };
  
  /**
   * Calculate statistical correlation between two sets of data
   * @param {Array} data - Array of objects containing both metrics
   * @param {string} key1 - Key for first metric
   * @param {string} key2 - Key for second metric
   * @returns {number} Correlation coefficient (-1 to 1)
   */
  export const calculateCorrelation = (data, key1, key2) => {
    if (!data || !Array.isArray(data) || data.length < 3) {
      return 0;
    }
    
    // Filter items that have both keys
    const validData = data.filter(item => 
      item[key1] !== undefined && 
      item[key2] !== undefined &&
      item[key1] !== null && 
      item[key2] !== null
    );
    
    if (validData.length < 3) {
      return 0;
    }
    
    // Calculate Pearson correlation coefficient
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;
    const n = validData.length;
    
    validData.forEach(item => {
      const x = item[key1];
      const y = item[key2];
      
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
    });
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    if (denominator === 0) return 0;
    
    return parseFloat((numerator / denominator).toFixed(2));
  };
  
  /**
   * Format date for display with various options
   * @param {Date|string} date - Date to format
   * @param {Object} options - Formatting options
   * @returns {string} Formatted date string
   */
  export const formatDate = (date, options = {}) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    const { 
      type = 'default', 
      includeTime = false, 
      includeYear = true,
      relative = false
    } = options;
    
    if (relative) {
      return formatRelativeTime(dateObj);
    }
    
    if (type === 'day') {
      return dateObj.toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: includeYear ? 'numeric' : undefined
      });
    }
    
    if (type === 'week') {
      // Show start of week - end of week
      const weekStart = new Date(dateObj);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
      weekStart.setDate(diff);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${
        weekEnd.toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric',
          year: includeYear ? 'numeric' : undefined
        })
      }`;
    }
    
    if (type === 'month') {
      return dateObj.toLocaleDateString(undefined, { 
        month: 'long', 
        year: includeYear ? 'numeric' : undefined
      });
    }
    
    // Default formatting
    const dateOptions = { 
      month: 'short', 
      day: 'numeric',
      year: includeYear ? 'numeric' : undefined
    };
    
    if (includeTime) {
      return `${dateObj.toLocaleDateString(undefined, dateOptions)} ${
        dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      }`;
    }
    
    return dateObj.toLocaleDateString(undefined, dateOptions);
  };
  
  /**
   * Format timestamp relative to now
   * @param {Date|string} timestamp - Date to format
   * @returns {string} Relative time (e.g., "2 days ago")
   */
  export const formatRelativeTime = (timestamp) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 30) {
      const diffMonth = Math.floor(diffDay / 30);
      return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
    } else if (diffDay > 0) {
      return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };
  
  /**
   * Utility to safely access nested object properties
   * @param {Object} obj - Object to access property from
   * @param {string} path - Path to property (e.g., 'user.settings.theme')
   * @param {*} defaultValue - Default value if property doesn't exist
   * @returns {*} Property value or default value
   */
  export const getNestedValue = (obj, path, defaultValue = null) => {
    if (!obj || !path) return defaultValue;
    
    const properties = path.split('.');
    let current = obj;
    
    for (let i = 0; i < properties.length; i++) {
      if (current === undefined || current === null) {
        return defaultValue;
      }
      current = current[properties[i]];
    }
    
    return current !== undefined ? current : defaultValue;
  };
  
  /**
   * Calculate standard deviation for a set of values
   * @param {Array} entries - Array of entries
   * @param {string} valueKey - Key for the value to analyze
   * @returns {number} Standard deviation
   */
  export const calculateStandardDeviation = (entries, valueKey) => {
    if (!entries || !Array.isArray(entries) || entries.length < 2) {
      return 0;
    }
    
    const avg = calculateAverage(entries, valueKey);
    const squaredDiffs = entries.map(entry => Math.pow((entry[valueKey] || 0) - avg, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
    
    return parseFloat(Math.sqrt(avgSquaredDiff).toFixed(2));
  };
  
  /**
   * Get stats summary for a metric
   * @param {Array} entries - Array of entries with timestamp and value properties
   * @param {string} valueKey - Key for the value to analyze
   * @param {string} period - 'day', 'week', 'month', 'year'
   * @returns {Object} Object with average, trend, count, and other stats
   */
  export const getMetricSummary = (entries, valueKey, period = 'week') => {
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return {
        average: 0,
        trend: 'stable',
        count: 0,
        stdDev: 0,
        min: 0,
        max: 0
      };
    }
    
    // Get date range
    const { startDate, endDate } = getDateRange(period);
    
    // Filter entries in range
    const filteredEntries = filterEntriesByDateRange(entries, startDate, endDate);
    
    if (filteredEntries.length === 0) {
      return {
        average: 0,
        trend: 'stable',
        count: 0,
        stdDev: 0,
        min: 0,
        max: 0
      };
    }
    
    // Get values
    const values = filteredEntries.map(entry => entry[valueKey] || 0);
    
    // Calculate stats
    const average = calculateAverage(filteredEntries, valueKey);
    const trend = calculateTrend(filteredEntries, valueKey);
    const stdDev = calculateStandardDeviation(filteredEntries, valueKey);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return {
      average,
      trend,
      count: filteredEntries.length,
      stdDev,
      min,
      max
    };
  };
  
  /**
   * Export utility functions as a named object for easy importing
   */
  const dataUtils = {
    getDateRange,
    filterEntriesByDateRange,
    groupEntriesByTimePeriod,
    getWeekdayAverages,
    getTimeOfDayAverages,
    calculateStreak,
    calculateAverage,
    calculateTrend,
    calculateCorrelation,
    formatDate,
    formatRelativeTime,
    getNestedValue,
    calculateStandardDeviation,
    getMetricSummary
  };
  
  export default dataUtils;