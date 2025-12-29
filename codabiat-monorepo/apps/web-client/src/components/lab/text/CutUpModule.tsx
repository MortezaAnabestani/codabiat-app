import React, { useState, useEffect, useRef } from "react";
import {
  Scissors,
  RefreshCw,
  Download,
  Trash2,
  Type,
  Layers,
  Grab,
  Wind,
  Sparkles,
  Zap,
  Hand,
  Skull,
} from "lucide-react";

interface Fragment {
  id: number;
  text: string;
  x: number;
  y: number;
  angle: number;
  fontSize: number;
  fontFamily: string;
  body: any; // Matter.js body
  color: string;
}

// --- BRAND COLORS ---
const PALETTE = {
  mutantOrange: "#E07000",
  sewerSludge: "#006000",
  bruisedPurple: "#500050",
  sketchWhite: "#FFFFFF",
  inkBlack: "#000000",
  inventoryYellow: "#FFCC00",
};

export const CutUpModule: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<any>(null);
  const fragmentsRef = useRef<Fragment[]>([]);

  // UI State
  const [text, setText] = useState(
    "حقیقت در برش‌های تصادفی پنهان است. کلمات را رها کن تا معنای جدیدی متولد شود."
  );
  const [mode, setMode] = useState<"random" | "newspaper" | "fold">("random");
  const [gravity, setGravity] = useState(0.5);
  const [chaos, setChaos] = useState(5);
  const [isSimulating, setIsSimulating] = useState(true);

  // Comic/Pixel Fonts
  const fonts = ["Courier New", "monospace", "Tahoma", "Arial Black"];

  // --- Physics Engine Setup ---
  useEffect(() => {
    const Matter = (window as any).Matter;
    if (!Matter || !canvasRef.current || !containerRef.current) return;

    const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;

    const engine = Engine.create();
    engineRef.current = engine;
    engine.gravity.y = gravity;

    const runner = Runner.create();
    Runner.run(runner, engine);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Boundaries (Invisible Walls)
    const wallOptions = { isStatic: true, render: { visible: false } };
    const ground = Bodies.rectangle(width / 2, height + 50, width, 100, wallOptions);
    const leftWall = Bodies.rectangle(-50, height / 2, 100, height, wallOptions);
    const rightWall = Bodies.rectangle(width + 50, height / 2, 100, height, wallOptions);
    const ceiling = Bodies.rectangle(width / 2, -50, width, 100, wallOptions);

    Composite.add(engine.world, [ground, leftWall, rightWall, ceiling]);

    // Mouse Control
    const mouse = Mouse.create(canvasRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    Composite.add(engine.world, mouseConstraint);

    // --- CUSTOM RENDER LOOP (COMIC STYLE) ---
    const render = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !containerRef.current) return;

      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (canvasRef.current!.width !== w) {
        canvasRef.current!.width = w;
        canvasRef.current!.height = h;
      }

      // 1. Background: The "Page" Texture
      ctx.fillStyle = "#F0F0F0"; // Off-white paper
      ctx.fillRect(0, 0, w, h);

      // 2. Grid: Comic Layout Guides (Cyan/Blue pencil lines)
      ctx.strokeStyle = "rgba(0, 122, 204, 0.1)"; // Blue pencil
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let i = 0; i < h; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(w, i);
        ctx.stroke();
      }

      // 3. Draw Fragments (Cut-outs)
      fragmentsRef.current.forEach((frag) => {
        const { position, angle } = frag.body;
        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.rotate(angle);

        // Shadow (Hard Ink Shadow for depth)
        ctx.fillStyle = "rgba(0,0,0,1)"; // Hard black shadow
        const padding = 8;
        const metrics = ctx.measureText(frag.text);
        const rectW = metrics.width + padding * 2;
        const rectH = frag.fontSize + padding;

        // Draw Shadow Offset
        ctx.fillRect(-rectW / 2 + 4, -rectH / 2 + 4, rectW, rectH);

        // Paper Background (Pure White)
        ctx.fillStyle = PALETTE.sketchWhite;
        ctx.fillRect(-rectW / 2, -rectH / 2, rectW, rectH);

        // Border (Thick Ink Line)
        ctx.strokeStyle = PALETTE.inkBlack;
        ctx.lineWidth = 3;
        ctx.strokeRect(-rectW / 2, -rectH / 2, rectW, rectH);

        // Text (Ink Black)
        ctx.fillStyle = PALETTE.inkBlack;
        ctx.font = `bold ${frag.fontSize}px "${frag.fontFamily}"`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(frag.text, 0, 0);

        ctx.restore();
      });

      requestAnimationFrame(render);
    };

    render();

    return () => {
      Runner.stop(runner);
      Engine.clear(engine);
    };
  }, []);

  // Update Gravity
  useEffect(() => {
    if (engineRef.current) engineRef.current.gravity.y = gravity;
  }, [gravity]);

  const handleCutUp = () => {
    const Matter = (window as any).Matter;
    if (!Matter || !engineRef.current) return;

    const { Bodies, Composite } = Matter;
    const width = containerRef.current?.clientWidth || 800;

    // Purge old
    fragmentsRef.current.forEach((f) => Composite.remove(engineRef.current.world, f.body));

    let words = text.split(/\s+/).filter((w) => w.length > 0);

    const newFragments: Fragment[] = words.map((word, i) => {
      const fontSize = 16 + Math.random() * 14; // Slightly larger for readability
      const fontFamily = fonts[Math.floor(Math.random() * fonts.length)];

      const approxWidth = word.length * (fontSize * 0.7) + 20;
      const approxHeight = fontSize + 10;

      const x = Math.random() * (width - 100) + 50;
      const y = Math.random() * -500;

      const body = Bodies.rectangle(x, y, approxWidth, approxHeight, {
        restitution: 0.6,
        friction: 0.1,
        angle: (Math.random() - 0.5) * 0.5, // Less rotation initially
        render: { visible: false },
      });

      return {
        id: i,
        text: word,
        x,
        y,
        angle: body.angle,
        fontSize,
        fontFamily,
        body,
        color: "#FFFFFF", // Always white paper
      };
    });

    Composite.add(
      engineRef.current.world,
      newFragments.map((f) => f.body)
    );
    fragmentsRef.current = newFragments;
  };

  const handleClear = () => {
    const Matter = (window as any).Matter;
    fragmentsRef.current.forEach((f) => Matter.Composite.remove(engineRef.current.world, f.body));
    fragmentsRef.current = [];
  };

  const exportCollage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `comix_cutup_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      className="h-full flex flex-col md:flex-row overflow-hidden relative font-mono"
      style={{ backgroundColor: PALETTE.bruisedPurple }}
    >
      {/* --- SIDEBAR: THE INVENTORY / TOOLBOX --- */}
      <div
        className="w-full md:w-96 p-4 flex flex-col gap-4 border-l-4 border-black z-20 shrink-0 overflow-y-auto custom-scrollbar shadow-2xl"
        style={{
          backgroundColor: "#2a2a2a",
          backgroundImage:
            "linear-gradient(45deg, #2a2a2a 25%, #222 25%, #222 50%, #2a2a2a 50%, #2a2a2a 75%, #222 75%, #222 100%)",
          backgroundSize: "20px 20px",
        }}
      >
        {/* Header: Episode Title */}
        <div className="border-4 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-1">
              <Scissors size={24} />
            </div>
            <div>
              <h2
                className="text-black font-black text-xl uppercase tracking-tighter"
                style={{ fontFamily: "'Arial Black', sans-serif" }}
              >
                DADA_ZONE
              </h2>
              <p className="text-[10px] font-bold text-red-600 uppercase">Episode 1: The Cut-Up</p>
            </div>
          </div>
        </div>

        {/* Input: The Script */}
        <div className="space-y-1 relative group">
          <label className="text-[10px] font-bold text-white bg-black inline-block px-2 py-0.5 transform skew-x-12 ml-2">
            SOURCE_SCRIPT
          </label>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-32 bg-[#fffae0] border-4 border-black p-4 text-sm text-black outline-none focus:bg-white transition-all resize-none font-mono shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]"
              placeholder="Write your dialogue here..."
              dir="rtl"
              style={{ fontFamily: "'Courier New', monospace" }}
            />
            {/* Paper clip visual */}
            <div className="absolute -top-2 right-4 w-4 h-8 border-2 border-gray-400 rounded-full bg-transparent " />
          </div>
        </div>

        {/* Mode Select: Radio Buttons as Comic Options */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white bg-black inline-block px-2 py-0.5 transform skew-x-12 ml-2">
            CUT_TECHNIQUE
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: "random", label: "RANDOM CUT", icon: <Zap size={14} /> },
              { id: "newspaper", label: "NEWSPAPER", icon: <Layers size={14} /> },
              { id: "fold", label: "FOLD-IN", icon: <RefreshCw size={14} /> },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className={`w-full p-2 border-2 border-black flex items-center justify-between transition-all ${
                  mode === m.id
                    ? "bg-orange-500 text-black translate-x-1 shadow-[2px_2px_0px_black]"
                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                }`}
              >
                <span className="text-xs font-black uppercase flex items-center gap-2">
                  {m.icon} {m.label}
                </span>
                {mode === m.id && <div className="w-3 h-3 bg-black rounded-full animate-pulse" />}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders: Industrial Controls */}
        <div className="space-y-4 py-4 border-t-2 border-dashed border-gray-600">
          <div>
            <div className="flex justify-between text-[10px] font-bold text-white mb-1 uppercase">
              <span className="flex items-center gap-1 bg-black px-1">
                <Wind size={10} /> GRAVITY
              </span>
              <span className="text-orange-500">{gravity.toFixed(1)}G</span>
            </div>
            <input
              type="range"
              min="-1"
              max="2"
              step="0.1"
              value={gravity}
              onChange={(e) => setGravity(Number(e.target.value))}
              className="w-full h-4 bg-black rounded-none appearance-none cursor-pointer border-2 border-gray-600 accent-orange-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-bold text-white mb-1 uppercase">
              <span className="flex items-center gap-1 bg-black px-1">
                <Sparkles size={10} /> CHAOS
              </span>
              <span className="text-orange-500">{chaos}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={chaos}
              onChange={(e) => setChaos(Number(e.target.value))}
              className="w-full h-4 bg-black rounded-none appearance-none cursor-pointer border-2 border-gray-600 accent-orange-500"
            />
          </div>
        </div>

        {/* SEGA INVENTORY ACTION BAR */}
        <div className="mt-auto">
          <label className="text-[10px] font-bold text-white bg-black inline-block px-2 py-0.5 transform skew-x-12 ml-2 mb-2">
            INVENTORY / ACTIONS
          </label>
          <div className="flex gap-2 h-20">
            {/* Slot 1: Clear (Dynamite) */}
            <button
              onClick={handleClear}
              className="flex-1 bg-black border-2 border-gray-600 relative group overflow-hidden hover:border-red-500 transition-colors"
              title="Clear Board"
            >
              <div className="absolute inset-1 bg-[#FFCC00] flex flex-col items-center justify-center border border-black">
                <Trash2 size={24} className="text-black mb-1" />
                <span className="text-[8px] font-black uppercase text-black">NUKE</span>
              </div>
              {/* Glint effect */}
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-100" />
            </button>

            {/* Slot 2: Export (Save) */}
            <button
              onClick={exportCollage}
              className="flex-1 bg-black border-2 border-gray-600 relative group overflow-hidden hover:border-blue-500 transition-colors"
              title="Save Image"
            >
              <div className="absolute inset-1 bg-[#FFCC00] flex flex-col items-center justify-center border border-black">
                <Download size={24} className="text-black mb-1" />
                <span className="text-[8px] font-black uppercase text-black">SAVE</span>
              </div>
            </button>

            {/* Slot 3: Generate (Fist/Action) - MAIN ACTION */}
            <button
              onClick={handleCutUp}
              className="flex-[1.5] bg-black border-2 border-gray-600 relative group overflow-hidden hover:border-orange-500 transition-colors"
              title="Cut Up Text"
            >
              <div className="absolute inset-1 bg-orange-600 flex flex-col items-center justify-center border border-black animate-pulse group-hover:animate-none">
                <Hand size={32} className="text-white mb-1 rotate-12" />
                <span className="text-[10px] font-black uppercase text-white">SMASH!</span>
              </div>
              {/* Spark effect on hover */}
              <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100">
                <Sparkles className="text-yellow-300 w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* --- MAIN VIEWPORT: THE COMIC PAGE --- */}
      <div
        ref={containerRef}
        className="flex-grow relative cursor-grab active:cursor-grabbing overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]"
      >
        {/* The Canvas is the "Paper" */}
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* HUD: Top Left Info */}
        <div className="absolute top-4 left-4 flex flex-col gap-2  select-none">
          <div className="bg-yellow-400 border-2 border-black px-2 py-1 shadow-[4px_4px_0px_black] transform -rotate-2">
            <span className="text-xs font-black text-black uppercase flex items-center gap-2">
              <Grab size={12} /> PHYSICS_ENGINE: ON
            </span>
          </div>
          <div className="bg-white border-2 border-black px-2 py-1 shadow-[4px_4px_0px_black] transform rotate-1 w-fit">
            <span className="text-xs font-black text-black uppercase flex items-center gap-2">
              <Type size={12} /> FRAGMENTS: {fragmentsRef.current.length}
            </span>
          </div>
        </div>

        {/* Empty State / Instructions */}
        {fragmentsRef.current.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center ">
            <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-md transform rotate-1">
              <Skull size={48} className="mx-auto mb-4 text-black" />
              <h3 className="font-black text-2xl text-black mb-2 uppercase tracking-tight">
                THE PAGE IS EMPTY!
              </h3>
              <p className="font-mono text-sm text-gray-800 leading-relaxed border-t-2 border-black pt-4 mt-2">
                "Listen up, Sketch! Type your text in the inventory slot, then hit the{" "}
                <span className="font-bold text-red-600">SMASH</span> button to shred reality."
              </p>
            </div>
          </div>
        )}

        {/* Decorative "Gutter" Shadow on the left edge of canvas */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent " />
      </div>
    </div>
  );
};
