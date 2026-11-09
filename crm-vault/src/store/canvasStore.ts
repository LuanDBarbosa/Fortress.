import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  addEdge,
} from '@xyflow/react';

type HistoryState = {
  globalNodes: Node[];
  globalEdges: Edge[];
  envNodes: Record<string, Node[]>;
  envEdges: Record<string, Edge[]>;
};

export interface CanvasState {
  activeEnvId: string | null;
  globalNodes: Node[];
  globalEdges: Edge[];
  envNodes: Record<string, Node[]>;
  envEdges: Record<string, Edge[]>;
  clipboard: Node[];
  
  // Vault Security
  masterPassword: string | null;
  isVaultUnlocked: boolean;
  vaultUnlockExpiry: number | null;
  
  // Custom History
  past: HistoryState[];
  future: HistoryState[];
  commitHistory: () => void;
  undo: () => void;
  redo: () => void;
  
  // Actions
  isInteracting: boolean;
  setIsInteracting: (val: boolean) => void;
  setActiveEnvId: (id: string | null) => void;
  onNodesChange: (changes: NodeChange<Node>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: any) => void;
  updateNodeStyle: (id: string, style: any) => void;
  updateGlobalNode: (id: string, data: any) => void;
  deleteNodes: (ids: string[]) => void;
  deleteEdges: (ids: string[]) => void;
  copyNodes: (ids: string[]) => void;
  pasteNodes: () => void;
  toggleLockNodes: (ids: string[]) => void;
  setMasterPassword: (pwd: string) => void;
  unlockVault: (pwd: string) => boolean;
  lockVault: () => void;
  checkVaultTimeout: () => void;
  
  // Grouping
  groupNodes: (ids: string[]) => void;
  ungroupNodes: (groupId: string) => void;
  detachNodeFromGroup: (nodeId: string, absolutePosition: { x: number, y: number }) => void;
  attachNodeToGroup: (nodeId: string, groupId: string) => void;
}

// Initial Mock Data
const initialGlobalNodes: Node[] = [
  { id: 'env-1', type: 'globalEnv', position: { x: 100, y: 150 }, data: { id: 'env-1', label: 'Aetheric Solutions', status: 'DECRYPTED', code: 'AS-092', tasksCompleted: 5, tasksTotal: 10, tag: 'URGENT' } },
  { id: 'env-2', type: 'globalEnv', position: { x: 500, y: 300 }, data: { id: 'env-2', label: 'Lumina Tech', status: 'DECRYPTED', code: 'LT-004', tasksCompleted: 8, tasksTotal: 8, tag: 'COMPLETED' } },
  { id: 'env-3', type: 'globalEnv', position: { x: 250, y: 550 }, data: { id: 'env-3', label: 'Neves Global', status: 'ENCRYPTED', code: 'NG-114', tasksCompleted: 2, tasksTotal: 12, tag: 'MIGRATION' } },
];

const initialEnvNodes = {
  'env-1': [
    { id: 'info', type: 'briefingNode', position: { x: 250, y: 100 }, data: { label: 'Basic Info', description: 'Client details and contacts', tags: ['VIP', 'Active'] } },
    { id: 'vault', type: 'vaultNode', position: { x: 250, y: 250 }, data: { label: 'Passwords Vault', secrets: [] } },
    { id: 'tasks', type: 'tasksNode', position: { x: 250, y: 400 }, data: { label: 'Tasks', variant: 'kanban', columns: [{ id: 'todo', title: 'To Do', tasks: [{ id: 't1', content: 'Setup environments' }]}, { id: 'doing', title: 'In Progress', tasks: []}, { id: 'done', title: 'Done', tasks: []}], tickList: [] } },
    { id: 'notes', type: 'noteNode', position: { x: 650, y: 100 }, data: { label: 'Quick Notes', text: 'Call scheduled for Friday.' } },
    { id: 'projects', type: 'projectsNode', position: { x: 650, y: 250 }, data: { label: 'Projects & Links', links: [{ id: 'l1', title: 'Figma Design', url: 'https://figma.com' }] } },
    { id: 'messages', type: 'ticketsNode', position: { x: 650, y: 400 }, data: { label: 'Tickets & Msgs', tickets: [{ id: 'msg1', author: 'Client', content: 'Can we get an update?', timestamp: '10:30 AM' }] } },
  ]
};

const initialEnvEdges = {
  'env-1': [
    { id: 'e-info-notes', source: 'info', target: 'notes', animated: true, style: { stroke: 'rgba(255,255,255,0.15)' } },
    { id: 'e-vault-projects', source: 'vault', target: 'projects', animated: true, style: { stroke: 'rgba(255,255,255,0.15)' } },
    { id: 'e-tasks-msgs', source: 'tasks', target: 'messages', animated: true, style: { stroke: 'rgba(255,255,255,0.15)' } },
  ]
};

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      activeEnvId: null,
      globalNodes: initialGlobalNodes,
      globalEdges: [],
      envNodes: initialEnvNodes as Record<string, Node[]>,
      envEdges: initialEnvEdges as Record<string, Edge[]>,
      clipboard: [],
      
      masterPassword: null,
      isVaultUnlocked: false,
      vaultUnlockExpiry: null,
      
      past: [],
      future: [],

      commitHistory: () => {
        const { globalNodes, globalEdges, envNodes, envEdges, past } = get();
        // Deep clone to prevent reference mutations
        const currentState = JSON.parse(JSON.stringify({ globalNodes, globalEdges, envNodes, envEdges }));
        set({
          past: [...past, currentState].slice(-100), // Limit history to 100 steps
          future: [] // Clear future on new action
        });
      },

      undo: () => {
        const { past, future, globalNodes, globalEdges, envNodes, envEdges } = get();
        if (past.length === 0) return;
        
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        const currentState = JSON.parse(JSON.stringify({ globalNodes, globalEdges, envNodes, envEdges }));
        
        set({
          ...previous,
          past: newPast,
          future: [currentState, ...future]
        });
      },

      redo: () => {
        const { past, future, globalNodes, globalEdges, envNodes, envEdges } = get();
        if (future.length === 0) return;
        
        const next = future[0];
        const newFuture = future.slice(1);
        const currentState = JSON.parse(JSON.stringify({ globalNodes, globalEdges, envNodes, envEdges }));
        
        set({
          ...next,
          past: [...past, currentState],
          future: newFuture
        });
      },

      isInteracting: false,
      setIsInteracting: (val) => set({ isInteracting: val }),

      setActiveEnvId: (id) => set({ activeEnvId: id }),

      onNodesChange: (changes: NodeChange<Node>[]) => {
        const { activeEnvId, globalNodes, envNodes } = get();
        
        const currentNodes = activeEnvId ? (envNodes[activeEnvId] || []) : globalNodes;
        let newNodes = applyNodeChanges(changes, currentNodes) as Node[];
        
        // Sync dimensions into style to prevent snap-back for nodes with initial styles
        changes.forEach(c => {
           if (c.type === 'dimensions' && c.dimensions) {
              newNodes = newNodes.map(n => 
                 n.id === c.id ? { ...n, style: { ...n.style, width: c.dimensions?.width, height: c.dimensions?.height } } : n
              );
           }
        });

        if (activeEnvId) {
          set({
            envNodes: {
              ...envNodes,
              [activeEnvId]: newNodes,
            },
          });
        } else {
          set({
            globalNodes: newNodes,
          });
        }
      },

      onEdgesChange: (changes: EdgeChange<Edge>[]) => {
        const { activeEnvId, globalEdges, envEdges } = get();
        if (activeEnvId) {
          const currentEdges = envEdges[activeEnvId] || [];
          set({
            envEdges: {
              ...envEdges,
              [activeEnvId]: applyEdgeChanges(changes, currentEdges) as Edge[],
            },
          });
        } else {
          set({
            globalEdges: applyEdgeChanges(changes, globalEdges) as Edge[],
          });
        }
      },

      onConnect: (connection: Connection) => {
        get().commitHistory();
        const { activeEnvId, globalEdges, envEdges } = get();
        if (activeEnvId) {
          const currentEdges = envEdges[activeEnvId] || [];
          set({
            envEdges: {
              ...envEdges,
              [activeEnvId]: addEdge({ ...connection, animated: true, style: { stroke: 'rgba(255,255,255,0.15)' } }, currentEdges),
            },
          });
        } else {
          set({
            globalEdges: addEdge({ ...connection, type: 'smoothstep', animated: true, style: { stroke: 'rgba(255,255,255,0.2)' } }, globalEdges),
          });
        }
      },

      addNode: (node: Node) => {
        get().commitHistory();
        const { activeEnvId, globalNodes, envNodes } = get();
        if (activeEnvId) {
          const currentNodes = envNodes[activeEnvId] || [];
          set({
            envNodes: {
              ...envNodes,
              [activeEnvId]: [...currentNodes, node],
            },
          });
        } else {
          set({ globalNodes: [...globalNodes, node] });
        }
      },

      updateNode: (id: string, data: any) => {
        get().commitHistory();
        const { activeEnvId, globalNodes, envNodes } = get();
        if (activeEnvId) {
          const currentNodes = envNodes[activeEnvId] || [];
          set({
            envNodes: {
              ...envNodes,
              [activeEnvId]: currentNodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
            },
          });
        } else {
          set({
            globalNodes: globalNodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
          });
        }
      },

      updateNodeStyle: (id: string, style: any) => {
        get().commitHistory();
        const { activeEnvId, globalNodes, envNodes } = get();
        if (activeEnvId) {
          const currentNodes = envNodes[activeEnvId] || [];
          set({
            envNodes: {
              ...envNodes,
              [activeEnvId]: currentNodes.map((n) => (n.id === id ? { ...n, style: { ...n.style, ...style } } : n)),
            },
          });
        } else {
          set({
            globalNodes: globalNodes.map((n) => (n.id === id ? { ...n, style: { ...n.style, ...style } } : n)),
          });
        }
      },

      updateGlobalNode: (id: string, data: any) => {
        get().commitHistory();
        const { globalNodes } = get();
        set({
          globalNodes: globalNodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
        });
      },

      deleteEdges: (ids: string[]) => {
        get().commitHistory();
        const { activeEnvId, globalEdges, envEdges } = get();
        if (activeEnvId) {
          const currentEdges = envEdges[activeEnvId] || [];
          set({
            envEdges: {
              ...envEdges,
              [activeEnvId]: currentEdges.filter((e) => !ids.includes(e.id)),
            },
          });
        } else {
          set({
            globalEdges: globalEdges.filter((e) => !ids.includes(e.id)),
          });
        }
      },

      deleteNodes: (ids: string[]) => {
        get().commitHistory();
        const { activeEnvId, globalNodes, envNodes, globalEdges, envEdges } = get();
        if (activeEnvId) {
          const currentNodes = envNodes[activeEnvId] || [];
          const currentEdges = envEdges[activeEnvId] || [];
          set({
            envNodes: {
              ...envNodes,
              [activeEnvId]: currentNodes.filter((n) => !ids.includes(n.id)),
            },
            envEdges: {
              ...envEdges,
              [activeEnvId]: currentEdges.filter((e) => !ids.includes(e.source) && !ids.includes(e.target)),
            }
          });
        } else {
          set({
            globalNodes: globalNodes.filter((n) => !ids.includes(n.id)),
            globalEdges: globalEdges.filter((e) => !ids.includes(e.source) && !ids.includes(e.target)),
          });
        }
      },

      copyNodes: (ids: string[]) => {
        const { activeEnvId, globalNodes, envNodes } = get();
        const nodesToSearch = activeEnvId ? (envNodes[activeEnvId] || []) : globalNodes;
        const toCopy = nodesToSearch.filter(n => ids.includes(n.id));
        set({ clipboard: toCopy });
      },

      pasteNodes: () => {
        const { activeEnvId, globalNodes, envNodes, clipboard } = get();
        if (clipboard.length === 0) return;
        get().commitHistory();

        const newNodes = clipboard.map(n => ({
          ...n,
          id: `${n.id}-copy-${Date.now()}`,
          position: { x: n.position.x + 50, y: n.position.y + 50 },
          selected: true,
        }));

        if (activeEnvId) {
          const currentNodes = envNodes[activeEnvId] || [];
          set({
            envNodes: {
              ...envNodes,
              [activeEnvId]: [...currentNodes.map(n => ({...n, selected: false})), ...newNodes],
            },
          });
        } else {
          set({ globalNodes: [...globalNodes.map(n => ({...n, selected: false})), ...newNodes] });
        }
      },

      toggleLockNodes: (ids: string[]) => {
        get().commitHistory();
        const { activeEnvId, globalNodes, envNodes } = get();
        
        const toggleNode = (n: Node) => {
          if (!ids.includes(n.id)) return n;
          const isCurrentlyDraggable = n.draggable !== false;
          const nextDraggable = !isCurrentlyDraggable;
          return {
            ...n,
            draggable: nextDraggable,
            data: { ...n.data, isLocked: !nextDraggable }
          };
        };

        if (activeEnvId) {
          const currentNodes = envNodes[activeEnvId] || [];
          set({
            envNodes: {
              ...envNodes,
              [activeEnvId]: currentNodes.map(toggleNode),
            },
          });
        } else {
          set({
            globalNodes: globalNodes.map(toggleNode),
          });
        }
      },

      setMasterPassword: (pwd: string) => {
        set({ masterPassword: pwd });
      },

      unlockVault: (pwd: string) => {
        const { masterPassword } = get();
        // If no master password is set, automatically accept and set it (for prototype simplicity)
        if (!masterPassword) {
          set({ 
            masterPassword: pwd,
            isVaultUnlocked: true, 
            vaultUnlockExpiry: Date.now() + 5 * 60 * 1000 // 5 minutes 
          });
          return true;
        }

        if (masterPassword === pwd) {
          set({ 
            isVaultUnlocked: true, 
            vaultUnlockExpiry: Date.now() + 5 * 60 * 1000 
          });
          return true;
        }
        return false;
      },

      lockVault: () => {
        set({ isVaultUnlocked: false, vaultUnlockExpiry: null });
      },

      checkVaultTimeout: () => {
        const { isVaultUnlocked, vaultUnlockExpiry, lockVault } = get();
        if (isVaultUnlocked && vaultUnlockExpiry && Date.now() > vaultUnlockExpiry) {
          lockVault();
        }
      },

      groupNodes: (ids: string[]) => {
        get().commitHistory();
        const { activeEnvId, envNodes, globalNodes } = get();
        const nodes = activeEnvId ? (envNodes[activeEnvId] || []) : globalNodes;

        // Helper to get absolute position
        const getAbsolutePosition = (node: any) => {
          let x = node.position.x;
          let y = node.position.y;
          let curr = node;
          while (curr.parentId) {
            const parent = nodes.find(n => n.id === curr.parentId);
            if (!parent) break;
            x += parent.position.x;
            y += parent.position.y;
            curr = parent;
          }
          return { x, y };
        };

        // Find top-level selected nodes (ignore children if their parent is also selected)
        const topLevelIds = ids.filter(id => {
          let curr = nodes.find(n => n.id === id);
          while (curr?.parentId) {
          const pId = curr.parentId;
          if (ids.includes(pId)) return false;
          curr = nodes.find(n => n.id === pId);
        }
          return true;
        });
        
        const nodesToGroup = nodes.filter(n => topLevelIds.includes(n.id));
        if (nodesToGroup.length === 0) return;

        // Calculate bounding box using absolute positions
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodesToGroup.forEach(n => {
          const absPos = getAbsolutePosition(n);
          const x = absPos.x;
          const y = absPos.y;
          const w = n.measured?.width || (n.style?.width as number) || 250;
          const h = n.measured?.height || (n.style?.height as number) || 150;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x + w > maxX) maxX = x + w;
          if (y + h > maxY) maxY = y + h;
        });

        const padding = 50;
        const groupX = minX - padding;
        const groupY = minY - padding - 40; // Extra padding for header
        const groupW = (maxX - minX) + padding * 2;
        const groupH = (maxY - minY) + padding * 2 + 40;
        
        const groupId = `group-${Date.now()}`;
        const groupNode = {
          id: groupId,
          type: 'groupNode',
          position: { x: groupX, y: groupY },
          style: { width: groupW, height: groupH },
          data: { label: 'New Group' },
          zIndex: -1 // Behind elements
        };

        const updatedNodes = nodes.map(n => {
          if (topLevelIds.includes(n.id)) {
            const absPos = getAbsolutePosition(n);
            return {
              ...n,
              parentId: groupId,
              position: { x: absPos.x - groupX, y: absPos.y - groupY },
              zIndex: 1
            };
          }
          return n;
        });

        updatedNodes.unshift(groupNode as any);

        if (activeEnvId) {
          set({ envNodes: { ...envNodes, [activeEnvId]: updatedNodes } });
        } else {
          set({ globalNodes: updatedNodes });
        }
      },

      ungroupNodes: (groupId: string) => {
        get().commitHistory();
        const { activeEnvId, envNodes, globalNodes } = get();
        const nodes = activeEnvId ? (envNodes[activeEnvId] || []) : globalNodes;
        
        const groupNode = nodes.find(n => n.id === groupId);
        if (!groupNode) return;

        const updatedNodes = nodes
          .filter(n => n.id !== groupId) // Remove group node
          .map(n => {
            if (n.parentId === groupId) {
              return {
                ...n,
                parentId: undefined,
                position: { 
                  x: n.position.x + groupNode.position.x, 
                  y: n.position.y + groupNode.position.y 
                }
              };
            }
            return n;
          });

        if (activeEnvId) {
          set({ envNodes: { ...envNodes, [activeEnvId]: updatedNodes } });
        } else {
          set({ globalNodes: updatedNodes });
        }
      },

      detachNodeFromGroup: (nodeId: string, absolutePosition: { x: number, y: number }) => {
        get().commitHistory();
        const { activeEnvId, envNodes, globalNodes } = get();
        const nodes = activeEnvId ? (envNodes[activeEnvId] || []) : globalNodes;

        const updatedNodes = nodes.map(n => {
          if (n.id === nodeId) {
            return {
              ...n,
              parentId: undefined,
              position: absolutePosition,
              zIndex: 0
            };
          }
          return n;
        });

        if (activeEnvId) {
          set({ envNodes: { ...envNodes, [activeEnvId]: updatedNodes } });
        } else {
          set({ globalNodes: updatedNodes });
        }
      },

      attachNodeToGroup: (nodeId: string, groupId: string) => {
        get().commitHistory();
        const { activeEnvId, envNodes, globalNodes } = get();
        const nodes = activeEnvId ? (envNodes[activeEnvId] || []) : globalNodes;

        const groupNode = nodes.find(n => n.id === groupId);
        const childNode = nodes.find(n => n.id === nodeId);
        if (!groupNode || !childNode) return;

        const updatedNodes = nodes.map(n => {
          if (n.id === nodeId) {
            return {
              ...n,
              parentId: groupId,
              position: { 
                x: childNode.position.x - groupNode.position.x, 
                y: childNode.position.y - groupNode.position.y 
              },
              zIndex: 1
            };
          }
          return n;
        });

        if (activeEnvId) {
          set({ envNodes: { ...envNodes, [activeEnvId]: updatedNodes } });
        } else {
          set({ globalNodes: updatedNodes });
        }
      }
    }),
    {
      name: 'crm-vault-canvas-storage',
      partialize: (state) => ({ 
        globalNodes: state.globalNodes,
        globalEdges: state.globalEdges,
        envNodes: state.envNodes,
        envEdges: state.envEdges,
        masterPassword: state.masterPassword // Persist password, but NOT unlock state
      }),
    }
  )
);
