import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { GROUP_COLOR_MAP } from '../utils/groupColors';

interface NodeEditorModalProps {
  nodeId: string;
  nodeType?: string;
  initialData: any;
  onSave: (id: string, data: any) => void;
  onClose: () => void;
}

export function NodeEditorModal({ nodeId, nodeType, initialData, onSave, onClose }: NodeEditorModalProps) {
  // Common
  const [label, setLabel] = useState(initialData.label || '');
  
  // innerFeature specific
  const [description, setDescription] = useState(initialData.description || '');
  const [iconName, setIconName] = useState(initialData.iconName || 'FileText');
  const [colorClass, setColorClass] = useState(initialData.colorClass || 'bg-slate-500/20 text-slate-400');

  // globalEnv specific
  const [status, setStatus] = useState(initialData.status || 'DECRYPTED');
  const [code, setCode] = useState(initialData.code || '');
  const [tag, setTag] = useState(initialData.tag || '');
  const [tasksCompleted, setTasksCompleted] = useState(initialData.tasksCompleted || 0);
  const [tasksTotal, setTasksTotal] = useState(initialData.tasksTotal || 0);

  // groupNode specific
  const [groupColor, setGroupColor] = useState(initialData.color || 'slate');

  // briefingNode specific
  const [fields, setFields] = useState<any[]>(initialData.fields || (initialData.description ? [{ id: 'desc', label: 'Overview', value: initialData.description, type: 'text' }] : []));

  // tasksNode / kanbanNode / projectsNode specific
  const [variant, setVariant] = useState(initialData.variant || 'kanban');
  const [columns, setColumns] = useState<any[]>(initialData.columns || []);

  // graphNode specific
  const [points, setPoints] = useState<any[]>(initialData.points || []);

  // tags
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [newTag, setNewTag] = useState('');

  const handleSave = () => {
    const baseData = { label, tags };
    
    if (nodeType === 'globalEnv') {
      onSave(nodeId, { ...baseData, status, code, tag, tasksCompleted: Number(tasksCompleted), tasksTotal: Number(tasksTotal) });
    } else if (nodeType === 'groupNode') {
      onSave(nodeId, { label, color: groupColor });
    } else if (nodeType === 'briefingNode') {
      onSave(nodeId, { ...baseData, fields });
    } else if (nodeType === 'tasksNode' || nodeType === 'kanbanNode' || nodeType === 'projectsNode' || nodeType === 'ticketsNode') {
      onSave(nodeId, { ...baseData, variant, columns });
    } else if (nodeType === 'graphNode') {
      onSave(nodeId, { ...baseData, points });
    } else {
      onSave(nodeId, { ...baseData, description, iconName, colorClass });
    }
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-charcoal-800 border border-glass-stroke rounded-xl shadow-2xl w-[450px] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-4 py-3 border-b border-glass-stroke shrink-0">
          <h3 className="text-white font-medium">Edit {nodeType ? nodeType.replace('Node', '') : 'Node'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 space-y-5 overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
            <input 
              type="text" 
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-slate-900/50 border border-glass-stroke rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-vault-green/50"
            />
          </div>

          {/* TAGS (Shared across many nodes) */}
          {nodeType !== 'globalEnv' && nodeType !== 'groupNode' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Add a tag..."
                  className="flex-1 bg-slate-900/50 border border-glass-stroke rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                />
                <button onClick={addTag} className="px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"><Plus size={16} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((t, i) => (
                  <span key={i} className="flex items-center gap-1 bg-slate-800 text-xs text-slate-300 px-2 py-1 rounded-full border border-glass-stroke">
                    {t}
                    <button onClick={() => setTags(tags.filter(x => x !== t))} className="hover:text-red-400"><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {nodeType === 'globalEnv' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-900/50 border border-glass-stroke rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-vault-green/50"
                  >
                    <option value="DECRYPTED">DECRYPTED</option>
                    <option value="ENCRYPTED">ENCRYPTED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Code</label>
                  <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-900/50 border border-glass-stroke rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-vault-green/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tag (Optional)</label>
                <input 
                  type="text" 
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full bg-slate-900/50 border border-glass-stroke rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-vault-green/50"
                />
              </div>
            </>
          )}

          {/* BRIEFING NODE CONFIG */}
          {nodeType === 'briefingNode' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Form Fields</label>
              <div className="space-y-3 mb-3">
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-glass-stroke">
                    <input 
                      type="text"
                      value={field.label}
                      onChange={(e) => setFields(fields.map((f, i) => i === idx ? { ...f, label: e.target.value } : f))}
                      placeholder="Field Label"
                      className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                    />
                    <select
                      value={field.type || 'text'}
                      onChange={(e) => setFields(fields.map((f, i) => i === idx ? { ...f, type: e.target.value } : f))}
                      className="w-24 bg-slate-800 border border-glass-stroke rounded px-1 py-1 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="text">Text</option>
                      <option value="date">Date</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                    <button onClick={() => setFields(fields.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-red-400 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setFields([...fields, { id: `f-${Date.now()}`, label: 'New Field', type: 'text', value: '' }])}
                className="w-full py-2 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-xs flex justify-center items-center gap-1"
              >
                <Plus size={14} /> Add Field
              </button>
            </div>
          )}

          {nodeType === 'tasksNode' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Variant</label>
              <select 
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                className="w-full bg-slate-900/50 border border-glass-stroke rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-vault-green/50 mb-3"
              >
                <option value="kanban">Kanban</option>
                <option value="ticklist">Tick List</option>
                <option value="summary">Environment Summary</option>
              </select>
            </div>
          )}

          {/* KANBAN / PROJECTS / TICKETS CONFIG */}
          {((nodeType === 'tasksNode' && variant === 'kanban') || nodeType === 'kanbanNode' || nodeType === 'projectsNode' || nodeType === 'ticketsNode') && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Columns</label>
              <div className="space-y-2 mb-3">
                {columns.map((col, idx) => (
                  <div key={col.id} className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-glass-stroke">
                    <input 
                      type="text"
                      value={col.title}
                      onChange={(e) => setColumns(columns.map((c, i) => i === idx ? { ...c, title: e.target.value } : c))}
                      placeholder="Column Title"
                      className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                    />
                    <button onClick={() => setColumns(columns.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-red-400 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setColumns([...columns, { id: `col-${Date.now()}`, title: 'New Column', tasks: [] }])}
                className="w-full py-2 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-xs flex justify-center items-center gap-1"
              >
                <Plus size={14} /> Add Column
              </button>
            </div>
          )}

          {/* GRAPH NODE CONFIG */}
          {nodeType === 'graphNode' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Data Points</label>
              <div className="space-y-2 mb-3">
                {points.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-glass-stroke">
                    <input 
                      type="text"
                      value={point.label}
                      onChange={(e) => setPoints(points.map((p, i) => i === idx ? { ...p, label: e.target.value } : p))}
                      placeholder="Label (e.g. Jan)"
                      className="flex-1 bg-transparent text-sm text-white focus:outline-none w-1/2"
                    />
                    <input 
                      type="number"
                      value={point.value}
                      onChange={(e) => setPoints(points.map((p, i) => i === idx ? { ...p, value: Number(e.target.value) } : p))}
                      placeholder="Value"
                      className="w-20 bg-slate-800 border border-glass-stroke rounded px-2 py-1 text-sm text-white focus:outline-none"
                    />
                    <button onClick={() => setPoints(points.filter((_, i) => i !== idx))} className="text-slate-500 hover:text-red-400 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setPoints([...points, { label: 'New', value: 50 }])}
                className="w-full py-2 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-xs flex justify-center items-center gap-1"
              >
                <Plus size={14} /> Add Data Point
              </button>
            </div>
          )}

          {/* GENERIC DESC / ICON / COLOR */}
          {(!nodeType || nodeType === 'innerFeature') && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900/50 border border-glass-stroke rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-vault-green/50 h-24 resize-none"
                />
              </div>
            </>
          )}

          {nodeType === 'groupNode' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Group Color</label>
              <div className="grid grid-cols-7 gap-3">
                {Object.keys(GROUP_COLOR_MAP).map((c) => (
                  <button
                    key={c}
                    onClick={() => setGroupColor(c)}
                    className={`w-8 h-8 rounded-full ${GROUP_COLOR_MAP[c].solidBg} border border-white/20 hover:scale-110 transition-transform flex items-center justify-center ${
                      groupColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-charcoal-800' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-glass-stroke flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-vault-green/20 text-vault-green border border-vault-green/30 rounded-lg hover:bg-vault-green/30 transition-colors text-sm font-medium">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
