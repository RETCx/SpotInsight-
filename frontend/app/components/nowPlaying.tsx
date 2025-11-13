'use client';
import { useState, useEffect } from "react";
import { RefreshCw, Disc, ExternalLink } from "lucide-react";
import { getCurrentlyPlaying } from "@/app/components/utils/spotify";
import { extractColors } from "@/app/components/utils/colorUtils";

const formatTime = (ms: number) => {
  if (!ms) return "0:00";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export default function NowPlaying({ accessToken }: { accessToken: string }) {
  const [song, setSong] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dominantColor, setDominantColor] = useState('#1a1a1a');
  const [accentColor, setAccentColor] = useState('#22c55e');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [progressMs, setProgressMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  const fetchNowPlaying = async () => {
    try {
      const data = await getCurrentlyPlaying(accessToken);
      setSong(data);
      
      if (data?.item) {
        setIsPlaying(data.is_playing);
        setDurationMs(data.item.duration_ms);
        setProgressMs(data.progress_ms);

        if (data.item.album?.images?.[0]?.url) {
          extractColors(data.item.album.images[0].url, setDominantColor, setAccentColor);
        }
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      console.error("Error fetching song", e);
    }
  };

  useEffect(() => {
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 5000);
    return () => clearInterval(interval);
  }, [accessToken]);

  useEffect(() => {
    if (!isPlaying) return;
    const tick = setInterval(() => {
      setProgressMs((prev) => (prev >= durationMs ? prev : prev + 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [isPlaying, durationMs]);

  const progressPercent = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;

  // --- State: No Song ---
  if (!song?.is_playing || !song.item) {
    return (
      <div className="flex w-full max-w-3xl items-center justify-between gap-4 rounded-[40px] border border-white/10 bg-neutral-900/80 p-4 px-8 backdrop-blur-xl">
         <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <Disc className="text-gray-500" size={24} />
            </div>
            <span className="text-gray-400">Not playing anything</span>
         </div>
         <button onClick={fetchNowPlaying} className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/20">
            Refresh
         </button>
      </div>
    );
  }

  return (
    <div className="group relative w-full max-w-4xl overflow-hidden rounded-[50px] border border-white/10 bg-neutral-900 shadow-2xl transition-all hover:border-white/20">
      
      {/* Background Gradient (Left to Right) */}
      <div 
        className="absolute inset-0 opacity-50 transition-colors duration-1000"
        style={{ background: `linear-gradient(to right, ${dominantColor}, #000000 90%)` }} 
      />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />

      <div className="relative z-10 flex flex-col items-center gap-6 p-6 md:flex-row md:gap-10 md:p-8">
        
        {/* --- LEFT: The Spinning Vinyl (Smaller & Compact) --- */}
        <div className="relative flex-shrink-0">
             {/* Glow */}
            <div 
                className="absolute inset-0 blur-2xl opacity-40 scale-110 transition-colors duration-1000"
                style={{ backgroundColor: accentColor }}
            />
            
            {/* Record */}
            <div 
                onClick={() => window.open(song.item.external_urls.spotify, '_blank')}
                className={`relative h-32 w-32 md:h-40 md:w-40 cursor-pointer rounded-full border-2 border-neutral-900 shadow-xl ${isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`}
            >
                <img src={song.item.album.images[0].url} className="h-full w-full rounded-full object-cover" alt="Art" />
                <div className="absolute inset-0 rounded-full bg-[url('https://transparenttextures.com/patterns/vinyl.png')] opacity-40 mix-blend-overlay" />
                <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-800 bg-neutral-900 shadow-inner flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-black border border-gray-700"/>
                </div>
            </div>
        </div>

        {/* --- RIGHT: Info & Progress (Expands to fill width) --- */}
        <div className="flex w-full flex-col items-center text-center md:items-start md:text-left">
            
            {/* Top Row: Status & Actions */}
            <div className="mb-1 flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                     <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse" />
                     <span className="text-xs font-medium uppercase tracking-wider text-white/50">Now Playing</span>
                </div>
                <div className="flex gap-2">
                    <a href={song.item.external_urls.spotify} target="_blank" rel="noreferrer" className="text-white/30 hover:text-white transition">
                        <ExternalLink size={16}/>
                    </a>
                    <button onClick={fetchNowPlaying} disabled={loading} className="text-white/30 hover:text-white transition">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Song Title & Artist */}
            <h1 className="text-2xl font-black text-white md:text-4xl truncate w-full drop-shadow-md leading-tight">
                {song.item.name}
            </h1>
            <p className="text-lg text-white/70 truncate w-full mb-6">
                {song.item.artists.map((a: any) => a.name).join(", ")}
            </p>

            {/* Progress Bar */}
            <div className="w-full space-y-2">
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div 
                        className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${progressPercent}%`, backgroundColor: accentColor, boxShadow: `0 0 12px ${accentColor}` }}
                    />
                </div>
                <div className="flex justify-between text-xs font-mono text-white/40">
                    <span>{formatTime(progressMs)}</span>
                    <span>{formatTime(durationMs)}</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}