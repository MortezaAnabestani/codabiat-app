import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Microscope,
  Dna,
  Activity,
  Zap,
  RefreshCw,
  Play,
  Trash2,
  Binary,
  Heart,
  Skull,
  Edit3,
  Save,
} from "lucide-react";
import { mutateWords } from "../../../services/geminiService";
import SaveArtworkDialog from "../SaveArtworkDialog";

// --- COMIX ZONE PALETTE ---
const PALETTE = {
  MUTANT_ORANGE: "#E07000",
  SEWER_SLUDGE: "#006000",
  BRUISED_PURPLE: "#500050",
  SKETCH_WHITE: "#FFFFFF",
  INK_BLACK: "#000000",
  NARRATOR_YELLOW: "#FFCC00",
  VOID_DARK: "#1a051a",
};

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
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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

    // 1. Background: The "Paper" Texture inside the panel
    // Instead of clear fade, we use a gritty comic background color
    ctx.fillStyle = PALETTE.BRUISED_PURPLE; // Dark purple background
    ctx.fillRect(0, 0, w, h);

    // Add Halftone pattern effect (simulated with dots)
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    for (let dx = 0; dx < w; dx += 4) {
      for (let dy = 0; dy < h; dy += 4) {
        if ((dx + dy) % 8 === 0) ctx.fillRect(dx, dy, 1, 1);
      }
    }

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
      org.energy -= 0.05;

      // 3. Interactions
      for (let j = i + 1; j < currentOrgs.length; j++) {
        const other = currentOrgs[j];
        const dx = other.x - org.x;
        const dy = other.y - org.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200) {
          const force = semanticGravity * 0.01;
          org.vx += (dx / dist) * force;
          org.vy += (dy / dist) * force;
          other.vx -= (dx / dist) * force;
          other.vy -= (dy / dist) * force;
        }

        if (dist < 40 && !org.isMutating && !other.isMutating && Math.random() < mutationRate * 0.1) {
          handleBreeding(org, other);
        }
      }

      // 4. Drawing (COMIC STYLE)
      ctx.save();
      ctx.translate(org.x, org.y);

      // Shape: Hard Ink Outline instead of Glow
      ctx.beginPath();
      // Rough circle (jittery)
      const jitter = Math.random() * 2;
      ctx.arc(0, 0, org.size * 1.2 + jitter, 0, Math.PI * 2);

      // Fill Color based on energy (16-bit palette)
      if (org.isMutating) {
        ctx.fillStyle = PALETTE.SKETCH_WHITE;
      } else if (org.energy > 50) {
        ctx.fillStyle = PALETTE.MUTANT_ORANGE;
      } else {
        ctx.fillStyle = PALETTE.SEWER_SLUDGE;
      }
      ctx.fill();

      // Thick Ink Border
      ctx.lineWidth = 3;
      ctx.strokeStyle = PALETTE.INK_BLACK;
      ctx.stroke();

      // Text Label (Comic Font Style)
      ctx.fillStyle = PALETTE.INK_BLACK;
      // Using a monospace font to simulate typewriter/pixel font
      ctx.font = `bold ${org.size}px "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // White "Speech Bubble" background for text readability
      const textWidth = ctx.measureText(org.text).width;
      ctx.fillStyle = PALETTE.SKETCH_WHITE;
      ctx.fillRect(-textWidth / 2 - 4, -org.size / 2 - 4, textWidth + 8, org.size + 8);
      ctx.strokeRect(-textWidth / 2 - 4, -org.size / 2 - 4, textWidth + 8, org.size + 8);

      ctx.fillStyle = PALETTE.INK_BLACK;
      ctx.fillText(org.text, 0, 0);

      ctx.restore();
    }

    // Cleanup
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

    spawnOrganism(mutationResult, (parentA.x + parentB.x) / 2, (parentA.y + parentB.y) / 2);

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

  useEffect(() => {
    const seeds = ["ماه", "ستاره", "خاک", "آب", "باد"];
    seeds.forEach((s) => spawnOrganism(s));
  }, []);

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
    // MAIN CONTAINER: The "Artist's Desk" (Void Background)
    <div className="h-full flex flex-col lg:flex-row bg-[#1a1a1a] overflow-hidden font-mono relative">
      {/* SCATTERED PENCILS (DECORATIVE) */}
      <div className="absolute top-[-20px] left-[100px] w-4 h-32 bg-yellow-600 rotate-12 shadow-xl z-0 border-2 border-black"></div>
      <div className="absolute bottom-[-10px] right-[50px] w-64 h-4 bg-red-700 -rotate-6 shadow-xl z-0 border-2 border-black"></div>

      {/* SIDEBAR: The "Script & Inventory" Area */}
      <div className="w-full lg:w-80 p-4 flex flex-col gap-6 z-20 shrink-0 overflow-y-auto custom-scrollbar relative">
        {/* HEADER: Narrator Box Style */}
        <div className="bg-[#FFCC00] border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
          <div className="flex items-center gap-3 border-b-2 border-black pb-2 mb-2">
            <Microscope size={24} className="text-black" />
            <h2 className="text-black font-black text-xl uppercase tracking-tighter">MUTANT LAB</h2>
          </div>
          <p className="text-xs font-bold text-black uppercase">EPISODE 1: GENESIS</p>
        </div>

        {/* CONTROLS: Comic Panel Style */}
        <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
          {/* Mutation Rate Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-black mb-1 uppercase">
              <span className="flex items-center gap-1">
                <Dna size={12} /> MUTATION
              </span>
              <span className="bg-black text-white px-1">{(mutationRate * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={mutationRate}
              onChange={(e) => setMutationRate(Number(e.target.value))}
              className="w-full h-4 bg-gray-300 border-2 border-black appearance-none cursor-pointer accent-[#E07000]"
            />
          </div>

          {/* Gravity Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-black mb-1 uppercase">
              <span className="flex items-center gap-1">
                <Binary size={12} /> GRAVITY
              </span>
              <span className="bg-black text-white px-1">{(semanticGravity * 100).toFixed(0)}ρ</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={semanticGravity}
              onChange={(e) => setSemanticGravity(Number(e.target.value))}
              className="w-full h-4 bg-gray-300 border-2 border-black appearance-none cursor-pointer accent-[#006000]"
            />
          </div>

          {/* Stats Box */}
          <div className="border-2 border-black bg-gray-100 p-2 flex flex-col gap-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-black font-bold">NODES:</span>
              <span className="text-[#E07000] font-black text-lg">{population}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-black font-bold">STATUS:</span>
              <span className="text-[#006000] font-black animate-pulse">LIVE</span>
            </div>
          </div>

          {/* INJECT SEED: Speech Bubble Input */}
          <div className="space-y-2 relative">
            <label className="text-xs font-black text-black uppercase bg-[#FFCC00] px-1 inline-block border border-black">
              NEW WORD
            </label>
            <div className="flex gap-0">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-grow bg-white border-2 border-black p-2 text-sm text-black font-bold outline-none focus:bg-yellow-50 transition-all placeholder:text-gray-400"
                dir="rtl"
                placeholder="کلمه..."
              />
              <button
                onClick={() => {
                  if (inputText) {
                    spawnOrganism(inputText);
                    setInputText("");
                  }
                }}
                className="p-2 bg-[#E07000] border-2 border-l-0 border-black text-black hover:bg-[#FFCC00] transition-colors"
              >
                <Zap size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* INVENTORY SLOTS (Action Buttons) */}
        <div className="mt-auto grid grid-cols-2 gap-4">
          {/* Slot 1: Toggle Sim */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`aspect-square border-4 border-black flex flex-col items-center justify-center gap-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${
              isSimulating ? "bg-[#FFCC00]" : "bg-gray-400"
            }`}
          >
            {isSimulating ? <Trash2 size={24} strokeWidth={3} /> : <Play size={24} strokeWidth={3} />}
            <span className="text-[10px] font-black uppercase bg-black text-white px-1">
              {isSimulating ? "STOP" : "PLAY"}
            </span>
          </button>

          {/* Slot 2: Clear */}
          <button
            onClick={() => {
              orgsRef.current = [];
              setPopulation(0);
            }}
            className="aspect-square bg-[#E07000] border-4 border-black flex flex-col items-center justify-center gap-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all hover:bg-red-500"
          >
            <Skull size={24} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase bg-black text-white px-1">NUKE</span>
          </button>

          {/* Slot 3: Save Artwork */}
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={population === 0}
            className={`col-span-2 aspect-[2/1] border-4 border-black flex flex-col items-center justify-center gap-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
              population > 0
                ? "bg-emerald-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <Save size={24} strokeWidth={3} className={population > 0 ? "text-white" : "text-gray-600"} />
            <span className="text-[10px] font-black uppercase bg-black text-white px-1">SAVE</span>
          </button>
        </div>
      </div>

      {/* MAIN PANEL: The Comic Frame */}
      <div className="flex-grow relative p-6 flex flex-col">
        {/* The "Gutter" (White Space) is handled by padding, 
            The Container below is the actual Panel */}
        <div
          ref={containerRef}
          className="flex-grow relative border-[6px] border-black bg-[#500050] shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* COMIC TEXTURE OVERLAY */}
          <div className="absolute inset-0  opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper.png')]"></div>

          <canvas ref={canvasRef} className="w-full h-full block relative z-10" />

          {/* HUD: Floating Text inside Panel */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <div className="bg-white border-2 border-black px-2 py-1 text-xs font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
              <Activity size={12} className="inline mr-1" />
              STABILITY: 94%
            </div>
            <div className="bg-white border-2 border-black px-2 py-1 text-xs font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
              <Heart size={12} className="inline mr-1 text-red-600 fill-red-600" />
              SYNC: OK
            </div>
          </div>

          {/* EMPTY STATE: Dramatic Text */}
          {population === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-0 ">
              <Edit3 size={60} className="mb-4 text-[#E07000] animate-bounce" strokeWidth={3} />
              <h3 className="font-black text-4xl text-white tracking-tighter drop-shadow-[4px_4px_0px_#000]">
                THE PAGE IS BLANK!
              </h3>
              <div className="bg-white border-2 border-black p-2 mt-2 transform rotate-2">
                <p className="font-mono text-sm font-bold text-black uppercase">
                  Use the inventory to spawn mutants.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Artwork Dialog */}
      <SaveArtworkDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        labModule="bio-synthesis"
        labCategory="visual"
        content={{
          text: `Population: ${population}, Mutation Rate: ${(mutationRate * 100).toFixed(0)}%`,
          data: {
            population: population,
            mutationRate: mutationRate,
            semanticGravity: semanticGravity,
            organisms: orgsRef.current.map((o) => ({
              text: o.text,
              energy: o.energy,
              age: o.age,
            })),
          },
        }}
        screenshot={canvasToDataURL()}
      />
    </div>
  );
};
