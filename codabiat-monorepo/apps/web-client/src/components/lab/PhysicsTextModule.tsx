import React, { useState, useRef, useEffect } from "react";
import { BoxSelect, Move, Anchor, Zap, RefreshCcw, Wind, Magnet } from "lucide-react";

export const PhysicsTextModule: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [inputText, setInputText] = useState("در هیاهوی کلمات سکوت وزن دارد");
  const [gravity, setGravity] = useState(1);
  const [restitution, setRestitution] = useState(0.8);
  const [interactionMode, setInteractionMode] = useState<"drag" | "magnet" | "push">("drag");
  const [wordCount, setWordCount] = useState(0);

  // Physics Refs
  const engineRef = useRef<any>(null);
  const runnerRef = useRef<any>(null);
  const bodiesMapRef = useRef<Map<number, string>>(new Map());
  const requestRef = useRef<number>(0);

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

      // Remove old walls
      const bodies = Composite.allBodies(engine.world);
      const walls = bodies.filter((b: any) => b.isStatic && b.label === "wall");
      Composite.remove(engine.world, walls);

      if (height === 0) return; // Wait for layout

      const wallOptions = {
        isStatic: true,
        label: "wall",
        render: { visible: false },
        friction: 0.5,
        restitution: 0.5,
      };
      const thickness = 200;

      Composite.add(engine.world, [
        Bodies.rectangle(width / 2, -thickness, width, thickness, wallOptions), // Top (far up to allow spawning)
        Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, wallOptions), // Bottom
        Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, wallOptions), // Right
        Bodies.rectangle(-thickness / 2, height / 2, thickness, height, wallOptions), // Left
      ]);
    };

    // Initial boundary set
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

    // Fix scrolling issues
    mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

    // 5. Custom Render Loop
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

      // Handle Resize
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        updateBoundaries();
      }

      // Logic for Interaction Modes
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

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Draw Bodies
      const bodies = Composite.allBodies(engine.world);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      bodies.forEach((body: any) => {
        if (body.label === "wall") return;

        const text = bodiesMapRef.current.get(body.id);
        if (!text) return;

        const { position, angle, velocity } = body;
        const speed = Vector.magnitude(velocity);

        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.rotate(angle);

        const speedFactor = Math.min(speed / 10, 1);
        const r = 251,
          g = 191,
          b = 36;
        const color = `rgba(${r + (255 - r) * speedFactor}, ${g + (255 - g) * speedFactor}, ${
          b + (255 - b) * speedFactor
        }, 1)`;

        ctx.shadowBlur = 10 + speedFactor * 20;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.font = `bold 24px "Vazirmatn"`;

        ctx.fillText(text, 0, 0);

        if (speed > 5) {
          ctx.shadowBlur = 0;
          ctx.strokeStyle = `rgba(255,255,255, ${speedFactor * 0.5})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-velocity.x * 2, -velocity.y * 2);
          ctx.stroke();
        }

        ctx.restore();
      });

      // Draw Mouse Cursor Indicator
      if (interactionMode !== "drag") {
        ctx.beginPath();
        ctx.arc(mouse.position.x, mouse.position.y, 20, 0, 2 * Math.PI);
        ctx.strokeStyle = interactionMode === "magnet" ? "rgba(57, 255, 20, 0.5)" : "rgba(255, 0, 0, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      Runner.stop(runner);
      Engine.clear(engine);
      engineRef.current = null;
    };
  }, []); // Run once on mount

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

  // Handle Interaction Mode Change
  useEffect(() => {
    // Just triggers re-render to update UI, logic is in loop
  }, [interactionMode]);

  const spawnWords = () => {
    const Matter = (window as any).Matter;
    if (!Matter || !engineRef.current || !containerRef.current) return;

    const { Bodies, Composite, Body } = Matter;
    const width = containerRef.current.clientWidth;

    // Measure text context
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.font = 'bold 24px "Vazirmatn"';

    const words = inputText.split(" ").filter((w) => w.trim().length > 0);

    words.forEach((word) => {
      const textWidth = ctx ? ctx.measureText(word).width + 20 : word.length * 15;
      const textHeight = 40; // Slightly taller box for stability

      const x = Math.random() * (width * 0.6) + width * 0.2; // Center spawn
      const y = Math.random() * -200 - 50; // Spawn above visible area

      const body = Bodies.rectangle(x, y, textWidth, textHeight, {
        restitution: restitution,
        friction: 0.1,
        frictionAir: 0.01,
        density: 0.001,
        angle: (Math.random() - 0.5) * 0.5,
        chamfer: { radius: 10 },
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
    <div className="h-full flex flex-col relative overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.05)_1px,transparent_1px)] bg-[size:40px_40px] "></div>

      <div ref={containerRef} className="w-full h-full relative z-0">
        <canvas
          ref={canvasRef}
          className={`w-full h-full block touch-none ${
            interactionMode === "drag" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
          }`}
        />
      </div>

      <div className="absolute top-4 right-4 left-4 md:left-auto md:w-80 z-20 flex flex-col gap-3 ">
        <div className="bg-black/70 backdrop-blur-md border border-amber-500/30 rounded-lg p-4 shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <h3 className="text-amber-400 font-display text-sm flex items-center gap-2">
              <BoxSelect size={16} /> کیمیاگری کلمات
            </h3>
            <span className="font-mono text-[10px] text-gray-500">OBJECTS: {wordCount}</span>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-2 text-xs text-amber-100 rounded focus:border-amber-500 outline-none transition-colors"
              placeholder="متن خود را وارد کنید..."
              dir="rtl"
            />
          </div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={spawnWords}
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold py-2 rounded flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <Zap size={14} /> تزریق کلمات
            </button>
            <button
              onClick={clearWorld}
              className="px-3 bg-red-900/20 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded transition-colors"
            >
              <RefreshCcw size={14} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                <span className="flex items-center gap-1">
                  <Anchor size={10} /> GRAVITY
                </span>
                <span>{gravity.toFixed(1)} G</span>
              </div>
              <input
                type="range"
                min="-1"
                max="2"
                step="0.1"
                value={gravity}
                onChange={(e) => setGravity(Number(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                <span className="flex items-center gap-1">
                  <Wind size={10} /> ELASTICITY
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
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg p-2 flex justify-between pointer-events-auto">
          <button
            onClick={() => setInteractionMode("drag")}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded transition-colors ${
              interactionMode === "drag" ? "bg-amber-500/20 text-amber-400" : "text-gray-500 hover:text-white"
            }`}
          >
            <Move size={16} className="mb-1" />
            <span className="text-[9px] font-mono">DRAG</span>
          </button>
          <div className="w-[1px] bg-white/10 mx-1"></div>
          <button
            onClick={() => setInteractionMode("magnet")}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded transition-colors ${
              interactionMode === "magnet"
                ? "bg-green-500/20 text-green-400"
                : "text-gray-500 hover:text-white"
            }`}
          >
            <Magnet size={16} className="mb-1" />
            <span className="text-[9px] font-mono">ATTRACT</span>
          </button>
          <div className="w-[1px] bg-white/10 mx-1"></div>
          <button
            onClick={() => setInteractionMode("push")}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded transition-colors ${
              interactionMode === "push" ? "bg-red-500/20 text-red-400" : "text-gray-500 hover:text-white"
            }`}
          >
            <Zap size={16} className="mb-1" />
            <span className="text-[9px] font-mono">REPEL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
