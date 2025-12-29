import React, { useState, useEffect, useRef } from "react";
import { Bomb, Skull, HandMetal, Zap, Send, Menu, X, ChevronRight, AlertTriangle } from "lucide-react";
import { interactWithStory } from "../../../services/geminiService";

// --- 1. THEME CONSTANTS (SEGA GENESIS PALETTE) ---
const THEME = {
  mutantOrange: "#E07000",
  sewerSludge: "#006000",
  bruisedPurple: "#500050",
  sketchWhite: "#FFFFFF",
  inkBlack: "#000000",
  paperYellow: "#FFCC00",
};

// --- Types ---
interface Message {
  id: string;
  sender: "ai" | "user" | "system";
  text: string;
  type?: "narrator" | "speech" | "thought"; // Comic specific types
}

interface GameStats {
  hp: number; // Health
  ink: number; // Neural Load equivalent
  page: number; // Progress
}

// --- 2. MORTUS HAND COMPONENT (The Drawing Mechanic) ---
const MortusDrawer: React.FC<{ text: string; onComplete?: () => void }> = ({ text, onComplete }) => {
  const [visibleChars, setVisibleChars] = useState(0);
  const [isDrawing, setIsDrawing] = useState(true);

  useEffect(() => {
    if (visibleChars < text.length) {
      const timeout = setTimeout(() => {
        setVisibleChars((prev) => prev + 1);
      }, 30); // Speed of drawing
      return () => clearTimeout(timeout);
    } else {
      setIsDrawing(false);
      if (onComplete) onComplete();
    }
  }, [visibleChars, text, onComplete]);

  return (
    <div className="relative inline-block w-full">
      <span className="font-vt323 text-lg md:text-xl leading-tight text-black">
        {text.slice(0, visibleChars)}
      </span>

      {/* The Hand Sprite Animation */}
      {isDrawing && (
        <div
          className="absolute z-50  transition-all duration-75"
          style={{
            left: "100%", // Simplified: In a real engine, we'd calculate X/Y coordinates of the last char
            bottom: "-10px",
            transform: "translateX(-20px)",
          }}
        >
          {/* Pixel Art Hand Placeholder */}
          <div
            className="w-12 h-12 bg-no-repeat bg-contain drop-shadow-2xl filter contrast-125"
            style={{
              backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Right_hand.svg/1200px-Right_hand.svg.png')`, // Placeholder for Mortus Hand
              transform: "rotate(-15deg) scaleX(-1)",
            }}
          >
            {/* Pen Tip Spark */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-white rounded-full animate-ping" />
          </div>
        </div>
      )}
    </div>
  );
};

// --- 3. COMIC PANEL COMPONENT ---
const ComicPanel: React.FC<{ msg: Message; isLast: boolean }> = ({ msg, isLast }) => {
  // Random slight rotation for "Hand Drawn" feel
  const rotation = useRef(Math.random() * 2 - 1).current;

  if (msg.sender === "system") {
    return (
      <div className="relative mb-8 w-full flex justify-center z-10">
        <div
          className="bg-[#FFCC00] border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <span className="font-vt323 text-black uppercase tracking-widest font-bold text-sm md:text-base">
            {msg.text}
          </span>
        </div>
      </div>
    );
  }

  const isUser = msg.sender === "user";

  return (
    <div className={`relative mb-12 flex ${isUser ? "justify-end" : "justify-start"} group`}>
      {/* Background Onomatopoeia (Visual Depth) */}
      {!isUser && isLast && (
        <div className="absolute -top-6 -left-4 text-6xl font-black text-red-600 opacity-20 rotate-12 select-none  font-comic z-0">
          KRACK!
        </div>
      )}

      {/* The Panel Itself */}
      <div
        className={`
          relative z-10 max-w-[85%] md:max-w-[70%] p-6 border-[3px] border-black
          ${isUser ? "bg-white rounded-[20px] rounded-br-none" : "bg-white rounded-[30px] rounded-tl-none"}
          shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
          transition-transform duration-300 hover:scale-[1.02]
        `}
        style={{
          transform: `rotate(${rotation}deg)`,
          clipPath: isUser
            ? "polygon(0% 0%, 100% 0%, 100% 100%, 90% 100%, 100% 110%, 80% 100%, 0% 100%)"
            : "none", // Rough thought bubble shape for user
        }}
      >
        {/* Speech Bubble Tail */}
        {!isUser && (
          <div className="absolute -top-[20px] -left-[2px] w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-black border-r-[0px] border-r-transparent">
            <div className="absolute top-[3px] -left-[16px] w-0 h-0 border-l-[16px] border-l-transparent border-b-[16px] border-b-white border-r-[0px] border-r-transparent"></div>
          </div>
        )}

        {/* Content */}
        <div className="font-comic text-black text-lg leading-relaxed">
          {isLast && msg.sender === "ai" ? <MortusDrawer text={msg.text} /> : msg.text}
        </div>

        {/* Metadata Footer inside Panel */}
        <div className="mt-2 pt-2 border-t-2 border-black/10 flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase font-mono">
            {isUser ? "PLAYER_INPUT" : "NARRATIVE_AI"}
          </span>
          <span className="text-[10px] font-bold text-red-600">{msg.id.split("-")[1]}</span>
        </div>
      </div>
    </div>
  );
};

// --- 4. MAIN MODULE ---
export const InteractiveFictionModule: React.FC = () => {
  // Inject Fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Bangers&family=VT323&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "sys-1",
      sender: "system",
      text: "EPISODE 1: NIGHT OF THE MUTANTS",
    },
    {
      id: "ai-1",
      sender: "ai",
      text: "فاضلاب‌های نیویورک... بوی تعفن و مرگ می‌دهد. اسکچ ترنر، تو اینجا گیر افتادی. تنها راه خروج از این حفره، عبور از میان جهش‌یافته‌هاست. صدای خش‌خش از لوله سمت راست می‌آید. چه می‌کنی؟",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<GameStats>({ hp: 100, ink: 80, page: 1 });
  const [actions, setActions] = useState(["بررسی لوله", "مشت زدن به دیوار", "فریاد زدن"]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleAction = async (text: string) => {
    if (!text.trim() || loading) return;

    // 1. Add User Panel
    const userMsg: Message = {
      id: `p-${Date.now()}`,
      sender: "user",
      text: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    // 2. Simulate "Page Turn" / Processing
    try {
      const history = messages.map((m) => `${m.sender}: ${m.text}`).join("\n");
      const prompt = `
        CONTEXT: You are the narrator of a gritty 90s comic book game like "Comix Zone". 
        STYLE: Use punchy, dramatic language. Include sound effects like *POW!* or *SWISH!*.
        SCENARIO: Post-apocalyptic mutant world.
        HISTORY: ${history}
        USER ACTION: ${text}
        TASK: Write the next comic panel narration (max 60 words).
      `;

      const response = await interactWithStory(prompt, "Write a comic book narration.");

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: response,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setActions(["حمله سریع", "دفاع", "فرار", "استفاده از آیتم"].sort(() => Math.random() - 0.5));
      setStats((prev) => ({ ...prev, hp: Math.max(0, prev.hp - 5), page: prev.page + 1 }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#1a1a1a] font-sans relative">
      {/* --- BACKGROUND: THE ARTIST'S DESK --- */}
      <div
        className="absolute inset-0 z-0 opacity-30 "
        style={{
          backgroundImage: `radial-gradient(#333 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* --- HEADER: INVENTORY SLOTS (UI MAPPING) --- */}
      <div className="h-20 bg-[#000] border-b-4 border-[#E07000] flex items-center justify-between px-4 z-50 shadow-xl">
        {/* Left: Character Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-400 border-2 border-black overflow-hidden relative">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sketch"
              alt="Hero"
              className="w-full h-full object-cover grayscale contrast-125"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black text-white text-[8px] text-center font-mono">
              SKETCH
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[#E07000] font-vt323 text-xl">HP</span>
              <div className="w-24 h-4 bg-gray-800 border border-gray-600 skew-x-[-10deg]">
                <div className="h-full bg-green-600" style={{ width: `${stats.hp}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Item Slots (Nav) */}
        <div className="flex gap-3">
          {[
            { icon: <Skull size={20} />, label: "ABOUT", color: "bg-gray-200" },
            { icon: <Bomb size={20} />, label: "SPOILER", color: "bg-red-500" },
            { icon: <HandMetal size={20} />, label: "ACTION", color: "bg-yellow-400" },
          ].map((slot, i) => (
            <button
              key={i}
              className={`
                    w-12 h-12 ${slot.color} border-2 border-black shadow-[2px_2px_0px_0px_#fff] 
                    flex items-center justify-center hover:translate-y-1 hover:shadow-none transition-all
                    group relative
                `}
            >
              <div className="text-black group-hover:scale-110 transition-transform">{slot.icon}</div>
              {/* Tooltip */}
              <div className="absolute -bottom-8 bg-black text-white text-[8px] px-2 py-1 opacity-0 group-hover:opacity-100 font-mono whitespace-nowrap z-50">
                {slot.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* --- MAIN CONTENT: THE COMIC PAGE --- */}
      <div className="flex-grow flex justify-center overflow-hidden relative">
        <div className="w-full max-w-3xl h-full bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col border-x-8 border-black relative">
          {/* Page Header */}
          <div className="h-8 bg-black flex justify-between items-center px-4">
            <span className="text-white font-vt323 text-lg">ISSUE #{stats.page}</span>
            <span className="text-[#E07000] font-vt323 text-lg">SEGA GENESIS VDP</span>
          </div>

          {/* Scrollable Panels Area */}
          <div
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-6 md:p-10 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"
          >
            {messages.map((msg, idx) => (
              <ComicPanel key={msg.id} msg={msg} isLast={idx === messages.length - 1} />
            ))}

            {loading && (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin text-black">
                  <Zap size={40} fill="black" />
                </div>
                <span className="ml-3 font-bangers text-2xl tracking-widest animate-pulse">DRAWING...</span>
              </div>
            )}
          </div>

          {/* --- FOOTER: ACTION STRIP (User Input) --- */}
          <div className="p-4 bg-[#111] border-t-4 border-[#E07000] relative z-20">
            {/* Suggested Actions */}
            {!loading && (
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {actions.map((act, i) => (
                  <button
                    key={i}
                    onClick={() => handleAction(act)}
                    className="px-4 py-2 bg-white border-2 border-black shadow-[3px_3px_0px_#E07000] 
                                           font-vt323 text-xl hover:bg-[#E07000] hover:text-white hover:shadow-none 
                                           hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase"
                  >
                    {act}
                  </button>
                ))}
              </div>
            )}

            {/* Input Field */}
            <div className="relative flex items-center max-w-2xl mx-auto">
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#E07000] border-y-2 border-l-2 border-black flex items-center justify-center z-10">
                <Menu className="text-black" />
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAction(inputValue)}
                placeholder="دستور بعدی را بنویسید..."
                className="w-full h-12 pl-14 pr-14 bg-white border-2 border-black font-vt323 text-xl focus:outline-none focus:ring-4 focus:ring-[#E07000]/50"
                dir="rtl"
                disabled={loading}
              />
              <button
                onClick={() => handleAction(inputValue)}
                disabled={loading}
                className="absolute right-0 top-0 bottom-0 w-14 bg-black text-white hover:bg-[#E07000] transition-colors flex items-center justify-center border-2 border-black"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Styles for Comic Fonts */}
      <style>{`
        .font-bangers { font-family: 'Bangers', cursive; }
        .font-vt323 { font-family: 'VT323', monospace; }
        .font-comic { font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif; } /* Fallback if custom font fails */
        
        /* Custom Scrollbar for that retro feel */
        .custom-scrollbar::-webkit-scrollbar {
            width: 12px;
            background: #000;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #E07000;
            border: 2px solid #000;
        }
      `}</style>
    </div>
  );
};
