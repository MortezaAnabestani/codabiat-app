import React, { useEffect, useRef, useState } from "react";
import {
  Hexagon,
  RotateCw,
  RefreshCcw,
  Download,
  Eraser,
  Move,
  Type,
  Palette,
  Snowflake,
  Sun,
  Moon,
} from "lucide-react";

type PaletteType = "turquoise" | "cyber" | "gold" | "void";

export const CyberIslimiModule: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<any>(null);

  // --- UI State ---
  const [brushText, setBrushText] = useState("هو");
  const [symmetry, setSymmetry] = useState(8); // 4 to 32
  const [mirrorMode, setMirrorMode] = useState(true);
  const [brushSize, setBrushSize] = useState(24);
  const [autoRotate, setAutoRotate] = useState(false);
  const [palette, setPalette] = useState<PaletteType>("turquoise");

  // Ref to pass state to P5
  const stateRef = useRef({ brushText, symmetry, mirrorMode, brushSize, autoRotate, palette });

  useEffect(() => {
    stateRef.current = { brushText, symmetry, mirrorMode, brushSize, autoRotate, palette };
  }, [brushText, symmetry, mirrorMode, brushSize, autoRotate, palette]);

  // Palettes
  const colorPalettes = {
    turquoise: ["#00e5ff", "#009ba6", "#ffffff", "#004d52"], // Classic Islimi
    cyber: ["#ff00ff", "#00ffff", "#39ff14", "#ffffff"], // Cyberpunk
    gold: ["#ffd700", "#ffaa00", "#ffffff", "#553300"], // Royal
    void: ["#ffffff", "#aaaaaa", "#555555", "#ff0000"], // Minimal/Glitch
  };

  useEffect(() => {
    const p5 = (window as any).p5;
    if (!p5 || !containerRef.current) return;

    const sketch = (p: any) => {
      let rotationOffset = 0;

      p.setup = () => {
        p.createCanvas(containerRef.current?.offsetWidth || 800, containerRef.current?.offsetHeight || 600);
        p.angleMode(p.DEGREES);
        p.background(5);
        p.textFont("Vazirmatn");
        p.textAlign(p.CENTER, p.CENTER);
      };

      p.draw = () => {
        // Auto Rotate the whole canvas view slightly for hypnotic effect
        if (stateRef.current.autoRotate) {
          rotationOffset += 0.1;
        }

        // If mouse is pressed, draw
        if (p.mouseIsPressed && p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
          const mx = p.mouseX - p.width / 2;
          const my = p.mouseY - p.height / 2;
          const pmx = p.pmouseX - p.width / 2;
          const pmy = p.pmouseY - p.height / 2;

          p.push();
          p.translate(p.width / 2, p.height / 2);
          p.rotate(rotationOffset);

          const sym = stateRef.current.symmetry;
          const angleStep = 360 / sym;

          // Choose color
          const currentPalette = colorPalettes[stateRef.current.palette as PaletteType];
          const col = p.random(currentPalette);

          // Set Glow
          p.drawingContext.shadowBlur = 15;
          p.drawingContext.shadowColor = col;
          p.fill(col);
          p.noStroke();
          p.textSize(stateRef.current.brushSize);

          for (let i = 0; i < sym; i++) {
            p.rotate(angleStep);

            // Draw Original
            drawStroke(mx, my, pmx, pmy);

            // Draw Mirror
            if (stateRef.current.mirrorMode) {
              p.push();
              p.scale(1, -1);
              drawStroke(mx, my, pmx, pmy);
              p.pop();
            }
          }
          p.pop();
        }
      };

      const drawStroke = (x: number, y: number, px: number, py: number) => {
        // Interpolate for smoother lines
        const d = p.dist(x, y, px, py);
        const steps = Math.ceil(d / 5); // Draw every 5 pixels

        for (let i = 0; i < steps; i++) {
          const lerpX = p.lerp(px, x, i / steps);
          const lerpY = p.lerp(py, y, i / steps);

          p.push();
          p.translate(lerpX, lerpY);

          // Rotate text to follow path direction?
          // const angle = p.atan2(y - py, x - px);
          // p.rotate(angle);

          // Or rotate based on position for radial effect
          const radAngle = p.atan2(lerpY, lerpX);
          p.rotate(radAngle + 90);

          p.text(stateRef.current.brushText, 0, 0);
          p.pop();
        }
      };

      p.windowResized = () => {
        if (containerRef.current) {
          const prevGrid = p.get();
          p.resizeCanvas(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
          p.background(5);
          p.image(prevGrid, 0, 0);
        }
      };
    };

    p5Instance.current = new p5(sketch, containerRef.current);

    return () => {
      if (p5Instance.current) p5Instance.current.remove();
    };
  }, []);

  const clearCanvas = () => {
    if (p5Instance.current) {
      p5Instance.current.background(5);
    }
  };

  const downloadCanvas = () => {
    if (p5Instance.current) {
      p5Instance.current.saveCanvas("cyber_islimi_mandala", "png");
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-[#050505] overflow-hidden">
      {/* Background Grid Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:20px_20px] opacity-20 "></div>

      {/* Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair touch-none" />

      {/* HUD */}
      <div className="absolute top-4 left-4 z-20 w-80 flex flex-col gap-3 ">
        {/* Main Panel */}
        <div className="bg-black/80 backdrop-blur-md border border-emerald-500/30 p-4 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.1)] pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <h3 className="text-emerald-400 font-display text-sm flex items-center gap-2">
              <Hexagon size={16} /> سیاه‌مشق سایبری
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Text Input */}
            <div>
              <label className="text-[10px] text-gray-500 font-mono mb-1 flex items-center gap-1">
                <Type size={10} /> BRUSH_TEXT
              </label>
              <input
                type="text"
                value={brushText}
                onChange={(e) => setBrushText(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-2 text-emerald-100 text-xs rounded outline-none focus:border-emerald-500 transition-colors text-center font-bold"
                dir="rtl"
              />
            </div>

            {/* Symmetry Slider */}
            <div>
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mb-1">
                <span className="flex items-center gap-1">
                  <Snowflake size={10} /> SYMMETRY
                </span>
                <span>{symmetry}x</span>
              </div>
              <input
                type="range"
                min="2"
                max="32"
                step="2"
                value={symmetry}
                onChange={(e) => setSymmetry(Number(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Brush Size */}
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
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Mirror Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-gray-400 font-mono flex items-center gap-2">
                <RefreshCcw size={12} /> MIRROR_MODE
              </label>
              <button
                onClick={() => setMirrorMode(!mirrorMode)}
                className={`w-8 h-4 rounded-full relative transition-colors ${
                  mirrorMode ? "bg-emerald-600" : "bg-gray-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                    mirrorMode ? "left-1" : "right-1"
                  }`}
                ></div>
              </button>
            </div>

            {/* Auto Rotate Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-gray-400 font-mono flex items-center gap-2">
                <RotateCw size={12} /> AUTO_ROTATE
              </label>
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`w-8 h-4 rounded-full relative transition-colors ${
                  autoRotate ? "bg-emerald-600" : "bg-gray-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                    autoRotate ? "left-1" : "right-1"
                  }`}
                ></div>
              </button>
            </div>
          </div>

          {/* Palette Selector */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <label className="text-[10px] text-gray-500 font-mono mb-2 block flex items-center gap-1">
              <Palette size={10} /> THEME
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(colorPalettes).map((key) => (
                <button
                  key={key}
                  onClick={() => setPalette(key as PaletteType)}
                  className={`h-6 rounded border transition-all ${
                    palette === key ? "border-emerald-500 scale-110 shadow-lg" : "border-white/10 opacity-60"
                  }`}
                  style={{
                    background:
                      key === "turquoise"
                        ? "linear-gradient(45deg, #00e5ff, #004d52)"
                        : key === "cyber"
                        ? "linear-gradient(45deg, #ff00ff, #39ff14)"
                        : key === "gold"
                        ? "linear-gradient(45deg, #ffd700, #553300)"
                        : "linear-gradient(45deg, #ffffff, #000000)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={clearCanvas}
            className="flex-1 bg-red-900/20 hover:bg-red-500/20 border border-red-500/30 text-red-400 p-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Eraser size={14} /> پاکسازی
          </button>
          <button
            onClick={downloadCanvas}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded text-xs font-bold transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
          >
            <Download size={14} /> ذخیره طرح
          </button>
        </div>
      </div>

      {/* Decorative Overlay */}
      <div className="absolute bottom-4 right-4  opacity-50">
        <div className="w-24 h-24 border border-emerald-500/20 rounded-full animate-[spin_10s_linear_infinite] border-t-emerald-500"></div>
        <div className="absolute inset-0 w-16 h-16 m-auto border border-emerald-500/20 rounded-full animate-[spin_5s_linear_infinite_reverse] border-b-emerald-500"></div>
      </div>
    </div>
  );
};
