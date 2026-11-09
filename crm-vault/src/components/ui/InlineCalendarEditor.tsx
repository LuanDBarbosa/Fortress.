import { useState, useMemo } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, Clock } from 'lucide-react';

interface InlineCalendarEditorProps {
  manualDates: any[];
  onUpdate: (newDates: any[]) => void;
}

export function InlineCalendarEditor({ manualDates, onUpdate }: InlineCalendarEditorProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Default to today
  
  const [newEvtTime, setNewEvtTime] = useState('12:00');
  const [newEvtLabel, setNewEvtLabel] = useState('');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const parsedEvents = useMemo(() => {
    return (manualDates || []).map(d => ({ ...d, parsedDate: parseISO(d.date) }));
  }, [manualDates]);

  const selectedDayEvents = useMemo(() => {
    return parsedEvents.filter(evt => isSameDay(evt.parsedDate, selectedDate));
  }, [parsedEvents, selectedDate]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  const handleTimeChange = (type: 'h' | 'm', value: string) => {
    const [h, m] = newEvtTime.split(':');
    let newH = type === 'h' ? value : h;
    let newM = type === 'm' ? value : m;
    if (newH === '') newH = '00';
    if (newM === '') newM = '00';
    setNewEvtTime(`${newH}:${newM}`);
  };

  const handleAddEvent = () => {
    if (!newEvtLabel.trim()) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const fullDateTime = `${dateStr}T${newEvtTime}`;
    
    onUpdate([
      ...(manualDates || []),
      { id: `evt-${Date.now()}`, date: fullDateTime, label: newEvtLabel.trim() }
    ]);
    
    setNewEvtLabel('');
  };

  const handleDeleteEvent = (id: string) => {
    onUpdate((manualDates || []).filter(evt => evt.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Calendar Grid Section */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-bold text-white tracking-wide">
            {format(currentMonth, 'MMMM yyyy')}
          </div>
          <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1 text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">
              Today
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-[10px] text-center font-bold text-slate-500 uppercase tracking-wider">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`pad-${i}`} className="h-10 rounded-lg bg-transparent" />
          ))}
          {days.map((day, i) => {
            const dayEvents = parsedEvents.filter(e => isSameDay(e.parsedDate, day));
            const isSelected = isSameDay(selectedDate, day);
            const isCurrentDay = isToday(day);
            
            return (
              <button
                key={i}
                onClick={() => handleDayClick(day)}
                className={`h-10 flex flex-col items-center justify-center rounded-lg text-xs relative transition-all ${
                  isSelected 
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20 font-bold ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950' 
                    : isCurrentDay
                      ? 'border border-indigo-500/50 text-indigo-300 bg-indigo-500/10 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-900/50'
                }`}
              >
                <span>{format(day, 'd')}</span>
                
                {/* Event Dots */}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1.5 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((_, j) => (
                      <div key={j} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-400'}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-slate-950/50 border-b border-slate-800 p-3 flex items-center gap-2">
          <CalendarIcon size={16} className="text-indigo-400" />
          <span className="text-sm font-bold text-white">
            {format(selectedDate, 'EEEE, MMMM do')}
          </span>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Add Event Form */}
          <div className="flex gap-2">
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg focus-within:border-indigo-500 transition-colors overflow-hidden shrink-0">
              <input
                type="text"
                maxLength={2}
                value={newEvtTime.split(':')[0] || '00'}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val === '' || Number(val) <= 23) handleTimeChange('h', val);
                }}
                className="w-10 text-center bg-transparent py-2 text-sm text-white focus:outline-none placeholder:text-slate-600"
                placeholder="HH"
              />
              <span className="text-slate-500 font-bold">:</span>
              <input
                type="text"
                maxLength={2}
                value={newEvtTime.split(':')[1] || '00'}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val === '' || Number(val) <= 59) handleTimeChange('m', val);
                }}
                className="w-10 text-center bg-transparent py-2 text-sm text-white focus:outline-none placeholder:text-slate-600"
                placeholder="MM"
              />
            </div>
            
            <input 
              type="text"
              value={newEvtLabel}
              onChange={(e) => setNewEvtLabel(e.target.value)}
              placeholder="Event Description..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddEvent()}
              className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
            
            <button
              onClick={handleAddEvent}
              disabled={!newEvtLabel.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus size={16} /> Save
            </button>
          </div>

          {/* Events List for Selected Day */}
          <div className="space-y-2">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 italic bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                No events scheduled for this day.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedDayEvents
                  .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
                  .map(evt => (
                    <div key={evt.id} className="group flex items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-slate-900 text-indigo-400 font-mono text-xs font-bold px-2 py-1 rounded border border-slate-800 flex items-center gap-1 shrink-0">
                          <Clock size={12} />
                          {format(evt.parsedDate, 'HH:mm')}
                        </div>
                        <span className="text-sm font-semibold text-white truncate">{evt.label}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteEvent(evt.id)} 
                        className="text-slate-500 opacity-0 group-hover:opacity-100 shrink-0 hover:text-red-400 p-1.5 bg-slate-900 rounded-lg transition-all"
                        title="Delete Event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
