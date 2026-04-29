import { useEffect, useState, useCallback, useRef } from 'react';

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Direction = 'UP';
const BASE_SPEED = 150; // ms per tick

export function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const directionRef = useRef<Direction>(direction);

  // Sync ref with state
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Check if food spawns on snake
      const onSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setFood(generateFood(INITIAL_SNAKE));
    setIsGameOver(false);
    setIsPaused(false);
    setHasStarted(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ') {
        if (isGameOver) {
          resetGame();
        } else if (hasStarted) {
          setIsPaused((p) => !p);
        } else {
          setHasStarted(true);
        }
        return;
      }

      const currentDir = directionRef.current;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver, hasStarted]);

  // Game Loop
  useEffect(() => {
    if (isGameOver || isPaused || !hasStarted) return;

    const currentSpeed = Math.max(50, BASE_SPEED - score * 2);

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newHead = { ...head };
        const currentDir = directionRef.current;

        switch (currentDir) {
          case 'UP':
            newHead.y -= 1;
            break;
          case 'DOWN':
            newHead.y += 1;
            break;
          case 'LEFT':
            newHead.x -= 1;
            break;
          case 'RIGHT':
            newHead.x += 1;
            break;
        }

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setIsGameOver(true);
          setHighScore((prev) => Math.max(prev, score));
          return prevSnake;
        }

        // Check self collision
        if (
          prevSnake.some(
            (segment) => segment.x === newHead.x && segment.y === newHead.y
          )
        ) {
          setIsGameOver(true);
          setHighScore((prev) => Math.max(prev, score));
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); // Remove tail if not eating
        }

        return newSnake;
      });
    };

    const intervalId = setInterval(moveSnake, currentSpeed);
    return () => clearInterval(intervalId);
  }, [direction, food, isGameOver, isPaused, hasStarted, score, generateFood]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full relative">
      <header className="h-16 flex items-center justify-between px-8 bg-black/50 border-b border-cyan-900/30 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-cyan-500 flex items-center justify-center">
            <div className="w-4 h-4 bg-black rotate-45"></div>
          </div>
          <h1 className="text-xl font-bold tracking-widest neon-text">
            SYNTH-SNAKE <span className="text-xs font-normal text-cyan-400 opacity-70">v1.0.4</span>
          </h1>
        </div>
        <div className="flex items-center gap-6 sm:gap-12 font-mono text-sm">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-cyan-400">Score</span>
            <span className="text-2xl font-bold text-white">
              {score.toString().padStart(6, '0')}
            </span>
          </div>
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-[10px] uppercase text-magenta-400">Multiplier</span>
            <span className="text-2xl font-bold text-magenta-500">
              x{(1 + Math.floor(score / 500)).toFixed(1)}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-6 gap-6 relative z-10 w-full max-w-6xl mx-auto">
        <aside className="w-72 hidden lg:flex flex-col gap-4">
          <div className="flex-1 p-4 bg-[#121212]/40 rounded-xl border border-white/10 overflow-hidden">
            <h2 className="text-[10px] uppercase tracking-widest text-white/40 mb-4 font-bold">High Scores</h2>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span>LOCAL_USER</span>
                <span className="text-cyan-400">{highScore.toString().padStart(6, '0')}</span>
              </div>
              <div className="flex justify-between opacity-60">
                <span>V_RIDER</span>
                <span>009850</span>
              </div>
              <div className="flex justify-between opacity-40">
                <span>GHOST_BIT</span>
                <span>008200</span>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-[520px] aspect-square neon-border bg-black/80 p-2 relative">
            <div className="game-grid w-full h-full">
              {hasStarted && !isGameOver && snake.map((segment, index) => {
                const isHead = index === 0;
                return (
                  <div
                    key={`${segment.x}-${segment.y}-${index}`}
                    className="snake-body"
                    style={{
                      gridArea: `${segment.y + 1} / ${segment.x + 1}`,
                      opacity: isHead ? 1 : Math.max(0.4, 1 - index * 0.05),
                    }}
                  />
                );
              })}

              {hasStarted && !isGameOver && (
                <div
                  className="food"
                  style={{
                    gridArea: `${food.y + 1} / ${food.x + 1}`,
                  }}
                />
              )}
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-px bg-cyan-400/5"></div>
              <div className="h-full w-px bg-cyan-400/5"></div>
            </div>

            {/* Overlays */}
            {!hasStarted && !isGameOver && (
               <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                 <h2 className="text-3xl font-black text-white neon-text mb-4 uppercase tracking-widest">
                   Synth Snake
                 </h2>
                 <p className="text-white/40 font-mono mb-6 text-sm">Press Space to Start</p>
                 <button 
                   onClick={() => setHasStarted(true)}
                   className="px-6 py-2 bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-mono text-sm uppercase tracking-wider rounded hover:bg-cyan-400 hover:text-black transition-all"
                 >
                   Start Game
                 </button>
               </div>
            )}

            {isGameOver && (
               <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 backdrop-blur-md">
                 <h2 className="text-4xl font-black text-magenta-500 magenta-glow mb-2 uppercase tracking-widest text-shadow-sm">
                   Terminal
                 </h2>
                 <p className="text-magenta-400/80 font-mono mb-6 text-sm tracking-widest uppercase">Sequence Ended</p>
                 <div className="text-xl text-white font-mono mb-8 neon-text">Score: {score}</div>
                 <button 
                   onClick={resetGame}
                   className="px-6 py-2 bg-cyan-500/10 border border-cyan-400 text-cyan-400 font-mono text-sm uppercase tracking-wider rounded hover:bg-cyan-400 hover:text-black transition-all"
                 >
                   Reboot System
                 </button>
               </div>
            )}

            {isPaused && hasStarted && !isGameOver && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-20">
                <h2 className="text-3xl font-black text-white tracking-widest uppercase neon-text">
                  Paused
                </h2>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-white/40 font-mono text-[10px] uppercase tracking-widest">
            Use WASD/Arrows to move • Space to pause
          </div>
        </section>
      </main>

      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-magenta-900/20 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
