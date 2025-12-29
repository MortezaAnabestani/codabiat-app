import React, { useEffect, useRef, useState } from "react";
import { Settings, Eraser, Download, PenTool, Palette, Sparkles, Sliders, Zap, Skull } from "lucide-react";

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

export const AlgorithmicCalligraphyModule: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<any>(null);

  // UI State
  const [brushText, setBrushText] = useState("عشق");
  const [brushSize, setBrushSize] = useState(24);
  const [chaos, setChaos] = useState(2);
  const [palette, setPalette] = useState<PaletteType>("neon");
  const [isDrawing, setIsDrawing] = useState(false);

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
        p.textFont("Courier New"); // Changed to a more retro font fallback
        p.textAlign(p.CENTER, p.CENTER);
      };

      p.draw = () => {
        // Determine current words array
        words = stateRef.current.brushText.split(" ").filter((w) => w.trim().length > 0);
        if (words.length === 0) words = ["●"];

        // Blend mode for glowing effect
        p.blendMode(p.ADD);
        p.background(5, 5, 5, 20); // Fade effect trail

        // Spawn particles on mouse drag
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

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
          let pt = particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vx *= 0.95; // Friction
          pt.vy *= 0.95;
          pt.rotation += pt.rotationSpeed;
          pt.life -= 2; // Decay

          // Dynamic alpha based on life
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

        // Reset blend mode for UI or other elements if needed
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

  return (
    // THE VOID (Artist's Desk Background) - Bruised Purple
    <div className="h-full w-full flex flex-col md:flex-row bg-[#500050] relative overflow-hidden font-mono p-4 gap-4">
      {/* DECORATIVE: Scattered Pencils/Elements in Background */}
      <div className="absolute top-10 left-10 text-[#300030] transform -rotate-12 pointer-events-none select-none text-9xl font-black opacity-20">
        INK
      </div>
      <div className="absolute bottom-10 right-10 text-[#300030] transform rotate-6 pointer-events-none select-none text-9xl font-black opacity-20">
        ZONE
      </div>

      {/* LEFT: THE COMIC PANEL (Canvas) */}
      <div className="flex-grow relative z-10 order-2 md:order-1 h-[60vh] md:h-auto">
        {/* The Gutter (White Space) & Border */}
        <div className="w-full h-full bg-white p-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] transform rotate-[-1deg] transition-transform hover:rotate-0 duration-300">
          {/* Inner Black Border */}
          <div className="w-full h-full border-4 border-black relative bg-[#050505] overflow-hidden">
            {/* Canvas Container */}
            <div ref={containerRef} className="w-full h-full cursor-crosshair touch-none" />

            {/* Onomatopoeia Hint */}
            {!isDrawing && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="text-[#E07000] text-4xl font-black animate-pulse tracking-widest drop-shadow-[4px_4px_0px_#000]">
                  DRAW!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: THE INVENTORY (Controls) */}
      <div className="w-full md:w-80 flex flex-col gap-4 z-20 order-1 md:order-2">
        {/* HEADER: NARRATOR BOX */}
        <div className="bg-[#FFCC00] border-4 border-black p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-black font-black text-lg uppercase tracking-tighter flex items-center gap-2">
            <PenTool className="w-6 h-6" strokeWidth={3} />
            EPISODE 1: INK
          </h3>
          <div className="h-1 w-full bg-black mt-1 mb-2"></div>
          <p className="text-xs font-bold text-black leading-tight">
            "THE ARTIST PREPARES HIS WEAPON. WORDS BECOME MATTER IN THIS DIMENSION."
          </p>
        </div>

        {/* CONTROLS CONTAINER */}
        <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-5">
          {/* INPUT: SPEECH BUBBLE STYLE */}
          <div className="relative">
            <label className="text-xs font-black bg-black text-white px-2 py-1 inline-block mb-1 transform -skew-x-12">
              TEXT_INPUT
            </label>
            <input
              type="text"
              value={brushText}
              onChange={(e) => setBrushText(e.target.value)}
              className="w-full bg-[#eee] border-2 border-black p-3 text-black font-bold text-sm outline-none focus:bg-[#fff] focus:shadow-[inset_0_0_0_2px_#E07000] transition-all"
              dir="rtl"
            />
            {/* Bubble Tail */}
            <div className="absolute -bottom-2 right-4 w-3 h-3 bg-[#eee] border-r-2 border-b-2 border-black transform rotate-45"></div>
          </div>

          {/* SLIDERS: RETRO BARS */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-black mb-1">
                <span className="text-[#006000]">BRUSH_SIZE</span>
                <span className="bg-black text-[#00ff00] px-1 font-mono">{brushSize}PX</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full h-4 bg-gray-300 rounded-none appearance-none border-2 border-black cursor-pointer accent-[#E07000]"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-black mb-1">
                <span className="text-[#500050]">CHAOS_LEVEL</span>
                <span className="bg-black text-[#ff00ff] px-1 font-mono">{Math.floor(chaos * 10)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={chaos}
                onChange={(e) => setChaos(Number(e.target.value))}
                className="w-full h-4 bg-gray-300 rounded-none appearance-none border-2 border-black cursor-pointer accent-[#500050]"
              />
            </div>
          </div>

          {/* PALETTE: GEMS */}
          <div>
            <label className="text-xs font-black bg-black text-white px-2 py-1 inline-block mb-2 transform -skew-x-12">
              INK_TYPE
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(palettes).map((key) => (
                <button
                  key={key}
                  onClick={() => setPalette(key as PaletteType)}
                  className={`h-10 border-2 border-black transition-all relative group ${
                    palette === key ? "shadow-[inset_0_0_0_4px_#000] scale-105" : "hover:opacity-80"
                  }`}
                >
                  <div
                    className={`absolute inset-0 ${
                      key === "neon"
                        ? "bg-gradient-to-br from-[#ff00ff] to-[#00ffff]"
                        : key === "fire"
                        ? "bg-gradient-to-br from-[#ff0000] to-[#ffff00]"
                        : key === "ice"
                        ? "bg-gradient-to-br from-[#00ffff] to-[#ffffff]"
                        : "bg-gradient-to-br from-[#555] to-[#000]"
                    }`}
                  ></div>
                  {/* Selection Indicator */}
                  {palette === key && (
                    <div className="absolute -top-2 -right-2 bg-[#E07000] border border-black w-4 h-4 flex items-center justify-center">
                      <div className="w-1 h-1 bg-white"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ACTION SLOTS (INVENTORY STYLE) */}
        <div className="grid grid-cols-2 gap-3">
          {/* SLOT 1: CLEAR (DYNAMITE) */}
          <button
            onClick={clearCanvas}
            className="group relative bg-[#222] border-4 border-[#FFCC00] h-16 flex items-center justify-center hover:bg-[#333] active:translate-y-1 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="absolute top-1 left-1 text-[10px] text-[#FFCC00] font-mono">ITEM_01</div>
            <div className="flex flex-col items-center">
              <Skull className="text-red-500 w-6 h-6 group-hover:animate-bounce" />
              <span className="text-[#FFCC00] text-[10px] font-black mt-1 uppercase">WIPE</span>
            </div>
          </button>

          {/* SLOT 2: SAVE (DISK) */}
          <button
            onClick={downloadCanvas}
            className="group relative bg-[#222] border-4 border-[#FFCC00] h-16 flex items-center justify-center hover:bg-[#333] active:translate-y-1 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="absolute top-1 left-1 text-[10px] text-[#FFCC00] font-mono">ITEM_02</div>
            <div className="flex flex-col items-center">
              <Download className="text-cyan-400 w-6 h-6 group-hover:animate-pulse" />
              <span className="text-[#FFCC00] text-[10px] font-black mt-1 uppercase">SAVE</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
