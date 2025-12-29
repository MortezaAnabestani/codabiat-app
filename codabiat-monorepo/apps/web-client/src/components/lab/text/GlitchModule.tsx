import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  AlertTriangle,
  Cpu,
  Terminal,
  Activity,
  RefreshCw,
  Layers,
  ShieldAlert,
  Hash,
  Maximize,
  Ghost,
  Sliders,
  Play,
  Trash2,
} from "lucide-react";

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

  // Zalgo / Corruption Logic
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

  return (
    <div className="h-full flex flex-col bg-[#050505] p-4 md:p-6 overflow-hidden select-none">
      {/* Header: System Status */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-neon-green/20 pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neon-green/10 rounded-xl text-neon-green shadow-[0_0_15px_rgba(57,255,20,0.2)]">
            <Zap size={28} className={state.entropy > 7 ? "animate-pulse" : ""} />
          </div>
          <div>
            <h2 className="text-neon-green font-display text-2xl tracking-tighter">موتور تخریب سیگنال</h2>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.3em]">
              Neural_Signal_Interference_v1.0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-lg border border-white/5">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-gray-600 uppercase">Buffer_Health</span>
            <span className={`text-xs font-mono ${state.entropy > 8 ? "text-red-500" : "text-neon-green"}`}>
              {Math.max(0, 100 - state.entropy * 10)}% INTEGRITY
            </span>
          </div>
          <div className="w-[1px] h-8 bg-white/10"></div>
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-neon-green animate-pulse" />
            <span className="text-[10px] font-mono text-gray-400 uppercase">Sync_Active</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden">
        {/* Control Tower */}
        <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 overflow-y-auto custom-scrollbar pr-1">
          <div className="bg-panel-black border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-focus-within:opacity-20 transition-opacity">
              <Terminal size={60} />
            </div>
            <label className="text-[10px] font-mono text-gray-500 mb-2 block uppercase tracking-widest flex items-center gap-2">
              <Hash size={10} /> Source_String_Input
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-lg outline-none focus:border-neon-green transition-all font-sans relative z-10"
              placeholder="پیام خود را تزریق کنید..."
              dir="auto"
            />
          </div>

          <div className="bg-panel-black border border-white/10 p-5 rounded-2xl space-y-6 shadow-inner">
            <h3 className="text-gray-300 font-bold text-xs flex items-center gap-2 border-b border-white/5 pb-3 uppercase tracking-tighter">
              <Sliders size={14} className="text-neon-green" /> Distortion_Parameters
            </h3>

            {/* Entropy Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-gray-500 uppercase">Entropy_Level</span>
                <span className="text-neon-green">{state.entropy * 10}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={state.entropy}
                onChange={(e) => setState({ ...state, entropy: Number(e.target.value) })}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-green"
              />
            </div>

            {/* Clock Speed Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-gray-500 uppercase">Clock_Frequency</span>
                <span className="text-neon-blue">{(state.clockSpeed * 100).toFixed(0)}Hz</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={state.clockSpeed}
                onChange={(e) => setState({ ...state, clockSpeed: Number(e.target.value) })}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-blue"
              />
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "corruption", icon: Ghost, label: "GHOST" },
                { id: "datamosh", icon: Layers, label: "MOSH" },
                { id: "ascii", icon: Cpu, label: "CODE" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setState({ ...state, mode: m.id as any })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    state.mode === m.id
                      ? "bg-neon-green/20 border-neon-green text-neon-green shadow-lg"
                      : "bg-white/5 border-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <m.icon size={18} className="mb-2" />
                  <span className="text-[8px] font-mono font-bold tracking-widest">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setState({ ...state, isBreached: !state.isBreached })}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95
                            ${
                              state.isBreached
                                ? "bg-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.5)] animate-pulse"
                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                            }
                        `}
          >
            {state.isBreached ? <ShieldAlert size={20} /> : <Play size={20} />}
            {state.isBreached ? "BREAK_SYSTEM_CORE" : "TEST_INTEGRITY"}
          </button>
        </div>

        {/* The Reactor (Output Area) */}
        <div className="flex-grow flex flex-col bg-panel-black border border-white/10 rounded-3xl relative overflow-hidden shadow-2xl">
          {/* Visual Decoration / Scanline */}
          <div className="absolute inset-0 bg-scanlines opacity-10  z-10"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-neon-green/30 animate-scan z-20"></div>

          {/* HUD Overlays */}
          <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
            <div className="bg-black/60 backdrop-blur px-3 py-1 rounded border border-neon-green/20 text-[9px] font-mono text-neon-green flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse"></div>
              LIVE_DECODING_ACTIVE
            </div>
            <div className="bg-black/60 backdrop-blur px-3 py-1 rounded border border-white/10 text-[9px] font-mono text-gray-500">
              COORDS: {Math.sin(frame * 0.1).toFixed(4)} / {Math.cos(frame * 0.1).toFixed(4)}
            </div>
          </div>

          <div className="absolute top-6 right-6 z-30 flex gap-2">
            <button className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
              <Maximize size={16} />
            </button>
            <button
              onClick={() => setOutput("")}
              className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Main Render Stage */}
          <div className="flex-grow flex items-center justify-center p-8 md:p-12 relative overflow-hidden">
            {/* Shadow Layers for RGB Split Effect */}
            <div
              className={`text-4xl md:text-6xl lg:text-7xl text-center break-words font-display leading-tight relative transition-all duration-75
                            ${state.isBreached ? "scale-110" : ""}
                        `}
            >
              {/* Blue Layer */}
              <p
                className="absolute inset-0 text-neon-blue mix-blend-screen opacity-50 select-none "
                style={{
                  transform: `translate(${Math.sin(frame * 0.5) * state.shift}px, ${
                    Math.cos(frame * 0.5) * state.shift
                  }px)`,
                }}
              >
                {output}
              </p>
              {/* Red Layer */}
              <p
                className="absolute inset-0 text-red-500 mix-blend-screen opacity-50 select-none "
                style={{
                  transform: `translate(${-Math.sin(frame * 0.5) * state.shift}px, ${
                    -Math.cos(frame * 0.5) * state.shift
                  }px)`,
                }}
              >
                {output}
              </p>
              {/* Main Layer */}
              <p
                className={`text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-75 ${
                  state.isBreached ? "skew-x-12 blur-[1px]" : ""
                }`}
              >
                {output}
              </p>
            </div>
          </div>

          {/* Diagnostics Footer */}
          <div className="px-8 py-4 bg-black/60 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-gray-600 relative z-30">
            <div className="flex gap-6">
              <span className="flex items-center gap-2">
                <RefreshCw size={12} className={state.clockSpeed > 2 ? "animate-spin" : ""} /> REFRESH_RATE:{" "}
                {(1000 / (100 / state.clockSpeed)).toFixed(0)}Hz
              </span>
              <span className="hidden md:flex items-center gap-2">
                <Layers size={12} /> MODE: {state.mode.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-neon-green/40">CORE_STABLE</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-1 h-3 rounded-full ${
                      i <= (10 - state.entropy) / 2 ? "bg-neon-green" : "bg-gray-800"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
