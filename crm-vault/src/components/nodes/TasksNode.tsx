import { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { LayoutDashboard, Plus, Trash2, CheckSquare, BarChart } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';

export const TasksNode = ({ id, data, selected }: any) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const activeEnvId = useCanvasStore((state) => state.activeEnvId);
  const variant = data.variant || 'kanban';

  // We subscribe to envNodes for the summary calculation
  const envNodes = useCanvasStore((state) => state.activeEnvId ? (state.envNodes[state.activeEnvId] || []) : []);

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
      if (col.title.toLowerCase().includes('done') || col.title.toLowerCase().includes('completed')) {
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
  const [summaryData, setSummaryData] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    if (!activeEnvId) return;

    let envTotal = 0;
    let envCompleted = 0;

    envNodes.forEach((node: any) => {
      if (node.type === 'tasksNode' && node.data.variant !== 'summary') {
        envTotal += (node.data.nodeTotal || 0);
        envCompleted += (node.data.nodeCompleted || 0);
      }
    });

    if (variant === 'summary') {
      setSummaryData({ total: envTotal, completed: envCompleted });
    }

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
  }, [envNodes, activeEnvId, variant]);

  const renderContent = () => {
    if (variant === 'kanban') {
      return (
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {columns.length === 0 ? (
             <div className="text-xs text-slate-500 italic pb-2">No columns configured. Open Edit Menu to add columns.</div>
          ) : (
            columns.map((col: any) => (
              <div key={col.id} className="flex-1 min-w-[120px] bg-charcoal-800/80 rounded-lg p-2 border border-glass-stroke">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{col.title}</h3>
                
                <div className="space-y-2 mb-2 min-h-[50px]">
                  {col.tasks?.map((task: any) => (
                    <div key={task.id} className="bg-slate-900 rounded p-2 text-xs text-slate-200 border border-glass-stroke relative group">
                      {task.content}
                      <button 
                        onClick={() => removeTask(col.id, task.id)}
                        className="absolute top-1 right-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    className="w-full bg-transparent text-[10px] text-slate-300 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button onClick={() => addTask(col.id)} className="text-orange-400 hover:text-orange-300">
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
                className="w-3 h-3 accent-orange-500" 
              />
              <span className={`text-xs flex-1 ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {task.content}
              </span>
              <button onClick={() => removeTickItem(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity">
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
              className="bg-transparent text-xs focus:outline-none flex-1 text-slate-300" 
            />
            <button onClick={addTickItem} className="text-orange-400 hover:text-orange-300"><Plus size={14}/></button>
          </div>
        </div>
      );
    } else if (variant === 'summary') {
      const { total, completed } = summaryData;
      const progress = total > 0 ? (completed / total) * 100 : 0;
      return (
        <div className="p-4 bg-charcoal-800/50 rounded-lg text-center border border-glass-stroke min-w-[200px]">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Environment Progress</h4>
          <div className="text-3xl font-bold text-white mb-3">{completed} <span className="text-slate-500 text-xl">/ {total}</span></div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
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
