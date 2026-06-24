import { useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileArchive, UploadCloud, X, Loader2, Download } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import { saveMedia, getMedia, deleteMedia } from '../../utils/storage';

export const FileNode = ({ id, data, selected }: any) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    const load = async () => {
      if (data.fileKey) {
        setLoading(true);
        try {
          const blob = await getMedia(data.fileKey);
          if (blob) {
            objectUrl = URL.createObjectURL(blob);
            setFileUrl(objectUrl);
          }
        } catch (e) {
          console.error('Failed to load file', e);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [data.fileKey]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File exceeds 10MB limit.');
      return;
    }
    setErrorMsg(null);

    setLoading(true);
    try {
      const newKey = `file-${id}-${Date.now()}`;
      await saveMedia(newKey, file);
      
      if (data.fileKey) {
        await deleteMedia(data.fileKey);
      }

      updateNode(id, { 
        fileKey: newKey, 
        fileName: file.name,
        fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to save file locally.');
    } finally {
      setLoading(false);
    }
  };

  const clearFile = async (e: any) => {
    e.stopPropagation();
    if (data.fileKey) {
      await deleteMedia(data.fileKey);
      updateNode(id, { fileKey: null, fileName: null, fileSize: null });
      setFileUrl(null);
    }
  };

  return (
    <div className={`w-64 glass-panel rounded-xl overflow-hidden transition-colors relative ${
      selected ? 'ring-2 ring-emerald-500/50 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'hover:border-slate-500/50'
    } bg-emerald-500/5`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-emerald-500/50 border-none" />
      
      <div className="p-3 border-b border-glass-stroke flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
          <FileArchive size={16} />
        </div>
        <input 
          name="fileNodeLabel"
          value={data.label || ''}
          onChange={(e) => updateNode(id, { label: e.target.value })}
          placeholder="File Attachment"
          className="bg-transparent text-sm font-semibold text-white focus:outline-none w-full"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="p-4 flex flex-col items-center justify-center relative min-h-[100px]">
        {loading ? (
          <Loader2 className="animate-spin text-emerald-400" size={24} />
        ) : fileUrl ? (
          <div className="w-full flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-glass-stroke">
            <div className="flex flex-col overflow-hidden mr-2">
              <span className="text-xs text-white truncate font-medium" title={data.fileName}>{data.fileName}</span>
              <span className="text-[10px] text-slate-400">{data.fileSize}</span>
            </div>
            <div className="flex gap-2">
              <a 
                href={fileUrl} 
                download={data.fileName}
                className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/40 transition-colors"
                onClick={(e) => e.stopPropagation()}
                title="Download"
              >
                <Download size={14} />
              </a>
              <button 
                onClick={clearFile}
                className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 transition-colors"
                title="Remove"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center p-4 cursor-pointer text-slate-400 hover:text-emerald-400 transition-colors w-full border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-lg"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          >
            <UploadCloud size={24} className="mb-2" />
            <span className="text-xs font-medium text-center">Click to attach file<br/><span className="text-[10px] text-slate-500">(Max 10MB)</span></span>
          </div>
        )}
        
        {errorMsg && <div className="mt-2 text-[10px] text-red-400 text-center">{errorMsg}</div>}

        <input 
          type="file" 
          name="fileNodeAttachment"
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-emerald-500/50 border-none" />
    </div>
  );
};
