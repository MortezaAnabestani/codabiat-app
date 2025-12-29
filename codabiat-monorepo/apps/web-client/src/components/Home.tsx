import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Skull, Zap, HandMetal, Scroll, Bomb, ArrowLeft, User } from "lucide-react"; // Icons mapped to Game Items
import { useLanguage } from "../LanguageContext";

// --- CONSTANTS & THEME CONFIG ---
const THEME = {
  colors: {
    mutantOrange: "#E07000",
    sewerSludge: "#006000",
    bruisedPurple: "#500050",
    sketchWhite: "#FFFFFF",
    inkBlack: "#000000",
    paper: "#F4F4F4",
  },
};

// --- SUB-COMPONENT: MORTUS HAND WRITER ---
// شبیه‌سازی دست شرور که متن را می‌نویسد
const MortusWriter: React.FC<{ text: string; delay?: number; className?: string }> = ({
  text,
  delay = 0,
  className = "",
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isWriting, setIsWriting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const startWriting = setTimeout(() => {
      setIsWriting(true);
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i === text.length) {
          clearInterval(interval);
          setIsWriting(false);
        }
      }, 50); // Typing speed
      return () => clearInterval(interval);
    }, delay);

    return () => {
      clearTimeout(startWriting);
    };
  }, [text, delay]);

  return (
    <div className={`relative inline-block ${className}`}>
      <span>{displayedText}</span>
      {isWriting && (
        <span className="absolute -right-6 -top-4 animate-bounce text-2xl filter drop-shadow-lg">✍️</span>
      )}
      <span className="invisible">{text}</span> {/* Layout placeholder */}
    </div>
  );
};

// --- SUB-COMPONENT: COMIC PANEL ---
// پنل‌های کمیک با حاشیه جوهری و لرزش دست
const ComicPanel: React.FC<{
  children: React.ReactNode;
  variant?: "normal" | "action" | "narrator";
  className?: string;
  delay?: number;
}> = ({ children, variant = "normal", className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), delay);
  }, [delay]);

  if (!isVisible) return <div className="opacity-0" />;

  const borderStyle =
    variant === "narrator"
      ? "border-4 border-black bg-[#FFCC00]" // Yellow Box
      : "border-[3px] border-black bg-white"; // Standard Panel

  // Random slight rotation for "Hand-drawn" feel
  const rotation = Math.random() > 0.5 ? "rotate-1" : "-rotate-1";

  return (
    <div
      className={`relative p-4 shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-transform hover:scale-[1.02] ${borderStyle} ${rotation} ${className}`}
    >
      {children}
      {/* Corner Ink Blot Detail */}
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black clip-path-polygon-[100%_0,0_100%,100%_100%]" />
    </div>
  );
};

const Home: React.FC = () => {
  const { t, dir, lang } = useLanguage();
  const [pageTurn, setPageTurn] = useState(false);
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null);

  // Handle "POW!" click effect
  const handleClick = (e: React.MouseEvent) => {
    setClickPos({ x: e.clientX, y: e.clientY });
    setTimeout(() => setClickPos(null), 500);
  };

  // Page Load Transition (Episode Title Card)
  useEffect(() => {
    setPageTurn(true);
    const timer = setTimeout(() => setPageTurn(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      onClick={handleClick}
      className={`min-h-screen  overflow-x-hidden cursor-crosshair pointer-events-auto ${
        dir === "rtl" ? "font-sans" : "font-sans-en"
      }`}
      style={{
        backgroundColor: "#2a2a2a", // Dark Desk Texture
        backgroundImage: `radial-gradient(${THEME.colors.bruisedPurple} 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      }}
      dir={dir}
    >
      {/* --- CLICK EFFECT (POW!) --- */}
      {clickPos && (
        <div
          className="fixed z-50  text-4xl font-black text-[#E07000] animate-ping"
          style={{ top: clickPos.y - 20, left: clickPos.x - 20, textShadow: "2px 2px 0 #000" }}
        >
          POW!
        </div>
      )}

      {/* --- EPISODE TITLE CARD OVERLAY --- */}
      {pageTurn && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center flex-col text-white">
          <h1 className="text-6xl font-black tracking-tighter animate-pulse text-[#E07000]">EPISODE 1</h1>
          <p className="text-2xl mt-4 font-mono text-white">"NIGHT OF THE MUTANTS"</p>
        </div>
      )}

      {/* --- THE INVENTORY (HEADER) --- */}
      <header className="fixed top-4 right-4 z-40 flex gap-2">
        {/* Slot 1: Login/User */}
        <Link to="/login" className="group relative w-16 h-16 bg-black border-2 border-white p-1">
          <div className="w-full h-full bg-[#E07000] flex items-center justify-center group-hover:bg-green-400 transition-colors">
            <User className="text-black w-8 h-8" />
          </div>
          <span className="absolute -bottom-8 right-0 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
            Login
          </span>
        </Link>

        {/* Slot 3: Dynamite (Archive) */}
        <Link to="/archive" className="group relative w-16 h-16 bg-black border-2 border-white p-1">
          <div className="w-full h-full bg-[#E07000] flex items-center justify-center group-hover:bg-red-500 transition-colors">
            <Bomb className="text-black w-8 h-8" />
          </div>
          <span className="absolute -bottom-8 right-0 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
            Archive
          </span>
        </Link>

        {/* Slot 4: Fist (Action/Lab) */}
        <Link to="/lab" className="group relative w-16 h-16 bg-black border-2 border-white p-1">
          <div className="w-full h-full bg-[#E07000] flex items-center justify-center group-hover:bg-yellow-500 transition-colors">
            <HandMetal className="text-black w-8 h-8" />
          </div>
          <span className="absolute -bottom-8 right-0 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
            Start Lab
          </span>
        </Link>
      </header>

      {/* --- MAIN COMIC PAGE LAYOUT --- */}
      <main className="max-w-6xl mx-auto py-12 px-4 md:px-8 relative">
        {/* The "Paper" Background */}
        <div className="absolute inset-0 bg-white shadow-2xl transform rotate-1 z-0 " />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          {/* PANEL 1: HERO (Full Width) */}
          <ComicPanel className="md:col-span-12 min-h-[400px] flex flex-col justify-center items-center bg-gradient-to-b from-blue-900 to-black text-white overflow-hidden">
            {/* Background Art Simulation */}
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

            {/* Narrator Box */}
            <div className="absolute top-4 left-4 bg-[#FFCC00] border-2 border-black p-2 shadow-[4px_4px_0_#000] transform -rotate-2">
              <p className="text-black font-bold text-sm uppercase tracking-widest">
                گروه توسعه و آموزش ادبیات الکترونیک فارسی
              </p>
            </div>

            {/* Main Title */}
            <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#E07000] to-[#FFCC00] drop-shadow-[4px_4px_0_#000] transform -skew-x-12 z-10">
              کدبیات
            </h1>

            {/* Speech Bubble (Breaking 4th Wall) */}
            <div className="mt-8 bg-white text-black p-6 rounded-[50%] relative max-w-md text-center border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
              <p className="text-xl font-bold font-mono leading-tight translate-y-4">
                <MortusWriter
                  text="به دنیای کدبیات خوش آمدی! اینجا جایی است که ادبیات و کدنویسی به هم می‌رسند..."
                  delay={2000}
                />
              </p>
              {/* Bubble Tail */}
              <div className="absolute -bottom-4 left-1/2 w-8 h-8 bg-white border-r-4 border-b-4 border-black transform rotate-45 translate-x-[-50%]"></div>
            </div>
          </ComicPanel>

          {/* PANEL 2: ACADEMY (Vertical) */}
          <ComicPanel className="md:col-span-4 min-h-[300px] bg-[#006000]" delay={500}>
            <div className="h-full flex flex-col justify-between text-white">
              <div className="border-b-4 border-black pb-2 mb-4">
                <h2 className="text-3xl font-black uppercase text-[#FFCC00] drop-shadow-[2px_2px_0_#000]">
                  ACADEMY
                </h2>
              </div>
              <p className="font-mono text-sm leading-relaxed mb-4">
                "برای زنده ماندن در این صفحه، باید یاد بگیری چطور کد بزنی..."
              </p>
              <Link
                to="/learn"
                className="self-end bg-black text-white px-4 py-2 font-bold hover:bg-[#E07000] hover:text-black transition-colors border-2 border-white shadow-[4px_4px_0_#000]"
              >
                ENTER ZONE &gt;
              </Link>
            </div>
            {/* Floating Onomatopoeia */}
            <span className="absolute top-2 right-2 text-4xl font-black text-white opacity-20 rotate-12">
              LEARN!
            </span>
          </ComicPanel>

          {/* PANEL 3: LAB (Square) */}
          <ComicPanel className="md:col-span-4 bg-[#500050]" delay={800}>
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Zap size={64} className="text-[#E07000] mb-4 filter drop-shadow-[4px_4px_0_#000]" />
              <h2 className="text-4xl font-black text-white mb-2 transform -rotate-3">THE LAB</h2>
              <p className="text-white font-mono text-xs mb-4">Experimental Zone</p>
              <Link
                to="/lab"
                className="w-full bg-[#E07000] border-2 border-black font-black py-2 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_#000] transition-all"
              >
                TEST IT!
              </Link>
            </div>
          </ComicPanel>

          {/* PANEL 4: STATS (Data Box) */}
          <ComicPanel className="md:col-span-4 bg-white" delay={1100}>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="font-bold bg-black text-white px-2">LESSONS</span>
                <span className="font-mono text-2xl font-black text-[#E07000]">50+</span>
              </div>
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="font-bold bg-black text-white px-2">ARTICLES</span>
                <span className="font-mono text-2xl font-black text-[#006000]">100+</span>
              </div>
              <div className="mt-4 bg-gray-200 p-2 border-2 border-black text-xs font-mono">
                STATUS: <span className="text-green-600 font-bold">INFECTED WITH KNOWLEDGE</span>
              </div>
            </div>
          </ComicPanel>

          {/* PANEL 5: FOOTER / EXIT (Wide) */}
          <ComicPanel className="md:col-span-12 bg-black text-white mt-8" variant="action">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-left">
                <h3 className="text-[#E07000] font-black text-2xl">END OF PAGE 1</h3>
                <p className="text-gray-400 font-mono text-sm">© 2024 Electronic Literature Platform.</p>
              </div>

              <div className="flex gap-4">
                <a href="#" className="text-white hover:text-[#E07000] font-mono underline decoration-wavy">
                  Github
                </a>
                <a href="#" className="text-white hover:text-[#E07000] font-mono underline decoration-wavy">
                  Twitter
                </a>
              </div>

              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-[#E07000] transform translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
                <div className="relative bg-white text-black border-2 border-black px-6 py-3 font-black uppercase tracking-widest flex items-center gap-2">
                  NEXT EPISODE <ArrowLeft className={`w-5 h-5 ${dir === "rtl" ? "" : "rotate-180"}`} />
                </div>
              </div>
            </div>
          </ComicPanel>
        </div>
      </main>

      {/* --- DECORATIVE ELEMENTS (The Artist's Desk) --- */}
      <div
        className="fixed bottom-10 left-10 w-64 h-4 bg-yellow-600 transform -rotate-45 shadow-xl rounded-full z-0 opacity-80 "
        title="Pencil"
      ></div>
      <div
        className="fixed top-20 left-10 w-20 h-32 bg-pink-300 transform rotate-12 shadow-xl rounded z-0 opacity-80 "
        title="Eraser"
      ></div>
    </div>
  );
};

export default Home;
