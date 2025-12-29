import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Scissors,
  Move,
  RefreshCw,
  Download,
  Trash2,
  Sliders,
  Type,
  Layers,
  Grab,
  Wind,
  Hash,
  Sparkles,
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

  const fonts = ["Vazirmatn", "Lalezar", "system-ui", "monospace", "serif"];

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

    // Boundaries
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

    // Render Loop
    const render = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !containerRef.current) return;

      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (canvasRef.current!.width !== w) {
        canvasRef.current!.width = w;
        canvasRef.current!.height = h;
      }

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      // Draw Background Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
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

      // Draw Fragments
      fragmentsRef.current.forEach((frag) => {
        const { position, angle } = frag.body;
        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.rotate(angle);

        // Draw "Paper" Backing
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = frag.color;

        const padding = 10;
        const metrics = ctx.measureText(frag.text);
        const rectW = metrics.width + padding * 2;
        const rectH = frag.fontSize + padding;

        ctx.fillRect(-rectW / 2, -rectH / 2, rectW, rectH);

        // Draw Border (Magazine style)
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 1;
        ctx.strokeRect(-rectW / 2, -rectH / 2, rectW, rectH);

        // Draw Text
        ctx.shadowBlur = 0;
        ctx.fillStyle = frag.color === "#ffffff" ? "#000000" : "#ffffff";
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
      const fontSize = 14 + Math.random() * 20;
      const fontFamily = fonts[Math.floor(Math.random() * fonts.length)];

      // Measure approx width
      const approxWidth = word.length * (fontSize * 0.7) + 20;
      const approxHeight = fontSize + 10;

      const x = Math.random() * (width - 100) + 50;
      const y = Math.random() * -500;

      const body = Bodies.rectangle(x, y, approxWidth, approxHeight, {
        restitution: 0.6,
        friction: 0.1,
        angle: (Math.random() - 0.5) * 1,
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
        color: Math.random() > 0.8 ? "#ff0055" : Math.random() > 0.5 ? "#ffffff" : "#f0f0f0",
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
    link.download = `dada_collage_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-void-black overflow-hidden relative">
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 p-6 flex flex-col gap-6 border-l border-white/10 z-20 bg-panel-black/80 backdrop-blur-xl shrink-0 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-2 bg-neon-blue/20 rounded-lg text-neon-blue">
            <Scissors size={24} />
          </div>
          <div>
            <h2 className="text-white font-display text-2xl tracking-tight">کنسول دادائیسم</h2>
            <p className="text-[10px] font-mono text-gray-500 uppercase">Collage_Engine_v10.0</p>
          </div>
        </div>

        {/* Input Buffer */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-2">
            <Type size={12} /> Text_Source_Buffer
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-gray-300 outline-none focus:border-neon-blue transition-all resize-none"
            placeholder="متنی برای قطعه قطعه کردن بنویسید..."
            dir="rtl"
          />
        </div>

        {/* Algorithms */}
        <div className="space-y-3">
          <label className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-2">
            <Layers size={12} /> Cut_Up_Protocol
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: "random", label: "تکنیک استاندارد", desc: "برش کلمه به کلمه و رهاسازی" },
              { id: "newspaper", label: "ستون روزنامه", desc: "شبیه‌سازی چیدمان مطبوعاتی" },
              { id: "fold", label: "تکنیک تاشده", desc: "ادغام متقاطع دو پاراگراف" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as any)}
                className={`w-full p-3 rounded-xl border text-right transition-all group ${
                  mode === m.id
                    ? "bg-neon-blue border-neon-blue text-black"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                }`}
              >
                <div className="text-xs font-bold mb-1">{m.label}</div>
                <div className={`text-[9px] ${mode === m.id ? "text-black/60" : "text-gray-600"}`}>
                  {m.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-5 py-4 border-t border-white/10">
          <div>
            <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-2 uppercase">
              <span className="flex items-center gap-1">
                <Wind size={10} /> Gravity_Force
              </span>
              <span className="text-neon-blue">{gravity.toFixed(1)}G</span>
            </div>
            <input
              type="range"
              min="-1"
              max="2"
              step="0.1"
              value={gravity}
              onChange={(e) => setGravity(Number(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-blue"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-2 uppercase">
              <span className="flex items-center gap-1">
                <Sparkles size={10} /> Chaos_Entropy
              </span>
              <span className="text-neon-blue">{chaos}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={chaos}
              onChange={(e) => setChaos(Number(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-blue"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-2">
          <button
            onClick={handleCutUp}
            className="w-full py-4 bg-neon-blue hover:bg-cyan-400 text-black font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)]"
          >
            <Scissors size={20} /> آغاز برش و ترکیب
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="flex-1 py-3 bg-red-900/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> پاکسازی
            </button>
            <button
              onClick={exportCollage}
              className="flex-1 py-3 bg-white/5 text-gray-400 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} /> خروجی PNG
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        className="flex-grow relative cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* HUD Overlays */}
        <div className="absolute top-6 left-6  flex flex-col gap-4">
          <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded border border-white/10 text-[9px] font-mono text-gray-500 flex items-center gap-2">
            <Grab size={10} /> INTERACTIVE_PHYSICS: ACTIVE
          </div>
          <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded border border-white/10 text-[9px] font-mono text-gray-500 flex items-center gap-2">
            <Hash size={10} /> OBJECT_COUNT: {fragmentsRef.current.length}
          </div>
        </div>

        {/* Instructions Overlay */}
        {fragmentsRef.current.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-30 ">
            <Scissors size={80} className="mb-6 stroke-[1px]" />
            <h3 className="font-display text-2xl text-white mb-2">هنر تصادف</h3>
            <p className="font-mono text-xs max-w-xs leading-relaxed">
              متنی را وارد کنید و دکمه آغاز را بزنید تا کلمات به ذرات معلق در گرانش تبدیل شوند.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
