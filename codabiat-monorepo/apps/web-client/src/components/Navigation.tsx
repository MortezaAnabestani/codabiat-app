import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Terminal, BookOpen, Cpu, Info, GraduationCap, Book, Menu, X, Hand, Zap, Skull } from "lucide-react";
import { useLanguage } from "../LanguageContext";

// --- COMIX ZONE PALETTE ---
const COLORS = {
  mutantOrange: "#E07000",
  sewerSludge: "#006000",
  bruisedPurple: "#500050",
  sketchWhite: "#FFFFFF",
  inkBlack: "#000000",
  comicYellow: "#FFCC00", // Added for Inventory Slots
};

const Navigation: React.FC = () => {
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Scroll Effect: Toggles between "Floating Panel" and "Docked Inventory"
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/", icon: Terminal, label: t("home"), slot: 1 },
    { path: "/learn", icon: GraduationCap, label: t("learn"), slot: 2 },
    { path: "/glossary", icon: Book, label: t("glossary"), slot: 3 },
    { path: "/archive", icon: BookOpen, label: t("archive"), slot: 4 },
    { path: "/lab", icon: Cpu, label: t("lab"), slot: 5 },
    { path: "/about", icon: Info, label: t("about"), slot: 6 },
  ];

  return (
    <>
      {/* --- MAIN NAV STRIP (THE INVENTORY) --- */}
      <nav
        className={`w-full mb-4 z-[100] transition-all duration-300 border-b-4 border-black
        ${
          scrolled
            ? "py-2 bg-[#2a2a2a]" // Compact Mode
            : "py-4 bg-[#500050]" // Full "Bruised Purple" Mode
        }`}
        style={{
          boxShadow: "0px 4px 0px rgba(0,0,0,1)", // Hard Pixel Shadow
          backgroundImage: scrolled ? "none" : "radial-gradient(circle, #500050 10%, #2a002a 90%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          {/* --- LOGO: THE TITLE CARD --- */}
          <Link to="/" className="flex items-center gap-3 group relative">
            {/* Comic Box for Logo */}
            <div className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center relative overflow-hidden transform group-hover:-rotate-3 transition-transform">
              <div className="absolute inset-0 bg-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Terminal size={24} className="text-black relative z-10" strokeWidth={3} />
              {/* Halftone Pattern Overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]" />
            </div>

            <div className="flex flex-col leading-none hidden md:block">
              <span
                className="font-black text-xl tracking-tighter text-white drop-shadow-[2px_2px_0_#000] uppercase"
                style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}
              >
                E-LIT <span className="text-[#E07000]">ZONE</span>
              </span>
              <span className="text-[10px] font-bold text-yellow-400 tracking-widest bg-black px-1 mt-1 inline-block transform -skew-x-12">
                EPISODE 1: RECURSIVE
              </span>
            </div>
          </Link>

          {/* --- DESKTOP INVENTORY SLOTS --- */}
          <div className="hidden lg:flex items-center gap-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isHovered = hoveredItem === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative group"
                >
                  {/* The Slot Box */}
                  <div
                    className={`w-12 h-12 flex items-center justify-center border-4 transition-all duration-100
                    ${
                      isActive
                        ? "bg-[#E07000] border-white translate-y-1" // Active: Mutant Orange
                        : "bg-white border-black hover:bg-[#FFCC00] hover:-translate-y-1" // Inactive
                    }`}
                    style={{ boxShadow: isActive ? "none" : "4px 4px 0px #000" }}
                  >
                    <item.icon
                      size={20}
                      strokeWidth={2.5}
                      className={`${isActive ? "text-white" : "text-black"}`}
                    />

                    {/* Slot Number (Inventory Style) */}
                    <span className="absolute top-0 left-1 text-[8px] font-black text-black">
                      {item.slot}
                    </span>
                  </div>

                  {/* Tooltip (Speech Bubble Style) */}
                  <div
                    className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-white border-2 border-black px-2 py-1 whitespace-nowrap transition-all duration-200 z-50 ${
                      isHovered ? "opacity-100 scale-100" : "opacity-0 scale-0"
                    }`}
                  >
                    <span className="text-xs font-black uppercase text-black">{item.label}</span>
                    {/* Bubble Tail */}
                    <div className="absolute -top-1 left-1/2 w-2 h-2 bg-white border-t-2 border-l-2 border-black transform rotate-45 -translate-x-1/2"></div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* --- RIGHT CONTROLS (THE OPTIONS MENU) --- */}
          <div className="flex items-center gap-4">
            {/* Language Toggle (Pixel Switch) */}
            <button
              onClick={() => setLang(lang === "fa" ? "en" : "fa")}
              className="relative px-3 py-1 bg-black border-2 border-white text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#E07000] transition-colors"
            >
              {lang === "fa" ? "EN" : "FA"}
            </button>

            {/* Login (The Key Item) */}
            <Link
              to="/login"
              className="hidden md:flex items-center justify-center w-10 h-10 bg-[#006000] border-2 border-black hover:bg-[#008000] transition-colors shadow-[2px_2px_0_#fff]"
            >
              <Skull size={18} className="text-white" />
            </Link>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden bg-yellow-400 border-2 border-black p-2 text-black shadow-[3px_3px_0_#000] active:translate-y-1 active:shadow-none"
            >
              {isOpen ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE PAUSE MENU (COMIC OVERLAY) --- */}
      <div
        className={`fixed inset-0 z-[110] bg-[#500050] transition-all duration-500 lg:hidden flex flex-col ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6 p-8">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-yellow-400"
          >
            <X size={40} strokeWidth={3} />
          </button>

          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4 drop-shadow-[4px_4px_0_#000]">
            PAUSE MENU
          </h2>

          {navItems.map((item, idx) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className="w-full max-w-xs bg-white border-4 border-black p-4 flex items-center gap-4 transform hover:scale-105 hover:-rotate-1 transition-all shadow-[6px_6px_0_#000]"
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              <div className="bg-yellow-400 p-2 border-2 border-black">
                <item.icon size={24} className="text-black" />
              </div>
              <span className="text-xl font-black text-black uppercase">{item.label}</span>
              {/* The "Hand" Indicator on Hover (CSS Logic would go here, simulated by static icon for mobile) */}
              <Hand className="ml-auto text-[#E07000]" size={20} />
            </Link>
          ))}

          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="mt-8 text-sm font-bold text-white uppercase tracking-[0.2em] bg-[#006000] border-2 border-white px-8 py-3 shadow-[4px_4px_0_#000]"
          >
            {t("login")}
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navigation;
