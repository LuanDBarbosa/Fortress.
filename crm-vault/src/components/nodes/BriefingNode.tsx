import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Info, Tag } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import TextareaAutosize from 'react-textarea-autosize';

export const BriefingNode = ({ id, data, selected }: any) => {
  const updateNode = useCanvasStore((state) => state.updateNode);

  const fields = data.fields || (data.description ? [{ id: 'desc', label: 'Overview', value: data.description, type: 'text' }] : []);

  const updateFieldValue = (fieldId: string, newValue: any) => {
    updateNode(id, { fields: fields.map((f: any) => f.id === fieldId ? { ...f, value: newValue } : f) });
  };

  const tags = data.tags || [];

  return (
    <div className={`w-80 glass-panel rounded-xl p-5 transition-colors relative ${
      selected ? 'ring-2 ring-blue-500/50 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'hover:border-slate-500/50'
    } bg-blue-500/5 group/node`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-blue-500/50 border-none" />
      
      <div className="flex items-center gap-2 mb-3 border-b border-glass-stroke pb-3">
        <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
          <Info size={16} />
        </div>
        <div className="flex-1 text-sm font-semibold text-white truncate">
          {data.label || 'Briefing Form'}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {fields.length === 0 && (
          <div className="text-xs text-slate-500 italic">No fields configured. Open Edit Menu to add fields.</div>
        )}
        {fields.map((field: any) => (
          <div key={field.id} className="flex flex-col gap-1">
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              {field.label}
            </div>
            
            {field.type === 'date' ? (
              <input
                type="date"
                value={field.value || ''}
                onChange={(e) => updateFieldValue(field.id, e.target.value)}
                className="w-full bg-slate-900/50 border border-glass-stroke rounded px-2 py-1 text-slate-300 text-xs focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            ) : field.type === 'checkbox' ? (
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.value || false}
                  onChange={(e) => updateFieldValue(field.id, e.target.checked)}
                  className="rounded border-glass-stroke bg-slate-900/50"
                  onClick={(e) => e.stopPropagation()}
                />
                {field.value ? 'Completed' : 'Pending'}
              </label>
            ) : (
              <TextareaAutosize
                className="w-full bg-transparent text-slate-300 text-xs focus:outline-none resize-none font-inter leading-relaxed"
                placeholder={`Enter ${field.label.toLowerCase()}...`}
                value={field.value || ''}
                onChange={(e) => updateFieldValue(field.id, e.target.value)}
                minRows={1}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            )}
          </div>
        ))}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {tags.map((tag: string, i: number) => (
              <span key={i} className="flex items-center gap-1 bg-slate-800 text-[10px] text-slate-300 px-2 py-1 rounded-full border border-glass-stroke">
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-blue-500/50 border-none" />
    </div>
  );
};
