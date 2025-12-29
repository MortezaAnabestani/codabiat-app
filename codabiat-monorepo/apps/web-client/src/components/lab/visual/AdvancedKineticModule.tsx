import React, { useState, useEffect, useRef, useCallback } from "react";
import { Wind, Activity, Zap, MousePointer2, RefreshCw, Settings2, Grid, Circle } from "lucide-react";

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
  baseX: number; // For return-to-origin behaviors
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

  // Initialization
  const initParticles = useCallback(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const words = text.split(" ").filter((w) => w.length > 0);
    // If text is short, repeat it to fill screen
    let fillWords = [...words];
    while (fillWords.length < 30) {
      fillWords = [...fillWords, ...words];
    }

    const newParticles: Particle[] = fillWords.map((word, i) => {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        ax: 0,
        ay: 0,
        text: word,
        size: 14 + Math.random() * 20, // Variable font size
        color: `hsl(${Math.random() * 60 + 160}, 100%, 70%)`, // Cyan to Blue range
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

      // Handle Resize
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Fade effect for trails
      ctx.fillStyle = showTrails ? "rgba(5, 5, 5, 0.2)" : "rgba(5, 5, 5, 1)";
      ctx.fillRect(0, 0, width, height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update Physics
      particles.forEach((p, i) => {
        // Mode Behaviors
        if (mode === "fluid") {
          // Repel from mouse
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
          // Gentle wander
          p.ax += (Math.random() - 0.5) * 0.1;
          p.ay += (Math.random() - 0.5) * 0.1;
        } else if (mode === "magnet") {
          // Attract to mouse
          const targetX = mouse.active ? mouse.x : width / 2;
          const targetY = mouse.active ? mouse.y : height / 2;
          const dx = targetX - p.x;
          const dy = targetY - p.y;
          p.ax += dx * 0.0005;
          p.ay += dy * 0.0005;
        } else if (mode === "vortex") {
          // Swirl around center
          const centerX = width / 2;
          const centerY = height / 2;
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Tangent force
          p.ax += -dy * 0.0001 + (centerX - p.x) * 0.0001;
          p.ay += dx * 0.0001 + (centerY - p.y) * 0.0001;
        } else if (mode === "grid") {
          // Return to base
          const k = 0.05; // Spring constant
          const damping = 0.9;
          const ax = (p.baseX - p.x) * k;
          const ay = (p.baseY - p.y) * k;
          p.ax += ax;
          p.ay += ay;

          // Mouse disturbance
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

        // Apply Physics
        p.vx += p.ax;
        p.vy += p.ay;

        // Friction
        p.vx *= mode === "grid" ? 0.9 : 0.96;
        p.vy *= mode === "grid" ? 0.9 : 0.96;

        // Speed Limit
        const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (velocity > 10 * speed) {
          p.vx = (p.vx / velocity) * 10 * speed;
          p.vy = (p.vy / velocity) * 10 * speed;
        }

        p.x += p.vx * speed;
        p.y += p.vy * speed;

        // Reset accel
        p.ax = 0;
        p.ay = 0;

        // Boundaries (Wrap or Bounce)
        if (mode !== "grid") {
          if (p.x < -50) p.x = width + 50;
          if (p.x > width + 50) p.x = -50;
          if (p.y < -50) p.y = height + 50;
          if (p.y > height + 50) p.y = -50;
        }

        // History for trails
        if (showTrails) {
          p.history.push({ x: p.x, y: p.y });
          if (p.history.length > 5) p.history.shift();
        }
      });

      // Draw Connections (Constellation Effect)
      if (connectionDistance > 0 && mode !== "grid") {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0, 255, 255, 0.15)";
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

        // Draw Trail
        if (showTrails && p.history.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.history[0].x, p.history[0].y);
          for (let i = 1; i < p.history.length; i++) {
            ctx.lineTo(p.history[i].x, p.history[i].y);
          }
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw Text
        ctx.translate(p.x, p.y);
        const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const rotation = Math.atan2(p.vy, p.vx);

        // Rotate based on movement if fast
        if (mode === "fluid" && velocity > 2) ctx.rotate(rotation);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, 0.6 + velocity / 10);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = velocity * 2;
        ctx.font = `bold ${p.size}px "Vazirmatn"`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.text, 0, 0);

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

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-[#050505] group">
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-black to-black "></div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full relative z-0 cursor-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <canvas ref={canvasRef} className="block" />

        {/* Custom Cursor */}
        <div
          className=" fixed w-8 h-8 border border-cyan-500 rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-difference z-50 transition-transform duration-75"
          style={{
            left: mouseRef.current.x,
            top: mouseRef.current.y,
            opacity: mouseRef.current.active ? 1 : 0,
          }}
        />
      </div>

      {/* Professional HUD */}
      <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-80 md:bottom-auto md:top-6 z-20 flex flex-col gap-3">
        {/* Main Control Panel */}
        <div className="bg-black/70 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <h3 className="text-cyan-400 font-display text-sm flex items-center gap-2">
              <Wind size={16} /> شعر جنبشی
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
              <span className="font-mono text-[10px] text-gray-500">KINETIC_ENG_V3</span>
            </div>
          </div>

          {/* Mode Selectors */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { id: "fluid", icon: Activity, label: "FLUID" },
              { id: "vortex", icon: RefreshCw, label: "VORTEX" },
              { id: "magnet", icon: Zap, label: "MAGNET" },
              { id: "grid", icon: Grid, label: "ORDER" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as Mode)}
                className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${
                  mode === m.id
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    : "border-white/5 text-gray-500 hover:bg-white/5 hover:text-white"
                }`}
              >
                <m.icon size={14} className="mb-1" />
                <span className="text-[8px] font-mono">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Sliders */}
          <div className="space-y-4 mb-4">
            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                <span className="flex items-center gap-1">
                  <Settings2 size={10} /> VELOCITY
                </span>
                <span>{speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                <span className="flex items-center gap-1">
                  <Circle size={10} /> LINK_DISTANCE
                </span>
                <span>{connectionDistance}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="10"
                value={connectionDistance}
                onChange={(e) => setConnectionDistance(Number(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>

          {/* Text Input */}
          <div className="relative">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-black/40 border border-white/10 p-2 pl-8 text-xs text-cyan-100 rounded focus:border-cyan-500 outline-none transition-colors"
              dir="rtl"
            />
            <div className="absolute left-2 top-2.5 text-gray-500 ">
              <MousePointer2 size={12} />
            </div>
          </div>
        </div>

        {/* Info Bar */}
        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg p-2 flex justify-between items-center px-4">
          <span className="text-[10px] text-gray-500 font-mono">PARTICLES: {particleCount}</span>
          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
              showTrails ? "border-cyan-500 text-cyan-400 bg-cyan-500/10" : "border-gray-700 text-gray-500"
            }`}
          >
            TRAILS: {showTrails ? "ON" : "OFF"}
          </button>
        </div>
      </div>
    </div>
  );
};
