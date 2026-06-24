import { useEffect, useRef } from 'react';
import * as d3 from 'd3-force';
import { Node } from '@xyflow/react';

// Custom Rectangular Collision Force
function rectCollide() {
  let nodes: any[];
  function force(alpha: number) {
    const padding = 24;
    for (let i = 0, n = nodes.length; i < n; ++i) {
      let a = nodes[i];
      let widthA = a.type === 'globalEnv' ? 320 : 256;
      let heightA = a.type === 'globalEnv' ? 160 : 100;
      
      for (let j = i + 1; j < n; ++j) {
        let b = nodes[j];
        let widthB = b.type === 'globalEnv' ? 320 : 256;
        let heightB = b.type === 'globalEnv' ? 160 : 100;

        let cxA = a.x + widthA / 2;
        let cyA = a.y + heightA / 2;
        let cxB = b.x + widthB / 2;
        let cyB = b.y + heightB / 2;

        let dx = cxA - cxB;
        let dy = cyA - cyB;
        let absDx = Math.abs(dx);
        let absDy = Math.abs(dy);

        let minDx = (widthA + widthB) / 2 + padding;
        let minDy = (heightA + heightB) / 2 + padding;

        if (absDx < minDx && absDy < minDy) {
          let overlapX = minDx - absDx;
          let overlapY = minDy - absDy;

          // Push apart on shortest axis with gentle strength to prevent overlap and glitching
          if (overlapX < overlapY) {
            let push = (overlapX * alpha * 0.3);
            if (dx > 0) { a.x += push; b.x -= push; }
            else { a.x -= push; b.x += push; }
          } else {
            let push = (overlapY * alpha * 0.3);
            if (dy > 0) { a.y += push; b.y -= push; }
            else { a.y -= push; b.y += push; }
          }
        }
      }
    }
  }
  force.initialize = (_: any) => nodes = _;
  return force;
}

// Custom Spring Force
function springForce() {
  let nodes: any[];
  function force(alpha: number) {
    const strength = 0.04;
    for (let i = 0, n = nodes.length; i < n; ++i) {
      let d = nodes[i];
      if (d.fx == null && d.fy == null) {
        // Pull towards initialX / initialY
        d.vx += (d.initialX - d.x) * strength * alpha;
        d.vy += (d.initialY - d.y) * strength * alpha;
      }
    }
  }
  force.initialize = (_: any) => nodes = _;
  return force;
}

export function usePhysicsLayout(
  nodes: Node[], 
  updateNodePositions: (updatedNodes: Node[]) => void,
  active: boolean = true
) {
  const simulationRef = useRef<d3.Simulation<any, undefined> | null>(null);
  const nodesRef = useRef(nodes);

  // Sync latest nodes to ref
  useEffect(() => {
    nodesRef.current = nodes;

    if (simulationRef.current) {
      const simNodes = simulationRef.current.nodes();
      let hasDragged = false;
      
      simNodes.forEach((sn: any) => {
        const currentReactNode = nodes.find(n => n.id === sn.id);
        
        // Locked nodes act as static unmovable obstacles
        if (currentReactNode && currentReactNode.draggable === false) {
          sn.fx = currentReactNode.position.x;
          sn.fy = currentReactNode.position.y;
        }
        // Dragging nodes follow the cursor
        else if (currentReactNode && currentReactNode.dragging) {
          sn.fx = currentReactNode.position.x;
          sn.fy = currentReactNode.position.y;
          // Update the spring anchor dynamically
          sn.initialX = currentReactNode.position.x;
          sn.initialY = currentReactNode.position.y;
          hasDragged = true;
        } 
        // Normal nodes are free to move
        else {
          sn.fx = null;
          sn.fy = null;
        }
      });
      
      // Wake up the simulation to resolve collisions if we are dragging
      if (hasDragged && simulationRef.current.alpha() < 0.1) {
        simulationRef.current.alpha(0.1).restart();
      }
    }
  }, [nodes]);

  useEffect(() => {
    if (!active || nodes.length === 0) return;

    const simNodes = nodes.map((n) => ({
      ...n,
      x: n.position.x,
      y: n.position.y,
      initialX: n.position.x,
      initialY: n.position.y,
      fx: n.dragging || n.draggable === false ? n.position.x : null,
      fy: n.dragging || n.draggable === false ? n.position.y : null,
    }));

    // Track last synced positions to prevent flooding state
    const lastSynced = new Map();
    simNodes.forEach(sn => lastSynced.set(sn.id, { x: sn.x, y: sn.y }));

    let lastUpdate = performance.now();

    simulationRef.current = d3.forceSimulation(simNodes as any)
      .force('rectCollide', rectCollide())
      .force('spring', springForce())
      .alphaDecay(0.05) // Slightly faster decay
      .on('tick', () => {
        const now = performance.now();
        // Throttle React state updates to ~30 FPS to eliminate stuttering
        if (now - lastUpdate < 32) return;
        lastUpdate = now;

        const currentNodes = nodesRef.current;
        const updated = simNodes.map((sn: any) => {
          const original = currentNodes.find(n => n.id === sn.id);
          // Never overwrite position of nodes that the user is actively dragging
          if (!original || original.dragging) return null;
          
          const prev = lastSynced.get(sn.id);
          // Increase threshold to 0.5 pixels. This allows butter smooth micro-settling
          // now that state is completely local and doesn't lag the app.
          if (prev && Math.abs(prev.x - sn.x) < 0.5 && Math.abs(prev.y - sn.y) < 0.5) {
            return null;
          }

          lastSynced.set(sn.id, { x: sn.x, y: sn.y });
          
          return {
            ...original,
            position: { x: sn.x, y: sn.y }
          };
        }).filter(Boolean);
        
        if (updated.length > 0) {
          updateNodePositions(updated as Node[]);
        }
      });

    // Start with a high alpha to arrange everything instantly on load
    simulationRef.current.alpha(1).restart();

    return () => {
      if (simulationRef.current) simulationRef.current.stop();
    };
  }, [nodes.length, active]);
}
