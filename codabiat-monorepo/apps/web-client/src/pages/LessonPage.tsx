import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { courses } from "../data";
import CodePlayground from "../components/learning/CodePlayground";
import { ArrowLeft, Menu, Zap, Skull, HandMetal } from "lucide-react";
import { Lesson } from "../types";

// --- COMIX ZONE DESIGN SYSTEM CONSTANTS ---
const PALETTE = {
  ORANGE: "#E07000", // Mutant Orange
  GREEN: "#006000", // Sewer Sludge
  PURPLE: "#2D002D", // Bruised Purple (Darker for BG)
  YELLOW: "#FFCC00", // Narrator Box
  WHITE: "#FFFFFF", // Sketch White
  BLACK: "#000000", // Ink Black
};

// --- TYPEWRITER EFFECT HOOK ---
const useTypewriter = (text: string, speed: number = 30) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return displayedText;
};

const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Find course and lesson data
  const course = courses.find((c) => c.id === courseId);

  useEffect(() => {
    if (course && course.modules.length > 0) {
      let foundLesson;
      if (!lessonId) {
        foundLesson = course.modules[0].lessons[0];
      } else {
        course.modules.forEach((mod) => {
          const l = mod.lessons.find((x) => x.id === lessonId);
          if (l) foundLesson = l;
        });
      }

      if (foundLesson) {
        setActiveLesson(foundLesson);
      } else {
        navigate("/learn");
      }
    }
  }, [courseId, lessonId, course, navigate]);

  // Typewriter effect for the main content
  const typedContent = useTypewriter(activeLesson ? activeLesson.content : "", 10);

  if (!course || !activeLesson)
    return (
      <div className="h-screen flex items-center justify-center bg-black text-yellow-400 font-mono text-2xl uppercase tracking-widest">
        Loading Episode...
      </div>
    );

  return (
    <div
      className="h-screen w-full overflow-hidden relative flex flex-col"
      style={{
        backgroundColor: PALETTE.PURPLE,
        backgroundImage: `radial-gradient(${PALETTE.PURPLE} 20%, #000 90%)`, // The "Void"
        fontFamily: '"Courier New", Courier, monospace', // Pixel/Comic feel
      }}
    >
      {/* --- GLOBAL STYLES FOR COMIC FEEL --- */}
      <style>{`
          .comic-border {
            border: 3px solid ${PALETTE.BLACK};
            box-shadow: 5px 5px 0px rgba(0,0,0,0.5);
          }
          .comic-panel {
            background: ${PALETTE.WHITE};
            position: relative;
            overflow: hidden;
          }
          .narrator-box {
            background-color: ${PALETTE.YELLOW};
            border: 2px solid ${PALETTE.BLACK};
            box-shadow: 3px 3px 0px ${PALETTE.BLACK};
            text-transform: uppercase;
            font-weight: bold;
            color: ${PALETTE.BLACK};
          }
          .speech-bubble {
            background: ${PALETTE.WHITE};
            border-radius: 20px;
            border: 3px solid ${PALETTE.BLACK};
            position: relative;
          }
          .speech-bubble::after {
            content: '';
            position: absolute;
            bottom: -15px;
            left: 40px;
            border-width: 15px 15px 0;
            border-style: solid;
            border-color: ${PALETTE.BLACK} transparent;
            display: block;
            width: 0;
          }
          .speech-bubble::before {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 43px;
            border-width: 12px 12px 0;
            border-style: solid;
            border-color: ${PALETTE.WHITE} transparent;
            display: block;
            width: 0;
            z-index: 1;
          }
          /* Scrollbar styling */
          ::-webkit-scrollbar { width: 10px; }
          ::-webkit-scrollbar-track { background: ${PALETTE.BLACK}; }
          ::-webkit-scrollbar-thumb { background: ${PALETTE.ORANGE}; border: 2px solid black; }
        `}</style>

      {/* --- HEADER: THE INVENTORY --- */}
      <header className="h-20 bg-black border-b-4 border-white/20 flex items-center justify-between px-6 z-50 shrink-0">
        {/* Slot 1: Back (The Rat) */}
        <Link to="/learn" className="group relative">
          <div className="w-12 h-12 bg-yellow-400 border-2 border-white flex items-center justify-center hover:bg-red-500 transition-colors">
            <ArrowLeft className="text-black w-8 h-8" strokeWidth={3} />
          </div>
          <span className="absolute -bottom-6 left-0 text-[10px] text-white font-mono opacity-0 group-hover:opacity-100">
            EXIT
          </span>
        </Link>

        {/* Title Card */}
        <div className="narrator-box px-6 py-2 transform -skew-x-12">
          <span className="block text-xs tracking-widest">EPISODE 1:</span>
          <h1 className="text-xl md:text-2xl font-black">{course.title}</h1>
        </div>

        {/* Inventory Slots */}
        <div className="flex gap-4">
          {/* Slot 2: Spoiler/Hint (Dynamite) */}
          <button className="w-12 h-12 bg-gray-800 border-2 border-gray-500 flex items-center justify-center hover:border-yellow-400 group">
            <Zap className="text-yellow-400 group-hover:scale-110 transition-transform" />
          </button>
          {/* Slot 3: Action (Fist) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-12 h-12 bg-gray-800 border-2 border-gray-500 flex items-center justify-center hover:border-red-500 group"
          >
            <Menu className="text-white group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </header>

      {/* --- MAIN COMIC LAYOUT --- */}
      <div className="flex-grow flex p-4 gap-4 overflow-hidden">
        {/* LEFT PANEL: SIDEBAR (Torn Page) */}
        <aside
          className={`
                    ${sidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full opacity-0"} 
                    transition-all duration-300 ease-out
                    comic-panel comic-border bg-[#f0f0f0] flex flex-col
                    transform -rotate-1 origin-top-left z-20
                `}
        >
          <div className="bg-black text-white p-2 font-bold text-center uppercase border-b-4 border-black">
            ISSUE COLLECTION
          </div>
          <div className="overflow-y-auto p-2 space-y-4">
            {course.modules.map((module) => (
              <div key={module.id}>
                <h3 className="font-black text-xs uppercase text-gray-500 mb-1 border-b-2 border-gray-300">
                  {module.title}
                </h3>
                <div className="space-y-1">
                  {module.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      to={`/learn/${course.id}/lesson/${lesson.id}`}
                      className={`
                                            block px-2 py-2 text-xs font-bold border-2 
                                            ${
                                              activeLesson.id === lesson.id
                                                ? `bg-[${PALETTE.ORANGE}] text-white border-black shadow-[2px_2px_0px_black]`
                                                : "bg-white text-gray-600 border-transparent hover:border-black hover:bg-yellow-100"
                                            }
                                        `}
                    >
                      {lesson.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER PANEL: CONTENT (The Main Frame) */}
        <main className="flex-grow flex flex-col md:flex-row gap-4 h-full overflow-hidden relative">
          {/* TEXT PANEL */}
          <div className="flex-1 comic-panel comic-border p-6 overflow-y-auto transform rotate-1 bg-white relative">
            {/* Background Texture for Paper */}
            <div
              className="absolute inset-0 opacity-10 "
              style={{
                backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>

            {/* Narrator Box (Metadata) */}
            <div className="narrator-box inline-block px-3 py-1 mb-6 text-xs transform -rotate-2">
              LOCATION: {activeLesson.title}
            </div>

            {/* Speech Bubble (Main Content) */}
            <div className="relative mb-8">
              <div className="speech-bubble p-6 text-lg leading-relaxed font-medium text-black">
                {/* The "Mortus Hand" Logic: Text appears typed */}
                <div className="whitespace-pre-wrap">
                  {typedContent}
                  <span className="inline-block w-2 h-5 bg-black ml-1 animate-pulse"></span>
                </div>
              </div>
              {/* Visual "POW" effect behind text */}
              <div className="absolute -top-4 -right-4 text-6xl font-black text-red-600 opacity-20 rotate-12  select-none z-0">
                READ!
              </div>
            </div>

            {/* Challenge Box */}
            {activeLesson.challenge && (
              <div className="mt-8 border-4 border-black bg-[#006000] p-4 text-white shadow-[4px_4px_0px_black]">
                <div className="flex items-center gap-2 mb-2 border-b-2 border-white/30 pb-2">
                  <Skull className="text-yellow-400" />
                  <h4 className="font-black uppercase tracking-wider text-yellow-400">Mission Objective</h4>
                </div>
                <p className="font-mono text-sm">{activeLesson.challenge}</p>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: CODE PLAYGROUND (The Tech Interface) */}
          <div className="flex-1 comic-panel comic-border bg-[#111] flex flex-col transform -rotate-1 border-black">
            <div className="bg-gray-800 p-2 border-b-4 border-black flex justify-between items-center">
              <span className="text-green-500 font-mono text-xs flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                SYSTEM_READY
              </span>
              <HandMetal className="text-gray-500 w-4 h-4" />
            </div>
            <div className="flex-grow relative">
              <CodePlayground initialCode={activeLesson.initialCode} />
              {/* Scanline Overlay */}
              <div className="absolute inset-0  bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-20 bg-[length:100%_4px]"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LessonPage;
