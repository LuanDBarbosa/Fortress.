import { useState } from 'react';
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Users, Lock, Plus, Search, Bell, Info, LayoutDashboard, FileText, FolderGit2, MessageSquare, Image, FileArchive, Calendar, BarChart3 } from "lucide-react";
import { useCanvasStore } from "../store/canvasStore";

export function Layout() {
  const location = useLocation();
  const { activeEnvId, addNode } = useCanvasStore();
  const [isMiniDockOpen, setIsMiniDockOpen] = useState(false);

  const navItems = [
    { path: "/", icon: <Home size={22} /> },
    { path: "/clients", icon: <Users size={22} /> },
    { path: "/vault", icon: <Lock size={22} /> },
  ];

  const handleAddClick = () => {
    if (location.pathname === "/") {
      if (activeEnvId) {
        setIsMiniDockOpen(!isMiniDockOpen);
      } else {
        addNode({
          id: `env-${Date.now()}`,
          type: 'globalEnv',
          position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
          data: { id: `env-${Date.now()}`, label: 'New Environment', status: 'ENCRYPTED', code: 'NEW-001', tasksCompleted: 0, tasksTotal: 0 }
        });
      }
    }
  };

  const spawnNode = (type: string) => {
    addNode({
      id: `node-${Date.now()}`,
      type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: { label: 'New Node', secrets: [], text: '', tasks: [], links: [], tickets: [] }
    });
    setIsMiniDockOpen(false);
  };

  const miniDockItems = [
    { type: 'briefingNode', icon: <Info size={18} />, label: 'Briefing' },
    { type: 'vaultNode', icon: <Lock size={18} />, label: 'Vault' },
    { type: 'tasksNode', icon: <LayoutDashboard size={18} />, label: 'Tasks' },
    { type: 'noteNode', icon: <FileText size={18} />, label: 'Notes' },
    { type: 'projectsNode', icon: <FolderGit2 size={18} />, label: 'Projects' },
    { type: 'ticketsNode', icon: <MessageSquare size={18} />, label: 'Tickets' },
    { type: 'mediaNode', icon: <Image size={18} />, label: 'Media' },
    { type: 'fileNode', icon: <FileArchive size={18} />, label: 'Files' },
    { type: 'calendarNode', icon: <Calendar size={18} />, label: 'Calendar' },
    { type: 'graphNode', icon: <BarChart3 size={18} />, label: 'Graph' }

  ];

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans relative">
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-8 flex-shrink-0 z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold font-geist tracking-tight">Fortress<span className="text-vault-green">.</span></h1>
        </div>
        
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-electric-blue transition-colors" size={18} />
            <input 
              type="text" 
              name="globalSearch"
              placeholder="Search Vault, Commands, or Clients (Cmd + K)..." 
              className="w-full bg-charcoal-800/50 border border-glass-stroke rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-electric-blue/50 focus:ring-1 focus:ring-electric-blue/50 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-white transition-colors">
            <Bell size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-charcoal-800 border border-glass-stroke overflow-hidden flex items-center justify-center">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden bg-slate-900">
        <Outlet />
      </main>

      {/* Floating Bottom Nav */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
        {/* Mini Dock */}
        {isMiniDockOpen && (
          <div className="glass-panel rounded-full px-4 py-2 flex items-center gap-3 shadow-2xl shadow-black/50 border border-glass-stroke bg-charcoal-800/90 backdrop-blur-md animate-in slide-in-from-bottom-2 fade-in duration-200">
            {miniDockItems.map((item) => (
              <button
                key={item.type}
                onClick={() => spawnNode(item.type)}
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors group relative flex items-center justify-center"
                title={item.label}
              >
                {item.icon}
                <span className="absolute -top-8 bg-slate-800 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-glass-stroke">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Main Dock */}
        <div className="glass-panel rounded-full px-2 py-2 flex items-center gap-2 shadow-2xl shadow-black/50 border border-glass-stroke bg-charcoal-800/80 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`p-3 rounded-full transition-all duration-300 ${
                  isActive 
                    ? "text-vault-green" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {item.icon}
              </Link>
            );
          })}
          <div className="w-[1px] h-8 bg-glass-stroke mx-1"></div>
          <button 
            onClick={handleAddClick}
            className={`p-3 ml-1 rounded-full transition-transform shadow-lg cursor-pointer ${isMiniDockOpen ? 'bg-red-500 text-white rotate-45' : 'bg-white text-black hover:scale-105'}`}
          >
            <Plus size={22} className="transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
