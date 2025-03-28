// src/components/dashboard/charts/MoodChart.js
import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area,
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useTheme } from '../../../context/ThemeContext';

// Mood chart types
const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  AREA: 'area',
  PIE: 'pie',
  DISTRIBUTION: 'distribution'
};

const MoodChart = ({ 
  data, 
  type = CHART_TYPES.LINE, 
  height = 300, 
  showLegend = true,
  dateKey = 'date',
  valueKey = 'score',
  labelKey = 'label',
  showGrid = true,
  xAxisLabel = '',
  yAxisLabel = '',
  customTooltip = null
}) => {
  const { theme, isDark } = useTheme();
  
  // Early return if no data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <p className={`${theme.text} text-center`}>No data available to display chart.</p>
      </div>
    );
  }
  
  // Ensure all data points have at least zero values for the value key
  const processedData = data.map(item => ({
    ...item,
    [valueKey]: item[valueKey] !== undefined ? item[valueKey] : 0 // Ensure zero values exist instead of undefined/null
  }));
  
  // Get mood color based on score (1-10 scale)
  const getMoodColor = (score) => {
    if (score >= 9) return '#4CAF50'; // Green
    if (score >= 7) return '#8BC34A'; // Light Green
    if (score >= 5) return '#FFC107'; // Yellow
    if (score >= 3) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };
  
  // Default tooltip component
  const DefaultTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className={`p-3 ${theme.card} border ${theme.border} rounded-lg shadow-md`}>
          <p className={`font-bold ${theme.textBold}`}>
            {dataPoint[labelKey] || dataPoint[dateKey] || label}
          </p>
          <p className={theme.text}>
            <span className="font-medium">Mood:</span> {dataPoint[valueKey]}/10
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Distribution tooltip component
  const DistributionTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 ${theme.card} border ${theme.border} rounded-lg shadow-md`}>
          <p className={`font-bold ${theme.textBold}`}>{payload[0].payload.label}</p>
          <p className={theme.text}>
            <span className="font-medium">Count:</span> {payload[0].value}
          </p>
          <p className={theme.text}>
            <span className="font-medium">Percentage:</span> {payload[0].payload.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Line chart (default) - Shows mood trends over time
  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={processedData} margin={{ top: 5, right: 20, left: 10, bottom: 15 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />}
        
        <XAxis 
          dataKey={dateKey} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151',fontSize: 12 }}
          tickMargin={10}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : null}
        />
        
        <YAxis 
          domain={[0, 10]} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151',fontSize: 12 }}
          tickMargin={10}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : null}
        />
        
        <Tooltip content={customTooltip || <DefaultTooltip />} />
        {showLegend && <Legend />}
        
        <Line 
          type="monotone" 
          dataKey={valueKey} 
          name="Mood Level" 
          stroke={isDark ? '#60A5FA' : '#3B82F6'} 
          strokeWidth={2}
          activeDot={{ r: 8 }}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
  
  // Bar chart - Good for comparing mood across categories
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={processedData} margin={{ top: 5, right: 20, left: 10, bottom: 15 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />}
        
        <XAxis 
          dataKey={dateKey} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151',fontSize: 12 }}
          tickMargin={10}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : null}
        />
        
        <YAxis 
          domain={[0, 10]} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151',fontSize: 12 }}
          tickMargin={10}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : null}
        />
        
        <Tooltip content={customTooltip || <DefaultTooltip />} />
        {showLegend && <Legend />}
        
        <Bar dataKey={valueKey} name="Mood Level" fill={isDark ? '#60A5FA' : '#3B82F6'}>
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getMoodColor(entry[valueKey])} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
  
  // Area chart - Emphasizes the overall mood trend
  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={processedData} margin={{ top: 5, right: 20, left: 10, bottom: 15 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />}
        
        <XAxis 
          dataKey={dateKey} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151',fontSize: 12 }}
          tickMargin={10}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : null}
        />
        
        <YAxis 
          domain={[0, 10]} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151',fontSize: 12 }}
          tickMargin={10}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : null}
        />
        
        <Tooltip content={customTooltip || <DefaultTooltip />} />
        {showLegend && <Legend />}
        
        <defs>
          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={isDark ? '#60A5FA' : '#3B82F6'} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={isDark ? '#60A5FA' : '#3B82F6'} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        
        <Area 
          type="monotone" 
          dataKey={valueKey} 
          name="Mood Level" 
          stroke={isDark ? '#60A5FA' : '#3B82F6'} 
          fillOpacity={1} 
          fill="url(#moodGradient)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
  
  // Pie chart - Good for showing proportion of different moods
  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <Pie
          data={processedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          dataKey={valueKey}
          nameKey={labelKey}
          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getMoodColor(entry[valueKey])} />
          ))}
        </Pie>
        <Tooltip content={customTooltip || <DefaultTooltip />} />
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
  
  // Distribution chart - Special bar chart for mood frequency distribution
  const renderDistributionChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={processedData} margin={{ top: 5, right: 20, left: 10, bottom: 15 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />}
        
        <XAxis 
          dataKey={labelKey} 
          tick={{ 
            fill: isDark ? '#e5e7eb' : '#374151',
            fontSize: 12
          }}
          tickMargin={10}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : null}
        />
        
        <YAxis 
          tick={{ 
            fill: isDark ? '#e5e7eb' : '#374151',
            fontSize: 12
          }}
          tickMargin={10}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : null}
        />
        
        <Tooltip content={customTooltip || <DistributionTooltip />} />
        {showLegend && <Legend />}
        
        <Bar dataKey="count" name="Frequency" fill={isDark ? '#60A5FA' : '#3B82F6'}>
          {processedData.map((entry, index) => {
            let color;
            switch (entry.label) {
              case 'Very Low':
              case '1-2':
                color = '#F44336'; // Red
                break;
              case 'Low':
              case '3-4':
                color = '#FF9800'; // Orange
                break;
              case 'Neutral':
              case '5-6':
                color = '#FFC107'; // Yellow
                break;
              case 'Good':
              case '7-8':
                color = '#8BC34A'; // Light Green
                break;
              case 'Excellent':
              case '9-10':
                color = '#4CAF50'; // Green
                break;
              default:
                color = isDark ? '#60A5FA' : '#3B82F6'; // Default blue
            }
            return <Cell key={`cell-${index}`} fill={color} />;
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
  
  // Render the appropriate chart based on type
  switch (type) {
    case CHART_TYPES.BAR:
      return renderBarChart();
    case CHART_TYPES.AREA:
      return renderAreaChart();
    case CHART_TYPES.PIE:
      return renderPieChart();
    case CHART_TYPES.DISTRIBUTION:
      return renderDistributionChart();
    case CHART_TYPES.LINE:
    default:
      return renderLineChart();
  }
};

// Export chart types for easy reference
export const MoodChartTypes = CHART_TYPES;

export default MoodChart;