import { Building2, Lock, ArrowRight } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';

export const GlobalEnvNode = ({ data, selected }: any) => {
  return (
    <div 
      className={`w-80 glass-panel rounded-xl p-5 transition-all cursor-pointer relative ${
        selected ? 'ring-2 ring-vault-green ring-offset-4 ring-offset-slate-900 border-vault-green/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'hover:glass-panel-hover'
      }`}
      onDoubleClick={() => useCanvasStore.getState().setActiveEnvId(data.id)}
    >
      {data.isLocked && (
        <div className="absolute top-2 right-2 bg-charcoal-800 border border-glass-stroke rounded-full p-1 shadow-md z-10">
          <Lock size={10} className="text-slate-400" />
        </div>
      )}
      {(data.pings || 0) > 0 && (
        <div className={`absolute ${data.isLocked ? 'top-8' : 'top-2'} right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] z-20 animate-pulse-soft`}>
          {data.pings > 99 ? '99+' : data.pings}
        </div>
      )}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center border border-glass-stroke">
            <Building2 size={20} className="text-slate-300" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{data.label}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-2 h-2 rounded-full ${data.status === 'DECRYPTED' ? 'bg-vault-green shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-500'}`}></div>
              <span className="text-[10px] font-geist tracking-widest text-slate-400 uppercase">{data.status || 'DECRYPTED'} • {data.code}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>Tasks Completed</span>
          <span className="text-slate-200">{data.tasksCompleted || 0} / {data.tasksTotal || 0}</span>
        </div>
        <div className="h-1 w-full bg-charcoal-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${data.status === 'DECRYPTED' ? 'bg-vault-green' : 'bg-slate-500'}`} 
            style={{ width: `${(data.tasksTotal || 0) > 0 ? ((data.tasksCompleted || 0) / (data.tasksTotal || 0)) * 100 : 0}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="flex gap-2">
          {data.tag && (
            <span className="text-[10px] px-2 py-1 rounded border border-red-500/20 bg-red-500/10 text-red-400 font-geist uppercase">
              {data.tag}
            </span>
          )}
        </div>
        <div 
          className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center ml-auto hover:bg-white/10 hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            useCanvasStore.getState().setActiveEnvId(data.id);
          }}
        >
          <ArrowRight size={12} className="text-slate-400 hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
};
