import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { UploadCloud, X, Loader2, Maximize, Download } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import { CustomVideoPlayer } from '../ui/CustomVideoPlayer';
import { saveMedia, getMedia, deleteMedia } from '../../utils/storage';

export const MediaNode = ({ id, data, selected }: any) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [mediaDimensions, setMediaDimensions] = useState<{width: number, height: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Always cover to eliminate ugly letterboxing.
  const objectFit = 'cover';

  const handleDoubleClick = (e: any) => {
    e.stopPropagation();
    if (mediaUrl) setIsLightboxOpen(true);
  };

  // Load media from DB on mount if we have a key
  useEffect(() => {
    let objectUrl: string | null = null;
    const load = async () => {
      if (data.mediaKey) {
        setLoading(true);
        try {
          const blob = await getMedia(data.mediaKey);
          if (blob) {
            objectUrl = URL.createObjectURL(blob);
            setMediaUrl(objectUrl);
          }
        } catch (e) {
          console.error('Failed to load media', e);
        } finally {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [data.mediaKey]);

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No context');

        // Max width/height
        const MAX = 800;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > MAX) { h *= MAX / w; w = MAX; }
        } else {
          if (h > MAX) { w *= MAX / h; h = MAX; }
        }
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject('Blob failed');
        }, 'image/webp', 0.8); // 80% quality webp
      };
      img.onerror = reject;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      let blobToSave: Blob = file;
      
      // Compress if image
      if (file.type.startsWith('image/')) {
        blobToSave = await compressImage(file);
      } // If video, we just save the file blob directly to IDB for now.

      const newKey = `media-${id}-${Date.now()}`;
      await saveMedia(newKey, blobToSave);
      
      // If replacing an old one, delete old
      if (data.mediaKey) {
        await deleteMedia(data.mediaKey);
      }

      updateNode(id, { mediaKey: newKey, mediaType: file.type.startsWith('video/') ? 'video' : 'image' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const clearMedia = (e: any) => {
    e.stopPropagation();
    if (data.mediaKey) {
      deleteMedia(data.mediaKey);
    }
    setMediaUrl(null);
    setMediaDimensions(null);
    useCanvasStore.getState().updateNode(id, { mediaKey: undefined, mediaType: undefined });
    useCanvasStore.getState().commitHistory();
  };

  const downloadImage = (e: any) => {
    e.stopPropagation();
    if (mediaUrl) {
      const a = document.createElement('a');
      a.href = mediaUrl;
      a.download = `image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const autoFitNode = (e: any) => {
    e.stopPropagation();
    if (!mediaDimensions) return;
    
    // Get current node width to calculate proportional height
    const nodeElement = document.getElementById(`media-node-${id}`);
    const currentWidth = nodeElement ? nodeElement.offsetWidth : 300;
    
    const aspectRatio = mediaDimensions.width / mediaDimensions.height;
    const newHeight = Math.max(150, currentWidth / aspectRatio); // Keep minHeight constraint
    
    useCanvasStore.getState().updateNodeStyle(id, { width: currentWidth, height: newHeight });
    useCanvasStore.getState().commitHistory();
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setMediaDimensions({ width: naturalWidth, height: naturalHeight });
  };

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const { videoWidth, videoHeight } = e.currentTarget;
    setMediaDimensions({ width: videoWidth, height: videoHeight });
  };

  const showTitle = data.showTitle !== false; // true by default
  const isRounded = data.isRounded !== false; // true by default

  return (
    <>
      <div id={`media-node-${id}`} className={`w-full h-full min-w-[150px] min-h-[150px] flex flex-col glass-panel ${isRounded ? 'rounded-xl' : ''} overflow-hidden transition-colors relative group ${
        selected ? 'ring-2 ring-blue-500/50 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'hover:border-slate-500/50'
      } ${isResizing ? 'is-resizing' : ''}`}>
        
        <div 
          className="flex-1 bg-slate-900/50 flex flex-col items-center justify-center relative min-h-0 w-full h-full"
          onDoubleClick={handleDoubleClick}
        >
          {loading ? (
            <Loader2 className="animate-spin text-blue-400" size={24} />
          ) : mediaUrl ? (
            <>
              <div 
                className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onDoubleClick={(e) => e.stopPropagation()}
              >
                {mediaDimensions && (
                  <button className="bg-charcoal-800/80 p-1.5 rounded text-slate-300 hover:text-white hover:bg-emerald-500/80 transition-colors backdrop-blur-sm nodrag" 
                    onClick={autoFitNode}
                    
                    title="Auto-Fit Aspect Ratio"
                  >
                    <Maximize size={14} />
                  </button>
                )}
                <button className="bg-charcoal-800/80 p-1.5 rounded text-slate-300 hover:text-white hover:bg-blue-500/80 transition-colors backdrop-blur-sm nodrag" 
                  onClick={downloadImage}
                  
                  title="Download Media"
                >
                  <Download size={14} />
                </button>
                <button className="bg-charcoal-800/80 p-1.5 rounded text-slate-300 hover:text-white hover:bg-red-500/80 transition-colors backdrop-blur-sm nodrag" 
                  onClick={clearMedia}
                  
                  title="Remove Media"
                >
                  <X size={14} />
                </button>
              </div>
              {data.mediaType === 'video' ? (
                <CustomVideoPlayer 
                  src={mediaUrl} 
                  objectFit={objectFit} 
                  onLoadedMetadata={handleVideoLoad} 
                  autoplay={data.autoplay}
                  loop={data.loop}
                />
              ) : (
                <img src={mediaUrl} alt="node media" className={`w-full h-full object-${objectFit} pointer-events-none`} onLoad={handleImageLoad} />
              )}
            </>
          ) : (
            <div 
              className="flex flex-col items-center justify-center p-6 cursor-pointer text-slate-400 hover:text-blue-400 transition-colors w-full h-full"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              <UploadCloud size={24} className="mb-2" />
              <span className="text-xs font-medium text-center">Click to Add Media</span>
            </div>
          )}
          <input className="hidden nodrag" 
            type="file" 
            name="mediaNodeFile"
            accept="image/*,video/*" 
            ref={fileInputRef} 
             
            onChange={handleFileChange}
          />
        </div>

        {/* Floating Caption Bar */}
        {showTitle && (
          <div className={`absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center transition-opacity duration-300 ${data.label ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <input 
              name="mediaNodeLabel"
              value={data.label || ''}
              onChange={(e) => updateNode(id, { label: e.target.value })}
              placeholder="Add caption..."
              className="nodrag bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none w-full backdrop-blur-md shadow-inner"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

      </div>

      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-blue-500/50 border-none z-50" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-blue-500/50 border-none z-50" />

      <NodeResizer 
        color="#3b82f6" 
        isVisible={selected} 
        minWidth={150} 
        minHeight={150} 
        handleClassName="w-3 h-3 rounded-sm border-none bg-blue-500 nodrag z-[100]"
        lineClassName="z-[100]"
        onResizeStart={() => {
          setIsResizing(true);
          useCanvasStore.getState().setIsInteracting(true);
        }}
        onResizeEnd={(_evt, params) => {
          setIsResizing(false);
          useCanvasStore.getState().updateNodeStyle(id, { width: params.width, height: params.height });
          useCanvasStore.getState().onNodesChange([{ type: 'position', id, position: { x: params.x, y: params.y } } as any]);
          useCanvasStore.getState().setIsInteracting(false);
          useCanvasStore.getState().commitHistory();
        }}
      />

      {/* Lightbox Portal */}
      {isLightboxOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
          onWheel={(e) => e.stopPropagation()} // Prevent canvas zooming while in lightbox
        >
          <button className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors nodrag" 
            
            onClick={() => setIsLightboxOpen(false)}
          >
            <X size={24}/>
          </button>
          {data.mediaType === 'video' ? (
            <div className="w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center">
              <CustomVideoPlayer src={mediaUrl || ""} objectFit="contain" isLightbox={true} />
            </div>
          ) : (
            <img src={mediaUrl || undefined} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" onClick={e => e.stopPropagation()} />
          )}
        </div>,
        document.body
      )}
    </>
  );
};
