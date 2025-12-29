import React, { useState, useEffect } from "react";

// 1. COMIC SFX & SKETCH SYMBOLS (Replacement for Persian/Binary chars)
const comicEffects = [
  "POW!",
  "BAM!",
  "ZAP!",
  "CRASH!",
  "///", // Sketch hatching
  "###", // Cross-hatching
  "?!",
  "BOOM",
  "WHAM!",
  "...",
  "$$$",
];

// 2. PIXELATED FONT STYLE (Inline style helper)
const pixelFontStyle = {
  fontFamily: '"Courier New", Courier, monospace', // Fallback to monospace if pixel font isn't loaded
  fontWeight: "bold",
  letterSpacing: "-0.05em",
  textTransform: "uppercase" as const,
};

// 3. FLOATING COMIC ELEMENT (Refactored FloatingChar)
const FloatingComicElement: React.FC<{ text: string }> = ({ text }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Random positioning logic tailored for "Background Depth"
  const randomLeft = React.useMemo(() => Math.random() * 90 + 5, []); // Keep away from extreme edges
  const randomTop = React.useMemo(() => Math.random() * 90 + 5, []);
  const randomRotation = React.useMemo(() => Math.random() * 40 - 20, []); // -20deg to 20deg tilt
  const randomScale = React.useMemo(() => Math.random() * 1.5 + 0.5, []);
  const randomDuration = React.useMemo(() => Math.random() * 10 + 10, []); // Slower float

  // Color Logic: Randomly assign Sega Palette colors
  const color = React.useMemo(() => {
    const colors = [
      "#E07000", // Mutant Orange
      "#006000", // Sewer Sludge
      "#500050", // Bruised Purple (Lightened for visibility)
      "#808080", // Sketch Grey
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  return (
    <div
      className="absolute pointer-events-auto cursor-help select-none z-10"
      style={{
        left: `${randomLeft}%`,
        top: `${randomTop}%`,
        transform: `rotate(${randomRotation}deg) scale(${randomScale})`,
        animation: `float-comic ${randomDuration}s ease-in-out infinite alternate`,
      }}
    >
      <span
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`block transition-all duration-100 ease-linear`}
        style={{
          ...pixelFontStyle,
          color: isHovered ? "#FFFFFF" : color, // Turn White on Hover
          opacity: isHovered ? 1 : 0.4, // Fade out when not interacted
          textShadow: isHovered
            ? "4px 4px 0px #000000" // Hard Ink Shadow on Hover
            : "2px 2px 0px rgba(0,0,0,0.5)",
          fontSize: "2rem",
          filter: isHovered ? "drop-shadow(0 0 8px #E07000)" : "none", // Glow effect
        }}
      >
        {text}
      </span>
    </div>
  );
};

const Background: React.FC = () => {
  // Mouse tracking for "Mortus Hand" spotlight effect (Optional visual flair)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#1a1a1a]">
      {/* --- LAYER 1: THE ARTIST'S DESK (Base) --- */}
      {/* A dark, gritty surface representing the void outside the panels */}
      <div className="absolute inset-0 bg-[#500050] opacity-20 mix-blend-multiply" />

      {/* Noise Texture for "Paper Grain" */}
      <div
        className="absolute inset-0 opacity-[0.15] "
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* --- LAYER 2: FLOATING COMIC ELEMENTS (The "Ideas") --- */}
      {Array.from({ length: 25 }).map((_, i) => {
        const text = comicEffects[Math.floor(Math.random() * comicEffects.length)];
        return <FloatingComicElement key={i} text={text} />;
      })}

      {/* --- LAYER 3: DYNAMIC SPOTLIGHT (The "Artist's Lamp") --- */}
      <div
        className="absolute inset-0  mix-blend-overlay"
        style={{
          background: `radial-gradient(circle 400px at ${mousePos.x}px ${mousePos.y}px, rgba(224, 112, 0, 0.15), transparent 80%)`,
        }}
      />

      {/* --- LAYER 4: SEGA GENESIS VDP SCANLINES (CRT Effect) --- */}
      <div className="absolute inset-0  z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] bg-repeat" />

      {/* --- LAYER 5: VIGNETTE (Darkened Edges) --- */}
      <div className="absolute inset-0  z-40 bg-[radial-gradient(circle_at_center,transparent_50%,#000000_100%)] opacity-80" />

      {/* --- LAYER 6: DECORATIVE "INK SPLATS" (Static Background Art) --- */}
      <div className="absolute bottom-[-5%] right-[-5%] w-[40vw] h-[40vw] bg-[#000000] rounded-full blur-[80px] opacity-60" />
      <div className="absolute top-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-[#500050] rounded-full blur-[100px] opacity-40 mix-blend-color-dodge" />
    </div>
  );
};

export default Background;
