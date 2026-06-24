import { Copy, ClipboardPaste, Edit2, Trash2, Lock, Plus, Info, LayoutDashboard, FileText, FolderGit2, MessageSquare, Image, FileArchive, Calendar, BarChart3 } from 'lucide-react';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  onEdit?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onToggleLock?: () => void;
  onGroup?: () => void;
  onAddNode?: (type: string) => void;
  isNodeMenu: boolean;
  isInnerEnv: boolean;
  selectedCount: number;
}

export function CanvasContextMenu({ x, y, onEdit, onCopy, onPaste, onDelete, onToggleLock, onGroup, onAddNode, isNodeMenu, isInnerEnv, selectedCount }: CanvasContextMenuProps) {
  return (
    <div 
      className="absolute z-50 w-48 bg-charcoal-800 border border-glass-stroke rounded-xl shadow-2xl overflow-hidden py-1"
      style={{ top: y, left: x }}
    >
      {selectedCount > 1 ? (
        <>
          <button onClick={onCopy} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
            <Copy size={14} /> Copy ({selectedCount})
          </button>
          <button onClick={() => { if(onCopy && onPaste) { onCopy(); setTimeout(onPaste, 50); } }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
            <ClipboardPaste size={14} /> Duplicate
          </button>
          <button onClick={onToggleLock} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
            <Lock size={14} /> Lock / Unlock
          </button>
          <button onClick={onGroup} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-colors border-t border-glass-stroke mt-1 pt-2">
            <Plus size={14} /> Group Nodes
          </button>
          <div className="h-px bg-glass-stroke my-1"></div>
          <button onClick={onDelete} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
            <Trash2 size={14} /> Delete ({selectedCount})
          </button>
        </>
      ) : isNodeMenu ? (
        <>
          <button onClick={onEdit} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
            <Edit2 size={14} /> Edit Node
          </button>
          <button onClick={onCopy} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
            <Copy size={14} /> Copy Node
          </button>
          <button onClick={() => { if(onCopy && onPaste) { onCopy(); setTimeout(onPaste, 50); } }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
            <ClipboardPaste size={14} /> Duplicate
          </button>
          <button onClick={onToggleLock} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
            <Lock size={14} /> Lock / Unlock
          </button>
          <div className="h-px bg-glass-stroke my-1"></div>
          <button onClick={onDelete} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </>
      ) : (
        <>
          {isInnerEnv ? (
            <div className="grid grid-cols-2 gap-1 p-2 border-b border-glass-stroke mb-1">
              <button onClick={() => onAddNode?.('briefingNode')} className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:bg-white/10 rounded transition-colors" title="Briefing">
                <Info size={14} />
                <span className="text-[10px]">Briefing</span>
              </button>
              <button onClick={() => onAddNode?.('tasksNode')} className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:bg-white/10 rounded transition-colors" title="Tasks">
                <LayoutDashboard size={14} />
                <span className="text-[10px]">Tasks</span>
              </button>
              <button onClick={() => onAddNode?.('ticketsNode')} className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:bg-white/10 rounded transition-colors" title="Tickets">
                <MessageSquare size={14} />
                <span className="text-[10px]">Tickets</span>
              </button>
              <button onClick={() => onAddNode?.('projectsNode')} className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:bg-white/10 rounded transition-colors" title="Projects">
                <FolderGit2 size={14} />
                <span className="text-[10px]">Projects</span>
              </button>
              <button onClick={() => onAddNode?.('noteNode')} className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:bg-white/10 rounded transition-colors" title="Note">
                <FileText size={14} />
                <span className="text-[10px]">Note</span>
              </button>
              <button onClick={() => onAddNode?.('calendarNode')} className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:bg-white/10 rounded transition-colors" title="Calendar">
                <Calendar size={14} />
                <span className="text-[10px]">Calendar</span>
              </button>
              <button onClick={() => onAddNode?.('graphNode')} className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:bg-white/10 rounded transition-colors" title="Graph">
                <BarChart3 size={14} />
                <span className="text-[10px]">Graph</span>
              </button>
              <button onClick={() => onAddNode?.('vaultNode')} className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:bg-white/10 rounded transition-colors" title="Vault">
                <Lock size={14} />
                <span className="text-[10px]">Vault</span>
              </button>
              <button onClick={() => onAddNode?.('mediaNode')} className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:bg-white/10 rounded transition-colors" title="Media">
                <Image size={14} />
                <span className="text-[10px]">Media</span>
              </button>
              <button onClick={() => onAddNode?.('fileNode')} className="flex flex-col items-center gap-1 p-2 text-slate-300 hover:bg-white/10 rounded transition-colors" title="Files">
                <FileArchive size={14} />
                <span className="text-[10px]">Files</span>
              </button>
            </div>
          ) : (
            <button onClick={() => onAddNode?.('globalEnv')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                <Plus size={14} /> Add Environment
            </button>
          )}
          
          <button onClick={onPaste} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
              <ClipboardPaste size={14} /> Paste Here
          </button>
        </>
      )}
    </div>
  );
}
