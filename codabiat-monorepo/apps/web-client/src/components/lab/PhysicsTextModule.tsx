import React, { useState, useRef, useEffect } from "react";
import { BoxSelect, Move, Anchor, Zap, RefreshCcw, Wind, Magnet, Hand, Skull, Save } from "lucide-react";
import SaveArtworkDialog from "./SaveArtworkDialog";

export const PhysicsTextModule: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [inputText, setInputText] = useState("در هیاهوی کلمات سکوت وزن دارد");
  const [gravity, setGravity] = useState(1);
  const [restitution, setRestitution] = useState(0.8);
  const [interactionMode, setInteractionMode] = useState<"drag" | "magnet" | "push">("drag");
  const [wordCount, setWordCount] = useState(0);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Physics Refs
  const engineRef = useRef<any>(null);
  const runnerRef = useRef<any>(null);
  const bodiesMapRef = useRef<Map<number, string>>(new Map());
  const requestRef = useRef<number>(0);

  // --- STYLES FOR PIXEL FONT & COMIC FEEL ---
  const comicStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
    
    .font-pixel {
      font-family: 'Press Start 2P', cursive, monospace; 
    }
    
    .comic-panel-border {
      box-shadow: 10px 10px 0px #000000;
      border: 4px solid #000000;
    }

    .inventory-slot {
      background: #000;
      border: 2px solid #E07000;
      box-shadow: inset 0 0 0 2px #000;
      position: relative;
      image-rendering: pixelated;
    }
    
    .inventory-slot.active {
      border-color: #FFFF00;
      background: #2a2a2a;
    }

    .inventory-slot::after {
      content: '';
      position: absolute;
      top: 2px; right: 2px;
      width: 4px; height: 4px;
      background: rgba(255,255,255,0.3);
    }

    /* Custom Range Slider - Sega Style */
    input[type=range] {
      -webkit-appearance: none;
      background: transparent;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 20px;
      width: 10px;
      background: #E07000;
      border: 2px solid #000;
      margin-top: -8px;
      cursor: pointer;
    }
    input[type=range]::-webkit-slider-runnable-track {
      width: 100%;
      height: 4px;
      background: #000;
      border: 1px solid #555;
    }
  `;

  // Initial Physics Setup
  useEffect(() => {
    const Matter = (window as any).Matter;
    if (!Matter || !canvasRef.current || !containerRef.current) return;

    const { Engine, Runner, Bodies, Mouse, MouseConstraint, Composite, Body, Vector } = Matter;

    // 1. Setup Engine
    const engine = Engine.create();
    engineRef.current = engine;
    engine.world.gravity.y = gravity;

    // 2. Setup Runner
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    // 3. Boundaries Function
    const updateBoundaries = () => {
      if (!containerRef.current || !engineRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      const bodies = Composite.allBodies(engine.world);
      const walls = bodies.filter((b: any) => b.isStatic && b.label === "wall");
      Composite.remove(engine.world, walls);

      if (height === 0) return;

      const wallOptions = {
        isStatic: true,
        label: "wall",
        render: { visible: false },
        friction: 0.5,
        restitution: 0.5,
      };
      const thickness = 200;

      Composite.add(engine.world, [
        Bodies.rectangle(width / 2, -thickness, width, thickness, wallOptions),
        Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, wallOptions),
        Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, wallOptions),
        Bodies.rectangle(-thickness / 2, height / 2, thickness, height, wallOptions),
      ]);
    };

    updateBoundaries();

    // 4. Mouse Control
    const mouse = Mouse.create(canvasRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        damping: 0.1,
        render: { visible: false },
      },
    });
    Composite.add(engine.world, mouseConstraint);

    mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

    // 5. Custom Render Loop (MODIFIED FOR COMIX ZONE STYLE)
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas || !containerRef.current) {
        requestRef.current = requestAnimationFrame(render);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        updateBoundaries();
      }

      // Interaction Logic
      if (interactionMode !== "drag" && engineRef.current) {
        const bodies = Composite.allBodies(engine.world).filter((b: any) => !b.isStatic);
        const mousePos = mouse.position;

        bodies.forEach((body: any) => {
          const d = Vector.magnitude(Vector.sub(body.position, mousePos));
          if (d < 300) {
            const forceMagnitude = (interactionMode === "magnet" ? 0.00005 : -0.0002) * body.mass;
            const force = Vector.mult(Vector.normalise(Vector.sub(mousePos, body.position)), forceMagnitude);
            Body.applyForce(body, body.position, force);
          }
        });
      }

      // --- DRAWING: THE PAGE ---
      // Clear with White (Paper) instead of transparent/black
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);

      // Optional: Draw faint grid lines (Sketchbook style)
      ctx.strokeStyle = "#E5E5E5";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < width; i += 40) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
      }
      for (let i = 0; i < height; i += 40) {
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
      }
      ctx.stroke();

      // Draw Bodies (COMIC STYLE)
      const bodies = Composite.allBodies(engine.world);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      bodies.forEach((body: any) => {
        if (body.label === "wall") return;

        const text = bodiesMapRef.current.get(body.id);
        if (!text) return;

        const { position, angle } = body;

        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.rotate(angle);

        // 1. Draw "Paper Cutout" Background
        // Instead of neon glow, we use solid white with thick black border
        const textMetrics = ctx.measureText(text);
        const bgWidth = textMetrics.width + 20; // Approximate
        const bgHeight = 36;

        // Shadow (Hard Ink Drop Shadow)
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(-bgWidth / 2 + 4, -bgHeight / 2 + 4, bgWidth, bgHeight);

        // Main Box
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight);

        // Border (Ink Line)
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight);

        // 2. Draw Text (Ink Black)
        ctx.fillStyle = "#000000";
        // Fallback font if Vazirmatn isn't loaded, but keep it bold
        ctx.font = `bold 20px "Vazirmatn", "Arial"`;
        ctx.fillText(text, 0, 0);

        ctx.restore();
      });

      // Draw Mouse Cursor Indicator (COMIC STYLE)
      if (interactionMode !== "drag") {
        ctx.beginPath();
        // Draw a "Target" reticle
        const mx = mouse.position.x;
        const my = mouse.position.y;

        ctx.strokeStyle = interactionMode === "magnet" ? "#006000" : "#FF0000"; // Sewer Green or Red
        ctx.lineWidth = 3;

        // Circle
        ctx.arc(mx, my, 25, 0, 2 * Math.PI);
        ctx.stroke();

        // Crosshair
        ctx.beginPath();
        ctx.moveTo(mx - 35, my);
        ctx.lineTo(mx + 35, my);
        ctx.moveTo(mx, my - 35);
        ctx.lineTo(mx, my + 35);
        ctx.stroke();
      }

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      Runner.stop(runner);
      Engine.clear(engine);
      engineRef.current = null;
    };
  }, []);

  // Update Params Effect
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.world.gravity.y = gravity;
      const Matter = (window as any).Matter;
      const bodies = Matter.Composite.allBodies(engineRef.current.world);
      bodies.forEach((b: any) => {
        if (!b.isStatic) b.restitution = restitution;
      });
    }
  }, [gravity, restitution]);

  const spawnWords = () => {
    const Matter = (window as any).Matter;
    if (!Matter || !engineRef.current || !containerRef.current) return;

    const { Bodies, Composite, Body } = Matter;
    const width = containerRef.current.clientWidth;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.font = 'bold 24px "Vazirmatn"';

    const words = inputText.split(" ").filter((w) => w.trim().length > 0);

    words.forEach((word) => {
      const textWidth = ctx ? ctx.measureText(word).width + 20 : word.length * 15;
      const textHeight = 40;

      const x = Math.random() * (width * 0.6) + width * 0.2;
      const y = Math.random() * -200 - 50;

      const body = Bodies.rectangle(x, y, textWidth, textHeight, {
        restitution: restitution,
        friction: 0.1,
        frictionAir: 0.01,
        density: 0.001,
        angle: (Math.random() - 0.5) * 0.5,
        chamfer: { radius: 2 }, // Sharper corners for paper look
      });

      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);

      Composite.add(engineRef.current.world, body);
      bodiesMapRef.current.set(body.id, word);
    });

    setWordCount((prev) => prev + words.length);
  };

  const clearWorld = () => {
    const Matter = (window as any).Matter;
    if (!Matter || !engineRef.current) return;
    const allBodies = Matter.Composite.allBodies(engineRef.current.world);
    const dynamicBodies = allBodies.filter((b: any) => !b.isStatic);
    Matter.Composite.remove(engineRef.current.world, dynamicBodies);
    bodiesMapRef.current.clear();
    setWordCount(0);
  };

  return (
    // MAIN CONTAINER: The "Void" (Artist's Desk) - Bruised Purple Background
    <div className="h-full flex flex-col relative overflow-hidden bg-[#2a002a]">
      <style>{comicStyles}</style>

      {/* Background Texture (Scattered Pencils/Debris effect via CSS gradients) */}
      <div
        className="absolute inset-0 opacity-20 "
        style={{
          backgroundImage: `radial-gradient(#500050 20%, transparent 20%), radial-gradient(#000 20%, transparent 20%)`,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
        }}
      ></div>

      {/* HEADER: The "Inventory" Bar */}
      <div className="z-30 w-full bg-black border-b-4 border-[#E07000] p-2 flex items-center justify-between shadow-lg">
        {/* Left: Title Card */}
        <div className="flex items-center gap-3">
          <div className="bg-[#FFCC00] text-black px-2 py-1 font-pixel text-xs border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] transform -rotate-1">
            EPISODE 1
          </div>
          <h3 className="text-white font-pixel text-xs md:text-sm tracking-widest text-shadow-md">
            NIGHT OF THE MUTANTS
          </h3>
        </div>

        {/* Right: Inventory Slots (Mode Switchers) */}
        <div className="flex gap-2">
          <button
            onClick={() => setInteractionMode("drag")}
            className={`w-10 h-10 flex items-center justify-center inventory-slot transition-transform active:scale-95 ${
              interactionMode === "drag" ? "active" : ""
            }`}
            title="Hand (Drag)"
          >
            <Hand size={20} color={interactionMode === "drag" ? "#FFCC00" : "#888"} />
          </button>
          <button
            onClick={() => setInteractionMode("magnet")}
            className={`w-10 h-10 flex items-center justify-center inventory-slot transition-transform active:scale-95 ${
              interactionMode === "magnet" ? "active" : ""
            }`}
            title="Magnet (Attract)"
          >
            <Magnet size={20} color={interactionMode === "magnet" ? "#00FF00" : "#888"} />
          </button>
          <button
            onClick={() => setInteractionMode("push")}
            className={`w-10 h-10 flex items-center justify-center inventory-slot transition-transform active:scale-95 ${
              interactionMode === "push" ? "active" : ""
            }`}
            title="Dynamite (Repel)"
          >
            <Zap size={20} color={interactionMode === "push" ? "#FF0000" : "#888"} />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 relative p-4 md:p-8 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* LEFT: The Comic Panel (Canvas) */}
        <div ref={containerRef} className="flex-1 relative z-10 comic-panel-border bg-white">
          {/* The "Gutter" is the margin around this div */}
          <canvas
            ref={canvasRef}
            className={`w-full h-full block touch-none ${
              interactionMode === "drag" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
            }`}
          />

          {/* Panel Number Badge */}
          <div className="absolute top-0 left-0 bg-[#FFCC00] border-r-2 border-b-2 border-black px-2 font-pixel text-xs text-black">
            PANEL 1
          </div>
        </div>

        {/* RIGHT: Controls (Narrator Box Style) */}
        <div className="w-full md:w-72 flex flex-col gap-4 z-20">
          {/* Input Box - "Narrator Caption" Style */}
          <div className="bg-[#FFCC00] border-4 border-black p-3 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">
            <div className="font-pixel text-[10px] mb-2 text-black uppercase tracking-wider border-b-2 border-black pb-1 flex justify-between">
              <span>DIALOGUE INPUT</span>
              <span>OBJ: {wordCount}</span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-white border-2 border-black p-2 text-xs font-bold text-black outline-none resize-none h-20 font-mono"
              placeholder="TYPE HERE..."
              dir="rtl"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={spawnWords}
                className="flex-1 bg-black text-white hover:bg-[#E07000] hover:text-black border-2 border-transparent hover:border-black font-pixel text-[10px] py-2 transition-colors"
              >
                INK IT!
              </button>
              <button
                onClick={clearWorld}
                className="px-3 bg-[#500050] text-white border-2 border-black hover:bg-red-600 transition-colors"
              >
                <Skull size={14} />
              </button>
            </div>
          </div>

          {/* Sliders - "Power Level" Style */}
          <div className="bg-black border-2 border-[#E07000] p-4 text-[#E07000]">
            <div className="mb-4">
              <div className="flex justify-between font-pixel text-[10px] mb-1">
                <span className="flex items-center gap-2">
                  <Anchor size={12} /> GRAVITY
                </span>
                <span>{gravity.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-1"
                max="2"
                step="0.1"
                value={gravity}
                onChange={(e) => setGravity(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <div className="flex justify-between font-pixel text-[10px] mb-1">
                <span className="flex items-center gap-2">
                  <Wind size={12} /> BOUNCE
                </span>
                <span>{(restitution * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.2"
                step="0.1"
                value={restitution}
                onChange={(e) => setRestitution(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Save Artwork Button */}
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={wordCount === 0}
            className={`w-full py-3 font-black text-sm uppercase border-4 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2 transition-all font-pixel
                        ${
                          wordCount > 0
                            ? "bg-[#006000] text-white hover:bg-[#007000] active:translate-y-1 active:shadow-none"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                        }
                    `}
          >
            <Save size={20} />
            SAVE ARTWORK
          </button>
        </div>
      </div>

      {/* Save Artwork Dialog */}
      <SaveArtworkDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        labModule="physics-text"
        labCategory="visual"
        content={{
          text: inputText,
          html: `<div style="font-family: 'Vazirmatn', Arial; padding: 20px; direction: rtl;">${inputText}</div>`,
          data: {
            inputText,
            gravity,
            restitution,
            interactionMode,
            wordCount,
          },
        }}
        screenshot={canvasRef.current?.toDataURL("image/png")}
      />
    </div>
  );
};
