import React, { useEffect, useRef, useState } from "react";
import { X, RefreshCw, HelpCircle, Zap } from "lucide-react";

interface ComixZoneGameProps {
  onClose: () => void;
}

const ComixZoneGame: React.FC<ComixZoneGameProps> = ({ onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // --- 1. EMULATOR LOGIC (SYSTEM KERNEL) ---
  useEffect(() => {
    const loadEmulator = () => {
      if (!containerRef.current) return;

      const gameDiv = document.createElement("div");
      gameDiv.id = "game";
      gameDiv.style.width = "100%";
      gameDiv.style.height = "100%";
      // Force pixelated rendering for fidelity
      gameDiv.style.imageRendering = "pixelated";
      containerRef.current.appendChild(gameDiv);

      (window as any).EJS_player = "#game";
      (window as any).EJS_core = "segaMD";
      (window as any).EJS_gameUrl = "/roms/comix-zone.bin";
      (window as any).EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";
      // Using a static noise or dark purple instead of generic gif
      (window as any).EJS_backgroundImage = "";
      (window as any).EJS_backgroundColor = "#000000";
      (window as any).EJS_startOnLoaded = true;

      const script = document.createElement("script");
      script.src = "https://cdn.emulatorjs.org/stable/data/loader.js";
      script.async = true;
      document.body.appendChild(script);
    };

    loadEmulator();

    return () => {
      const gameDiv = document.getElementById("game");
      if (gameDiv) gameDiv.remove();
    };
  }, []);

  // --- 2. INTERACTION LOGIC ---
  const handleClose = () => {
    // Trigger "Page Tear" animation
    setIsClosing(true);
    setTimeout(onClose, 600); // Wait for animation
  };

  const handleReset = () => {
    // Simulate Dynamite Explosion effect logic here if needed
    const gameDiv = document.getElementById("game");
    if (gameDiv) {
      // Simple reload for emulator
      gameDiv.innerHTML = "";
      window.location.reload();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden font-mono">
      {/* GLOBAL STYLES FOR PIXEL FONT & ANIMATIONS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .font-pixel { font-family: 'Press Start 2P', cursive; }
        
        .comic-shadow {
          box-shadow: 8px 8px 0px #000000;
        }
        
        .panel-border {
          border: 4px solid #000000;
          clip-path: polygon(
            0% 0%, 100% 0%, 100% 100%, 0% 100%, 
            0% 5%, 2% 0%, 98% 0%, 100% 2%, 
            100% 98%, 98% 100%, 2% 100%, 0% 98%
          );
        }

        @keyframes pageTear {
          0% { transform: rotate(0deg) translateY(0); opacity: 1; }
          20% { transform: rotate(-2deg) translateY(10px); }
          100% { transform: rotate(15deg) translateY(100vh); opacity: 0; }
        }

        .animate-page-tear {
          animation: pageTear 0.6s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards;
        }

        .bg-void {
          background-color: #500050;
          background-image: 
            radial-gradient(#000 15%, transparent 16%),
            radial-gradient(#000 15%, transparent 16%);
          background-size: 20px 20px;
          background-position: 0 0, 10px 10px;
        }
      `}</style>

      {/* 1. THE VOID (Background) */}
      <div className="absolute inset-0 bg-void opacity-95" onClick={handleClose} />

      {/* 2. MAIN COMIC PAGE CONTAINER */}
      <div
        className={`
          relative w-[95vw] max-w-5xl h-[85vh] 
          bg-white border-[6px] border-black 
          comic-shadow transform rotate-1
          flex flex-col
          ${isClosing ? "animate-page-tear" : "animate-in zoom-in-95 duration-300"}
        `}
      >
        {/* --- HEADER: THE INVENTORY (UI MAPPING) --- */}
        <div className="h-16 bg-[#FFCC00] border-b-[6px] border-black flex items-center justify-between px-4 relative z-20">
          {/* Title Box (Narrator Box Style) */}
          <div className="bg-white border-4 border-black px-4 py-1 transform -rotate-1 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <h1 className="text-black font-pixel text-xs md:text-sm tracking-tighter">
              EPISODE 1: NIGHT OF THE MUTANTS
            </h1>
          </div>

          {/* INVENTORY SLOTS (Controls) */}
          <div className="flex gap-3">
            {/* SLOT 1: THE RAT (Help) */}
            <div className="group relative">
              <button
                onClick={() => setShowControls(!showControls)}
                className="w-12 h-12 bg-yellow-400 border-4 border-black flex items-center justify-center hover:bg-white transition-colors active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_#000]"
                title="Roadkill (Controls)"
              >
                <HelpCircle className="w-6 h-6 text-black stroke-[3]" />
              </button>
              {/* Tooltip/Speech Bubble */}
              <div className="absolute top-14 right-0 w-48 bg-white border-4 border-black p-2 hidden group-hover:block z-50">
                <p className="font-pixel text-[10px] leading-tight text-black">NEED HELP, SKETCH?</p>
              </div>
            </div>

            {/* SLOT 2: DYNAMITE (Reset) */}
            <button
              onClick={handleReset}
              className="w-12 h-12 bg-red-600 border-4 border-black flex items-center justify-center hover:bg-red-500 transition-colors active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_#000]"
              title="Dynamite (Reset)"
            >
              <RefreshCw className="w-6 h-6 text-white stroke-[3]" />
            </button>

            {/* SLOT 3: FIST (Close) */}
            <button
              onClick={handleClose}
              className="w-12 h-12 bg-black border-4 border-white flex items-center justify-center hover:bg-gray-800 transition-colors active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_#500050]"
              title="Smash (Close)"
            >
              <X className="w-8 h-8 text-white stroke-[4]" />
            </button>
          </div>
        </div>

        {/* --- MAIN CONTENT: THE PANEL --- */}
        <div className="flex-1 relative bg-black p-1 overflow-hidden">
          {/* The "Gutter" / Safe Zone Frame */}
          <div className="absolute inset-2 border-2 border-[#006000] opacity-50 pointer-events-none z-10"></div>

          {/* Emulator Container */}
          <div ref={containerRef} className="w-full h-full bg-black relative z-0" />

          {/* ONOMATOPOEIA (Visual FX Layer) */}
          <div className="absolute -bottom-4 -left-4 pointer-events-none z-20 opacity-80">
            <span className="font-pixel text-6xl text-[#E07000] drop-shadow-[4px_4px_0px_#000] transform -rotate-12 block">
              SEGA!
            </span>
          </div>

          {/* CONTROLS OVERLAY (The Rat's Advice) */}
          {showControls && (
            <div className="absolute inset-0 bg-black/90 z-30 flex items-center justify-center p-8 animate-in fade-in">
              <div className="bg-white border-[6px] border-black p-6 max-w-md relative shadow-[12px_12px_0px_#E07000]">
                {/* Speech Bubble Tail */}
                <div className="absolute -top-6 right-10 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[24px] border-b-black"></div>
                <div className="absolute -top-[18px] right-10 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[20px] border-b-white"></div>

                <h3 className="font-pixel text-xl mb-4 text-[#E07000] uppercase">Combat Manual</h3>
                <ul className="space-y-3 font-pixel text-xs text-black leading-relaxed">
                  <li className="flex justify-between border-b-2 border-black/10 pb-1">
                    <span>ARROWS</span> <span className="text-[#006000]">MOVE SKETCH</span>
                  </li>
                  <li className="flex justify-between border-b-2 border-black/10 pb-1">
                    <span>Z KEY</span> <span className="text-red-600">ATTACK 1</span>
                  </li>
                  <li className="flex justify-between border-b-2 border-black/10 pb-1">
                    <span>X KEY</span> <span className="text-red-600">ATTACK 2</span>
                  </li>
                  <li className="flex justify-between border-b-2 border-black/10 pb-1">
                    <span>C KEY</span> <span className="text-blue-600">JUMP / BLOCK</span>
                  </li>
                  <li className="flex justify-between pt-2">
                    <span>ENTER</span> <span>START</span>
                  </li>
                </ul>
                <button
                  onClick={() => setShowControls(false)}
                  className="mt-6 w-full bg-black text-white font-pixel py-3 hover:bg-[#E07000] hover:text-black transition-colors border-2 border-transparent hover:border-black"
                >
                  GOT IT!
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- FOOTER: PAGE NUMBER --- */}
        <div className="h-8 bg-white border-t-[4px] border-black flex items-center justify-between px-2">
          <span className="font-pixel text-[10px] text-gray-500">PAGE 1 OF 1</span>
          <span className="font-pixel text-[10px] text-black">SEGA GENESIS VDP</span>
        </div>
      </div>
    </div>
  );
};

export default ComixZoneGame;
