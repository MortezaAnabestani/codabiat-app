import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  HardHat,
  Pickaxe,
  Radio,
  Layers,
  Activity,
  Database,
  Sparkles,
  Trash2,
  Download,
  MousePointer2,
  Scan,
  Radar,
  Binary,
  ListRestart,
} from "lucide-react";

interface Artifact {
  id: number;
  word: string;
  depth: number;
  confidence: number;
  discovered: boolean;
}

export const PoetryExcavationModule: React.FC = () => {
  const [brushSize, setBrushSize] = useState(100);
  const [depth, setDepth] = useState(50); // 0 to 100
  const [isScanning, setIsScanning] = useState(false);
  const [collected, setCollected] = useState<string[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const [stats, setStats] = useState({ density: 0, signal: 0 });

  const poem =
    "در ازل پرتو حسنت ز تجلی دم زد عشق پیدا شد و آتش به همه عالم زد جلوه‌ای کرد رخت دید ملک عشق نداشت عین آتش شد از این غیرت و بر آدم زد";

  // Initialize the strata
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

    // Dynamic feedback for HUD
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

  return (
    <div className="h-full flex flex-col lg:flex-row bg-[#030303] overflow-hidden select-none">
      {/* Sidebar Controls */}
      <div className="w-full lg:w-72 p-6 flex flex-col gap-6 border-l border-white/10 z-20 bg-panel-black shrink-0">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-2 bg-pink-500/20 rounded-lg text-pink-500">
            <Pickaxe size={24} />
          </div>
          <div>
            <h2 className="text-white font-display text-xl">باستان‌شناسی کلام</h2>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
              Semantic_Archaeology_v2
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Brush Control */}
          <div>
            <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-2">
              <span className="flex items-center gap-1">
                <Radar size={10} /> SCAN_RADIUS
              </span>
              <span className="text-pink-400">{brushSize}px</span>
            </div>
            <input
              type="range"
              min="50"
              max="250"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>

          {/* Depth Control */}
          <div>
            <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-2">
              <span className="flex items-center gap-1">
                <Layers size={10} /> EXCAVATION_DEPTH
              </span>
              <span className="text-pink-400">{depth}m</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>

          {/* Collected Artifacts */}
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex-grow overflow-hidden flex flex-col h-64">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Found_Artifacts</span>
              <span className="text-xs text-pink-500 font-bold">{collected.length}</span>
            </div>
            <div className="flex flex-wrap gap-2 overflow-y-auto custom-scrollbar">
              {collected.map((w, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-300 rounded font-sans animate-in zoom-in duration-300"
                >
                  {w}
                </span>
              ))}
              {collected.length === 0 && (
                <div className="text-[9px] text-gray-700 italic uppercase">No artifacts extracted yet...</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <button
            onClick={resetExcavation}
            className="w-full py-3 bg-white/5 hover:bg-red-500/10 border border-white/10 text-gray-400 hover:text-red-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <ListRestart size={16} /> بازنشانی محوطه
          </button>
          <button className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)]">
            <Download size={20} /> خروجی قطعه شعر
          </button>
        </div>
      </div>

      {/* Main Excavation Field */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="flex-grow relative overflow-hidden bg-[#020202] cursor-none"
      >
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {/* Strata Grid */}
        <div className="absolute inset-0 p-8 grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-2 content-start">
          {artifacts.map((art) => {
            const isDiscoverable = Math.abs(art.depth - depth) < 20;
            return (
              <div
                key={art.id}
                onClick={() => isDiscoverable && collectWord(art.word, art.id)}
                className={`
                                    relative aspect-square flex items-center justify-center rounded transition-all duration-700 border
                                    ${
                                      art.discovered
                                        ? "bg-pink-500/20 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                                        : "bg-white/5 border-white/5"
                                    }
                                    ${isDiscoverable ? "opacity-100" : "opacity-20"}
                                `}
              >
                {/* Static Noise Layer */}
                <div className="absolute inset-0 opacity-10 font-mono text-[8px] overflow-hidden break-all leading-none p-1">
                  {Array(20).fill(generateNoiseChar()).join("")}
                </div>

                <span
                  className={`
                                    font-display text-sm md:text-base z-10 transition-all duration-500
                                    ${isDiscoverable ? "text-white" : "text-gray-800"}
                                    ${art.discovered ? "text-pink-400" : ""}
                                `}
                >
                  {art.word}
                </span>

                {/* Confidence Bar */}
                <div
                  className="absolute bottom-0 left-0 h-0.5 bg-pink-500/30 transition-all"
                  style={{ width: art.discovered ? "100%" : "0%" }}
                ></div>
              </div>
            );
          })}
        </div>

        {/* X-Ray Scanner Overlay */}
        <div
          className="absolute  rounded-full mix-blend-overlay border border-pink-500/40 shadow-[0_0_100px_rgba(236,72,153,0.2),inset_0_0_50px_rgba(236,72,153,0.1)] transition-transform duration-75"
          style={{
            width: brushSize * 2,
            height: brushSize * 2,
            left: cursorRef.current.x - brushSize,
            top: cursorRef.current.y - brushSize,
            background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Radar Lines */}
        <div
          className="absolute  w-px bg-pink-500/20 transition-transform duration-75"
          style={{ left: cursorRef.current.x, top: 0, bottom: 0 }}
        />
        <div
          className="absolute  h-px bg-pink-500/20 transition-transform duration-75"
          style={{ top: cursorRef.current.y, left: 0, right: 0 }}
        />

        {/* Floating HUD Labels */}
        <div className="absolute top-6 left-6 flex flex-col gap-3 ">
          <div className="bg-black/60 backdrop-blur px-3 py-1 rounded border border-white/10 text-[9px] font-mono text-gray-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            CORE_CONNECTION: STABLE
          </div>
          <div className="bg-black/60 backdrop-blur px-3 py-1 rounded border border-white/10 text-[9px] font-mono text-gray-400 flex items-center gap-2">
            <Activity size={10} className="text-pink-500" />
            SIGNAL_STRENGTH: {stats.signal}%
          </div>
          <div className="bg-black/60 backdrop-blur px-3 py-1 rounded border border-white/10 text-[9px] font-mono text-gray-400 flex items-center gap-2">
            <Binary size={10} className="text-blue-400" />
            SEMANTIC_DENSITY: {stats.density}ρ
          </div>
        </div>

        {/* Bottom Center Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 px-6 py-2 rounded-full backdrop-blur-xl flex items-center gap-8 shadow-2xl">
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-mono text-gray-500 uppercase">Scanner_POS_X</span>
            <span className="text-xs text-white font-mono">{Math.floor(cursorRef.current.x)}</span>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-mono text-gray-500 uppercase">Scanner_POS_Y</span>
            <span className="text-xs text-white font-mono">{Math.floor(cursorRef.current.y)}</span>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-mono text-gray-500 uppercase">Active_Layer</span>
            <span className="text-xs text-pink-500 font-mono font-bold">L-0{(depth / 20).toFixed(0)}</span>
          </div>
        </div>

        {/* Instructions Overlay */}
        {collected.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-20  bg-black/40">
            <Scan size={80} className="mb-6 stroke-[1px] animate-pulse" />
            <h3 className="font-display text-3xl text-white mb-2">عملیات اکتشاف</h3>
            <p className="font-mono text-xs max-w-sm leading-relaxed uppercase tracking-[0.2em]">
              Move the sonar scanner and adjust depth to reveal hidden poetic fragments in the digital strata.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
