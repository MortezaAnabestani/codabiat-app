import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Microscope,
  Dna,
  Activity,
  Zap,
  RefreshCw,
  Wind,
  Sliders,
  Play,
  Trash2,
  Binary,
  Heart,
} from "lucide-react";
import { mutateWords } from "../../../services/geminiService";

interface Organism {
  id: number;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  energy: number;
  age: number;
  hue: number;
  size: number;
  isMutating: boolean;
}

export const BioSynthesisModule: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [organisms, setOrganisms] = useState<Organism[]>([]);
  const [mutationRate, setMutationRate] = useState(0.5);
  const [semanticGravity, setSemanticGravity] = useState(0.5);
  const [population, setPopulation] = useState(0);
  const [isSimulating, setIsSimulating] = useState(true);
  const [inputText, setInputText] = useState("خورشید");

  const requestRef = useRef<number>(0);
  const orgsRef = useRef<Organism[]>([]);
  const mutationQueueRef = useRef<Set<string>>(new Set());

  // --- Initialization ---
  const spawnOrganism = (text: string, x?: number, y?: number) => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const newOrg: Organism = {
      id: Date.now() + Math.random(),
      text: text,
      x: x ?? Math.random() * width,
      y: y ?? Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      energy: 100,
      age: 0,
      hue: Math.random() * 360,
      size: 14 + text.length * 2,
      isMutating: false,
    };
    orgsRef.current.push(newOrg);
  };

  // --- Simulation Loop ---
  const update = useCallback(() => {
    if (!isSimulating || !canvasRef.current || !containerRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    canvasRef.current.width = w;
    canvasRef.current.height = h;

    // Dark background with slight fade for trails
    ctx.fillStyle = "rgba(2, 4, 8, 0.2)";
    ctx.fillRect(0, 0, w, h);

    const currentOrgs = orgsRef.current;

    for (let i = 0; i < currentOrgs.length; i++) {
      const org = currentOrgs[i];

      // 1. Movement & Physics
      org.x += org.vx;
      org.y += org.vy;

      // Bounce off walls
      if (org.x < 0 || org.x > w) org.vx *= -1;
      if (org.y < 0 || org.y > h) org.vy *= -1;

      // 2. Lifecycle
      org.age += 0.1;
      org.energy -= 0.05; // Base metabolism

      // 3. Interactions (Breeding/Mutation)
      for (let j = i + 1; j < currentOrgs.length; j++) {
        const other = currentOrgs[j];
        const dx = other.x - org.x;
        const dy = other.y - org.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Semantic Gravity: Attraction
        if (dist < 200) {
          const force = semanticGravity * 0.01;
          org.vx += (dx / dist) * force;
          org.vy += (dy / dist) * force;
          other.vx -= (dx / dist) * force;
          other.vy -= (dy / dist) * force;
        }

        // Collision -> Potential Mutation
        if (dist < 40 && !org.isMutating && !other.isMutating && Math.random() < mutationRate * 0.1) {
          handleBreeding(org, other);
        }
      }

      // 4. Drawing
      ctx.save();
      ctx.translate(org.x, org.y);

      // Bioluminescent Glow
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, org.size * 1.5);
      gradient.addColorStop(0, `hsla(${org.hue}, 100%, 70%, ${org.energy / 100})`);
      gradient.addColorStop(1, `hsla(${org.hue}, 100%, 50%, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, org.size * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Text Label
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${org.size}px "Vazirmatn"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = `hsla(${org.hue}, 100%, 50%, 1)`;
      ctx.shadowBlur = 10;
      ctx.fillText(org.text, 0, 0);

      ctx.restore();
    }

    // Cleanup dead organisms
    orgsRef.current = currentOrgs.filter((o) => o.energy > 0);
    setPopulation(orgsRef.current.length);

    requestRef.current = requestAnimationFrame(update);
  }, [isSimulating, mutationRate, semanticGravity]);

  const handleBreeding = async (parentA: Organism, parentB: Organism) => {
    parentA.isMutating = true;
    parentB.isMutating = true;

    const pairKey = [parentA.text, parentB.text].sort().join("|");
    if (mutationQueueRef.current.has(pairKey)) return;
    mutationQueueRef.current.add(pairKey);

    const mutationResult = await mutateWords(parentA.text, parentB.text);

    // Spawn offspring
    spawnOrganism(mutationResult, (parentA.x + parentB.x) / 2, (parentA.y + parentB.y) / 2);

    // Energy penalty for breeding
    parentA.energy -= 20;
    parentB.energy -= 20;
    parentA.isMutating = false;
    parentB.isMutating = false;
    mutationQueueRef.current.delete(pairKey);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  // Initial Population
  useEffect(() => {
    const seeds = ["ماه", "ستاره", "خاک", "آب", "باد"];
    seeds.forEach((s) => spawnOrganism(s));
  }, []);

  return (
    <div className="h-full flex flex-col lg:flex-row bg-[#010204] overflow-hidden">
      {/* Control HUD Sidebar */}
      <div className="w-full lg:w-80 p-6 flex flex-col gap-6 border-l border-white/10 z-20 bg-panel-black/90 backdrop-blur-xl shrink-0 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-2 bg-lime-500/20 rounded-lg text-lime-400">
            <Microscope size={24} />
          </div>
          <div>
            <h2 className="text-white font-display text-xl tracking-tight">سنتز زیست-زبانی</h2>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
              Bio_Linguistic_Lab_v1.0
            </p>
          </div>
        </div>

        {/* Simulation Parameters */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-2 uppercase">
              <span className="flex items-center gap-1">
                <Dna size={10} /> Mutation_Rate
              </span>
              <span className="text-lime-400">{(mutationRate * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={mutationRate}
              onChange={(e) => setMutationRate(Number(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-lime-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-2 uppercase">
              <span className="flex items-center gap-1">
                <Binary size={10} /> Semantic_Gravity
              </span>
              <span className="text-blue-400">{(semanticGravity * 100).toFixed(0)}ρ</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={semanticGravity}
              onChange={(e) => setSemanticGravity(Number(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-500">POPULATION_NODES</span>
              <span className="text-xs text-lime-500 font-bold">{population}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-500">CORE_SYNC</span>
              <span className="text-[10px] text-green-500 animate-pulse font-mono">ACTIVE</span>
            </div>
          </div>

          {/* Inject Seed */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-gray-500 uppercase">Inject_Linguistic_Seed</label>
            <div className="flex gap-2">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-grow bg-white/5 border border-white/10 p-2 text-xs text-white rounded outline-none focus:border-lime-500 transition-all"
                dir="rtl"
                placeholder="کلمه پایه..."
              />
              <button
                onClick={() => {
                  if (inputText) {
                    spawnOrganism(inputText);
                    setInputText("");
                  }
                }}
                className="p-2 bg-lime-600 hover:bg-lime-500 text-black rounded transition-all shadow-[0_0_10px_rgba(132,204,22,0.3)]"
              >
                <Zap size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              isSimulating
                ? "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                : "bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20"
            }`}
          >
            {isSimulating ? <Trash2 size={16} /> : <Play size={16} />}
            {isSimulating ? "توقف آزمایش" : "ادامه شبیه‌سازی"}
          </button>
          <button
            onClick={() => {
              orgsRef.current = [];
              setPopulation(0);
            }}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} /> پاکسازی محفظه
          </button>
        </div>
      </div>

      {/* Microscopic Viewport */}
      <div ref={containerRef} className="flex-grow relative overflow-hidden bg-[#000408]">
        {/* Visual Glass Overlay */}
        <div className="absolute inset-0 z-10  border-[40px] border-black opacity-40 rounded-[50%] scale-[1.2]"></div>
        <div className="absolute inset-0 z-10  shadow-[inset_0_0_150px_rgba(0,0,0,1)]"></div>

        {/* Floating Dust Particles */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(0,255,255,0.02)_1px,transparent_1px)] [background-size:30px_30px]"></div>

        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* HUD Overlays */}
        <div className="absolute top-6 left-6  flex flex-col gap-3">
          <div className="bg-black/60 backdrop-blur px-3 py-1 rounded border border-white/10 text-[9px] font-mono text-gray-500 flex items-center gap-2">
            <Activity size={10} className="text-lime-500" />
            ENV_STABILITY: 94%
          </div>
          <div className="bg-black/60 backdrop-blur px-3 py-1 rounded border border-white/10 text-[9px] font-mono text-gray-500 flex items-center gap-2">
            <Heart size={10} className="text-red-500 animate-pulse" />
            ORGANIC_FLOW: SYNCED
          </div>
        </div>

        {/* Intro Instructions */}
        {population === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-20 ">
            <Dna size={80} className="mb-4 stroke-[1px] animate-pulse text-lime-500" />
            <h3 className="font-display text-3xl text-white">در انتظار حیات</h3>
            <p className="font-mono text-xs max-w-sm uppercase tracking-widest">
              Inject linguistic seeds to begin the bio-synthesis evolution process.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
