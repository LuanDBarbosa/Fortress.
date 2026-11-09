import React from 'react';
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  getBezierPath, 
  EdgeProps,
  useReactFlow
} from '@xyflow/react';
import { X } from 'lucide-react';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
}: EdgeProps) {
  const { deleteElements } = useReactFlow();
  const [isHovered, setIsHovered] = React.useState(false);
  const timeoutRef = React.useRef<any>(null);
  
  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150); // grace period for transitioning between SVG path and HTML button
  };
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent, id: string) => {
    evt.stopPropagation();
    evt.preventDefault();
    deleteElements({ edges: [{ id }] });
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} className="react-flow__edge-path" />
      
      {/* Invisible thick path for hover detection over the line */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={25}
        className="react-flow__edge-interaction cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className={`w-6 h-6 bg-slate-900 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500 hover:bg-slate-800 rounded-full flex items-center justify-center transition-all duration-200 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
              isHovered || selected ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
            }`}
            onPointerDown={(event) => onEdgeClick(event as any, id)}
            onClick={(event) => event.stopPropagation()}
            title="Remove Connection"
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
