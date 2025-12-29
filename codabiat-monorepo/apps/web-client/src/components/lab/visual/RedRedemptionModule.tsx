import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Target,
  Sun,
  Wind,
  ChevronRight,
  Activity,
  RefreshCw,
  Play,
  Square,
  Timer,
  Trophy,
  Flame,
  Skull,
  Keyboard,
  History,
} from "lucide-react";

interface FlyingWord {
  id: number;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isCorrect: boolean;
  opacity: number;
}

export const RedRedemptionModule: React.FC = () => {
  // --- Game State ---
  const [gameState, setGameState] = useState<"idle" | "riding" | "deadeye" | "over" | "win">("idle");
  const [distance, setDistance] = useState(0);
  const [redemptionScore, setRedemptionScore] = useState(0);
  const [worldScroll, setWorldScroll] = useState(0);
  const [collectedVerses, setCollectedVerses] = useState<string[]>([]);
  const [activeTargetIndex, setActiveTargetIndex] = useState(0);
  const [isSlowMo, setIsSlowMo] = useState(false);

  // Config
  const targetPoem = ["من", "از", "کجا", "پندار", "از", "کجا", "این", "راه", "بی‌پایان"];
  const backgroundChars = "رستگاری مرگ تنهایی سفر زمان افق سایه".split("");

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const wordsRef = useRef<FlyingWord[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- SFX (Western Style) ---
  const playSfx = (freq: number, type: OscillatorType = "triangle", dur = 0.2) => {
    if (!audioCtxRef.current)
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  };

  // --- Core Engine ---
  const update = useCallback(
    (ts: number) => {
      if (gameState === "idle" || gameState === "over" || gameState === "win") return;

      const timeStep = isSlowMo ? 0.2 : 1.0;

      // 1. World Movement
      setWorldScroll((s) => s + 2 * timeStep);
      setDistance((d) => d + 0.1 * timeStep);

      // 2. Word Spawning (During Dead-Eye or randomly)
      if (ts - lastSpawnRef.current > 800 / timeStep) {
        const shouldSpawnTarget = Math.random() > 0.7 && activeTargetIndex < targetPoem.length;
        const newWord: FlyingWord = {
          id: Date.now() + Math.random(),
          text: shouldSpawnTarget
            ? targetPoem[activeTargetIndex]
            : backgroundChars[Math.floor(Math.random() * backgroundChars.length)],
          x: 100, // Percentage
          y: 20 + Math.random() * 60,
          vx: -(0.5 + Math.random() * 0.5) * timeStep,
          vy: (Math.random() - 0.5) * 0.1 * timeStep,
          isCorrect: shouldSpawnTarget,
          opacity: 1,
        };
        wordsRef.current.push(newWord);
        lastSpawnRef.current = ts;
      }

      // 3. Update Words
      wordsRef.current = wordsRef.current.filter((w) => {
        w.x += w.vx;
        w.y += w.vy;
        return w.x > -20;
      });

      requestRef.current = requestAnimationFrame(update);
    },
    [gameState, isSlowMo, activeTargetIndex]
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  // --- Controls ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        setIsSlowMo(true);
        setGameState("deadeye");
        playSfx(100, "sine", 0.5); // Low hum for focus
      }
      // Simple navigation simulation for "Riding"
      if (e.key === "ArrowRight" && gameState === "idle") startGame();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") {
        setIsSlowMo(false);
        setGameState("riding");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState]);

  const startGame = () => {
    setGameState("riding");
    setDistance(0);
    setRedemptionScore(0);
    setCollectedVerses([]);
    setActiveTargetIndex(0);
    wordsRef.current = [];
    playSfx(440, "triangle", 0.1);
  };

  const catchWord = (word: FlyingWord) => {
    if (gameState !== "deadeye") return;

    if (word.isCorrect) {
      setCollectedVerses((prev) => [...prev, word.text]);
      setActiveTargetIndex((i) => i + 1);
      setRedemptionScore((s) => s + 100);
      playSfx(880, "square", 0.2); // Bell-like

      if (activeTargetIndex + 1 >= targetPoem.length) {
        setGameState("win");
      }
    } else {
      setRedemptionScore((s) => Math.max(0, s - 50));
      playSfx(50, "sawtooth", 0.3); // Error
    }

    wordsRef.current = wordsRef.current.filter((w) => w.id !== word.id);
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#0a0500] overflow-hidden font-sans select-none border-t border-red-900/30">
      {/* HUD: Redemption Status */}
      <div className="w-full md:w-80 p-6 flex flex-col gap-6 border-l border-red-900/20 z-20 bg-black shrink-0 shadow-[20px_0_50px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-4 border-b border-red-900/40 pb-4">
          <div className="p-3 bg-red-950 rounded-full border border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)] text-red-500">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-red-600 font-display text-2xl tracking-tighter uppercase italic">
              رستگاری سرخ
            </h2>
            <p className="text-[9px] text-gray-600 font-mono tracking-[0.3em] uppercase">
              Dead_Word_Redemption_v1.0
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Redemption Meter */}
          <div>
            <div className="flex justify-between text-[10px] font-mono text-red-500/60 mb-2 uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <Skull size={10} /> SINNER_LEVEL
              </span>
              <span>{redemptionScore} PTS</span>
            </div>
            <div className="h-1 bg-gray-900 border border-red-900/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 shadow-[0_0_15px_#ff0000] transition-all duration-500"
                style={{ width: `${(redemptionScore / 1000) * 100}%` }}
              />
            </div>
          </div>

          {/* Verse Reel */}
          <div className="bg-[#050505] border border-red-900/20 rounded-xl p-5 flex flex-col gap-3 min-h-[140px] relative overflow-hidden group">
            <div className="text-[9px] text-red-600 font-mono uppercase tracking-widest border-b border-red-900/20 pb-2 mb-1 flex justify-between">
              <span>REDEEMED_VERSES</span>
              <span className="animate-pulse">
                {collectedVerses.length}/{targetPoem.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 transition-all" dir="rtl">
              {collectedVerses.map((v, i) => (
                <span
                  key={i}
                  className="text-sm text-red-100 font-display bg-red-950/30 px-2 rounded-sm border-r border-red-600 animate-in slide-in-from-right duration-500"
                >
                  {v}
                </span>
              ))}
            </div>
            {collectedVerses.length === 0 && (
              <div className="text-[10px] text-gray-800 italic absolute inset-0 flex items-center justify-center  text-center px-4">
                "در این دشت سرد، واژگان تنها شانس تو برای رستگاری هستند."
              </div>
            )}
            <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <History size={80} className="text-red-500" />
            </div>
          </div>

          {/* Controls HUD */}
          <div className="p-4 bg-red-950/10 border border-red-900/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3 text-red-500/60">
              <Keyboard size={12} />
              <span className="text-[8px] uppercase font-mono tracking-tighter">Command_Layout</span>
            </div>
            <div className="space-y-2">
              <div className="text-[9px] text-gray-500 flex justify-between">
                <span>ARROWS</span>
                <span className="text-red-700">RIDE_THE_VALLEY</span>
              </div>
              <div className="text-[9px] text-gray-500 flex justify-between">
                <span>SPACE (HOLD)</span>
                <span className="text-red-700">DEAD_EYE_POETRY</span>
              </div>
              <div className="text-[9px] text-gray-500 flex justify-between">
                <span>CLICK WORD</span>
                <span className="text-red-700">REDEEM_FRAGMENT</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-red-900/20">
          <button
            onClick={startGame}
            className="w-full py-4 bg-red-700 hover:bg-red-600 text-white font-black rounded-sm text-xs transition-all shadow-[0_0_20px_rgba(185,28,28,0.4)] flex items-center justify-center gap-3 uppercase tracking-[0.2em]"
          >
            {gameState === "idle" ? "Start Journey" : "Restart Cycle"}
          </button>
        </div>
      </div>

      {/* Cinematic Viewport */}
      <div className="flex-grow relative bg-[#0a0500] p-0 flex flex-col">
        {/* Parallax Layers */}
        <div className="absolute inset-0 overflow-hidden ">
          {/* Sky / Sunset */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#450a0a] via-[#0a0500] to-black"></div>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>

          {/* The Giant Blood Sun */}
          <div className="absolute top-20 left-1/4 w-32 h-32 bg-red-500 rounded-full shadow-[0_0_100px_#ef4444] opacity-80 border-t-2 border-red-300/20"></div>

          {/* Distant Mountains (ASCII/Text Based) */}
          <div
            className="absolute bottom-[20%] w-full whitespace-nowrap text-[20rem] font-black text-red-950/20 select-none transition-transform duration-75"
            style={{ transform: `translateX(${-worldScroll * 0.2}px)` }}
          >
            {Array(10).fill("سفر_تنهایی_مرگ_").join("")}
          </div>

          {/* Closer Ground / Cacti (Persian Chars) */}
          <div
            className="absolute bottom-0 w-full h-[30%] flex items-end justify-around px-20 transition-transform duration-75"
            style={{ transform: `translateX(${-worldScroll * 1.5}px)` }}
          >
            {Array(20)
              .fill(0)
              .map((_, i) => (
                <span key={i} className="text-8xl font-display text-red-900/40 select-none">
                  {backgroundChars[i % backgroundChars.length]}
                </span>
              ))}
          </div>
        </div>

        {/* Dead-Eye Tint Overlay */}
        <div
          className={`absolute inset-0 z-30  transition-all duration-700 
                    ${isSlowMo ? "bg-red-600/10 backdrop-grayscale-[0.5] opacity-100" : "opacity-0"}`}
        />

        {/* The Flying Words (The Game Layer) */}
        <div className="flex-grow relative z-40">
          {gameState === "idle" ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <h3 className="text-red-600 font-display text-7xl md:text-9xl mb-4 drop-shadow-[0_0_30px_#000]">
                رستگاری
              </h3>
              <p className="text-gray-500 text-xs md:text-sm max-w-lg mb-12 uppercase tracking-[0.4em] leading-loose">
                "The era of poetic lawlessness is ending. Hunt the fragments of the soul to redeem the
                machine."
              </p>
              <button
                onClick={startGame}
                className="px-12 py-5 border border-red-600 text-red-500 font-bold hover:bg-red-600 hover:text-black transition-all group"
              >
                <span className="group-hover:tracking-[0.5em] transition-all duration-500">
                  [ ENTER_REDEMPTION ]
                </span>
              </button>
            </div>
          ) : (
            <div className="h-full relative overflow-hidden">
              {/* The Rider Silhouette (Static relative to camera) */}
              <div className="absolute bottom-20 left-20 animate-float">
                <div className="relative">
                  <div className="absolute -inset-4 bg-red-600/10 blur-xl rounded-full"></div>
                  <div className="w-16 h-16 bg-black border-2 border-red-900 rounded-sm rotate-12 flex items-center justify-center">
                    <Skull size={32} className="text-red-900" />
                  </div>
                  <div className="w-1 h-20 bg-red-950 absolute -bottom-16 left-1/2"></div>
                </div>
              </div>

              {/* Flying Target Words */}
              {wordsRef.current.map((w) => (
                <button
                  key={w.id}
                  onClick={() => catchWord(w)}
                  className={`absolute cursor-crosshair leading-none transition-all duration-75
                                        ${
                                          w.isCorrect
                                            ? "text-white font-display text-4xl drop-shadow-[0_0_15px_#fff] z-50"
                                            : "text-red-900/30 text-lg z-10"
                                        }
                                        ${
                                          gameState === "deadeye" && w.isCorrect
                                            ? "scale-125 animate-pulse"
                                            : ""
                                        }
                                    `}
                  style={{
                    left: `${w.x}%`,
                    top: `${w.y}%`,
                    opacity: w.opacity,
                  }}
                >
                  {gameState === "deadeye" && w.isCorrect && (
                    <Target size={60} className="absolute -inset-6 text-red-500/40 animate-spin" />
                  )}
                  {w.text}
                </button>
              ))}

              {/* Victory/Game Over Overlay */}
              {(gameState === "win" || gameState === "over") && (
                <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000">
                  {gameState === "win" ? (
                    <>
                      <Sun size={120} className="text-red-600 mb-8 animate-pulse" />
                      <h3 className="text-red-600 font-display text-8xl mb-4">آمرزش</h3>
                      <p className="font-mono text-gray-500 text-sm mb-12 uppercase tracking-widest">
                        Reality_Grid: REDEEMED_BY_VERSE
                      </p>
                    </>
                  ) : (
                    <>
                      <Flame size={120} className="text-red-900 mb-8" />
                      <h3 className="text-red-900 font-display text-8xl mb-4">فراموشی</h3>
                    </>
                  )}
                  <button
                    onClick={startGame}
                    className="px-10 py-3 bg-red-600 text-black font-bold uppercase tracking-widest hover:scale-110 transition-transform"
                  >
                    Retry_Cycle
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Cinematic Bar */}
        <div className="h-16 bg-black border-t border-red-950/40 flex justify-between items-center px-10 z-50">
          <div className="flex items-center gap-4 text-[10px] font-mono text-red-950">
            <Activity size={14} className="animate-pulse" />
            <span className="tracking-[0.3em]">HORIZON_SYNC: {(distance * 10).toFixed(2)}KM</span>
          </div>
          <div className="flex gap-8">
            <span className="text-[10px] text-red-900 font-mono italic">
              "Death is a word, Redemption is a code."
            </span>
          </div>
        </div>

        {/* Film Grain / Noise Overlay */}
        <div className="absolute inset-0  opacity-20 mix-blend-overlay z-[60] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>
    </div>
  );
};
