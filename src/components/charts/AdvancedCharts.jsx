import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter
} from "recharts";

// Sierra Leone themed color palette
export const SL_COLORS = {
  primary: '#1EB053',
  secondary: '#0072C6', 
  gold: '#D4AF37',
  navy: '#0F1F3C',
  gradient: ['#1EB053', '#0072C6'],
  chart: ['#1EB053', '#0072C6', '#D4AF37', '#9333EA', '#EC4899', '#F59E0B', '#10B981', '#6366F1', '#EF4444', '#06B6D4']
};

// Custom tooltip with modern styling
const CustomTooltip = ({ active, payload, label, formatter, prefix = "Le " }) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 p-4 min-w-[180px]">
      <p className="text-sm font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-100">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4 py-1">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full shadow-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.name}</span>
          </div>
          <span className="text-sm font-bold text-gray-900">
            {formatter ? formatter(entry.value) : `${prefix}${entry.value?.toLocaleString()}`}
          </span>
        </div>
      ))}
    </div>
  );
};

// Advanced Gradient Area Chart
export function GradientAreaChart({ 
  data, 
  dataKey = "value", 
  xKey = "date",
  color = SL_COLORS.primary,
  secondaryColor = SL_COLORS.secondary,
  height = 300,
  showGrid = true,
  formatter,
  areaOpacity = 0.3,
  strokeWidth = 3
}) {
  const gradientId = `gradient-${dataKey}-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={areaOpacity} />
            <stop offset="50%" stopColor={secondaryColor} stopOpacity={areaOpacity * 0.5} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />}
        <XAxis 
          dataKey={xKey} 
          tick={{ fontSize: 11, fill: '#6B7280' }} 
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis 
          tick={{ fontSize: 11, fill: '#6B7280' }} 
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
        />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        <Area 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color}
          strokeWidth={strokeWidth}
          fill={`url(#${gradientId})`}
          filter="url(#glow)"
          dot={false}
          activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Multi-line Gradient Area Chart
export function MultiAreaChart({
  data,
  lines = [],
  xKey = "date",
  height = 300,
  showGrid = true,
  formatter
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          {lines.map((line, i) => (
            <linearGradient key={i} id={`gradient-multi-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line.color || SL_COLORS.chart[i]} stopOpacity={0.4} />
              <stop offset="100%" stopColor={line.color || SL_COLORS.chart[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />}
        <XAxis 
          dataKey={xKey} 
          tick={{ fontSize: 11, fill: '#6B7280' }} 
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis 
          tick={{ fontSize: 11, fill: '#6B7280' }} 
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
        />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        <Legend 
          wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
          iconType="circle"
          iconSize={6}
        />
        {lines.map((line, i) => (
          <Area
            key={i}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name || line.dataKey}
            stroke={line.color || SL_COLORS.chart[i]}
            strokeWidth={2}
            fill={`url(#gradient-multi-${i})`}
            dot={false}
            activeDot={{ r: 5, fill: line.color || SL_COLORS.chart[i], stroke: '#fff', strokeWidth: 2 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Modern Bar Chart with Gradient
export function GradientBarChart({
  data,
  dataKey = "value",
  xKey = "name",
  height = 300,
  horizontal = false,
  showGrid = true,
  formatter,
  barSize = 40,
  colors = SL_COLORS.gradient,
  radius = [8, 8, 0, 0]
}) {
  const gradientId = `bar-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart 
        data={data} 
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 5, right: 5, left: horizontal ? 0 : -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2={horizontal ? "1" : "0"} y2={horizontal ? "0" : "1"}>
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={!horizontal} vertical={horizontal} />}
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
            <YAxis dataKey={xKey} type="category" width={80} tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
            <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
          </>
        )}
        <Tooltip content={<CustomTooltip formatter={formatter} />} cursor={{ fill: 'rgba(0,0,0,0.05)', radius: 8 }} />
        <Bar 
          dataKey={dataKey} 
          fill={`url(#${gradientId})`}
          radius={horizontal ? [0, 8, 8, 0] : radius}
          barSize={barSize}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Multi-color Bar Chart
export function ColorfulBarChart({
  data,
  dataKey = "value",
  xKey = "name",
  height = 300,
  horizontal = false,
  showGrid = true,
  formatter,
  barSize = 40,
  colors = SL_COLORS.chart
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart 
        data={data} 
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 5, right: 5, left: horizontal ? 0 : -20, bottom: 0 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
            <YAxis dataKey={xKey} type="category" width={80} tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
            <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
          </>
        )}
        <Tooltip content={<CustomTooltip formatter={formatter} />} cursor={{ fill: 'rgba(0,0,0,0.05)', radius: 8 }} />
        <Bar dataKey={dataKey} barSize={barSize} radius={horizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Modern Donut Chart
export function DonutChart({
  data,
  dataKey = "value",
  nameKey = "name",
  height = 300,
  innerRadius = 50,
  outerRadius = 80,
  formatter,
  showLabels = false,
  colors = SL_COLORS.chart,
  centerLabel,
  centerValue
}) {
  const total = data.reduce((sum, item) => sum + (item[dataKey] || 0), 0);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          {colors.map((color, i) => (
            <linearGradient key={i} id={`pie-gradient-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0.7} />
            </linearGradient>
          ))}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.15"/>
          </filter>
        </defs>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={3}
          dataKey={dataKey}
          nameKey={nameKey}
          filter="url(#shadow)"
          label={showLabels ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
          labelLine={showLabels ? { stroke: '#9CA3AF', strokeWidth: 1 } : false}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`url(#pie-gradient-${index % colors.length})`}
              stroke="white"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip 
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const { name, value } = payload[0];
            const percent = ((value / total) * 100).toFixed(1);
            return (
              <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 p-4">
                <p className="font-semibold text-gray-800">{name}</p>
                <p className="text-lg font-bold" style={{ color: payload[0].payload.fill?.replace('url(#pie-gradient-', SL_COLORS.chart[0]) }}>
                  {formatter ? formatter(value) : `Le ${value.toLocaleString()}`}
                </p>
                <p className="text-sm text-gray-500">{percent}% of total</p>
              </div>
            );
          }}
        />
        {(centerLabel || centerValue) && (
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            {centerValue && <tspan x="50%" dy="-0.5em" className="text-2xl font-bold fill-gray-800">{centerValue}</tspan>}
            {centerLabel && <tspan x="50%" dy="1.5em" className="text-sm fill-gray-500">{centerLabel}</tspan>}
          </text>
        )}
        <Legend 
          layout="horizontal"
          align="center"
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
          formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Modern Line Chart with Glow Effect
export function GlowLineChart({
  data,
  lines = [],
  xKey = "date",
  height = 300,
  showGrid = true,
  formatter,
  showDots = false
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          {lines.map((line, i) => (
            <filter key={i} id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor={line.color || SL_COLORS.chart[i]} floodOpacity="0.5" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />}
        <XAxis 
          dataKey={xKey} 
          tick={{ fontSize: 11, fill: '#6B7280' }} 
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis 
          tick={{ fontSize: 11, fill: '#6B7280' }} 
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
        />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        <Legend 
          wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
          iconType="circle"
          iconSize={6}
        />
        {lines.map((line, i) => (
          <Line
            key={i}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name || line.dataKey}
            stroke={line.color || SL_COLORS.chart[i]}
            strokeWidth={3}
            dot={showDots ? { fill: line.color || SL_COLORS.chart[i], stroke: '#fff', strokeWidth: 2, r: 4 } : false}
            activeDot={{ r: 6, fill: line.color || SL_COLORS.chart[i], stroke: '#fff', strokeWidth: 3 }}
            filter={`url(#glow-${i})`}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Advanced Radar Chart
export function AdvancedRadarChart({
  data,
  dataKeys = [],
  angleKey = "subject",
  height = 300,
  colors = SL_COLORS.chart
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
        <defs>
          {dataKeys.map((key, i) => (
            <linearGradient key={i} id={`radar-gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[i]} stopOpacity={0.6} />
              <stop offset="100%" stopColor={colors[i]} stopOpacity={0.1} />
            </linearGradient>
          ))}
        </defs>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis dataKey={angleKey} tick={{ fontSize: 11, fill: '#6B7280' }} />
        <PolarRadiusAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} />
        {dataKeys.map((key, i) => (
          <Radar
            key={i}
            name={key.name || key.dataKey}
            dataKey={key.dataKey}
            stroke={colors[i]}
            strokeWidth={2}
            fill={`url(#radar-gradient-${i})`}
            dot={{ fill: colors[i], stroke: '#fff', strokeWidth: 2, r: 4 }}
          />
        ))}
        <Legend 
          wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
          iconType="circle"
          iconSize={6}
        />
        <Tooltip 
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 p-3">
                {payload.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm">{entry.name}: <span className="font-bold">{entry.value}</span></span>
                  </div>
                ))}
              </div>
            );
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// Progress Ring Chart
export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color = SL_COLORS.primary,
  secondaryColor = SL_COLORS.secondary,
  label,
  sublabel
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={`progress-gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#progress-gradient-${label})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">{Math.round(progress * 100)}%</span>
        {label && <span className="text-xs text-gray-500 mt-1">{label}</span>}
      </div>
    </div>
  );
}

// Stacked Bar Chart
export function StackedBarChart({
  data,
  bars = [],
  xKey = "name",
  height = 300,
  showGrid = true,
  formatter,
  colors = SL_COLORS.chart
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          {bars.map((bar, i) => (
            <linearGradient key={i} id={`stacked-gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={bar.color || colors[i]} stopOpacity={1} />
              <stop offset="100%" stopColor={bar.color || colors[i]} stopOpacity={0.7} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />}
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} axisLine={{ stroke: '#E5E7EB' }} />
        <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip formatter={formatter} />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
        <Legend wrapperStyle={{ paddingTop: 10, fontSize: 11 }} iconType="circle" iconSize={6} />
        {bars.map((bar, i) => (
          <Bar
            key={i}
            dataKey={bar.dataKey}
            name={bar.name || bar.dataKey}
            stackId="stack"
            fill={`url(#stacked-gradient-${i})`}
            radius={i === bars.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// Sparkline Chart (mini inline chart)
export function SparklineChart({
  data,
  dataKey = "value",
  width = 100,
  height = 30,
  color = SL_COLORS.primary,
  showArea = true
}) {
  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {showArea && (
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill="url(#sparkline-gradient)"
            dot={false}
          />
        )}
        {!showArea && (
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}