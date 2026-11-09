import { Handle, Position } from '@xyflow/react';
import { Info, Tag, Calendar, CheckSquare, AlignLeft } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';

export const BriefingNode = ({ id, data, selected }: any) => {
  const updateNode = useCanvasStore((state) => state.updateNode);

  const fields = data.fields || (data.description ? [{ id: 'desc', label: 'Overview', value: data.description, type: 'text' }] : []);

  const updateFieldValue = (fieldId: string, newValue: any) => {
    updateNode(id, { fields: fields.map((f: any) => f.id === fieldId ? { ...f, value: newValue } : f) });
  };

  const tags = data.tags || [];

  return (
    <div className={`min-w-[320px] max-w-[600px] w-max h-auto glass-panel rounded-xl p-5 transition-colors relative ${
      selected ? 'ring-2 ring-blue-500/50 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'hover:border-slate-500/50'
    } bg-blue-500/5 group/node`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-blue-500/50 border-none" />
      
      <div className="flex items-center gap-2 mb-4 border-b border-glass-stroke pb-3">
        <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
          <Info size={16} />
        </div>
        <div className="flex-1 text-sm font-semibold text-white">
          {data.label || 'Briefing Form'}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {fields.length === 0 && (
          <div className="text-xs text-slate-500 italic text-center py-4 bg-slate-900/30 rounded-lg border border-dashed border-slate-700/50">
            No fields configured.<br/>Open Edit Menu to add fields.
          </div>
        )}
        {fields.map((field: any) => (
          <div key={field.id} className="flex flex-col gap-1.5 group">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400/80 uppercase tracking-wider pl-1">
              {field.type === 'date' && <Calendar size={12} />}
              {field.type === 'checkbox' && <CheckSquare size={12} />}
              {field.type === 'text' && <AlignLeft size={12} />}
              {field.label}
            </div>
            
            {field.type === 'date' ? (
              <div className="relative">
                <input 
                  type="date"
                  value={field.value || ''}
                  onChange={(e) => updateFieldValue(field.id, e.target.value)}
                  style={{ colorScheme: 'dark' }}
                  className="nodrag w-full bg-slate-900/40 hover:bg-slate-900/60 border border-slate-700/50 hover:border-blue-500/30 focus:border-blue-500/50 focus:bg-slate-900/80 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none transition-all cursor-text [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ) : field.type === 'checkbox' ? (
              <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer bg-slate-900/40 hover:bg-slate-900/60 border border-slate-700/50 hover:border-blue-500/30 rounded-lg px-3 py-2 transition-all">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox"
                    checked={field.value || false}
                    onChange={(e) => updateFieldValue(field.id, e.target.checked)}
                    className="nodrag peer appearance-none w-4 h-4 rounded-sm border border-slate-500/50 checked:bg-blue-500 checked:border-blue-500 transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className={`select-none transition-colors ${field.value ? 'text-blue-100 font-medium' : 'text-slate-400'}`}>
                  {field.value ? 'Completed' : 'Pending'}
                </span>
              </label>
            ) : (
              <div className="relative grid nodrag w-full bg-slate-900/40 hover:bg-slate-900/60 border border-slate-700/50 hover:border-blue-500/30 focus-within:border-blue-500/50 focus-within:bg-slate-900/80 rounded-lg transition-all min-w-[280px]">
                {/* Invisible replica to drive auto-sizing of the grid */}
                <div className="col-start-1 row-start-1 w-full invisible px-3 py-2 text-sm font-inter leading-relaxed whitespace-pre-wrap break-words">
                  {(field.value || '') + ' '}
                </div>
                {/* Actual editable textarea */}
                <textarea
                  className="col-start-1 row-start-1 w-full h-full bg-transparent text-slate-200 text-sm focus:outline-none resize-none px-3 py-2 font-inter leading-relaxed nodrag custom-scrollbar"
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  value={field.value || ''}
                  onChange={(e) => updateFieldValue(field.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
        ))}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 pt-3 border-t border-glass-stroke/50">
            {tags.map((tag: string, i: number) => (
              <span key={i} className="flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-[10px] font-medium text-blue-300 px-2.5 py-1 rounded-md border border-blue-500/20 transition-colors cursor-default">
                <Tag size={10} className="opacity-70" /> {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-blue-500/50 border-none" />
    </div>
  );
};
