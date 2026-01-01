import React, { useEffect, useRef, useState } from "react";
import { Download, PenTool, Skull, Zap, Move, Layers, PaintBucket, Save } from "lucide-react";
import SaveArtworkDialog from "../SaveArtworkDialog";

type PaletteType = "neon" | "fire" | "ice" | "mono";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  char: string;
  color: any; // p5 color
  size: number;
  rotation: number;
  rotationSpeed: number;
}

export const FractalGardenModule: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<any>(null);

  // UI State
  const [brushText, setBrushText] = useState("عشق");
  const [brushSize, setBrushSize] = useState(24);
  const [chaos, setChaos] = useState(2);
  const [palette, setPalette] = useState<PaletteType>("neon");
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Refs for accessing state inside P5 closure
  const stateRef = useRef({ brushText, brushSize, chaos, palette });
  useEffect(() => {
    stateRef.current = { brushText, brushSize, chaos, palette };
  }, [brushText, brushSize, chaos, palette]);

  const palettes = {
    neon: ["#ff00ff", "#00ffff", "#39ff14", "#ffffff"],
    fire: ["#ff0000", "#ff8800", "#ffff00", "#440000"],
    ice: ["#00ffff", "#0088ff", "#ffffff", "#001133"],
    mono: ["#ffffff", "#aaaaaa", "#555555", "#000000"],
  };

  useEffect(() => {
    const p5 = (window as any).p5;
    if (!p5 || !containerRef.current) return;

    const sketch = (p: any) => {
      let particles: Particle[] = [];
      let words: string[] = [];

      p.setup = () => {
        p.createCanvas(containerRef.current?.offsetWidth || 800, containerRef.current?.offsetHeight || 600);
        p.background(5);
        p.textFont("Courier New");
        p.textAlign(p.CENTER, p.CENTER);
      };

      p.draw = () => {
        words = stateRef.current.brushText.split(" ").filter((w) => w.trim().length > 0);
        if (words.length === 0) words = ["●"];

        p.blendMode(p.ADD);
        p.background(5, 5, 5, 20);

        if (p.mouseIsPressed && p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
          setIsDrawing(true);
          const speed = p.dist(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
          const spawnCount = Math.min(5, Math.ceil(speed / 2));

          for (let i = 0; i < spawnCount; i++) {
            const word = p.random(words);
            const currentPalette = palettes[stateRef.current.palette as PaletteType];
            const colStr = p.random(currentPalette);

            particles.push({
              x: p.mouseX + p.random(-stateRef.current.chaos * 5, stateRef.current.chaos * 5),
              y: p.mouseY + p.random(-stateRef.current.chaos * 5, stateRef.current.chaos * 5),
              vx: (p.mouseX - p.pmouseX) * 0.1 + p.random(-2, 2),
              vy: (p.mouseY - p.pmouseY) * 0.1 + p.random(-2, 2),
              life: 255,
              char: word,
              color: p.color(colStr),
              size: stateRef.current.brushSize * p.random(0.5, 1.5),
              rotation: p.random(p.TWO_PI),
              rotationSpeed: p.random(-0.1, 0.1),
            });
          }
        } else {
          setIsDrawing(false);
        }

        for (let i = particles.length - 1; i >= 0; i--) {
          let pt = particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vx *= 0.95;
          pt.vy *= 0.95;
          pt.rotation += pt.rotationSpeed;
          pt.life -= 2;
          pt.color.setAlpha(pt.life);

          p.push();
          p.translate(pt.x, pt.y);
          p.rotate(pt.rotation);
          p.fill(pt.color);
          p.noStroke();
          p.textSize(pt.size);
          p.text(pt.char, 0, 0);
          p.pop();

          if (pt.life <= 0) particles.splice(i, 1);
        }
        p.blendMode(p.BLEND);
      };

      p.windowResized = () => {
        if (containerRef.current) {
          p.resizeCanvas(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
          p.background(5);
        }
      };
    };

    p5Instance.current = new p5(sketch, containerRef.current);

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
      }
    };
  }, []);

  const clearCanvas = () => {
    if (p5Instance.current) {
      p5Instance.current.background(5);
    }
  };

  const downloadCanvas = () => {
    if (p5Instance.current) {
      p5Instance.current.saveCanvas("comix_zone_art", "png");
    }
  };

  const getCanvasDataURL = () => {
    if (p5Instance.current && p5Instance.current.canvas) {
      return p5Instance.current.canvas.toDataURL("image/png");
    }
    return undefined;
  };

  return (
    // --- SYSTEM KERNEL: SEGA GENESIS VDP EMULATION ---
    // BACKGROUND: The "Void" (Artist's Desk) - Bruised Purple #500050
    <div className="h-full w-full flex flex-col lg:flex-row bg-[#2a0a2a] relative overflow-hidden font-mono p-2 md:p-6 gap-6 select-none">
      {/* DECORATIVE: Background Elements (Scattered Artist Tools) */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#500050 2px, transparent 2px)",
          backgroundSize: "20px 20px",
        }}
      ></div>
      <div className="absolute top-[-5%] left-[-5%] text-[#400040] font-black text-[200px] opacity-20 rotate-12 pointer-events-none">
        SEGA
      </div>

      {/* --- LEFT PANEL: THE CANVAS (COMIC PAGE) --- */}
      <div className="flex-grow relative z-10 order-2 lg:order-1 flex flex-col">
        {/* Page Header (Episode Title) */}
        <div className="mb-2 flex items-center gap-2">
          <div className="bg-[#FFCC00] px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">
            <span className="text-black font-black text-xs tracking-widest">
              EPISODE 1: NIGHT OF THE MUTANTS
            </span>
          </div>
          <div className="h-1 flex-grow bg-black"></div>
        </div>

        {/* The "Paper" Container */}
        <div className="flex-grow relative p-1 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.6)] transform -rotate-1 transition-transform duration-300 hover:rotate-0">
          {/* The "Gutter" (Safe Zone) */}
          <div className="absolute top-0 left-0 w-full h-full border-[16px] border-white pointer-events-none z-20"></div>

          {/* Inner Ink Border */}
          <div className="w-full h-full border-4 border-black bg-[#050505] relative overflow-hidden">
            {/* P5 Canvas Target */}
            <div ref={containerRef} className="w-full h-full cursor-crosshair touch-none" />

            {/* "Mortus Hand" Hint Overlay */}
            {!isDrawing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="bg-black/80 border-2 border-[#E07000] p-4 transform rotate-3">
                  <h2 className="text-[#E07000] text-2xl font-black animate-pulse tracking-widest drop-shadow-[2px_2px_0px_#fff]">
                    DRAW TO ATTACK!
                  </h2>
                </div>
              </div>
            )}

            {/* Page Number Corner */}
            <div className="absolute bottom-2 right-2 bg-white border-2 border-black px-2 z-30 transform rotate-[-5deg]">
              <span className="text-black font-bold text-xs">1/1</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: THE INVENTORY (CONTROLS) --- */}
      <div className="w-full lg:w-96 flex flex-col gap-5 z-20 order-1 lg:order-2">
        {/* SECTION: NARRATOR BOX (Header) */}
        <div className="bg-[#FFCC00] border-4 border-black p-4 shadow-[6px_6px_0px_#000] relative">
          <div className="absolute -top-3 -left-3 bg-black text-white px-2 py-1 text-xs font-bold transform -rotate-6 border border-[#FFCC00]">
            SKETCH_TURNER
          </div>
          <h3 className="text-black font-black text-xl uppercase tracking-tighter flex items-center gap-2 border-b-4 border-black pb-2 mb-2">
            <PenTool className="w-6 h-6" />
            ARTIST TOOLS
          </h3>
          <p className="text-xs font-bold text-black leading-tight uppercase">
            "Choose your weapon. The mutants won't wait for the ink to dry."
          </p>
        </div>

        {/* SECTION: CONTROL PANEL */}
        <div className="bg-[#1a1a1a] border-4 border-[#555] p-4 shadow-[6px_6px_0px_#000] flex flex-col gap-6">
          {/* 1. TEXT INPUT (Speech Bubble Style) */}
          <div className="relative group">
            <label className="text-[#E07000] text-xs font-black uppercase mb-1 block tracking-widest">
              Dialogue Input
            </label>
            <div className="relative">
              <input
                type="text"
                value={brushText}
                onChange={(e) => setBrushText(e.target.value)}
                className="w-full bg-white border-4 border-black p-3 text-black font-black text-lg outline-none focus:shadow-[inset_0_0_0_4px_#E07000] transition-all clip-path-polygon"
                dir="rtl"
              />
              {/* Speech Bubble Tail */}
              <div className="absolute -bottom-3 right-6 w-4 h-4 bg-white border-r-4 border-b-4 border-black transform rotate-45"></div>
            </div>
          </div>

          {/* 2. SLIDERS (Power Bars) */}
          <div className="space-y-4">
            {/* Brush Size */}
            <div>
              <div className="flex justify-between text-xs font-black mb-1 text-[#00ff00]">
                <span className="flex items-center gap-1">
                  <Move size={12} /> BRUSH_SIZE
                </span>
                <span className="bg-[#006000] text-white px-1">{brushSize}PX</span>
              </div>
              <div className="h-4 bg-black border-2 border-[#555] relative">
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className="h-full bg-[#00ff00] border-r-2 border-white"
                  style={{ width: `${brushSize}%` }}
                ></div>
                {/* Grid lines for retro feel */}
                <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-30 pointer-events-none"></div>
              </div>
            </div>

            {/* Chaos Level */}
            <div>
              <div className="flex justify-between text-xs font-black mb-1 text-[#ff00ff]">
                <span className="flex items-center gap-1">
                  <Zap size={12} /> CHAOS_LEVEL
                </span>
                <span className="bg-[#500050] text-white px-1">{Math.floor(chaos * 10)}%</span>
              </div>
              <div className="h-4 bg-black border-2 border-[#555] relative">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={chaos}
                  onChange={(e) => setChaos(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className="h-full bg-[#ff00ff] border-r-2 border-white"
                  style={{ width: `${chaos * 10}%` }}
                ></div>
                <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-30 pointer-events-none"></div>
              </div>
            </div>
          </div>

          {/* 3. PALETTE (Mutagen Vials) */}
          <div>
            <label className="text-[#E07000] text-xs font-black uppercase mb-2 block tracking-widest flex items-center gap-2">
              <PaintBucket size={14} /> Ink Type
            </label>
            <div className="grid grid-cols-4 gap-2 bg-black p-2 border-2 border-[#333]">
              {Object.keys(palettes).map((key) => (
                <button
                  key={key}
                  onClick={() => setPalette(key as PaletteType)}
                  className={`h-12 relative group transition-all ${
                    palette === key ? "ring-2 ring-white z-10" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* Vial Liquid */}
                  <div
                    className={`absolute inset-1 border border-black ${
                      key === "neon"
                        ? "bg-gradient-to-t from-[#ff00ff] to-[#00ffff]"
                        : key === "fire"
                        ? "bg-gradient-to-t from-[#440000] to-[#ffff00]"
                        : key === "ice"
                        ? "bg-gradient-to-t from-[#001133] to-[#00ffff]"
                        : "bg-gradient-to-t from-[#000] to-[#fff]"
                    }`}
                  ></div>

                  {/* Glass Reflection */}
                  <div className="absolute top-2 right-2 w-1 h-4 bg-white opacity-40"></div>

                  {/* Active Indicator */}
                  {palette === key && (
                    <div className="absolute -bottom-2 -right-2 bg-[#E07000] text-black text-[8px] font-bold px-1 border border-black">
                      EQP
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION: INVENTORY SLOTS (Actions) */}
        <div className="grid grid-cols-2 gap-4">
          {/* SLOT 1: WIPE (Dynamite) */}
          <button
            onClick={clearCanvas}
            className="group relative h-20 bg-[#111] border-4 border-[#FFCC00] shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="absolute top-0 left-0 bg-[#FFCC00] text-black text-[10px] font-bold px-1">
              ITEM_1
            </div>
            <Skull
              className="text-red-600 w-8 h-8 mb-1 group-hover:scale-110 transition-transform"
              strokeWidth={2.5}
            />
            <span className="text-[#FFCC00] text-xs font-black uppercase tracking-widest group-hover:text-white">
              WIPE
            </span>
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </button>

          {/* SLOT 2: DOWNLOAD (Disk) */}
          <button
            onClick={downloadCanvas}
            className="group relative h-20 bg-[#111] border-4 border-[#FFCC00] shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="absolute top-0 left-0 bg-[#FFCC00] text-black text-[10px] font-bold px-1">
              ITEM_2
            </div>
            <Download
              className="text-cyan-400 w-8 h-8 mb-1 group-hover:scale-110 transition-transform"
              strokeWidth={2.5}
            />
            <span className="text-[#FFCC00] text-xs font-black uppercase tracking-widest group-hover:text-white">
              DOWNLOAD
            </span>
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </button>
        </div>

        {/* Save Artwork Button */}
        <button
          onClick={() => setShowSaveDialog(true)}
          disabled={!p5Instance.current}
          className={`w-full py-3 font-black text-sm uppercase border-4 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2 transition-all
                      ${
                        p5Instance.current
                          ? "bg-[#006000] text-white hover:bg-[#007000] active:translate-y-1 active:shadow-none"
                          : "bg-gray-600 text-gray-400 cursor-not-allowed"
                      }
                  `}
        >
          <Save size={20} />
          SAVE ARTWORK
        </button>
      </div>

      {/* Save Artwork Dialog */}
      <SaveArtworkDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        labModule="fractal-garden"
        labCategory="visual"
        content={{
          text: brushText,
          html: `<div style="font-family: monospace; padding: 20px; direction: rtl;">${brushText}</div>`,
          data: {
            brushText,
            brushSize,
            chaos,
            palette,
          },
        }}
        screenshot={getCanvasDataURL()}
      />
    </div>
  );
};
