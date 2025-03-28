// src/components/dashboard/charts/StressChart.js
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
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useTheme } from '../../../context/ThemeContext';

// Stress chart types
const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  AREA: 'area',
  PIE: 'pie',
  SOURCES: 'sources',
  SYMPTOMS: 'symptoms'
};

const StressChart = ({ 
  data, 
  type = CHART_TYPES.AREA, 
  height = 300, 
  showLegend = true,
  dateKey = 'date',
  valueKey = 'level',
  labelKey = 'label',
  countKey = 'count',
  showGrid = true,
  xAxisLabel = '',
  yAxisLabel = '',
  showThresholds = false,
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
    if (level <= 2) return '#4CAF50'; // Green - Very Calm
    if (level <= 4) return '#8BC34A'; // Light Green - Calm
    if (level <= 6) return '#FFC107'; // Yellow - Moderate
    if (level <= 8) return '#FF9800'; // Orange - Stressed
    return '#F44336'; // Red - Very Stressed
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
            <span className="font-medium">Stress Level:</span> {dataPoint[valueKey]}/10
          </p>
          <p className={theme.text}>
            <span className="font-medium">Status:</span> {getStressLevelText(dataPoint[valueKey])}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Sources & Symptoms tooltip component
  const CategoryTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 ${theme.card} border ${theme.border} rounded-lg shadow-md`}>
          <p className={`font-bold ${theme.textBold}`}>{payload[0].payload.name}</p>
          <p className={theme.text}>
            <span className="font-medium">Count:</span> {payload[0].value}
          </p>
          {payload[0].payload.percentage && (
            <p className={theme.text}>
              <span className="font-medium">Percentage:</span> {payload[0].payload.percentage}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  // Area chart (default) - Shows stress levels over time with filled area
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
          domain={[0, 10]} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : null}
        />
        
        {showThresholds && (
          <>
            <ReferenceLine y={4} stroke="#8BC34A" strokeDasharray="3 3" label="Low" />
            <ReferenceLine y={7} stroke="#FF9800" strokeDasharray="3 3" label="High" />
          </>
        )}
        
        <Tooltip content={customTooltip || <DefaultTooltip />} />
        {showLegend && <Legend />}
        
        <defs>
          <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={isDark ? "#ef4444" : "#ef4444"} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={isDark ? "#ef4444" : "#ef4444"} stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        
        <Area 
          type="monotone" 
          dataKey={valueKey} 
          name="Stress Level" 
          stroke={isDark ? "#ef4444" : "#ef4444"} 
          fillOpacity={1} 
          fill="url(#stressGradient)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
  
  // Line chart - Simple display of stress levels over time
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
          domain={[0, 10]} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : null}
        />
        
        {showThresholds && (
          <>
            <ReferenceLine y={4} stroke="#8BC34A" strokeDasharray="3 3" label="Low" />
            <ReferenceLine y={7} stroke="#FF9800" strokeDasharray="3 3" label="High" />
          </>
        )}
        
        <Tooltip content={customTooltip || <DefaultTooltip />} />
        {showLegend && <Legend />}
        
        <Line 
          type="monotone" 
          dataKey={valueKey} 
          name="Stress Level" 
          stroke={isDark ? "#ef4444" : "#ef4444"} 
          strokeWidth={2}
          activeDot={{ r: 8 }}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
  
  // Bar chart - Shows stress levels by day/category
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
          domain={[0, 10]} 
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : null}
        />
        
        {showThresholds && (
          <>
            <ReferenceLine y={4} stroke="#8BC34A" strokeDasharray="3 3" label="Low" />
            <ReferenceLine y={7} stroke="#FF9800" strokeDasharray="3 3" label="High" />
          </>
        )}
        
        <Tooltip content={customTooltip || <DefaultTooltip />} />
        {showLegend && <Legend />}
        
        <Bar dataKey={valueKey} name="Stress Level" fill={isDark ? "#ef4444" : "#ef4444"}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getStressLevelColor(entry[valueKey])} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
  
  // Pie chart - Shows distribution of stress levels
  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          dataKey={valueKey}
          nameKey={labelKey}
          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getStressLevelColor(
                entry[valueKey] || 
                (entry.label === 'Very Calm' ? 1 : 
                 entry.label === 'Calm' ? 3 : 
                 entry.label === 'Moderate' ? 5 : 
                 entry.label === 'Stressed' ? 7 : 
                 entry.label === 'Very Stressed' ? 9 : 5)
              )} 
            />
          ))}
        </Pie>
        <Tooltip content={customTooltip || <DefaultTooltip />} />
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
  
  // Sources chart - Horizontal bar chart showing stress sources
  const renderSourcesChart = () => (
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
        />
        
        <YAxis 
          type="category"
          dataKey="name"
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          width={100}
        />
        
        <Tooltip content={customTooltip || <CategoryTooltip />} />
        {showLegend && <Legend />}
        
        <Bar dataKey={countKey || 'count'} name="Occurrences" fill={isDark ? "#f87171" : "#ef4444"} />
      </BarChart>
    </ResponsiveContainer>
  );
  
  // Symptoms chart - Horizontal bar chart showing stress symptoms
  const renderSymptomsChart = () => (
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
        />
        
        <YAxis 
          type="category"
          dataKey="name"
          tick={{ fill: isDark ? '#e5e7eb' : '#374151', fontSize: 12 }}
          tickMargin={10}
          width={100}
        />
        
        <Tooltip content={customTooltip || <CategoryTooltip />} />
        {showLegend && <Legend />}
        
        <Bar dataKey={countKey || 'count'} name="Occurrences" fill={isDark ? "#a3e635" : "#84cc16"} />
      </BarChart>
    </ResponsiveContainer>
  );
  
  // Render the appropriate chart based on type
  switch (type) {
    case CHART_TYPES.LINE:
      return renderLineChart();
    case CHART_TYPES.BAR:
      return renderBarChart();
    case CHART_TYPES.PIE:
      return renderPieChart();
    case CHART_TYPES.SOURCES:
      return renderSourcesChart();
    case CHART_TYPES.SYMPTOMS:
      return renderSymptomsChart();
    case CHART_TYPES.AREA:
    default:
      return renderAreaChart();
  }
};

// Export chart types for easy reference
export const StressChartTypes = CHART_TYPES;

export default StressChart;