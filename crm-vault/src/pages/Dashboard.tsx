import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Panel,
  Background,
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
import { ArrowLeft } from 'lucide-react';
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
import { GlobalEnvNode } from '../components/nodes/GlobalEnvNode';
import { InnerFeatureNode } from '../components/nodes/InnerFeatureNode';
import { TicketsNode } from '../components/nodes/TicketsNode';
import { ProjectsNode } from '../components/nodes/ProjectsNode';
import { FileNode } from '../components/nodes/FileNode';
import { GroupNode } from '../components/nodes/GroupNode';
import { CalendarNode } from '../components/nodes/CalendarNode';
import { GraphNode } from '../components/nodes/GraphNode';
import CustomEdge from '../components/edges/CustomEdge';

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
        const resolvedType = type || (useCanvasStore.getState().activeEnvId ? 'innerFeature' : 'globalEnv');
        const defaultLabel = resolvedType.replace('Node', '');
        addNode({
          id: `node-${Date.now()}`,
          type: resolvedType,
          position: initialFlowPos,
          data: { 
            label: defaultLabel.charAt(0).toUpperCase() + defaultLabel.slice(1),
            description: '',
            status: 'DECRYPTED',
            tasksCompleted: 0,
            tasksTotal: 0,
            secrets: []
          },
          style: resolvedType === 'groupNode' ? { width: 300, height: 200 } : resolvedType === 'mediaNode' ? { width: 256, height: 200 } : undefined
        });
        closeContextMenu();
      }}
    />
  );
};


const edgeTypes = {
  default: CustomEdge,
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

  const isInteracting = useCanvasStore(state => state.isInteracting);
  const setIsInteracting = useCanvasStore(state => state.setIsInteracting);

  // Sync from Global Store -> Local (Only runs if store array reference actually changes)
  // PAUSE sync if actively dragging/resizing to prevent VDOM stutter!
  useEffect(() => {
    if (!isInteracting) {
      setLocalNodes(storeNodes);
    }
  }, [storeNodes, setLocalNodes, isInteracting]);

  useEffect(() => {
    setLocalEdges(storeEdges);
  }, [storeEdges, setLocalEdges]);

  const handleLocalNodesChange = useCallback((changes: any[]) => {
    onLocalNodesChange(changes);
    
    const isActivelyInteracting = changes.some(c => c.dragging || c.resizing);
    
    // Filter out continuous position and dimensions changes to prevent 144fps global store updates
    // which would cause massive React tree re-renders and stuttering.
    const nonDragChanges = changes.filter(c => {
      if ((c.type === 'position' || c.type === 'dimensions') && isActivelyInteracting) {
        return false;
      }
      return true;
    });

    if (nonDragChanges.length > 0) {
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
    globalEnv: GlobalEnvNode,
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
    setIsInteracting(true);
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
          const target = e.target as HTMLElement;
          
          if (target.closest('.react-flow__node')) {
            return; // Let node handlers do their thing
          }
          
          if (selectedNodeIds.length > 0) {
            // Right-clicking the selection pane should show node actions!
            setContextMenu({ x: e.clientX, y: e.clientY, nodeId: selectedNodeIds[0] });
          } else {
            // Normal canvas right click
            setContextMenu({ x: e.clientX, y: e.clientY });
          }
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
        edgeTypes={edgeTypes}
        onSelectionChange={handleSelectionChange}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={closeContextMenu}
        onNodeClick={closeContextMenu}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={(_, node) => {
          setTimeout(() => {
            setIsInteracting(false);
            // 1. Push ALL final physics positions to the global store FIRST
            const currentLocalNodes = localNodesRef.current;
            const changes = currentLocalNodes.map(n => ({ type: 'position', id: n.id, position: n.position }));
            useCanvasStore.getState().onNodesChange(changes as any);
            
            // 2. Now perform grouping checks using the synced absolute/relative positions
            if (node.type === 'groupNode') {
              useCanvasStore.getState().commitHistory();
              return;
            }

            // Check for dragging out of group or resizing
            if (node.parentId) {
              const parent = currentLocalNodes.find((n: any) => n.id === node.parentId);
              if (parent) {
                const absX = parent.position.x + node.position.x;
                const absY = parent.position.y + node.position.y;
                const parentW = parent.style?.width as number || parent.measured?.width || 0;
                const parentH = parent.style?.height as number || parent.measured?.height || 0;
                const nodeW = node.style?.width as number || node.measured?.width || 250;
                const nodeH = node.style?.height as number || node.measured?.height || 150;
                
                // If completely dragged out, detach it
                if (
                  node.position.x + nodeW < 0 || 
                  node.position.y + nodeH < 0 || 
                  node.position.x > parentW || 
                  node.position.y > parentH
                ) {
                  useCanvasStore.getState().detachNodeFromGroup(node.id, { x: absX, y: absY });
                } else {
                  // If pushed near right/bottom edge, auto-resize parent group
                  const PADDING = 40;
                  let newW = parentW;
                  let newH = parentH;
                  let needsResize = false;

                  if (node.position.x + nodeW + PADDING > parentW) {
                    newW = node.position.x + nodeW + PADDING;
                    needsResize = true;
                  }
                  if (node.position.y + nodeH + PADDING > parentH) {
                    newH = node.position.y + nodeH + PADDING;
                    needsResize = true;
                  }

                  if (needsResize) {
                    useCanvasStore.getState().updateNodeStyle(parent.id, { width: newW, height: newH });
                  }
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
