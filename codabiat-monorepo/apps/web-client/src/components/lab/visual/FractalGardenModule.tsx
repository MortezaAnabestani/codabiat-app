import React, { useEffect, useRef, useState } from "react";
import { Wind, Sprout, Leaf, ThermometerSun, Snowflake, CloudRain, Minimize2, Maximize2 } from "lucide-react";

type Season = "spring" | "autumn" | "winter" | "cyber";

interface FallingLeaf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  text: string;
  color: string;
  alpha: number;
}

export const FractalGardenModule: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Instance = useRef<any>(null);

  // --- State & Config ---
  const [verse] = useState("سرو چمان من چرا میل چمن نمی‌کند");
  const [words, setWords] = useState<string[]>([]);
  const [season, setSeason] = useState<Season>("spring");
  const [windForce, setWindForce] = useState(0.5);
  const [branchAngle, setBranchAngle] = useState(25);
  const [complexity, setComplexity] = useState(9); // Recursion depth

  // Ref to access state inside P5 closure
  const stateRef = useRef({ season, windForce, branchAngle, complexity, words });

  useEffect(() => {
    setWords(verse.split(" "));
  }, [verse]);

  useEffect(() => {
    stateRef.current = { season, windForce, branchAngle, complexity, words };
  }, [season, windForce, branchAngle, complexity, words]);

  // --- Palettes ---
  const palettes = {
    spring: { trunk: "#5d4037", leafStart: "#4caf50", leafEnd: "#aeea00", bg: "#051005" },
    autumn: { trunk: "#3e2723", leafStart: "#ff6f00", leafEnd: "#ffca28", bg: "#1a0500" },
    winter: { trunk: "#263238", leafStart: "#80deea", leafEnd: "#ffffff", bg: "#05151a" },
    cyber: { trunk: "#ff00ff", leafStart: "#00ffff", leafEnd: "#39ff14", bg: "#000000" },
  };

  useEffect(() => {
    const p5 = (window as any).p5;
    if (!p5 || !containerRef.current) return;

    const sketch = (p: any) => {
      let t = 0; // Time for noise
      let fallingLeaves: FallingLeaf[] = [];

      p.setup = () => {
        p.createCanvas(containerRef.current?.offsetWidth || 800, containerRef.current?.offsetHeight || 600);
        p.textFont("Vazirmatn");
        p.textAlign(p.CENTER, p.BASELINE);
      };

      p.draw = () => {
        const currentPalette = palettes[stateRef.current.season];

        // Background with trail effect
        p.noStroke();
        p.fill(p.color(currentPalette.bg + "33")); // Hex + alpha
        p.rect(0, 0, p.width, p.height);

        // Calculate Wind using Perlin Noise
        t += 0.005 * stateRef.current.windForce;
        const noiseVal = p.noise(t);
        const windAngle = p.map(noiseVal, 0, 1, -10, 10) * stateRef.current.windForce;

        // Start Tree
        p.push();
        p.translate(p.width / 2, p.height);
        // Initial size
        drawBranch(120, 0, windAngle, currentPalette);
        p.pop();

        // Draw Falling Leaves
        updateFallingLeaves(currentPalette);

        // Randomly spawn a falling leaf
        if (p.random(1) < 0.02 * stateRef.current.windForce) {
          spawnLeaf(currentPalette);
        }

        // Ground
        drawGround(currentPalette);
      };

      const drawBranch = (len: number, level: number, wind: number, palette: any) => {
        const { words, complexity, branchAngle } = stateRef.current;

        // Color Gradient based on level
        const inter = p.map(level, 0, complexity, 0, 1);
        const c = p.lerpColor(p.color(palette.trunk), p.color(palette.leafEnd), inter);

        p.fill(c);
        p.noStroke();

        // Select word based on level
        const word = words[level % words.length] || "●";

        // Text Size scales with branch length
        p.textSize(Math.max(8, len * 0.15));

        // Draw the segment (Text represents the branch)
        p.push();
        p.rotate(p.radians(-90)); // Draw upwards
        p.text(word, 0, -len / 2); // Draw text centered on the branch line
        p.pop();

        // Move to end of branch
        p.translate(0, -len);

        // Recursion
        if (len > 10 && level < complexity) {
          // Wind affects rotation
          const angleRad = p.radians(branchAngle + wind);

          // Right Branch
          p.push();
          p.rotate(angleRad);
          drawBranch(len * 0.7, level + 1, wind * 1.2, palette);
          p.pop();

          // Left Branch
          p.push();
          p.rotate(-angleRad + wind * 0.5); // Asymmetric wind
          drawBranch(len * 0.7, level + 1, wind * 1.2, palette);
          p.pop();

          // Occasional Middle Branch for density
          if (level > 2 && level < 6) {
            p.push();
            p.rotate(wind * 0.2);
            drawBranch(len * 0.6, level + 1, wind, palette);
            p.pop();
          }
        }
      };

      const spawnLeaf = (palette: any) => {
        const w = stateRef.current.words;
        fallingLeaves.push({
          x: p.random(p.width),
          y: -50,
          vx: p.random(-1, 1) + (p.noise(t) - 0.5) * 5, // Wind effect
          vy: p.random(1, 3),
          rotation: p.random(p.TWO_PI),
          rotationSpeed: p.random(-0.1, 0.1),
          text: w[Math.floor(p.random(w.length))],
          color: palette.leafEnd,
          alpha: 255,
        });
      };

      const updateFallingLeaves = (palette: any) => {
        for (let i = fallingLeaves.length - 1; i >= 0; i--) {
          let l = fallingLeaves[i];
          l.x += l.vx;
          l.y += l.vy;
          l.rotation += l.rotationSpeed;
          l.alpha -= 0.5;

          // Wind influence on falling leaves
          l.x += (p.noise(t, l.y * 0.01) - 0.5) * stateRef.current.windForce * 2;

          p.push();
          p.translate(l.x, l.y);
          p.rotate(l.rotation);
          p.fill(p.color(l.color));
          const c = p.color(l.color);
          c.setAlpha(l.alpha);
          p.fill(c);
          p.textSize(12);
          p.text(l.text, 0, 0);
          p.pop();

          if (l.y > p.height || l.alpha <= 0) {
            fallingLeaves.splice(i, 1);
          }
        }
      };

      const drawGround = (palette: any) => {
        // Simple gradient ground
        const c = p.color(palette.trunk);
        c.setAlpha(50);
        p.fill(c);
        p.rect(0, p.height - 20, p.width, 20);

        // Quote
        p.fill(200);
        p.textSize(12);
        p.textAlign(p.LEFT);
        p.text("حافظ: سرو چمان من چرا میل چمن نمی‌کند", 20, p.height - 10);
      };

      p.windowResized = () => {
        if (containerRef.current) {
          p.resizeCanvas(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
        }
      };
    };

    p5Instance.current = new p5(sketch, containerRef.current);

    return () => {
      if (p5Instance.current) p5Instance.current.remove();
    };
  }, []);

  return (
    <div className="h-full flex flex-col relative bg-[#050505] overflow-hidden group">
      <div ref={containerRef} className="w-full h-full cursor-crosshair touch-none" />

      {/* HUD */}
      <div className="absolute top-4 right-4 left-4 md:left-auto md:w-80 z-20 flex flex-col gap-3 ">
        <div className="bg-black/70 backdrop-blur-md border border-lime-500/30 rounded-lg p-4 shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <h3 className="text-lime-400 font-display text-sm flex items-center gap-2">
              <Sprout size={16} /> سرو سخنگو
            </h3>
            <span className="font-mono text-[10px] text-gray-500">HAFEZ_L-SYSTEM_V4</span>
          </div>

          {/* Season Selector */}
          <div className="flex justify-between gap-1 mb-4 bg-black/40 p-1 rounded-lg">
            {[
              { id: "spring", icon: Leaf, color: "text-green-400" },
              { id: "autumn", icon: Wind, color: "text-orange-400" },
              { id: "winter", icon: Snowflake, color: "text-cyan-400" },
              { id: "cyber", icon: Maximize2, color: "text-magenta-400" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSeason(s.id as Season)}
                className={`flex-1 flex items-center justify-center p-2 rounded transition-all ${
                  season === s.id
                    ? "bg-white/10 shadow shadow-white/5 " + s.color
                    : "text-gray-600 hover:text-gray-400"
                }`}
                title={s.id.toUpperCase()}
              >
                <s.icon size={16} />
              </button>
            ))}
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                <span className="flex items-center gap-1">
                  <Wind size={10} /> WIND_FORCE
                </span>
                <span>{(windForce * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={windForce}
                onChange={(e) => setWindForce(Number(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-lime-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                <span className="flex items-center gap-1">
                  <Minimize2 size={10} /> BRANCH_ANGLE
                </span>
                <span>{branchAngle}°</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={branchAngle}
                onChange={(e) => setBranchAngle(Number(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-lime-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                <span className="flex items-center gap-1">
                  <Maximize2 size={10} /> COMPLEXITY
                </span>
                <span>{complexity}</span>
              </div>
              <input
                type="range"
                min="5"
                max="11"
                step="1"
                value={complexity}
                onChange={(e) => setComplexity(Number(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-lime-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
