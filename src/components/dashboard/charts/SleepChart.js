// src/components/dashboard/charts/SleepChart.js
import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area,
  ScatterChart,
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { useTheme } from '../../../context/ThemeContext';

// Sleep chart types
const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  AREA: 'area',
  SCATTER: 'scatter',
  DURATION_DISTRIBUTION: 'durationDistribution',
  QUALITY: 'quality'
};

const SleepChart = ({ 
  data, 
  type = CHART_TYPES.AREA, 
  height = 300, 
  showLegend = true,
  dateKey = 'date',
  durationKey = 'hours',
  qualityKey = 'quality',
  labelKey = 'label',
  showGrid = true,
  xAxisLabel = '',
  yAxisLabel = '',
  showRecommendedRange = false,
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
  
  // Get sleep duration quality
  const getSleepDurationQuality = (hours) => {
    if (hours < 5) return 'Too Little';
    if (hours < 6) return 'Poor';
    if (hours < 7) return 'Fair';
    if (hours <= 9) return 'Optimal';
    return 'Too Much';
  };
  
  // Get sleep quality text
  const getSleepQualityText = (quality) => {
    if (!quality && quality !== 0) return 'Unknown';
    
    switch(Math.round(quality)) {
      case 1: return 'Very Poor';
      case 2: return 'Poor';
      case 3: return 'Fair';
      case 4: return 'Good';
      case 5: return 'Excellent';
      default: return 'Unknown';
    }
  };
  
  // Get color based on sleep hours
  const getSleepDurationColor = (hours) => {
    if (hours < 5) return '#F44336'; // Red - Too little
    if (hours < 6) return '#FF9800'; // Orange - Poor
    if (hours < 7) return '#FFC107'; // Yellow - Fair
    if (hours <= 9) return '#4CAF50'; // Green - Optimal
    return '#FF9800'; // Orange - Too much
  };
  
  // Get color based on sleep quality
  const getSleepQualityColor = (quality) => {
    if (!quality && quality !== 0) return '#9E9E9E'; // Gray - Unknown
    
    switch(Math.round(quality)) {
      case 1: return '#F44336'; // Red - Very Poor
      case 2: return '#FF9800'; // Orange - Poor
      case 3: return '#FFC107'; // Yellow - Fair
      case 4: return '#8BC34A'; // Light Green - Good
      case 5: return '#4CAF50'; // Green - Excellent
      default: return '#9E9E9E'; // Gray - Unknown
    }
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
            <span className="font-medium">Sleep:</span> {dataPoint[durationKey]} hours
          </p>
          {dataPoint[qualityKey] !== undefined && (
            <p className={theme.text}>
              <span className="font-medium">Quality:</span> {getSleepQualityText(dataPoint[qualityKey])}
            </p>
          )}
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
  
  // Area chart (default) - Shows sleep duration over time with filled area
  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 15 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />}
        
        <XAxis 
          dataKey={dateKey} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : null}
        />
        
        <YAxis 
          domain={[0, 12]} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : null}
        />
        
        {showRecommendedRange && (
          <>
            <ReferenceLine y={7} stroke="#4CAF50" strokeDasharray="3 3" label="Ideal" />
            <ReferenceLine y={9} stroke="#FF9800" strokeDasharray="3 3" label="Max" />
          </>
        )}
        
        <Tooltip content={customTooltip || <DefaultTooltip />} />
        {showLegend && <Legend />}
        
        <defs>
          <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={isDark ? '#60A5FA' : '#3B82F6'} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={isDark ? '#60A5FA' : '#3B82F6'} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        
        <Area 
          type="monotone" 
          dataKey={durationKey} 
          name="Sleep Duration" 
          stroke={isDark ? '#60A5FA' : '#3B82F6'} 
          fillOpacity={1} 
          fill="url(#sleepGradient)" 
        />
        
        {data[0] && data[0][qualityKey] !== undefined && (
          <Line 
            type="monotone" 
            dataKey={qualityKey} 
            name="Sleep Quality" 
            stroke={isDark ? '#F59E0B' : '#D97706'} 
            strokeWidth={2}
            yAxisId="right"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
  
  // Line chart - Simple display of sleep duration over time
  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 15 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />}
        
        <XAxis 
          dataKey={dateKey} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : null}
        />
        
        <YAxis 
          domain={[0, 12]} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : null}
        />
        
        {showRecommendedRange && (
          <>
            <ReferenceLine y={7} stroke="#4CAF50" strokeDasharray="3 3" label="Ideal" />
            <ReferenceLine y={9} stroke="#FF9800" strokeDasharray="3 3" label="Max" />
          </>
        )}
        
        <Tooltip content={customTooltip || <DefaultTooltip />} />
        {showLegend && <Legend />}
        
        <Line 
          type="monotone" 
          dataKey={durationKey} 
          name="Sleep Duration" 
          stroke={isDark ? '#60A5FA' : '#3B82F6'} 
          strokeWidth={2}
          activeDot={{ r: 8 }}
          dot={{ r: 4 }}
        />
        
        {data[0] && data[0][qualityKey] !== undefined && (
          <Line 
            type="monotone" 
            dataKey={qualityKey} 
            name="Sleep Quality" 
            stroke={isDark ? '#F59E0B' : '#D97706'} 
            strokeWidth={2}
            yAxisId="right"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
  
  // Bar chart - Shows sleep duration by day/category
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 15 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />}
        
        <XAxis 
          dataKey={dateKey} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : null}
        />
        
        <YAxis 
          domain={[0, 12]} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : null}
        />
        
        {showRecommendedRange && (
          <>
            <ReferenceLine y={7} stroke="#4CAF50" strokeDasharray="3 3" label="Ideal" />
            <ReferenceLine y={9} stroke="#FF9800" strokeDasharray="3 3" label="Max" />
          </>
        )}
        
        <Tooltip content={customTooltip || <DefaultTooltip />} />
        {showLegend && <Legend />}
        
        <Bar dataKey={durationKey} name="Sleep Duration" fill={isDark ? '#60A5FA' : '#3B82F6'}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getSleepDurationColor(entry[durationKey])} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
  
  // Scatter chart - Shows relationship between sleep duration and quality
  const renderScatterChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />}
        
        <XAxis 
          type="number" 
          dataKey={durationKey} 
          name="Sleep Duration" 
          domain={[0, 12]}
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          label={{ value: 'Sleep Duration (hours)', position: 'insideBottom', offset: -5 }} 
        />
        
        <YAxis 
          type="number" 
          dataKey={qualityKey} 
          name="Sleep Quality" 
          domain={[0, 5]}
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          label={{ value: 'Sleep Quality', angle: -90, position: 'insideLeft' }}
        />
        
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={customTooltip || <DefaultTooltip />} />
        {showLegend && <Legend />}
        
        <Scatter name="Sleep Pattern" data={data} fill={isDark ? '#60A5FA' : '#3B82F6'}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getSleepDurationColor(entry[durationKey])} 
            />
          ))}
        </Scatter>
        
        {showRecommendedRange && (
          <ReferenceLine 
            x={7} 
            stroke="#4CAF50" 
            label="Ideal" 
            strokeDasharray="3 3" 
          />
        )}
      </ScatterChart>
    </ResponsiveContainer>
  );
  
  // Duration distribution chart - Shows frequency of different sleep durations
  const renderDurationDistributionChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 15 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />}
        
        <XAxis 
          dataKey={labelKey} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : null}
        />
        
        <YAxis 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : null}
        />
        
        <Tooltip content={customTooltip || <DistributionTooltip />} />
        {showLegend && <Legend />}
        
        <Bar dataKey="count" name="Frequency" fill={isDark ? '#60A5FA' : '#3B82F6'}>
          {data.map((entry, index) => {
            let color;
            switch (entry.label) {
              case 'Less than 5 hrs':
              case '<5':
                color = '#F44336'; // Red - Too little
                break;
              case '5-6 hrs':
              case '5-6':
                color = '#FF9800'; // Orange - Poor
                break;
              case '6-7 hrs':
              case '6-7':
                color = '#FFC107'; // Yellow - Fair
                break;
              case '7-8 hrs':
              case '7-8':
                color = '#4CAF50'; // Green - Optimal
                break;
              case '8-9 hrs':
              case '8-9':
                color = '#8BC34A'; // Light Green - Optimal
                break;
              case 'More than 9 hrs':
              case '>9':
                color = '#FF9800'; // Orange - Too much
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
  
  // Quality chart - Shows sleep quality distribution
  const renderQualityChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 15 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />}
        
        <XAxis 
          dataKey={labelKey} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : null}
        />
        
        <YAxis 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : null}
        />
        
        <Tooltip content={customTooltip || <DistributionTooltip />} />
        {showLegend && <Legend />}
        
        <Bar dataKey="count" name="Frequency" fill={isDark ? '#60A5FA' : '#3B82F6'}>
          {data.map((entry, index) => {
            let color;
            switch (entry.label) {
              case 'Very Poor':
                color = '#F44336'; // Red
                break;
              case 'Poor':
                color = '#FF9800'; // Orange
                break;
              case 'Fair':
                color = '#FFC107'; // Yellow
                break;
              case 'Good':
                color = '#8BC34A'; // Light Green
                break;
              case 'Excellent':
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
    case CHART_TYPES.LINE:
      return renderLineChart();
    case CHART_TYPES.BAR:
      return renderBarChart();
    case CHART_TYPES.SCATTER:
      return renderScatterChart();
    case CHART_TYPES.DURATION_DISTRIBUTION:
      return renderDurationDistributionChart();
    case CHART_TYPES.QUALITY:
      return renderQualityChart();
    case CHART_TYPES.AREA:
    default:
      return renderAreaChart();
  }
};

// Export chart types for easy reference
export const SleepChartTypes = CHART_TYPES;

export default SleepChart;