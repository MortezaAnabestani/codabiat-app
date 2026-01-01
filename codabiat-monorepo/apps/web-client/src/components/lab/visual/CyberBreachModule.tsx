import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Skull,
  Zap,
  ShieldAlert,
  Activity,
  RefreshCw,
  Play,
  Square,
  Timer,
  Trophy,
  MessageSquare,
  Keyboard,
  Flame,
  Hand,
  Scroll,
  Eraser,
  Save,
} from "lucide-react";
import SaveArtworkDialog from "../SaveArtworkDialog";

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

// --- COMIX ZONE PALETTE ---
const COLORS = {
  mutantOrange: "#E07000",
  sewerSludge: "#006000",
  bruisedPurple: "#500050",
  sketchWhite: "#FFFFFF",
  inkBlack: "#000000",
  narratorYellow: "#FFCC00",
};

export const CyberBreachModule: React.FC = () => {
  // --- State (UNCHANGED) ---
  const [gameState, setGameState] = useState<"idle" | "running" | "over" | "win">("idle");
  const [playerX, setPlayerX] = useState(20);
  const [buffer, setBuffer] = useState(0); // 0 to 100
  const [score, setScore] = useState(0);
  const [compiledText, setCompiledText] = useState<string[]>([]);
  const [time, setTime] = useState(0);
  const [slowMo, setSlowMo] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Game Refs (UNCHANGED)
  const particlesRef = useRef<DataParticle[]>([]);
  const requestRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Verse Data (UNCHANGED)
  const targetVerses = ["در", "ازل", "پرتو", "حسنت", "ز", "تجلی", "دم", "زد"];

  // --- Audio Feedback (UNCHANGED) ---
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

  // --- Core Game Loop (UNCHANGED) ---
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

  // --- Key Listeners (UNCHANGED) ---
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

  // Win/Loss Condition (UNCHANGED)
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

  const captureScreenshot = () => {
    if (!containerRef.current) return "";
    // For now, return empty string - can be implemented with html2canvas if needed
    return "";
  };

  // --- UI RENDER (HEAVILY MODIFIED FOR COMIX ZONE STYLE) ---
  return (
    <div
      className="h-full flex flex-col md:flex-row overflow-hidden font-mono select-none relative"
      style={{ backgroundColor: "#2a2a2a" }}
    >
      {" "}
      {/* The Artist's Desk (Dark Grey) */}
      {/* Background Texture: Scattered Pencils/Eraser (Abstracted via CSS/Divs) */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#500050 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>
      {/* Left: The Inventory / Status Panel (Comic Strip Sidebar) */}
      <div className="w-full md:w-80 p-6 flex flex-col gap-6 z-20 shrink-0 overflow-y-auto custom-scrollbar relative">
        {/* Header: Narrator Box */}
        <div className="border-4 border-black bg-[#FFCC00] p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] transform -rotate-1">
          <div className="flex items-center gap-3">
            <div className="p-1 border-2 border-black bg-white">
              <Scroll size={24} className="text-black" />
            </div>
            <div>
              <h2 className="text-black font-black text-xl uppercase tracking-tighter">EPISODE 1</h2>
              <p className="text-xs text-black font-bold">"NIGHT OF THE MUTANTS"</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Health / Buffer: The "Life Bar" */}
          <div className="bg-white border-4 border-black p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between text-xs font-black mb-1 uppercase">
              <span className="flex items-center gap-1 text-black">
                <ShieldAlert size={14} /> INK LEVEL
              </span>
              <span className={buffer > 80 ? "text-red-600 animate-pulse" : "text-black"}>{buffer}%</span>
            </div>
            {/* Jagged Health Bar */}
            <div className="h-4 bg-gray-300 border-2 border-black relative overflow-hidden">
              <div
                className={`h-full transition-all duration-300 border-r-2 border-black ${
                  buffer > 80 ? "bg-red-600" : "bg-[#006000]"
                }`}
                style={{ width: `${buffer}%`, clipPath: "polygon(0 0, 100% 0, 95% 100%, 0% 100%)" }}
              />
              {/* Hatching texture overlay */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)",
                  backgroundSize: "4px 4px",
                }}
              ></div>
            </div>
          </div>

          {/* Stats: Item Slots */}
          <div className="grid grid-cols-2 gap-4">
            {/* Score Slot */}
            <div className="bg-black p-1">
              <div className="bg-[#500050] border-2 border-white/20 h-full p-2 flex flex-col items-center justify-center relative">
                <Trophy size={16} className="text-[#FFCC00] mb-1" />
                <span className="text-[10px] text-white uppercase">POINTS</span>
                <span className="text-lg text-[#FFCC00] font-black">{score}</span>
                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white"></div>
              </div>
            </div>
            {/* Time Slot */}
            <div className="bg-black p-1">
              <div className="bg-[#500050] border-2 border-white/20 h-full p-2 flex flex-col items-center justify-center relative">
                <Timer size={16} className="text-white mb-1" />
                <span className="text-[10px] text-white uppercase">TIME</span>
                <span className="text-lg text-white font-black">{time.toFixed(1)}</span>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white"></div>
              </div>
            </div>
          </div>

          {/* Fragment Collector: Speech Bubbles */}
          <div className="bg-white border-4 border-black p-4 min-h-[160px] relative shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="absolute -top-3 left-4 bg-black text-white px-2 py-0.5 text-[10px] font-bold uppercase transform -rotate-2">
              DIALOGUE BOX
            </div>
            <div className="flex flex-wrap gap-2 mt-2" dir="rtl">
              {compiledText.map((v, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-white border-2 border-black rounded-xl text-xs font-bold text-black shadow-[2px_2px_0px_#000] animate-in zoom-in"
                >
                  {v}
                </span>
              ))}
            </div>
            {compiledText.length === 0 && (
              <div className="text-xs text-gray-400 font-bold italic absolute inset-0 flex items-center justify-center uppercase">
                Waiting for script...
              </div>
            )}
          </div>

          {/* Controls: Sketch */}
          <div className="p-3 border-2 border-dashed border-gray-500 rounded-lg opacity-60">
            <div className="flex items-center gap-2 mb-2 text-gray-400">
              <Keyboard size={14} />
              <span className="text-[10px] uppercase font-bold">MOVESET</span>
            </div>
            <div className="space-y-1 text-[10px] text-gray-400 font-bold">
              <div className="flex justify-between">
                <span>ARROWS</span> <span>DODGE</span>
              </div>
              <div className="flex justify-between">
                <span>SPACE</span> <span>FOCUS (SLOW)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Inventory Items */}
        <div className="mt-auto space-y-3">
          {gameState === "idle" || gameState === "over" || gameState === "win" ? (
            <button
              onClick={startGame}
              className="w-full py-4 bg-[#E07000] border-4 border-black text-white font-black text-lg uppercase tracking-widest shadow-[6px_6px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all flex items-center justify-center gap-2 group"
            >
              <Play size={24} className="fill-white group-hover:animate-ping" />
              {gameState === "idle" ? "START EPISODE" : "RETRY LEVEL"}
            </button>
          ) : (
            <button
              onClick={() => setGameState("over")}
              className="w-full py-4 bg-red-600 border-4 border-black text-white font-black text-lg uppercase tracking-widest shadow-[6px_6px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Square size={20} className="fill-white" /> GIVE UP
            </button>
          )}

          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={gameState !== "win"}
            className={`w-full py-4 font-black text-sm uppercase border-4 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-3 transition-all
                        ${
                          gameState === "win"
                            ? "bg-[#006000] text-white hover:bg-[#007000] active:translate-y-1 active:shadow-none"
                            : "bg-gray-400 text-gray-600 cursor-not-allowed"
                        }
                    `}
          >
            <Save size={20} />
            SAVE ARTWORK
          </button>
        </div>
      </div>
      {/* Right: The Main Panel (The Game) */}
      <div className="flex-grow relative p-4 md:p-8 flex items-center justify-center bg-[#2a2a2a]">
        {/* The "Paper" Container */}
        <div className="relative w-full max-w-3xl aspect-[4/3] bg-white border-[6px] border-black shadow-[10px_10px_0px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Paper Texture Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] z-10"></div>

          {/* Game State Rendering */}
          {gameState === "idle" ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 relative animate-in fade-in duration-1000 bg-white">
              <div className="relative mb-8 transform rotate-3">
                <div className="absolute inset-0 bg-black translate-x-2 translate-y-2"></div>
                <div className="relative bg-[#E07000] p-6 border-4 border-black">
                  <Zap size={80} className="text-white fill-black" />
                </div>
              </div>
              <h3 className="text-black font-black text-6xl mb-4 tracking-tighter drop-shadow-[4px_4px_0px_#E07000]">
                READY?
              </h3>
              <p className="text-black font-bold text-sm max-w-md mb-10 uppercase tracking-widest bg-[#FFCC00] px-2">
                Collect the golden words. Dodge the green ink.
              </p>
            </div>
          ) : gameState === "over" || gameState === "win" ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 z-40 relative bg-white">
              {/* Page Tear Effect (Visual) */}
              <div
                className="absolute top-0 left-0 w-full h-4 bg-black"
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, 100% 100%, 90% 20%, 80% 100%, 70% 10%, 60% 100%, 50% 10%, 40% 100%, 30% 10%, 20% 100%, 10% 10%, 0 100%)",
                }}
              ></div>

              {gameState === "win" ? (
                <div className="relative">
                  <Trophy size={100} className="text-[#FFCC00] mb-6 drop-shadow-[4px_4px_0px_#000]" />
                  <span className="absolute -top-4 -right-10 text-4xl font-black text-black rotate-12">
                    POW!
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <Skull size={100} className="text-black mb-6" />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-600 text-6xl font-black rotate-45 opacity-80">
                    X
                  </span>
                </div>
              )}

              <h3
                className={`font-black text-7xl mb-6 uppercase italic transform -skew-x-12 ${
                  gameState === "win"
                    ? "text-[#E07000] drop-shadow-[5px_5px_0px_#000]"
                    : "text-black drop-shadow-[5px_5px_0px_#500050]"
                }`}
              >
                {gameState === "win" ? "SUCCESS!" : "GAME OVER"}
              </h3>

              <div className="font-bold text-black text-sm mb-10 space-y-2 bg-gray-100 p-6 border-4 border-black shadow-[4px_4px_0px_#000]">
                <p>INK WASTED: {score}</p>
                <p>STATUS: {gameState === "win" ? "PUBLISHED" : "SCRAPPED"}</p>
              </div>

              <button
                onClick={startGame}
                className="px-12 py-4 bg-black text-white font-black text-xl uppercase border-4 border-transparent hover:bg-white hover:text-black hover:border-black transition-all shadow-[0_0_0_4px_#fff,0_0_0_8px_#000]"
              >
                TURN PAGE
              </button>
            </div>
          ) : (
            /* The Active Game Canvas (Comic Panel) */
            <div className="h-full relative overflow-hidden bg-white flex flex-col">
              {/* Grid Lines (Sketch Guide) */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "linear-gradient(#0099ff 1px, transparent 1px), linear-gradient(90deg, #0099ff 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              ></div>

              {/* Data Stream (Falling Ink/Words) */}
              {particlesRef.current.map((p) => (
                <div
                  key={p.id}
                  className={`absolute transition-all duration-75 leading-none font-black
                        ${
                          p.type === "fragment"
                            ? "text-[#E07000] text-2xl z-20 drop-shadow-[2px_2px_0px_#000]" // Golden Words
                            : "text-[#006000] text-lg opacity-80 font-mono" // Green Sludge Text
                        }
                        ${
                          p.type === "noise" && p.char === "!"
                            ? "text-red-600 scale-150 rotate-12" // Danger
                            : ""
                        }
                    `}
                  style={{
                    left: `${(p.x / GRID_SIZE) * 100}%`,
                    top: `${(p.y / GRID_SIZE) * 100}%`,
                    fontFamily: p.type === "fragment" ? "sans-serif" : "monospace",
                  }}
                >
                  {p.type === "fragment" ? (
                    p.char
                  ) : (
                    // Render Sludge Blob for noise instead of just text sometimes
                    <span className="relative">
                      {p.char}
                      {p.type === "noise" && (
                        <span className="absolute -inset-2 bg-[#006000] opacity-20 blur-sm rounded-full -z-10"></span>
                      )}
                    </span>
                  )}
                </div>
              ))}

              {/* Slow-Mo Overlay (Blue Pencil Sketch) */}
              {slowMo && (
                <div className="absolute inset-0 bg-blue-500/10 z-30 pointer-events-none mix-blend-multiply">
                  <div className="absolute top-4 right-4 text-4xl font-black text-blue-600 rotate-12 border-4 border-blue-600 p-2">
                    FOCUS!
                  </div>
                </div>
              )}

              {/* Player Node (The Sketch Hero) */}
              <div
                className="absolute bottom-10 transition-all duration-100 z-50 flex flex-col items-center"
                style={{ left: `${(playerX / GRID_SIZE) * 100}%`, transform: "translateX(-50%)" }}
              >
                <div className="relative group">
                  {/* Action Lines */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-4 bg-black opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  {/* The Hero Sprite (Abstracted) */}
                  <div className="relative w-10 h-10 bg-black flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform">
                    <div className="absolute inset-0 bg-[#E07000] translate-x-1 translate-y-1 border-2 border-black"></div>
                    <div className="relative z-10 text-white">
                      <Zap size={24} fill="white" />
                    </div>
                  </div>

                  {/* Shadow */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/20 rounded-full blur-sm"></div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom HUD Overlay (In-Panel) */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-black p-2 flex justify-between items-center px-4 z-50">
            <div className="flex items-center gap-3">
              <Activity size={16} className="text-black" />
              <span className="text-xs text-black font-bold tracking-tighter uppercase bg-[#FFCC00] px-1">
                {gameState === "running" ? `SYNC: ${(Math.random() * 10 + 90).toFixed(0)}%` : "NO SIGNAL"}
              </span>
            </div>
            <div className="flex gap-4 text-[10px] text-black font-bold uppercase">
              <span>POS: {playerX.toFixed(0)}</span>
              <span className="opacity-50">PAGE: 14</span>
            </div>
          </div>
        </div>

        {/* Mortus Hand (Decorative Element) - Appears on hover or events */}
        <div className="absolute -bottom-10 -right-10 pointer-events-none opacity-0 md:opacity-100 transition-opacity duration-500">
          <Hand size={200} className="text-black opacity-10 rotate-12" />
        </div>
      </div>

      <SaveArtworkDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        labModule="cyber-breach"
        labCategory="visual"
        content={{
          text: compiledText.join(" "),
          data: {
            score: score,
            time: time,
            buffer: buffer,
            completedWords: compiledText.length,
          },
        }}
        screenshot={captureScreenshot()}
      />
    </div>
  );
};
