import React, { useState, useEffect } from "react";
import {
  Terminal,
  Scissors,
  Zap,
  BrainCircuit,
  Move,
  Shuffle,
  FileCode,
  Wind,
  Gamepad2,
  Database,
  MapPin,
  Link as LinkIcon,
  Layers,
  Globe,
  PenTool,
  Network,
  Hexagon,
  Sprout,
  Music,
  BoxSelect,
  Image as ImageIcon,
  Waves,
  Dna,
  Ghost,
  Flame,
  HandMetal,
  Skull,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Grid3X3,
  Monitor,
} from "lucide-react";

// Import modules (Keep existing imports)
import { PhysicsTextModule } from "./lab/PhysicsTextModule";
import { PixelGlitchModule } from "./lab/PixelGlitchModule";
import { NeuralModule } from "./lab/NeuralModule";
import { InteractiveFictionModule } from "./lab/narrative/InteractiveFictionModule";
import { DataNarrativeModule } from "./lab/narrative/DataNarrativeModule";
import { LocativeNarrativeModule } from "./lab/narrative/LocativeNarrativeModule";
import { HypertextModule } from "./lab/narrative/HypertextModule";
import { CutUpModule } from "./lab/text/CutUpModule";
import { GlitchModule } from "./lab/text/GlitchModule";
import { GeometricModule } from "./lab/text/GeometricModule";
import { PermutationModule } from "./lab/text/PermutationModule";
import { CriticalCodeModule } from "./lab/text/CriticalCodeModule";
import { AdvancedKineticModule } from "./lab/visual/AdvancedKineticModule";
import { AlgorithmicCalligraphyModule } from "./lab/visual/AlgorithmicCalligraphyModule";
import { CyberIslimiModule } from "./lab/visual/CyberIslimiModule";
import { FractalGardenModule } from "./lab/visual/FractalGardenModule";
import { SemanticClusterModule } from "./lab/visual/SemanticClusterModule";
import { SonificationModule } from "./lab/visual/SonificationModule";
import { PoetryExcavationModule } from "./lab/visual/PoetryExcavationModule";
import { BioSynthesisModule } from "./lab/visual/BioSynthesisModule";
import { CyberBreachModule } from "./lab/visual/CyberBreachModule";
import { CyberWeaverModule } from "./lab/visual/CyberWeaverModule";
import { RetroConsoleModule } from "./lab/visual/RetroConsoleModule";
import { TextOrbModule } from "./lab/three/TextOrbModule";
import { BlindOwlModule } from "./lab/three/BlindOwlModule";

// --- SEGA GENESIS PALETTE & TYPES ---
const PALETTE = {
  mutantOrange: "#E07000",
  sewerSludge: "#006000",
  bruisedPurple: "#500050",
  sketchWhite: "#FFFFFF",
  inkBlack: "#000000",
  paperYellow: "#FFCC00",
};

type ToolMode =
  | "neural"
  | "cutup"
  | "glitch"
  | "geometric"
  | "permutation"
  | "critical"
  | "threed"
  | "kinetic"
  | "installation"
  | "p5"
  | "d3"
  | "islimi"
  | "lsystem"
  | "sonification"
  | "blindowl"
  | "physics"
  | "pixels"
  | "bio"
  | "fiction"
  | "datadriven"
  | "locative"
  | "hypertext"
  | "cyberbreach"
  | "cyberweaver"
  | "retroconsole";

// --- COMIC UI COMPONENTS ---

const ComicButton = ({ id, label, icon: Icon, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`
            group relative w-full mb-3 p-3 flex items-center gap-3 
            border-4 border-black transition-all duration-100
            ${
              active
                ? "bg-[#E07000] text-black translate-x-1 translate-y-1 shadow-none"
                : "bg-white text-black hover:bg-[#FFCC00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            }
        `}
    style={{ clipPath: "polygon(0% 0%, 100% 2%, 98% 100%, 2% 98%)" }} // Hand-drawn jitter shape
  >
    <div className="bg-black text-white p-1 border-2 border-black">
      <Icon size={18} strokeWidth={3} />
    </div>
    <span className="font-black uppercase tracking-tighter text-sm font-mono">{label}</span>

    {/* Sketch Turner Pointer on Hover */}
    <div className="absolute -right-8 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
      <HandMetal className="text-white rotate-90" size={24} fill="black" />
    </div>
  </button>
);

const InventorySlot = ({ icon: Icon, label, color, onClick }: any) => (
  <button
    onClick={onClick}
    className="relative w-16 h-16 bg-black border-4 border-[#FFCC00] flex items-center justify-center group active:scale-95 transition-transform"
  >
    <div className={`absolute inset-0 opacity-20 ${color}`}></div>
    <Icon
      size={32}
      className="text-white z-10 group-hover:scale-110 transition-transform"
      strokeWidth={2.5}
    />
    <span className="absolute -bottom-6 bg-black text-[#FFCC00] text-[8px] px-1 font-mono uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-[#FFCC00]">
      {label}
    </span>
  </button>
);

const SpeechBubble = ({ text }: { text: string }) => (
  <div className="relative bg-white border-4 border-black p-4 rounded-[20px] mb-6 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] animate-in zoom-in duration-300">
    <p className="font-mono font-bold text-black text-xs md:text-sm uppercase leading-relaxed">{text}</p>
    {/* Bubble Tail */}
    <div className="absolute -bottom-4 left-8 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-black"></div>
    <div className="absolute -bottom-[10px] left-[35px] w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-white"></div>
  </div>
);

export const Lab: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolMode>("neural");
  const [isDrawing, setIsDrawing] = useState(false);
  const [pageTurn, setPageTurn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // "Mortus Hand" Effect Logic
  useEffect(() => {
    setIsDrawing(true);
    const timer = setTimeout(() => setIsDrawing(false), 800); // Hand animation duration
    return () => clearTimeout(timer);
  }, [activeTool]);

  const handleToolChange = (tool: ToolMode) => {
    if (tool === activeTool) return;
    setPageTurn(true); // Trigger page tear
    setTimeout(() => {
      setActiveTool(tool);
      setPageTurn(false);
    }, 200);
    // Close sidebar in fullscreen mode after selecting a tool
    if (isFullscreen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div
      className={`bg-[#500050] selection:bg-[#E07000] selection:text-black ${
        isFullscreen ? "fixed inset-0 z-[200] overflow-hidden" : "w-full relative p-4 md:p-8"
      }`}
    >
      {/* --- FULLSCREEN TOGGLE BUTTON --- */}
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute -top-6 -right-6 z-[250] bg-[#FFCC00] border-4 border-black p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform"
        title={isFullscreen ? "خروج از تمام صفحه" : "تمام صفحه"}
      >
        {isFullscreen ? (
          <Minimize2 size={24} className="text-black" strokeWidth={3} />
        ) : (
          <Maximize2 size={24} className="text-black" strokeWidth={3} />
        )}
      </button>
      {/* GLOBAL STYLES FOR COMIC FEEL */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Bangers&display=swap');
        
        .comic-font { font-family: 'Press Start 2P', cursive; }
        .display-font { font-family: 'Bangers', cursive; }
        
        .panel-border {
            border: 4px solid #000;
            box-shadow: 8px 8px 0px rgba(0,0,0,0.3);
        }

        /* The "Mortus Hand" Animation */
        @keyframes drawSwipe {
            0% { clip-path: inset(0 100% 0 0); }
            100% { clip-path: inset(0 0 0 0); }
        }
        
        .drawing-reveal {
            animation: drawSwipe 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        /* Page Turn Flash */
        @keyframes flash {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
        }
        .flash-effect {
            animation: flash 0.2s ease-in-out;
        }
      `}</style>

      {/* --- BACKGROUND ELEMENTS (The Artist's Desk) --- */}
      <div className="fixed inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

      {/* --- INVENTORY (Header) - Only shown in non-fullscreen --- */}
      {!isFullscreen && (
        <div className="fixed top-20 right-4 z-50 flex gap-2 scale-75 md:scale-100 origin-top-right">
          <InventorySlot
            icon={Ghost}
            label="About Author"
            color="bg-blue-500"
            onClick={() => alert("ITEM: RAT (About)")}
          />
          <InventorySlot
            icon={Flame}
            label="Reset Lab"
            color="bg-red-500"
            onClick={() => window.location.reload()}
          />
          <InventorySlot
            icon={HandMetal}
            label="Generate"
            color="bg-green-500"
            onClick={() => setIsDrawing(true)}
          />
        </div>
      )}

      {/* --- FULLSCREEN SIDEBAR TOGGLE --- */}
      {isFullscreen && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-1/2 left-0 z-[60] -translate-y-1/2 bg-[#FFCC00] border-4 border-black border-l-0 p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-1 transition-transform"
        >
          {isSidebarOpen ? (
            <ChevronLeft size={24} className="text-black" strokeWidth={3} />
          ) : (
            <ChevronRight size={24} className="text-black" strokeWidth={3} />
          )}
        </button>
      )}

      {/* --- SIDEBAR OVERLAY (click to close) --- */}
      {isFullscreen && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-100 transition-opacity"
        />
      )}

      <div
        className={`flex flex-col lg:flex-row gap-8 relative z-10 ${
          isFullscreen ? "h-full w-full" : "mx-auto max-w-[1600px] h-[105vh]"
        }`}
      >
        {/* --- LEFT PANEL: THE INDEX (Sidebar) --- */}
        <div
          className={`flex flex-col h-full transition-all duration-300 ${
            isFullscreen
              ? `fixed top-0 left-0 h-full w-80 bg-[#500050] z-50 shadow-2xl ${
                  isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : "w-full lg:w-80 shrink-0 relative"
          }`}
        >
          {/* Title Box */}
          <div className="bg-[#FFCC00] border-4 border-black p-4 mb-6 transform -rotate-1 shadow-[6px_6px_0px_rgba(0,0,0,1)] relative">
            <h1 className="text-3xl font-black text-black uppercase tracking-tighter display-font flex items-center gap-2">
              <Skull size={32} />
              ZONE: LAB
            </h1>
            <div className="text-[10px] font-bold mt-1 bg-black text-white inline-block px-2 py-1">
              EPISODE 1: NIGHT OF THE MUTANTS
            </div>
            {/* Close button for fullscreen sidebar */}
            {isFullscreen && isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-2 right-2 bg-black text-[#FFCC00] p-1 border-2 border-[#FFCC00] hover:bg-[#E07000] transition-colors"
              >
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
            )}
          </div>

          {/* Scrollable Tool List */}
          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar pb-20">
            <div className="bg-white border-4 border-black p-4 min-h-full">
              <div className="mb-4 font-bold text-xs text-[#E07000] uppercase border-b-4 border-black pb-1">
                Narrative Engines
              </div>
              <ComicButton
                id="fiction"
                label="Interactive Fiction"
                icon={Gamepad2}
                active={activeTool === "fiction"}
                onClick={() => handleToolChange("fiction")}
              />
              <ComicButton
                id="datadriven"
                label="Data Narrative"
                icon={Database}
                active={activeTool === "datadriven"}
                onClick={() => handleToolChange("datadriven")}
              />
              <ComicButton
                id="locative"
                label="Locative Story"
                icon={MapPin}
                active={activeTool === "locative"}
                onClick={() => handleToolChange("locative")}
              />
              <ComicButton
                id="hypertext"
                label="Hypertext"
                icon={LinkIcon}
                active={activeTool === "hypertext"}
                onClick={() => handleToolChange("hypertext")}
              />

              <div className="mb-4 mt-8 font-bold text-xs text-[#006000] uppercase border-b-4 border-black pb-1">
                Bio / Spatial
              </div>
              <ComicButton
                id="bio"
                label="Bio Synthesis"
                icon={Dna}
                active={activeTool === "bio"}
                onClick={() => handleToolChange("bio")}
              />
              <ComicButton
                id="threed"
                label="3D Forms"
                icon={Globe}
                active={activeTool === "threed"}
                onClick={() => handleToolChange("threed")}
              />
              <ComicButton
                id="physics"
                label="Word Physics"
                icon={BoxSelect}
                active={activeTool === "physics"}
                onClick={() => handleToolChange("physics")}
              />

              <div className="mb-4 mt-8 font-bold text-xs text-[#500050] uppercase border-b-4 border-black pb-1">
                Visual Algos
              </div>
              <ComicButton
                id="pixels"
                label="Pixel Glitch"
                icon={ImageIcon}
                active={activeTool === "pixels"}
                onClick={() => handleToolChange("pixels")}
              />
              <ComicButton
                id="kinetic"
                label="Kinetic Poetry"
                icon={Wind}
                active={activeTool === "kinetic"}
                onClick={() => handleToolChange("kinetic")}
              />
              <ComicButton
                id="islimi"
                label="Cyber Islimi"
                icon={Waves}
                active={activeTool === "islimi"}
                onClick={() => handleToolChange("islimi")}
              />

              <div className="mb-4 mt-8 font-bold text-xs text-red-600 uppercase border-b-4 border-black pb-1">
                Processors
              </div>
              <ComicButton
                id="neural"
                label="AI Generator"
                icon={BrainCircuit}
                active={activeTool === "neural"}
                onClick={() => handleToolChange("neural")}
              />
              <ComicButton
                id="cutup"
                label="Dada Console"
                icon={Scissors}
                active={activeTool === "cutup"}
                onClick={() => handleToolChange("cutup")}
              />
              <ComicButton
                id="glitch"
                label="Glitch Workshop"
                icon={Zap}
                active={activeTool === "glitch"}
                onClick={() => handleToolChange("glitch")}
              />
              <ComicButton
                id="geometric"
                label="Geometric Text"
                icon={Hexagon}
                active={activeTool === "geometric"}
                onClick={() => handleToolChange("geometric")}
              />
              <ComicButton
                id="permutation"
                label="Permutation"
                icon={Shuffle}
                active={activeTool === "permutation"}
                onClick={() => handleToolChange("permutation")}
              />
              <ComicButton
                id="critical"
                label="Critical Code"
                icon={FileCode}
                active={activeTool === "critical"}
                onClick={() => handleToolChange("critical")}
              />

              <div className="mb-4 mt-8 font-bold text-xs text-purple-600 uppercase border-b-4 border-black pb-1">
                Advanced Visual
              </div>
              <ComicButton
                id="p5"
                label="Algorithmic Calligraphy"
                icon={PenTool}
                active={activeTool === "p5"}
                onClick={() => handleToolChange("p5")}
              />
              <ComicButton
                id="lsystem"
                label="Fractal Garden"
                icon={Sprout}
                active={activeTool === "lsystem"}
                onClick={() => handleToolChange("lsystem")}
              />
              <ComicButton
                id="d3"
                label="Semantic Cluster"
                icon={Network}
                active={activeTool === "d3"}
                onClick={() => handleToolChange("d3")}
              />
              <ComicButton
                id="sonification"
                label="Sonification"
                icon={Music}
                active={activeTool === "sonification"}
                onClick={() => handleToolChange("sonification")}
              />
              <ComicButton
                id="installation"
                label="Poetry Excavation"
                icon={Layers}
                active={activeTool === "installation"}
                onClick={() => handleToolChange("installation")}
              />
              <ComicButton
                id="blindowl"
                label="Blind Owl 3D"
                icon={Ghost}
                active={activeTool === "blindowl"}
                onClick={() => handleToolChange("blindowl")}
              />
              <ComicButton
                id="cyberbreach"
                label="Cyber Breach"
                icon={ShieldAlert}
                active={activeTool === "cyberbreach"}
                onClick={() => handleToolChange("cyberbreach")}
              />
              <ComicButton
                id="cyberweaver"
                label="Cyber Weaver"
                icon={Grid3X3}
                active={activeTool === "cyberweaver"}
                onClick={() => handleToolChange("cyberweaver")}
              />
              <ComicButton
                id="retroconsole"
                label="Retro Console"
                icon={Monitor}
                active={activeTool === "retroconsole"}
                onClick={() => handleToolChange("retroconsole")}
              />
            </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: THE ACTION (Workspace) --- */}
        <div className={`relative h-full flex flex-col ${isFullscreen ? "flex-grow w-full" : "flex-grow"}`}>
          {/* Narrator Box (Metadata) */}
          <div
            className={`absolute z-20 bg-[#FFCC00] border-2 border-black px-4 py-1 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${
              isFullscreen ? "top-2 left-2" : "-top-3 left-4"
            }`}
          >
            <span className="font-bold text-xs uppercase tracking-widest">
              LOCATION: {activeTool.toUpperCase()}_SECTOR
            </span>
          </div>

          {/* Main Panel Container */}
          <div
            className={`
                relative h-full overflow-y-auto custom-scrollbar flex-grow bg-white border-[6px] border-black 
                ${pageTurn ? "opacity-0 scale-95" : "opacity-100 scale-100"}
                transition-all duration-200 ease-in-out
            `}
            style={{
              boxShadow: "12px 12px 0px #000000",
              clipPath: "polygon(0% 1%, 100% 0%, 99% 100%, 1% 99%)", // Subtle panel distortion
            }}
          >
            {/* Inner Gutter/Padding */}
            <div className="absolute inset-0 p-6 md:p-10 flex flex-col">
              {/* AI Analysis Bubble */}
              <div className="relative z-20 max-w-2xl">
                <SpeechBubble text={`Initializing ${activeTool} protocol... Waiting for user input.`} />
              </div>

              {/* Module Render Area */}
              <div
                className={`relative flex-grow border-2 border-dashed border-gray-300 bg-gray-50 rounded p-4 ${
                  isDrawing ? "drawing-reveal" : ""
                }`}
              >
                {/* The "Mortus Hand" Visual Overlay */}
                {isDrawing && (
                  <div className="absolute inset-0 z-50  flex items-end justify-end animate-pulse">
                    {/* Placeholder for Hand Sprite - Using CSS shape for demo */}
                    <div className="w-32 h-32 bg-black rounded-full blur-xl opacity-20 translate-x-10 translate-y-10"></div>
                  </div>
                )}

                {/* Content */}
                <div className="h-full w-full overflow-auto custom-scrollbar relative z-10">
                  {activeTool === "neural" && <NeuralModule />}
                  {activeTool === "cutup" && <CutUpModule />}
                  {activeTool === "glitch" && <GlitchModule />}
                  {activeTool === "geometric" && <GeometricModule />}
                  {activeTool === "permutation" && <PermutationModule />}
                  {activeTool === "critical" && <CriticalCodeModule />}
                  {activeTool === "threed" && <TextOrbModule />}
                  {activeTool === "blindowl" && <BlindOwlModule />}
                  {activeTool === "physics" && <PhysicsTextModule />}
                  {activeTool === "pixels" && <PixelGlitchModule />}
                  {activeTool === "kinetic" && <AdvancedKineticModule />}
                  {activeTool === "fiction" && <InteractiveFictionModule />}
                  {activeTool === "datadriven" && <DataNarrativeModule />}
                  {activeTool === "locative" && <LocativeNarrativeModule />}
                  {activeTool === "hypertext" && <HypertextModule />}
                  {activeTool === "installation" && <PoetryExcavationModule />}
                  {activeTool === "p5" && <AlgorithmicCalligraphyModule />}
                  {activeTool === "islimi" && <CyberIslimiModule />}
                  {activeTool === "lsystem" && <FractalGardenModule />}
                  {activeTool === "d3" && <SemanticClusterModule />}
                  {activeTool === "sonification" && <SonificationModule />}
                  {activeTool === "bio" && <BioSynthesisModule />}
                  {activeTool === "cyberbreach" && <CyberBreachModule />}
                  {activeTool === "cyberweaver" && <CyberWeaverModule />}
                  {activeTool === "retroconsole" && <RetroConsoleModule />}
                </div>
              </div>

              {/* Sound Effect Visual (Onomatopoeia) */}
              <div className="absolute bottom-4 right-4  opacity-20 z-0 rotate-[-15deg]">
                <h1 className="text-9xl font-black text-black display-font tracking-tighter">LOAD!</h1>
              </div>
            </div>

            {/* Scanlines Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-30 bg-[length:100%_4px,6px_100%] "></div>
          </div>
        </div>

        {/* Page Turn Flash Overlay */}
        {pageTurn && <div className="fixed inset-0 bg-white z-[100] flash-effect "></div>}
      </div>
    </div>
  );
};
