import { Handle, Position } from '@xyflow/react';
import { BarChart3 } from 'lucide-react';

export const GraphNode = ({ id, data, selected }: any) => {
  const points = data.points || [
    { label: 'Jan', value: 30 },
    { label: 'Feb', value: 50 },
    { label: 'Mar', value: 80 },
    { label: 'Apr', value: 40 },
    { label: 'May', value: 90 },
  ];

  const maxVal = Math.max(...points.map((p: any) => p.value), 100);

  return (
    <div className={`w-[280px] glass-panel rounded-xl p-4 transition-colors relative ${
      selected ? 'ring-2 ring-emerald-500/50 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'hover:border-slate-500/50'
    } bg-emerald-500/5`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-emerald-500/50 border-none" />
      
      <div className="flex items-center gap-2 mb-4 border-b border-glass-stroke pb-3">
        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
          <BarChart3 size={16} />
        </div>
        <div className="text-sm font-semibold text-white truncate">
          {data.label || 'Analytics Graph'}
        </div>
      </div>

      <div className="h-32 flex items-end justify-between gap-2 pt-2 border-b border-slate-700 pb-1">
        {points.length === 0 ? (
          <div className="w-full text-center text-xs text-slate-500 italic pb-10">No data points. Add some in the Edit menu.</div>
        ) : (
          points.map((p: any, i: number) => {
            const height = Math.max((p.value / maxVal) * 100, 5);
            return (
              <div key={i} className="flex flex-col items-center flex-1 group">
                <div className="relative w-full flex justify-center">
                  <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-charcoal-800 text-slate-300 text-[10px] px-1 py-0.5 rounded border border-glass-stroke whitespace-nowrap z-10 transition-opacity">
                    {p.value}
                  </div>
                  <div 
                    className="w-full max-w-[20px] bg-emerald-500/50 hover:bg-emerald-400 rounded-t-sm transition-all"
                    style={{ height: `${height}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="flex justify-between gap-2 mt-1 px-1">
        {points.map((p: any, i: number) => (
          <div key={`label-${i}`} className="flex-1 text-center text-[9px] text-slate-400 truncate" title={p.label}>
            {p.label}
          </div>
        ))}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-emerald-500/50 border-none" />
    </div>
  );
};
