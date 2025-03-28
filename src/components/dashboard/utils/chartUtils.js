// src/components/dashboard/utils/chartUtils.js

/**
 * Utility functions for chart configuration and styling
 * Used across dashboard components for consistent visualizations
 */

/**
 * Get chart colors based on theme (light/dark)
 * @param {boolean} isDark - Whether dark mode is active
 * @returns {Object} Object with color values for different chart elements
 */
export const getChartColors = (isDark) => {
    return {
      primary: isDark ? '#60A5FA' : '#3B82F6', // blue
      secondary: isDark ? '#F59E0B' : '#D97706', // amber
      tertiary: isDark ? '#10B981' : '#059669', // emerald
      error: isDark ? '#EF4444' : '#DC2626', // red
      warning: isDark ? '#F97316' : '#EA580C', // orange
      success: isDark ? '#10B981' : '#059669', // emerald
      grid: isDark ? '#374151' : '#E5E7EB', // gray
      text: isDark ? '#E5E7EB' : '#374151', // gray
      tooltip: {
        background: isDark ? '#1F2937' : '#FFFFFF',
        border: isDark ? '#374151' : '#E5E7EB',
        text: isDark ? '#E5E7EB' : '#374151'
      }
    };
  };
  
  /**
   * Get mood level colors for visualizations
   * @param {boolean} isDark - Whether dark mode is active
   * @returns {Object} Object with color values for different mood levels
   */
  export const getMoodColors = (isDark) => {
    return {
      veryLow: '#F44336', // red
      low: '#FF9800', // orange
      neutral: '#FFC107', // yellow
      good: '#8BC34A', // light green
      excellent: '#4CAF50', // green
      // Optional dark mode variants
      veryLowDark: isDark ? '#B71C1C' : '#F44336', // darker red
      lowDark: isDark ? '#E65100' : '#FF9800', // darker orange
      neutralDark: isDark ? '#FFB300' : '#FFC107', // darker yellow
      goodDark: isDark ? '#689F38' : '#8BC34A', // darker light green
      excellentDark: isDark ? '#2E7D32' : '#4CAF50', // darker green
    };
  };
  
  /**
   * Get color for a specific mood score
   * @param {number} score - Mood score (typically 1-10)
   * @param {boolean} isDark - Whether dark mode is active
   * @returns {string} Hex color code
   */
  export const getMoodColor = (score, isDark = false) => {
    const colors = getMoodColors(isDark);
    
    if (score >= 9) return colors.excellent;
    if (score >= 7) return colors.good;
    if (score >= 5) return colors.neutral;
    if (score >= 3) return colors.low;
    return colors.veryLow;
  };
  
  /**
   * Get sleep duration colors for visualizations
   * @param {boolean} isDark - Whether dark mode is active
   * @returns {Object} Object with color values for different sleep durations
   */
  export const getSleepColors = (isDark) => {
    return {
      tooLittle: '#F44336', // red - less than 5 hours
      poor: '#FF9800', // orange - 5-6 hours
      fair: '#FFC107', // yellow - 6-7 hours
      optimal: '#4CAF50', // green - 7-9 hours
      tooMuch: '#FF9800', // orange - more than 9 hours
    };
  };
  
  /**
   * Get color for a specific sleep duration
   * @param {number} hours - Sleep duration in hours
   * @param {boolean} isDark - Whether dark mode is active
   * @returns {string} Hex color code
   */
  export const getSleepDurationColor = (hours, isDark = false) => {
    const colors = getSleepColors(isDark);
    
    if (hours < 5) return colors.tooLittle;
    if (hours < 6) return colors.poor;
    if (hours < 7) return colors.fair;
    if (hours <= 9) return colors.optimal;
    return colors.tooMuch;
  };
  
  /**
   * Get stress level colors for visualizations
   * @param {boolean} isDark - Whether dark mode is active
   * @returns {Object} Object with color values for different stress levels
   */
  export const getStressColors = (isDark) => {
    return {
      calm: '#4CAF50', // green - levels 1-2
      mild: '#8BC34A', // light green - levels 3-4
      moderate: '#FFC107', // yellow - levels 5-6
      high: '#FF9800', // orange - levels 7-8
      extreme: '#F44336', // red - levels 9-10
    };
  };
  
  /**
   * Get color for a specific stress level
   * @param {number} level - Stress level (typically 1-10)
   * @param {boolean} isDark - Whether dark mode is active
   * @returns {string} Hex color code
   */
  export const getStressLevelColor = (level, isDark = false) => {
    const colors = getStressColors(isDark);
    
    if (level <= 2) return colors.calm;
    if (level <= 4) return colors.mild;
    if (level <= 6) return colors.moderate;
    if (level <= 8) return colors.high;
    return colors.extreme;
  };
  
  /**
   * Create gradient definition for chart areas
   * @param {string} id - Gradient ID
   * @param {string} color - Base color
   * @param {boolean} vertical - Whether gradient should be vertical
   * @returns {Object} Gradient definition object for recharts
   */
  export const createGradient = (id, color, vertical = true) => {
    return (
      <linearGradient 
        id={id} 
        x1="0" 
        y1="0" 
        x2={vertical ? "0" : "1"} 
        y2={vertical ? "1" : "0"}
      >
        <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
        <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
      </linearGradient>
    );
  };
  
  /**
   * Get common chart margin configuration
   * @param {Object} customMargins - Optional custom margin values
   * @returns {Object} Margin configuration object
   */
  export const getChartMargin = (customMargins = {}) => {
    const defaultMargins = {
      top: 5,
      right: 30,
      bottom: 15,
      left: 10,
    };
    
    return {
      ...defaultMargins,
      ...customMargins
    };
  };
  
  /**
   * Generate tick formatter for X axis dates
   * @param {string} format - Date format ('short', 'medium', 'long', 'weekday')
   * @returns {Function} Formatter function for ticks
   */
  export const getDateTickFormatter = (format = 'short') => {
    return (date) => {
      if (!date) return '';
      
      const dateObj = new Date(date);
      
      switch (format) {
        case 'short':
          return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        case 'medium':
          return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' });
        case 'long':
          return dateObj.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
        case 'weekday':
          return dateObj.toLocaleDateString(undefined, { weekday: 'short' });
        default:
          return dateObj.toLocaleDateString();
      }
    };
  };
  
  /**
   * Create a default tooltip component for charts
   * @param {boolean} isDark - Whether dark mode is active
   * @returns {Function} Tooltip component
   */
  export const createDefaultTooltip = (isDark) => {
    const tooltipStyle = {
      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
      border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
      borderRadius: '0.375rem',
      padding: '0.5rem 1rem',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
      color: isDark ? '#E5E7EB' : '#374151',
    };
    
    const labelStyle = {
      fontWeight: 'bold',
      marginBottom: '0.25rem'
    };
    
    return ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div style={tooltipStyle}>
            <p style={labelStyle}>{label}</p>
            {payload.map((entry, index) => (
              <p key={`item-${index}`} style={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };
  };
  
  /**
   * Create common axis configuration
   * @param {boolean} isDark - Whether dark mode is active
   * @returns {Object} Axis configuration objects
   */
  export const createAxisConfig = (isDark) => {
    const textColor = isDark ? '#E5E7EB' : '#374151';
    
    return {
      xAxis: {
        tick: {
          fill: textColor,
          fontSize: 12
        },
        tickLine: { stroke: textColor },
        axisLine: { stroke: textColor },
        tickMargin: 10
      },
      yAxis: {
        tick: {
          fill: textColor,
          fontSize: 12
        },
        tickLine: { stroke: textColor },
        axisLine: { stroke: textColor },
        tickMargin: 10
      }
    };
  };
  
  /**
   * Create data point with aggregated values for a specific date range
   * @param {Array} data - Array of data points
   * @param {string} valueKey - Key for the value to aggregate
   * @param {Date} startDate - Start of date range
   * @param {Date} endDate - End of date range
   * @param {string} labelFormat - Format for the label ('short', 'medium', 'long', 'weekday')
   * @returns {Object} Aggregated data point
   */
  export const createAggregatedDataPoint = (data, valueKey, startDate, endDate, labelFormat = 'short') => {
    const filteredData = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= startDate && itemDate <= endDate;
    });
    
    if (filteredData.length === 0) {
      return null;
    }
    
    const total = filteredData.reduce((sum, item) => sum + (item[valueKey] || 0), 0);
    const average = total / filteredData.length;
    
    let label;
    switch (labelFormat) {
      case 'range':
        label = `${startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
        break;
      case 'month':
        label = startDate.toLocaleDateString(undefined, { month: 'long' });
        break;
      case 'year':
        label = startDate.getFullYear().toString();
        break;
      case 'weekday':
        label = startDate.toLocaleDateString(undefined, { weekday: 'short' });
        break;
      default:
        label = startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    
    return {
      label,
      value: parseFloat(average.toFixed(1)),
      count: filteredData.length,
      startDate,
      endDate
    };
  };
  
  /**
   * Create week-by-week aggregated data for charts
   * @param {Array} data - Array of data points
   * @param {string} valueKey - Key for the value to aggregate
   * @param {number} weeksToInclude - Number of weeks to include
   * @returns {Array} Array of weekly aggregated data points
   */
  export const createWeeklyAggregation = (data, valueKey, weeksToInclude = 8) => {
    if (!data || data.length === 0) {
      return [];
    }
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const result = [];
    
    for (let i = 0; i < weeksToInclude; i++) {
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6); // 7-day week
      startDate.setHours(0, 0, 0, 0);
      
      const dataPoint = createAggregatedDataPoint(data, valueKey, startDate, endDate, 'range');
      if (dataPoint) {
        result.unshift(dataPoint); // Add to beginning for chronological order
      }
      
      // Move to previous week
      endDate.setDate(startDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
    }
    
    return result;
  };
  
  /**
   * Create daily aggregated data for charts
   * @param {Array} data - Array of data points
   * @param {string} valueKey - Key for the value to aggregate
   * @param {number} daysToInclude - Number of days to include
   * @returns {Array} Array of daily aggregated data points
   */
  export const createDailyAggregation = (data, valueKey, daysToInclude = 14) => {
    if (!data || data.length === 0) {
      return [];
    }
    
    const result = [];
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    for (let i = 0; i < daysToInclude; i++) {
      const startDate = new Date(endDate);
      startDate.setHours(0, 0, 0, 0);
      
      const dataPoint = createAggregatedDataPoint(data, valueKey, startDate, endDate, 'short');
      
      if (dataPoint) {
        result.unshift(dataPoint); // Add to beginning for chronological order
      }
      
      // Move to previous day
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
    }
    
    return result;
  };
  
  /**
   * Create frequency distribution data for charts
   * @param {Array} data - Array of data points
   * @param {string} valueKey - Key for the value to count
   * @param {Array} ranges - Array of range objects with min and max properties
   * @param {Array} labels - Array of labels for each range
   * @returns {Array} Array of frequency distribution data points
   */
  export const createDistributionData = (data, valueKey, ranges, labels) => {
    if (!data || data.length === 0 || !ranges || !labels || ranges.length !== labels.length) {
      return [];
    }
    
    const distribution = ranges.map((range, index) => ({
      range: `${range.min}-${range.max}`,
      label: labels[index],
      min: range.min,
      max: range.max,
      count: 0
    }));
    
    data.forEach(item => {
      const value = item[valueKey];
      
      for (let i = 0; i < distribution.length; i++) {
        const range = distribution[i];
        if (value >= range.min && value <= range.max) {
          range.count += 1;
          break;
        }
      }
    });
    
    // Calculate percentages
    const totalCount = data.length;
    distribution.forEach(item => {
      item.percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
    });
    
    return distribution;
  };
  
  /**
   * Create common mood distribution ranges and labels
   * @returns {Object} Object with ranges and labels arrays
   */
  export const getMoodDistributionConfig = () => {
    return {
      ranges: [
        { min: 1, max: 2 },
        { min: 3, max: 4 },
        { min: 5, max: 6 },
        { min: 7, max: 8 },
        { min: 9, max: 10 }
      ],
      labels: ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent']
    };
  };
  
  /**
   * Create common sleep distribution ranges and labels
   * @returns {Object} Object with ranges and labels arrays
   */
  export const getSleepDistributionConfig = () => {
    return {
      ranges: [
        { min: 0, max: 4.9 },
        { min: 5, max: 5.9 },
        { min: 6, max: 6.9 },
        { min: 7, max: 7.9 },
        { min: 8, max: 8.9 },
        { min: 9, max: 24 }
      ],
      labels: [
        'Less than 5 hrs', 
        '5-6 hrs', 
        '6-7 hrs', 
        '7-8 hrs', 
        '8-9 hrs', 
        'More than 9 hrs'
      ]
    };
  };
  
  /**
   * Create common stress distribution ranges and labels
   * @returns {Object} Object with ranges and labels arrays
   */
  export const getStressDistributionConfig = () => {
    return {
      ranges: [
        { min: 1, max: 2 },
        { min: 3, max: 4 },
        { min: 5, max: 6 },
        { min: 7, max: 8 },
        { min: 9, max: 10 }
      ],
      labels: ['Very Calm', 'Calm', 'Moderate', 'Stressed', 'Very Stressed']
    };
  };
  
  /**
   * Export utility functions as a named object for easy importing
   */
  const chartUtils = {
    getChartColors,
    getMoodColors,
    getMoodColor,
    getSleepColors,
    getSleepDurationColor,
    getStressColors,
    getStressLevelColor,
    createGradient,
    getChartMargin,
    getDateTickFormatter,
    createDefaultTooltip,
    createAxisConfig,
    createAggregatedDataPoint,
    createWeeklyAggregation,
    createDailyAggregation,
    createDistributionData,
    getMoodDistributionConfig,
    getSleepDistributionConfig,
    getStressDistributionConfig
  };
  
  export default chartUtils;