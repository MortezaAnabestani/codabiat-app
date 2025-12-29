import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Move,
  Share2,
  Download,
  RefreshCw,
  Layers,
  Zap,
  Activity,
  Maximize,
  ChevronRight,
  Circle,
  Wind,
  Binary,
} from "lucide-react";

type GeoMode = "spiral" | "wave" | "fibonacci" | "mandala";

export const GeometricModule: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // --- State ---
  const [text, setText] = useState("در هندسه‌ی کلمات، سکوت عمیق‌ترین زاویه است");
  const [mode, setMode] = useState<GeoMode>("fibonacci");
  const [complexity, setComplexity] = useState(100);
  const [spacing, setSpacing] = useState(25);
  const [speed, setSpeed] = useState(0.5);
  const [amplitude, setAmplitude] = useState(50);

  // --- Render Logic ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sync canvas size
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    // Clear with slight trail for motion blur
    ctx.fillStyle = "rgba(5, 5, 5, 0.15)";
    ctx.fillRect(0, 0, w, h);

    timeRef.current += 0.01 * speed;
    const t = timeRef.current;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = 'bold 16px "Vazirmatn"';

    const words = text.split(" ");
    const centerX = w / 2;
    const centerY = h / 2;

    // Render Modes
    switch (mode) {
      case "spiral":
        let angle = t;
        let radius = 10;
        for (let i = 0; i < complexity; i++) {
          const word = words[i % words.length];
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          const wordAngle = angle + Math.PI / 2;
          drawWord(ctx, word, x, y, wordAngle, i, complexity);

          const charDist = ctx.measureText(word).width + spacing;
          angle += charDist / radius;
          radius += spacing / 15;
        }
        break;

      case "wave":
        const step = w / (complexity / 2);
        for (let i = 0; i < complexity; i++) {
          const word = words[i % words.length];
          const x = ((i * step + t * 50) % (w + 100)) - 50;
          const y = centerY + Math.sin(i * 0.2 + t) * amplitude;

          const slope = Math.cos(i * 0.2 + t);
          const wordAngle = Math.atan(slope);
          drawWord(ctx, word, x, y, wordAngle, i, complexity);
        }
        break;

      case "fibonacci":
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < complexity; i++) {
          const word = words[i % words.length];
          const r = Math.sqrt(i) * spacing * 1.5;
          const theta = i * goldenAngle + t;

          const x = centerX + Math.cos(theta) * r;
          const y = centerY + Math.sin(theta) * r;

          drawWord(ctx, word, x, y, theta, i, complexity);
        }
        break;

      case "mandala":
        const layers = 5;
        const perLayer = Math.floor(complexity / layers);
        for (let l = 1; l <= layers; l++) {
          const layerRadius = l * spacing * 3;
          const layerRotation = t * (l % 2 === 0 ? 1 : -1);
          for (let i = 0; i < perLayer; i++) {
            const word = words[i % words.length];
            const theta = (i / perLayer) * Math.PI * 2 + layerRotation;

            const x = centerX + Math.cos(theta) * layerRadius;
            const y = centerY + Math.sin(theta) * layerRadius;

            drawWord(ctx, word, x, y, theta + Math.PI / 2, i + l, complexity);
          }
        }
        break;
    }

    requestRef.current = requestAnimationFrame(draw);
  }, [text, mode, complexity, spacing, speed, amplitude]);

  const drawWord = (
    ctx: CanvasRenderingContext2D,
    word: string,
    x: number,
    y: number,
    angle: number,
    index: number,
    total: number
  ) => {
    const hue = (index / total) * 60 + 20 + timeRef.current * 10; // Dynamic color
    const alpha = Math.max(0.2, 1 - index / total);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Shadow/Glow
    ctx.shadowColor = `hsla(${hue}, 100%, 50%, 0.8)`;
    ctx.shadowBlur = 10;

    ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
    ctx.fillText(word, 0, 0);

    ctx.restore();
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current);
  }, [draw]);

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-[#050505]">
      {/* Background Grid Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.03)_1px,transparent_1px)] bg-[size:50px_50px] "></div>

      {/* Main Canvas Viewport */}
      <div ref={containerRef} className="flex-grow relative z-0">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Professional HUD Controls */}
      <div className="absolute top-6 right-6 bottom-6 w-80 z-20 flex flex-col gap-4 ">
        {/* Mode Selector Panel */}
        <div className="bg-black/70 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-5 shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <h3 className="text-yellow-400 font-display text-sm flex items-center gap-2">
              <Binary size={16} /> موتور هندسه کلمات
            </h3>
            <span className="font-mono text-[10px] text-gray-500 uppercase">Parametric_v2</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            {[
              { id: "spiral", label: "مارپیچ", icon: RefreshCw },
              { id: "fibonacci", label: "فیبوناچی", icon: Layers },
              { id: "wave", label: "موج سینوسی", icon: Wind },
              { id: "mandala", label: "ماندالا", icon: Circle },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as GeoMode)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold transition-all ${
                  mode === m.id
                    ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                    : "border-white/5 text-gray-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <m.icon size={14} />
                {m.label}
              </button>
            ))}
          </div>

          {/* Parameters */}
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-2 uppercase">
                <span>Density (Nodes)</span>
                <span className="text-yellow-500">{complexity}</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                value={complexity}
                onChange={(e) => setComplexity(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-2 uppercase">
                <span>Scale / Spacing</span>
                <span className="text-yellow-500">{spacing}px</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={spacing}
                onChange={(e) => setSpacing(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-2 uppercase">
                <span>Temporal Velocity</span>
                <span className="text-yellow-500">{speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
            </div>

            {mode === "wave" && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-2 uppercase">
                  <span>Amplitude</span>
                  <span className="text-yellow-500">{amplitude}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={amplitude}
                  onChange={(e) => setAmplitude(Number(e.target.value))}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Text Source Buffer */}
        <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 pointer-events-auto">
          <label className="text-[9px] font-mono text-gray-500 uppercase block mb-2">
            String_Buffer_Input
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white outline-none focus:border-yellow-500/50 transition-all resize-none h-20"
            dir="rtl"
          />
        </div>

        {/* System Actions */}
        <div className="flex gap-2 pointer-events-auto mt-auto">
          <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 text-gray-400 hover:text-white">
            <Share2 size={14} /> اشتراک فرم
          </button>
          <button className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 text-black rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <Download size={14} /> خروجی PNG
          </button>
        </div>
      </div>

      {/* Visualizer Status Bar */}
      <div className="absolute bottom-6 left-10  flex items-center gap-6 text-[10px] font-mono text-gray-600 z-10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_#eab308]"></div>
          <span>CALCULATING_TRAJECTORY</span>
        </div>
        <div className="flex items-center gap-2">
          <Maximize size={12} />
          <span>COORDS: {mode.toUpperCase()}</span>
        </div>
        <div className="hidden md:flex items-center gap-2 border-l border-white/10 pl-6">
          <Activity size={12} />
          <span>FREQ: {(60 * speed).toFixed(0)}Hz</span>
        </div>
      </div>
    </div>
  );
};
