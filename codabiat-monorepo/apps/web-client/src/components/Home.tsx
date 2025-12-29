import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Zap, HandMetal, Bomb, ArrowLeft, User } from "lucide-react"; // Icons mapped to Game Items
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
      }, 50);
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
        <span className="absolute -right-4 -top-4 md:-right-6 animate-bounce text-xl md:text-2xl filter drop-shadow-lg z-50">
          ✍️
        </span>
      )}
      <span className="invisible">{text}</span>
    </div>
  );
};

// --- SUB-COMPONENT: COMIC PANEL ---
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
    variant === "narrator" ? "border-4 border-black bg-[#FFCC00]" : "border-[3px] border-black bg-white";

  // Rotation reduced on mobile for better readability
  const rotation = Math.random() > 0.5 ? "md:rotate-1" : "md:-rotate-1";

  return (
    <div
      className={`relative p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-transform hover:scale-[1.01] md:hover:scale-[1.02] ${borderStyle} ${rotation} ${className}`}
    >
      {children}
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-black clip-path-polygon-[100%_0,0_100%,100%_100%]" />
    </div>
  );
};

const Home: React.FC = () => {
  const { dir } = useLanguage(); // Removed unused 't' and 'lang'
  const [pageTurn, setPageTurn] = useState(false);
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click effect on interactive elements to avoid visual clutter
    if ((e.target as HTMLElement).closest("a") || (e.target as HTMLElement).closest("button")) return;

    setClickPos({ x: e.clientX, y: e.clientY });
    setTimeout(() => setClickPos(null), 500);
  };

  useEffect(() => {
    setPageTurn(true);
    const timer = setTimeout(() => setPageTurn(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      onClick={handleClick}
      className={`min-h-screen w-full overflow-x-hidden cursor-crosshair pointer-events-auto ${
        dir === "rtl" ? "font-sans" : "font-sans-en"
      }`}
      style={{
        backgroundColor: "#2a2a2a",
        backgroundImage: `radial-gradient(${THEME.colors.bruisedPurple} 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      }}
      dir={dir}
    >
      {/* --- CLICK EFFECT (POW!) --- */}
      {clickPos && (
        <div
          className="fixed z-50 text-2xl md:text-4xl font-black text-[#E07000] animate-ping pointer-events-none"
          style={{ top: clickPos.y - 20, left: clickPos.x - 20, textShadow: "2px 2px 0 #000" }}
        >
          POW!
        </div>
      )}

      {/* --- EPISODE TITLE CARD OVERLAY --- */}
      {pageTurn && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center flex-col text-white p-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter animate-pulse text-[#E07000]">
            EPISODE 1
          </h1>
          <p className="text-xl md:text-2xl mt-4 font-mono text-white">"NIGHT OF THE MUTANTS"</p>
        </div>
      )}

      {/* --- THE INVENTORY (HEADER) - RESPONSIVE --- */}
      <header className="fixed top-2 right-2 md:top-4 md:right-4 z-40 flex gap-1 md:gap-2 scale-90 md:scale-100 origin-top-right">
        {/* Slot 1: Login */}
        <Link
          to="/login"
          className="group relative w-12 h-12 md:w-16 md:h-16 bg-black border-2 border-white p-0.5 md:p-1"
        >
          <div className="w-full h-full bg-[#E07000] flex items-center justify-center group-hover:bg-green-400 transition-colors">
            <User className="text-black w-6 h-6 md:w-8 md:h-8" />
          </div>
          <span className="hidden md:block absolute -bottom-8 right-0 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap">
            Login
          </span>
        </Link>

        {/* Slot 2: Archive */}
        <Link
          to="/archive"
          className="group relative w-12 h-12 md:w-16 md:h-16 bg-black border-2 border-white p-0.5 md:p-1"
        >
          <div className="w-full h-full bg-[#E07000] flex items-center justify-center group-hover:bg-red-500 transition-colors">
            <Bomb className="text-black w-6 h-6 md:w-8 md:h-8" />
          </div>
        </Link>

        {/* Slot 3: Lab */}
        <Link
          to="/lab"
          className="group relative w-12 h-12 md:w-16 md:h-16 bg-black border-2 border-white p-0.5 md:p-1"
        >
          <div className="w-full h-full bg-[#E07000] flex items-center justify-center group-hover:bg-yellow-500 transition-colors">
            <HandMetal className="text-black w-6 h-6 md:w-8 md:h-8" />
          </div>
        </Link>
      </header>

      {/* --- MAIN COMIC PAGE LAYOUT --- */}
      <main className="max-w-6xl mx-auto py-8 md:py-12 px-3 md:px-8 relative">
        {/* The "Paper" Background */}
        <div className="absolute inset-0 bg-white shadow-2xl transform md:rotate-1 z-0 mx-2 md:mx-0 h-full" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 p-2 md:p-6 pb-20">
          {/* PANEL 1: HERO (Full Width) */}
          <ComicPanel className="col-span-1 md:col-span-12 min-h-[350px] md:min-h-[400px] flex flex-col justify-center items-center bg-gradient-to-b from-blue-900 to-black text-white overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

            {/* Narrator Box */}
            <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-[#FFCC00] border-2 border-black p-1 md:p-2 shadow-[2px_2px_0_#000] md:shadow-[4px_4px_0_#000] transform -rotate-2 max-w-[80%]">
              <p className="text-black font-bold text-xs md:text-sm uppercase tracking-widest">
                گروه توسعه و آموزش ادبیات الکترونیک فارسی
              </p>
            </div>

            {/* Main Title - Responsive Text */}
            <h1 className="mt-8 md:mt-0 text-5xl md:text-7xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#E07000] to-[#FFCC00] drop-shadow-[3px_3px_0_#000] md:drop-shadow-[4px_4px_0_#000] transform -skew-x-12 z-10 text-center leading-tight">
              کدبیات
            </h1>

            {/* Speech Bubble */}
            <div className="mt-6 md:mt-8 bg-white text-black p-4 md:p-6 rounded-[2rem] relative max-w-[90%] md:max-w-md text-center border-4 border-black shadow-[6px_6px_0_rgba(0,0,0,0.5)]">
              <p className="text-base md:text-xl font-bold font-mono leading-tight">
                <MortusWriter
                  text="به دنیای کدبیات خوش آمدی! اینجا جایی است که ادبیات و کدنویسی به هم می‌رسند..."
                  delay={2000}
                />
              </p>
              <div className="absolute -bottom-4 left-1/2 w-6 h-6 md:w-8 md:h-8 bg-white border-r-4 border-b-4 border-black transform rotate-45 translate-x-[-50%]"></div>
            </div>
          </ComicPanel>

          {/* PANEL 2: ACADEMY */}
          <ComicPanel
            className="col-span-1 md:col-span-4 min-h-[250px] md:min-h-[300px] bg-[#006000]"
            delay={500}
          >
            <div className="h-full flex flex-col justify-between text-white">
              <div className="border-b-4 border-black pb-2 mb-4">
                <h2 className="text-2xl md:text-3xl font-black uppercase text-[#FFCC00] drop-shadow-[2px_2px_0_#000]">
                  ACADEMY
                </h2>
              </div>
              <p className="font-mono text-xs md:text-sm leading-relaxed mb-4">
                "برای زنده ماندن در این صفحه، باید یاد بگیری چطور کد بزنی..."
              </p>
              <Link
                to="/learn"
                className="self-end bg-black text-white px-3 py-1 md:px-4 md:py-2 text-sm md:text-base font-bold hover:bg-[#E07000] hover:text-black transition-colors border-2 border-white shadow-[3px_3px_0_#000]"
              >
                ENTER ZONE &gt;
              </Link>
            </div>
            <span className="absolute top-2 right-2 text-3xl md:text-4xl font-black text-white opacity-20 rotate-12">
              LEARN!
            </span>
          </ComicPanel>

          {/* PANEL 3: LAB */}
          <ComicPanel className="col-span-1 md:col-span-4 bg-[#500050]" delay={800}>
            <div className="h-full flex flex-col items-center justify-center text-center py-8 md:py-0">
              <Zap
                size={48}
                className="md:w-16 md:h-16 text-[#E07000] mb-4 filter drop-shadow-[4px_4px_0_#000]"
              />
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2 transform -rotate-3">THE LAB</h2>
              <p className="text-white font-mono text-xs mb-4">Experimental Zone</p>
              <Link
                to="/lab"
                className="w-full max-w-[200px] bg-[#E07000] border-2 border-black font-black py-2 hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_#000] transition-all"
              >
                TEST IT!
              </Link>
            </div>
          </ComicPanel>

          {/* PANEL 4: STATS */}
          <ComicPanel className="col-span-1 md:col-span-4 bg-white" delay={1100}>
            <div className="space-y-4 py-4 md:py-0">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="font-bold bg-black text-white px-2 text-sm md:text-base">LESSONS</span>
                <span className="font-mono text-xl md:text-2xl font-black text-[#E07000]">50+</span>
              </div>
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="font-bold bg-black text-white px-2 text-sm md:text-base">ARTICLES</span>
                <span className="font-mono text-xl md:text-2xl font-black text-[#006000]">100+</span>
              </div>
              <div className="mt-4 bg-gray-200 p-2 border-2 border-black text-xs font-mono">
                STATUS: <span className="text-green-600 font-bold">INFECTED</span>
              </div>
            </div>
          </ComicPanel>

          {/* PANEL 5: FOOTER */}
          <ComicPanel className="col-span-1 md:col-span-12 bg-black text-white mt-4 md:mt-8" variant="action">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
              <div>
                <h3 className="text-[#E07000] font-black text-xl md:text-2xl">END OF PAGE 1</h3>
                <p className="text-gray-400 font-mono text-xs md:text-sm">
                  © 2024 Electronic Literature Platform.
                </p>
              </div>

              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-white hover:text-[#E07000] font-mono underline decoration-wavy text-sm"
                >
                  Github
                </a>
                <a
                  href="#"
                  className="text-white hover:text-[#E07000] font-mono underline decoration-wavy text-sm"
                >
                  Twitter
                </a>
              </div>

              <div className="relative group cursor-pointer w-full md:w-auto">
                <div className="absolute inset-0 bg-[#E07000] transform translate-x-1 translate-y-1 md:translate-x-2 md:translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform hidden md:block"></div>
                <div className="relative bg-white text-black border-2 border-black px-4 py-2 md:px-6 md:py-3 font-black uppercase tracking-widest flex items-center justify-center gap-2 text-sm md:text-base">
                  NEXT EPISODE{" "}
                  <ArrowLeft className={`w-4 h-4 md:w-5 md:h-5 ${dir === "rtl" ? "" : "rotate-180"}`} />
                </div>
              </div>
            </div>
          </ComicPanel>
        </div>
      </main>

      {/* --- DECORATIVE ELEMENTS (HIDDEN ON MOBILE) --- */}
      {/* These elements break mobile layout, so we hide them with 'hidden lg:block' */}
      <div
        className="hidden lg:block fixed bottom-10 left-10 w-64 h-4 bg-yellow-600 transform -rotate-45 shadow-xl rounded-full z-0 opacity-80"
        title="Pencil"
      ></div>
      <div
        className="hidden lg:block fixed top-20 left-10 w-20 h-32 bg-pink-300 transform rotate-12 shadow-xl rounded z-0 opacity-80"
        title="Eraser"
      ></div>

      {/* --- COMIX ZONE GIF DECORATIONS (HIDDEN ON MOBILE) --- */}
      <div className="hidden lg:block fixed bottom-20 left-20 z-0 opacity-90 group hover:opacity-100 transition-opacity">
        <div className="relative transform hover:scale-110 transition-transform duration-300">
          <div className="absolute -inset-2 bg-white border-4 border-black transform -rotate-2 shadow-[8px_8px_0px_rgba(0,0,0,1)]"></div>
          <div className="relative bg-black border-4 border-white p-1">
            <img
              src="/gifs/comix_zone_2.gif"
              alt="Comix Zone Hero"
              className="w-32 h-32 object-cover"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white border-2 border-black px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-black text-black">FIGHT!</span>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-black transform rotate-45"></div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block fixed top-32 right-20 z-0 opacity-80 group hover:opacity-100 transition-opacity">
        <div className="relative transform hover:scale-110 transition-transform duration-300">
          <div className="absolute -inset-2 bg-yellow-400 border-4 border-black transform rotate-3 shadow-[8px_8px_0px_rgba(0,0,0,0.8)]"></div>
          <div className="relative bg-gradient-to-br from-purple-900 to-black border-4 border-white p-1">
            <img
              src="/gifs/comix_zone_3.gif"
              alt="Comix Zone Scene"
              className="w-40 h-40 object-cover"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          <div
            className="absolute -bottom-6 -right-6 text-4xl font-black text-[#E07000] transform rotate-12 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ textShadow: "3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000" }}
          >
            BAM!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
