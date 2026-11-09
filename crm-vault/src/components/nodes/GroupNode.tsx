import { useCallback } from 'react';
import { NodeResizer } from '@xyflow/react';
import { Ungroup } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import { GROUP_COLOR_MAP } from '../../utils/groupColors';

export const GroupNode = ({ id, data, selected }: any) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const ungroupNodes = useCanvasStore((state) => state.ungroupNodes);

  const onChangeTitle = useCallback((evt: any) => {
    updateNode(id, { label: evt.target.value });
  }, [id, updateNode]);

  const theme = GROUP_COLOR_MAP[data.color as string] || GROUP_COLOR_MAP.slate;

  return (
    <>
      <NodeResizer 
        color={theme.resizer} 
        isVisible={selected} 
        minWidth={200} 
        minHeight={150} 
        handleClassName="w-3 h-3 rounded-sm border-none nodrag z-[100]"
        lineClassName="z-[100]"
        onResizeStart={() => {
          useCanvasStore.getState().setIsInteracting(true);
        }}
        onResizeEnd={(_evt, params) => {
          useCanvasStore.getState().updateNodeStyle(id, { width: params.width, height: params.height });
          useCanvasStore.getState().onNodesChange([{ type: 'position', id, position: { x: params.x, y: params.y } } as any]);
          useCanvasStore.getState().setIsInteracting(false);
          useCanvasStore.getState().commitHistory();
        }}
      />
      
      <div 
        className={`w-full h-full rounded-2xl transition-colors relative border-2 border-dashed ${
          selected ? `${theme.border} ${theme.bg}` : `border-slate-500/50 ${theme.bg} hover:border-slate-400/80`
        }`}
        style={{ minWidth: 200, minHeight: 150 }}
      >
        <div className={`absolute top-0 left-0 right-0 h-10 border-b ${theme.header} bg-slate-900/60 backdrop-blur-sm rounded-t-2xl flex items-center justify-between px-4 z-10`}>
          <div className="flex items-center gap-3 w-1/2">
            <input
              name="groupNodeLabel"
              value={data.label || 'New Group'}
              onChange={onChangeTitle}
              className={`bg-transparent text-xs font-bold focus:outline-none uppercase tracking-wider w-full ${selected ? 'text-white' : theme.text}`}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); ungroupNodes(id); }}
              className="nodrag flex items-center gap-1 bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-white px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer z-50"
            >
              <Ungroup size={12} /> Ungroup
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
