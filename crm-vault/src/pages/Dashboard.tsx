import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Panel,
  Background,
  Handle,
  Position,
  BackgroundVariant,
  Node,
  useViewport,
  useReactFlow,
  useNodesState,
  useEdgesState,
  SelectionMode,
  useStore
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Building2, Lock, ArrowRight, LayoutDashboard, FileText, FolderGit2, MessageSquare, ArrowLeft } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useCanvasStore } from '../store/canvasStore';
import { usePhysicsLayout } from '../hooks/usePhysicsLayout';
import { CanvasContextMenu } from '../components/CanvasContextMenu';
import { NodeEditorModal } from '../components/NodeEditorModal';
import { NoteNode } from '../components/nodes/NoteNode';
import { VaultNode } from '../components/nodes/VaultNode';
import { MediaNode } from '../components/nodes/MediaNode';
import { BriefingNode } from '../components/nodes/BriefingNode';
import { TasksNode } from '../components/nodes/TasksNode';
import { TicketsNode } from '../components/nodes/TicketsNode';
import { ProjectsNode } from '../components/nodes/ProjectsNode';
import { FileNode } from '../components/nodes/FileNode';
import { GroupNode } from '../components/nodes/GroupNode';
import { CalendarNode } from '../components/nodes/CalendarNode';
import { GraphNode } from '../components/nodes/GraphNode';

// --- CONTEXT MENU CONTAINER ---
// Translates static flow coordinates to dynamic screen coordinates for panning
const ContextMenuContainer = ({ contextMenu, closeContextMenu, selectedNodeIds, copyNodes, pasteNodes, setEditingNodeId, deleteNodes, addNode, groupNodes }: any) => {
  const { screenToFlowPosition, flowToScreenPosition } = useReactFlow();
  // @ts-ignore - Subscribe to viewport changes to trigger re-renders!
  const _viewport = useViewport(); 

  // Freeze the target position in the canvas' absolute flow space
  const initialFlowPos = useMemo(() => {
    return screenToFlowPosition({ x: contextMenu.x, y: contextMenu.y });
  }, [contextMenu.x, contextMenu.y, screenToFlowPosition]);

  // Automatically recalculates screen projection when panning/zooming!
  const screenPos = flowToScreenPosition(initialFlowPos);

  return (
    <CanvasContextMenu 
      x={screenPos.x} 
      y={screenPos.y} 
      isNodeMenu={!!contextMenu.nodeId}
      isInnerEnv={!!useCanvasStore.getState().activeEnvId}
      selectedCount={selectedNodeIds.length}
      onEdit={() => {
        if (contextMenu.nodeId) setEditingNodeId(contextMenu.nodeId);
        closeContextMenu();
      }}
      onCopy={() => {
        const targets = selectedNodeIds.length > 1 ? selectedNodeIds : (contextMenu.nodeId ? [contextMenu.nodeId] : []);
        if (targets.length > 0) copyNodes(targets);
        closeContextMenu();
      }}
      onPaste={() => {
        pasteNodes();
        closeContextMenu();
      }}
      onDelete={() => {
        const targets = selectedNodeIds.length > 1 ? selectedNodeIds : (contextMenu.nodeId ? [contextMenu.nodeId] : []);
        if (targets.length > 0) deleteNodes(targets);
        closeContextMenu();
      }}
      onToggleLock={() => {
        const targets = selectedNodeIds.length > 1 ? selectedNodeIds : (contextMenu.nodeId ? [contextMenu.nodeId] : []);
        if (targets.length > 0) useCanvasStore.getState().toggleLockNodes(targets);
        closeContextMenu();
      }}
      onGroup={() => {
        if (selectedNodeIds.length > 1) {
          groupNodes(selectedNodeIds);
        }
        closeContextMenu();
      }}
      onAddNode={(type: string) => {
        addNode({
          id: `node-${Date.now()}`,
          type: type || (useCanvasStore.getState().activeEnvId ? 'innerFeature' : 'globalEnv'),
          position: initialFlowPos,
          data: { 
            label: 'New Node',
            description: '',
            status: 'DECRYPTED',
            tasksCompleted: 0,
            tasksTotal: 0,
            secrets: []
          }
        });
        closeContextMenu();
      }}
    />
  );
};

const iconMap: Record<string, any> = {
  Building2, Lock, LayoutDashboard, FileText, FolderGit2, MessageSquare
};

// --- CUSTOM NODES ---

const GlobalEnvironmentNode = ({ data, selected }: any) => {
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
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-charcoal-800 flex items-center justify-center border border-glass-stroke">
            <Building2 size={20} className="text-slate-300" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{data.label}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-2 h-2 rounded-full ${data.status === 'DECRYPTED' ? 'bg-vault-green shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-500'}`}></div>
              <span className="text-[10px] font-geist tracking-widest text-slate-400 uppercase">{data.status} • {data.code}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>Tasks Completed</span>
          <span className="text-slate-200">{data.tasksCompleted} / {data.tasksTotal}</span>
        </div>
        <div className="h-1 w-full bg-charcoal-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${data.status === 'DECRYPTED' ? 'bg-vault-green' : 'bg-slate-500'}`} 
            style={{ width: `${data.tasksTotal > 0 ? (data.tasksCompleted / data.tasksTotal) * 100 : 0}%` }}
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

const InnerFeatureNode = ({ data, selected }: any) => {
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

// --- CUSTOM CONTROLS ---
const CustomControls = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  // ONLY subscribe to zoom changes to prevent 144fps re-renders during panning!
  const zoom = useStore((s) => s.transform[2]);
  
  return (
    <Panel position="bottom-left" className="mb-6 ml-6 pointer-events-auto">
      <div className="glass-panel rounded-full flex items-center p-1.5 shadow-2xl">
        <button onClick={() => zoomOut()} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors" title="Zoom Out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
        <div className="w-px h-5 bg-glass-stroke mx-1"></div>
        <div className="min-w-[56px] px-2 text-[11px] font-geist text-slate-300 text-center select-none tracking-wider">
          {Math.round(zoom * 100)}%
        </div>
        <div className="w-px h-5 bg-glass-stroke mx-1"></div>
        <button onClick={() => zoomIn()} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors" title="Zoom In">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
        </button>
        <div className="w-px h-5 bg-glass-stroke mx-1"></div>
        <button onClick={() => fitView({ duration: 800 })} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors" title="Fit to Screen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8V4m0 0h4M4 4l5 5M20 8V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5M20 16v4m0 0h-4m4 0l-5-5"/></svg>
        </button>
      </div>
    </Panel>
  );
};

export function Dashboard() {
  const activeEnvId = useCanvasStore(state => state.activeEnvId);
  const storeNodes = useCanvasStore(useShallow(state => activeEnvId ? (state.envNodes[activeEnvId] || []) : state.globalNodes));
  const storeEdges = useCanvasStore(useShallow(state => activeEnvId ? (state.envEdges[activeEnvId] || []) : state.globalEdges));

  const {
    setActiveEnvId,
    updateNode,
    addNode,
    copyNodes,
    pasteNodes,
    deleteNodes,
    groupNodes,
    detachNodeFromGroup,
    attachNodeToGroup,
    undo,
    redo
  } = useCanvasStore(useShallow(state => ({
    setActiveEnvId: state.setActiveEnvId,
    updateNode: state.updateNode,
    addNode: state.addNode,
    copyNodes: state.copyNodes,
    pasteNodes: state.pasteNodes,
    deleteNodes: state.deleteNodes,
    groupNodes: state.groupNodes,
    detachNodeFromGroup: state.detachNodeFromGroup,
    attachNodeToGroup: state.attachNodeToGroup,
    undo: state.undo,
    redo: state.redo
  })));

  // Local Uncontrolled State for 144fps Rendering
  const [localNodes, setLocalNodes, onLocalNodesChange] = useNodesState(storeNodes);
  const [localEdges, setLocalEdges, onLocalEdgesChange] = useEdgesState(storeEdges);

  const localNodesRef = useRef(localNodes);
  useEffect(() => {
    localNodesRef.current = localNodes;
  }, [localNodes]);

  // Sync from Global Store -> Local (Only runs if store array reference actually changes)
  useEffect(() => {
    setLocalNodes(storeNodes);
  }, [storeNodes, setLocalNodes]);

  useEffect(() => {
    setLocalEdges(storeEdges);
  }, [storeEdges, setLocalEdges]);

  // Intercept ReactFlow changes: Keep local state at 144fps, but ONLY sync to global store 
  // when NOT actively dragging! This completely eliminates React reconciliation stutter!
  const handleLocalNodesChange = useCallback((changes: any[]) => {
    onLocalNodesChange(changes);
    
    const nonDragChanges = changes.filter(c => c.type !== 'position' || !c.dragging);
    if (nonDragChanges.length > 0) {
      // Defer global store updates to avoid React render cycle conflicts (fixes warning)
      setTimeout(() => {
        useCanvasStore.getState().onNodesChange(nonDragChanges);
      }, 0);
    }
  }, [onLocalNodesChange]);

  const handleLocalEdgesChange = useCallback((changes: any[]) => {
    onLocalEdgesChange(changes);
    setTimeout(() => {
      useCanvasStore.getState().onEdgesChange(changes);
    }, 0);
  }, [onLocalEdgesChange]);

  // Selected Nodes Tracking
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId?: string } | null>(null);
  
  // Editor Modal State
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // GPU Optimization Ref (Bypass React state to prevent VDOM panning stutter)
  const flowWrapperRef = useRef<HTMLDivElement>(null);

  const nodeTypes = useMemo(() => ({
    globalEnv: GlobalEnvironmentNode,
    innerFeature: InnerFeatureNode,
    noteNode: NoteNode,
    vaultNode: VaultNode,
    mediaNode: MediaNode,
    briefingNode: BriefingNode,
    tasksNode: TasksNode,
    ticketsNode: TicketsNode,
    projectsNode: ProjectsNode,
    fileNode: FileNode,
    groupNode: GroupNode,
    calendarNode: CalendarNode,
    graphNode: GraphNode
  }), []);

  // PHYSICS LAYOUT - Purely localized, doesn't hit Zustand!
  // This prevents the global store from overwriting the local dragging state!
  const setNodesForPhysics = useCallback((updated: Node[]) => {
    setLocalNodes(nds => {
      const updatedMap = new Map(updated.map(n => [n.id, n]));
      return nds.map(n => {
        if (updatedMap.has(n.id)) {
          // Keep internal states like dragging intact!
          return { ...n, position: updatedMap.get(n.id)!.position };
        }
        return n;
      });
    });
  }, [setLocalNodes]);

  usePhysicsLayout(localNodes as any, setNodesForPhysics, true);

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) redo(); else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        copyNodes(selectedNodeIds);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        pasteNodes();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, copyNodes, pasteNodes, selectedNodeIds]);

  // CONTEXT MENUS
  const onNodeContextMenu = useCallback(
    (event: any, node: Node) => {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
    },
    []
  );

  const onPaneContextMenu = useCallback(
    (event: any) => {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY });
    },
    []
  );

  const closeContextMenu = () => setContextMenu(null);

  // STABLE SELECTION HANDLER to prevent infinite loops
  const handleSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
    const newIds = selectedNodes.map(n => n.id).sort();
    setSelectedNodeIds(prev => {
      const prevIds = [...prev].sort();
      if (prevIds.length === newIds.length && prevIds.every((id, i) => id === newIds[i])) {
        return prev;
      }
      return newIds;
    });
  }, []);

  // DRAG HISTORY PAUSE
  const onNodeDragStart = () => {
    // History is paused by not having continuous position changes in the history stack
  };
  
  // Removed separate onNodeDragStop callback to avoid race conditions with grouping

  // KEYCHANGE HACK to force remount
  const graphKey = activeEnvId ? `env-${activeEnvId}` : 'global';

  return (
    <div 
      ref={flowWrapperRef} 
      className="absolute inset-0"
      onContextMenu={(e) => {
        // Fallback for right click if React Flow swallows it due to panOnDrag settings
        if (!e.defaultPrevented) {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY });
        }
      }}
    >
      {/* Top Left Navigation Header overlay */}
      <div className="absolute top-6 left-8 z-10 flex items-center gap-4">
        {activeEnvId ? (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveEnvId(null)}
              className="w-8 h-8 rounded bg-charcoal-800 border border-glass-stroke flex items-center justify-center hover:bg-slate-700 transition-colors text-slate-300"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 glass-panel rounded-lg">
              <span className="text-slate-400 text-sm">Environment View</span>
            </div>
          </div>
        ) : (
          <div className="flex bg-charcoal-800 rounded-lg p-1 border border-glass-stroke shadow-2xl">
            <button className="px-4 py-1.5 rounded-md bg-slate-700 text-white text-sm font-medium shadow">Graph</button>
            <button className="px-4 py-1.5 rounded-md text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors">List</button>
          </div>
        )}
      </div>

      <ReactFlow
        key={graphKey}
        nodes={localNodes as any}
        edges={localEdges as any}
        onNodesChange={handleLocalNodesChange}
        onEdgesChange={handleLocalEdgesChange}
        onConnect={useCanvasStore.getState().onConnect}
        nodeTypes={nodeTypes}
        onSelectionChange={handleSelectionChange}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={closeContextMenu}
        onNodeClick={closeContextMenu}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={(_, node) => {
          setTimeout(() => {
            // 1. Push ALL final physics positions to the global store FIRST
            const currentLocalNodes = localNodesRef.current;
            const changes = currentLocalNodes.map(n => ({ type: 'position', id: n.id, position: n.position }));
            useCanvasStore.getState().onNodesChange(changes as any);
            
            // 2. Now perform grouping checks using the synced absolute/relative positions
            if (node.type === 'groupNode') {
              useCanvasStore.getState().commitHistory();
              return;
            }

            // Check for dragging out of group
            if (node.parentId) {
              const parent = currentLocalNodes.find((n: any) => n.id === node.parentId);
              if (parent) {
                const absX = parent.position.x + node.position.x;
                const absY = parent.position.y + node.position.y;
                const w = parent.style?.width as number || parent.measured?.width || 0;
                const h = parent.style?.height as number || parent.measured?.height || 0;
                
                if (
                  node.position.x < 0 || 
                  node.position.y < 0 || 
                  node.position.x > w || 
                  node.position.y > h
                ) {
                  useCanvasStore.getState().detachNodeFromGroup(node.id, { x: absX, y: absY });
                }
              }
            } else {
              // Check for joining a group
              const nodeW = node.style?.width as number || node.measured?.width || 100;
              const nodeH = node.style?.height as number || node.measured?.height || 100;
              const centerX = node.position.x + nodeW / 2;
              const centerY = node.position.y + nodeH / 2;

              const groups = currentLocalNodes.filter((n: any) => n.type === 'groupNode');
              for (let i = groups.length - 1; i >= 0; i--) {
                const g = groups[i];
                const gX = g.position.x;
                const gY = g.position.y;
                const gW = g.style?.width as number || g.measured?.width || 0;
                const gH = g.style?.height as number || g.measured?.height || 0;

                if (centerX >= gX && centerX <= gX + gW && centerY >= gY && centerY <= gY + gH) {
                  useCanvasStore.getState().attachNodeToGroup(node.id, g.id);
                  break;
                }
              }
            }
            
            useCanvasStore.getState().commitHistory();
          }, 0);
        }}
        onMoveStart={() => flowWrapperRef.current?.classList.add('is-panning')}
        onMoveEnd={() => flowWrapperRef.current?.classList.remove('is-panning')}
        fitView
        fitViewOptions={{ padding: 0.5, duration: 800 }}
        className="bg-slate-900"
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        selectionOnDrag
        panOnDrag={[1]}
        selectionMode={SelectionMode.Partial}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={2} 
          color="rgba(255,255,255,0.05)" 
        />
        <CustomControls />

        {/* CONTEXT MENU */}
        {contextMenu && (
          <ContextMenuContainer 
            contextMenu={contextMenu}
            closeContextMenu={closeContextMenu}
            selectedNodeIds={selectedNodeIds}
            copyNodes={copyNodes}
            pasteNodes={pasteNodes}
            setEditingNodeId={setEditingNodeId}
            deleteNodes={deleteNodes}
            addNode={addNode}
            groupNodes={groupNodes}
          />
        )}
      </ReactFlow>

      {/* EDITOR MODAL */}
      {editingNodeId && (() => {
        const node = localNodes.find(n => n.id === editingNodeId);
        if (!node) return null;
        return (
          <NodeEditorModal 
            nodeId={editingNodeId}
            nodeType={node.type}
            initialData={node.data}
            onSave={updateNode}
            onClose={() => setEditingNodeId(null)}
          />
        );
      })()}
    </div>
  );
}
