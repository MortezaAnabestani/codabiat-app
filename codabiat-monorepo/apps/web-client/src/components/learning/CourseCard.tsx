import React from "react";
import { Link } from "react-router-dom";
import { Course } from "../../types";
import { FileCode, Cpu, Layers, Zap } from "lucide-react";

// --- SEGA GENESIS PALETTE & ASSETS ---
const PALETTE = {
  inkBlack: "#000000",
  sketchWhite: "#FFFFFF",
  mutantOrange: "#E07000",
  narratorYellow: "#FFCC00",
  sewerSludge: "#006000",
  bruisedPurple: "#500050",
};

const iconMap: any = {
  FileCode: FileCode,
  Cpu: Cpu,
  Layers: Layers,
};

// استایل‌های سراسری برای فونت و انیمیشن‌های خاص این تم
const GlobalComicStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bangers&family=VT323&display=swap');

    .font-comic-title {
      font-family: 'Bangers', cursive;
      letter-spacing: 1px;
    }
    .font-pixel-text {
      font-family: 'VT323', monospace;
    }
    
    /* الگوی نقطه ای (Halftone) برای پس زمینه کارت */
    .bg-halftone {
      background-image: radial-gradient(#ffff32 1px, transparent 1px);
      background-size: 10px 10px;
      background-color: ${PALETTE.sketchWhite};
    }

    /* افکت لرزش دست برای حاشیه‌ها */
    .comic-border {
      border: 3px solid ${PALETTE.inkBlack};
      box-shadow: 6px 6px 0px ${PALETTE.inkBlack};
    }
    
    .comic-card:hover .comic-border {
      transform: translate(-2px, -2px);
      box-shadow: 8px 8px 0px ${PALETTE.mutantOrange};
    }

    .comic-card:hover .action-spark {
      opacity: 1;
      transform: scale(1.2) rotate(15deg);
    }
  `}</style>
);

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  const Icon = iconMap[course.icon] || Layers;

  // تعیین رنگ بر اساس سطح دشواری با پالت سگا
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-[#006000] text-white"; // Sewer Sludge
      case "Intermediate":
        return "bg-[#E07000] text-black"; // Mutant Orange
      case "Advanced":
        return "bg-[#500050] text-white"; // Bruised Purple
      default:
        return "bg-black text-white";
    }
  };

  return (
    <>
      <GlobalComicStyles />
      <Link
        to={`/learn/${course.id}`}
        className="comic-card group relative block h-full transition-all duration-200"
      >
        {/* کانتینر اصلی پنل کمیک */}
        <div className="comic-border bg-halftone h-full flex flex-col overflow-hidden relative z-10">
          {/* بخش 1: جعبه راوی (Narrator Box) - هدر زرد رنگ */}
          <div className="bg-[#FFCC00] border-b-2 border-black p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-black p-1.5 text-white transform -rotate-3">
                <Icon size={20} strokeWidth={3} />
              </div>
              <span className="font-pixel-text text-xl uppercase font-bold text-black tracking-widest">
                PANEL_0{course.id}
              </span>
            </div>

            {/* بج سطح دشواری به سبک استیکر */}
            <span
              className={`font-pixel-text text-lg px-2 py-0.5 border-2 border-black uppercase ${getLevelColor(
                course.level
              )} transform rotate-2`}
            >
              {course.level}
            </span>
          </div>

          {/* بخش 2: محتوای اصلی */}
          <div className="p-5 flex-grow relative">
            {/* افکت صوتی پس‌زمینه (تزئینی) */}
            <div className="absolute right-2 top-2 opacity-10  transform rotate-12">
              <span className=" text-6xl text-black">POW!</span>
            </div>

            <h3 className=" text-3xl text-black mb-3 leading-none group-hover:text-[#E07000] transition-colors">
              {course.title}
            </h3>

            <p className=" text-xl text-gray-800 leading-6 mb-6 line-clamp-3 bg-white/80 p-1">
              {course.description}
            </p>
          </div>

          {/* بخش 3: فوتر (Inventory Slots) */}
          <div className="mt-auto border-t-2 border-black bg-white p-3">
            <div className="flex justify-between items-end">
              {/* استک تکنولوژی به صورت حباب‌های دیالوگ کوچک */}
              <div className="flex flex-wrap gap-2">
                {course.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="font-pixel-text text-lg bg-gray-100 border border-black px-2 rounded-tl-lg rounded-br-lg rounded-tr-lg text-black shadow-[2px_2px_0px_#000]"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* دکمه اکشن (جرقه) */}
              <div className="action-spark opacity-0 transition-all duration-200 text-[#E07000]">
                <Zap size={32} fill="currentColor" className="drop-shadow-[2px_2px_0px_#000]" />
              </div>
            </div>
          </div>
        </div>

        {/* المان تزئینی: گوشه تا شده کاغذ */}
        <div className="absolute bottom-0 right-0 w-8 h-8 bg-black z-0 transform translate-x-1 translate-y-1 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform"></div>
      </Link>
    </>
  );
};

export default CourseCard;
