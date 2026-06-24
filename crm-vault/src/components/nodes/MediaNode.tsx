import { useState, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Image as ImageIcon, UploadCloud, X, Loader2 } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import { saveMedia, getMedia, deleteMedia } from '../../utils/storage';

export const MediaNode = ({ id, data, selected }: any) => {
  const updateNode = useCanvasStore((state) => state.updateNode);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const clearMedia = async (e: any) => {
    e.stopPropagation();
    if (data.mediaKey) {
      await deleteMedia(data.mediaKey);
      updateNode(id, { mediaKey: null, mediaType: null });
      setMediaUrl(null);
    }
  };

  return (
    <div className={`w-64 glass-panel rounded-xl overflow-hidden transition-colors relative ${
      selected ? 'ring-2 ring-blue-500/50 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'hover:border-slate-500/50'
    }`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-blue-500/50 border-none" />
      
      <div className="bg-slate-900/50 min-h-[120px] flex flex-col items-center justify-center relative group">
        {loading ? (
          <Loader2 className="animate-spin text-blue-400" size={24} />
        ) : mediaUrl ? (
          <>
            <button 
              onClick={clearMedia}
              className="absolute top-2 right-2 bg-charcoal-800/80 p-1 rounded-full text-slate-300 hover:text-white hover:bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X size={14} />
            </button>
            {data.mediaType === 'video' ? (
              <video src={mediaUrl} controls className="w-full max-h-[200px] object-cover" />
            ) : (
              <img src={mediaUrl} alt="node media" className="w-full max-h-[200px] object-cover" />
            )}
          </>
        ) : (
          <div 
            className="flex flex-col items-center justify-center p-6 cursor-pointer text-slate-400 hover:text-blue-400 transition-colors w-full h-full"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          >
            <UploadCloud size={24} className="mb-2" />
            <span className="text-xs font-medium">Click to Add Media</span>
          </div>
        )}
        <input 
          type="file" 
          name="mediaNodeFile"
          accept="image/*,video/*" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>

      <div className="p-3 bg-charcoal-800 border-t border-glass-stroke flex items-center gap-2">
        <ImageIcon size={14} className="text-blue-400" />
        <input 
          name="mediaNodeLabel"
          value={data.label || ''}
          onChange={(e) => updateNode(id, { label: e.target.value })}
          placeholder="Media Caption..."
          className="bg-transparent text-xs text-white focus:outline-none w-full"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-blue-500/50 border-none" />
    </div>
  );
};
