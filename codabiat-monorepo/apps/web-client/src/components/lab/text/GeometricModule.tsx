import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Move,
  Share2,
  Download,
  RefreshCw,
  Layers,
  Zap,
  Activity,
  Maximize,
  ChevronRight,
  Circle,
  Wind,
  Binary,
  Skull, // Added for the "Mortus" feel
  Hand, // Added for the "Hand" mechanic representation
} from "lucide-react";

type GeoMode = "spiral" | "wave" | "fibonacci" | "mandala";

export const GeometricModule: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // --- State (Logic Unchanged) ---
  const [text, setText] = useState("در هندسه‌ی کلمات، سکوت عمیق‌ترین زاویه است");
  const [mode, setMode] = useState<GeoMode>("fibonacci");
  const [complexity, setComplexity] = useState(100);
  const [spacing, setSpacing] = useState(25);
  const [speed, setSpeed] = useState(0.5);
  const [amplitude, setAmplitude] = useState(50);

  // --- Render Logic (Unchanged) ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sync canvas size
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    // Clear with slight trail for motion blur - Using Darker "Ink" background
    ctx.fillStyle = "rgba(10, 5, 10, 0.2)"; // Slightly purple-tinted black for the void feel
    ctx.fillRect(0, 0, w, h);

    timeRef.current += 0.01 * speed;
    const t = timeRef.current;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Using a monospace font to match the pixel art style
    ctx.font = 'bold 16px "Courier New", monospace';

    const words = text.split(" ");
    const centerX = w / 2;
    const centerY = h / 2;

    // Render Modes
    switch (mode) {
      case "spiral":
        let angle = t;
        let radius = 10;
        for (let i = 0; i < complexity; i++) {
          const word = words[i % words.length];
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          const wordAngle = angle + Math.PI / 2;
          drawWord(ctx, word, x, y, wordAngle, i, complexity);

          const charDist = ctx.measureText(word).width + spacing;
          angle += charDist / radius;
          radius += spacing / 15;
        }
        break;

      case "wave":
        const step = w / (complexity / 2);
        for (let i = 0; i < complexity; i++) {
          const word = words[i % words.length];
          const x = ((i * step + t * 50) % (w + 100)) - 50;
          const y = centerY + Math.sin(i * 0.2 + t) * amplitude;

          const slope = Math.cos(i * 0.2 + t);
          const wordAngle = Math.atan(slope);
          drawWord(ctx, word, x, y, wordAngle, i, complexity);
        }
        break;

      case "fibonacci":
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < complexity; i++) {
          const word = words[i % words.length];
          const r = Math.sqrt(i) * spacing * 1.5;
          const theta = i * goldenAngle + t;

          const x = centerX + Math.cos(theta) * r;
          const y = centerY + Math.sin(theta) * r;

          drawWord(ctx, word, x, y, theta, i, complexity);
        }
        break;

      case "mandala":
        const layers = 5;
        const perLayer = Math.floor(complexity / layers);
        for (let l = 1; l <= layers; l++) {
          const layerRadius = l * spacing * 3;
          const layerRotation = t * (l % 2 === 0 ? 1 : -1);
          for (let i = 0; i < perLayer; i++) {
            const word = words[i % words.length];
            const theta = (i / perLayer) * Math.PI * 2 + layerRotation;

            const x = centerX + Math.cos(theta) * layerRadius;
            const y = centerY + Math.sin(theta) * layerRadius;

            drawWord(ctx, word, x, y, theta + Math.PI / 2, i + l, complexity);
          }
        }
        break;
    }

    requestRef.current = requestAnimationFrame(draw);
  }, [text, mode, complexity, spacing, speed, amplitude]);

  const drawWord = (
    ctx: CanvasRenderingContext2D,
    word: string,
    x: number,
    y: number,
    angle: number,
    index: number,
    total: number
  ) => {
    // Comix Zone Palette: Orange highlights, Green sludge, Purple shadows
    const hue = (index / total) * 40 + 30; // Gold/Orange range
    const alpha = Math.max(0.4, 1 - index / total);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Hard Shadow for Comic Effect
    ctx.shadowColor = `#000000`;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
    ctx.fillText(word, 0, 0);

    ctx.restore();
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current);
  }, [draw]);

  return (
    // --- THE VOID (Artist's Desk Background) ---
    <div className="h-full flex flex-col relative overflow-hidden bg-[#2a1a30] font-mono selection:bg-[#E07000] selection:text-black">
      {/* Background Texture: Scattered Pencils/Grime */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black via-[#500050] to-black"></div>
      <div className="absolute top-0 left-0 w-full h-2 bg-[#E07000] z-50 shadow-[0_0_10px_#E07000]"></div>

      {/* --- MAIN LAYOUT: COMIC PAGE --- */}
      <div className="flex flex-col md:flex-row h-full p-4 gap-4 z-10">
        {/* --- PANEL 1: THE CANVAS (Action Scene) --- */}
        <div className="flex-grow relative border-4 border-black bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden group">
          {/* Panel Label */}
          <div className="absolute top-0 left-0 bg-[#FFCC00] text-black px-2 py-1 text-xs font-bold border-b-2 border-r-2 border-black z-20">
            PANEL 1: THE VORTEX
          </div>

          <div ref={containerRef} className="w-full h-full relative">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>

          {/* Visualizer Status Bar (In-Panel Overlay) */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] text-[#00ff00] bg-black/80 border border-[#006000] p-2 font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#E07000] animate-pulse"></div>
              <span>RENDERING...</span>
            </div>
            <div className="flex items-center gap-4">
              <span>MODE: {mode}</span>
              <span>FREQ: {(60 * speed).toFixed(0)}Hz</span>
            </div>
          </div>
        </div>

        {/* --- PANEL 2: THE INVENTORY (Controls) --- */}
        <div className="w-full md:w-80 flex flex-col gap-4 shrink-0">
          {/* Header: Narrator Box */}
          <div className="bg-[#FFCC00] border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
            <div className="absolute -top-2 -right-2 bg-white border-2 border-black p-1 rotate-12">
              <Skull size={16} className="text-black" />
            </div>
            <h3 className="text-black font-black text-sm uppercase tracking-tighter flex items-center gap-2">
              <Binary size={16} className="stroke-[3px]" />
              SEGA_GENESIS_VDP
            </h3>
            <div className="h-1 bg-black mt-2 mb-1"></div>
            <span className="text-[10px] font-bold text-black/70">EPISODE 1: PARAMETRIC MUTATION</span>
          </div>

          {/* Controls Container: White Sketch Paper */}
          <div className="flex-grow bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6 overflow-y-auto relative">
            {/* Mode Selector (Inventory Slots) */}
            <div>
              <label className="text-[10px] font-black bg-black text-white px-1 mb-2 inline-block">
                SELECT WEAPON
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "spiral", label: "SPIRAL", icon: RefreshCw },
                  { id: "fibonacci", label: "FIBO", icon: Layers },
                  { id: "wave", label: "WAVE", icon: Wind },
                  { id: "mandala", label: "MANDALA", icon: Circle },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id as GeoMode)}
                    className={`relative group h-12 border-2 border-black flex items-center justify-center gap-2 text-[10px] font-bold transition-all active:translate-y-1 active:shadow-none
                            ${
                              mode === m.id
                                ? "bg-[#E07000] text-white shadow-[2px_2px_0px_0px_#000]"
                                : "bg-[#ddd] text-gray-600 hover:bg-[#FFCC00] hover:text-black shadow-[2px_2px_0px_0px_#000]"
                            }`}
                  >
                    <m.icon size={14} className="stroke-[3px]" />
                    {m.label}
                    {/* Hover Effect: Sketch Turner Fist */}
                    {mode === m.id && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-black animate-ping"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders (Rough Ink Lines) */}
            <div className="space-y-4">
              <div className="bg-[#eee] p-2 border-2 border-dashed border-gray-400">
                <div className="flex justify-between text-[10px] font-bold text-black mb-1 uppercase">
                  <span>INK DENSITY</span>
                  <span className="bg-black text-[#E07000] px-1">{complexity}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={complexity}
                  onChange={(e) => setComplexity(Number(e.target.value))}
                  className="w-full h-2 bg-black rounded-none appearance-none cursor-pointer accent-[#E07000] border border-white outline-none"
                />
              </div>

              <div className="bg-[#eee] p-2 border-2 border-dashed border-gray-400">
                <div className="flex justify-between text-[10px] font-bold text-black mb-1 uppercase">
                  <span>PANEL SPACING</span>
                  <span className="bg-black text-[#E07000] px-1">{spacing}px</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={spacing}
                  onChange={(e) => setSpacing(Number(e.target.value))}
                  className="w-full h-2 bg-black rounded-none appearance-none cursor-pointer accent-[#E07000] border border-white outline-none"
                />
              </div>

              <div className="bg-[#eee] p-2 border-2 border-dashed border-gray-400">
                <div className="flex justify-between text-[10px] font-bold text-black mb-1 uppercase">
                  <span>SCROLL SPEED</span>
                  <span className="bg-black text-[#E07000] px-1">{speed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-black rounded-none appearance-none cursor-pointer accent-[#E07000] border border-white outline-none"
                />
              </div>

              {mode === "wave" && (
                <div className="bg-[#eee] p-2 border-2 border-dashed border-gray-400 animate-in slide-in-from-left duration-300">
                  <div className="flex justify-between text-[10px] font-bold text-black mb-1 uppercase">
                    <span>SHOCKWAVE</span>
                    <span className="bg-black text-[#E07000] px-1">{amplitude}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={amplitude}
                    onChange={(e) => setAmplitude(Number(e.target.value))}
                    className="w-full h-2 bg-black rounded-none appearance-none cursor-pointer accent-[#E07000] border border-white outline-none"
                  />
                </div>
              )}
            </div>

            {/* Text Input (Speech Bubble Style) */}
            <div className="relative mt-2">
              <div className="absolute -top-3 left-2 bg-black text-white text-[9px] px-2 py-0.5 font-bold uppercase z-10">
                DIALOGUE INPUT
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-white border-2 border-black p-3 text-xs font-bold text-black outline-none focus:bg-[#fffde7] focus:shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] transition-all resize-none h-24 font-mono"
                dir="rtl"
                style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 90%, 90% 100%, 0% 100%)" }} // Cut corner effect
              />
              {/* The "Tail" of the speech bubble */}
              <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-r-2 border-b-2 border-black rotate-45"></div>
            </div>

            {/* Action Buttons (Comic Impacts) */}
            <div className="flex gap-2 mt-auto pt-4 border-t-2 border-black border-dashed">
              <button className="flex-1 py-3 bg-white border-2 border-black text-xs font-black uppercase hover:bg-gray-100 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#999]">
                <Share2 size={14} /> SHARE
              </button>
              <button className="flex-1 py-3 bg-[#006000] text-white border-2 border-black text-xs font-black uppercase hover:bg-[#008000] active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000]">
                <Download size={14} /> SAVE
              </button>
            </div>

            {/* Mortus Hand Decoration */}
            <div className="absolute bottom-2 right-2 opacity-20 pointer-events-none">
              <Hand size={64} className="text-black rotate-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
