import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Wind,
  Activity,
  Zap,
  MousePointer2,
  RefreshCw,
  Settings2,
  Grid,
  Circle,
  PenTool,
  Hand,
  Save,
} from "lucide-react";
import SaveArtworkDialog from "../SaveArtworkDialog";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  text: string;
  size: number;
  color: string;
  history: { x: number; y: number }[];
  baseX: number;
  baseY: number;
}

type Mode = "fluid" | "vortex" | "magnet" | "grid";

export const AdvancedKineticModule: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  // Settings
  const [text, setText] = useState("رقص کلمات در امتداد بادهای دیجیتال");
  const [mode, setMode] = useState<Mode>("fluid");
  const [particleCount, setParticleCount] = useState(0);
  const [connectionDistance, setConnectionDistance] = useState(100);
  const [speed, setSpeed] = useState(1);
  const [showTrails, setShowTrails] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Initialization
  const initParticles = useCallback(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const words = text.split(" ").filter((w) => w.length > 0);
    let fillWords = [...words];
    while (fillWords.length < 30) {
      fillWords = [...fillWords, ...words];
    }

    const newParticles: Particle[] = fillWords.map((word, i) => {
      // Comix Zone Palette for Particles
      const colors = [
        "#E07000", // Mutant Orange
        "#00FF00", // Rad Green
        "#FFFFFF", // Sketch White
        "#FFCC00", // Narrator Yellow
        "#00FFFF", // Sega Cyan
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        ax: 0,
        ay: 0,
        text: word,
        size: 14 + Math.random() * 20,
        color: randomColor,
        history: [],
        baseX: (width / fillWords.length) * i + Math.random() * 50,
        baseY: height / 2 + (Math.random() - 0.5) * 200,
      };
    });

    particlesRef.current = newParticles;
    setParticleCount(newParticles.length);
  }, [text]);

  useEffect(() => {
    initParticles();
  }, [initParticles]);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      if (!canvas || !container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Background: Ink Black for the panel content
      ctx.fillStyle = showTrails ? "rgba(20, 20, 25, 0.2)" : "rgba(20, 20, 25, 1)";
      ctx.fillRect(0, 0, width, height);

      // Add a subtle halftone pattern effect (optional visual flair)
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      for (let i = 0; i < width; i += 4) {
        ctx.fillRect(i, 0, 1, height);
      }

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      particles.forEach((p, i) => {
        // --- PHYSICS LOGIC (UNCHANGED) ---
        if (mode === "fluid") {
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const force = Math.max(0, 300 - dist) / 300;
            if (dist < 300) {
              p.ax += (dx / dist) * force * 0.5;
              p.ay += (dy / dist) * force * 0.5;
            }
          }
          p.ax += (Math.random() - 0.5) * 0.1;
          p.ay += (Math.random() - 0.5) * 0.1;
        } else if (mode === "magnet") {
          const targetX = mouse.active ? mouse.x : width / 2;
          const targetY = mouse.active ? mouse.y : height / 2;
          const dx = targetX - p.x;
          const dy = targetY - p.y;
          p.ax += dx * 0.0005;
          p.ay += dy * 0.0005;
        } else if (mode === "vortex") {
          const centerX = width / 2;
          const centerY = height / 2;
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          p.ax += -dy * 0.0001 + (centerX - p.x) * 0.0001;
          p.ay += dx * 0.0001 + (centerY - p.y) * 0.0001;
        } else if (mode === "grid") {
          const k = 0.05;
          const damping = 0.9;
          const ax = (p.baseX - p.x) * k;
          const ay = (p.baseY - p.y) * k;
          p.ax += ax;
          p.ay += ay;
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
              const force = (200 - dist) * 0.05;
              p.ax += (dx / dist) * force;
              p.ay += (dy / dist) * force;
            }
          }
        }

        p.vx += p.ax;
        p.vy += p.ay;
        p.vx *= mode === "grid" ? 0.9 : 0.96;
        p.vy *= mode === "grid" ? 0.9 : 0.96;

        const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (velocity > 10 * speed) {
          p.vx = (p.vx / velocity) * 10 * speed;
          p.vy = (p.vy / velocity) * 10 * speed;
        }

        p.x += p.vx * speed;
        p.y += p.vy * speed;
        p.ax = 0;
        p.ay = 0;

        if (mode !== "grid") {
          if (p.x < -50) p.x = width + 50;
          if (p.x > width + 50) p.x = -50;
          if (p.y < -50) p.y = height + 50;
          if (p.y > height + 50) p.y = -50;
        }

        if (showTrails) {
          p.history.push({ x: p.x, y: p.y });
          if (p.history.length > 5) p.history.shift();
        }
      });

      // Draw Connections (Rough Sketch Lines)
      if (connectionDistance > 0 && mode !== "grid") {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"; // Sketchy white lines
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectionDistance) {
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
            }
          }
        }
        ctx.stroke();
      }

      // Draw Particles
      particles.forEach((p) => {
        ctx.save();

        if (showTrails && p.history.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.history[0].x, p.history[0].y);
          for (let i = 1; i < p.history.length; i++) {
            ctx.lineTo(p.history[i].x, p.history[i].y);
          }
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = 0.5;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.translate(p.x, p.y);
        const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const rotation = Math.atan2(p.vy, p.vx);

        if (mode === "fluid" && velocity > 2) ctx.rotate(rotation);

        // Comic Style Text Rendering
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1;
        // Hard shadow for comic pop
        ctx.shadowColor = "#000000";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 0;

        // Use a monospace font to simulate pixel/typewriter text
        ctx.font = `bold ${p.size}px "Courier New", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.text, 0, 0);

        // Outline for readability (Comic style)
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.strokeText(p.text, 0, 0);

        ctx.restore();
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(requestRef.current);
  }, [mode, connectionDistance, speed, showTrails]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  const canvasToDataURL = () => {
    if (!canvasRef.current) return undefined;
    try {
      return canvasRef.current.toDataURL("image/png");
    } catch (error) {
      console.error("Failed to capture canvas:", error);
      return undefined;
    }
  };

  return (
    // THE VOID (Artist's Desk Background)
    <div className="h-full  flex flex-col relative overflow-hidden bg-[#500050] p-4 font-mono select-none">
      {/* Background Texture (Subtle Grunge) */}
      <div className="absolute inset-0 opacity-20  bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>

      {/* MAIN COMIC PANEL (Canvas) */}
      <div className="flex-grow relative z-10 mb-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
        {/* Panel Border */}
        <div className="absolute inset-0 border-4 border-black  z-20"></div>

        {/* Panel Header (Episode Title) */}
        <div className="absolute top-0 left-0 bg-yellow-400 border-b-4 border-r-4 border-black px-4 py-1 z-30">
          <h2 className="text-black font-black text-xs tracking-widest uppercase transform -skew-x-12">
            EPISODE 1: KINETIC WORDS
          </h2>
        </div>

        <div
          ref={containerRef}
          className="w-full h-full relative bg-[#1a1a1a] cursor-none overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <canvas ref={canvasRef} className="block" />

          {/* MORTUS HAND (Custom Cursor) */}
          <div
            className="fixed  z-50 transition-transform duration-75"
            style={{
              left: mouseRef.current.x,
              top: mouseRef.current.y,
              opacity: mouseRef.current.active ? 1 : 0,
              transform: `translate(-10%, -10%) rotate(-15deg) scale(${mouseRef.current.active ? 1.2 : 1})`,
            }}
          >
            {/* Using PenTool to simulate the Artist's Hand */}
            <div className="relative">
              <PenTool
                size={48}
                className="text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] fill-orange-500"
                strokeWidth={2.5}
              />
              {/* Spark effect */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-400 animate-ping rounded-full opacity-75"></div>
            </div>
          </div>
        </div>
      </div>

      {/* THE INVENTORY (Controls UI) */}
      <div className="relative z-20 bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* "Inventory" Grid Layout */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          {/* LEFT: Mode Selectors (Item Slots) */}
          <div className="flex gap-3">
            {[
              { id: "fluid", icon: Activity, label: "FLUID" },
              { id: "vortex", icon: RefreshCw, label: "VORTEX" },
              { id: "magnet", icon: Zap, label: "MAGNET" },
              { id: "grid", icon: Grid, label: "ORDER" },
            ].map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => setMode(m.id as Mode)}
                  className={`w-12 h-12 border-4 flex items-center justify-center transition-transform active:scale-95 ${
                    mode === m.id
                      ? "bg-yellow-400 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[-2px]"
                      : "bg-gray-800 border-gray-600 text-gray-500 hover:bg-gray-700"
                  }`}
                >
                  <m.icon
                    size={20}
                    className={mode === m.id ? "text-black" : "text-gray-400"}
                    strokeWidth={3}
                  />
                </button>
                <span className="text-[10px] font-bold bg-black text-white px-1 uppercase">{m.label}</span>
              </div>
            ))}
          </div>

          {/* CENTER: Sliders (Health Bars) */}
          <div className="flex-grow w-full md:w-auto space-y-3 px-4">
            {/* Speed Slider */}
            <div className="flex items-center gap-2">
              <span className="bg-black text-white text-[10px] px-1 font-bold w-16 text-center">
                VELOCITY
              </span>
              <div className="flex-grow relative h-4 bg-gray-300 border-2 border-black">
                <div
                  className="absolute top-0 left-0 h-full bg-[#E07000]"
                  style={{ width: `${(speed / 3) * 100}%` }}
                ></div>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-xs font-bold">{speed.toFixed(1)}x</span>
            </div>

            {/* Distance Slider */}
            <div className="flex items-center gap-2">
              <span className="bg-black text-white text-[10px] px-1 font-bold w-16 text-center">
                LINK_DIST
              </span>
              <div className="flex-grow relative h-4 bg-gray-300 border-2 border-black">
                <div
                  className="absolute top-0 left-0 h-full bg-[#006000]"
                  style={{ width: `${(connectionDistance / 200) * 100}%` }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={connectionDistance}
                  onChange={(e) => setConnectionDistance(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-xs font-bold">{connectionDistance}</span>
            </div>
          </div>

          {/* RIGHT: Text Input (Narrator Box) */}
          <div className="w-full md:w-64 flex flex-col gap-2">
            <div className="relative group">
              <div className="absolute -top-3 left-2 bg-yellow-400 border-2 border-black px-2 text-[10px] font-bold z-10">
                NARRATIVE INPUT
              </div>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-white border-4 border-black p-3 text-sm font-bold text-black focus:bg-yellow-50 focus:outline-none shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                dir="rtl"
              />
              <MousePointer2
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black opacity-20"
                size={16}
              />
            </div>

            {/* Stats / Toggle */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-600">
                PARTICLES: <span className="text-red-600">{particleCount}</span>
              </span>
              <button
                onClick={() => setShowTrails(!showTrails)}
                className={`text-[10px] font-bold px-2 py-1 border-2 border-black transition-all ${
                  showTrails ? "bg-[#006000] text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                TRAILS: {showTrails ? "ON" : "OFF"}
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={particleCount === 0}
              className={`w-full py-3 border-4 border-black flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-sm font-black uppercase ${
                particleCount > 0
                  ? "bg-emerald-700 text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }`}
            >
              <Save size={20} />
              SAVE ARTWORK
            </button>
          </div>
        </div>
      </div>

      {/* Save Artwork Dialog */}
      <SaveArtworkDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        labModule="advanced-kinetic"
        labCategory="visual"
        content={{
          text: text,
          data: {
            text: text,
            mode: mode,
            particleCount: particleCount,
            connectionDistance: connectionDistance,
            speed: speed,
            showTrails: showTrails,
          },
        }}
        screenshot={canvasToDataURL()}
      />
    </div>
  );
};
