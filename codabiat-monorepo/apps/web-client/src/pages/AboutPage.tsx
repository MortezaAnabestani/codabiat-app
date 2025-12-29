import React, { useState, useEffect } from "react";
import { Github, Twitter, Zap, Skull } from "lucide-react";

const AboutPage: React.FC = () => {
  const [textRevealed, setTextRevealed] = useState(false);

  // شبیه‌سازی افکت تایپ شدن (Mortus Hand Logic)
  useEffect(() => {
    const timer = setTimeout(() => setTextRevealed(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full  flex items-center justify-center p-4 overflow-hidden relative selection:bg-[#E07000] selection:text-white">
      {/* BACKGROUND DECORATION: Artist's Desk Elements */}

      <div className="absolute bottom-10 right-10 opacity-10 ">
        <Skull size={200} className="text-black" />
      </div>

      {/* MAIN COMIC PANEL */}
      <div className="relative max-w-4xl w-full perspective-1000 group">
        {/* Shadow Layer for Depth */}
        <div className="absolute inset-0 bg-black translate-x-4 translate-y-4 transform rotate-1 rounded-sm" />

        {/* The Paper/Panel */}
        <div className="relative bg-white border-[6px] border-black p-8 md:p-12 transform -rotate-1 transition-transform duration-300 hover:rotate-0 hover:scale-[1.01]">
          {/* NARRATOR BOX (Header) */}
          <div className="absolute -top-6 -left-4 bg-[#FFCC00] border-[4px] border-black px-6 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-2 z-20">
            <h2 className="font-mono font-black text-2xl md:text-3xl text-black uppercase tracking-widest">
              EPISODE 1: MANIFESTO
            </h2>
          </div>

          {/* ONOMATOPOEIA (Background FX) */}
          <div className="absolute top-1/2 right-10 transform -translate-y-1/2 rotate-12 opacity-10  z-0">
            <span className="text-9xl font-black text-[#E07000] font-mono">CODE!</span>
          </div>

          {/* CONTENT AREA */}
          <div className="relative z-10 mt-8">
            {/* Speech Bubble Style Container */}
            <div className={`transition-opacity duration-1000 ${textRevealed ? "opacity-100" : "opacity-0"}`}>
              <p className="font-mono text-lg md:text-xl text-black leading-relaxed font-bold text-justify">
                <span className="text-[#E07000] text-3xl mr-2 font-black">»</span>
                ما باور داریم که{" "}
                <span className="bg-[#006000] text-white px-1 transform -skew-x-12 inline-block mx-1">
                  کد
                </span>
                ، زبان جدید شعر است. در دنیایی که توسط الگوریتم‌ها احاطه شده‌ایم، ادبیات باید فرم خود را تغییر
                دهد تا زنده بماند. این پروژه تلاشی است برای کشف مرزهای مشترک میان{" "}
                <span className="text-[#E07000] border-b-4 border-black">سنت ادبی غنی فارسی</span> و هنر
                دیجیتال مدرن.
              </p>
            </div>
          </div>

          {/* INVENTORY SLOTS (Social Links) */}
          <div className="absolute -bottom-8 right-4 flex gap-4 z-30">
            {/* Slot 1: Github */}
            <a
              href="#"
              className="group/btn relative w-16 h-16 bg-[#FFCC00] border-[4px] border-black flex items-center justify-center hover:bg-[#E07000] transition-colors cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
            >
              <Github size={32} className="text-black group-hover/btn:scale-110 transition-transform" />
              {/* Tooltip mimicking item name */}
              <span className="absolute -top-10 bg-black text-white text-xs font-mono px-2 py-1 opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap border border-white">
                SOURCE CODE
              </span>
            </a>

            {/* Slot 2: Twitter */}
            <a
              href="#"
              className="group/btn relative w-16 h-16 bg-[#FFCC00] border-[4px] border-black flex items-center justify-center hover:bg-[#E07000] transition-colors cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
            >
              <Twitter size={32} className="text-black group-hover/btn:scale-110 transition-transform" />
              <span className="absolute -top-10 bg-black text-white text-xs font-mono px-2 py-1 opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap border border-white">
                COMMS LINK
              </span>
            </a>

            {/* Slot 3: Action (Visual Only) */}
            <div className="relative w-16 h-16 bg-black border-[4px] border-[#FFCC00] flex items-center justify-center">
              <Zap size={32} className="text-[#FFCC00] animate-pulse" />
            </div>
          </div>

          {/* PAGE TEAR EFFECT (Bottom Right Corner) */}
          <div
            className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-gray-300 to-white border-l-[1px] border-t-[1px] border-gray-400 shadow-xl transform -rotate-3 origin-bottom-right z-20"
            style={{ clipPath: "polygon(100% 0, 0% 100%, 100% 100%)" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
