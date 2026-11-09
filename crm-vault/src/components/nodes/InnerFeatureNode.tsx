import { Handle, Position } from '@xyflow/react';
import { Lock, FileText, Building2, LayoutDashboard, FolderGit2, MessageSquare } from 'lucide-react';

const iconMap: Record<string, any> = {
  Building2, Lock, LayoutDashboard, FileText, FolderGit2, MessageSquare
};

export const InnerFeatureNode = ({ data, selected }: any) => {
  const IconComponent = iconMap[data.iconName] || FileText;
  return (
    <div className={`w-64 glass-panel rounded-xl p-4 cursor-pointer transition-colors relative ${
      selected ? 'ring-2 ring-electric-blue border-electric-blue/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'hover:border-slate-500'
    }`}>
      {data.isLocked && (
        <div className={`absolute top-2 right-2 rounded-full p-1 shadow-md z-10 ${data.colorClass ? data.colorClass.replace('bg-opacity-20', '').replace('/20', '') : 'bg-charcoal-800 border border-glass-stroke text-slate-400'}`}>
          <Lock size={10} />
        </div>
      )}
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-slate-500 border-none" />
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${data.colorClass || 'bg-slate-500/20 text-slate-400'}`}>
          <IconComponent size={16} />
        </div>
        <h3 className="text-white font-medium">{data.label}</h3>
      </div>
      <p className="text-xs text-slate-400 mt-2">{data.description}</p>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-slate-500 border-none" />
    </div>
  );
};
