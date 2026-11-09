import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface CustomVideoPlayerProps {
  src: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  isLightbox?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  onLoadedMetadata?: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ src, objectFit = 'cover', isLightbox = false, onLoadedMetadata, autoplay, loop }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay || false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(autoplay || false);

  const [timeStr, setTimeStr] = useState('0:00 / 0:00');

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
        setTimeStr(`${formatTime(video.currentTime)} / ${formatTime(video.duration)}`);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (videoRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - bounds.left) / bounds.width;
      videoRef.current.currentTime = percent * videoRef.current.duration;
      setProgress(percent * 100);
    }
  };


  return (
    <div className="w-full h-full relative group">
      <video 
        ref={videoRef}
        src={src} 
        className={`w-full h-full object-${objectFit} pointer-events-none`}
        playsInline
        autoPlay={autoplay}
        loop={loop}
        muted={autoplay || isMuted}
        onLoadedMetadata={onLoadedMetadata}
      />
      
      {/* Controls Overlay */}
      <div 
        className={`nodrag absolute ${isLightbox ? 'bottom-6' : 'bottom-10'} left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-3 z-10`}
        onDoubleClick={(e) => e.stopPropagation()} 
        onMouseDown={(e) => e.stopPropagation()} 
        onMouseMove={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={togglePlay} 
          className="text-white hover:text-emerald-400 hover:scale-110 transition-all shrink-0"
        >
          {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
        </button>
        
        {/* Progress Bar Container */}
        <div 
          className="flex-1 flex items-center h-4 cursor-pointer group/progress relative"
          onClick={handleSeek}
        >
          {/* Background Track */}
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden transition-all duration-300 group-hover/progress:h-2">
            {/* Fill Track */}
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-75 relative"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Playhead thumb (visible on hover) */}
          <div 
            className="absolute w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity -ml-1.5 pointer-events-none"
            style={{ left: `${progress}%` }}
          />
        </div>

        <span className="text-[10px] font-medium text-slate-300 shrink-0 font-mono tracking-tighter">
          {timeStr}
        </span>

        <button 
          onClick={toggleMute} 
          className="text-white hover:text-emerald-400 hover:scale-110 transition-all shrink-0"
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </div>
  );
};
