import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Zap, Skull } from "lucide-react";

interface CodePlaygroundProps {
  initialCode: string;
}

const CodePlayground: React.FC<CodePlaygroundProps> = ({ initialCode }) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Ref for the "Mortus Hand" animation
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCode(initialCode);
    setOutput([]);
    setError(null);
  }, [initialCode]);

  const runCode = () => {
    setOutput([]);
    setError(null);
    setIsAnimating(true);

    // Simulate "Mortus" drawing time
    setTimeout(() => {
      setIsAnimating(false);
    }, 1500);

    const logs: any[] = [];
    const customConsole = {
      log: (...args: any[]) => {
        logs.push(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" "));
      },
      error: (...args: any[]) => {
        logs.push(`ERROR: ${args.join(" ")}`);
      },
    };

    try {
      const executionFunction = new Function(
        "console",
        `
        try {
          ${code}
        } catch (err) {
          throw err;
        }
      `
      );
      executionFunction(customConsole);
      setOutput(logs);
    } catch (err: any) {
      setError(err.toString());
    }
  };

  return (
    <div className="relative w-full h-full p-6 bg-[#500050] overflow-hidden font-mono selection:bg-[#E07000] selection:text-white">
      {/* Background Texture Elements (Scattered Pencils/Paper) */}
      <div
        className="absolute top-0 left-0 w-full h-full opacity-10 "
        style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      ></div>

      {/* --- INVENTORY HEADER (Nav) --- */}
      <div className="flex justify-between items-end mb-4 relative z-10">
        {/* Metadata Box (Narrator Style) */}
        <div className="bg-[#FFCC00] border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
          <span className="block text-xs font-bold text-black tracking-widest uppercase">EPISODE 1</span>
          <span className="block text-lg font-black text-black">MAIN.TS</span>
        </div>

        {/* Action Slots (Inventory) */}
        <div className="flex gap-4">
          {/* Slot 1: Reset (The Rat) */}
          <button
            onClick={() => setCode(initialCode)}
            className="group relative w-12 h-12 bg-black border-2 border-[#E07000] flex items-center justify-center hover:bg-[#E07000] transition-all active:translate-y-1"
            title="بازنشانی (Reset)"
          >
            <div className="absolute inset-0 border border-white/20 "></div>
            <RotateCcw className="text-[#E07000] group-hover:text-black w-6 h-6" strokeWidth={3} />
          </button>

          {/* Slot 2: Run (The Fist) */}
          <button
            onClick={runCode}
            className="group relative w-12 h-12 bg-[#FFCC00] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
            title="اجرا (Action)"
          >
            <Play className="text-black w-6 h-6 fill-current" />
            {/* Spark Effect on Hover */}
            <Zap className="absolute -top-4 -right-4 text-white w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
          </button>
        </div>
      </div>

      <div className="flex flex-col h-[calc(100%-80px)] gap-6">
        {/* --- CODE EDITOR PANEL --- */}
        <div className="flex-grow relative group">
          {/* Panel Border Effect */}
          <div className="absolute inset-0 bg-black translate-x-2 translate-y-2"></div>
          <div className="relative h-full bg-[#1e1e1e] border-4 border-black p-1 z-10">
            {/* Inner White Frame */}
            <div className="h-full border-2 border-white/10 p-2">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-transparent text-[#E07000] font-mono text-sm p-2 outline-none resize-none leading-6 placeholder-gray-600"
                spellCheck={false}
                dir="ltr"
              />
            </div>
          </div>
          {/* Decorative "Tape" */}
          <div className="absolute -top-3 left-1/2 w-24 h-6 bg-[#E07000]/80 rotate-2 z-20 border border-black/50"></div>
        </div>

        {/* --- OUTPUT CONSOLE (Narrator Box / Speech Bubble) --- */}
        <div className="h-48 relative">
          {/* Shadow Block */}
          <div className="absolute inset-0 bg-black translate-x-2 translate-y-2"></div>

          {/* Main Container */}
          <div className="relative h-full bg-white border-4 border-black z-10 flex flex-col overflow-hidden">
            {/* Header Strip */}
            <div className="bg-black text-white px-2 py-1 text-[10px] font-bold uppercase tracking-widest flex justify-between items-center">
              <span>SEGA GENESIS VDP // OUTPUT</span>
              {error ? (
                <Skull size={12} className="text-red-500" />
              ) : (
                <div className="w-2 h-2 bg-[#006000] rounded-full animate-pulse"></div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-grow p-4 overflow-y-auto font-bold text-black relative" ref={outputRef}>
              {/* MORTUS HAND ANIMATION LAYER */}
              {isAnimating && (
                <div className="absolute inset-0 z-50  flex items-center bg-white/10 backdrop-blur-[1px]">
                  <div className="w-full h-2 bg-black animate-[width_1.5s_ease-in-out]"></div>
                  {/* Placeholder for Hand Sprite */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 text-6xl animate-bounce">✍️</div>
                </div>
              )}

              {output.length === 0 && !error && (
                <span className="text-gray-400 uppercase text-xs">Waiting for input...</span>
              )}

              {output.map((log, i) => (
                <div
                  key={i}
                  className="border-b-2 border-dashed border-gray-300 pb-1 mb-2 last:border-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <span className="text-[#E07000] mr-2 text-xl align-middle">►</span>
                  <span className="text-lg">{log}</span>
                </div>
              ))}

              {error && (
                <div className="bg-red-100 border-2 border-red-500 p-2 text-red-900 font-black uppercase text-sm transform rotate-1">
                  <span className="text-2xl block mb-1">POW!</span>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePlayground;
