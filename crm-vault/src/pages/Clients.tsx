import { Search, Mail, Phone, MoreVertical } from "lucide-react";

export function Clients() {
  const clients = [
    { id: 1, name: "Acme Corp", contact: "Alice Smith", email: "alice@acme.com", phone: "+1 555-0100", status: "Active" },
    { id: 2, name: "Globex", contact: "Bob Jones", email: "bob@globex.com", phone: "+1 555-0101", status: "Active" },
    { id: 3, name: "Initech", contact: "Bill Lumbergh", email: "bill@initech.com", phone: "+1 555-0102", status: "Inactive" },
    { id: 4, name: "Soylent Corp", contact: "Charlie Brown", email: "charlie@soylent.com", phone: "+1 555-0103", status: "Active" },
  ];

  return (
    <div className="flex flex-col space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-slate-400">Manage your client relationships and contact information.</p>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            name="clientsSearch"
            placeholder="Search clients..." 
            className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 transition-all"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-sm uppercase tracking-wider text-slate-500">
              <th className="p-4 font-medium">Company</th>
              <th className="p-4 font-medium">Primary Contact</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="p-4">
                  <div className="font-medium text-slate-200">{client.name}</div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-200">{client.contact}</span>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 hover:text-indigo-400 cursor-pointer transition-colors"><Mail size={12}/> {client.email}</span>
                      <span className="flex items-center gap-1 hover:text-indigo-400 cursor-pointer transition-colors"><Phone size={12}/> {client.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    client.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {client.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded hover:bg-slate-800">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
