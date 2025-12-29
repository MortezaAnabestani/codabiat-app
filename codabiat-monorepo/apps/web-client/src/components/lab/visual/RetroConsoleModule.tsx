import React, { useState, useEffect, useCallback, useRef } from "react";
// Add missing RefreshCw import from lucide-react
import {
  Monitor,
  Gamepad,
  Zap,
  Heart,
  Trophy,
  Terminal,
  ShieldAlert,
  Cpu,
  Keyboard,
  RefreshCw,
} from "lucide-react";

interface Tile {
  char: string;
  type: "floor" | "wall" | "item" | "enemy" | "goal";
  discovered: boolean;
  word?: string;
}

const GRID_SIZE = 15;
const INITIAL_INTEGRITY = 100;

export const RetroConsoleModule: React.FC = () => {
  // --- State ---
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [integrity, setIntegrity] = useState(INITIAL_INTEGRITY);
  const [score, setScore] = useState(0);
  const [collectedWords, setCollectedWords] = useState<string[]>([]);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost" | "idle">("idle");
  const [logs, setLogs] = useState<string[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);

  // --- Audio Feedback (8-bit style) ---
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
    setLogs((prev) =>
      [`[${new Date().toLocaleTimeString("en-GB", { hour12: false })}] ${msg}`, ...prev].slice(0, 5)
    );
  };

  // --- Grid Generation ---
  const initGame = useCallback(() => {
    const poemWords = ["در", "ازل", "پرتو", "حسنت", "ز", "تجلی", "دم", "زد"];
    const newGrid: Tile[][] = [];

    for (let y = 0; y < GRID_SIZE; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        // Outer Walls
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

    // Place Player
    setPlayer({ x: 1, y: 1 });
    newGrid[1][1].discovered = true;

    // Place Items (Poem Words)
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

    // Place Enemies (Data Corruptors)
    for (let i = 0; i < 5; i++) {
      const rx = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
      const ry = Math.floor(Math.random() * (GRID_SIZE - 2)) + 1;
      if (newGrid[ry][rx].type === "floor") {
        newGrid[ry][rx] = { char: "!", type: "enemy", discovered: false };
      }
    }

    // Place Goal (Portal)
    newGrid[GRID_SIZE - 2][GRID_SIZE - 2] = { char: "Ω", type: "goal", discovered: false };

    setGrid(newGrid);
    setIntegrity(INITIAL_INTEGRITY);
    setScore(0);
    setCollectedWords([]);
    setGameState("playing");
    setLogs(["[SYSTEM] BOOT_SEQUENCE_COMPLETE", "[INFO] NAVIGATE WITH ARROWS"]);
  }, []);

  // --- Movement Logic ---
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

    // Handle Interactions
    const newGrid = [...grid];
    if (targetTile.type === "item") {
      addLog(`ARTIFACT_FOUND: ${targetTile.word}`);
      setCollectedWords((prev) => [...prev, targetTile.word!]);
      setScore((s) => s + 50);
      playBeep(880, "square", 0.2);
      newGrid[newY][newX] = { char: "·", type: "floor", discovered: true };
    } else if (targetTile.type === "enemy") {
      addLog("ALERT: SEMANTIC_CORRUPTION_DETECTED");
      setIntegrity((i) => Math.max(0, i - 20));
      playBeep(150, "sawtooth", 0.3);
      newGrid[newY][newX] = { char: "·", type: "floor", discovered: true };
    } else if (targetTile.type === "goal") {
      if (collectedWords.length >= 4) {
        setGameState("won");
        addLog("LEVEL_CLEARED: REALITY_STABILIZED");
        playBeep(1200, "square", 0.5);
      } else {
        addLog("ERROR: INSUFFICIENT_SEMANTIC_DATA");
        playBeep(200, "sine", 0.2);
      }
    }

    // Discover surrounding tiles
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

  // --- Key Listeners ---
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
      addLog("FATAL_ERROR: MEMORY_CORRUPTED");
    }
  }, [integrity, gameState]);

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#020402] overflow-hidden font-mono">
      {/* Left Panel: Console HUD */}
      <div className="w-full md:w-80 p-6 flex flex-col gap-6 border-l border-[#00ff41]/20 z-20 bg-black shrink-0 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 border-b border-[#00ff41]/20 pb-4">
          <div className="p-2 bg-[#00ff41]/10 rounded-lg text-[#00ff41]">
            <Monitor size={24} />
          </div>
          <div>
            <h2 className="text-[#00ff41] font-display text-xl tracking-tight uppercase">هزارتوی نویسه‌ها</h2>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest">ASCII_Crawler_v8.1</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Integrity (Health) */}
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-2 uppercase">
              <span className="flex items-center gap-1">
                <Heart size={10} className="text-red-500" /> Integrity
              </span>
              <span className={integrity < 30 ? "text-red-500 animate-pulse" : "text-[#00ff41]"}>
                {integrity}%
              </span>
            </div>
            <div className="h-2 bg-gray-900 rounded-full border border-white/5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  integrity < 30
                    ? "bg-red-600 shadow-[0_0_10px_#ff0000]"
                    : "bg-[#00ff41] shadow-[0_0_10px_#00ff41]"
                }`}
                style={{ width: `${integrity}%` }}
              />
            </div>
          </div>

          {/* Stats Matrix */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0a0a0a] border border-[#00ff41]/20 p-3 rounded-lg text-center">
              <Trophy size={14} className="mx-auto mb-1 text-yellow-500" />
              <span className="text-[8px] text-gray-500 uppercase block">Score</span>
              <span className="text-sm text-white font-bold">{score}</span>
            </div>
            <div className="bg-[#0a0a0a] border border-[#00ff41]/20 p-3 rounded-lg text-center">
              <Zap size={14} className="mx-auto mb-1 text-blue-400" />
              <span className="text-[8px] text-gray-500 uppercase block">Fragments</span>
              <span className="text-sm text-white font-bold">{collectedWords.length}/8</span>
            </div>
          </div>

          {/* Collected Poetics */}
          <div className="bg-[#050505] border border-[#00ff41]/10 rounded-xl p-4 flex flex-col gap-2 h-40 overflow-y-auto custom-scrollbar">
            <div className="text-[9px] text-[#00ff41]/60 uppercase tracking-widest border-b border-white/5 pb-2 mb-1">
              Semantic_Buffer
            </div>
            {collectedWords.map((w, i) => (
              <div key={i} className="text-xs text-white/80 animate-in slide-in-from-right-2" dir="rtl">
                {i + 1}. {w}
              </div>
            ))}
            {collectedWords.length === 0 && (
              <div className="text-[9px] text-gray-700 italic">No data found...</div>
            )}
          </div>

          {/* Controls Hint */}
          <div className="bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 mb-2 text-[#00ff41]/40">
              <Keyboard size={12} />
              <span className="text-[8px] uppercase font-bold">Local_Input_Mapping</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-[9px] text-gray-500 flex justify-between px-2 py-1 bg-black rounded">
                <span>ARROWS</span>
                <span>MOVE</span>
              </div>
              <div className="text-[9px] text-gray-500 flex justify-between px-2 py-1 bg-black rounded">
                <span>ENTER</span>
                <span>START</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <button
            onClick={initGame}
            className="w-full py-3 bg-[#00ff41] hover:bg-[#2eff0a] text-black font-bold rounded-lg text-xs transition-all shadow-[0_0_15px_rgba(0,255,65,0.3)] flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> ری‌استارت کنسول
          </button>
          <div className="flex gap-2">
            <div className="flex-1 p-2 bg-black border border-white/5 rounded text-[8px] text-gray-600 font-mono flex items-center justify-between">
              <span>OS_KERNEL: STABLE</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Right: The Virtual CRT Screen */}
      <div className="flex-grow relative bg-[#050505] p-4 md:p-8 flex items-center justify-center">
        <div className="relative w-full max-w-2xl aspect-square border-[16px] border-[#1a1a1a] rounded-xl shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden bg-black">
          {/* Scanlines & Glow Overlay */}
          <div className="absolute inset-0 z-20  opacity-20 bg-scanlines bg-[size:100%_4px]"></div>
          <div className="absolute inset-0 z-20  shadow-[inset_0_0_100px_rgba(0,255,65,0.15)]"></div>
          <div className="absolute inset-0 z-20  bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]"></div>

          {/* Game Render Logic */}
          {gameState === "idle" ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Monitor size={80} className="text-[#00ff41] mb-6 animate-pulse" />
              <h3 className="text-[#00ff41] font-display text-4xl mb-4">آغاز عملیات</h3>
              <p className="text-gray-500 text-xs max-w-sm mb-8 uppercase tracking-[0.2em] leading-relaxed">
                Enter the semantic void. Reconstruct the lost poem by exploring the character maze. Watch for
                data corruption.
              </p>
              <button
                onClick={initGame}
                className="px-10 py-4 bg-transparent border-2 border-[#00ff41] text-[#00ff41] font-bold hover:bg-[#00ff41] hover:text-black transition-all group"
              >
                [ START_EMULATION ]
              </button>
            </div>
          ) : gameState === "lost" || gameState === "won" ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 z-30 relative">
              {gameState === "won" ? (
                <Trophy size={100} className="text-yellow-500 mb-6" />
              ) : (
                <ShieldAlert size={100} className="text-red-500 mb-6" />
              )}
              <h3
                className={`font-display text-5xl mb-4 ${
                  gameState === "won" ? "text-yellow-500" : "text-red-500"
                }`}
              >
                {gameState === "won" ? "ماموریت موفق" : "سیستم فروپاشید"}
              </h3>
              <div className="font-mono text-gray-500 text-sm mb-8 space-y-1">
                <p>TOTAL_SCORE: {score}</p>
                <p>FRAGMENT_SYNC: {collectedWords.length}/8</p>
              </div>
              <button onClick={initGame} className="px-8 py-3 bg-[#00ff41] text-black font-bold rounded">
                TRY_AGAIN
              </button>
            </div>
          ) : (
            <div className="h-full grid grid-cols-15 grid-rows-15 p-2 bg-[#020402]">
              {grid.map((row, y) =>
                row.map((tile, x) => {
                  const isPlayer = player.x === x && player.y === y;
                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`flex items-center justify-center text-sm md:text-lg transition-all duration-75 relative
                                            ${isPlayer ? "text-[#00ff41] scale-125 z-10" : ""}
                                            ${tile.discovered ? "opacity-100" : "opacity-0"}
                                        `}
                    >
                      {isPlayer ? (
                        <div className="animate-pulse flex items-center justify-center">
                          <div className="absolute inset-0 bg-[#00ff41]/20 blur-sm rounded-full"></div>@
                        </div>
                      ) : (
                        <span
                          className={`
                                                ${tile.type === "wall" ? "text-gray-700" : ""}
                                                ${
                                                  tile.type === "item"
                                                    ? "text-yellow-400 font-bold drop-shadow-[0_0_5px_#fbbf24]"
                                                    : ""
                                                }
                                                ${tile.type === "enemy" ? "text-red-500 animate-bounce" : ""}
                                                ${
                                                  tile.type === "goal"
                                                    ? "text-blue-500 font-black animate-ping"
                                                    : ""
                                                }
                                                ${tile.type === "floor" ? "text-gray-800" : ""}
                                             `}
                        >
                          {tile.char}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* HUD Status Bar (In-Screen) */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#00ff41]/5 border-t border-[#00ff41]/20 p-2 flex justify-between items-center px-4 z-30">
            <div className="flex items-center gap-3">
              <Terminal size={12} className="text-[#00ff41]" />
              <span className="text-[10px] text-[#00ff41]/60 font-mono tracking-tighter">
                {logs[0] || "READY_TO_PROCEED"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-[9px] text-[#00ff41] font-mono">
                X:{player.x} Y:{player.y}
              </span>
            </div>
          </div>
        </div>

        {/* Ambient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/5 to-transparent "></div>
      </div>
    </div>
  );
};
