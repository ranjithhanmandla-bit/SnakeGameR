import { MusicPlayer } from './components/MusicPlayer';
import { SnakeGame } from './components/SnakeGame';

export default function App() {
  return (
    <div className="flex flex-col h-screen w-full bg-[#050505] text-white overflow-hidden relative font-sans">
      <SnakeGame />
      <MusicPlayer />
    </div>
  );
}
