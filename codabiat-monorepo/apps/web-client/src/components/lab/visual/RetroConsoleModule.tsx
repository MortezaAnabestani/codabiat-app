import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Monitor,
  Zap,
  Heart,
  Trophy,
  Terminal,
  ShieldAlert,
  Keyboard,
  RefreshCw,
  Skull,
  Scroll,
  Hand,
} from "lucide-react";

// --- TYPES ---
interface Tile {
  char: string;
  type: "floor" | "wall" | "item" | "enemy" | "goal";
  discovered: boolean;
  word?: string;
}

const GRID_SIZE = 15;
const INITIAL_INTEGRITY = 100;

// --- STYLES (INJECTED FOR COMIX ZONE FEEL) ---
const comixStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Permanent+Marker&display=swap');

  .font-comic { font-family: 'Bangers', cursive; letter-spacing: 1px; }
  .font-hand { font-family: 'Permanent Marker', cursive; }
  
  /* The Void / Artist Desk Texture */
  .bg-artist-desk {
    background-color: #1a1a1a;
    background-image: 
      radial-gradient(#333 1px, transparent 1px),
      radial-gradient(#222 1px, transparent 1px);
    background-position: 0 0, 25px 25px;
    background-size: 50px 50px;
  }

  /* Rough Ink Borders */
  .panel-border {
    border: 4px solid #000;
    box-shadow: 5px 5px 0px #000;
    clip-path: polygon(
      0% 2%, 2% 0%, 98% 1%, 100% 3%, 
      99% 98%, 97% 100%, 2% 99%, 0% 97%
    );
  }

  /* Sega Inventory Slot */
  .inventory-slot {
    background: linear-gradient(135deg, #FFCC00 0%, #E07000 100%);
    border: 3px solid #000;
    box-shadow: inset 2px 2px 0px rgba(255,255,255,0.4), inset -2px -2px 0px rgba(0,0,0,0.4);
  }

  /* Mortus Hand Reveal Animation */
  @keyframes drawReveal {
    0% { clip-path: inset(0 100% 0 0); }
    100% { clip-path: inset(0 0 0 0); }
  }
  .animate-draw {
    animation: drawReveal 0.8s steps(10) forwards;
  }

  /* Onomatopoeia Pop */
  @keyframes powPop {
    0% { transform: scale(0) rotate(-10deg); opacity: 0; }
    50% { transform: scale(1.5) rotate(10deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  .pop-effect {
    animation: powPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
`;

export const RetroConsoleModule: React.FC = () => {
  // --- State (UNCHANGED) ---
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [integrity, setIntegrity] = useState(INITIAL_INTEGRITY);
  const [score, setScore] = useState(0);
  const [collectedWords, setCollectedWords] = useState<string[]>([]);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost" | "idle">("idle");
  const [logs, setLogs] = useState<string[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);

  // --- Audio Feedback (UNCHANGED) ---
  const playBeep = (freq: number, type: OscillatorType = "square", dur = 0.1) => {
    if (!audioContextRef.current)
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  };

  const addLog = (msg: string) => {
    setLogs((prev) => [`> ${msg.toUpperCase()}`, ...prev].slice(0, 5));
  };

  // --- Grid Generation (UNCHANGED) ---
  const initGame = useCallback(() => {
    const poemWords = ["در", "ازل", "پرتو", "حسنت", "ز", "تجلی", "دم", "زد"];
    const newGrid: Tile[][] = [];

    for (let y = 0; y < GRID_SIZE; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        if (x === 0 || y === 0 || x === GRID_SIZE - 1 || y === GRID_SIZE - 1) {
          row.push({ char: "█", type: "wall", discovered: true });
        } else if (Math.random() < 0.15) {
          row.push({ char: "▓", type: "wall", discovered: false });
        } else {
          row.push({ char: "·", type: "floor", discovered: false });
        }
      }
      newGrid.push(row);
    }

    setPlayer({ x: 1, y: 1 });
    newGrid[1][1].discovered = true;

    poemWords.forEach((word) => {
      let placed = false;
      while (!placed) {
        const rx = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        const ry = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
        if (newGrid[ry][rx].type === "floor" && (rx !== 1 || ry !== 1)) {
          newGrid[ry][rx] = { char: word[0], type: "item", discovered: false, word };
          placed = true;
        }
      }
    });

    for (let i = 0; i < 5; i++) {
      const rx = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
      const ry = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
      if (newGrid[ry][rx].type === "floor") {
        newGrid[ry][rx] = { char: "!", type: "enemy", discovered: false };
      }
    }

    newGrid[GRID_SIZE - 2][GRID_SIZE - 2] = { char: "Ω", type: "goal", discovered: false };

    setGrid(newGrid);
    setIntegrity(INITIAL_INTEGRITY);
    setScore(0);
    setCollectedWords([]);
    setGameState("playing");
    setLogs(["EPISODE 1: THE VOID", "MISSION: RECOVER FRAGMENTS"]);
  }, []);

  // --- Movement Logic (UNCHANGED) ---
  const movePlayer = (dx: number, dy: number) => {
    if (gameState !== "playing") return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;

    const targetTile = grid[newY][newX];
    if (targetTile.type === "wall") {
      playBeep(100, "sine", 0.05);
      return;
    }

    const newGrid = [...grid];
    if (targetTile.type === "item") {
      addLog(`FRAGMENT FOUND: ${targetTile.word}`);
      setCollectedWords((prev) => [...prev, targetTile.word!]);
      setScore((s) => s + 50);
      playBeep(880, "square", 0.2);
      newGrid[newY][newX] = { char: "·", type: "floor", discovered: true };
    } else if (targetTile.type === "enemy") {
      addLog("OUCH! MUTANT ATTACK!");
      setIntegrity((i) => Math.max(0, i - 20));
      playBeep(150, "sawtooth", 0.3);
      newGrid[newY][newX] = { char: "·", type: "floor", discovered: true };
    } else if (targetTile.type === "goal") {
      if (collectedWords.length >= 4) {
        setGameState("won");
        addLog("PAGE COMPLETE! NEXT EPISODE...");
        playBeep(1200, "square", 0.5);
      } else {
        addLog("LOCKED! NEED MORE INK...");
        playBeep(200, "sine", 0.2);
      }
    }

    for (let iy = -1; iy <= 1; iy++) {
      for (let ix = -1; ix <= 1; ix++) {
        const vx = newX + ix;
        const vy = newY + iy;
        if (vx >= 0 && vx < GRID_SIZE && vy >= 0 && vy < GRID_SIZE) {
          newGrid[vy][vx].discovered = true;
        }
      }
    }

    setGrid(newGrid);
    setPlayer({ x: newX, y: newY });
    playBeep(440, "triangle", 0.02);
  };

  // --- Key Listeners (UNCHANGED) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "ArrowUp") movePlayer(0, -1);
        if (e.key === "ArrowDown") movePlayer(0, 1);
        if (e.key === "ArrowLeft") movePlayer(-1, 0);
        if (e.key === "ArrowRight") movePlayer(1, 0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player, grid, gameState, collectedWords]);

  useEffect(() => {
    if (integrity <= 0 && gameState === "playing") {
      setGameState("lost");
      addLog("GAME OVER: INK DRIED OUT");
    }
  }, [integrity, gameState]);

  // --- RENDER HELPERS ---
  const getTileStyle = (tile: Tile, isPlayer: boolean) => {
    if (isPlayer) return "text-[#E07000] z-20 scale-125 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]";
    if (!tile.discovered) return "opacity-0";

    switch (tile.type) {
      case "wall":
        return "text-black bg-black/10";
      case "item":
        return "text-[#FFCC00] animate-pulse drop-shadow-[0_0_5px_#E07000]";
      case "enemy":
        return "text-[#500050] animate-bounce font-bold";
      case "goal":
        return "text-[#006000] animate-spin-slow font-black";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="h-full w-full bg-artist-desk flex flex-col items-center justify-center p-4 overflow-hidden relative font-comic select-none">
      <style>{comixStyles}</style>

      {/* --- THE INVENTORY STRIP (HEADER) --- */}
      <div className="w-full max-w-4xl flex justify-between items-end mb-4 px-2 z-30">
        {/* Left: Status Slots */}
        <div className="flex gap-3">
          {/* Slot 1: Integrity */}
          <div className="inventory-slot w-16 h-16 flex flex-col items-center justify-center relative group transform -rotate-2 hover:rotate-0 transition-transform">
            <div className="absolute -top-2 -left-2 bg-white border-2 border-black px-1 text-[10px] font-bold rotate-[-5deg]">
              HP
            </div>
            <Heart
              size={24}
              className={`${integrity < 30 ? "text-red-600 animate-ping" : "text-red-600"}`}
              fill="currentColor"
            />
            <span className="text-black font-black text-lg leading-none mt-1">{integrity}</span>
          </div>

          {/* Slot 2: Score */}
          <div className="inventory-slot w-16 h-16 flex flex-col items-center justify-center relative transform rotate-1 hover:rotate-0 transition-transform">
            <div className="absolute -top-2 -right-2 bg-white border-2 border-black px-1 text-[10px] font-bold rotate-[5deg]">
              XP
            </div>
            <Trophy size={24} className="text-white drop-shadow-md" />
            <span className="text-black font-black text-lg leading-none mt-1">{score}</span>
          </div>
        </div>

        {/* Center: Title Card */}
        <div className="hidden md:block bg-white border-4 border-black p-2 transform -rotate-1 shadow-[4px_4px_0_#000]">
          <h1 className="text-3xl font-black text-[#E07000] uppercase tracking-tighter leading-none text-center">
            Night of the{" "}
            <span className="text-black block text-sm tracking-widest bg-[#FFCC00]">Mutant Data</span>
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex gap-3">
          {/* Slot 3: Fragments */}
          <div className="inventory-slot w-16 h-16 flex flex-col items-center justify-center relative transform rotate-2 hover:rotate-0 transition-transform">
            <div className="absolute -bottom-2 -right-2 bg-white border-2 border-black px-1 text-[10px] font-bold rotate-[-5deg]">
              INK
            </div>
            <Scroll size={24} className="text-white" />
            <span className="text-black font-black text-lg leading-none mt-1">{collectedWords.length}/8</span>
          </div>

          {/* Action: Restart */}
          <button
            onClick={initGame}
            className="inventory-slot w-16 h-16 flex flex-col items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all bg-gradient-to-br from-red-500 to-red-700"
          >
            <RefreshCw size={28} className="text-white animate-spin-slow" />
          </button>
        </div>
      </div>

      {/* --- THE COMIC PAGE (MAIN CONTAINER) --- */}
      <div className="relative w-full max-w-4xl aspect-[4/3] bg-white border-8 border-white shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
        {/* Background Paper Texture */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] pointer-events-none"></div>

        {/* --- PANEL 1: THE GAME GRID (ACTION SHOT) --- */}
        <div className="flex-grow relative panel-border bg-[#500050] overflow-hidden group">
          {/* Panel Label */}
          <div className="absolute top-0 left-0 bg-[#FFCC00] border-b-2 border-r-2 border-black px-2 py-1 z-30">
            <span className="text-xs font-bold uppercase tracking-widest">Panel 1: The Maze</span>
          </div>

          {/* Game State Rendering */}
          {gameState === "idle" ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-[#E07000]">
              <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,0.5)] transform rotate-2">
                <h2 className="text-5xl font-black mb-2 text-black">EPISODE 1</h2>
                <p className="font-hand text-xl mb-6 text-gray-800 rotate-[-2deg]">
                  "Sketch Turner is trapped in the code..."
                </p>
                <button
                  onClick={initGame}
                  className="bg-black text-white text-2xl px-8 py-3 font-bold hover:bg-[#FFCC00] hover:text-black transition-colors border-2 border-transparent hover:border-black"
                >
                  START EPISODE
                </button>
              </div>
            </div>
          ) : gameState === "lost" || gameState === "won" ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 relative z-40 bg-black/90">
              {/* Dramatic Text Overlay */}
              <div className="relative">
                <h2
                  className={`text-8xl font-black italic absolute -top-1 -left-1 ${
                    gameState === "won" ? "text-white" : "text-gray-800"
                  }`}
                >
                  {gameState === "won" ? "VICTORY!" : "DOOMED!"}
                </h2>
                <h2
                  className={`text-8xl font-black italic relative z-10 ${
                    gameState === "won" ? "text-[#FFCC00]" : "text-red-600"
                  }`}
                >
                  {gameState === "won" ? "VICTORY!" : "DOOMED!"}
                </h2>
              </div>

              <div className="mt-8 bg-white border-4 border-black p-4 transform -rotate-2 max-w-xs">
                <p className="font-hand text-lg">
                  {gameState === "won"
                    ? "Sketch escaped the panel! The narrative is safe."
                    : "Mortus erased you from existence."}
                </p>
              </div>

              <button
                onClick={initGame}
                className="mt-8 px-6 py-2 bg-[#E07000] border-2 border-black font-bold text-xl hover:bg-white transition-colors shadow-[4px_4px_0_#000]"
              >
                RETRY?
              </button>
            </div>
          ) : (
            // THE GRID ITSELF
            <div className="h-full w-full grid grid-cols-15 grid-rows-15 p-4 relative">
              {/* Grid Background Effect */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,#000_120%)] pointer-events-none z-10"></div>

              {grid.map((row, y) =>
                row.map((tile, x) => {
                  const isPlayer = player.x === x && player.y === y;
                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`flex items-center justify-center text-lg md:text-xl relative transition-all duration-100`}
                    >
                      {/* Floor Tiles as Dots */}
                      {tile.type === "floor" && tile.discovered && !isPlayer && (
                        <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                      )}

                      {/* Content */}
                      <span className={`${getTileStyle(tile, isPlayer)} relative`}>
                        {isPlayer ? (
                          <div className="relative">
                            <span className="absolute -inset-2 bg-white rounded-full blur-sm opacity-50 animate-pulse"></span>
                            <span className="relative text-2xl">@</span>
                            {/* Sketch's Fist Pointer */}
                            <div className="absolute -right-4 -bottom-4 text-white text-[10px] font-bold bg-black px-1 rotate-[-10deg]">
                              ME
                            </div>
                          </div>
                        ) : (
                          tile.char
                        )}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* --- PANEL 2: NARRATIVE & LOGS (SIDEBAR) --- */}
        <div className="w-full md:w-64 flex flex-col gap-4 shrink-0">
          {/* Narrator Box (Yellow) */}
          <div className="bg-[#FFCC00] border-4 border-black p-3 shadow-[4px_4px_0_rgba(0,0,0,0.2)] relative">
            <div className="text-[10px] font-bold uppercase mb-1 border-b-2 border-black pb-1">Narrator</div>
            <div className="font-hand text-sm leading-tight min-h-[60px]">
              {logs[0] || "The page is blank. Waiting for input..."}
            </div>
          </div>

          {/* Speech Bubble (Collected Words) */}
          <div className="flex-grow bg-white border-4 border-black rounded-[20px] rounded-bl-none p-4 relative shadow-[4px_4px_0_rgba(0,0,0,0.2)] flex flex-col">
            {/* Bubble Tail */}
            <div className="absolute -bottom-4 -left-[4px] w-0 h-0 border-l-[20px] border-l-black border-b-[20px] border-b-transparent"></div>
            <div className="absolute -bottom-[10px] left-0 w-0 h-0 border-l-[14px] border-l-white border-b-[14px] border-b-transparent z-10"></div>

            <h3 className="font-black text-xl uppercase border-b-2 border-dashed border-gray-300 pb-2 mb-2">
              Fragments
            </h3>

            <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar" dir="rtl">
              {collectedWords.length === 0 ? (
                <span className="text-gray-400 text-xs italic text-center block mt-4">
                  هنوز کلمه‌ای پیدا نشده...
                </span>
              ) : (
                collectedWords.map((w, i) => (
                  <div
                    key={i}
                    className="animate-draw bg-gray-100 px-2 py-1 border border-gray-300 rounded text-sm font-bold text-[#500050]"
                  >
                    {w}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Controls Hint (Sticker Style) */}
          <div className="bg-black text-white p-2 transform rotate-1 text-center border-2 border-white border-dashed">
            <div className="flex justify-center gap-4 text-xs font-bold uppercase">
              <span className="flex items-center gap-1">
                <Keyboard size={12} /> Arrows to Move
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- FLOATING ONOMATOPOEIA (Visual FX) --- */}
      {gameState === "playing" && (
        <div className="absolute bottom-4 right-4 pointer-events-none opacity-50">
          <span className="text-6xl font-black text-white drop-shadow-[4px_4px_0_#000] rotate-[-15deg] block">
            POW!
          </span>
        </div>
      )}
    </div>
  );
};
