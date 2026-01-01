import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  Activity,
  RefreshCw,
  Layers,
  Hash,
  Maximize,
  Ghost,
  Sliders,
  Play,
  Trash2,
  Skull,
  Hand,
  PenTool,
  XCircle,
  Save,
} from "lucide-react";
import SaveArtworkDialog from "../SaveArtworkDialog";

interface GlitchState {
  entropy: number;
  clockSpeed: number;
  shift: number;
  mode: "corruption" | "datamosh" | "ascii";
  isBreached: boolean;
}

export const GlitchModule: React.FC = () => {
  const [input, setInput] = useState("واقعیت در حال بارگذاری مجدد است");
  const [state, setState] = useState<GlitchState>({
    entropy: 5,
    clockSpeed: 1,
    shift: 2,
    mode: "corruption",
    isBreached: false,
  });
  const [output, setOutput] = useState("");
  const [frame, setFrame] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Zalgo / Corruption Logic (Logic Preserved 100%)
  const zalgoUp = [
    "\u030d",
    "\u030e",
    "\u0304",
    "\u0305",
    "\u033f",
    "\u0311",
    "\u0306",
    "\u0310",
    "\u0352",
    "\u0357",
    "\u0351",
  ];
  const zalgoMid = ["\u0315", "\u031b", "\u0340", "\u0341", "\u0358", "\u0321", "\u0322", "\u0327", "\u0328"];
  const zalgoDown = [
    "\u0316",
    "\u0317",
    "\u0318",
    "\u0319",
    "\u031c",
    "\u031d",
    "\u031e",
    "\u031f",
    "\u0320",
    "\u0324",
    "\u0325",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => f + 1);
      generateGlitch();
    }, 100 / state.clockSpeed);
    return () => clearInterval(interval);
  }, [input, state]);

  const generateGlitch = () => {
    const chars = input.split("");
    const corrupted = chars
      .map((char, idx) => {
        if (char === " ") return " ";

        // Random chance of glitching based on entropy
        if (Math.random() * 10 > 10 - state.entropy) {
          let res = char;

          if (state.mode === "corruption") {
            const amount = Math.floor(state.entropy / 2);
            for (let i = 0; i < amount; i++) {
              res += zalgoUp[Math.floor(Math.random() * zalgoUp.length)];
              res += zalgoMid[Math.floor(Math.random() * zalgoMid.length)];
              res += zalgoDown[Math.floor(Math.random() * zalgoDown.length)];
            }
          } else if (state.mode === "datamosh") {
            const pool = "01<>[]{}-_=+*^%$#@!&";
            res = Math.random() > 0.5 ? pool[Math.floor(Math.random() * pool.length)] : char;
          } else if (state.mode === "ascii") {
            res = char.charCodeAt(0).toString(16);
          }

          return res;
        }
        return char;
      })
      .join("");

    setOutput(corrupted);
  };

  // --- COMIX ZONE STYLES ---
  const colors = {
    mutantOrange: "#E07000",
    sewerSludge: "#006000",
    bruisedPurple: "#2a1a2a", // Darker for background
    sketchWhite: "#FFFFFF",
    inkBlack: "#000000",
    narratorYellow: "#FFCC00",
  };

  return (
    <div
      className="h-full flex flex-col p-4 md:p-6 overflow-hidden select-none font-mono relative"
      style={{ backgroundColor: colors.bruisedPurple }}
    >
      {/* Background Texture: The Artist's Desk */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#500050 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* HEADER: THE INVENTORY (Item Slots) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 shrink-0 z-10">
        {/* Title Card */}
        <div className="flex items-center gap-4 bg-black p-2 border-2 border-white transform -rotate-1 shadow-[4px_4px_0px_#000]">
          <div className="bg-[#E07000] p-2 border border-black">
            <Zap size={24} className="text-black" />
          </div>
          <div>
            <h2
              className="text-white font-black text-xl tracking-widest uppercase"
              style={{ textShadow: "2px 2px 0 #E07000" }}
            >
              MORTUS_ENGINE
            </h2>
            <p className="text-[10px] text-[#FFCC00] uppercase tracking-widest">EPISODE 1: SIGNAL DECAY</p>
          </div>
        </div>

        {/* Inventory Slots (Status) */}
        <div className="flex items-center gap-2">
          {/* Slot 1: Health */}
          <div className="bg-black p-1 border-2 border-gray-600">
            <div className="w-24 h-8 bg-[#003300] relative border border-gray-700">
              <div
                className="h-full bg-[#006000] transition-all duration-300"
                style={{ width: `${Math.max(0, 100 - state.entropy * 10)}%` }}
              ></div>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-bold uppercase drop-shadow-md">
                INTEGRITY
              </span>
            </div>
          </div>

          {/* Slot 2: Sync */}
          <div className="w-10 h-10 bg-yellow-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
            <Activity size={20} className="text-black animate-pulse" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-grow overflow-hidden z-10">
        {/* LEFT COLUMN: CONTROLS (The Sketchpad) */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 overflow-y-auto custom-scrollbar pr-2">
          {/* Input Box: Narrator Box Style */}
          <div className="bg-[#FFCC00] border-4 border-black p-4 shadow-[8px_8px_0px_rgba(0,0,0,0.5)] relative group transform rotate-1">
            <div className="absolute -top-3 -left-3 bg-white border-2 border-black px-2 py-1 text-[10px] font-bold uppercase transform -rotate-3">
              <Hash size={10} className="inline mr-1" /> DIALOGUE_INPUT
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-white/50 border-2 border-black/20 p-2 text-black text-sm font-bold outline-none focus:bg-white focus:border-black transition-all resize-none h-24 placeholder-black/40"
              placeholder="WRITE YOUR DESTINY..."
              dir="auto"
            />
            <PenTool size={16} className="absolute bottom-2 right-2 text-black opacity-20" />
          </div>

          {/* Sliders Panel: Tech Panel Style */}
          <div className="bg-gray-900 border-4 border-gray-600 p-5 space-y-6 shadow-lg relative">
            {/* Screws */}
            <div className="absolute top-1 left-1 w-2 h-2 bg-gray-500 rounded-full border border-black"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-gray-500 rounded-full border border-black"></div>
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-gray-500 rounded-full border border-black"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-gray-500 rounded-full border border-black"></div>

            <h3 className="text-[#E07000] font-black text-xs flex items-center gap-2 border-b-2 border-gray-700 pb-2 uppercase">
              <Sliders size={14} /> MUTATION_PARAMS
            </h3>

            {/* Entropy (Chaos) */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                <span>CHAOS_LEVEL</span>
                <span className="text-[#E07000]">{state.entropy * 10}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={state.entropy}
                onChange={(e) => setState({ ...state, entropy: Number(e.target.value) })}
                className="w-full h-4 bg-black border border-gray-600 appearance-none cursor-pointer accent-[#E07000]"
                style={{
                  backgroundImage: "linear-gradient(90deg, #000 50%, transparent 50%)",
                  backgroundSize: "4px 100%",
                }}
              />
            </div>

            {/* Clock Speed (Ink Flow) */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                <span>INK_FLOW</span>
                <span className="text-blue-400">{(state.clockSpeed * 100).toFixed(0)}Hz</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={state.clockSpeed}
                onChange={(e) => setState({ ...state, clockSpeed: Number(e.target.value) })}
                className="w-full h-4 bg-black border border-gray-600 appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Mode Selector (Action Buttons) */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "corruption", icon: Skull, label: "ROT" },
                { id: "datamosh", icon: Layers, label: "SMASH" },
                { id: "ascii", icon: Hash, label: "CODE" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setState({ ...state, mode: m.id as any })}
                  className={`flex flex-col items-center justify-center p-2 border-2 transition-all ${
                    state.mode === m.id
                      ? "bg-[#E07000] border-white text-black shadow-[2px_2px_0px_#FFF]"
                      : "bg-black border-gray-700 text-gray-500 hover:border-gray-500"
                  }`}
                >
                  <m.icon size={16} className="mb-1" />
                  <span className="text-[8px] font-bold tracking-widest">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* The Big Red Button */}
          <button
            onClick={() => setState({ ...state, isBreached: !state.isBreached })}
            className={`w-full py-4 font-black text-sm uppercase border-4 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-3 transition-all active:translate-y-1 active:shadow-none
                            ${
                              state.isBreached
                                ? "bg-red-600 text-white animate-pulse"
                                : "bg-white text-black hover:bg-gray-200"
                            }
                        `}
          >
            {state.isBreached ? <XCircle size={20} /> : <Play size={20} />}
            {state.isBreached ? "SYSTEM_CRITICAL!" : "INITIATE_SEQUENCE"}
          </button>

          {/* Save Artwork Button */}
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={!output}
            className={`w-full py-4 font-black text-sm uppercase border-4 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-3 transition-all
                        ${
                          output
                            ? "bg-[#006000] text-white hover:bg-[#007000] active:translate-y-1 active:shadow-none"
                            : "bg-gray-400 text-gray-600 cursor-not-allowed"
                        }
                    `}
          >
            <Save size={20} />
            SAVE_ARTWORK
          </button>
        </div>

        {/* RIGHT COLUMN: THE COMIC PANEL (Output) */}
        <div className="flex-grow flex flex-col relative">
          {/* "POW!" Effect behind the panel */}
          <div
            className="absolute -top-6 -right-6 text-[#E07000] font-black text-6xl opacity-20 rotate-12 select-none z-0 pointer-events-none"
            style={{ textShadow: "4px 4px 0 #000" }}
          >
            ZAP!
          </div>

          {/* The Panel Container */}
          <div
            className="flex-grow bg-white border-4 border-black relative overflow-hidden shadow-[10px_10px_0px_rgba(0,0,0,0.3)] z-10"
            style={{ clipPath: "polygon(0% 0%, 100% 1%, 99% 99%, 1% 100%)" }}
          >
            {" "}
            {/* Slight distortion */}
            {/* Panel Header/Caption */}
            <div className="absolute top-0 left-0 bg-[#FFCC00] border-b-2 border-r-2 border-black px-4 py-1 z-30">
              <span className="text-[10px] font-black text-black uppercase tracking-widest">
                PANEL 1: THE REVELATION
              </span>
            </div>
            {/* Action Buttons (Top Right) */}
            <div className="absolute top-4 right-4 z-30 flex gap-2">
              <button className="p-1 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors">
                <Maximize size={14} />
              </button>
              <button
                onClick={() => setOutput("")}
                className="p-1 bg-white border-2 border-black hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {/* Main Content Area */}
            <div className="absolute inset-0 flex items-center justify-center p-12">
              {/* The "Mortus Hand" Cursor Effect */}
              <div
                className="absolute z-20 pointer-events-none transition-all duration-100"
                style={{
                  left: `${50 + Math.sin(frame * 0.1) * 20}%`,
                  top: `${50 + Math.cos(frame * 0.1) * 20}%`,
                }}
              >
                <Hand
                  size={64}
                  className="text-black drop-shadow-xl fill-white transform -rotate-12 opacity-50"
                  strokeWidth={1.5}
                />
              </div>

              {/* Text Rendering */}
              <div
                className={`text-4xl md:text-6xl lg:text-7xl text-center break-words font-black leading-tight relative transition-all duration-75
                                    ${state.isBreached ? "scale-110 rotate-2" : ""}
                                `}
              >
                {/* CMYK Misalignment Effect (Cyan) */}
                <p
                  className="absolute inset-0 text-cyan-500 mix-blend-multiply opacity-70 select-none"
                  style={{
                    transform: `translate(${Math.sin(frame * 0.5) * state.shift}px, ${
                      Math.cos(frame * 0.5) * state.shift
                    }px)`,
                  }}
                >
                  {output}
                </p>
                {/* CMYK Misalignment Effect (Magenta) */}
                <p
                  className="absolute inset-0 text-magenta-500 mix-blend-multiply opacity-70 select-none"
                  style={{
                    transform: `translate(${-Math.sin(frame * 0.5) * state.shift}px, ${
                      -Math.cos(frame * 0.5) * state.shift
                    }px)`,
                    color: "#FF00FF",
                  }}
                >
                  {output}
                </p>

                {/* Main Ink Layer */}
                <p className="text-black relative z-10">{output}</p>
              </div>
            </div>
            {/* Footer / Gutter Info */}
            <div className="absolute bottom-0 left-0 w-full bg-white border-t-2 border-black p-2 flex justify-between items-center">
              <div className="flex items-center gap-4 text-[9px] font-bold uppercase text-gray-500">
                <span className="flex items-center gap-1">
                  <RefreshCw size={10} className={state.clockSpeed > 2 ? "animate-spin" : ""} />
                  FPS: {(1000 / (100 / state.clockSpeed)).toFixed(0)}
                </span>
                <span className="flex items-center gap-1">
                  <Layers size={10} /> STYLE: {state.mode}
                </span>
              </div>

              {/* Page Number */}
              <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-black">
                {frame % 99}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Artwork Dialog */}
      <SaveArtworkDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        labModule="glitch"
        labCategory="text"
        content={{
          text: output,
          html: `<div style="font-size: 4rem; font-weight: 900; text-align: center;">${output}</div>`,
          data: {
            input,
            settings: state,
            mode: state.mode,
            entropy: state.entropy,
          },
        }}
      />
    </div>
  );
};
