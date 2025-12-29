import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Terminal,
  Cpu,
  Zap,
  ShieldAlert,
  Activity,
  RefreshCw,
  Play,
  Square,
  Timer,
  Trophy,
  MessageSquareCode,
  Keyboard,
  Flame,
} from "lucide-react";

interface DataParticle {
  id: number;
  char: string;
  x: number;
  y: number;
  speed: number;
  type: "noise" | "fragment" | "powerup";
  word?: string;
}

const PLAYER_WIDTH = 2; // In grid units
const GRID_SIZE = 40;

export const CyberBreachModule: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<"idle" | "running" | "over" | "win">("idle");
  const [playerX, setPlayerX] = useState(20);
  const [buffer, setBuffer] = useState(0); // 0 to 100
  const [score, setScore] = useState(0);
  const [compiledText, setCompiledText] = useState<string[]>([]);
  const [time, setTime] = useState(0);
  const [slowMo, setSlowMo] = useState(false);

  // Game Refs
  const particlesRef = useRef<DataParticle[]>([]);
  const requestRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Verse Data to collect
  const targetVerses = ["در", "ازل", "پرتو", "حسنت", "ز", "تجلی", "دم", "زد"];

  // --- Audio Feedback ---
  const playSfx = (freq: number, type: OscillatorType = "square", dur = 0.1) => {
    if (!audioCtxRef.current)
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  };

  // --- Core Game Loop ---
  const update = useCallback(
    (ts: number) => {
      if (gameState !== "running") return;

      const delta = slowMo ? 0.2 : 1;

      // 1. Spawning Logic
      if (ts - lastSpawnRef.current > 150 / delta) {
        const isFragment = Math.random() > 0.95 && compiledText.length < targetVerses.length;
        particlesRef.current.push({
          id: Date.now() + Math.random(),
          char: isFragment
            ? targetVerses[compiledText.length][0]
            : String.fromCharCode(0x0600 + Math.random() * 200),
          x: Math.floor(Math.random() * GRID_SIZE),
          y: -5,
          speed: (0.3 + Math.random() * 0.5) * delta,
          type: isFragment ? "fragment" : "noise",
          word: isFragment ? targetVerses[compiledText.length] : undefined,
        });
        lastSpawnRef.current = ts;
      }

      // 2. Update Particles & Collision
      const nextParticles: DataParticle[] = [];
      particlesRef.current.forEach((p) => {
        p.y += p.speed;

        // Check Collision with player (player is at fixed Y bottom)
        const playerY = GRID_SIZE - 2;
        if (Math.abs(p.y - playerY) < 1 && Math.abs(p.x - playerX) < 1.5) {
          if (p.type === "noise") {
            setBuffer((b) => Math.min(100, b + 5));
            playSfx(100, "sawtooth", 0.2);
            // Shake screen simulation via state could go here
          } else if (p.type === "fragment") {
            setCompiledText((prev) => [...prev, p.word!]);
            setScore((s) => s + 500);
            playSfx(880, "sine", 0.4);
          }
        } else if (p.y < GRID_SIZE + 5) {
          nextParticles.push(p);
        }
      });
      particlesRef.current = nextParticles;

      // 3. Time Tick
      setTime((t) => t + (slowMo ? 0.005 : 0.016));

      requestRef.current = requestAnimationFrame(update);
    },
    [gameState, playerX, compiledText, slowMo]
  );

  useEffect(() => {
    if (gameState === "running") {
      requestRef.current = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, update]);

  // --- Key Listeners ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "running") return;

      if (e.key === "ArrowLeft") setPlayerX((x) => Math.max(0, x - 1.5));
      if (e.key === "ArrowRight") setPlayerX((x) => Math.min(GRID_SIZE - 1, x + 1.5));
      if (e.key === " ") setSlowMo(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") setSlowMo(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  // Win/Loss Condition
  useEffect(() => {
    if (buffer >= 100) {
      setGameState("over");
      playSfx(50, "square", 1);
    }
    if (compiledText.length >= targetVerses.length) {
      setGameState("win");
      playSfx(1200, "sine", 0.8);
    }
  }, [buffer, compiledText]);

  const startGame = () => {
    particlesRef.current = [];
    setBuffer(0);
    setScore(0);
    setCompiledText([]);
    setTime(0);
    setGameState("running");
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#020402] overflow-hidden font-mono text-neon-green select-none">
      {/* Left: Terminal HUD */}
      <div className="w-full md:w-80 p-6 flex flex-col gap-6 border-l border-neon-green/20 z-20 bg-black shrink-0 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-4 border-b border-neon-green/20 pb-4">
          <div className="p-2 bg-neon-green/10 rounded-lg">
            <Cpu size={24} className={gameState === "running" ? "animate-pulse" : ""} />
          </div>
          <div>
            <h2 className="text-white font-display text-xl tracking-tighter">نفوذ در هسته</h2>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest">Mem_Breacher_v10.2</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Buffer Integrity */}
          <div>
            <div className="flex justify-between text-[10px] mb-2 uppercase tracking-tighter">
              <span className="flex items-center gap-1">
                <ShieldAlert size={10} /> Memory_Overflow
              </span>
              <span className={buffer > 80 ? "text-red-500 animate-pulse" : ""}>{buffer}%</span>
            </div>
            <div className="h-2 bg-gray-900 border border-neon-green/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  buffer > 80 ? "bg-red-500 shadow-[0_0_10px_red]" : "bg-neon-green shadow-[0_0_10px_#39ff14]"
                }`}
                style={{ width: `${buffer}%` }}
              />
            </div>
          </div>

          {/* Stats Matrix */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-neon-green/10 p-3 rounded-lg text-center">
              <Trophy size={14} className="mx-auto mb-1 text-yellow-500" />
              <span className="text-[8px] text-gray-500 uppercase block">Score</span>
              <span className="text-sm text-white font-bold">{score}</span>
            </div>
            <div className="bg-white/5 border border-neon-green/10 p-3 rounded-lg text-center">
              <Timer size={14} className="mx-auto mb-1 text-blue-400" />
              <span className="text-[8px] text-gray-500 uppercase block">Uptime</span>
              <span className="text-sm text-white font-bold">{time.toFixed(1)}s</span>
            </div>
          </div>

          {/* Fragment Buffer */}
          <div className="bg-[#050505] border border-neon-green/10 rounded-xl p-4 flex flex-col gap-2 min-h-[160px] relative">
            <div className="text-[9px] text-neon-green/40 uppercase tracking-widest border-b border-white/5 pb-2 mb-1 flex justify-between">
              <span>Compiled_Verses</span>
              <span>{compiledText.length}/8</span>
            </div>
            <div className="flex flex-wrap gap-2" dir="rtl">
              {compiledText.map((v, i) => (
                <span
                  key={i}
                  className="text-xs text-neon-green animate-in zoom-in font-display border-b border-neon-green/20"
                >
                  {v}
                </span>
              ))}
            </div>
            {compiledText.length === 0 && (
              <div className="text-[9px] text-gray-700 italic absolute inset-0 flex items-center justify-center ">
                Awaiting data fragments...
              </div>
            )}
          </div>

          {/* Controller Interface */}
          <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-3 text-neon-green/40">
              <Keyboard size={12} />
              <span className="text-[8px] uppercase font-bold">Input_Mapping</span>
            </div>
            <div className="space-y-1.5">
              <div className="text-[9px] text-gray-500 flex justify-between px-2 py-1 bg-black/40 rounded border border-white/5">
                <span>ARROWS</span>
                <span>X_AXIS_NAV</span>
              </div>
              <div className="text-[9px] text-gray-500 flex justify-between px-2 py-1 bg-black/40 rounded border border-white/5">
                <span>SPACE</span>
                <span>NEURAL_SLOWMO</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-2">
          {gameState === "idle" || gameState === "over" || gameState === "win" ? (
            <button
              onClick={startGame}
              className="w-full py-4 bg-neon-green hover:bg-[#2eff0a] text-black font-bold rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(57,255,20,0.4)] flex items-center justify-center gap-3 active:scale-95"
            >
              <Play size={18} fill="black" /> {gameState === "idle" ? "شروع نفوذ" : "تلاش مجدد"}
            </button>
          ) : (
            <button
              onClick={() => setGameState("over")}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-3"
            >
              <Square size={18} fill="white" /> لغو عملیات
            </button>
          )}
        </div>
      </div>

      {/* Right: The Arcade Screen */}
      <div className="flex-grow relative bg-[#010101] p-4 md:p-8 flex items-center justify-center">
        {/* Visual Glass & Frame */}
        <div className="relative w-full max-w-3xl aspect-[4/3] border-[12px] border-[#151515] rounded-2xl shadow-[0_0_80px_rgba(0,0,0,1),0_0_20px_rgba(57,255,20,0.1)] overflow-hidden bg-black">
          {/* Retro Effects */}
          <div className="absolute inset-0 z-30  opacity-30 bg-scanlines"></div>
          <div
            className={`absolute inset-0 z-30  shadow-[inset_0_0_120px_rgba(57,255,20,0.2)] transition-opacity duration-1000 ${
              gameState === "running" ? "opacity-100" : "opacity-20"
            }`}
          ></div>
          <div className="absolute inset-0 z-30  bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.8)_100%)]"></div>

          {/* Game State Rendering */}
          {gameState === "idle" ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 relative animate-in fade-in duration-1000">
              <div className="relative mb-8">
                <Terminal
                  size={100}
                  className="text-neon-green opacity-20 absolute -inset-4 blur-xl animate-pulse"
                />
                <Terminal size={100} className="text-neon-green relative z-10" />
              </div>
              <h3 className="text-neon-green font-display text-5xl mb-6 tracking-widest drop-shadow-[0_0_10px_#39ff14]">
                اتصال برقرار است
              </h3>
              <p className="text-gray-500 text-xs max-w-md mb-10 uppercase tracking-[0.3em] leading-relaxed">
                Enter the kernel buffer. Avoid static corruption (red). Collect poetic fragments (gold) to
                stabilize the reality grid.
              </p>
              <div className="flex gap-4">
                <span className="px-4 py-1 border border-neon-green/30 text-[10px] rounded-full text-neon-green font-mono">
                  ENCRYPTED_LINE_ACTIVE
                </span>
              </div>
            </div>
          ) : gameState === "over" || gameState === "win" ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 z-40 relative animate-in zoom-in-95 duration-500">
              {gameState === "win" ? (
                <Trophy size={120} className="text-yellow-500 mb-8" />
              ) : (
                <Flame size={120} className="text-red-500 mb-8 animate-bounce" />
              )}
              <h3
                className={`font-display text-6xl mb-6 ${
                  gameState === "win" ? "text-neon-green shadow-neon-green" : "text-red-600 shadow-red-600"
                }`}
              >
                {gameState === "win" ? "نفوذ موفق" : "شکست امنیتی"}
              </h3>
              <div className="font-mono text-gray-500 text-sm mb-10 space-y-2 bg-black/80 p-6 rounded-xl border border-white/5">
                <p>DATA_PURGED: {score} BYTES</p>
                <p>INTEGRITY_CHECK: {gameState === "win" ? "VERIFIED" : "TERMINATED"}</p>
                <p className="text-[10px] mt-4 text-neon-green/40">
                  {gameState === "win" ? "LITERARY_CORE_SYNCHRONIZED" : "SYSTEM_REBOOT_REQUIRED"}
                </p>
              </div>
              <button
                onClick={startGame}
                className="px-12 py-4 bg-neon-green text-black font-black rounded-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(57,255,20,0.4)]"
              >
                RE-INITIALIZE
              </button>
            </div>
          ) : (
            /* The Active Game Canvas Simulation */
            <div className="h-full relative overflow-hidden bg-black flex flex-col">
              {/* Data Stream */}
              {particlesRef.current.map((p) => (
                <div
                  key={p.id}
                  className={`absolute transition-all duration-75 leading-none font-mono font-bold
                                        ${
                                          p.type === "fragment"
                                            ? "text-yellow-400 text-2xl drop-shadow-[0_0_8px_#fbbf24] animate-pulse z-20"
                                            : "text-gray-800 text-sm opacity-50"
                                        }
                                        ${
                                          p.type === "noise" && p.char === "!"
                                            ? "text-red-600 opacity-100 z-10 scale-150"
                                            : ""
                                        }
                                    `}
                  style={{
                    left: `${(p.x / GRID_SIZE) * 100}%`,
                    top: `${(p.y / GRID_SIZE) * 100}%`,
                  }}
                >
                  {p.char}
                </div>
              ))}

              {/* Slow-Mo Overlay */}
              {slowMo && (
                <div className="absolute inset-0 bg-blue-500/5 animate-pulse z-30  border-[20px] border-blue-500/10">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono text-blue-400 uppercase tracking-[1em]">
                    Neural_Overclocking
                  </div>
                </div>
              )}

              {/* Player Node */}
              <div
                className="absolute bottom-10 transition-all duration-100 z-50 flex flex-col items-center"
                style={{ left: `${(playerX / GRID_SIZE) * 100}%`, transform: "translateX(-50%)" }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-neon-green blur-md opacity-50 animate-ping"></div>
                  <div className="relative w-8 h-8 bg-black border-2 border-neon-green flex items-center justify-center rounded-sm rotate-45 group">
                    <div className="w-1 h-1 bg-neon-green rounded-full animate-pulse"></div>
                  </div>
                  <div className="absolute -top-1 w-8 h-1 bg-neon-green/30 blur-sm"></div>
                </div>
                <div className="text-[8px] font-mono text-neon-green mt-4 tracking-tighter">NODE_ID:01</div>
              </div>

              {/* Background Grid Particles (Matrix rain simulation) */}
              <div className="absolute inset-0 z-0  overflow-hidden opacity-20">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-[8px] font-mono whitespace-pre animate-[scan_5s_linear_infinite]"
                    style={{ left: `${i * 10}%`, top: "-10%", animationDelay: `${i * 0.5}s` }}
                  >
                    {Array(40)
                      .fill(0)
                      .map(() => String.fromCharCode(0x0600 + Math.random() * 100))
                      .join("\n")}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom HUD Overlay (In-Screen) */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/90 border-t border-neon-green/20 p-2 flex justify-between items-center px-4 z-50">
            <div className="flex items-center gap-3">
              <Activity size={12} className="text-neon-green animate-pulse" />
              <span className="text-[10px] text-neon-green/60 font-mono tracking-tighter uppercase">
                {gameState === "running"
                  ? `SIGNAL_SYNC: ${(Math.random() * 10 + 90).toFixed(2)}%`
                  : "WAITING_FOR_HANDSHAKE"}
              </span>
            </div>
            <div className="flex gap-4 text-[9px] text-neon-green font-mono">
              <span>X_COORD: {playerX.toFixed(2)}</span>
              <span className="opacity-40">MEM_SEC: 0x4A29</span>
            </div>
          </div>
        </div>

        {/* Ambient Visuals */}
        <div className="absolute inset-0 bg-gradient-to-t from-neon-green/5 to-transparent "></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-neon-green/5 rounded-full blur-[100px] "></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-neon-green/5 rounded-full blur-[100px] "></div>
      </div>
    </div>
  );
};
