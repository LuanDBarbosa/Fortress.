import { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { LayoutDashboard, Plus, Trash2, CheckSquare, BarChart } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';

export const TasksNode = ({ id, data, selected }: any) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const activeEnvId = useCanvasStore((state) => state.activeEnvId);
  const variant = data.variant || 'kanban';

  // We compute a stable primitive string payload of just the task totals.
  // This prevents the TasksNode (and all kanban nodes) from re-rendering whenever ANY node is dragged.
  const summaryPayload = useCanvasStore((state) => {
    if (variant !== 'summary' || !state.activeEnvId) return undefined;
    const nodes = state.envNodes[state.activeEnvId] || [];
    let payload = '';
    nodes.forEach(n => {
      if (n.type === 'tasksNode' && n.data.variant !== 'summary') {
        payload += `${n.id}::${n.data.nodeTotal || 0}::${n.data.nodeCompleted || 0}::${n.data.label || 'Tasks'}||`;
      }
    });
    return payload;
  });

  // State for kanban/ticklist inputs
  const [newTaskInput, setNewTaskInput] = useState<{ [key: string]: string }>({});
  const [newTickInput, setNewTickInput] = useState('');

  // Kanban logic
  const columns = data.columns || [];
  const addTask = (colId: string) => {
    if (!newTaskInput[colId]) return;
    const newCols = columns.map((col: any) => {
      if (col.id === colId) {
        return { ...col, tasks: [...(col.tasks || []), { id: `t-${Date.now()}`, content: newTaskInput[colId] }] };
      }
      return col;
    });
    updateNode(id, { columns: newCols });
    setNewTaskInput({ ...newTaskInput, [colId]: '' });
  };
  const removeTask = (colId: string, taskId: string) => {
    const newCols = columns.map((col: any) => {
      if (col.id === colId) {
        return { ...col, tasks: col.tasks.filter((t: any) => t.id !== taskId) };
      }
      return col;
    });
    updateNode(id, { columns: newCols });
  };

  // Drag and Drop state & handlers
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const handleDragStart = (e: any, taskId: string, sourceColId: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ taskId, sourceColId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: any, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) setDragOverCol(colId);
  };

  const handleDragLeave = (e: any, colId: string) => {
    e.preventDefault();
    if (dragOverCol === colId) setDragOverCol(null);
  };

  const handleDrop = (e: any, targetColId: string) => {
    e.preventDefault();
    setDragOverCol(null);
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const { taskId, sourceColId } = JSON.parse(dataStr);
      
      if (sourceColId === targetColId) return; // Same column
      
      const sourceCol = columns.find((c: any) => c.id === sourceColId);
      const task = sourceCol?.tasks?.find((t: any) => t.id === taskId);
      if (!task) return;

      const newCols = columns.map((col: any) => {
        if (col.id === sourceColId) {
          return { ...col, tasks: col.tasks.filter((t: any) => t.id !== taskId) };
        }
        if (col.id === targetColId) {
          return { ...col, tasks: [...(col.tasks || []), task] };
        }
        return col;
      });

      updateNode(id, { columns: newCols });
    } catch (err) {
      // ignore
    }
  };

  // Tick list logic
  const tickList = data.tickList || [];
  const addTickItem = () => {
    if (!newTickInput) return;
    const newTickList = [...tickList, { id: `t-${Date.now()}`, content: newTickInput, completed: false }];
    updateNode(id, { tickList: newTickList });
    setNewTickInput('');
  };
  const toggleTickItem = (taskId: string) => {
    const newTickList = tickList.map((t: any) => t.id === taskId ? { ...t, completed: !t.completed } : t);
    updateNode(id, { tickList: newTickList });
  };
  const removeTickItem = (taskId: string) => {
    const newTickList = tickList.filter((t: any) => t.id !== taskId);
    updateNode(id, { tickList: newTickList });
  };

  // Compute node's own tasks
  let nodeTotal = 0;
  let nodeCompleted = 0;
  if (variant === 'kanban') {
    columns.forEach((col: any) => {
      const taskCount = col.tasks?.length || 0;
      nodeTotal += taskCount;
      if (col.status === 'done' || (!col.status && (col.title.toLowerCase().includes('done') || col.title.toLowerCase().includes('completed')))) {
        nodeCompleted += taskCount;
      }
    });
  } else if (variant === 'ticklist') {
    nodeTotal = tickList.length;
    nodeCompleted = tickList.filter((t: any) => t.completed).length;
  }

  // Save local total/completed so they are accessible to summary and globalEnv
  useEffect(() => {
    if (data.nodeTotal !== nodeTotal || data.nodeCompleted !== nodeCompleted) {
      updateNode(id, { nodeTotal, nodeCompleted });
    }
  }, [nodeTotal, nodeCompleted, id, data.nodeTotal, data.nodeCompleted, updateNode]);

  // Aggregate and sync logic
  const [summaryData, setSummaryData] = useState<{ total: number, completed: number, nodes: any[] }>({ total: 0, completed: 0, nodes: [] });

  useEffect(() => {
    if (variant !== 'summary' || !activeEnvId || summaryPayload === undefined) return;

    let envTotal = 0;
    let envCompleted = 0;
    const individualNodes: any[] = [];

    const parts = summaryPayload.split('||').filter(Boolean);
    parts.forEach(part => {
       const [nId, tStr, cStr, label] = part.split('::');
       const total = parseInt(tStr);
       const completed = parseInt(cStr);
       envTotal += total;
       envCompleted += completed;
       individualNodes.push({ id: nId, label, total, completed });
    });

    setSummaryData({ total: envTotal, completed: envCompleted, nodes: individualNodes });

    const globalNodes = useCanvasStore.getState().globalNodes;
    const globalEnvNode = globalNodes.find(n => n.id === activeEnvId);
    
    if (globalEnvNode && (globalEnvNode.data.tasksTotal !== envTotal || globalEnvNode.data.tasksCompleted !== envCompleted)) {
      setTimeout(() => {
        useCanvasStore.getState().updateGlobalNode(activeEnvId, { 
          tasksTotal: envTotal, 
          tasksCompleted: envCompleted 
        });
      }, 0);
    }
  }, [summaryPayload, activeEnvId, variant]);

  const renderContent = () => {
    if (variant === 'kanban') {
      return (
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar nodrag">
          {columns.length === 0 ? (
             <div className="text-xs text-slate-500 italic pb-2">No columns configured. Open Edit Menu to add columns.</div>
          ) : (
            columns.map((col: any) => (
              <div 
                key={col.id} 
                className={`flex-1 min-w-[120px] bg-charcoal-800/80 rounded-lg p-2 border transition-colors flex flex-col ${
                  dragOverCol === col.id ? 'border-orange-500/50 bg-charcoal-800 shadow-[0_0_10px_rgba(249,115,22,0.1)]' : 'border-glass-stroke'
                }`}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={(e) => handleDragLeave(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{col.title}</h3>
                
                <div className="space-y-2 mb-2 min-h-[30px] flex-1">
                  {col.tasks?.map((task: any) => (
                    <div 
                      key={task.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id, col.id)}
                      className="bg-slate-900 rounded p-2 text-xs text-slate-200 border border-glass-stroke relative group cursor-grab active:cursor-grabbing hover:border-slate-600 transition-colors"
                    >
                      {task.content}
                      <button 
                        onClick={() => removeTask(col.id, task.id)}
                        className="nodrag absolute top-1 right-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1 mt-auto">
                  <input 
                    value={newTaskInput[col.id] || ''}
                    onChange={(e) => setNewTaskInput({ ...newTaskInput, [col.id]: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') addTask(col.id); }}
                    placeholder="Add task..."
                    className="nodrag w-full bg-transparent text-[10px] text-slate-300 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button onClick={() => addTask(col.id)} className="nodrag text-orange-400 hover:text-orange-300">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      );
    } else if (variant === 'ticklist') {
      return (
        <div className="space-y-2 min-w-[200px]">
          {tickList.length === 0 && <div className="text-xs text-slate-500 italic">No tasks added yet.</div>}
          {tickList.map((task: any) => (
            <div key={task.id} className="flex items-center gap-2 group bg-charcoal-800/50 p-2 rounded border border-glass-stroke">
              <input 
                type="checkbox" 
                checked={task.completed} 
                onChange={() => toggleTickItem(task.id)} 
                className="nodrag w-3 h-3 accent-orange-500" 
              />
              <span className={`text-xs flex-1 ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {task.content}
              </span>
              <button onClick={() => removeTickItem(task.id)} className="nodrag opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity">
                <Trash2 size={12}/>
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-glass-stroke">
            <input 
              value={newTickInput} 
              onChange={e => setNewTickInput(e.target.value)} 
              onKeyDown={e => { if (e.key === 'Enter') addTickItem(); }} 
              placeholder="Add list item..." 
              className="nodrag bg-transparent text-xs focus:outline-none flex-1 text-slate-300" 
            />
            <button className="text-orange-400 hover:text-orange-300 nodrag" onClick={addTickItem} ><Plus size={14}/></button>
          </div>
        </div>
      );
    } else if (variant === 'summary') {
      const { total, completed, nodes } = summaryData;
      const progress = total > 0 ? (completed / total) * 100 : 0;
      return (
        <div className="flex flex-col gap-4 min-w-[220px]">
          {/* Combined Tracker */}
          <div className="p-4 bg-charcoal-800/80 rounded-lg text-center border border-glass-stroke shadow-lg">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Combined Progress</h4>
            <div className="text-3xl font-bold text-white mb-2">{completed} <span className="text-slate-500 text-xl">/ {total}</span></div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          
          {/* Individual Trackers */}
          {nodes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-1">Individual Tasks Nodes</h4>
              {nodes.map(n => {
                const p = n.total > 0 ? (n.completed / n.total) * 100 : 0;
                return (
                  <div key={n.id} className="p-2 bg-charcoal-800/50 rounded border border-glass-stroke">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-slate-300 truncate max-w-[120px]">{n.label}</span>
                      <span className="text-[10px] font-bold text-slate-500">{n.completed}/{n.total}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-orange-400 h-full transition-all duration-500" style={{ width: `${p}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {nodes.length === 0 && (
             <div className="text-[10px] text-slate-500 italic text-center">No task nodes in environment.</div>
          )}
        </div>
      );
    }
  };

  const IconComponent = variant === 'kanban' ? LayoutDashboard : variant === 'ticklist' ? CheckSquare : BarChart;

  return (
    <div className={`glass-panel rounded-xl p-4 transition-colors relative ${
      selected ? 'ring-2 ring-orange-500/50 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'hover:border-slate-500/50'
    } bg-orange-500/5`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-orange-500/50 border-none" />
      
      <div className="flex items-center gap-2 mb-4 border-b border-glass-stroke pb-3">
        <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400">
          <IconComponent size={16} />
        </div>
        <div className="flex-1 text-sm font-semibold text-white truncate pr-4">
          {data.label || 'Tasks'}
        </div>
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          {variant}
        </div>
      </div>

      {renderContent()}

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-orange-500/50 border-none" />
    </div>
  );
};
