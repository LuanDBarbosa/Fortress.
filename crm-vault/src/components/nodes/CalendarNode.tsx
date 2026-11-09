import { useState, useMemo, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isToday, isBefore, startOfDay } from 'date-fns';
import { useCanvasStore } from '../../store/canvasStore';

export const CalendarNode = ({ id, data, selected }: any) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const updateNodeStyle = useCanvasStore((state) => state.updateNodeStyle);
  const envNodes = (useCanvasStore((state) => state.activeEnvId ? state.envNodes[state.activeEnvId] : state.globalNodes) || []) as any[];

  // Fix invisible boundary caused by previous explicit resizes
  useEffect(() => {
    updateNodeStyle(id, { width: undefined, height: undefined });
  }, [id, updateNodeStyle]);

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

  const manualDates = useMemo(() => {
    return (data.manualDates || []).map((d: any) => ({ ...d, date: parseISO(d.date) }));
  }, [data.manualDates]);

  const allDates = [...autoDates, ...manualDates].sort((a, b) => a.date.getTime() - b.date.getTime());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter events to show
  const eventsToShow = useMemo(() => {
    if (selectedDate) {
      return allDates.filter(d => isSameDay(d.date, selectedDate));
    }
    // Otherwise show upcoming events (from today onwards)
    const today = startOfDay(new Date());
    return allDates.filter(d => !isBefore(startOfDay(d.date), today)).slice(0, 4); // Show next 4
  }, [selectedDate, allDates]);

  const handleDayClick = (day: Date) => {
    if (selectedDate && isSameDay(selectedDate, day)) {
      setSelectedDate(null); // deselect
    } else {
      setSelectedDate(day);
    }
  };

  return (
    <div className={`w-[320px] glass-panel rounded-xl p-4 transition-colors relative ${
      selected ? 'ring-2 ring-indigo-500/50 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'hover:border-slate-500/50'
    } bg-indigo-500/5`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-indigo-500/50 border-none" />
      
      {/* Header */}
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
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="nodrag hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-medium w-20 text-center">
            {format(currentMonth, 'MMM yyyy')}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="nodrag hover:text-white transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
        
      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-[10px] text-center font-bold text-slate-500">{day}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`pad-${i}`} className="h-9 rounded-lg bg-transparent" />
          ))}
          
          {days.map((day, i) => {
            const dayEvents = allDates.filter(d => isSameDay(d.date, day));
            const isSelected = selectedDate && isSameDay(selectedDate, day);
            const isTodayDate = isToday(day);
            
            return (
              <button 
                key={i} 
                onClick={() => handleDayClick(day)}
                className={`nodrag h-8 flex flex-col items-center justify-center rounded text-xs relative group transition-all duration-200 ${
                  isSelected ? 'ring-1 ring-indigo-400 bg-indigo-500/20 text-indigo-300' 
                  : isTodayDate ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30' 
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{format(day, 'd')}</span>
                
                {/* Dots indicator */}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 flex gap-0.5 pointer-events-none">
                    {dayEvents.slice(0, 3).map((_, j) => (
                      <div key={j} className="w-1 h-1 rounded-full bg-indigo-400" />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

      {/* Action Bar */}
      <div className="mt-4 pt-3 border-t border-glass-stroke">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Upcoming Events'}
        </span>
      </div>

      {/* Events List */}
      <div className="mt-2 max-h-[140px] overflow-y-auto custom-scrollbar nodrag">
        {eventsToShow.length === 0 ? (
          <div className="py-4 text-center text-[11px] text-slate-500">
            No events {selectedDate ? 'on this day' : 'coming up'}.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {eventsToShow.map((evt, i) => (
              <div key={i} className="p-2 rounded bg-slate-800/50 flex items-center gap-3">
                <div className="w-8 text-center shrink-0">
                  <div className="text-[9px] font-bold text-indigo-400 uppercase leading-none mb-1">
                    {format(evt.date, 'MMM')}
                  </div>
                  <div className="text-base font-black text-white leading-none">
                    {format(evt.date, 'dd')}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate" title={evt.label}>
                    {evt.label}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                    <Clock size={10} />
                    {format(evt.date, 'HH:mm')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-indigo-500/50 border-none" />
    </div>
  );
};
