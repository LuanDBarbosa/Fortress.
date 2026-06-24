import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';

export const TicketsNode = ({ id, data, selected }: any) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const tickets = data.tickets || [];

  const [newTicketInput, setNewTicketInput] = useState('');

  const addTicket = () => {
    if (!newTicketInput) return;
    const newTickets = [...tickets, { 
      id: `ticket-${Date.now()}`, 
      author: 'User', 
      content: newTicketInput, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }];
    updateNode(id, { tickets: newTickets });
    setNewTicketInput('');
  };

  const removeTicket = (ticketId: string) => {
    updateNode(id, { tickets: tickets.filter((t: any) => t.id !== ticketId) });
  };

  return (
    <div className={`w-72 glass-panel rounded-xl p-4 transition-colors relative ${
      selected ? 'ring-2 ring-pink-500/50 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'hover:border-slate-500/50'
    } bg-pink-500/5`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-pink-500/50 border-none" />
      
      <div className="flex items-center gap-2 mb-4 border-b border-glass-stroke pb-3">
        <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
          <MessageSquare size={16} />
        </div>
        <input
          value={data.label || ''}
          onChange={(e) => updateNode(id, { label: e.target.value })}
          placeholder="Tickets & Messages"
          className="bg-transparent text-sm font-semibold text-white focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
        {tickets.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-4">No tickets or messages.</div>
        ) : (
          tickets.map((ticket: any) => (
            <div key={ticket.id} className="bg-slate-900/50 rounded-lg p-3 border border-glass-stroke group relative">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-pink-400">{ticket.author}</span>
                <span className="text-[10px] text-slate-500 font-geist">{ticket.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{ticket.content}</p>
              
              <button 
                onClick={() => removeTicket(ticket.id)}
                className="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 flex items-center gap-2 bg-charcoal-800 rounded-lg p-2 border border-glass-stroke">
        <input
          value={newTicketInput}
          onChange={(e) => setNewTicketInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addTicket(); }}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-xs text-white focus:outline-none"
          onClick={(e) => e.stopPropagation()}
        />
        <button onClick={addTicket} className="text-pink-400 hover:text-pink-300">
          <Plus size={16} />
        </button>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-pink-500/50 border-none" />
    </div>
  );
};
