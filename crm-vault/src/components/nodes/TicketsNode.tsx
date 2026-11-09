import { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare, Plus, Trash2, Webhook, Link, Mail, MessageCircle, Bug } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';

export const TicketsNode = ({ id, data, selected }: any) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  
  // Data arrays
  const tickets = data.tickets || []; // Used for chat mode
  const reports = data.reports || []; // Used for bug reports mode
  
  // Variant: 'chat' | 'reports' | 'integrations'
  const variant = data.variant || 'chat';
  const pings = data.pings || 0;

  // Input states
  const [newTicketInput, setNewTicketInput] = useState('');
  
  // Debounce for node title
  const [localLabel, setLocalLabel] = useState(data.label || '');
  const titleSyncTimeoutRef = useRef<any>(null);

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

  const addTicket = () => {
    if (!newTicketInput.trim()) return;
    const newTickets = [...tickets, { 
      id: `ticket-${Date.now()}`, 
      author: 'You', 
      content: newTicketInput.trim(), 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }];
    updateNode(id, { tickets: newTickets });
    setNewTicketInput('');
  };

  const removeTicket = (ticketId: string) => {
    updateNode(id, { tickets: tickets.filter((t: any) => t.id !== ticketId) });
  };

  const addReport = () => {
    if (!newTicketInput.trim()) return;
    const newReports = [...reports, { 
      id: `report-${Date.now()}`, 
      title: newTicketInput.trim(),
      status: 'Open',
      timestamp: new Date().toLocaleDateString()
    }];
    updateNode(id, { reports: newReports });
    setNewTicketInput('');
  };

  const toggleReportStatus = (reportId: string) => {
    const newReports = reports.map((r: any) => {
      if (r.id === reportId) {
        return { ...r, status: r.status === 'Open' ? 'Resolved' : 'Open' };
      }
      return r;
    });
    updateNode(id, { reports: newReports });
  };

  const removeReport = (reportId: string) => {
    updateNode(id, { reports: reports.filter((r: any) => r.id !== reportId) });
  };

  return (
    <div className={`w-80 glass-panel rounded-xl p-4 transition-all duration-300 relative ${
      selected ? 'ring-2 ring-pink-500/50 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'hover:border-slate-500/50'
    } bg-pink-500/5`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-pink-500/50 border-none" />
      
      {/* PINGS BADGE */}
      {pings > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] z-20 animate-pulse-soft">
          {pings > 99 ? '99+' : pings}
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3 border-b border-glass-stroke pb-3">
        <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 shrink-0">
          {variant === 'chat' && <MessageCircle size={16} />}
          {variant === 'reports' && <Bug size={16} />}
          {variant === 'integrations' && <Link size={16} />}
          {!['chat', 'reports', 'integrations'].includes(variant) && <MessageSquare size={16} />}
        </div>
        <input className="nodrag flex-1 min-w-0 bg-transparent text-sm font-semibold text-white focus:outline-none placeholder-slate-500 transition-colors" 
          value={localLabel}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder={variant === 'reports' ? "Bug Reports" : variant === 'integrations' ? "Integrations Hub" : "Team Chat"}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* CONTENT AREA */}
      <div className={`space-y-3 pr-1 custom-scrollbar nodrag transition-all ${data.autoExpand ? '' : 'max-h-[250px] overflow-y-auto'}`}>
        
        {/* CHAT MODE */}
        {variant === 'chat' && (
          tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-slate-500 gap-2">
              <MessageCircle size={24} className="opacity-50" />
              <span className="text-xs">No messages in team chat.</span>
            </div>
          ) : (
            tickets.map((ticket: any) => {
              const isYou = ticket.author === 'You';
              return (
                <div key={ticket.id} className={`flex flex-col group relative ${isYou ? 'items-end' : 'items-start'}`}>
                  <div className={`text-[9px] font-bold mb-0.5 px-1 ${isYou ? 'text-pink-400' : 'text-slate-400'}`}>{ticket.author} • {ticket.timestamp}</div>
                  <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[85%] relative border ${isYou ? 'bg-pink-500/10 border-pink-500/20 text-pink-50 rounded-br-sm' : 'bg-slate-800/80 border-slate-700 text-slate-200 rounded-bl-sm'}`}>
                    {ticket.content}
                    <button className="nodrag absolute -top-2 -right-2 bg-slate-800 border border-slate-700 rounded-full p-1 text-slate-500 hover:text-red-400 hover:border-red-500/50 opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"  
                      onClick={() => removeTicket(ticket.id)}
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              );
            })
          )
        )}

        {/* REPORTS MODE */}
        {variant === 'reports' && (
          reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-slate-500 gap-2">
              <Bug size={24} className="opacity-50" />
              <span className="text-xs text-center">No bug reports.<br/>Webhook URL not configured.</span>
            </div>
          ) : (
            reports.map((report: any) => (
              <div key={report.id} className="bg-slate-900/50 rounded-lg p-2.5 border border-glass-stroke group relative hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-slate-200 pr-4">{report.title}</span>
                  <button className="nodrag text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"  
                    onClick={() => removeReport(report.id)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[10px] text-slate-500">{report.timestamp}</span>
                  <button 
                    onClick={() => toggleReportStatus(report.id)}
                    className={`nodrag text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-colors ${report.status === 'Resolved' ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'}`}
                  >
                    {report.status}
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {/* INTEGRATIONS MODE */}
        {variant === 'integrations' && (
          <div className="space-y-2">
            <div className="bg-slate-900/50 rounded-lg p-3 border border-glass-stroke flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><Mail size={14}/></div>
                <div>
                  <div className="text-xs font-bold text-white">Gmail App</div>
                  <div className="text-[10px] text-slate-400">Sync project emails</div>
                </div>
              </div>
              <button className="nodrag text-[10px] font-bold bg-slate-800 text-white px-3 py-1.5 rounded-md border border-slate-700 hover:bg-slate-700 transition-colors">Connect</button>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-3 border border-glass-stroke flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><MessageCircle size={14}/></div>
                <div>
                  <div className="text-xs font-bold text-white">WhatsApp</div>
                  <div className="text-[10px] text-slate-400">Client messages API</div>
                </div>
              </div>
              <button className="nodrag text-[10px] font-bold bg-slate-800 text-white px-3 py-1.5 rounded-md border border-slate-700 hover:bg-slate-700 transition-colors">Connect</button>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-3 border border-glass-stroke flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Webhook size={14}/></div>
                <div>
                  <div className="text-xs font-bold text-white">Custom Webhook</div>
                  <div className="text-[10px] text-slate-400">Receive external POST data</div>
                </div>
              </div>
              <button className="nodrag text-[10px] font-bold bg-slate-800 text-white px-3 py-1.5 rounded-md border border-slate-700 hover:bg-slate-700 transition-colors">Setup</button>
            </div>
          </div>
        )}

      </div>

      {/* INPUT AREA (Only for Chat and Reports) */}
      {variant !== 'integrations' && (
        <div className="mt-4 flex items-center gap-2 bg-charcoal-800 rounded-lg p-2 border border-glass-stroke shadow-inner">
          <input className="nodrag flex-1 bg-transparent text-xs text-white focus:outline-none placeholder-slate-500 px-1" 
            value={newTicketInput}
            onChange={(e) => setNewTicketInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { variant === 'chat' ? addTicket() : addReport(); } }}
            placeholder={variant === 'chat' ? "Type a message..." : "Add a dummy report..."}
            onClick={(e) => e.stopPropagation()}
          />
          <button className="text-pink-400 hover:text-pink-300 nodrag transition-colors bg-pink-500/10 p-1.5 rounded-md border border-pink-500/20 hover:bg-pink-500/20" onClick={variant === 'chat' ? addTicket : addReport} >
            <Plus size={14} />
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-pink-500/50 border-none" />
    </div>
  );
};
