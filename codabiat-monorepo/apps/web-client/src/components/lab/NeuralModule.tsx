import React, { useState, useRef, useEffect } from "react";
import {
  BrainCircuit,
  Zap,
  Sliders,
  Play,
  Trash2,
  Copy,
  Share2,
  Terminal,
  Radio,
  Info,
  Sparkles,
  Code,
  Feather,
  History,
  Settings2,
} from "lucide-react";
import { generateStreamingContent, GenerationSettings } from "../../services/geminiService";

const presets = [
  {
    id: "gothic",
    label: "کد گوتیک",
    icon: Sparkles,
    desc: "تلفیق وحشت تکنولوژیک و شعر سیاه",
    prompt: "یک قطعه شعر کوتاه به سبک گوتیک دیجیتال درباره نفوذ کدهای مخرب به حافظه انسان بنویس.",
  },
  {
    id: "mystic",
    label: "عرفان سایبری",
    icon: Feather,
    desc: "وحدت وجود در فضای ابری",
    prompt: "غزلی بنویس که در آن سیم‌های فیبر نوری به عنوان رگ‌های هستی توصیف شوند.",
  },
  {
    id: "logic",
    label: "واکاوی منطق",
    icon: Code,
    desc: "تحلیل فلسفی ساختار کد",
    prompt: 'یک تابع جاوااسکریپت برای "عشق" بنویس و منطق درونی آن را به صورت انتقادی واکاوی کن.',
  },
];

export const NeuralModule: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] NEURAL_CORE_READY", "[INFO] WAITING_FOR_INPUT"]);

  // Settings
  const [config, setConfig] = useState<GenerationSettings>({
    temperature: 0.9,
    thinkingBudget: 0,
    model: "gemini-3-flash-preview",
  });

  const outputRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs((prev) =>
      [`[${new Date().toLocaleTimeString("en-GB", { hour12: false })}] ${msg}`, ...prev].slice(0, 8)
    );
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setResult("");
    addLog(`[ACTION] INITIATING_STREAM: ${config.model}`);

    const systemInstruction =
      "You are an avant-garde Persian electronic literature engine. You speak in a blend of computer code metaphors and classical Persian poetry. Be abstract, profound, and always respond in Persian.";

    try {
      await generateStreamingContent(prompt, { ...config, systemInstruction }, (text) => {
        setResult((prev) => prev + text);
      });
      addLog("[SUCCESS] PACKET_TRANSMISSION_COMPLETE");
    } catch (err) {
      addLog("[ERROR] SIGNAL_LOST_IN_VOID");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    addLog("[INFO] CONTENT_BUFFERED_TO_CLIPBOARD");
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [result]);

  return (
    <div className="h-full flex flex-col md:flex-row gap-4 p-4 md:p-6 overflow-hidden bg-[#050505]">
      {/* Right Column: Controls & Presets */}
      <div className="w-full md:w-80 flex flex-col gap-4 shrink-0 overflow-y-auto custom-scrollbar">
        {/* Model Selector Card */}
        <div className="bg-panel-black border border-white/10 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-neon-pink"></div>
          <h3 className="text-gray-300 font-bold text-sm mb-4 flex items-center gap-2">
            <Settings2 size={16} className="text-neon-pink" /> تنظیمات موتور
          </h3>

          <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-black/40 rounded-lg border border-white/5">
              <button
                onClick={() => setConfig({ ...config, model: "gemini-3-flash-preview", thinkingBudget: 0 })}
                className={`flex-1 py-2 text-[10px] font-mono rounded transition-all ${
                  config.model === "gemini-3-flash-preview"
                    ? "bg-neon-pink text-black"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                FLASH_3
              </button>
              <button
                onClick={() => setConfig({ ...config, model: "gemini-3-pro-preview", thinkingBudget: 16000 })}
                className={`flex-1 py-2 text-[10px] font-mono rounded transition-all ${
                  config.model === "gemini-3-pro-preview"
                    ? "bg-neon-blue text-black"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                PRO_3_DEEP
              </button>
            </div>

            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-1">
                <span>TEMPERATURE</span>
                <span>{config.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: Number(e.target.value) })}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-pink"
              />
            </div>

            {config.model === "gemini-3-pro-preview" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between text-[10px] font-mono text-neon-blue mb-1 uppercase">
                  <span>Thinking Budget</span>
                  <span>16K Tokens</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-blue w-1/2 animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Presets Card */}
        <div className="bg-panel-black border border-white/10 p-5 rounded-2xl flex-grow overflow-y-auto">
          <h3 className="text-gray-300 font-bold text-sm mb-4 flex items-center gap-2">
            <History size={16} className="text-neon-blue" /> الگوهای خلاق
          </h3>
          <div className="space-y-2">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setPrompt(p.prompt);
                  addLog(`[LOAD] PRESET_${p.id.toUpperCase()}`);
                }}
                className="w-full text-right p-3 rounded-xl bg-white/5 border border-transparent hover:border-neon-blue/30 hover:bg-neon-blue/5 transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <p.icon size={14} className="text-neon-blue opacity-50 group-hover:opacity-100" />
                  <span className="text-xs font-bold text-white">{p.label}</span>
                </div>
                <p className="text-[9px] text-gray-500 line-clamp-1">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* System Logs */}
        <div className="bg-black/60 border border-white/5 p-4 rounded-xl font-mono">
          <div className="flex items-center gap-2 text-[9px] text-gray-600 mb-2 uppercase tracking-widest">
            <Terminal size={10} /> Live_System_Logs
          </div>
          <div className="space-y-1 overflow-hidden">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`text-[9px] whitespace-nowrap truncate ${
                  log.includes("ERROR")
                    ? "text-red-500"
                    : log.includes("SUCCESS")
                    ? "text-neon-green"
                    : "text-gray-500"
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center Column: Editor & Result */}
      <div className="flex-grow flex flex-col gap-4 overflow-hidden relative">
        {/* Input Area */}
        <div className="bg-panel-black border border-white/10 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4  opacity-20 group-focus-within:opacity-100 transition-opacity">
            <Radio size={40} className={loading ? "text-neon-pink animate-pulse" : "text-gray-500"} />
          </div>
          <label className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">
            Request_Input_Buffer
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 bg-transparent text-white font-sans text-lg outline-none resize-none placeholder:text-gray-700"
            placeholder="توصیف یا شعری را آغاز کنید..."
            dir="rtl"
          />
          <div className="flex justify-between items-center border-t border-white/5 pt-3">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPrompt("");
                  setResult("");
                  addLog("[ACTION] WORKSPACE_PURGED");
                }}
                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                title="پاکسازی"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className={`px-8 py-3 rounded-xl font-bold flex items-center gap-3 transition-all transform active:scale-95
                  ${
                    loading
                      ? "bg-gray-700 cursor-not-allowed text-gray-400"
                      : "bg-neon-pink hover:bg-pink-600 text-black shadow-[0_0_20px_rgba(255,0,255,0.4)]"
                  }
                `}
            >
              {loading ? <Zap size={18} className="animate-spin" /> : <Play size={18} />}
              {loading ? "در حال استخراج..." : "تزریق پالس عصبی"}
            </button>
          </div>
        </div>

        {/* Result Area */}
        <div className="flex-grow bg-panel-black border border-white/10 rounded-3xl relative overflow-hidden flex flex-col shadow-2xl">
          <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${loading ? "bg-neon-green animate-pulse" : "bg-gray-600"}`}
              ></div>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                Neural_Output_Stream
              </span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={copyToClipboard}
                className="text-gray-500 hover:text-white transition-colors"
                title="Copy"
              >
                <Copy size={16} />
              </button>
              <button className="text-gray-500 hover:text-white transition-colors" title="Share">
                <Share2 size={16} />
              </button>
            </div>
          </div>

          <div
            ref={outputRef}
            className="flex-grow p-8 md:p-12 overflow-y-auto custom-scrollbar relative"
            dir="rtl"
          >
            {/* Scanline overlay for aesthetic */}
            <div className="absolute inset-0 bg-scanlines opacity-[0.03]  sticky top-0 h-full"></div>

            {!result && !loading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-800 opacity-50">
                <BrainCircuit size={80} className="mb-6 stroke-[1px]" />
                <p className="font-display text-xl">در انتظار سیگنال ورودی...</p>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-200 text-xl leading-[2.5rem] font-light font-sans text-justify whitespace-pre-wrap">
                  {result}
                  {loading && (
                    <span className="inline-block w-2 h-6 bg-neon-pink mr-2 animate-pulse align-middle"></span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Metadata Footer */}
          <div className="px-6 py-2 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-gray-600">
            <span>ENCODING: UTF-8</span>
            <span>TOKEN_STREAM_ACTIVE</span>
            <span>SYS_STABILITY: 98%</span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-neon-pink/10 rounded-full blur-[100px] "></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-neon-blue/10 rounded-full blur-[100px] "></div>
      </div>
    </div>
  );
};
