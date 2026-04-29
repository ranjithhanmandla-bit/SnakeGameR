import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: "Cybernetic Horizon (AI Demo)",
    artist: "Synth Mind",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "from-cyan-500 to-blue-500"
  },
  {
    id: 2,
    title: "Neon Pulse (AI Demo)",
    artist: "Neural Network",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "from-fuchsia-500 to-pink-500"
  },
  {
    id: 3,
    title: "Digital Drift (AI Demo)",
    artist: "Algo Rhythm",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    color: "from-green-400 to-emerald-600"
  }
];

export function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Default volume lower so it doesn't blast
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error("Autoplay prevented or audio error:", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTrackEnded = () => {
    handleNext();
  };

  return (
    <footer className="h-24 bg-black/80 border-t border-white/5 flex items-center px-4 sm:px-8 gap-4 sm:gap-8 shrink-0 z-20">
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={handleTrackEnded}
      />

      <div className="flex items-center gap-4 w-48 sm:w-64">
        <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${currentTrack.color} rounded magenta-glow flex items-center justify-center overflow-hidden transition-all duration-1000 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
           <div className="w-4 h-4 bg-black rounded-full" />
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold truncate text-white">{currentTrack.title}</p>
          <p className="text-xs text-white/50 truncate font-mono">{currentTrack.artist}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 px-2 flex-grow items-center">
        <div className="flex items-center gap-4 sm:gap-8">
          <button 
            onClick={handlePrev}
            className="text-white/60 hover:text-white transition-colors"
          >
            <SkipBack size={20} />
          </button>
          
          <button 
            onClick={handlePlayPause}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white flex items-center justify-center hover:bg-white hover:text-black transition-all"
          >
            {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
          </button>
          
          <button 
            onClick={handleNext}
            className="text-white/60 hover:text-white transition-colors"
          >
            <SkipForward size={20} />
          </button>
        </div>
      </div>

      <div className="w-24 sm:w-64 flex items-center justify-end gap-2 sm:gap-4">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="text-white/40 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <div className="hidden sm:block w-24 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="w-3/4 h-full bg-white/60"></div>
        </div>
      </div>
    </footer>
  );
}
