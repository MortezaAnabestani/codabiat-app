import React, { useEffect, useRef, useState } from "react";
import {
  Hexagon,
  RotateCw,
  RefreshCcw,
  Download,
  Eraser,
  Type,
  Palette,
  Snowflake,
  Zap, // Replaced Sun/Moon with Zap for comic feel
} from "lucide-react";

type PaletteType = "mutant" | "sludge" | "sketch" | "bruised";

export const CyberIslimiModule: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<any>(null);

  // --- UI State ---
  const [brushText, setBrushText] = useState("هو");
  const [symmetry, setSymmetry] = useState(8); // 4 to 32
  const [mirrorMode, setMirrorMode] = useState(true);
  const [brushSize, setBrushSize] = useState(24);
  const [autoRotate, setAutoRotate] = useState(false);
  const [palette, setPalette] = useState<PaletteType>("mutant");

  // Ref to pass state to P5
  const stateRef = useRef({ brushText, symmetry, mirrorMode, brushSize, autoRotate, palette });

  useEffect(() => {
    stateRef.current = { brushText, symmetry, mirrorMode, brushSize, autoRotate, palette };
  }, [brushText, symmetry, mirrorMode, brushSize, autoRotate, palette]);

  // --- COMIX ZONE PALETTES (16-bit Sega Style) ---
  const colorPalettes = {
    mutant: ["#E07000", "#FFCC00", "#FFFFFF", "#804000"], // Orange/Yellow (Fire)
    sludge: ["#006000", "#00FF00", "#CCFFCC", "#003300"], // Toxic Green
    sketch: ["#000000", "#FFFFFF", "#505050", "#AAAAAA"], // Ink & Paper
    bruised: ["#500050", "#FF00FF", "#E07000", "#200020"], // Purple/Contrast
  };

  useEffect(() => {
    const p5 = (window as any).p5;
    if (!p5 || !containerRef.current) return;

    const sketch = (p: any) => {
      let rotationOffset = 0;

      p.setup = () => {
        p.createCanvas(containerRef.current?.offsetWidth || 800, containerRef.current?.offsetHeight || 600);
        p.angleMode(p.DEGREES);
        // Background matches the "Paper" inside the comic panel (Dark Ink style)
        p.background(20);
        p.textFont("Courier New"); // Monospace for typewriter feel
        p.textAlign(p.CENTER, p.CENTER);
      };

      p.draw = () => {
        if (stateRef.current.autoRotate) {
          rotationOffset += 0.1;
        }

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

          const currentPalette = colorPalettes[stateRef.current.palette as PaletteType];
          const col = p.random(currentPalette);

          // Hard Ink Shadow instead of soft glow
          p.drawingContext.shadowBlur = 0;
          p.drawingContext.shadowOffsetX = 2;
          p.drawingContext.shadowOffsetY = 2;
          p.drawingContext.shadowColor = "#000000";

          p.fill(col);
          p.stroke(0); // Black outline for comic look
          p.strokeWeight(1);
          p.textSize(stateRef.current.brushSize);

          for (let i = 0; i < sym; i++) {
            p.rotate(angleStep);
            drawStroke(mx, my, pmx, pmy);
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
        const d = p.dist(x, y, px, py);
        const steps = Math.ceil(d / 5);

        for (let i = 0; i < steps; i++) {
          const lerpX = p.lerp(px, x, i / steps);
          const lerpY = p.lerp(py, y, i / steps);

          p.push();
          p.translate(lerpX, lerpY);
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
          p.background(20);
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
      p5Instance.current.background(20);
      // Flash effect for "Page Tear"
      const flash = document.getElementById("flash-overlay");
      if (flash) {
        flash.style.opacity = "1";
        setTimeout(() => (flash.style.opacity = "0"), 100);
      }
    }
  };

  const downloadCanvas = () => {
    if (p5Instance.current) {
      p5Instance.current.saveCanvas("comix_zone_artifact", "png");
    }
  };

  return (
    // --- THE VOID (Artist's Desk) ---
    <div className="h-full flex flex-col relative bg-[#2a2a2a] overflow-hidden font-mono">
      {/* Flash Overlay for Page Turn Effect */}
      <div
        id="flash-overlay"
        className="absolute inset-0 bg-white opacity-0  transition-opacity duration-100 z-50"
      ></div>

      {/* Background Texture (Scattered Pencils/Grime) */}
      <div
        className="absolute inset-0 opacity-10 "
        style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: "10px 10px" }}
      ></div>

      {/* --- INVENTORY SLOTS (Top Right Actions) --- */}
      <div className="absolute top-4 right-4 z-30 flex gap-2">
        {/* Slot 1: Eraser */}
        <button
          onClick={clearCanvas}
          className="group relative w-12 h-12 bg-yellow-500 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
          title="Clear Page"
        >
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <Eraser size={24} className="text-black" />
        </button>

        {/* Slot 2: Save */}
        <button
          onClick={downloadCanvas}
          className="group relative w-12 h-12 bg-emerald-700 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center"
          title="Save Artifact"
        >
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <Download size={24} className="text-white" />
        </button>
      </div>

      {/* --- MAIN COMIC PANEL (Canvas) --- */}
      <div className="flex-1 m-4 relative z-10">
        {/* The Panel Border */}
        <div className="absolute inset-0 border-[6px] border-black  z-20 shadow-[0_0_0_4px_#ffffff,0_0_20px_rgba(0,0,0,0.5)]"></div>

        {/* The Canvas Container */}
        <div ref={containerRef} className="w-full h-full cursor-crosshair touch-none bg-[#141414]" />

        {/* "Page Number" or Metadata in corner */}
        <div className="absolute bottom-2 right-2 bg-yellow-400 border-2 border-black px-2 py-1 z-20 text-[10px] font-bold text-black uppercase tracking-widest">
          EPISODE 1: GENESIS
        </div>
      </div>

      {/* --- CONTROL PANEL (The Sketchpad) --- */}
      <div className="absolute top-4 left-4 z-20 w-72 flex flex-col gap-4">
        {/* Header Box */}
        <div className="bg-[#FFCC00] border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-black font-black text-sm flex items-center gap-2 uppercase tracking-tighter">
            <Hexagon size={18} strokeWidth={3} /> SEGA_ISLIMI_V1
          </h3>
        </div>

        {/* Controls Container */}
        <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-5">
          {/* Text Input (Speech Bubble Style) */}
          <div className="relative">
            <label className="text-[10px] font-black text-black mb-1 flex items-center gap-1 uppercase">
              <Type size={12} /> INPUT_GLYPH
            </label>
            <input
              type="text"
              value={brushText}
              onChange={(e) => setBrushText(e.target.value)}
              className="w-full bg-gray-100 border-2 border-black p-2 text-black text-sm font-bold outline-none focus:bg-yellow-100 transition-colors text-center"
              dir="rtl"
            />
            {/* Speech Bubble Tail */}
            <div className="absolute -right-2 top-6 w-0 h-0 border-t-[10px] border-t-transparent border-l-[10px] border-l-black border-b-[10px] border-b-transparent transform rotate-45"></div>
          </div>

          {/* Sliders (Health Bar Style) */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] font-black text-black mb-1">
                <span className="flex items-center gap-1">
                  <Snowflake size={10} /> SYMMETRY
                </span>
                <span className="bg-black text-white px-1">{symmetry}</span>
              </div>
              <input
                type="range"
                min="2"
                max="32"
                step="2"
                value={symmetry}
                onChange={(e) => setSymmetry(Number(e.target.value))}
                className="w-full h-4 bg-gray-300 border-2 border-black appearance-none cursor-pointer accent-black"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-black text-black mb-1">
                <span>BRUSH_SIZE</span>
                <span className="bg-black text-white px-1">{brushSize}</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full h-4 bg-gray-300 border-2 border-black appearance-none cursor-pointer accent-black"
              />
            </div>
          </div>

          {/* Toggles (Checkbox Style) */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setMirrorMode(!mirrorMode)}
              className={`flex items-center justify-between p-2 border-2 border-black transition-all ${
                mirrorMode ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              <span className="text-[10px] font-bold flex items-center gap-2">
                <RefreshCcw size={12} /> MIRROR
              </span>
              <div
                className={`w-3 h-3 border border-black ${mirrorMode ? "bg-white" : "bg-transparent"}`}
              ></div>
            </button>

            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`flex items-center justify-between p-2 border-2 border-black transition-all ${
                autoRotate ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              <span className="text-[10px] font-bold flex items-center gap-2">
                <RotateCw size={12} /> ROTATE
              </span>
              <div
                className={`w-3 h-3 border border-black ${autoRotate ? "bg-white" : "bg-transparent"}`}
              ></div>
            </button>
          </div>

          {/* Palette Selector (Color Chips) */}
          <div className="pt-2 border-t-2 border-black border-dashed">
            <label className="text-[10px] font-black text-black mb-2 block flex items-center gap-1">
              <Palette size={10} /> INK_TYPE
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(colorPalettes).map((key) => (
                <button
                  key={key}
                  onClick={() => setPalette(key as PaletteType)}
                  className={`h-8 border-2 border-black transition-transform ${
                    palette === key
                      ? "translate-y-[-4px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{
                    background:
                      key === "mutant"
                        ? "linear-gradient(135deg, #E07000 50%, #FFCC00 50%)"
                        : key === "sludge"
                        ? "linear-gradient(135deg, #006000 50%, #00FF00 50%)"
                        : key === "sketch"
                        ? "linear-gradient(135deg, #000000 50%, #FFFFFF 50%)"
                        : "linear-gradient(135deg, #500050 50%, #FF00FF 50%)",
                  }}
                  title={key.toUpperCase()}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative "Onomatopoeia" behind elements (Optional visual flair) */}
      <div className="absolute bottom-10 right-10  opacity-20 rotate-[-10deg]">
        <h1 className="text-9xl font-black text-white stroke-black" style={{ WebkitTextStroke: "2px black" }}>
          POW!
        </h1>
      </div>
    </div>
  );
};
