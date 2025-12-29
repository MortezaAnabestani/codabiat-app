import React, { useState, useEffect, useRef } from "react";
import {
  Grid3X3,
  Sliders,
  RefreshCw,
  Download,
  Palette,
  Type,
  Shield,
  Zap,
  LayoutGrid,
  Hand,
} from "lucide-react";

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

  // --- Weaving Logic (UNCHANGED FUNCTIONALITY) ---
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

    // Background: Ink Black for contrast
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Warp and Weft Lines (Atmospheric)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
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
    ctx.strokeStyle = "rgba(224, 112, 0, 0.6)"; // Mutant Orange Tint
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
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = `${knotSize * 0.8}px "Courier New", monospace`; // Changed to monospace for retro feel
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
      const s = Math.min(w, h) - 60; // Increased padding for comic border
      canvasRef.current.width = s;
      canvasRef.current.height = s;
      weaveCarpet();
    }
  }, [renderSeed, knotDensity, symmetryType, colorIntensity]);

  return (
    // MAIN CONTAINER: The "Void" / Artist's Desk
    <div className="h-full flex flex-col lg:flex-row bg-[#500050] overflow-hidden relative font-mono selection:bg-[#E07000] selection:text-black">
      {/* Background Texture (Scattered Pencils/Grime) */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      ></div>

      {/* LEFT PANEL: The Controls (Comic Strip Column) */}
      <div className="w-full lg:w-96 p-6 flex flex-col gap-6 z-20 shrink-0 overflow-y-auto custom-scrollbar relative">
        {/* Header: Narrator Box */}
        <div className="bg-[#FFCC00] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 transform -rotate-1">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-black text-white">
              <Grid3X3 size={24} />
            </div>
            <div>
              <h2 className="text-black font-black text-xl uppercase tracking-tighter">زربافت سایبری</h2>
              <p className="text-[10px] font-bold text-black uppercase">EPISODE 1: THE WEAVER</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {/* Text Seed: Speech Bubble Input */}
          <div className="relative">
            <label className="text-xs font-black bg-black text-white px-2 py-1 inline-block mb-2 uppercase transform -skew-x-12">
              <Type size={10} className="inline mr-1" /> Pattern_Seed
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-24 bg-white border-2 border-black p-3 text-xs font-bold text-black outline-none focus:bg-[#E07000]/10 transition-all resize-none shadow-inner"
              placeholder="متنی برای بافت فرش بنویسید..."
              dir="rtl"
            />
            {/* Speech Bubble Tail */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r-2 border-b-2 border-black transform rotate-45"></div>
          </div>

          {/* Parameters: Inventory Slots */}
          <div className="space-y-5">
            <h4 className="text-xs font-black text-[#500050] uppercase border-b-2 border-[#500050] pb-1">
              Loom_Stats
            </h4>

            {/* Density Slider */}
            <div>
              <div className="flex justify-between text-[10px] font-bold text-black mb-1 uppercase">
                <span>Knot_Density</span>
                <span className="bg-black text-[#E07000] px-1">{knotDensity} Raj</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="2"
                value={knotDensity}
                onChange={(e) => setKnotDensity(Number(e.target.value))}
                className="w-full h-4 bg-gray-300 border-2 border-black appearance-none cursor-pointer accent-[#006000]"
              />
            </div>

            {/* Intensity Slider */}
            <div>
              <div className="flex justify-between text-[10px] font-bold text-black mb-1 uppercase">
                <span>Ink_Saturation</span>
                <span className="bg-black text-[#E07000] px-1">{(colorIntensity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                value={colorIntensity}
                onChange={(e) => setColorIntensity(Number(e.target.value))}
                className="w-full h-4 bg-gray-300 border-2 border-black appearance-none cursor-pointer accent-[#006000]"
              />
            </div>
          </div>

          {/* Symmetry Modes: Item Slots */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-black uppercase flex items-center gap-2">
              <Palette size={10} /> Symmetry_Mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "quad", label: "4X", icon: LayoutGrid },
                { id: "dual", label: "2X", icon: Shield },
                { id: "radial", label: "RAD", icon: Zap },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSymmetryType(m.id as any)}
                  className={`flex flex-col items-center justify-center p-2 border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none ${
                    symmetryType === m.id
                      ? "bg-[#FFCC00] text-black"
                      : "bg-white text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <m.icon size={16} strokeWidth={3} className="mb-1" />
                  <span className="text-[10px] font-black">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-3">
          <button
            onClick={() => setRenderSeed((s) => s + 1)}
            disabled={isWeaving}
            className="w-full py-4 bg-[#E07000] border-4 border-black text-black font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group"
          >
            {/* Spark Effect on Hover */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>

            {isWeaving ? (
              <RefreshCw size={24} className="animate-spin" />
            ) : (
              <Grid3X3 size={24} strokeWidth={3} />
            )}
            {isWeaving ? "WEAVING..." : "GENERATE!"}
          </button>

          <button className="w-full py-2 bg-[#006000] border-2 border-black text-white text-xs font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#007500] flex items-center justify-center gap-2">
            <Download size={14} /> SAVE_CARPET_DATA
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: The Canvas (The Main Panel) */}
      <div
        ref={containerRef}
        className="flex-grow relative flex items-center justify-center p-10 bg-transparent"
      >
        {/* The Gutter (Safe Zone) */}
        <div className="absolute inset-4 border-2 border-dashed border-white/20 pointer-events-none"></div>

        {/* The Comic Panel Container */}
        <div className="relative z-10 bg-white border-[6px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,0.5)] p-2 transform rotate-1">
          {/* Panel Header (Metadata) */}
          <div className="absolute -top-5 left-4 bg-[#FFCC00] border-2 border-black px-3 py-1 z-20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-black text-black">FIG 1.1: THE OUTPUT</span>
          </div>

          {/* Fringe (ریشه فرش) - Stylized */}
          <div className="absolute -top-4 left-0 right-0 h-4 flex justify-around overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-[2px] h-full bg-black/20 transform rotate-12"></div>
            ))}
          </div>

          {/* Canvas Wrapper */}
          <div className="border-2 border-black bg-black">
            <canvas ref={canvasRef} className="max-w-full max-h-full block image-rendering-pixelated" />
          </div>

          {/* Onomatopoeia (Visual Sound Effect) */}
          {!isWeaving && (
            <div className="absolute -bottom-8 -right-8 text-[#E07000] font-black text-6xl transform -rotate-12 drop-shadow-[4px_4px_0px_#000] pointer-events-none z-30 select-none">
              WOVEN!
            </div>
          )}
        </div>

        {/* HUD Overlay (Speech Bubble Style) */}
        <div className="absolute top-6 right-6">
          <div className="bg-white border-2 border-black px-4 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
            <div
              className={`w-3 h-3 border-2 border-black rounded-full ${
                isWeaving ? "bg-red-500 animate-pulse" : "bg-[#006000]"
              }`}
            ></div>
            <span className="text-[10px] font-black text-black uppercase">
              SYSTEM_STATUS: {isWeaving ? "BUSY" : "READY"}
            </span>
          </div>
        </div>

        <div className="absolute bottom-6 left-6">
          <div className="bg-black text-white border-2 border-white px-3 py-1 text-[10px] font-mono uppercase tracking-widest transform skew-x-12">
            KNOT_COUNT: {inputText.length}
          </div>
        </div>
      </div>
    </div>
  );
};
