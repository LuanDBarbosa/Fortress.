import { useCallback, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useCanvasStore } from '../../store/canvasStore';
import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const NoteNode = ({ id, data, selected }: any) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const [isEditing, setIsEditing] = useState(!data.text); // Open in edit mode if empty

  const onChange = useCallback((evt: any) => {
    updateNode(id, { text: evt.target.value });
  }, [id, updateNode]);

  return (
    <div 
      className={`w-64 glass-panel rounded-xl p-4 transition-colors relative ${
        selected ? 'ring-2 ring-yellow-500/50 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'hover:border-slate-500/50'
      } bg-yellow-500/5`}
      onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-yellow-500/50 border-none" />
      
      <div className="flex flex-col gap-2 relative min-h-[40px]">
        {isEditing ? (
          <TextareaAutosize
            className="w-full bg-transparent text-slate-200 text-sm focus:outline-none resize-none font-inter leading-relaxed nodrag"
            placeholder="Start typing your note here (Markdown supported)..."
            value={data.text || ''}
            onChange={onChange}
            onBlur={() => setIsEditing(false)}
            autoFocus
            minRows={2}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()} 
          />
        ) : (
          <div 
            className="w-full text-slate-200 text-sm font-inter leading-relaxed"
            onClick={(e) => e.stopPropagation()}
          >
            {data.text ? (
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 text-white" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-2 text-white" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-md font-bold mb-1 mt-2 text-white" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                  a: ({node, ...props}) => <a className="text-yellow-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-yellow-500/50 pl-3 italic text-slate-400 my-2" {...props} />,
                  code: ({node, inline, ...props}: any) => 
                    inline 
                      ? <code className="bg-slate-800 text-yellow-300 px-1 py-0.5 rounded text-xs" {...props} />
                      : <code className="block bg-slate-900 p-2 rounded border border-glass-stroke text-xs overflow-x-auto my-2" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                }}
              >
                {data.text}
              </ReactMarkdown>
            ) : (
              <span className="text-slate-500 italic cursor-text" onClick={() => setIsEditing(true)}>Empty note. Double click to edit.</span>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-yellow-500/50 border-none" />
    </div>
  );
};
