import React, { useState, useRef, useEffect } from "react";
import {
  FileCode,
  ShieldAlert,
  Search,
  Cpu,
  Fingerprint,
  Binary,
  Activity,
  Zap,
  Terminal,
  AlertTriangle,
  History,
  Eye,
  Scale,
  Share2,
  Download,
  Layers,
} from "lucide-react";
import { generateStreamingContent } from "../../../services/geminiService";

interface AnalysisSection {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const analysisLenses: AnalysisSection[] = [
  { id: "ideology", label: "لایه ایدئولوژیک", icon: Scale, color: "text-emerald-400" },
  { id: "genealogy", label: "تبارشناسی کلام", icon: History, color: "text-blue-400" },
  { id: "power", label: "ساختار قدرت", icon: ShieldAlert, color: "text-red-400" },
  { id: "poetics", label: "زیبایی‌شناسی کد", icon: Eye, color: "text-purple-400" },
];

export const CriticalCodeModule: React.FC = () => {
  const [code, setCode] = useState(`// نمونه کد برای واکاوی
function authenticate(user) {
  if (user.role === "admin") {
    return access_granted();
  }
  return log_and_deny(user.id);
}`);

  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeLens, setActiveLens] = useState<string>("ideology");
  const [scanProgress, setScanProgress] = useState(0);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setAnalysis("");
    setScanProgress(0);

    // Simulate progress for UI feel
    const progInterval = setInterval(() => {
      setScanProgress((prev) => (prev < 90 ? prev + Math.random() * 15 : prev));
    }, 400);

    const prompt = `Analyze this code fragment through the lens of Critical Code Studies (CCS). 
    Focus on: ${activeLens}. 
    Analyze its cultural implications, power dynamics, and underlying metaphors.
    Code:
    ${code}
    Output strictly in sophisticated Persian.`;

    try {
      await generateStreamingContent(prompt, { model: "gemini-3-pro-preview", temperature: 0.8 }, (chunk) => {
        setAnalysis((prev) => prev + chunk);
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
      });
      setScanProgress(100);
    } catch (error) {
      setAnalysis("خطا در برقراری اتصال با هسته تحلیلی...");
    } finally {
      clearInterval(progInterval);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] p-4 md:p-6 overflow-hidden">
      {/* Header Diagnostic Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-emerald-500/20 pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Fingerprint size={28} />
          </div>
          <div>
            <h2 className="text-emerald-400 font-display text-2xl">کنسول واکاوی انتقادی</h2>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              Digital_Archaeology_v9.2 // CCS_FRAMEWORK
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-tighter">
              Diagnostic_Target
            </span>
            <span className="text-xs text-white font-mono">CODE_AS_CULTURE.SCR</span>
          </div>
          <div className="w-[1px] h-8 bg-white/10 mx-2"></div>
          <div className="flex items-center gap-2 bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-500/20 shadow-inner">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isAnalyzing ? "bg-red-500 animate-pulse" : "bg-emerald-500"
              }`}
            ></div>
            <span className="text-[10px] font-mono text-gray-300 uppercase">
              {isAnalyzing ? "Scrutinizing..." : "Core_Idle"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden">
        {/* Input Column: Code Editor */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 overflow-hidden">
          <div className="flex-grow bg-panel-black border border-white/10 rounded-2xl relative overflow-hidden flex flex-col shadow-2xl">
            <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex justify-between items-center text-[10px] font-mono text-gray-500">
              <span className="flex items-center gap-2">
                <FileCode size={12} /> SOURCE_CODE_BUFFER
              </span>
              <span className="text-emerald-500/50">UTF-8 // LANG:JS_CULT</span>
            </div>

            <div className="flex-grow flex relative">
              {/* Line Numbers */}
              <div className="w-12 bg-black/40 border-l border-white/5 flex flex-col items-center pt-4 text-gray-700 font-mono text-xs select-none">
                {Array.from({ length: 15 }).map((_, i) => (
                  <span key={i} className="leading-6">
                    {i + 1}
                  </span>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-grow bg-transparent p-4 text-emerald-100 font-mono text-sm leading-6 outline-none resize-none placeholder:text-gray-800"
                spellCheck={false}
                dir="ltr"
              />
              {isAnalyzing && (
                <div
                  className="absolute top-0 left-0 w-full bg-emerald-500/5 border-y border-emerald-500/20 z-10 transition-all duration-500 "
                  style={{ top: `${scanProgress % 100}%`, height: "2px" }}
                >
                  <div className="absolute right-0 -top-1 bg-emerald-500 text-[8px] px-1 text-black font-bold">
                    SCANNING_DATA
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 bg-black/40 flex justify-between items-center">
              <div className="flex gap-2">
                {analysisLenses.map((lens) => (
                  <button
                    key={lens.id}
                    onClick={() => setActiveLens(lens.id)}
                    className={`p-2 rounded-lg border transition-all ${
                      activeLens === lens.id
                        ? "bg-white/5 " + lens.color + " border-current shadow-lg"
                        : "bg-transparent border-transparent text-gray-500 hover:text-white hover:bg-white/5"
                    }`}
                    title={lens.label}
                  >
                    <lens.icon size={16} />
                  </button>
                ))}
              </div>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={`px-8 py-3 rounded-xl font-bold flex items-center gap-3 transition-all transform active:scale-95
                  ${
                    isAnalyzing
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-black shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                  }
                `}
              >
                {isAnalyzing ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                {isAnalyzing ? "در حال کالبدشکافی..." : "آغاز واکاوی انتقادی"}
              </button>
            </div>
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="bg-panel-black border border-white/5 p-4 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded text-blue-400">
                <Binary size={14} />
              </div>
              <div className="text-[10px] font-mono">
                <p className="text-gray-500 uppercase">Complexity</p>
                <p className="text-white">O(n) - PHILOSOPHICAL</p>
              </div>
            </div>
            <div className="bg-panel-black border border-white/5 p-4 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded text-red-400">
                <AlertTriangle size={14} />
              </div>
              <div className="text-[10px] font-mono">
                <p className="text-gray-500 uppercase">Bias_Leakage</p>
                <p className="text-white">DETECTED (82%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Output Column: Critical Insights */}
        <div className="w-full lg:w-1/2 flex flex-col bg-panel-black border border-white/10 rounded-3xl relative overflow-hidden shadow-inner">
          {/* Visual Decoration */}
          <div className="absolute top-0 right-0 p-8 opacity-5 ">
            <Layers size={200} className="text-emerald-500" />
          </div>

          <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  isAnalyzing ? "bg-red-500 animate-pulse" : "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                }`}
              ></div>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                Analytical_Response_Stream
              </span>
            </div>
            <div className="flex gap-4">
              <button className="text-gray-500 hover:text-white transition-colors">
                <Share2 size={16} />
              </button>
              <button className="text-gray-500 hover:text-white transition-colors">
                <Download size={16} />
              </button>
            </div>
          </div>

          <div
            ref={outputRef}
            className="flex-grow p-8 md:p-12 overflow-y-auto custom-scrollbar relative bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/5 via-transparent to-transparent"
            dir="rtl"
          >
            {!analysis && !isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 group">
                <Search
                  size={80}
                  className="mb-6 stroke-[1px] group-hover:scale-110 transition-transform duration-700"
                />
                <h4 className="font-display text-2xl text-white mb-2">در انتظار ورودی کد</h4>
                <p className="font-mono text-xs max-w-xs leading-relaxed uppercase tracking-tighter">
                  Select a critical lens and inject code to begin the hermeneutic process.
                </p>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-[1px] flex-grow bg-emerald-500/20"></div>
                  <span className="text-[10px] font-mono text-emerald-500/60 uppercase">
                    Critical_Hermeneutics_Protocol
                  </span>
                  <div className="h-[1px] flex-grow bg-emerald-500/20"></div>
                </div>

                <div className="text-gray-200 text-xl leading-[2.8rem] font-light font-sans text-justify whitespace-pre-wrap">
                  {analysis}
                  {isAnalyzing && (
                    <span className="inline-block w-2 h-6 bg-emerald-500 ml-2 animate-pulse align-middle"></span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Diagnostics Footer */}
          <div className="px-6 py-3 bg-black/60 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-gray-600">
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <Activity size={10} /> SYS_SYNC: 100%
              </span>
              <span className="flex items-center gap-1">
                <Terminal size={10} /> LOG_MODE: VERBOSE
              </span>
            </div>
            <span className="text-emerald-500/40">CCS_ENGINE_READY</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Helper for Spin Icon (Lucide doesn't always export all variants)
const RefreshCw = ({ className, size }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);
