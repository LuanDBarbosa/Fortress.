import { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FolderGit2, Plus, Trash2, ExternalLink, Copy, Check, ArrowUp, ArrowDown, X } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';

export const ProjectsNode = ({ id, data, selected }: any) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const links = data.links || [];

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Debounce for node title
  const [localLabel, setLocalLabel] = useState(data.label || '');
  const titleSyncTimeoutRef = useRef<any>(null);
  
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  useEffect(() => {
    if (data.label !== undefined && data.label !== localLabel) {
      setLocalLabel(data.label);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.label]);

  const handleTitleChange = (val: string) => {
    setLocalLabel(val);
    if (titleSyncTimeoutRef.current) clearTimeout(titleSyncTimeoutRef.current);
    titleSyncTimeoutRef.current = setTimeout(() => {
      updateNode(id, { label: val });
    }, 400);
  };

  const extractDomain = (url: string) => {
    try {
      const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
      const hostname = parsedUrl.hostname.replace(/^www\./, '');
      const parts = hostname.split('.');
      return parts.length > 0 ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : hostname;
    } catch {
      return 'Link';
    }
  };

  const addLink = () => {
    if (!newUrl) return;
    const finalUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
    const finalTitle = newTitle.trim() || extractDomain(finalUrl);
    
    let autoDesc = '';
    try {
      const parsedUrl = new URL(finalUrl);
      autoDesc = parsedUrl.pathname.replace(/^\/+/, '');
    } catch {}
    const finalDesc = newDescription.trim() || autoDesc;
    
    const newLinks = [...links, { 
      id: `link-${Date.now()}`, 
      title: finalTitle, 
      description: finalDesc,
      url: finalUrl 
    }];
    updateNode(id, { links: newLinks });
    setNewTitle('');
    setNewDescription('');
    setNewUrl('');
    setIsAdding(false);
  };

  const removeLink = (linkId: string) => {
    updateNode(id, { links: links.filter((l: any) => l.id !== linkId) });
  };

  const handleCopy = (url: string, linkId: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedIndex(linkId);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  
  const moveLink = (index: number, direction: 'up' | 'down') => {
    const newLinks = [...links];
    if (direction === 'up' && index > 0) {
      [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
    } else if (direction === 'down' && index < newLinks.length - 1) {
      [newLinks[index + 1], newLinks[index]] = [newLinks[index], newLinks[index + 1]];
    }
    updateNode(id, { links: newLinks });
  };

  return (
    <div className={`w-72 glass-panel rounded-xl p-4 transition-all duration-300 relative ${
      selected ? 'ring-2 ring-purple-500/50 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'hover:border-slate-500/50'
    } bg-purple-500/5`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-purple-500/50 border-none" />
      
      <div className="flex items-center gap-2 mb-4 border-b border-glass-stroke pb-3">
        <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
          <FolderGit2 size={16} />
        </div>
        <input className="nodrag flex-1 min-w-0 bg-transparent text-sm font-semibold text-white focus:outline-none placeholder-slate-500 transition-colors" 
          value={localLabel}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Projects & Links"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className={`space-y-2 pr-1 custom-scrollbar nodrag transition-all ${data.autoExpand ? '' : 'max-h-[250px] overflow-y-auto'}`}>
        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-slate-500 gap-2">
            <ExternalLink size={24} className="opacity-50" />
            <span className="text-xs">No projects or links added.</span>
          </div>
        ) : (
          links.map((link: any, index: number) => {
            // Attempt to build a clean domain for favicon
            let domain = '';
            try {
              domain = new URL(link.url).hostname;
            } catch {
              // fallback if url is invalid, though it shouldn't be based on addLink
            }
            const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : '';

            return (
              <div key={link.id} className="bg-slate-900/50 rounded-lg p-2 border border-glass-stroke group relative flex items-center justify-between transition-colors hover:border-slate-700 hover:bg-slate-800/50">
                <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white truncate flex-1 transition-colors min-w-0" onClick={(e) => e.stopPropagation()}>
                  {faviconUrl ? (
                    <img src={faviconUrl} alt="" className="w-4 h-4 rounded-sm object-contain bg-white/10 shrink-0" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                  ) : (
                    <ExternalLink size={14} className="shrink-0 text-slate-500" />
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate font-medium">{link.title}</span>
                    {link.description && <span className="truncate text-[10px] text-slate-500 mt-0.5 leading-none">{link.description}</span>}
                  </div>
                </a>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                  <div className="flex flex-col gap-0 mr-1">
                    <button className="nodrag text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors" onClick={(e) => { e.stopPropagation(); moveLink(index, 'up'); }} disabled={index === 0}>
                      <ArrowUp size={10} />
                    </button>
                    <button className="nodrag text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors" onClick={(e) => { e.stopPropagation(); moveLink(index, 'down'); }} disabled={index === links.length - 1}>
                      <ArrowDown size={10} />
                    </button>
                  </div>
                  <button className="nodrag text-slate-400 hover:text-purple-400 transition-colors p-1" onClick={(e) => { e.stopPropagation(); handleCopy(link.url, link.id); }} title="Copy Link">
                    {copiedIndex === link.id ? <Check size={12} className="text-purple-400" /> : <Copy size={12} />}
                  </button>
                  <button className="nodrag text-slate-500 hover:text-red-400 transition-colors p-1" onClick={(e) => { e.stopPropagation(); removeLink(link.id); }} title="Remove Link">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isAdding ? (
        <div className="mt-3 flex flex-col gap-2 bg-charcoal-800 rounded-lg p-2.5 border border-glass-stroke shadow-inner relative">
          <button onClick={() => setIsAdding(false)} className="nodrag absolute top-2 right-2 text-slate-500 hover:text-slate-300 transition-colors z-10">
            <X size={12}/>
          </button>
          <input className="nodrag bg-transparent text-xs text-white focus:outline-none px-1 placeholder-slate-500 pr-6" 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title (auto-detects if blank)"
            onClick={(e) => e.stopPropagation()}
          />
          <input className="nodrag bg-transparent text-[10px] text-slate-400 focus:outline-none px-1 placeholder-slate-600 border-t border-glass-stroke pt-2" 
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Detail / Subtitle (auto-detects)"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex items-center gap-2 border-t border-glass-stroke pt-2.5">
            <input className="nodrag flex-1 bg-transparent text-xs text-slate-400 focus:outline-none px-1 focus:text-white transition-colors placeholder-slate-600" 
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addLink(); }}
              placeholder="Paste URL..."
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            <button className="text-purple-400 hover:text-purple-300 nodrag transition-colors bg-purple-500/10 p-1.5 rounded-md border border-purple-500/20 hover:bg-purple-500/20" onClick={addLink} >
              <Check size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsAdding(true)} className="nodrag mt-3 w-full py-2 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-purple-400 hover:bg-purple-500/5 border border-dashed border-slate-700 hover:border-purple-500/30 rounded-lg transition-colors">
          <Plus size={14} /> Add Project
        </button>
      )}

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-purple-500/50 border-none" />
    </div>
  );
};
