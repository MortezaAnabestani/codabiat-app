import React, { useState, useEffect, useRef } from "react";
import { Grid3X3, Sliders, RefreshCw, Download, Palette, Type, Shield, Zap, LayoutGrid } from "lucide-react";

type CarpetColor = { r: number; g: number; b: number };

export const CyberWeaverModule: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // UI State
  const [inputText, setInputText] = useState(
    "در ازل پرتو حسنت ز تجلی دم زد، عشق پیدا شد و آتش به همه عالم زد"
  );
  const [knotDensity, setKnotDensity] = useState(60); // Grid size
  const [symmetryType, setSymmetryType] = useState<"quad" | "dual" | "radial">("quad");
  const [colorIntensity, setColorIntensity] = useState(0.8);
  const [isWeaving, setIsWeaving] = useState(false);
  const [renderSeed, setRenderSeed] = useState(0);

  // --- Helper: Generate Color from Char ---
  const getKnotColor = (char: string, intensity: number): string => {
    const code = char.charCodeAt(0);
    // Map Persian/Unicode chars to specific hues
    const h = (code * 137) % 360;
    const s = 60 + (code % 40);
    const l = 20 + (code % 30) * intensity;
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  // --- Weaving Logic ---
  const weaveCarpet = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsWeaving(true);

    const size = Math.min(canvas.width, canvas.height);
    const grid = knotDensity;
    const knotSize = size / grid;
    const chars = inputText.split("");

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Warp and Weft Lines (Atmospheric)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= grid; i++) {
      ctx.beginPath();
      ctx.moveTo(i * knotSize, 0);
      ctx.lineTo(i * knotSize, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * knotSize);
      ctx.lineTo(size, i * knotSize);
      ctx.stroke();
    }

    // 2. Weave Knots
    const mid = Math.floor(grid / 2);

    for (let y = 0; y < mid + 1; y++) {
      for (let x = 0; x < mid + 1; x++) {
        const index = (y * mid + x) % chars.length;
        const char = chars[index];
        const color = getKnotColor(char, colorIntensity);

        // Draw in 4 quadrants for symmetry
        const drawKnot = (kx: number, ky: number) => {
          ctx.fillStyle = color;
          // Add subtle variation
          const jitter = (char.charCodeAt(0) % 5) * 0.1;
          ctx.globalAlpha = 0.8 + jitter;

          // Knot shape (slightly rounded for texture)
          const px = kx * knotSize + 1;
          const py = ky * knotSize + 1;
          const ps = knotSize - 2;

          if (char.charCodeAt(0) % 3 === 0) {
            ctx.beginPath();
            ctx.roundRect(px, py, ps, ps, ps / 4);
            ctx.fill();
          } else {
            ctx.fillRect(px, py, ps, ps);
          }
        };

        // Quadrant Mapping
        drawKnot(x, y); // Top-Left
        drawKnot(grid - 1 - x, y); // Top-Right
        drawKnot(x, grid - 1 - y); // Bottom-Left
        drawKnot(grid - 1 - x, grid - 1 - y); // Bottom-Right
      }
    }

    // 3. Central Medallion (Toranj) - Fractal Overlays
    const center = size / 2;
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(212, 175, 55, 0.4)"; // Gold-ish
    ctx.lineWidth = 2;

    for (let i = 0; i < 8; i++) {
      const r = knotSize * (mid / 2) * (1 - i * 0.1);
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.stroke();

      // Decorative Spokes
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate((i * Math.PI) / 4);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r, 0);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Border (Text as Texture)
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.font = `${knotSize * 0.8}px "Vazirmatn"`;
    for (let i = 0; i < grid; i++) {
      ctx.fillText(chars[i % chars.length], i * knotSize, knotSize * 0.8); // Top
      ctx.fillText(chars[i % chars.length], i * knotSize, size - knotSize * 0.2); // Bottom
    }

    setIsWeaving(false);
  };

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const s = Math.min(w, h) - 40;
      canvasRef.current.width = s;
      canvasRef.current.height = s;
      weaveCarpet();
    }
  }, [renderSeed, knotDensity, symmetryType, colorIntensity]);

  return (
    <div className="h-full flex flex-col lg:flex-row bg-[#020204] overflow-hidden">
      {/* Left: Weaving Controls */}
      <div className="w-full lg:w-80 p-6 flex flex-col gap-6 border-l border-white/10 z-20 bg-panel-black shrink-0 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-2 bg-amber-600/20 rounded-lg text-amber-500">
            <Grid3X3 size={24} />
          </div>
          <div>
            <h2 className="text-white font-display text-xl tracking-tight">زربافت سایبری</h2>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
              Algorithmic_Weaver_v1.2
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Text Seed */}
          <div>
            <label className="text-[10px] text-gray-500 font-mono mb-2 block uppercase tracking-tighter flex items-center gap-2">
              <Type size={10} /> Pattern_Seed_Buffer
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-amber-100 outline-none focus:border-amber-500 transition-all resize-none"
              placeholder="متنی برای بافت فرش بنویسید..."
              dir="rtl"
            />
          </div>

          {/* Parameters */}
          <div className="bg-white/5 p-4 rounded-xl space-y-5 border border-white/5">
            <h4 className="text-[10px] font-mono text-gray-400 uppercase border-b border-white/5 pb-2">
              Loom_Parameters
            </h4>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-1.5 uppercase">
                <span>Knot_Density</span>
                <span className="text-amber-500">{knotDensity} Raj</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="2"
                value={knotDensity}
                onChange={(e) => setKnotDensity(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-1.5 uppercase">
                <span>Color_Saturation</span>
                <span className="text-amber-500">{(colorIntensity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                value={colorIntensity}
                onChange={(e) => setColorIntensity(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>
          </div>

          {/* Symmetry Modes */}
          <div className="space-y-3">
            <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest flex items-center gap-2">
              <Palette size={10} /> Symmetry_Logic
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "quad", label: "چهارگانه", icon: LayoutGrid },
                { id: "dual", label: "دوگانه", icon: Shield },
                { id: "radial", label: "شعاعی", icon: Zap },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSymmetryType(m.id as any)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                    symmetryType === m.id
                      ? "bg-amber-600/20 border-amber-500 text-amber-500"
                      : "border-white/5 text-gray-500 hover:bg-white/5"
                  }`}
                >
                  <m.icon size={14} className="mb-1" />
                  <span className="text-[8px] font-bold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <button
            onClick={() => setRenderSeed((s) => s + 1)}
            disabled={isWeaving}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)]"
          >
            {isWeaving ? <RefreshCw size={20} className="animate-spin" /> : <Grid3X3 size={20} />}
            {isWeaving ? "در حال بافت..." : "آغاز بافت دیجیتال"}
          </button>
          <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-400 text-[10px] font-mono rounded-lg transition-all flex items-center justify-center gap-2">
            <Download size={12} /> EXPORT_CARPET_MAP
          </button>
        </div>
      </div>

      {/* Right: Loom Viewport */}
      <div ref={containerRef} className="flex-grow relative flex items-center justify-center p-10 bg-[#000]">
        {/* Loom Atmosphere */}
        <div className="absolute inset-0  opacity-20 z-0 bg-[radial-gradient(circle_at_center,_#b45309_0%,transparent_70%)]"></div>

        {/* The Carpet Canvas */}
        <div className="relative z-10 shadow-[0_0_100px_rgba(0,0,0,1),0_0_30px_rgba(180,83,9,0.2)] border-8 border-[#111] p-4 bg-[#080808]">
          {/* Fringe (ریشه فرش) */}
          <div className="absolute -top-6 left-0 right-0 h-6 flex justify-around opacity-40">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="w-[1px] h-full bg-white/50"></div>
            ))}
          </div>
          <div className="absolute -bottom-6 left-0 right-0 h-6 flex justify-around opacity-40">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="w-[1px] h-full bg-white/50"></div>
            ))}
          </div>

          <canvas ref={canvasRef} className="max-w-full max-h-full block image-rendering-pixelated" />
        </div>

        {/* HUD Overlay */}
        <div className="absolute top-6 right-6  text-right">
          <div className="bg-black/60 backdrop-blur px-3 py-1 rounded border border-amber-500/30 text-[9px] font-mono text-amber-500 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
            LOOM_SYNC_SUCCESSFUL
          </div>
        </div>

        <div className="absolute bottom-6 left-6 ">
          <div className="bg-black/60 backdrop-blur px-3 py-1 rounded border border-white/10 text-[8px] font-mono text-gray-500 uppercase tracking-widest">
            Data_Woven: {inputText.length} knots
          </div>
        </div>
      </div>
    </div>
  );
};
