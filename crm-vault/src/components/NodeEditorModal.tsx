import { useState } from 'react';
import { X, Plus, Trash2, LayoutDashboard, CheckSquare, BarChart, Type, EyeOff, Square, Circle, PlayCircle, PauseCircle, Repeat, ArrowRight, ShieldCheck, ShieldAlert, PieChart, LineChart, Activity, Wifi, Unplug, Upload, Database, Link as LinkIcon, ArrowDown, Scroll, MessageCircle, Bug, Bell } from 'lucide-react';
import { GROUP_COLOR_MAP } from '../utils/groupColors';
import { useCanvasStore } from '../store/canvasStore';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { InlineCalendarEditor } from './ui/InlineCalendarEditor';

// Import nodes for preview
import { GlobalEnvNode } from './nodes/GlobalEnvNode';
import { InnerFeatureNode } from './nodes/InnerFeatureNode';
import { GroupNode } from './nodes/GroupNode';
import { BriefingNode } from './nodes/BriefingNode';
import { TasksNode } from './nodes/TasksNode';
import { GraphNode } from './nodes/GraphNode';
import { NoteNode } from './nodes/NoteNode';
import { VaultNode } from './nodes/VaultNode';
import { MediaNode } from './nodes/MediaNode';
import { CalendarNode } from './nodes/CalendarNode';
import { ProjectsNode } from './nodes/ProjectsNode';
import { TicketsNode } from './nodes/TicketsNode';
import { FileNode } from './nodes/FileNode';

const PREVIEW_NODES: Record<string, any> = {
  globalEnv: GlobalEnvNode,
  innerFeature: InnerFeatureNode,
  groupNode: GroupNode,
  briefingNode: BriefingNode,
  tasksNode: TasksNode,
  graphNode: GraphNode,
  noteNode: NoteNode,
  vaultNode: VaultNode,
  mediaNode: MediaNode,
  calendarNode: CalendarNode,
  projectsNode: ProjectsNode,
  ticketsNode: TicketsNode,
  fileNode: FileNode
};

const SegmentedControl = ({ options, value, onChange }: { options: { label: string, value: any, icon: React.ReactNode }[], value: any, onChange: (val: any) => void }) => {
  return (
    <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5 shadow-inner">
      {options.map((opt, i) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={i}
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-[11px] uppercase tracking-wide font-bold rounded-lg transition-all duration-300 overflow-hidden ${
              isSelected 
                ? 'bg-slate-800 text-white shadow-[0_2px_10px_rgba(0,0,0,0.3)] ring-1 ring-white/10' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <span className="shrink-0">{opt.icon}</span>
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

interface NodeEditorModalProps {
  nodeId: string;
  nodeType?: string;
  initialData: any;
  onSave: (id: string, data: any) => void;
  onClose: () => void;
}

export function NodeEditorModal({ nodeId, nodeType, initialData, onSave, onClose }: NodeEditorModalProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [data, setData] = useState<any>(JSON.parse(JSON.stringify(initialData))); // Deep copy for editing

  // Provide defaults for nodes that use them if they don't exist yet
  const nType = nodeType || 'innerFeature';

  const updateData = (updates: any) => {
    setData((prev: any) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    // For tasksNode, we need to ensure nodeTotal/nodeCompleted are updated or we just let TasksNode calculate it.
    // The TasksNode handles it internally via useEffect.
    onSave(nodeId, data);
    onClose();
  };

  const handleDelete = () => {
    useCanvasStore.getState().deleteNodes([nodeId]);
    onClose();
  };

  const addTag = (newTag: string) => {
    if (newTag && !data.tags?.includes(newTag)) {
      updateData({ tags: [...(data.tags || []), newTag] });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
       <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-[850px] h-[500px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 shrink-0 bg-black/20">
             <h3 className="text-white font-medium text-lg flex items-center gap-2">
                Edit {nType.replace('Node', '')}
             </h3>
             <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
               <X size={20} />
             </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 flex overflow-hidden">
             {/* Left side: Form */}
             <div className="w-[380px] flex flex-col border-r border-white/10 bg-black/10">
                {/* Tabs */}
                <div className="flex px-4 pt-4 gap-6 border-b border-glass-stroke">
                   <button 
                     onClick={() => setActiveTab('general')} 
                     className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'general' ? 'border-vault-green text-vault-green' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
                   >
                     General
                   </button>
                   <button 
                     onClick={() => setActiveTab('settings')} 
                     className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'settings' ? 'border-vault-green text-vault-green' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
                   >
                     Specific Settings
                   </button>
                </div>
                
                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                   {activeTab === 'general' && (
                     <div className="space-y-6">
                       <div>
                         <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Node Title</label>
                         <input 
                           type="text" 
                           value={data.label || ''}
                           onChange={(e) => updateData({ label: e.target.value })}
                           className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-vault-green/50 transition-colors shadow-inner"
                         />
                       </div>
                       
                       {nType !== 'globalEnv' && nType !== 'groupNode' && (
                         <div>
                           <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Tags</label>
                           <div className="flex gap-2 mb-3">
                             <input
                               type="text"
                               id="tag-input"
                               onKeyDown={(e) => { 
                                 if (e.key === 'Enter') { 
                                   e.preventDefault(); 
                                   addTag((e.target as HTMLInputElement).value.trim());
                                   (e.target as HTMLInputElement).value = '';
                                 } 
                               }}
                               placeholder="Type and press Enter to add..."
                               className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-vault-green/50 transition-colors shadow-inner"
                             />
                           </div>
                           <div className="flex flex-wrap gap-2">
                             {(data.tags || []).map((t: string, i: number) => (
                               <span key={i} className="flex items-center gap-1.5 bg-slate-800 text-xs text-slate-300 px-3 py-1.5 rounded-full border border-slate-700">
                                 {t}
                                 <button onClick={() => updateData({ tags: data.tags.filter((x: string) => x !== t) })} className="hover:text-red-400 transition-colors"><X size={12} /></button>
                               </span>
                             ))}
                           </div>
                         </div>
                       )}

                       {(!nType || nType === 'innerFeature') && (
                         <div>
                           <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Description</label>
                           <textarea 
                             value={data.description || ''}
                             onChange={(e) => updateData({ description: e.target.value })}
                             className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-vault-green/50 transition-colors shadow-inner h-28 resize-none"
                           />
                         </div>
                       )}

                       {/* We can put colors/icons in General if it's innerFeature */}
                       {(!nType || nType === 'innerFeature') && (
                         <div>
                           <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Icon & Color</label>
                           <div className="grid grid-cols-2 gap-3">
                             <input 
                               type="text" 
                               placeholder="Icon Name (e.g. Shield)"
                               value={data.iconName || 'FileText'}
                               onChange={(e) => updateData({ iconName: e.target.value })}
                               className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-vault-green/50 transition-colors"
                             />
                             <input 
                               type="text" 
                               placeholder="Tailwind Color Class"
                               value={data.colorClass || 'bg-slate-500/20 text-slate-400'}
                               onChange={(e) => updateData({ colorClass: e.target.value })}
                               className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-vault-green/50 transition-colors"
                             />
                           </div>
                         </div>
                       )}
                     </div>
                   )}

                   {activeTab === 'settings' && (
                     <div className="space-y-6">
                       {/* GLOBAL ENV SETTINGS */}
                       {nType === 'globalEnv' && (
                         <>
                           <div className="space-y-4">
                             <div>
                               <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Status</label>
                               <SegmentedControl 
                                 value={data.status || 'DECRYPTED'}
                                 onChange={(val) => updateData({ status: val })}
                                 options={[
                                   { value: 'DECRYPTED', label: 'Decrypted', icon: <ShieldCheck size={14} /> },
                                   { value: 'ENCRYPTED', label: 'Encrypted', icon: <ShieldAlert size={14} /> }
                                 ]}
                               />
                             </div>
                             <div>
                               <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Code</label>
                               <input 
                                 type="text" 
                                 value={data.code || ''}
                                 onChange={(e) => updateData({ code: e.target.value })}
                                 className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-vault-green/50 transition-colors"
                               />
                             </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                             <div>
                               <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Tasks Total</label>
                               <input 
                                 type="number" 
                                 value={data.tasksTotal || 0}
                                 onChange={(e) => updateData({ tasksTotal: Number(e.target.value) })}
                                 className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-vault-green/50 transition-colors"
                               />
                             </div>
                             <div>
                               <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Tasks Completed</label>
                               <input 
                                 type="number" 
                                 value={data.tasksCompleted || 0}
                                 onChange={(e) => updateData({ tasksCompleted: Number(e.target.value) })}
                                 className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-vault-green/50 transition-colors"
                               />
                             </div>
                             <div className="col-span-2">
                               <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Simulate Pings (Notifications)</label>
                               <input 
                                 type="number" 
                                 value={data.pings || 0}
                                 onChange={(e) => updateData({ pings: Number(e.target.value) })}
                                 className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-vault-green/50 transition-colors"
                               />
                             </div>
                           </div>
                           <div>
                             <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Tag (Optional)</label>
                             <input 
                               type="text" 
                               value={data.tag || ''}
                               onChange={(e) => updateData({ tag: e.target.value })}
                               className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-vault-green/50 transition-colors"
                             />
                           </div>
                         </>
                       )}

                       {/* VAULT NODE SETTINGS */}
                       {nType === 'vaultNode' && (
                         <div>
                           <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Vault Settings</label>
                           <SegmentedControl 
                             value={data.autoExpand === true}
                             onChange={(val) => updateData({ autoExpand: val })}
                             options={[
                               { value: true, label: 'Auto Expand', icon: <ArrowDown size={14} /> },
                               { value: false, label: 'Scrollable', icon: <Scroll size={14} /> }
                             ]}
                           />
                         </div>
                       )}

                       {/* PROJECTS NODE SETTINGS */}
                       {nType === 'projectsNode' && (
                         <div>
                           <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Projects Settings</label>
                           <SegmentedControl 
                             value={data.autoExpand === true}
                             onChange={(val) => updateData({ autoExpand: val })}
                             options={[
                               { value: true, label: 'Auto Expand', icon: <ArrowDown size={14} /> },
                               { value: false, label: 'Scrollable', icon: <Scroll size={14} /> }
                             ]}
                           />
                         </div>
                       )}

                       {/* TICKETS NODE SETTINGS */}
                       {nType === 'ticketsNode' && (
                         <div className="space-y-5">
                           <div>
                             <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Hub Variant</label>
                             <SegmentedControl 
                               value={data.variant || 'chat'}
                               onChange={(val) => updateData({ variant: val })}
                               options={[
                                 { value: 'chat', label: 'Team Chat', icon: <MessageCircle size={14} /> },
                                 { value: 'reports', label: 'Bug Reports', icon: <Bug size={14} /> },
                                 { value: 'integrations', label: 'Connect', icon: <LinkIcon size={14} /> }
                               ]}
                             />
                             <p className="text-[10px] text-slate-500 mt-2 ml-1">
                               {data.variant === 'reports' ? "Kanban-style list for external bug reports." : 
                                data.variant === 'integrations' ? "Placeholder connections for external messaging APIs." :
                                "Conversational interface for internal team messages."}
                             </p>
                           </div>
                           <div>
                             <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Display Settings</label>
                             <SegmentedControl 
                               value={data.autoExpand === true}
                               onChange={(val) => updateData({ autoExpand: val })}
                               options={[
                                 { value: true, label: 'Auto Expand', icon: <ArrowDown size={14} /> },
                                 { value: false, label: 'Scrollable', icon: <Scroll size={14} /> }
                               ]}
                             />
                           </div>
                           <div>
                             <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Simulate Pings (Notifications)</label>
                             <div className="relative">
                               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                 <Bell size={14} className={data.pings > 0 ? "text-pink-500 animate-pulse-soft" : ""} />
                               </div>
                               <input 
                                 type="number" 
                                 value={data.pings || 0}
                                 onChange={(e) => updateData({ pings: Number(e.target.value) })}
                                 className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                               />
                             </div>
                           </div>
                         </div>
                       )}

                       {/* TASKS NODE CONFIG */}
                       {nType === 'tasksNode' && (
                         <div>
                           <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Variant</label>
                           <div className="flex gap-2 mb-4">
                             <button
                               onClick={() => updateData({ variant: 'kanban' })}
                               className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                                 (!data.variant || data.variant === 'kanban') 
                                   ? 'bg-vault-green/10 border-vault-green text-vault-green shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                                   : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                               }`}
                             >
                               <LayoutDashboard size={20} />
                               <span className="text-xs font-semibold">Kanban</span>
                             </button>
                             <button
                               onClick={() => updateData({ variant: 'ticklist' })}
                               className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                                 data.variant === 'ticklist' 
                                   ? 'bg-vault-green/10 border-vault-green text-vault-green shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                                   : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                               }`}
                             >
                               <CheckSquare size={20} />
                               <span className="text-xs font-semibold">Tick List</span>
                             </button>
                             <button
                               onClick={() => updateData({ variant: 'summary' })}
                               className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                                 data.variant === 'summary' 
                                   ? 'bg-vault-green/10 border-vault-green text-vault-green shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                                   : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                               }`}
                             >
                               <BarChart size={20} />
                               <span className="text-xs font-semibold">Summary</span>
                             </button>
                           </div>
                         </div>
                       )}

                       {/* MEDIA NODE CONFIG */}
                       {nType === 'mediaNode' && (
                         <div className="space-y-5">
                           <div>
                             <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Caption Bar</label>
                             <SegmentedControl 
                               value={data.showTitle !== false}
                               onChange={(val) => updateData({ showTitle: val })}
                               options={[
                                 { value: true, label: 'Visible', icon: <Type size={14} /> },
                                 { value: false, label: 'Hidden', icon: <EyeOff size={14} /> }
                               ]}
                             />
                           </div>
                           <div>
                             <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Border Style</label>
                             <SegmentedControl 
                               value={data.isRounded !== false}
                               onChange={(val) => updateData({ isRounded: val })}
                               options={[
                                 { value: true, label: 'Rounded Corners', icon: <Circle size={14} /> },
                                 { value: false, label: 'Sharp Corners', icon: <Square size={14} /> }
                               ]}
                             />
                           </div>
                           
                           {/* Video specific settings */}
                           {data.mediaType === 'video' && (
                             <div className="space-y-5 pt-5 border-t border-slate-800/50 mt-2">
                               <div>
                                 <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Autoplay Mode</label>
                                 <SegmentedControl 
                                   value={data.autoplay === true}
                                   onChange={(val) => updateData({ autoplay: val })}
                                   options={[
                                     { value: true, label: 'Autoplay Video', icon: <PlayCircle size={14} /> },
                                     { value: false, label: 'Require Click', icon: <PauseCircle size={14} /> }
                                   ]}
                                 />
                               </div>
                               <div>
                                 <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Playback Style</label>
                                 <SegmentedControl 
                                   value={data.loop === true}
                                   onChange={(val) => updateData({ loop: val })}
                                   options={[
                                     { value: true, label: 'Loop Forever', icon: <Repeat size={14} /> },
                                     { value: false, label: 'Play Once', icon: <ArrowRight size={14} /> }
                                   ]}
                                 />
                               </div>
                             </div>
                           )}
                           
                           {data.mediaType !== 'video' && (
                              <div className="text-xs text-slate-500 italic mt-2">
                                Video playback settings will appear here if a video is uploaded.
                              </div>
                           )}
                         </div>
                       )}



                       {/* FILE NODE CONFIG */}
                       {nType === 'fileNode' && (
                         <div>
                           <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Manage Files</label>
                           <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                             {(data.files || []).map((f: any, idx: number) => (
                               <div key={f.id || idx} className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                                 <div className="flex flex-col overflow-hidden mr-2">
                                   <span className="text-sm text-white truncate font-medium">{f.fileName}</span>
                                   <span className="text-[10px] text-slate-400">{f.fileSize}</span>
                                 </div>
                                 <button 
                                   onClick={() => {
                                     // Remove from array. `FileNode` will handle cleanup when it detects changes
                                     // if we want to be fully rigorous we should also deleteMedia here, but 
                                     // for simplicity we'll just remove from the array and FileNode will re-render
                                     updateData({ files: data.files.filter((_: any, i: number) => i !== idx) });
                                   }} 
                                   className="shrink-0 text-slate-500 hover:text-red-400 p-2 transition-colors"
                                 >
                                   <Trash2 size={16} />
                                 </button>
                               </div>
                             ))}
                             {(data.files?.length || 0) === 0 && <div className="text-xs text-slate-500 italic">No files attached.</div>}
                           </div>
                           <div className="text-[10px] text-slate-500 italic text-center p-2 bg-slate-900/50 rounded border border-slate-800">
                             To attach more files, drag & drop them directly onto the node in the canvas, or click the upload icon on the node.
                           </div>
                         </div>
                       )}

                       {/* CALENDAR NODE CONFIG */}
                       {nType === 'calendarNode' && (
                         <div className="space-y-4">
                           <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Manage Events</label>
                           <InlineCalendarEditor 
                             manualDates={data.manualDates || []}
                             onUpdate={(newDates: any[]) => updateData({ manualDates: newDates })}
                           />
                         </div>
                       )}

                       {/* KANBAN COLUMNS */}
                       {nType === 'tasksNode' && (!data.variant || data.variant === 'kanban') && (
                         <div>
                           <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Columns Config</label>
                           <div className="space-y-3 mb-4">
                             {(data.columns || []).map((col: any, idx: number) => (
                               <div key={col.id} className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                                 <input 
                                   type="text"
                                   value={col.title}
                                   onChange={(e) => updateData({ columns: data.columns.map((c: any, i: number) => i === idx ? { ...c, title: e.target.value } : c) })}
                                   placeholder="Column Title"
                                   className="flex-1 min-w-0 bg-transparent text-sm text-white px-2 focus:outline-none"
                                 />
                                 <select
                                   value={col.status || 'todo'}
                                   onChange={(e) => updateData({ columns: data.columns.map((c: any, i: number) => i === idx ? { ...c, status: e.target.value } : c) })}
                                   className="w-28 shrink-0 bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                                 >
                                   <option value="todo">To Do</option>
                                   <option value="in_progress">In Progress</option>
                                   <option value="done">Done</option>
                                 </select>
                                 <button onClick={() => updateData({ columns: data.columns.filter((_: any, i: number) => i !== idx) })} className="shrink-0 text-slate-500 hover:text-red-400 p-2 transition-colors">
                                   <Trash2 size={14} />
                                 </button>
                               </div>
                             ))}
                             {(data.columns?.length || 0) === 0 && <div className="text-xs text-slate-500 italic">No columns defined.</div>}
                           </div>
                           <button 
                             onClick={() => updateData({ columns: [...(data.columns || []), { id: `col-${Date.now()}`, title: 'New Column', tasks: [], status: 'todo' }] })}
                             className="w-full py-2.5 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium flex justify-center items-center gap-2"
                           >
                             <Plus size={16} /> Add Column
                           </button>
                         </div>
                       )}

                       {/* PROJECTS NODE CONFIG */}
                       {nType === 'projectsNode' && (
                         <div>
                           <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Manage Links</label>
                           <div className="space-y-3 mb-4">
                             {(data.links || []).map((link: any, idx: number) => (
                               <div key={link.id || idx} className="flex flex-col gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                                 <div className="flex items-center gap-2">
                                   <input 
                                     type="text"
                                     value={link.title}
                                     onChange={(e) => updateData({ links: data.links.map((l: any, i: number) => i === idx ? { ...l, title: e.target.value } : l) })}
                                     placeholder="Link Title (e.g. Figma)"
                                     className="flex-1 bg-transparent text-sm text-white px-2 focus:outline-none border-b border-slate-800 pb-1"
                                   />
                                   <button onClick={() => updateData({ links: data.links.filter((_: any, i: number) => i !== idx) })} className="shrink-0 text-slate-500 hover:text-red-400 p-1 transition-colors">
                                     <Trash2 size={14} />
                                   </button>
                                 </div>
                                 <input 
                                   type="text"
                                   value={link.url}
                                   onChange={(e) => updateData({ links: data.links.map((l: any, i: number) => i === idx ? { ...l, url: e.target.value } : l) })}
                                   placeholder="URL (e.g. https://figma.com)"
                                   className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                                 />
                               </div>
                             ))}
                             {(data.links?.length || 0) === 0 && <div className="text-xs text-slate-500 italic">No links added.</div>}
                           </div>
                           <button 
                             onClick={() => updateData({ links: [...(data.links || []), { id: `link-${Date.now()}`, title: 'New Link', url: '' }] })}
                             className="w-full py-2.5 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium flex justify-center items-center gap-2"
                           >
                             <Plus size={16} /> Add Link
                           </button>
                         </div>
                       )}

                       {/* TICKETS NODE CONFIG */}
                       {nType === 'ticketsNode' && (
                         <div>
                           <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Manage Tickets</label>
                           <div className="space-y-3 mb-4">
                             {(data.tickets || []).map((ticket: any, idx: number) => (
                               <div key={ticket.id || idx} className="flex flex-col gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 relative group">
                                 <button onClick={() => updateData({ tickets: data.tickets.filter((_: any, i: number) => i !== idx) })} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 shrink-0 text-slate-500 hover:text-red-400 p-1 transition-colors">
                                   <Trash2 size={14} />
                                 </button>
                                 <input 
                                   type="text"
                                   value={ticket.author}
                                   onChange={(e) => updateData({ tickets: data.tickets.map((t: any, i: number) => i === idx ? { ...t, author: e.target.value } : t) })}
                                   placeholder="Author"
                                   className="w-2/3 bg-transparent text-xs font-bold text-pink-400 px-2 focus:outline-none border-b border-slate-800 pb-1"
                                 />
                                 <textarea 
                                   value={ticket.content}
                                   onChange={(e) => updateData({ tickets: data.tickets.map((t: any, i: number) => i === idx ? { ...t, content: e.target.value } : t) })}
                                   placeholder="Ticket Message..."
                                   rows={2}
                                   className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-300 focus:outline-none resize-none"
                                 />
                               </div>
                             ))}
                             {(data.tickets?.length || 0) === 0 && <div className="text-xs text-slate-500 italic">No tickets added.</div>}
                           </div>
                           <button 
                             onClick={() => updateData({ tickets: [...(data.tickets || []), { id: `ticket-${Date.now()}`, author: 'User', content: '', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] })}
                             className="w-full py-2.5 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium flex justify-center items-center gap-2"
                           >
                             <Plus size={16} /> Add Ticket
                           </button>
                         </div>
                       )}

                       {/* BRIEFING NODE FIELDS */}
                       {nType === 'briefingNode' && (
                         <div>
                           <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Form Fields</label>
                           <div className="space-y-3 mb-4">
                             {(data.fields || []).map((field: any, idx: number) => (
                               <div key={field.id} className="flex items-center gap-3 bg-slate-950 p-2 rounded-lg border border-slate-800">
                                 <input 
                                   type="text"
                                   value={field.label}
                                   onChange={(e) => updateData({ fields: data.fields.map((f: any, i: number) => i === idx ? { ...f, label: e.target.value } : f) })}
                                   placeholder="Field Label"
                                   className="flex-1 min-w-0 bg-transparent text-sm text-white px-2 focus:outline-none"
                                 />
                                 <select
                                   value={field.type || 'text'}
                                   onChange={(e) => updateData({ fields: data.fields.map((f: any, i: number) => i === idx ? { ...f, type: e.target.value } : f) })}
                                   className="w-28 shrink-0 bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                                 >
                                   <option value="text">Text</option>
                                   <option value="date">Date</option>
                                   <option value="checkbox">Checkbox</option>
                                 </select>
                                 <button onClick={() => updateData({ fields: data.fields.filter((_: any, i: number) => i !== idx) })} className="shrink-0 text-slate-500 hover:text-red-400 p-2 transition-colors">
                                   <Trash2 size={14} />
                                 </button>
                               </div>
                             ))}
                           </div>
                           <button 
                             onClick={() => updateData({ fields: [...(data.fields || []), { id: `f-${Date.now()}`, label: 'New Field', type: 'text', value: '' }] })}
                             className="w-full py-2.5 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium flex justify-center items-center gap-2"
                           >
                             <Plus size={16} /> Add Field
                           </button>
                         </div>
                       )}

                       {/* GRAPH NODE CONFIG */}
                       {nType === 'graphNode' && (
                         <div className="space-y-6">
                           {/* CHART TYPE */}
                           <div>
                             <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Chart Type (Variants)</label>
                             <div className="grid grid-cols-3 gap-2">
                               <button
                                 onClick={() => updateData({ chartType: 'bar' })}
                                 className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors ${(!data.chartType || data.chartType === 'bar') ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                               >
                                 <BarChart size={14} /> Bar
                               </button>
                               <button
                                 onClick={() => updateData({ chartType: 'line' })}
                                 className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors ${(data.chartType === 'line') ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                               >
                                 <LineChart size={14} /> Line
                               </button>
                               <button
                                 onClick={() => updateData({ chartType: 'donut' })}
                                 className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors ${(data.chartType === 'donut') ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                               >
                                 <PieChart size={14} /> Donut
                               </button>
                             </div>
                           </div>

                           {/* THEME COLOR */}
                           <div>
                             <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Theme Color</label>
                             <div className="flex gap-2">
                               {[
                                 { id: 'emerald', color: 'bg-emerald-500' },
                                 { id: 'purple', color: 'bg-purple-500' },
                                 { id: 'blue', color: 'bg-blue-500' },
                                 { id: 'red', color: 'bg-red-500' },
                                 { id: 'amber', color: 'bg-amber-500' },
                               ].map(theme => (
                                 <button
                                   key={theme.id}
                                   onClick={() => updateData({ themeColor: theme.id })}
                                   className={`w-8 h-8 rounded-full ${theme.color} transition-all ${(!data.themeColor && theme.id === 'emerald') || data.themeColor === theme.id ? 'ring-2 ring-white ring-offset-2 ring-offset-charcoal-800 scale-110' : 'opacity-50 hover:opacity-100 hover:scale-110'}`}
                                 />
                               ))}
                             </div>
                           </div>

                           {/* DATA SOURCE */}
                           <div>
                             <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Data Source</label>
                             <div className="grid grid-cols-2 gap-2 mb-4">
                               <button
                                 onClick={() => updateData({ dataSource: 'manual' })}
                                 className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors ${(!data.dataSource || data.dataSource === 'manual') ? 'bg-slate-700 text-white border border-slate-500' : 'bg-slate-900 text-slate-400 border border-transparent hover:bg-slate-800'}`}
                               >
                                 <Unplug size={14} /> Manual Data
                               </button>
                               <button
                                 onClick={() => updateData({ dataSource: 'live' })}
                                 className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors ${(data.dataSource === 'live') ? 'bg-slate-700 text-white border border-slate-500' : 'bg-slate-900 text-slate-400 border border-transparent hover:bg-slate-800'}`}
                               >
                                 <Wifi size={14} /> Live Connection
                               </button>
                             </div>

                             {(!data.dataSource || data.dataSource === 'manual') ? (
                               <div className="space-y-4">
                                 {/* PASTE TSV */}
                                 <div className="bg-slate-950 p-3 rounded-lg border border-dashed border-slate-700">
                                   <div className="flex items-center gap-2 mb-2 text-slate-400">
                                     <Upload size={14} />
                                     <span className="text-xs font-semibold">Quick Import</span>
                                   </div>
                                   <textarea 
                                     className="w-full bg-slate-900 border border-slate-800 rounded-md p-2 text-xs text-slate-300 focus:outline-none focus:border-slate-600 resize-none"
                                     placeholder="Paste cells directly from Excel or Google Sheets here..."
                                     rows={3}
                                     onChange={(e) => {
                                       const text = e.target.value;
                                       if (!text) return;
                                       const rows = text.split(/\r?\n/).filter(r => r.trim());
                                       const newPoints = [];
                                       for (const row of rows) {
                                         const cols = row.split(/\t|,/);
                                         if (cols.length >= 2) {
                                           let label = cols[0].trim();
                                           let valStr = cols[1].replace(/[^0-9.-]+/g, "");
                                           let val = valStr ? Number(valStr) : NaN;
                                           if (isNaN(val) || !valStr) {
                                             valStr = cols[0].replace(/[^0-9.-]+/g, "");
                                             val = valStr ? Number(valStr) : NaN;
                                             label = cols[1].trim();
                                           }
                                           if (!isNaN(val)) {
                                             newPoints.push({ label, value: val });
                                           }
                                         }
                                       }
                                       if (newPoints.length > 0) {
                                         updateData({ points: newPoints });
                                         e.target.value = '';
                                       }
                                     }}
                                   />
                                   <p className="text-[10px] text-slate-500 mt-1">Accepts TSV (Tab-Separated Values) or CSV.</p>
                                 </div>

                                 {/* DATA POINTS */}
                                 <div className="space-y-2">
                                   <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Data Points</label>
                                   {(data.points || []).map((point: any, idx: number) => (
                                     <div key={idx} className="flex items-center gap-3 bg-slate-950 p-2 rounded-lg border border-slate-800">
                                       <input 
                                         type="text"
                                         value={point.label}
                                         onChange={(e) => updateData({ points: data.points.map((p: any, i: number) => i === idx ? { ...p, label: e.target.value } : p) })}
                                         placeholder="Label"
                                         className="flex-1 bg-transparent text-sm text-white px-2 focus:outline-none"
                                       />
                                       <input 
                                         type="number"
                                         value={point.value}
                                         onChange={(e) => updateData({ points: data.points.map((p: any, i: number) => i === idx ? { ...p, value: Number(e.target.value) } : p) })}
                                         placeholder="Val"
                                         className="w-24 bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none"
                                       />
                                       <button onClick={() => updateData({ points: data.points.filter((_: any, i: number) => i !== idx) })} className="text-slate-500 hover:text-red-400 p-2 transition-colors">
                                         <Trash2 size={14} />
                                       </button>
                                     </div>
                                   ))}
                                   <button 
                                     onClick={() => updateData({ points: [...(data.points || []), { label: 'New', value: 50 }] })}
                                     className="w-full py-2.5 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium flex justify-center items-center gap-2 mt-2"
                                   >
                                     <Plus size={16} /> Add Data Point
                                   </button>
                                 </div>
                               </div>
                             ) : (
                               <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 text-center space-y-4">
                                 <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                                   <Activity size={24} />
                                 </div>
                                 <div>
                                   <h4 className="text-white font-semibold text-sm">Live Integrations</h4>
                                   <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                     Connect this node directly to a live data source. Data will be automatically synced and updated in real-time.
                                   </p>
                                 </div>
                                 <div className="space-y-2 pt-2">
                                   <button className="w-full py-2 bg-[#0F9D58]/10 text-[#0F9D58] hover:bg-[#0F9D58]/20 border border-[#0F9D58]/30 rounded-lg text-xs font-semibold flex justify-center items-center gap-2 transition-colors">
                                     <Database size={14} /> Connect Google Sheets
                                   </button>
                                   <button className="w-full py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs font-semibold flex justify-center items-center gap-2 transition-colors">
                                     <Database size={14} /> Connect Excel 365
                                   </button>
                                   <button className="w-full py-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs font-semibold flex justify-center items-center gap-2 transition-colors">
                                     <LinkIcon size={14} /> Custom API Endpoint
                                   </button>
                                 </div>
                               </div>
                             )}
                           </div>
                         </div>
                       )}

                       {/* GROUP NODE COLOR */}
                       {nType === 'groupNode' && (
                         <div>
                           <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Group Color Theme</label>
                           <div className="grid grid-cols-7 gap-4">
                             {Object.keys(GROUP_COLOR_MAP).map((c) => (
                               <button
                                 key={c}
                                 onClick={() => updateData({ color: c })}
                                 className={`w-10 h-10 rounded-full ${GROUP_COLOR_MAP[c].solidBg} border-2 border-slate-800 hover:scale-110 transition-all shadow-md flex items-center justify-center ${
                                   (data.color || 'slate') === c ? 'ring-2 ring-white ring-offset-4 ring-offset-charcoal-800' : ''
                                 }`}
                               />
                             ))}
                           </div>
                         </div>
                       )}



                       {/* Fallback empty state for settings if node has no specific settings */}
                       {nType !== 'globalEnv' && nType !== 'tasksNode' && nType !== 'projectsNode' && nType !== 'ticketsNode' && nType !== 'briefingNode' && nType !== 'graphNode' && nType !== 'groupNode' && nType !== 'mediaNode' && nType !== 'calendarNode' && (
                         <div className="text-sm text-slate-500 italic text-center py-8">
                           No specific settings available for this node type.
                         </div>
                       )}
                     </div>
                   )}
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-white/10 flex justify-between items-center bg-black/20 shrink-0 backdrop-blur-sm">
                  <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={16} /> Delete
                  </button>
                  <div className="flex gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2.5 bg-vault-green/90 text-slate-900 rounded-lg hover:bg-green-400 transition-all text-sm font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)] backdrop-blur-md">
                      Save Changes
                    </button>
                  </div>
                </div>
             </div>

             {/* Right side: Live Preview */}
             <div className="flex-1 bg-transparent flex flex-col relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 pattern-dots opacity-[0.05] pointer-events-none"></div>
                
                {/* Top Label */}
                <div className="p-4 border-b border-white/5 z-10 bg-black/10 backdrop-blur-md shadow-sm">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-vault-green shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div> 
                    Live Preview
                  </h4>
                </div>

                {/* ReactFlow Canvas container */}
                <div className="flex-1 relative">
                  <div className="absolute inset-0">
                    <ReactFlowProvider>
                      <ReactFlow
                        nodes={[{
                          id: 'preview-node',
                          type: nType,
                          position: { x: 0, y: 0 },
                          data: data,
                          selected: true
                        }]}
                        nodeTypes={PREVIEW_NODES}
                        fitView
                        fitViewOptions={{ padding: 0.5 }}
                        proOptions={{ hideAttribution: true }}
                        className="pointer-events-none" // Prevents dragging/interacting with the node in the preview
                      />
                    </ReactFlowProvider>
                  </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}