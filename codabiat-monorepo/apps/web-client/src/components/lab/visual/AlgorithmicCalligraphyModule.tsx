import React, { useEffect, useRef, useState } from "react";
import { Settings, Eraser, Download, PenTool, Palette, Sparkles, Sliders } from "lucide-react";

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
        p.textFont("Vazirmatn");
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
      p5Instance.current.saveCanvas("word_splash_art", "png");
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-[#050505] overflow-hidden group">
      {/* HUD Controls */}
      <div className="absolute top-4 right-4 z-20 w-72 flex flex-col gap-3 ">
        {/* Main Panel */}
        <div className="bg-black/80 backdrop-blur-md border border-pink-500/30 p-4 rounded-xl shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <h3 className="text-pink-400 font-display text-sm flex items-center gap-2">
              <PenTool size={16} /> رنگ‌پاشی با کلمات
            </h3>
            <div
              className={`w-2 h-2 rounded-full ${isDrawing ? "bg-pink-500 animate-ping" : "bg-gray-600"}`}
            ></div>
          </div>

          <div className="space-y-4">
            {/* Input */}
            <div>
              <label className="text-[10px] text-gray-500 font-mono mb-1 block">BRUSH_TEXT</label>
              <input
                type="text"
                value={brushText}
                onChange={(e) => setBrushText(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-2 text-pink-100 text-xs rounded outline-none focus:border-pink-500 transition-colors text-center"
                dir="rtl"
              />
            </div>

            {/* Sliders */}
            <div>
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mb-1">
                <span>SIZE</span>
                <span>{brushSize}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mb-1">
                <span>CHAOS (SCATTER)</span>
                <span>{chaos * 10}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={chaos}
                onChange={(e) => setChaos(Number(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            {/* Palettes */}
            <div>
              <label className="text-[10px] text-gray-500 font-mono mb-2 block flex items-center gap-1">
                <Palette size={10} /> COLOR_MATRIX
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.keys(palettes).map((key) => (
                  <button
                    key={key}
                    onClick={() => setPalette(key as PaletteType)}
                    className={`h-8 rounded border transition-all relative overflow-hidden ${
                      palette === key
                        ? "border-pink-500 scale-105 shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                        : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        key === "neon"
                          ? "from-fuchsia-500 to-cyan-500"
                          : key === "fire"
                          ? "from-red-500 to-yellow-500"
                          : key === "ice"
                          ? "from-blue-400 to-white"
                          : "from-gray-800 to-white"
                      }`}
                    ></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={clearCanvas}
            className="flex-1 bg-red-900/20 hover:bg-red-500/20 border border-red-500/30 text-red-400 p-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Eraser size={14} /> پاکسازی
          </button>
          <button
            onClick={downloadCanvas}
            className="flex-1 bg-pink-600 hover:bg-pink-500 text-white p-2 rounded text-xs font-bold transition-colors shadow-[0_0_15px_rgba(236,72,153,0.3)] flex items-center justify-center gap-2"
          >
            <Download size={14} /> ذخیره
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair touch-none" />

      {/* Hint Overlay */}
      {!isDrawing && (
        <div className="absolute bottom-4 left-4  opacity-50 animate-pulse">
          <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-[10px] font-mono text-gray-400 flex items-center gap-2">
            <Sparkles size={12} /> DRAG TO PAINT WITH WORDS
          </div>
        </div>
      )}
    </div>
  );
};
