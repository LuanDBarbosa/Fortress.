import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FolderGit2, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';

export const ProjectsNode = ({ id, data, selected }: any) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const links = data.links || [];

  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const addLink = () => {
    if (!newTitle || !newUrl) return;
    const finalUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    
    const newLinks = [...links, { 
      id: `link-${Date.now()}`, 
      title: newTitle, 
      url: finalUrl 
    }];
    updateNode(id, { links: newLinks });
    setNewTitle('');
    setNewUrl('');
  };

  const removeLink = (linkId: string) => {
    updateNode(id, { links: links.filter((l: any) => l.id !== linkId) });
  };

  return (
    <div className={`w-72 glass-panel rounded-xl p-4 transition-colors relative ${
      selected ? 'ring-2 ring-purple-500/50 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'hover:border-slate-500/50'
    } bg-purple-500/5`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-purple-500/50 border-none" />
      
      <div className="flex items-center gap-2 mb-4 border-b border-glass-stroke pb-3">
        <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
          <FolderGit2 size={16} />
        </div>
        <input
          value={data.label || ''}
          onChange={(e) => updateNode(id, { label: e.target.value })}
          placeholder="Projects & Links"
          className="bg-transparent text-sm font-semibold text-white focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
        {links.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-4">No projects or links added.</div>
        ) : (
          links.map((link: any) => (
            <div key={link.id} className="bg-slate-900/50 rounded-lg p-2 border border-glass-stroke group relative flex items-center justify-between">
              <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-slate-300 hover:text-purple-400 truncate flex-1" onClick={(e) => e.stopPropagation()}>
                <ExternalLink size={12} className="flex-shrink-0" />
                <span className="truncate">{link.title}</span>
              </a>
              
              <button 
                onClick={(e) => { e.stopPropagation(); removeLink(link.id); }}
                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2 bg-charcoal-800 rounded-lg p-2 border border-glass-stroke">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Link Title (e.g. Figma)"
          className="bg-transparent text-xs text-white focus:outline-none px-1"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex items-center gap-2 border-t border-glass-stroke pt-2">
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addLink(); }}
            placeholder="URL..."
            className="flex-1 bg-transparent text-xs text-slate-400 focus:outline-none px-1"
            onClick={(e) => e.stopPropagation()}
          />
          <button onClick={addLink} className="text-purple-400 hover:text-purple-300">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-purple-500/50 border-none" />
    </div>
  );
};
