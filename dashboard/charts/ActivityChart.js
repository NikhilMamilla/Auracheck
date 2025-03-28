// src/components/dashboard/charts/ActivityChart.js
import React from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useTheme } from '../../../context/ThemeContext';

// Activity chart types
const CHART_TYPES = {
  IMPACT: 'impact',
  FREQUENCY: 'frequency',
  CORRELATION: 'correlation',
  RADAR: 'radar',
  SCATTER: 'scatter'
};

const ActivityChart = ({ 
  data, 
  type = CHART_TYPES.IMPACT, 
  height = 300, 
  showLegend = true,
  nameKey = 'name',
  valueKey = 'impact',
  countKey = 'count',
  moodKey = 'mood',
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
  
  // Get color based on impact value (-5 to +5 scale)
  const getImpactColor = (impact) => {
    if (impact >= 4) return '#4CAF50'; // Very positive (dark green)
    if (impact >= 2) return '#8BC34A'; // Positive (light green)
    if (impact >= -1) return '#FFC107'; // Neutral (yellow)
    if (impact >= -3) return '#FF9800'; // Negative (orange)
    return '#F44336'; // Very negative (red)
  };
  
  // Get impact text description
  const getImpactText = (impact) => {
    if (impact >= 4) return 'Very Positive';
    if (impact >= 2) return 'Positive';
    if (impact >= -1) return 'Neutral';
    if (impact >= -3) return 'Negative';
    return 'Very Negative';
  };
  
  // Default tooltip component
  const DefaultTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className={`p-3 ${theme.card} border ${theme.border} rounded-lg shadow-md`}>
          <p className={`font-bold ${theme.textBold}`}>
            {dataPoint[nameKey] || label}
          </p>
          <p className={theme.text}>
            <span className="font-medium">Impact:</span> {dataPoint[valueKey]}
            {dataPoint[valueKey] !== undefined && (
              <span> ({getImpactText(dataPoint[valueKey])})</span>
            )}
          </p>
          {dataPoint[countKey] !== undefined && (
            <p className={theme.text}>
              <span className="font-medium">Frequency:</span> {dataPoint[countKey]} times
            </p>
          )}
          {dataPoint[moodKey] !== undefined && (
            <p className={theme.text}>
              <span className="font-medium">Mood:</span> {dataPoint[moodKey]}/10
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  // Correlation tooltip component
  const CorrelationTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className={`p-3 ${theme.card} border ${theme.border} rounded-lg shadow-md`}>
          <p className={`font-bold ${theme.textBold}`}>{dataPoint[nameKey]}</p>
          <p className={theme.text}>
            <span className="font-medium">Frequency:</span> {dataPoint[countKey]} times
          </p>
          <p className={theme.text}>
            <span className="font-medium">Avg. Impact:</span> {dataPoint[valueKey]}
            {dataPoint[valueKey] !== undefined && (
              <span> ({getImpactText(dataPoint[valueKey])})</span>
            )}
          </p>
          <p className={theme.text}>
            <span className="font-medium">Avg. Mood:</span> {dataPoint[moodKey]}/10
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Impact chart (default) - Horizontal bar chart showing activity impact
  const renderImpactChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart 
        data={data} 
        layout="vertical" 
        margin={{ top: 5, right: 20, left: 120, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />}
        
        <XAxis 
          type="number"
          domain={[-5, 5]}
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : null}
        />
        
        <YAxis 
          type="category"
          dataKey={nameKey}
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          width={100}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : null}
        />
        
        <Tooltip content={customTooltip || <DefaultTooltip />} />
        {showLegend && <Legend />}
        
        <Bar dataKey={valueKey} name="Impact on Mood" fill={isDark ? '#60A5FA' : '#3B82F6'}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getImpactColor(entry[valueKey])} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
  
  // Frequency chart - Horizontal bar chart showing activity frequency
  const renderFrequencyChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart 
        data={data} 
        layout="vertical" 
        margin={{ top: 5, right: 20, left: 120, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />}
        
        <XAxis 
          type="number"
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : null}
        />
        
        <YAxis 
          type="category"
          dataKey={nameKey}
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          width={100}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : null}
        />
        
        <Tooltip content={customTooltip || <DefaultTooltip />} />
        {showLegend && <Legend />}
        
        <Bar dataKey={countKey} name="Frequency" fill={isDark ? '#60A5FA' : '#3B82F6'} />
      </BarChart>
    </ResponsiveContainer>
  );
  
  // Correlation chart - Shows relationship between frequency and impact
  const renderCorrelationChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />}
        
        <XAxis 
          type="number" 
          dataKey={countKey} 
          name="Frequency" 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          label={{ value: 'Frequency', position: 'insideBottom', offset: -5 }} 
        />
        
        <YAxis 
          type="number" 
          dataKey={valueKey} 
          name="Impact" 
          domain={[-5, 5]}
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          label={{ value: 'Impact', angle: -90, position: 'insideLeft' }}
        />
        
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={customTooltip || <CorrelationTooltip />} />
        {showLegend && <Legend />}
        
        <Scatter name="Activities" data={data} fill={isDark ? '#60A5FA' : '#3B82F6'}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getImpactColor(entry[valueKey])} 
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
  
  // Radar chart - Shows multiple activities and their impact in a radar view
  const renderRadarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke={isDark ? '#374151' : '#e5e7eb'} />
        <PolarAngleAxis 
          dataKey={nameKey} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[-5, 5]} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
        />
        <Radar 
          name="Impact" 
          dataKey={valueKey} 
          stroke={isDark ? '#60A5FA' : '#3B82F6'} 
          fill={isDark ? '#60A5FA' : '#3B82F6'} 
          fillOpacity={0.6} 
        />
        <Tooltip content={customTooltip || <DefaultTooltip />} />
        {showLegend && <Legend />}
      </RadarChart>
    </ResponsiveContainer>
  );
  
  // Scatter chart - Shows relationship between activity impact and mood
  const renderScatterChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />}
        
        <XAxis 
          type="number" 
          dataKey={valueKey} 
          name="Impact" 
          domain={[-5, 5]}
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          label={{ value: 'Impact on Wellbeing', position: 'insideBottom', offset: -5 }} 
        />
        
        <YAxis 
          type="number" 
          dataKey={moodKey} 
          name="Mood" 
          domain={[0, 10]}
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          label={{ value: 'Mood Level', angle: -90, position: 'insideLeft' }}
        />
        
        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={customTooltip || <DefaultTooltip />} />
        {showLegend && <Legend />}
        
        <Scatter name="Activity-Mood Correlation" data={data} fill={isDark ? '#60A5FA' : '#3B82F6'}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getImpactColor(entry[valueKey])} 
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
  
  // Render the appropriate chart based on type
  switch (type) {
    case CHART_TYPES.FREQUENCY:
      return renderFrequencyChart();
    case CHART_TYPES.CORRELATION:
      return renderCorrelationChart();
    case CHART_TYPES.RADAR:
      return renderRadarChart();
    case CHART_TYPES.SCATTER:
      return renderScatterChart();
    case CHART_TYPES.IMPACT:
    default:
      return renderImpactChart();
  }
};

// Export chart types for easy reference
export const ActivityChartTypes = CHART_TYPES;

export default ActivityChart;