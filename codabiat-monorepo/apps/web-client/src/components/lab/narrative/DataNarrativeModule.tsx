import React, { useState, useEffect, useRef } from "react";
import { generateDataStory, fetchGanjoorVerse } from "../../../services/geminiService";
import {
  Database,
  Activity,
  RefreshCw,
  Wifi,
  Thermometer,
  TrendingUp,
  Radio,
  Binary,
  Sliders,
  Zap,
  Share2,
  Download,
  Terminal,
  Feather,
  Link2,
  Skull, // Added for "Mutant" theme
  Hand, // Added for "Mortus Hand" metaphor
  Edit3, // Added for "Artist" metaphor
  Save, // Added for Save functionality
} from "lucide-react";
import SaveArtworkDialog from "../SaveArtworkDialog";

// --- Types ---
interface DataChannel {
  id: string;
  label: string;
  icon: React.ElementType;
  value: number;
  type: "env" | "fin" | "soc" | "sys";
  color: string;
}

// --- COMIX ZONE PALETTE ---
const COMIX_COLORS = {
  orange: "#E07000", // Mutant Orange
  green: "#006000", // Sewer Sludge
  purple: "#500050", // Bruised Purple
  white: "#FFFFFF", // Sketch White
  black: "#000000", // Ink Black
  yellow: "#FFCC00", // Narrator Box
};

// --- Professional Radar Visualization (SEGA STYLE) ---
const NeuralRadar: React.FC<{ data: DataChannel[] }> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.4;

      // Clear with "Paper" texture feel (slightly off-white/transparent)
      ctx.clearRect(0, 0, w, h);

      // Grid - Rough Ink Lines
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]); // Sketchy dash
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        // Slightly distorted circles for hand-drawn feel
        ctx.arc(cx, cy, (radius / 4) * i, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Axis Lines
      data.forEach((_, i) => {
        const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        ctx.stroke();
      });

      // Data Shape - The "Mutant" Blob
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = COMIX_COLORS.orange; // Mutant Orange Outline
      ctx.fillStyle = "rgba(80, 0, 80, 0.6)"; // Bruised Purple Fill

      data.forEach((ch, i) => {
        const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2;
        const val = (ch.value / 100) * radius;
        const x = cx + Math.cos(angle) * val;
        const y = cy + Math.sin(angle) * val;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Points & Labels
      data.forEach((ch, i) => {
        const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2;
        const val = (ch.value / 100) * radius;
        const x = cx + Math.cos(angle) * val;
        const y = cy + Math.sin(angle) * val;

        // Pixelated Points
        ctx.fillStyle = COMIX_COLORS.black;
        ctx.fillRect(x - 4, y - 4, 8, 8); // Square pixels

        ctx.fillStyle = ch.color === "#ef4444" ? COMIX_COLORS.orange : ch.color; // Override red with orange
        ctx.fillRect(x - 2, y - 2, 4, 4);

        // Label - Comic Font Style
        ctx.fillStyle = COMIX_COLORS.black;
        ctx.font = "bold 10px monospace";
        const lx = cx + Math.cos(angle) * (radius + 30);
        const ly = cy + Math.sin(angle) * (radius + 30);
        ctx.textAlign = "center";
        ctx.fillText(ch.id.toUpperCase(), lx, ly);
      });

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [data]);

  return (
    <div className="relative w-full aspect-square max-w-[300px] mx-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden transform -rotate-1">
      <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" />
      {/* Halftone Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[length:4px_4px] "></div>
      <div className="absolute top-0 left-0 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 border-b-2 border-r-2 border-black">
        RADAR_VDP
      </div>
    </div>
  );
};

export const DataNarrativeModule: React.FC = () => {
  const [channels, setChannels] = useState<DataChannel[]>([
    { id: "temp", label: "دمای اقلیمی", icon: Thermometer, value: 38, type: "env", color: "#ef4444" },
    { id: "volat", label: "تلاطم بازار", icon: TrendingUp, value: 72, type: "fin", color: "#eab308" },
    { id: "pulse", label: "تپش شبکه", icon: Wifi, value: 45, type: "soc", color: "#3b82f6" },
    { id: "entro", label: "آنتروپی سیستم", icon: Binary, color: "#a855f7", value: 20, type: "sys" },
  ]);

  const [entropyLevel, setEntropyLevel] = useState(50);
  const [ganjoorActive, setGanjoorActive] = useState(false);
  const [synthesisLogs, setSynthesisLogs] = useState<string[]>([]);
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchedVerse, setFetchedVerse] = useState<{ verse: string; poet: string } | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const addLog = (msg: string) => {
    setSynthesisLogs((prev) => [`> ${msg}`, ...prev].slice(0, 8));
  };

  const updateChannel = (id: string, val: number) => {
    setChannels((prev) => prev.map((ch) => (ch.id === id ? { ...ch, value: val } : ch)));
  };

  const handleSynthesis = async () => {
    setLoading(true);
    setStory("");
    setSynthesisLogs([]);

    addLog("MORTUS_ENGINE_START...");
    addLog("INK_LEVELS_CHECK...");

    const dataPayload = {
      sensors: channels.reduce((acc: any, ch) => {
        acc[ch.id] = { value: ch.value, status: ch.value > 80 ? "CRITICAL" : "STABLE" };
        return acc;
      }, {}),
      config: { entropy: entropyLevel / 100, mode: "Digital_Mysticism" },
    };

    if (ganjoorActive) {
      addLog("SUMMONING_ANCIENT_TEXT...");
      const res = await fetchGanjoorVerse();
      if (res.status === "success") {
        setFetchedVerse({ verse: res.verse, poet: res.poet });
        (dataPayload as any).ancient_anchor = res.verse;
        addLog("SCROLL_FOUND: " + res.poet);
      }
    }

    addLog("DRAWING_PANELS...");
    addLog("INKING_OUTLINES...");

    const result = await generateDataStory(JSON.stringify(dataPayload));
    setStory(result);
    addLog("PAGE_COMPLETE");
    setLoading(false);
  };

  return (
    // THE VOID (Artist's Desk Background)
    <div className="h-full flex flex-col bg-[#202020] p-4 md:p-6 overflow-hidden font-mono relative">
      {/* Background Texture: Scattered Pencils/Erasers (Abstracted via CSS gradients) */}
      <div
        className="absolute inset-0 opacity-10 "
        style={{
          backgroundImage: "radial-gradient(#505050 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* HEADER: INVENTORY SLOTS (Sega Style) */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8 shrink-0 z-10">
        <div className="flex items-center gap-4">
          {/* Logo / Title Panel */}
          <div className="bg-yellow-400 border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
            <h2 className="text-black font-black text-2xl tracking-tighter uppercase italic">
              COMIX<span className="text-[#E07000]">MAKER</span>
            </h2>
            <p className="text-[10px] font-bold text-black uppercase tracking-widest text-center border-t-2 border-black mt-1 pt-1">
              EPISODE 1: DATA
            </p>
          </div>
        </div>

        {/* Inventory Slots */}
        <div className="flex gap-2">
          {[
            { icon: Database, label: "SAVE" },
            { icon: Radio, label: "LIVE" },
            { icon: Skull, label: "BOSS" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="group relative w-12 h-12 bg-black border-2 border-gray-600 flex items-center justify-center hover:border-yellow-400 transition-colors cursor-pointer"
            >
              <div className="absolute top-0 left-0 w-1 h-1 bg-white opacity-50"></div>
              <item.icon className="text-yellow-400 group-hover:text-white" size={20} />
              <span className="absolute -bottom-6 text-[8px] text-yellow-400 font-bold opacity-0 group-hover:opacity-100 bg-black px-1">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-grow overflow-hidden z-10">
        {/* LEFT PANEL: CONTROL DECK (The Sketchpad) */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 overflow-y-auto custom-scrollbar pr-2 pb-10">
          {/* Sliders Container */}
          <div className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_#500050] relative">
            <div className="absolute -top-3 -left-3 bg-[#E07000] text-white px-2 py-1 text-xs font-bold border-2 border-black transform -rotate-3">
              PARAMETERS
            </div>

            <div className="space-y-6 mt-4">
              {channels.map((ch) => (
                <div key={ch.id} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="flex items-center gap-2">
                      <ch.icon size={12} className="text-black" /> {ch.label}
                    </span>
                    <span className="bg-black text-white px-1">{ch.value}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ch.value}
                    onChange={(e) => updateChannel(ch.id, Number(e.target.value))}
                    className="w-full h-4 bg-gray-300 appearance-none border-2 border-black cursor-pointer"
                    style={{
                      accentColor: COMIX_COLORS.orange,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Entropy Slider */}
            <div className="mt-6 pt-4 border-t-4 border-black border-dashed">
              <div className="flex justify-between text-[10px] font-bold mb-2 uppercase text-[#500050]">
                <span>CHAOS LEVEL</span>
                <span>{entropyLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={entropyLevel}
                onChange={(e) => setEntropyLevel(Number(e.target.value))}
                className="w-full h-4 bg-gray-300 appearance-none border-2 border-black cursor-pointer accent-purple-700"
              />
            </div>
          </div>

          {/* Ganjoor Switch (The Lever) */}
          <div className="bg-[#006000] border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-black text-xs uppercase flex items-center gap-2">
                <Feather size={16} /> ANCIENT SCROLL
              </h3>
              <button
                onClick={() => setGanjoorActive(!ganjoorActive)}
                className={`w-12 h-6 border-2 border-black relative transition-all ${
                  ganjoorActive ? "bg-yellow-400" : "bg-gray-700"
                }`}
              >
                <div
                  className={`absolute top-0 bottom-0 w-6 border-r-2 border-black bg-white transition-all flex items-center justify-center ${
                    ganjoorActive ? "left-6 border-l-2 border-r-0" : "left-0"
                  }`}
                >
                  <div className="w-1 h-4 bg-gray-300 border border-gray-400"></div>
                </div>
              </button>
            </div>
          </div>

          {/* ACTION BUTTON (The Fist) */}
          <button
            onClick={handleSynthesis}
            disabled={loading}
            className="group relative w-full py-4 bg-[#E07000] border-4 border-black font-black text-white text-xl uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-20"></div>
            <span className="relative z-10 flex items-center justify-center gap-3">
              {loading ? <RefreshCw size={24} className="animate-spin" /> : <Zap size={24} fill="white" />}
              {loading ? "DRAWING..." : "GENERATE"}
            </span>
            {/* Hover Effect: Sketch Turner's Fist */}
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:left-4 transition-all duration-300">
              <Hand size={24} className="transform rotate-90" />
            </div>
          </button>

          {/* SAVE BUTTON */}
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={!story}
            className={`w-full py-4 font-black text-sm uppercase border-4 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-3 transition-all ${
              story
                ? "bg-[#006000] text-white hover:bg-[#007000] active:translate-y-1 active:shadow-none"
                : "bg-gray-400 text-gray-600 cursor-not-allowed"
            }`}
          >
            <Save size={20} />
            SAVE ARTWORK
          </button>
        </div>

        {/* CENTER PANEL: THE COMIC PAGE */}
        <div className="flex-grow flex flex-col gap-6 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full overflow-hidden">
            {/* LEFT COLUMN: VISUALS & LOGS */}
            <div className="flex flex-col gap-6">
              <NeuralRadar data={channels} />

              {/* LOGS: NARRATOR BOX */}
              <div className="bg-[#FFCC00] border-4 border-black flex-grow p-4 relative overflow-hidden flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
                <div className="text-xs font-black text-black uppercase tracking-widest mb-2 border-b-2 border-black pb-1 flex items-center gap-2">
                  <Terminal size={14} /> NARRATOR_LOGS
                </div>
                <div className="flex-grow font-mono text-[11px] space-y-2 overflow-y-auto custom-scrollbar">
                  {synthesisLogs.map((log, i) => (
                    <div key={i} className="flex gap-2 text-black font-bold">
                      <span>{log}</span>
                    </div>
                  ))}
                  {synthesisLogs.length === 0 && (
                    <div className="text-black/50 italic uppercase font-bold mt-4 text-center">
                      Waiting for input...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: THE STORY PANEL (Speech Bubble Style) */}
            <div className="relative flex flex-col h-full">
              {/* Page Tear Effect Top */}
              <div
                className="h-4 bg-white w-full"
                style={{
                  clipPath:
                    "polygon(0 100%, 5% 0, 10% 100%, 15% 0, 20% 100%, 25% 0, 30% 100%, 35% 0, 40% 100%, 45% 0, 50% 100%, 55% 0, 60% 100%, 65% 0, 70% 100%, 75% 0, 80% 100%, 85% 0, 90% 100%, 95% 0, 100% 100%)",
                }}
              ></div>

              <div
                className="bg-white border-x-4 border-b-4 border-black flex-grow p-6 md:p-8 overflow-y-auto custom-scrollbar relative shadow-[10px_10px_0px_0px_#202020]"
                dir="rtl"
              >
                {/* Header Actions */}
                <div className="absolute top-4 left-4 flex gap-2 z-20">
                  <button className="p-1 hover:bg-gray-200 border-2 border-transparent hover:border-black rounded">
                    <Share2 size={16} />
                  </button>
                  <button className="p-1 hover:bg-gray-200 border-2 border-transparent hover:border-black rounded">
                    <Download size={16} />
                  </button>
                </div>

                {!story && !loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <Edit3 size={80} className="mb-4 text-gray-400" />
                    <p className="font-black text-xl uppercase text-gray-500">PANEL EMPTY</p>
                    <p className="text-xs font-bold text-gray-400">WAITING FOR ARTIST...</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* GANJOOR BOX (Caption Box) */}
                    {ganjoorActive && fetchedVerse && (
                      <div className="mb-8 bg-[#006000] p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transform rotate-1">
                        <div className="flex justify-between items-start">
                          <Feather className="text-white opacity-50 mb-2" size={20} />
                          <span className="bg-black text-white text-[9px] px-1 font-bold uppercase">
                            ANCIENT DATA
                          </span>
                        </div>
                        <p className="text-white font-bold text-lg leading-relaxed text-center font-serif">
                          "{fetchedVerse.verse}"
                        </p>
                        <p className="text-green-200 text-[10px] font-black uppercase text-left mt-2">
                          — {fetchedVerse.poet}
                        </p>
                      </div>
                    )}

                    {/* MAIN STORY (Speech Bubble Logic) */}
                    <div className="relative bg-white p-6 border-4 border-black rounded-[2rem] rounded-tr-none shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
                      {/* Speech Bubble Tail */}
                      <div className="absolute -top-6 right-10 w-0 h-0 border-l-[20px] border-l-transparent border-r-[0px] border-r-transparent border-b-[30px] border-b-black"></div>
                      <div className="absolute -top-[18px] right-[44px] w-0 h-0 border-l-[14px] border-l-transparent border-r-[0px] border-r-transparent border-b-[24px] border-b-white"></div>

                      {/* THE MORTUS HAND REVEAL EFFECT */}
                      <div className={`relative ${loading ? "opacity-50" : "opacity-100"}`}>
                        <p className="text-black text-lg md:text-xl leading-[2.2rem] font-bold text-justify whitespace-pre-wrap font-mono">
                          {story}
                        </p>

                        {/* The "Hand" Mask Animation */}
                        {loading && (
                          <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
                            <div className="flex flex-col items-center">
                              <Hand size={48} className="animate-bounce text-black mb-2" />
                              <span className="font-black text-xs animate-pulse">INKING...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* METRICS FOOTER (Comic Stats) */}
                    {story && (
                      <div className="mt-12 pt-6 border-t-4 border-black border-dotted grid grid-cols-3 gap-2">
                        {[
                          { label: "COHERENCE", val: 92, col: "bg-[#E07000]" },
                          { label: "DRAMA", val: 84, col: "bg-[#500050]" },
                          { label: "IMPACT", val: 76, col: "bg-[#006000]" },
                        ].map((m, i) => (
                          <div key={i} className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-black uppercase">{m.label}</span>
                            <div className="h-3 border-2 border-black bg-white relative">
                              <div
                                className={`h-full ${m.col} absolute top-0 left-0`}
                                style={{ width: `${m.val}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Page Curl Bottom Right */}
              <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-gray-400 to-white border-l-2 border-t-2 border-black shadow-[-4px_-4px_5px_rgba(0,0,0,0.2)] rounded-tl-3xl z-30"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Artwork Dialog */}
      <SaveArtworkDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        labModule="data-narrative"
        labCategory="narrative"
        content={{
          text: story,
          html: `<div class="data-narrative-story">${story}</div>`,
          data: {
            dataset: channels.reduce((acc: any, ch) => {
              acc[ch.id] = { value: ch.value, label: ch.label };
              return acc;
            }, {}),
            narrative: story,
            visualizations: {
              radarData: channels.map((ch) => ({ id: ch.id, value: ch.value, type: ch.type })),
              entropyLevel,
              ganjoorVerse: fetchedVerse,
            },
          },
        }}
      />
    </div>
  );
};
