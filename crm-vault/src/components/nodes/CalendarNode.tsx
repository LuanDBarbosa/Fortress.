import { useState, useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isToday } from 'date-fns';
import { useCanvasStore } from '../../store/canvasStore';

export const CalendarNode = ({ id, data, selected }: any) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Pull dates from other nodes in the same environment (or global)
  const envNodes = useCanvasStore((state) => state.activeEnvId ? state.envNodes[state.activeEnvId] : state.globalNodes) || [];
  
  const autoDates = useMemo(() => {
    const dates: { date: Date, label: string }[] = [];
    envNodes.forEach(node => {
      if (node.type === 'briefingNode' && node.data?.fields) {
        node.data.fields.forEach((f: any) => {
          if (f.type === 'date' && f.value) {
            try {
              dates.push({ date: parseISO(f.value), label: `${node.data.label || 'Briefing'}: ${f.label}` });
            } catch (e) {}
          }
        });
      }
    });
    return dates;
  }, [envNodes]);

  const manualDates = (data.manualDates || []).map((d: any) => ({ ...d, date: parseISO(d.date) }));
  const allDates = [...autoDates, ...manualDates];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className={`w-[320px] glass-panel rounded-xl p-4 transition-colors relative ${
      selected ? 'ring-2 ring-indigo-500/50 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'hover:border-slate-500/50'
    } bg-indigo-500/5`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-indigo-500/50 border-none" />
      
      <div className="flex items-center justify-between mb-4 border-b border-glass-stroke pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <CalendarIcon size={16} />
          </div>
          <div className="text-sm font-semibold text-white truncate">
            {data.label || 'Calendar'}
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="hover:text-white"><ChevronLeft size={16} /></button>
          <span className="text-xs font-medium w-20 text-center">{format(currentMonth, 'MMM yyyy')}</span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="hover:text-white"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-[10px] text-center font-bold text-slate-500">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`pad-${i}`} className="h-8 rounded bg-transparent" />
        ))}
        
        {days.map((day, i) => {
          const dayEvents = allDates.filter(d => isSameDay(d.date, day));
          return (
            <div 
              key={i} 
              className={`h-8 flex flex-col items-center justify-center rounded text-xs relative group ${
                isToday(day) ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {format(day, 'd')}
              {dayEvents.length > 0 && (
                <>
                  <div className="absolute bottom-1 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((_, j) => (
                      <div key={j} className="w-1 h-1 rounded-full bg-indigo-400" />
                    ))}
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex flex-col bg-charcoal-800 border border-glass-stroke p-2 rounded shadow-xl z-50 min-w-[120px]">
                    {dayEvents.map((evt, j) => (
                      <div key={j} className="text-[10px] text-slate-300 whitespace-nowrap">{evt.label}</div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-indigo-500/50 border-none" />
    </div>
  );
};
