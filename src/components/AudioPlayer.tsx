
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2, RefreshCw, Music } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title: string;
  artist?: string;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, title, artist, className = "" }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [directUrl, setDirectUrl] = useState('');
  
  // Embed States
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [audiomackEmbedUrl, setAudiomackEmbedUrl] = useState<string | null>(null);
  const [driveEmbedUrl, setDriveEmbedUrl] = useState<string | null>(null);
  
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to extract YouTube ID
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Helper to detect and format Audiomack URL
  const getAudiomackEmbedUrl = (url: string) => {
      if (!url || !url.includes('audiomack.com')) return null;
      const match = url.match(/audiomack\.com\/([^\/]+)\/song\/([^\/?#]+)/);
      if (match && match[1] && match[2]) {
          const artist = match[1];
          const slug = match[2];
          return `https://audiomack.com/embed/song/${artist}/${slug}?background=1&color=00695C`;
      }
      return null;
  };

  // Helper to detect Google Drive ID for Embedding
  const getDriveEmbedUrl = (url: string) => {
      if (!url || (!url.includes('drive.google.com') && !url.includes('docs.google.com'))) return null;
      
      let fileId = '';
      const fileIdMatch = url.match(/\/file\/d\/([^/?]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
          fileId = fileIdMatch[1];
      } else {
          const idParamMatch = url.match(/[?&]id=([^&]+)/);
          if (idParamMatch && idParamMatch[1]) {
              fileId = idParamMatch[1];
          }
      }

      if (fileId) {
          // Use the PREVIEW endpoint which is the official embed player
          return `https://drive.google.com/file/d/${fileId}/preview`;
      }
      return null;
  };

  const formatAudioUrl = (url: string) => {
    if (!url) return '';
    
    // 1. Check for YouTube
    const ytId = getYoutubeId(url);
    if (ytId) {
        setYoutubeId(ytId);
        setAudiomackEmbedUrl(null);
        setDriveEmbedUrl(null);
        return url; 
    }
    setYoutubeId(null);

    // 2. Check for Audiomack
    const amUrl = getAudiomackEmbedUrl(url);
    if (amUrl) {
        setAudiomackEmbedUrl(amUrl);
        setDriveEmbedUrl(null);
        return url; 
    }
    setAudiomackEmbedUrl(null);

    // 3. Check for Google Drive (Force Embed)
    const driveUrl = getDriveEmbedUrl(url);
    if (driveUrl) {
        setDriveEmbedUrl(driveUrl);
        return url;
    }
    setDriveEmbedUrl(null);

    // 4. Standard Direct Link
    return url;
  };

  useEffect(() => {
    const formatted = formatAudioUrl(src);
    setDirectUrl(formatted);
  }, [src]);

  // Cleanup timeouts
  useEffect(() => {
      return () => {
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      };
  }, []);

  // HTML5 Audio Event Handlers (Only for direct MP3s)
  useEffect(() => {
    if (youtubeId || audiomackEmbedUrl || driveEmbedUrl) return; 

    const audio = audioRef.current;
    if (!audio || !directUrl) return;

    setIsPlaying(false);
    setProgress(0);
    setHasError(false);
    
    try {
        audio.load();
    } catch(e) {
        console.warn("Load interrupted");
    }

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => {
      const d = audio.duration;
      if (isFinite(d)) setDuration(d);
      setIsLoading(false);
      setHasError(false);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };
    const onError = (e: any) => {
      console.warn("Audio playback error:", e);
      setIsLoading(false);
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      if(audio) {
          audio.removeEventListener('timeupdate', onTimeUpdate);
          audio.removeEventListener('loadedmetadata', onLoadedMetadata);
          audio.removeEventListener('ended', onEnded);
          audio.removeEventListener('error', onError);
      }
    };
  }, [directUrl, youtubeId, audiomackEmbedUrl, driveEmbedUrl]);

  const togglePlay = async () => {
    if (youtubeId || audiomackEmbedUrl || driveEmbedUrl) return; 

    if (hasError) {
        setHasError(false);
        setIsLoading(true);
        if (audioRef.current) {
            audioRef.current.load();
            setTimeout(() => {
                audioRef.current?.play().catch(() => setHasError(true));
            }, 500);
        }
        return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        setIsLoading(true); 
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Play failed:", error);
        setIsLoading(false);
        setHasError(true); 
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Number(e.target.value);
    audio.currentTime = newTime;
    setProgress(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- RENDERERS ---

  // 1. YOUTUBE
  if (youtubeId) {
      return (
        <div className={`rounded-2xl overflow-hidden shadow-lg border border-white/10 ${className}`}>
             <div className="relative pt-[56.25%] bg-black">
                 <iframe 
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}`} 
                    title={title} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                 ></iframe>
             </div>
        </div>
      );
  }

  // 2. AUDIOMACK
  if (audiomackEmbedUrl) {
      return (
          <div className={`rounded-xl overflow-hidden shadow-lg border border-white/10 bg-[#0B0B0B] ${className}`}>
               <iframe 
                  src={audiomackEmbedUrl} 
                  scrolling="no" 
                  width="100%" 
                  height="252" 
                  frameBorder="0" 
                  title={title}
                  style={{ backgroundColor: '#0B0B0B' }}
                  allow="autoplay"
               ></iframe>
          </div>
      );
  }

  // 3. GOOGLE DRIVE EMBED (Official Player - Reliable) - SLIM VERSION
  if (driveEmbedUrl) {
      return (
        <div className={`rounded-xl overflow-hidden shadow-md border border-white/10 bg-black ${className}`}>
            <div className="flex items-center gap-2 bg-surface p-2 border-b border-white/5 h-10">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Music size={12} className="text-white" />
                </div>
                <div className="overflow-hidden">
                    <h4 className="font-bold text-white truncate text-xs">{title}</h4>
                </div>
             </div>
             {/* Reduced height for compact grid */}
             <div className="relative w-full h-[80px] bg-black">
                 <iframe 
                    src={driveEmbedUrl} 
                    width="100%" 
                    height="100%" 
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    title={title}
                    style={{ border: 'none' }}
                 ></iframe>
             </div>
        </div>
      );
  }

  // 4. STANDARD AUDIO PLAYER (Direct MP3s)
  const progressPercent = duration && isFinite(duration) ? (progress / duration) * 100 : 0;

  return (
    <div 
        className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-white/20 transition-all group select-none ${className}`}
        onContextMenu={(e) => e.preventDefault()}
    >
      {directUrl && (
          <audio 
            ref={audioRef} 
            src={directUrl}
            preload="metadata" 
          />
      )}
      
      <button 
        onClick={togglePlay}
        disabled={!directUrl}
        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-lg ${
            hasError 
            ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
            : (!directUrl) 
                ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                : 'bg-primary hover:bg-primaryDark text-white hover:scale-105'
        }`}
      >
        {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
        ) : hasError ? (
            <RefreshCw size={20} className="" />
        ) : isPlaying ? (
            <Pause size={20} fill="currentColor" />
        ) : (
            <Play size={20} fill="currentColor" className="ml-1" />
        )}
      </button>

      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-baseline mb-1">
            <div className="truncate pr-4">
                <h4 className="font-bold text-white truncate text-sm md:text-base">
                    {title}
                </h4>
            </div>
            <span className="text-xs text-gray-400 font-mono whitespace-nowrap">
                {hasError ? "Error" : `${formatTime(progress)} / ${formatTime(duration)}`}
            </span>
        </div>
        
        {artist && <p className="text-xs text-gray-400 truncate mb-1">{artist}</p>}
        
        <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden group/bar">
            <div 
                className={`absolute top-0 left-0 h-full transition-all duration-100 ease-linear rounded-full ${hasError ? 'bg-red-500/50' : 'bg-accent'}`}
                style={{ width: `${progressPercent}%` }}
            />
            {!hasError && (
                <input 
                    type="range" 
                    min="0" 
                    max={duration || 0} 
                    value={progress} 
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    disabled={!duration}
                />
            )}
        </div>
      </div>

      {!hasError && (
          <button onClick={() => {
              if(audioRef.current) {
                  audioRef.current.muted = !isMuted;
                  setIsMuted(!isMuted);
              }
          }} className="text-gray-400 hover:text-white transition-colors p-2 hidden sm:block">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
      )}
    </div>
  );
};

export default AudioPlayer;
