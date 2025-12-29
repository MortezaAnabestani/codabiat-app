import React from "react";

interface ComicHeaderProps {
  text: string;
  subtext?: string;
  className?: string;
}

const GlitchHeader: React.FC<ComicHeaderProps> = ({ text, subtext, className = "" }) => {
  return (
    <div className={`relative group ${className}`}>
      {/* BACKGROUND DECORATION: The "Void" & Onomatopoeia */}
      <div className="absolute -z-10 top-[-20px] right-[-30px] opacity-20  select-none">
        <span className="font-black text-9xl text-[#500050] transform rotate-12 block">SEGA!</span>
      </div>

      {/* MAIN COMIC PANEL: The "Paper" Container */}
      <div className="relative bg-white border-[6px] border-black p-8 transform -rotate-1 shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-transform duration-100 hover:rotate-0 hover:scale-[1.01]">
        {/* EPISODE BADGE (Top Left Corner) */}
        <div className="absolute -top-5 -left-4 bg-[#FFCC00] border-4 border-black px-3 py-1 transform -rotate-3 z-20 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <span className="font-mono font-bold text-black text-xs tracking-widest uppercase">EPISODE 1</span>
        </div>

        {/* MAIN TITLE: Mutant Orange with Ink Black Shadow */}
        <h1
          className="font-black text-5xl md:text-7xl lg:text-8xl text-[#E07000] relative z-10 select-none tracking-tighter uppercase"
          style={{
            textShadow: "4px 4px 0px #000000",
            WebkitTextStroke: "2px black",
          }}
        >
          {text}
        </h1>

        {/* SUBTEXT: The "Narrator Box" Style */}
        {subtext && (
          <div className="mt-6 flex justify-end">
            <div className="relative bg-[#FFCC00] border-4 border-black px-4 py-2 max-w-md transform rotate-1 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
              {/* Decorative "Tape" or Corner mark */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-black"></div>

              <p className="font-mono text-black text-sm md:text-base font-bold uppercase tracking-wide leading-tight">
                {subtext}
              </p>
            </div>
          </div>
        )}

        {/* MORTUS HAND HINT: A visual cue for the drawing mechanic */}
        <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-black opacity-50"></div>
      </div>
    </div>
  );
};

export default GlitchHeader;
