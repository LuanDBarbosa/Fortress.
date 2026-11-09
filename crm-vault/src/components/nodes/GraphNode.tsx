import { useRef, useState, useEffect } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { BarChart3, LineChart as LineChartIcon, PieChart, TrendingUp, TrendingDown, Wifi, Unplug } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';

const THEMES: Record<string, any> = {
  emerald: {
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/30',
    ring: 'ring-emerald-500/50',
    shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    iconBg: 'bg-emerald-500/20',
    iconText: 'text-emerald-400',
    bar: 'bg-emerald-500/50 hover:bg-emerald-400',
    handle: '!bg-emerald-500/50',
    hex: '#10b981',
    resizer: '#10b981'
  },
  purple: {
    bg: 'bg-purple-500/5',
    border: 'border-purple-500/30',
    ring: 'ring-purple-500/50',
    shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]',
    iconBg: 'bg-purple-500/20',
    iconText: 'text-purple-400',
    bar: 'bg-purple-500/50 hover:bg-purple-400',
    handle: '!bg-purple-500/50',
    hex: '#a855f7',
    resizer: '#a855f7'
  },
  blue: {
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/30',
    ring: 'ring-blue-500/50',
    shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]',
    iconBg: 'bg-blue-500/20',
    iconText: 'text-blue-400',
    bar: 'bg-blue-500/50 hover:bg-blue-400',
    handle: '!bg-blue-500/50',
    hex: '#3b82f6',
    resizer: '#3b82f6'
  },
  red: {
    bg: 'bg-red-500/5',
    border: 'border-red-500/30',
    ring: 'ring-red-500/50',
    shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]',
    iconBg: 'bg-red-500/20',
    iconText: 'text-red-400',
    bar: 'bg-red-500/50 hover:bg-red-400',
    handle: '!bg-red-500/50',
    hex: '#ef4444',
    resizer: '#ef4444'
  },
  amber: {
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/30',
    ring: 'ring-amber-500/50',
    shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    iconBg: 'bg-amber-500/20',
    iconText: 'text-amber-400',
    bar: 'bg-amber-500/50 hover:bg-amber-400',
    handle: '!bg-amber-500/50',
    hex: '#f59e0b',
    resizer: '#f59e0b'
  }
};

const LineChartSVG = ({ points, width, height, colorHex }: any) => {
  if (points.length < 2 || width <= 0 || height <= 0) return null;
  const maxVal = Math.max(...points.map((p: any) => p.value), 1) * 1.1; 
  const stepX = width / (points.length - 1);
  
  let d = `M 0,${height - (points[0].value / maxVal) * height}`;
  for (let i = 1; i < points.length; i++) {
    const prevX = (i - 1) * stepX;
    const prevY = height - (points[i - 1].value / maxVal) * height;
    const currX = i * stepX;
    const currY = height - (points[i].value / maxVal) * height;
    
    const cp1x = prevX + (currX - prevX) / 2;
    const cp1y = prevY;
    const cp2x = prevX + (currX - prevX) / 2;
    const cp2y = currY;
    
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${currX},${currY}`;
  }

  const fillD = `${d} L ${width},${height} L 0,${height} Z`;
  const gradId = `gradient-${colorHex.replace('#', '')}`;

  return (
    <svg width={width} height={height} className="overflow-visible absolute inset-0">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorHex} stopOpacity="0.4" />
          <stop offset="100%" stopColor={colorHex} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradId})`} />
      <path d={d} fill="none" stroke={colorHex} strokeWidth="3" style={{ filter: `drop-shadow(0px 0px 6px ${colorHex}88)` }} />
      {points.map((p: any, i: number) => {
        const cx = i * stepX;
        const cy = height - (p.value / maxVal) * height;
        return (
          <circle key={i} cx={cx} cy={cy} r="4" fill="#0F1115" stroke={colorHex} strokeWidth="2" />
        );
      })}
    </svg>
  );
};

const DonutChartSVG = ({ points, width, height, colorHex }: any) => {
  if (width <= 0 || height <= 0) return null;
  const size = Math.min(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const radius = size * 0.35;
  const strokeWidth = size * 0.15;
  
  const total = points.reduce((sum: number, p: any) => sum + Math.max(0, p.value), 0) || 1;
  let currentAngle = -Math.PI / 2;

  return (
    <svg width={width} height={height} className="overflow-visible absolute inset-0">
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={`${colorHex}22`} strokeWidth={strokeWidth} />
      {points.map((p: any, i: number) => {
        const val = Math.max(0, p.value);
        const sliceAngle = (val / total) * 2 * Math.PI;
        if (sliceAngle === 0) return null;
        
        const x1 = cx + radius * Math.cos(currentAngle);
        const y1 = cy + radius * Math.sin(currentAngle);
        currentAngle += sliceAngle;
        const x2 = cx + radius * Math.cos(currentAngle);
        const y2 = cy + radius * Math.sin(currentAngle);
        
        const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
        const opacity = Math.max(1 - (i * 0.2), 0.2);
        const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
        
        if (sliceAngle > 2 * Math.PI * 0.999) {
          return <circle key={i} cx={cx} cy={cy} r={radius} fill="none" stroke={colorHex} strokeWidth={strokeWidth} strokeOpacity={opacity} />;
        }
        
        return (
          <path key={i} d={d} fill="none" stroke={colorHex} strokeWidth={strokeWidth} strokeOpacity={opacity} />
        );
      })}
      
      {/* Center text for Donut */}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={size * 0.15} fontWeight="bold">
        {points.length > 0 ? points[points.length - 1].value : 0}
      </text>
    </svg>
  );
};

export const GraphNode = ({ id, data, selected }: any) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  const points = data.points || [
    { label: 'Jan', value: 30 },
    { label: 'Feb', value: 50 },
    { label: 'Mar', value: 80 },
    { label: 'Apr', value: 40 },
    { label: 'May', value: 90 },
  ];

  const chartType = data.chartType || 'bar';
  const themeKey = data.themeColor || 'emerald';
  const theme = THEMES[themeKey] || THEMES.emerald;
  const isLive = data.dataSource === 'live';

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setChartSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);

  let trendStr = '';
  let trendUp = true;
  if (points.length >= 2) {
    const first = points[0].value;
    const last = points[points.length - 1].value;
    if (first > 0) {
      const diff = ((last - first) / first) * 100;
      trendStr = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
      trendUp = diff >= 0;
    }
  }

  const maxVal = Math.max(...points.map((p: any) => p.value), 100);

  return (
    <>
      <NodeResizer 
        color={theme.resizer} 
        isVisible={selected} 
        minWidth={280} 
        minHeight={200} 
        handleClassName="w-3 h-3 rounded-sm border-none nodrag z-[100]"
        lineClassName="z-[100]"
        onResizeEnd={(_e, params) => {
          useCanvasStore.getState().updateNodeStyle(id, { width: params.width, height: params.height });
          useCanvasStore.getState().onNodesChange([{ type: 'position', id, position: { x: params.x, y: params.y } } as any]);
          useCanvasStore.getState().commitHistory();
        }}
      />
      
      <div 
        className={`w-full h-full glass-panel rounded-xl p-4 transition-colors relative flex flex-col ${
          selected ? `ring-2 ${theme.ring} ${theme.border} ${theme.shadow}` : `hover:border-slate-500/50 border-glass-stroke`
        } ${theme.bg}`}
        style={{ minWidth: 280, minHeight: 200 }}
      >
        <Handle type="target" position={Position.Left} className={`w-2 h-2 ${theme.handle} border-none`} />
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-4 border-b border-glass-stroke pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${theme.iconBg} ${theme.iconText}`}>
              {chartType === 'line' ? <LineChartIcon size={16} /> : chartType === 'donut' ? <PieChart size={16} /> : <BarChart3 size={16} />}
            </div>
            <div className="text-sm font-semibold text-white truncate max-w-[120px]">
              {data.label || 'Analytics Graph'}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <div className={`text-[10px] flex items-center gap-1 font-geist uppercase tracking-widest ${isLive ? 'text-blue-400' : 'text-slate-500'}`}>
              {isLive ? <Wifi size={10} /> : <Unplug size={10} />}
              {isLive ? 'Live' : 'Static'}
            </div>
            {trendStr && (
              <div className={`text-xs font-bold flex items-center gap-1 ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {trendStr}
                {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              </div>
            )}
          </div>
        </div>

        {/* CHART CONTAINER */}
        <div className="flex-1 relative w-full h-full pb-6" ref={chartContainerRef}>
          {points.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 italic">No data points. Add some in the Edit menu.</div>
          ) : (
            <>
              {chartType === 'line' && <LineChartSVG points={points} width={chartSize.width} height={chartSize.height} colorHex={theme.hex} />}
              {chartType === 'donut' && <DonutChartSVG points={points} width={chartSize.width} height={chartSize.height} colorHex={theme.hex} />}
              
              {(!chartType || chartType === 'bar') && (
                <div className="absolute inset-0 flex items-end justify-between gap-2 pt-2">
                  {points.map((p: any, i: number) => {
                    const h = Math.max((p.value / maxVal) * 100, 5);
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end">
                        <div className="relative w-full flex justify-center h-full items-end">
                          <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-charcoal-800 text-slate-300 text-[10px] px-1 py-0.5 rounded border border-glass-stroke whitespace-nowrap z-10 transition-opacity">
                            {p.value}
                          </div>
                          <div 
                            className={`w-full max-w-[30px] ${theme.bar} rounded-t-sm transition-all`}
                            style={{ height: `${h}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* X-AXIS LABELS */}
          {chartType !== 'donut' && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-between gap-2 pt-2 border-t border-slate-700/50">
              {points.map((p: any, i: number) => (
                <div key={`label-${i}`} className="flex-1 text-center text-[9px] text-slate-400 truncate" title={p.label}>
                  {p.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <Handle type="source" position={Position.Right} className={`w-2 h-2 ${theme.handle} border-none`} />
      </div>
    </>
  );
};
