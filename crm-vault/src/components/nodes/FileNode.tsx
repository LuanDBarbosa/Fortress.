import { useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  FileArchive, UploadCloud, X, Loader2, Download, 
  FileText, Image, FileVideo, FileCode, File 
} from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import { saveMedia, getMedia, deleteMedia } from '../../utils/storage';

const getFileTypeCategory = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': case 'doc': case 'docx': case 'txt': case 'rtf': return 'docs';
    case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': case 'webp': return 'images';
    case 'mp4': case 'mov': case 'avi': case 'webm': case 'mp3': case 'wav': case 'ogg': return 'media';
    case 'js': case 'ts': case 'tsx': case 'jsx': case 'html': case 'css': case 'json': return 'code';
    default: return 'other';
  }
};

const getFileIcon = (fileName: string) => {
  const cat = getFileTypeCategory(fileName);
  if (cat === 'docs') return <FileText size={16} />;
  if (cat === 'images') return <Image size={16} />;
  if (cat === 'media') return <FileVideo size={16} />;
  if (cat === 'code') return <FileCode size={16} />;
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return <FileArchive size={16} />;
  return <File size={16} />;
};

export const FileNode = ({ id, data, selected }: any) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('all');

  const files = data.files || [];

  useEffect(() => {
    if (data.fileKey && files.length === 0) {
      updateNode(id, {
        files: [{
          id: `file-${Date.now()}`,
          fileKey: data.fileKey,
          fileName: data.fileName || 'Attachment',
          fileSize: data.fileSize || 'Unknown size'
        }],
        fileKey: undefined,
        fileName: undefined,
        fileSize: undefined
      });
    }
  }, [data.fileKey, files.length, id, updateNode]);

  useEffect(() => {
    const loadUrls = async () => {
      const newUrls: Record<string, string> = {};
      for (const f of files) {
        if (!fileUrls[f.fileKey]) {
          try {
            const blob = await getMedia(f.fileKey);
            if (blob) {
              newUrls[f.fileKey] = URL.createObjectURL(blob);
            }
          } catch (e) {
            console.error('Failed to load file', e);
          }
        }
      }
      if (Object.keys(newUrls).length > 0) {
        setFileUrls(prev => ({ ...prev, ...newUrls }));
      }
    };
    loadUrls();
  }, [files]);

  const handleFileUpload = async (uploadedFiles: FileList | File[]) => {
    setLoading(true);
    setErrorMsg(null);
    
    const newFiles = [...files];
    let hasError = false;

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Some files exceed 10MB limit.');
        hasError = true;
        continue;
      }
      try {
        const newKey = `file-${id}-${Date.now()}-${i}`;
        await saveMedia(newKey, file);
        newFiles.push({
          id: `file-${Date.now()}-${i}`,
          fileKey: newKey,
          fileName: file.name,
          fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB'
        });
      } catch (e) {
        console.error(e);
        setErrorMsg('Failed to save some files.');
        hasError = true;
      }
    }

    if (!hasError) setErrorMsg(null);
    updateNode(id, { files: newFiles });
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const clearFile = async (e: any, fileToRemove: any) => {
    e.stopPropagation();
    await deleteMedia(fileToRemove.fileKey);
    const newFiles = files.filter((f: any) => f.id !== fileToRemove.id);
    updateNode(id, { files: newFiles });
    
    if (fileUrls[fileToRemove.fileKey]) {
      URL.revokeObjectURL(fileUrls[fileToRemove.fileKey]);
      const nextUrls = { ...fileUrls };
      delete nextUrls[fileToRemove.fileKey];
      setFileUrls(nextUrls);
    }
  };

  const downloadFile = (e: any, fileUrl: string | undefined, fileName: string) => {
    e.stopPropagation();
    if (fileUrl) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const availableCategories = ['all'];
  files.forEach((f: any) => {
    const cat = getFileTypeCategory(f.fileName);
    if (!availableCategories.includes(cat) && cat !== 'other') {
      availableCategories.push(cat);
    }
    if (cat === 'other' && !availableCategories.includes('other')) {
      availableCategories.push('other');
    }
  });

  const filteredFiles = files.filter((f: any) => filter === 'all' || getFileTypeCategory(f.fileName) === filter);

  return (
    <div 
      className={`w-[320px] h-auto min-h-[120px] flex flex-col glass-panel rounded-xl transition-colors relative ${
        selected ? 'ring-2 ring-emerald-500/50 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'hover:border-slate-500/50'
      } ${isDragOver ? 'ring-2 ring-emerald-400 bg-emerald-500/10' : 'bg-emerald-500/5'}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-emerald-500/50 border-none z-50" />
      
      <div className="p-3 border-b border-glass-stroke flex items-center gap-2 bg-black/20 shrink-0 rounded-t-xl">
        <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
          <FileArchive size={16} />
        </div>
        <div className="flex-1 text-sm font-semibold text-white truncate pr-2">
          {data.label || 'Files & Attachments'}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          className="nodrag p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 transition-colors"
          title="Upload File"
        >
          <UploadCloud size={14} />
        </button>
      </div>

      {files.length > 0 && availableCategories.length > 1 && (
        <div className="px-3 pt-2 flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1 border-b border-glass-stroke bg-black/10 shrink-0 nodrag">
          {availableCategories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`nodrag px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                filter === cat 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 p-3 min-h-[60px] relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Loader2 className="animate-spin text-emerald-400" size={24} />
          </div>
        )}

        {filteredFiles.length > 0 ? (
          <div className="space-y-2">
            {filteredFiles.map((f: any) => (
              <div key={f.id} className="w-full flex items-center justify-between bg-slate-900/50 hover:bg-slate-800/80 p-2.5 rounded-lg border border-glass-stroke group transition-colors">
                <div className="flex items-center gap-3 overflow-hidden mr-2">
                  <div className="text-emerald-400/80 p-1.5 bg-emerald-500/10 rounded">
                    {getFileIcon(f.fileName)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs text-white truncate font-medium max-w-[200px]" title={f.fileName}>{f.fileName}</span>
                    <span className="text-[10px] text-slate-400">{f.fileSize}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => downloadFile(e, fileUrls[f.fileKey], f.fileName)}
                    className="nodrag p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/20 rounded transition-colors"
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                  <button 
                    onClick={(e) => clearFile(e, f)}
                    className="nodrag p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          files.length === 0 ? (
            <div 
              className="flex flex-col items-center justify-center h-full min-h-[100px] cursor-pointer text-slate-400 hover:text-emerald-400 transition-colors w-full border-2 border-dashed border-slate-700/50 hover:border-emerald-500/50 rounded-lg"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              <UploadCloud size={24} className="mb-2" />
              <span className="text-xs font-medium text-center">
                Drop files here or click to browse
                <br/><span className="text-[10px] text-slate-500">(Max 10MB per file)</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-slate-500 italic py-4">
              No files match the "{filter}" filter.
            </div>
          )
        )}
        
        {errorMsg && <div className="mt-2 text-[10px] text-red-400 text-center">{errorMsg}</div>}

        <input className="hidden nodrag" 
          type="file" 
          name="fileNodeAttachment"
          ref={fileInputRef} 
           
          multiple
          onChange={handleFileChange}
        />
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-emerald-500/50 border-none z-50" />
    </div>
  );
};
