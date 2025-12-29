import React, { useState, useEffect, useRef } from "react";
import {
  Pickaxe,
  Radar,
  Layers,
  Activity,
  Binary,
  Scan,
  Download,
  ListRestart,
  Hand,
  Zap,
  Skull,
} from "lucide-react";

interface Artifact {
  id: number;
  word: string;
  depth: number;
  confidence: number;
  discovered: boolean;
}

export const PoetryExcavationModule: React.FC = () => {
  // --- LOGIC PRESERVED 100% ---
  const [brushSize, setBrushSize] = useState(100);
  const [depth, setDepth] = useState(50);
  const [collected, setCollected] = useState<string[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [stats, setStats] = useState({ density: 0, signal: 0 });

  const poem =
    "در ازل پرتو حسنت ز تجلی دم زد عشق پیدا شد و آتش به همه عالم زد جلوه‌ای کرد رخت دید ملک عشق نداشت عین آتش شد از این غیرت و بر آدم زد";

  useEffect(() => {
    const words = poem.split(" ");
    const newArtifacts: Artifact[] = Array.from({ length: 144 }).map((_, i) => {
      const isWord = i % 3 === 0;
      return {
        id: i,
        word: isWord ? words[Math.floor(Math.random() * words.length)] : generateNoiseChar(),
        depth: Math.random() * 100,
        confidence: Math.random() * 100,
        discovered: false,
      };
    });
    setArtifacts(newArtifacts);
  }, []);

  const generateNoiseChar = () => {
    const chars = "ابتثجچحخدذرزژسشصضطظعغفقکگلمنوهی0101#@%&*";
    return chars[Math.floor(Math.random() * chars.length)];
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    cursorRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setStats({
      density: Math.floor(Math.random() * 40 + 60),
      signal: Math.floor(Math.random() * 100),
    });
  };

  const collectWord = (word: string, id: number) => {
    if (!collected.includes(word)) {
      setCollected((prev) => [...prev, word]);
      setArtifacts((prev) => prev.map((a) => (a.id === id ? { ...a, discovered: true } : a)));
    }
  };

  const resetExcavation = () => {
    setCollected([]);
    setArtifacts((prev) => prev.map((a) => ({ ...a, discovered: false })));
  };
  // --- END LOGIC ---

  return (
    <div className="h-full flex flex-col lg:flex-row bg-[#1a1a1a] overflow-hidden select-none font-mono relative">
      {/* GLOBAL NOISE TEXTURE (The Artist's Desk) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

      {/* --- SIDEBAR: THE INVENTORY --- */}
      <div className="w-full lg:w-80 p-4 flex flex-col gap-6 border-r-4 border-black z-20 bg-[#500050] shrink-0 shadow-[10px_0_20px_rgba(0,0,0,0.5)] relative">
        {/* HEADER: EPISODE TITLE CARD */}
        <div className="border-4 border-black bg-[#FFCC00] p-3 transform -rotate-1 shadow-[4px_4px_0px_black]">
          <div className="flex items-center gap-3">
            <div className="bg-black text-[#FFCC00] p-1">
              <Pickaxe size={24} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-black font-black text-lg uppercase tracking-tighter leading-none">
                EPISODE 1:
              </h2>
              <h1 className="text-black font-bold text-xl leading-none">WORD EXCAVATION</h1>
            </div>
          </div>
        </div>

        {/* CONTROLS: SEGA STYLE SLIDERS */}
        <div className="space-y-6 bg-black/20 p-4 border-2 border-black/50 rounded-sm">
          {/* Brush Control */}
          <div>
            <div className="flex justify-between text-xs font-bold text-[#E07000] mb-1 uppercase">
              <span className="flex items-center gap-1">
                <Radar size={12} /> SCAN_RADIUS
              </span>
              <span className="bg-black px-1 text-white">{brushSize}px</span>
            </div>
            <input
              type="range"
              min="50"
              max="250"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full h-4 bg-black rounded-none appearance-none cursor-pointer border-2 border-white/20 accent-[#E07000]"
              style={{
                backgroundImage: `linear-gradient(90deg, #E07000 ${(brushSize / 250) * 100}%, #000 0%)`,
              }}
            />
          </div>

          {/* Depth Control */}
          <div>
            <div className="flex justify-between text-xs font-bold text-[#E07000] mb-1 uppercase">
              <span className="flex items-center gap-1">
                <Layers size={12} /> DEPTH_LEVEL
              </span>
              <span className="bg-black px-1 text-white">{depth}m</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="w-full h-4 bg-black rounded-none appearance-none cursor-pointer border-2 border-white/20 accent-[#E07000]"
              style={{
                backgroundImage: `linear-gradient(90deg, #006000 ${depth}%, #000 0%)`,
              }}
            />
          </div>
        </div>

        {/* INVENTORY: COLLECTED ARTIFACTS */}
        <div className="flex-grow flex flex-col">
          <div className="bg-black text-white px-2 py-1 text-xs font-bold uppercase border-2 border-b-0 border-white/20 w-fit">
            INVENTORY ({collected.length})
          </div>
          <div className="bg-[#2a2a2a] border-4 border-black p-2 flex-grow overflow-y-auto custom-scrollbar shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <div className="flex flex-wrap gap-2">
              {collected.map((w, i) => (
                <div key={i} className="relative group animate-in zoom-in duration-200">
                  {/* Speech Bubble Style */}
                  <div className="bg-white text-black border-2 border-black px-3 py-1 text-sm font-bold shadow-[2px_2px_0px_black]">
                    {w}
                  </div>
                  {/* Tiny tail for bubble */}
                  <div className="absolute -bottom-1 left-2 w-2 h-2 bg-white border-r-2 border-b-2 border-black rotate-45"></div>
                </div>
              ))}
              {collected.length === 0 && (
                <div className="w-full h-full flex items-center justify-center opacity-30">
                  <Skull size={48} className="text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ACTION SLOTS (BUTTONS) */}
        <div className="mt-auto grid grid-cols-2 gap-3">
          <button
            onClick={resetExcavation}
            className="group relative bg-[#333] hover:bg-[#444] border-4 border-black p-2 flex flex-col items-center justify-center transition-all active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_black]"
          >
            <div className="bg-yellow-400 p-1 border-2 border-black mb-1 group-hover:rotate-12 transition-transform">
              <ListRestart size={20} className="text-black" />
            </div>
            <span className="text-[10px] font-bold text-white uppercase">RESET</span>
          </button>

          <button className="group relative bg-[#E07000] hover:bg-[#ff8c00] border-4 border-black p-2 flex flex-col items-center justify-center transition-all active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_black]">
            <div className="bg-white p-1 border-2 border-black mb-1 group-hover:-rotate-12 transition-transform">
              <Download size={20} className="text-black" />
            </div>
            <span className="text-[10px] font-bold text-black uppercase">SAVE</span>
          </button>
        </div>
      </div>

      {/* --- MAIN STAGE: THE COMIC PAGE --- */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="flex-grow relative overflow-hidden bg-[#111] cursor-none"
      >
        {/* THE GUTTER (Safe Zone) & PAGE BACKGROUND */}
        <div className="absolute inset-0 bg-[#111] bg-[linear-gradient(rgba(255,255,255,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.05)_2px,transparent_2px)] bg-[size:50px_50px]"></div>

        {/* COMIC PANELS GRID (Strata) */}
        <div className="absolute inset-0 p-8 grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-4 content-start">
          {artifacts.map((art) => {
            const isDiscoverable = Math.abs(art.depth - depth) < 20;
            return (
              <div
                key={art.id}
                onClick={() => isDiscoverable && collectWord(art.word, art.id)}
                className={`
                  relative aspect-square flex items-center justify-center transition-all duration-300
                  ${
                    art.discovered
                      ? "bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] scale-110 z-10 rotate-1"
                      : "bg-[#222] border-2 border-[#444]"
                  }
                  ${
                    isDiscoverable && !art.discovered
                      ? "border-[#E07000] border-dashed animate-pulse bg-[#E07000]/10"
                      : ""
                  }
                  ${!isDiscoverable && !art.discovered ? "opacity-30 grayscale" : ""}
                `}
              >
                {/* Hidden Content (Ink Scratches) */}
                {!art.discovered && (
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-20">
                    <div className="text-[8px] leading-none text-[#E07000] break-all font-mono rotate-45">
                      {Array(10).fill("///").join("")}
                    </div>
                  </div>
                )}

                {/* The Word (Speech Bubble Content) */}
                <span
                  className={`
                    font-bold text-sm md:text-base z-10 text-center leading-tight
                    ${art.discovered ? "text-black font-comic" : "text-transparent"}
                  `}
                >
                  {art.word}
                </span>

                {/* "POW" Effect on Discovery */}
                {art.discovered && (
                  <div className="absolute -top-4 -right-4 text-[#E07000] animate-ping opacity-75">
                    <Zap size={20} fill="currentColor" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* --- THE MORTUS HAND (CURSOR) --- */}
        {/* Scanner Ring */}
        <div
          className="absolute pointer-events-none z-50 transition-transform duration-75 mix-blend-screen"
          style={{
            width: brushSize * 2,
            height: brushSize * 2,
            left: cursorRef.current.x - brushSize,
            top: cursorRef.current.y - brushSize,
          }}
        >
          {/* The "Lens" */}
          <div className="w-full h-full rounded-full border-2 border-[#E07000] bg-[#E07000]/10 shadow-[0_0_30px_#E07000] flex items-center justify-center relative">
            <div className="absolute inset-0 border border-white/20 rounded-full animate-ping"></div>
            {/* Crosshair */}
            <div className="w-full h-[1px] bg-[#E07000]/50 absolute"></div>
            <div className="h-full w-[1px] bg-[#E07000]/50 absolute"></div>
          </div>
        </div>

        {/* The Hand Icon (Following Cursor with slight delay/offset) */}
        <div
          className="absolute pointer-events-none z-50 text-white drop-shadow-[0_5px_5px_rgba(0,0,0,1)]"
          style={{
            left: cursorRef.current.x + 10,
            top: cursorRef.current.y + 10,
          }}
        >
          <Hand size={48} className="fill-white stroke-black stroke-[3px] -rotate-12" />
        </div>

        {/* --- HUD OVERLAYS (COMIC CAPTIONS) --- */}

        {/* Top Left Status Box */}
        <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-none">
          <div className="bg-[#FFCC00] border-2 border-black px-2 py-1 shadow-[4px_4px_0px_black]">
            <div className="text-[10px] font-black text-black uppercase flex items-center gap-2">
              <Activity size={12} /> SIGNAL: {stats.signal}%
            </div>
          </div>
          <div className="bg-white border-2 border-black px-2 py-1 shadow-[4px_4px_0px_black] -ml-2">
            <div className="text-[10px] font-black text-black uppercase flex items-center gap-2">
              <Binary size={12} /> DENSITY: {stats.density}
            </div>
          </div>
        </div>

        {/* Bottom Center Coordinates (Narrator Box) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-[#FFCC00] border-4 border-black px-6 py-2 shadow-[6px_6px_0px_rgba(0,0,0,0.8)] flex items-center gap-6 skew-x-[-10deg]">
            <div className="skew-x-[10deg] flex flex-col items-center">
              <span className="text-[8px] font-bold text-black uppercase">X-POS</span>
              <span className="text-sm font-black text-black">{Math.floor(cursorRef.current.x)}</span>
            </div>
            <div className="w-1 h-8 bg-black skew-x-[10deg]"></div>
            <div className="skew-x-[10deg] flex flex-col items-center">
              <span className="text-[8px] font-bold text-black uppercase">Y-POS</span>
              <span className="text-sm font-black text-black">{Math.floor(cursorRef.current.y)}</span>
            </div>
            <div className="w-1 h-8 bg-black skew-x-[10deg]"></div>
            <div className="skew-x-[10deg] flex flex-col items-center">
              <span className="text-[8px] font-bold text-black uppercase">LAYER</span>
              <span className="text-sm font-black text-[#E07000]">L-{(depth / 20).toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Instructions Overlay (Comic Splash Page) */}
        {collected.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black/80 z-40 pointer-events-none">
            <div className="border-4 border-white p-8 bg-[#500050] shadow-[10px_10px_0px_#E07000] transform rotate-2">
              <Scan size={64} className="mx-auto mb-4 text-[#FFCC00] animate-pulse" />
              <h3 className="font-black text-4xl text-white mb-2 uppercase tracking-widest drop-shadow-[4px_4px_0px_black]">
                MISSION START
              </h3>
              <p className="font-mono text-sm text-[#FFCC00] max-w-sm leading-relaxed uppercase bg-black p-2 border-2 border-white/20">
                Use the scanner to locate hidden text fragments within the void.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
