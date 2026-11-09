import { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateTimePickerProps {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  onDateChange: (d: string) => void;
  onTimeChange: (t: string) => void;
}

export function DateTimePicker({ date, time, onDateChange, onTimeChange }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => date ? parseISO(date) : new Date());
  
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const parsedDate = date ? parseISO(date) : null;

  const handleDayClick = (day: Date) => {
    onDateChange(format(day, 'yyyy-MM-dd'));
  };

  const handleTimeChange = (type: 'h' | 'm', value: string) => {
    const [h, m] = time.split(':');
    let newH = type === 'h' ? value : h;
    let newM = type === 'm' ? value : m;
    
    // basic validation
    if (newH === '') newH = '00';
    if (newM === '') newM = '00';
    
    onTimeChange(`${newH}:${newM}`);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white hover:border-indigo-500 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon size={14} className="text-indigo-400" />
          <span>{date ? format(parseISO(date), 'MMM d, yyyy') : 'Select Date'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 border-l border-slate-700 pl-2">
          <Clock size={12} />
          <span>{time || '00:00'}</span>
        </div>
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 z-[200] w-[260px] animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setViewMonth(subMonths(viewMonth, 1))} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
              <ChevronLeft size={16} />
            </button>
            <div className="text-xs font-bold text-white">
              {format(viewMonth, 'MMMM yyyy')}
            </div>
            <button onClick={() => setViewMonth(addMonths(viewMonth, 1))} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-[9px] text-center font-bold text-slate-500">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`pad-${i}`} className="h-7" />
            ))}
            {days.map((day, i) => {
              const isSelected = parsedDate && isSameDay(parsedDate, day);
              const isCurrentDay = isToday(day);
              return (
                <button
                  key={i}
                  onClick={() => handleDayClick(day)}
                  className={`h-7 rounded text-[11px] font-medium transition-all ${
                    isSelected 
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' 
                      : isCurrentDay
                        ? 'border border-indigo-500/50 text-indigo-300 bg-indigo-500/10'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Time Selector */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
              <Clock size={12} />
              Time
            </div>
            <div className="flex items-center gap-1">
              <input
                type="text"
                maxLength={2}
                value={time.split(':')[0] || '00'}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val === '' || Number(val) <= 23) handleTimeChange('h', val);
                }}
                className="w-8 text-center bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-slate-500 font-bold">:</span>
              <input
                type="text"
                maxLength={2}
                value={time.split(':')[1] || '00'}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val === '' || Number(val) <= 59) handleTimeChange('m', val);
                }}
                className="w-8 text-center bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
