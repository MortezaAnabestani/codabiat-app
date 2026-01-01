import React, { useState, useRef, useEffect } from "react";
import {
  FileCode,
  ShieldAlert,
  Search,
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
  Skull, // Added for "Mortus" feel
  Hand, // Added for "Hand" mechanic representation
  X, // For closing/reset
  Save,
} from "lucide-react";
import { generateStreamingContent } from "../../../services/geminiService";
import SaveArtworkDialog from "../SaveArtworkDialog";

// --- DESIGN SYSTEM CONSTANTS ---
const PALETTE = {
  MUTANT_ORANGE: "#E07000",
  SEWER_SLUDGE: "#006000",
  BRUISED_PURPLE: "#2d002d", // Darker background
  NARRATOR_YELLOW: "#FFCC00",
  INK_BLACK: "#000000",
  PAPER_WHITE: "#FFFFFF",
};

interface AnalysisSection {
  id: string;
  label: string;
  icon: React.ElementType;
  // Colors mapped to Sega Palette logic
  borderColor: string;
}

const analysisLenses: AnalysisSection[] = [
  { id: "ideology", label: "IDEOLOGY", icon: Scale, borderColor: "border-emerald-600" },
  { id: "genealogy", label: "GENEALOGY", icon: History, borderColor: "border-blue-600" },
  { id: "power", label: "POWER", icon: ShieldAlert, borderColor: "border-red-600" },
  { id: "poetics", label: "POETICS", icon: Eye, borderColor: "border-purple-600" },
];

export const CriticalCodeModule: React.FC = () => {
  const [code, setCode] = useState(`// SEGA GENESIS DEV KIT
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
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  // --- LOGIC PRESERVED ---
  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setAnalysis("");
    setScanProgress(0);

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
      setAnalysis("ERROR: CONNECTION SEVERED BY MORTUS...");
    } finally {
      clearInterval(progInterval);
      setIsAnalyzing(false);
    }
  };

  // --- CUSTOM UI COMPONENTS FOR COMIX ZONE STYLE ---

  // The "Inventory Slot" Button
  const InventorySlot = ({ icon: Icon, label, onClick, active, color = "bg-yellow-400" }: any) => (
    <button
      onClick={onClick}
      className={`group relative w-16 h-16 border-4 border-black ${active ? "bg-white" : "bg-black"} 
      flex items-center justify-center transition-transform active:scale-95 hover:-translate-y-1`}
    >
      <div className={`absolute inset-0 opacity-20 ${color} pointer-events-none`}></div>
      <Icon
        size={32}
        className={active ? "text-black" : "text-yellow-400 group-hover:text-white"}
        strokeWidth={3}
      />
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1 font-mono uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
        {label}
      </span>
    </button>
  );

  // The "Narrator Box" (Yellow Metadata Box)
  const NarratorBox = ({
    title,
    value,
    align = "left",
  }: {
    title: string;
    value: string;
    align?: "left" | "right";
  }) => (
    <div
      className={`absolute -top-3 ${
        align === "left" ? "-left-2" : "-right-2"
      } z-20 bg-[#FFCC00] border-2 border-black px-2 py-1 shadow-[4px_4px_0_rgba(0,0,0,1)] transform ${
        align === "left" ? "-rotate-2" : "rotate-1"
      }`}
    >
      <div className="text-[10px] font-black text-black uppercase tracking-widest leading-none mb-1">
        {title}
      </div>
      <div className="text-xs font-mono font-bold text-red-600 leading-none">{value}</div>
    </div>
  );

  return (
    // 1. THE VOID (Artist's Desk Background)
    <div
      className="h-full flex flex-col p-4 md:p-8 overflow-hidden relative font-mono"
      style={{ backgroundColor: PALETTE.BRUISED_PURPLE }}
    >
      {/* Background Texture (Scattered Pencils effect simulated with CSS patterns) */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#505050 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* 4. UI MAPPING: Header as Inventory Slots */}
      <div className="flex justify-between items-end mb-8 shrink-0 z-10">
        <div className="flex gap-4">
          <InventorySlot icon={Fingerprint} label="IDENTITY" active={true} />
          <InventorySlot icon={Terminal} label="CONSOLE" />
        </div>

        {/* Title Card */}
        <div className="hidden md:block bg-white border-4 border-black p-2 transform rotate-1 shadow-[6px_6px_0_#000]">
          <h1 className="text-2xl font-black uppercase tracking-tighter italic text-black">
            EPISODE 1: <span className="text-[#E07000]">CRITICAL CODE</span>
          </h1>
        </div>

        <div className="flex gap-4">
          {/* Status Indicator as a "Life Bar" */}
          <div className="h-16 flex flex-col justify-center items-end mr-4">
            <span className="text-white text-xs uppercase mb-1">SYS_INTEGRITY</span>
            <div className="w-32 h-4 border-2 border-white bg-black relative">
              <div
                className={`h-full ${isAnalyzing ? "bg-red-500 animate-pulse" : "bg-[#006000]"}`}
                style={{ width: isAnalyzing ? "100%" : "85%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT: The Comic Page Layout */}
      <div className="flex flex-col lg:flex-row gap-8 flex-grow overflow-hidden relative">
        {/* PANEL 1: INPUT (The Source) */}
        <div className="w-full lg:w-1/2 flex flex-col relative group">
          {/* Panel Border */}
          <div className="absolute inset-0 bg-white border-4 border-black shadow-[8px_8px_0_#000] transform -rotate-1 z-0"></div>

          <div className="relative z-10 flex flex-col h-full p-1">
            {/* Narrator Box: Metadata */}
            <NarratorBox title="LOCATION" value="SOURCE_BUFFER_01" align="left" />

            {/* Code Editor Area */}
            <div className="flex-grow bg-white p-6 pt-10 relative overflow-hidden">
              {/* Line Numbers (Hand-drawn style) */}
              <div className="absolute left-0 top-0 bottom-0 w-10 border-r-2 border-black/10 bg-gray-50 flex flex-col items-center pt-10 text-gray-400 text-xs select-none">
                {Array.from({ length: 15 }).map((_, i) => (
                  <span key={i} className="leading-6">
                    {i + 1}
                  </span>
                ))}
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-transparent pl-12 text-black font-mono text-sm leading-6 outline-none resize-none placeholder:text-gray-400"
                spellCheck={false}
                dir="ltr"
              />

              {/* Scanning Effect (The "Mortus" Scan) */}
              {isAnalyzing && (
                <div
                  className="absolute left-0 w-full bg-[#E07000]/20 border-b-4 border-[#E07000] z-20 transition-all duration-300 pointer-events-none"
                  style={{ top: 0, height: `${scanProgress}%` }}
                >
                  <span className="absolute right-0 bottom-0 bg-[#E07000] text-black text-[9px] font-bold px-1">
                    SCANNING...
                  </span>
                </div>
              )}
            </div>

            {/* Action Bar (Bottom of Panel 1) */}
            <div className="border-t-4 border-black bg-gray-100 p-4 flex justify-between items-center">
              <div className="flex gap-2">
                {analysisLenses.map((lens) => (
                  <button
                    key={lens.id}
                    onClick={() => setActiveLens(lens.id)}
                    className={`w-10 h-10 border-2 border-black flex items-center justify-center transition-all
                      ${
                        activeLens === lens.id
                          ? "bg-black text-white shadow-[2px_2px_0_#E07000] -translate-y-1"
                          : "bg-white text-gray-400 hover:bg-gray-200"
                      }
                    `}
                    title={lens.label}
                  >
                    <lens.icon size={18} />
                  </button>
                ))}
              </div>

              {/* THE "POW" BUTTON */}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={`relative px-6 py-2 font-black uppercase border-2 border-black shadow-[4px_4px_0_#000] transition-all active:translate-y-1 active:shadow-none
                  ${
                    isAnalyzing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#E07000] hover:bg-[#ff8c00] text-white"
                  }
                `}
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="animate-spin" size={16} /> PROCESSING
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    ANALYZE <Zap size={16} fill="white" />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* GUTTER (White Space) */}
        <div className="hidden lg:block w-6"></div>

        {/* PANEL 2: OUTPUT (The Revelation) */}
        <div className="w-full lg:w-1/2 flex flex-col relative">
          {/* Panel Border */}
          <div className="absolute inset-0 bg-white border-4 border-black shadow-[8px_8px_0_#000] transform rotate-1 z-0"></div>

          <div className="relative z-10 flex flex-col h-full p-1">
            <NarratorBox title="STATUS" value={isAnalyzing ? "INTERCEPTING..." : "DECODED"} align="right" />

            <div className="flex-grow bg-white p-6 pt-10 relative overflow-hidden flex flex-col">
              {/* Background Detail: Halftone Pattern */}
              <div
                className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, black 1px, transparent 1px)",
                  backgroundSize: "4px 4px",
                }}
              ></div>

              {/* 3. THE "MORTUS HAND" MECHANIC (Visual Representation) */}
              <div
                ref={outputRef}
                className="flex-grow overflow-y-auto custom-scrollbar relative z-10"
                dir="rtl"
              >
                {!analysis && !isAnalyzing ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <Skull size={64} strokeWidth={1.5} className="mb-4 text-black" />
                    <h4 className="font-black text-xl uppercase text-black">NO DATA DETECTED</h4>
                    <p className="text-xs font-mono text-center max-w-[200px] mt-2">
                      INITIATE SCAN SEQUENCE TO REVEAL HIDDEN MEANINGS.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Speech Bubble Style Container */}
                    <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0_rgba(0,0,0,0.2)] relative mb-12">
                      {/* Bubble Tail */}
                      <div className="absolute -top-4 right-8 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-black"></div>
                      <div className="absolute -top-[13px] right-[34px] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-white"></div>

                      {/* Content */}
                      <div className="prose prose-p:font-mono prose-headings:font-black text-black text-lg leading-relaxed text-justify whitespace-pre-wrap">
                        {/* Keyword Highlighting Logic would go here, simplified for CSS */}
                        <span className="font-bold text-[#006000] block mb-2 text-sm border-b-2 border-black pb-1 w-max">
                          // ANALYSIS_RESULT:
                        </span>
                        {analysis}
                      </div>
                    </div>

                    {/* THE HAND SPRITE (Simulated) */}
                    {isAnalyzing && (
                      <div className="absolute bottom-0 left-0 animate-bounce transition-all duration-300 opacity-80 pointer-events-none">
                        {/* This represents the hand holding a pen */}
                        <Hand
                          size={48}
                          className="text-black fill-white transform -rotate-45 drop-shadow-lg"
                        />
                        <div className="absolute -top-2 -right-2 text-[#E07000] font-black text-xs animate-ping">
                          SCRATCH!
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer / Page Number */}
            <div className="h-10 border-t-4 border-black bg-white flex justify-between items-center px-4">
              <span className="text-[10px] font-black uppercase text-gray-400">
                SEGA GENESIS VDP EMULATION
              </span>
              <div className="flex gap-2">
                <button className="hover:text-[#E07000] transition-colors">
                  <Share2 size={14} />
                </button>
                <button
                  onClick={() => setShowSaveDialog(true)}
                  disabled={!analysis}
                  className={`transition-colors ${analysis ? "hover:text-[#E07000] cursor-pointer" : "text-gray-300 cursor-not-allowed"}`}
                >
                  <Save size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. PAGE TURN TRANSITION (Visual Decoration) */}
      <div
        className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-gray-300 to-transparent pointer-events-none opacity-50"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
      ></div>

      {/* Save Artwork Dialog */}
      <SaveArtworkDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        labModule="critical-code"
        labCategory="text"
        content={{
          text: analysis,
          html: `<div style="background: white; border: 2px solid black; padding: 24px; font-family: monospace; white-space: pre-wrap;">${analysis}</div>`,
          data: {
            code,
            analysis,
            lens: activeLens,
          },
        }}
      />
    </div>
  );
};

// Helper for Spin Icon
const RefreshCw = ({ className, size }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3" // Thicker stroke for comic style
    strokeLinecap="square" // Square caps for pixel feel
    strokeLinejoin="miter"
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);
