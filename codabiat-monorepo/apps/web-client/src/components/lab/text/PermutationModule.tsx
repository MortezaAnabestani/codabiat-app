import React, { useState, useMemo } from "react";
import {
  Shuffle,
  Activity,
  Zap,
  Copy,
  Save,
  Search,
  Sliders,
  Database,
  ArrowRight,
  BarChart3,
  Terminal,
  Pin,
  MousePointer2,
} from "lucide-react";

interface PermutationItem {
  id: number;
  text: string;
  entropy: number;
  pinned: boolean;
}

export const PermutationModule: React.FC = () => {
  // --- LOGIC KERNEL (UNCHANGED) ---
  const [input, setInput] = useState("من فکر میکنم");
  const [items, setItems] = useState<PermutationItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pageSize, setPageSize] = useState(24);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<string>("");

  const words = useMemo(
    () =>
      input
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0),
    [input]
  );
  const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
  const totalPossible = useMemo(() => factorial(words.length), [words]);

  const calculateEntropy = (text: string) => {
    return Number((Math.random() * 0.9 + 0.1).toFixed(3));
  };

  const generatePermutations = () => {
    if (words.length === 0) return;
    if (words.length > 7) {
      alert("محدودیت سیستم: حداکثر ۷ کلمه برای جلوگیری از کرش موتور.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setItems([]);

    const permute = (arr: string[]): string[][] => {
      if (arr.length === 0) return [[]];
      const first = arr[0];
      const rest = arr.slice(1);
      const permsWithoutFirst = permute(rest);
      const allPerms: string[][] = [];
      permsWithoutFirst.forEach((perm) => {
        for (let i = 0; i <= perm.length; i++) {
          allPerms.push([...perm.slice(0, i), first, ...perm.slice(i)]);
        }
      });
      return allPerms;
    };

    let timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          const rawPerms = permute(words);
          const formatted = Array.from(new Set(rawPerms.map((p) => p.join(" ")))).map((p, i) => ({
            id: i,
            text: p,
            entropy: calculateEntropy(p),
            pinned: false,
          }));
          setItems(formatted);
          setIsProcessing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 50);
  };

  const togglePin = (id: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, pinned: !item.pinned } : item)));
  };

  const filteredItems = items.filter((i) => i.text.includes(filter));
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredItems.length / pageSize);

  // --- COMIX ZONE UI RENDER ---
  return (
    <div className="h-full flex flex-col bg-[#2a1a2a] p-4 md:p-6 overflow-hidden font-mono relative selection:bg-[#E07000] selection:text-black">
      {/* Background Texture (The Artist's Desk) */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#500050 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* HEADER: SEGA INVENTORY SLOTS */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8 shrink-0 z-10">
        <div className="flex items-center gap-4">
          {/* Slot 1: Icon */}
          <div className="w-16 h-16 bg-[#FFCC00] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transform -rotate-2">
            <Shuffle size={32} className="text-black" strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-[#E07000] font-black text-3xl uppercase tracking-tighter drop-shadow-[2px_2px_0px_#000]">
              EPISODE 1: PERMUTATION
            </h2>
            <div className="bg-black text-white text-[10px] px-2 py-1 inline-block -skew-x-12 mt-1">
              SEGA GENESIS VDP EMULATION // ACTIVE
            </div>
          </div>
        </div>

        {/* Status Slots */}
        <div className="flex gap-2">
          <div className="bg-[#006000] border-2 border-black p-2 shadow-[2px_2px_0px_0px_#000]">
            <span className="block text-[9px] text-[#90FF90] uppercase">Complexity</span>
            <span className="text-white font-bold">{totalPossible} VARS</span>
          </div>
          <div className="bg-[#500050] border-2 border-black p-2 shadow-[2px_2px_0px_0px_#000] flex items-center gap-2">
            <Activity
              size={16}
              className={isProcessing ? "text-[#E07000] animate-bounce" : "text-gray-400"}
            />
            <span className="text-white text-xs uppercase">{isProcessing ? "DRAWING..." : "READY"}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-grow overflow-hidden z-10">
        {/* LEFT PANEL: NARRATOR BOX (CONTROLS) */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 overflow-y-auto pr-2 custom-scrollbar">
          {/* Input Panel */}
          <div className="bg-[#FFCC00] border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
            <div className="absolute -top-3 -left-3 bg-white border-2 border-black px-2 py-1 text-[10px] font-bold uppercase transform -rotate-3">
              Input_Zone
            </div>

            <label className="text-xs font-bold text-black mb-2 block uppercase tracking-widest">
              ENTER DIALOGUE:
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-white border-2 border-black p-3 text-black text-lg outline-none focus:bg-[#E07000] focus:text-white transition-colors font-bold mb-4 placeholder:text-gray-400"
              placeholder="TYPE HERE..."
              dir="rtl"
            />

            <button
              onClick={generatePermutations}
              disabled={isProcessing || !input.trim()}
              className={`w-full py-4 font-black text-xl uppercase border-4 border-black shadow-[4px_4px_0px_0px_#000] transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-2
                                ${
                                  isProcessing
                                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                    : "bg-[#E07000] hover:bg-[#FF9900] text-white animate-pulse-slow"
                                }
                            `}
            >
              {isProcessing ? (
                <Zap size={24} className="animate-spin" />
              ) : (
                <span className="text-2xl">POW!</span>
              )}
              {isProcessing ? "SKETCHING..." : "GENERATE"}
            </button>
          </div>

          {/* Filters Panel */}
          <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-black font-black text-sm flex items-center gap-2 border-b-4 border-black pb-2 mb-4 uppercase">
              <Sliders size={16} strokeWidth={3} /> Ink Settings
            </h3>
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-3 text-black" />
              <input
                type="text"
                placeholder="FIND TEXT..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-[#eee] border-2 border-black py-2 pl-9 pr-4 text-xs text-black font-bold outline-none focus:border-[#E07000]"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-black uppercase">
                <span>Chaos_Level</span>
                <span className="text-[#E07000]">MAX</span>
              </div>
              <input
                type="range"
                className="w-full accent-[#E07000] h-2 bg-black rounded-none appearance-none cursor-pointer border border-black"
              />
            </div>
          </div>

          {/* Progress Bar (Ink Bottle Style) */}
          {isProcessing && (
            <div className="bg-black border-2 border-white p-4 shadow-[4px_4px_0px_0px_#E07000]">
              <div className="flex justify-between text-[10px] font-mono text-[#E07000] mb-2 uppercase">
                <span>INK_LEVEL</span>
                <span>{progress}%</span>
              </div>
              <div className="h-4 bg-[#333] border border-[#555] relative overflow-hidden">
                <div
                  className="h-full bg-[#E07000] transition-all duration-100"
                  style={{
                    width: `${progress}%`,
                    backgroundImage:
                      "linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)",
                    backgroundSize: "1rem 1rem",
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: THE COMIC PAGE (RESULTS) */}
        <div className="flex-grow flex flex-col bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] relative overflow-hidden">
          {/* Page Header */}
          <div className="bg-black px-4 py-3 flex justify-between items-center shrink-0 border-b-4 border-black">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 border border-white ${items.length > 0 ? "bg-[#E07000]" : "bg-gray-600"}`}
              ></div>
              <span className="text-xs font-bold text-white uppercase tracking-widest">PANEL_LAYOUT_V1</span>
            </div>
            <div className="flex gap-2">
              {[10, 24, 50].map((s) => (
                <button
                  key={s}
                  onClick={() => setPageSize(s)}
                  className={`text-[10px] font-bold px-2 py-1 border-2 transition-colors ${
                    pageSize === s
                      ? "bg-[#E07000] border-white text-black"
                      : "border-gray-600 text-gray-400 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
              <button className="text-white hover:text-[#E07000] transition-colors ml-2">
                <Save size={18} />
              </button>
            </div>
          </div>

          {/* The Gutter (Content Area) */}
          <div
            className="flex-grow overflow-y-auto p-6 bg-[#f0f0f0] custom-scrollbar"
            style={{
              backgroundImage: "radial-gradient(#ccc 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          >
            {items.length === 0 && !isProcessing ? (
              <div className="h-full flex flex-col items-center justify-center opacity-50">
                <Database size={60} className="mb-4 text-black" strokeWidth={1.5} />
                <h4 className="font-black text-2xl text-black mb-2 uppercase transform -rotate-2">
                  NO DATA FOUND!
                </h4>
                <p className="font-mono text-xs bg-black text-white px-2 py-1">WAITING FOR ARTIST INPUT...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`group relative p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]
                                            ${
                                              item.pinned
                                                ? "bg-[#006000] border-4 border-black text-white"
                                                : "bg-white border-4 border-black text-black"
                                            }
                                            ${item.id % 2 === 0 ? "rotate-1" : "-rotate-1"}
                                        `}
                    style={{ borderRadius: "20px 20px 20px 0px" }} // Speech bubble shape
                  >
                    {/* Speech Bubble Tail */}
                    {!item.pinned && (
                      <div
                        className="absolute -bottom-[4px] -left-[4px] w-4 h-4 bg-black"
                        style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }}
                      ></div>
                    )}
                    {!item.pinned && (
                      <div
                        className="absolute bottom-[0px] left-[0px] w-3 h-3 bg-white z-10"
                        style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }}
                      ></div>
                    )}

                    {/* Entropy Badge */}
                    <div className="absolute -top-3 -right-2 z-20">
                      <div
                        className={`border-2 border-black px-1.5 py-0.5 text-[9px] font-bold font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]
                                                ${
                                                  item.pinned
                                                    ? "bg-[#E07000] text-black"
                                                    : "bg-black text-[#E07000]"
                                                }
                                            `}
                      >
                        E:{item.entropy}
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-sm font-bold leading-relaxed mb-4 font-mono" dir="rtl">
                      {item.text}
                    </p>

                    {/* Action Footer */}
                    <div
                      className={`flex justify-between items-center mt-2 pt-2 border-t-2 border-dashed ${
                        item.pinned ? "border-white/30" : "border-black/20"
                      }`}
                    >
                      <span className="text-[9px] font-mono opacity-70">#{item.id}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => togglePin(item.id)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Pin size={14} fill={item.pinned ? "currentColor" : "none"} />
                        </button>
                        <button
                          className="hover:scale-110 transition-transform"
                          onClick={() => navigator.clipboard.writeText(item.text)}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Mortus Hand Cursor Hint (Visual only) */}
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <MousePointer2 size={20} className="text-black fill-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination Footer (Page Turn) */}
          {totalPages > 1 && (
            <div className="p-3 bg-white border-t-4 border-black flex justify-between items-center px-6 shrink-0 relative">
              {/* Page Curl Effect */}
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-gray-400 to-transparent pointer-events-none"></div>

              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="p-1 border-2 border-black hover:bg-black hover:text-white disabled:opacity-20 transition-colors"
                >
                  <ArrowRight size={16} className="rotate-180" />
                </button>
                <div className="flex items-center gap-2 text-sm font-black bg-black text-white px-3 border-2 border-black transform -skew-x-12">
                  <span className="text-[#E07000]">{currentPage}</span>
                  <span>/</span>
                  <span>{totalPages}</span>
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="p-1 border-2 border-black hover:bg-black hover:text-white disabled:opacity-20 transition-colors"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
              <div className="hidden md:flex items-center gap-4 text-[10px] font-bold text-black uppercase">
                <span className="flex items-center gap-1">
                  <BarChart3 size={12} /> MEAN_ENTROPY: 0.742
                </span>
                <span className="flex items-center gap-1">
                  <Terminal size={12} /> NODES: {filteredItems.length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
