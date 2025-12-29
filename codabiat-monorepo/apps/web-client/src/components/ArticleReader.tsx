import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { articles } from "../data";
import { Skull, Bomb, HandMetal, ArrowRight } from "lucide-react"; // جایگزین آیکون‌های پیکسلی

// --- TYPES & INTERFACES ---
interface ComicPanelProps {
  children: React.ReactNode;
  variant?: "narrator" | "speech" | "action";
  className?: string;
  delay?: number;
}

// --- STYLED COMPONENTS (TAILWIND WRAPPERS) ---

// 1. THE INVENTORY (NAVIGATION)
const InventorySlot: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}> = ({ icon, label, onClick, color }) => (
  <button
    onClick={onClick}
    className="group relative w-16 h-16 bg-black border-4 border-[#404040] flex items-center justify-center hover:border-white transition-all active:scale-95"
  >
    <div className={`absolute inset-1 ${color} opacity-20 group-hover:opacity-50 transition-opacity`}></div>
    <div className="relative z-10 text-white transform group-hover:scale-110 transition-transform">
      {icon}
    </div>
    {/* Tooltip styled as a comic caption */}
    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#FFCC00] text-black text-[10px] font-black px-2 py-1 border-2 border-black opacity-0 group-hover:opacity-100 whitespace-nowrap  uppercase tracking-widest">
      {label}
    </div>
  </button>
);

// 2. THE COMIC PANEL (CONTAINER)
const ComicPanel: React.FC<ComicPanelProps> = ({
  children,
  variant = "speech",
  className = "",
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Styles based on variant
  const baseStyle =
    "relative border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.5)] transition-all duration-500";
  const variants = {
    narrator: "bg-[#FFCC00] text-black font-bold uppercase tracking-widest p-4 transform -rotate-1", // Yellow Box
    speech: "bg-white text-black rounded-2xl p-8 md:p-10 transform rotate-1", // White Bubble
    action: "bg-[#E07000] text-white p-6 border-dashed transform -rotate-2", // Orange Action
  };

  if (!isVisible) return <div className="opacity-0 h-24"></div>; // Placeholder

  return (
    <div
      className={`${baseStyle} ${variants[variant]} ${className} animate-in fade-in zoom-in-95 duration-300`}
    >
      {children}
      {/* Ink Splatter Decoration */}
      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-black rounded-full opacity-20"></div>
    </div>
  );
};

// 3. TYPEWRITER TEXT WITH "MORTUS HAND"
const HandDrawnText: React.FC<{ text: string; speed?: number }> = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
        // Optional: Play sound effect here
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className="relative font-mono text-lg md:text-xl leading-relaxed">
      {displayedText}
      {/* The "Hand" Cursor */}
      <span
        className="inline-block w-3 h-6 bg-black ml-1 animate-pulse align-middle"
        title="Mortus Pen Tip"
      ></span>
    </span>
  );
};

// --- MAIN COMPONENT ---
const ArticleReader: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = articles.find((a) => a.id === id);
  const [pageTurn, setPageTurn] = useState(false);

  // Handle Page Turn Transition
  const handleExit = (path: string) => {
    setPageTurn(true); // Trigger animation
    setTimeout(() => navigate(path), 600); // Wait for animation
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-[#500050] flex flex-col items-center justify-center p-4">
        <ComicPanel variant="action" className="max-w-md text-center">
          <h1 className="text-6xl font-black mb-4">GAME OVER</h1>
          <p className="text-xl mb-6">DATA_NODE NOT FOUND</p>
          <button
            onClick={() => handleExit("/archive")}
            className="bg-black text-white px-6 py-3 font-bold hover:bg-[#006000] transition-colors border-2 border-white"
          >
            TRY AGAIN (ARCHIVE)
          </button>
        </ComicPanel>
      </div>
    );
  }

  return (
    // THE VOID (Artist's Desk Background)
    <div
      className={`min-h-screen bg-[#2a1a2a] relative overflow-x-hidden transition-transform duration-500 origin-bottom-right ${
        pageTurn ? "rotate-12 translate-y-full opacity-0" : ""
      }`}
    >
      {/* BACKGROUND TEXTURE (Scattered Pencils/Eraser - CSS Simulated) */}
      <div
        className="fixed inset-0 opacity-10 "
        style={{
          backgroundImage: "radial-gradient(#500050 2px, transparent 2px)",
          backgroundSize: "30px 30px",
        }}
      ></div>

      {/* --- UI LAYER: THE INVENTORY (Top Right) --- */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <InventorySlot
          icon={<Skull size={24} />}
          label="ARCHIVE"
          color="bg-yellow-500"
          onClick={() => handleExit("/archive")}
        />
        <InventorySlot
          icon={<Bomb size={24} />}
          label="SPOILERS"
          color="bg-red-500"
          onClick={() => alert("SECRETS REVEALED!")}
        />
        <InventorySlot
          icon={<HandMetal size={24} />}
          label="ACTION"
          color="bg-green-500"
          onClick={() => window.print()}
        />
      </div>

      {/* --- CONTENT LAYER: THE COMIC PAGE --- */}
      <div className="max-w-4xl mx-auto pt-24 pb-32 px-4 md:px-8 flex flex-col gap-8">
        {/* PANEL 1: NARRATOR BOX (Metadata) */}
        <ComicPanel variant="narrator" delay={100} className="self-start max-w-lg z-10">
          <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-2">
            <span>EPISODE 1: {article.category}</span>
            <span>{article.date}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase leading-none drop-shadow-md">
            {article.title}
          </h1>
        </ComicPanel>

        {/* PANEL 2: MAIN ART/EXCERPT (Visual Impact) */}
        <div className="relative group">
          {/* "POW!" Effect behind the panel */}
          <div className="absolute -top-10 -left-10 text-[#E07000] font-black text-8xl opacity-20 rotate-12 select-none z-0">
            WHAM!
          </div>

          <ComicPanel variant="speech" delay={300} className="z-10 border-b-8 border-r-8">
            <p className="text-2xl font-bold italic text-[#500050] mb-4">"{article.excerpt}"</p>
            <div className="h-1 w-full bg-black mb-6"></div>

            {/* Body Text with Typewriter Effect */}
            <div className="text-lg font-medium text-gray-900 space-y-6 text-justify">
              <p>
                <HandDrawnText text="ادبیات دیجیتال (Electronic Literature) گونه‌ای از ادبیات است که ویژگی‌های زیبایی‌شناختی و ادبی آن مستلزم پردازش رایانه‌ای است. این آثار نمی‌توانند روی کاغذ چاپ شوند بدون آنکه بخش مهمی از هویت خود را از دست بدهند." />
              </p>
              <p>
                در این پارادایم جدید، خواننده دیگر یک مصرف‌کننده منفعل نیست. او در فرآیند{" "}
                <span className="bg-[#FFCC00] px-1 border border-black font-bold">"اجرا"</span> اثر مشارکت
                می‌کند.
              </p>
            </div>
          </ComicPanel>
        </div>

        {/* PANEL 3: CODE BLOCK (The "Tech" Panel) */}
        <ComicPanel variant="action" delay={600} className="mx-auto w-full transform rotate-1">
          <h3 className="text-xl font-black mb-2 border-b-2 border-white/50 pb-1 inline-block">
            // SYSTEM_KERNEL_DUMP
          </h3>
          <div className="bg-black p-4 border-2 border-white shadow-inner relative overflow-hidden">
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.1)_50%)] bg-[length:100%_4px] "></div>

            <pre className="font-mono text-sm text-[#00FF00] overflow-x-auto" dir="ltr">
              {`function createPoem(emotion) {
  const memory = new Set();
  // INJECTING CHAOS...
  return glitch(emotion); 
}`}
            </pre>
          </div>
          <p className="mt-4 text-sm font-mono opacity-80">
            گلیچ لحظه‌ای است که ماشین، "ماشین بودن" خود را اعتراف می‌کند.
          </p>
        </ComicPanel>

        {/* PANEL 4: FOOTER / NEXT PAGE */}
        <div className="flex justify-end mt-8">
          <button
            onClick={() => handleExit("/archive")}
            className="relative bg-white border-4 border-black px-8 py-4 font-black text-xl hover:bg-[#FFCC00] hover:-translate-y-1 hover:shadow-[8px_8px_0px_black] transition-all flex items-center gap-2 group"
          >
            NEXT EPISODE
            <ArrowRight className="group-hover:translate-x-2 transition-transform" strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* PAGE CURL EFFECT (Bottom Right Corner) */}
      <div className="fixed bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-gray-300 to-transparent  opacity-50"></div>
    </div>
  );
};

export default ArticleReader;
