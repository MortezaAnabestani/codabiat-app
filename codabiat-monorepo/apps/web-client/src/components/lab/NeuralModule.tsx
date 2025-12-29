import React, { useState, useRef, useEffect } from "react";
import {
  Zap,
  Play,
  Trash2,
  Copy,
  Share2,
  Terminal,
  Settings2,
  History,
  Hand,
  Bomb,
  Skull,
  PenTool,
  Save,
  XCircle,
} from "lucide-react";
import { generateStreamingContent, GenerationSettings } from "../../services/geminiService";

// --- COMIX ZONE PALETTE CONSTANTS ---
const COLORS = {
  MUTANT_ORANGE: "#E07000",
  SEWER_SLUDGE: "#006000",
  BRUISED_PURPLE: "#500050",
  NARRATOR_YELLOW: "#FFCC00",
  INK_BLACK: "#000000",
  SKETCH_WHITE: "#FFFFFF",
  VOID_DARK: "#1a1a1a",
};

const presets = [
  {
    id: "gothic",
    label: "کد گوتیک",
    icon: Skull,
    desc: "وحشت تکنولوژیک",
    prompt: "یک قطعه شعر کوتاه به سبک گوتیک دیجیتال درباره نفوذ کدهای مخرب به حافظه انسان بنویس.",
  },
  {
    id: "mystic",
    label: "عرفان سایبری",
    icon: PenTool,
    desc: "وحدت در فضای ابری",
    prompt: "غزلی بنویس که در آن سیم‌های فیبر نوری به عنوان رگ‌های هستی توصیف شوند.",
  },
  {
    id: "logic",
    label: "واکاوی منطق",
    icon: Terminal,
    desc: "فلسفه ساختار کد",
    prompt: 'یک تابع جاوااسکریپت برای "عشق" بنویس و منطق درونی آن را به صورت انتقادی واکاوی کن.',
  },
];

export const NeuralModule: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>(["[SEGA] SYSTEM_READY", "[MORTUS] WAITING_FOR_INK"]);

  // Settings
  const [config, setConfig] = useState<GenerationSettings>({
    temperature: 0.9,
    thinkingBudget: 0,
    model: "gemini-3-flash-preview",
  });

  const outputRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [`> ${msg}`, ...prev].slice(0, 6));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResult("");
    addLog(`DRAWING_PANEL: ${config.model}`);

    const systemInstruction =
      "You are an avant-garde Persian electronic literature engine. You speak in a blend of computer code metaphors and classical Persian poetry. Be abstract, profound, and always respond in Persian.";

    try {
      await generateStreamingContent(prompt, { ...config, systemInstruction }, (text) => {
        setResult((prev) => prev + text);
      });
      addLog("INK_DRYING_COMPLETE");
    } catch (err) {
      addLog("PAGE_TORN_ERROR");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    addLog("COPIED_TO_CLIPBOARD");
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [result]);

  return (
    <div
      className="h-full flex flex-col overflow-hidden font-mono selection:bg-[#E07000] selection:text-black"
      style={{ backgroundColor: COLORS.VOID_DARK }}
    >
      {/* --- HEADER: THE INVENTORY (SEGA STYLE) --- */}
      <div className="shrink-0 h-20 bg-[#111] border-b-4 border-black flex items-center justify-between px-4 relative z-20 shadow-xl">
        {/* Left: Health/Status */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#E07000] border-4 border-black flex items-center justify-center rotate-3 shadow-[4px_4px_0px_#fff]">
            <span className="text-2xl font-black text-black">EP.1</span>
          </div>
          <div className="hidden md:block">
            <div className="h-4 w-32 bg-[#500050] border-2 border-white skew-x-12 relative overflow-hidden">
              <div
                className={`h-full bg-[#006000] transition-all duration-500 ${
                  loading ? "w-full animate-pulse" : "w-2/3"
                }`}
              ></div>
            </div>
            <span className="text-[10px] text-[#E07000] uppercase tracking-widest">Sketch Turner HP</span>
          </div>
        </div>

        {/* Center: Title */}
        <h1
          className="text-2xl md:text-4xl font-black text-white tracking-tighter italic"
          style={{ textShadow: "4px 4px 0px #E07000" }}
        >
          NIGHT OF THE <span className="text-[#E07000]">MUTANTS</span>
        </h1>

        {/* Right: Inventory Slots (Actions) */}
        <div className="flex gap-2">
          {/* Slot 1: Clear (Dynamite) */}
          <button
            onClick={() => {
              setPrompt("");
              setResult("");
              addLog("PAGE_ERASED");
            }}
            className="group relative w-12 h-12 bg-yellow-400 border-4 border-black hover:bg-red-500 transition-colors flex items-center justify-center"
            title="Erase Page"
          >
            <Bomb size={24} className="text-black group-hover:animate-bounce" />
            <span className="absolute -bottom-6 text-[8px] text-white bg-black px-1 opacity-0 group-hover:opacity-100">
              ERASE
            </span>
          </button>

          {/* Slot 2: Generate (Fist) */}
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className={`group relative w-12 h-12 border-4 border-black flex items-center justify-center transition-all active:scale-95
                    ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-[#E07000] hover:bg-white"}`}
            title="Draw Scene"
          >
            {loading ? (
              <Zap className="animate-spin text-white" />
            ) : (
              <Hand className="text-black rotate-45 group-hover:scale-110 transition-transform" />
            )}
            <span className="absolute -bottom-6 text-[8px] text-white bg-black px-1 opacity-0 group-hover:opacity-100">
              ACTION
            </span>
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT: THE COMIC PAGE --- */}
      <div className="flex-grow flex flex-col md:flex-row gap-6 p-6 overflow-hidden relative">
        {/* BACKGROUND DECORATION (Pencils) */}
        <div className="absolute top-10 left-10 w-64 h-2 bg-[#333] -rotate-45 opacity-20  rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-96 h-4 bg-[#222] rotate-12 opacity-30  rounded-full"></div>

        {/* --- LEFT COLUMN: NARRATOR BOXES (Settings) --- */}
        <div className="w-full md:w-72 flex flex-col gap-6 shrink-0 overflow-y-auto custom-scrollbar z-10 pb-10">
          {/* Narrator Box: Settings */}
          <div className="bg-[#FFCC00] border-[3px] border-black shadow-[8px_8px_0px_rgba(0,0,0,0.5)] p-4 relative">
            <div className="absolute -top-3 -left-3 bg-white border-2 border-black px-2 py-0.5 text-xs font-bold rotate-[-2deg]">
              OPTIONS
            </div>

            <div className="space-y-4 mt-2">
              {/* Model Switch */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase text-black">SEGA CHIP:</label>
                <div className="flex border-2 border-black bg-white">
                  <button
                    onClick={() =>
                      setConfig({ ...config, model: "gemini-3-flash-preview", thinkingBudget: 0 })
                    }
                    className={`flex-1 py-1 text-[10px] font-bold transition-colors ${
                      config.model === "gemini-3-flash-preview"
                        ? "bg-black text-white"
                        : "text-black hover:bg-gray-200"
                    }`}
                  >
                    FLASH
                  </button>
                  <button
                    onClick={() =>
                      setConfig({ ...config, model: "gemini-3-pro-preview", thinkingBudget: 16000 })
                    }
                    className={`flex-1 py-1 text-[10px] font-bold transition-colors ${
                      config.model === "gemini-3-pro-preview"
                        ? "bg-[#500050] text-white"
                        : "text-black hover:bg-gray-200"
                    }`}
                  >
                    PRO
                  </button>
                </div>
              </div>

              {/* Temperature Slider */}
              <div>
                <div className="flex justify-between text-[10px] font-bold text-black mb-1">
                  <span>CHAOS:</span>
                  <span>{config.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: Number(e.target.value) })}
                  className="w-full h-4 bg-black appearance-none border-2 border-white cursor-pointer accent-[#E07000]"
                />
              </div>
            </div>
          </div>

          {/* Panel: Presets */}
          <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_rgba(0,0,0,0.5)] p-4 relative rotate-1">
            <div className="absolute -top-3 right-2 bg-[#E07000] border-2 border-black px-2 py-0.5 text-xs font-bold text-white rotate-[2deg]">
              SCENARIOS
            </div>
            <div className="space-y-3 mt-2">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPrompt(p.prompt);
                    addLog(`LOADED: ${p.id.toUpperCase()}`);
                  }}
                  className="w-full text-right p-2 border-2 border-dashed border-gray-400 hover:border-black hover:bg-yellow-50 transition-all group flex items-center gap-2"
                >
                  <div className="bg-black text-white p-1">
                    <p.icon size={12} />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-black uppercase">{p.label}</span>
                    <span className="block text-[9px] text-gray-600">{p.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Debug Log (Sega Cheats Style) */}
          <div className="bg-black border-2 border-[#006000] p-2 font-mono text-[10px] text-[#006000] h-32 overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-[#006000] text-black px-1 text-[8px] font-bold">
              DEBUG_MODE
            </div>
            <div className="mt-4 space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="truncate opacity-80 hover:opacity-100 cursor-default">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: THE DRAWING BOARD --- */}
        <div className="flex-grow flex flex-col gap-6 relative z-10 h-full">
          {/* INPUT PANEL (Rough Sketch) */}
          <div className="bg-white border-[4px] border-black shadow-[10px_10px_0px_#222] p-1 relative group transition-transform focus-within:-translate-y-1">
            {/* Panel Number */}
            <div className="absolute -top-4 -left-2 w-8 h-8 bg-white border-2 border-black flex items-center justify-center font-black text-xl z-10">
              1
            </div>

            <div className="border-2 border-black h-40 p-4 relative overflow-hidden">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-full bg-transparent text-black font-mono text-lg outline-none resize-none placeholder:text-gray-400 z-10 relative"
                placeholder="Write the script here..."
                dir="rtl"
              />
              {/* Grid lines for sketch effect */}
              <div
                className="absolute inset-0  opacity-10"
                style={{
                  backgroundImage:
                    "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              ></div>
            </div>

            {/* Action Bar inside panel */}
            <div className="absolute bottom-2 left-2 flex gap-2 z-20">
              <button onClick={() => setPrompt("")} className="text-gray-400 hover:text-red-600">
                <XCircle size={16} />
              </button>
            </div>
          </div>

          {/* OUTPUT PANEL (Final Ink) */}
          <div className="flex-grow bg-white border-[4px] border-black shadow-[10px_10px_0px_#222] relative flex flex-col overflow-hidden">
            {/* Panel Number */}
            <div className="absolute -top-4 -left-2 w-8 h-8 bg-[#E07000] border-2 border-black flex items-center justify-center font-black text-xl z-20 text-white">
              2
            </div>

            {/* Header */}
            <div className="bg-black text-white px-4 py-1 flex justify-between items-center border-b-4 border-black">
              <span className="text-xs font-bold tracking-widest uppercase">The Story So Far...</span>
              <div className="flex gap-3">
                <button onClick={copyToClipboard} className="hover:text-[#E07000] transition-colors">
                  <Copy size={14} />
                </button>
                <button className="hover:text-[#E07000] transition-colors">
                  <Share2 size={14} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div
              ref={outputRef}
              className="flex-grow p-8 overflow-y-auto custom-scrollbar relative bg-white"
              dir="rtl"
            >
              {/* "POW!" Effect when loading */}
              {loading && !result && (
                <div className="absolute inset-0 flex items-center justify-center z-30 animate-pulse">
                  <div className="relative">
                    <div
                      className="text-6xl font-black text-[#E07000] italic transform -rotate-12"
                      style={{ textShadow: "4px 4px 0px black" }}
                    >
                      DRAWING!
                    </div>
                    {/* Sparkles */}
                    <div className="absolute -top-10 -right-10 text-4xl">✨</div>
                    <div className="absolute -bottom-5 -left-10 text-4xl">💥</div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                  <PenTool size={64} className="mb-4 text-black" />
                  <p className="font-mono text-sm text-black uppercase">Panel is empty.</p>
                </div>
              )}

              {/* The Text (Speech Bubble Style) */}
              {result && (
                <div className="relative">
                  <div className="prose max-w-none font-mono text-lg leading-loose text-black text-justify">
                    {result}
                    {/* The "Mortus Hand" Cursor */}
                    {loading && (
                      <span className="inline-block ml-1 align-middle animate-bounce">
                        <Hand size={24} className="text-black fill-white rotate-180 transform scale-x-[-1]" />
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Metadata */}
            <div className="bg-[#FFCC00] border-t-4 border-black p-2 flex justify-between items-center text-[10px] font-bold text-black uppercase">
              <span>PAGE: 14</span>
              <span>ARTIST: AI_MORTUS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Styles for Scrollbar to match theme */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
          background: #000;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E07000;
          border: 2px solid #000;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #fff;
        }
      `}</style>
    </div>
  );
};
