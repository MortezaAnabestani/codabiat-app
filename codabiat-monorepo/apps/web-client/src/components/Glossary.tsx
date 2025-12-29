import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  Book,
  Hash,
  Tag,
  Info,
  Cpu,
  Code,
  Brain,
  Binary,
  ChevronLeft,
  Terminal,
  Activity,
  Layers,
  Hand,
  Zap,
} from "lucide-react";
import { useLanguage } from "../LanguageContext";

// --- TYPES ---
interface Term {
  id: string;
  word: string;
  definition: string;
  category: "Technique" | "Theory" | "Philosophy" | "Cybernetics";
  tags: string[];
  codeSnippet?: string;
}

// --- DATA (UNCHANGED) ---
const termsData: Term[] = [
  {
    id: "hypertext",
    word: "هایپرتکست (Hypertext)",
    definition:
      "متنی که بر روی یک صفحه نمایش نمایش داده می‌شود و حاوی پیوندهایی به متون دیگر است که خواننده می‌تواند بلافاصله به آن‌ها دسترسی پیدا کند. در ادبیات الکترونیک، هایپرتکست اجازه می‌دهد روایت‌های غیرخطی و چندگانه شکل بگیرند.",
    category: "Technique",
    tags: ["Web", "Links", "Non-linear"],
    codeSnippet: '<a href="/next-chapter">سفر به بخش بعد</a>',
  },
  {
    id: "ergodic-lit",
    word: "ادبیات ارگودیک (Ergodic)",
    definition:
      "اصطلاحی ابداع شده توسط اسپین آرسِت که به آثاری اطلاق می‌شود که در آن‌ها تلاش غیربی‌اهمیت (Nontrivial effort) برای عبور از متن لازم است. برخلاف مطالعه سنتی که فقط ورق زدن است، در اینجا خواننده باید انتخاب کند، کلیک کند یا حتی کد بزند.",
    category: "Theory",
    tags: ["Interaction", "Choice", "Aarseth"],
  },
  {
    id: "glitch-art",
    word: "گلیچ آرت (Glitch Art)",
    definition:
      "زیبایی‌شناسی خطا؛ استفاده هنری از خطاهای دیجیتال یا آنالوگ برای اهداف زیبایی‌شناختی. در ادبیات، این به معنای تخریب عامدانه متن برای آشکار کردن ماهیت ماشینی آن است.",
    category: "Technique",
    tags: ["Error", "Data", "Aesthetics"],
    codeSnippet: "text.corrupt(Math.random() * 100);",
  },
  {
    id: "generative-poetry",
    word: "شعر زایشی (Generative)",
    definition:
      "شعری که توسط یک سیستم خودگردان (معمولاً الگوریتمی) ساخته می‌شود. شاعر در اینجا نه نویسنده‌ی مستقیم کلمات، بلکه طراحِ قوانینی است که کلمات را تولید می‌کنند.",
    category: "Technique",
    tags: ["AI", "Algorithm", "Automation"],
    codeSnippet: 'const poem = words.sort(() => Math.random() - 0.5).join(" ");',
  },
  {
    id: "cybernetics",
    word: "سایبرنتیک (Cybernetics)",
    definition:
      "علم کنترل و ارتباطات در حیوان و ماشین. در ادبیات نوین، این مفهوم به تعاملِ تنگاتنگ میان ذهن انسان و کدهای نرم‌افزاری در فرآیند خلاقیت اشاره دارد.",
    category: "Philosophy",
    tags: ["Control", "Feedback", "Wiener"],
  },
  {
    id: "digital-materiality",
    word: "مادیت دیجیتال",
    definition:
      'این ایده که کدهای دیجیتال، برخلاف تصور رایج، دارای مادیت هستند. پیکسل‌ها، سیگنال‌های الکتریکی و کدهای باینری، "بدنه" جدید آثار ادبی را تشکیل می‌دهند.',
    category: "Philosophy",
    tags: ["Hardware", "Code", "Matter"],
  },
];

// --- TYPEWRITER HOOK (THE MORTUS HAND LOGIC) ---
const useTypewriter = (text: string, speed: number = 30) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayedText, isTyping };
};

export const Glossary: React.FC = () => {
  const { lang, t, dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTerm, setActiveTerm] = useState<Term | null>(termsData[0]);

  // Typewriter effect for the definition
  const { displayedText, isTyping } = useTypewriter(activeTerm ? activeTerm.definition : "", 20);

  const categories = ["Technique", "Theory", "Philosophy", "Cybernetics"];

  const filteredTerms = useMemo(() => {
    return termsData.filter(
      (t) =>
        (t.word.toLowerCase().includes(searchTerm.toLowerCase()) || t.definition.includes(searchTerm)) &&
        (!selectedCategory || t.category === selectedCategory)
    );
  }, [searchTerm, selectedCategory]);

  // --- STYLES (SEGA PALETTE) ---
  const colors = {
    mutantOrange: "#E07000",
    sewerSludge: "#006000",
    bruisedPurple: "#500050",
    sketchWhite: "#FFFFFF",
    inkBlack: "#000000",
    narratorYellow: "#FFCC00",
  };

  return (
    <div
      className={`h-full flex flex-col md:flex-row gap-6 p-4 overflow-hidden relative ${
        dir === "rtl" ? "md:flex-row" : "md:flex-row-reverse"
      }`}
      style={{ backgroundColor: "#81bea5ff" }}
    >
      {/* BACKGROUND DECORATION (Scattered Pencils) */}
      <div className="absolute inset-0 opacity-10  overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-2 bg-gray-600 rotate-45 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-48 h-2 bg-gray-500 -rotate-12 rounded-full"></div>
      </div>
      {/* === LEFT PANEL: THE COMIC PAGE (DETAIL VIEW) === */}
      <div className="flex-grow flex flex-col relative z-10">
        {/* PAGE HEADER: INVENTORY SLOTS (Categories) */}
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-12 h-12 border-4 border-black flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
              !selectedCategory ? "bg-yellow-400" : "bg-gray-700"
            }`}
            title="All Items"
          >
            <span className="font-black text-xs">ALL</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-12 h-12 border-4 border-black flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                selectedCategory === cat ? "bg-yellow-400" : "bg-gray-800"
              }`}
              title={cat}
            >
              {cat === "Technique" && (
                <Code size={20} className={selectedCategory === cat ? "text-black" : "text-white"} />
              )}
              {cat === "Theory" && (
                <Layers size={20} className={selectedCategory === cat ? "text-black" : "text-white"} />
              )}
              {cat === "Philosophy" && (
                <Brain size={20} className={selectedCategory === cat ? "text-black" : "text-white"} />
              )}
              {cat === "Cybernetics" && (
                <Cpu size={20} className={selectedCategory === cat ? "text-black" : "text-white"} />
              )}
            </button>
          ))}
        </div>

        {/* MAIN COMIC PANEL */}
        <div className="flex-grow bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-0 relative overflow-hidden flex flex-col">
          {/* NARRATOR BOX (Metadata) */}
          <div className="bg-[#FFCC00] border-b-4 border-black p-3 flex justify-between items-center">
            <span className="font-black text-sm tracking-widest uppercase flex items-center gap-2">
              <Activity size={16} />
              EPISODE 1: {activeTerm?.category || "UNKNOWN"}
            </span>
            <span className="font-mono text-xs font-bold">PAGE 01</span>
          </div>

          {/* CONTENT AREA */}
          <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar relative flex-grow">
            {activeTerm ? (
              <div className="relative" dir={dir}>
                {/* TITLE (Sound Effect Style) */}
                <h1
                  className="text-5xl md:text-6xl font-black text-black mb-8 uppercase tracking-tighter transform -rotate-1"
                  style={{ textShadow: "3px 3px 0px #E07000" }}
                >
                  {activeTerm.word}
                </h1>

                {/* SPEECH BUBBLE (Definition) */}
                <div className="relative bg-white border-4 border-black rounded-[2rem] p-8 mb-8 shadow-lg max-w-3xl mx-auto">
                  {/* Bubble Tail */}
                  <div
                    className={`absolute -bottom-6 ${
                      dir === "rtl" ? "right-12" : "left-12"
                    } w-8 h-8 bg-white border-r-4 border-b-4 border-black transform rotate-45`}
                  ></div>
                  <div
                    className={`absolute -bottom-4 ${
                      dir === "rtl" ? "right-12" : "left-12"
                    } w-10 h-6 bg-white`}
                  ></div>{" "}
                  {/* Mask for tail */}
                  <p className="text-xl md:text-2xl font-bold text-black leading-relaxed font-mono">
                    {displayedText}
                    {isTyping && <span className="inline-block w-3 h-6 bg-black ml-1 animate-pulse"></span>}
                  </p>
                </div>

                {/* CODE PANEL (If exists) */}
                {activeTerm.codeSnippet && (
                  <div className="mt-12 relative group">
                    <div className="absolute -top-3 left-4 bg-black text-white px-2 py-1 text-xs font-mono z-10 transform -rotate-2">
                      SECRET_CODE_BLOCK
                    </div>
                    <div className="bg-[#006000] border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                      <pre
                        className="font-mono text-green-300 text-sm md:text-base overflow-x-auto"
                        dir="ltr"
                      >
                        {activeTerm.codeSnippet}
                      </pre>
                    </div>
                    {/* Visual Spark on Hover */}
                    <Zap
                      className="absolute -right-4 -top-4 text-yellow-400 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                      fill="currentColor"
                    />
                  </div>
                )}

                {/* TAGS (Stickers) */}
                <div className="flex flex-wrap gap-3 mt-12 pt-6 border-t-4 border-black border-dashed">
                  {activeTerm.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-black text-white text-xs font-bold uppercase transform hover:-rotate-3 transition-transform cursor-help"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-50">
                <Book size={80} className="mb-6 text-black" />
                <p className="font-black text-2xl uppercase">SELECT A FILE</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* === RIGHT PANEL: THE SKETCH LIST (SIDEBAR) === */}
      <div className="w-full md:w-80 flex flex-col gap-4 shrink-0 z-20">
        {/* SEARCH BOX (Caption Box Style) */}
        <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(80,0,80,1)] transform rotate-1">
          <label className="text-xs font-black bg-black text-white px-2 py-0.5 inline-block mb-2 transform -rotate-2">
            FIND_MUTANT
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-gray-100 border-2 border-black py-2 px-3 text-black font-bold outline-none focus:bg-yellow-100 transition-colors ${
                dir === "rtl" ? "pr-3" : "pl-3"
              }`}
              placeholder="..."
              dir={dir}
            />
            <Search
              className={`absolute ${dir === "rtl" ? "left-2" : "right-2"} top-2.5 text-black`}
              size={16}
            />
          </div>
        </div>

        {/* LIST CONTAINER (Notebook Style) */}
        <div className="flex-grow bg-[#f0f0f0] border-4 border-black overflow-y-auto custom-scrollbar p-2 relative shadow-2xl">
          {/* Spiral Binding Visual */}
          <div className="absolute top-0 left-2 w-4 h-full border-r-2 border-dashed border-gray-400  opacity-50"></div>

          {filteredTerms.length > 0 ? (
            filteredTerms.map((term, index) => (
              <button
                key={term.id}
                onClick={() => setActiveTerm(term)}
                className={`w-full p-3 mb-3 border-2 transition-all relative group ${
                  activeTerm?.id === term.id
                    ? "bg-black text-white border-black transform scale-105 z-10"
                    : "bg-white text-gray-600 border-gray-300 hover:border-black hover:text-black"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black uppercase truncate">{term.word.split("(")[0]}</span>
                  {activeTerm?.id === term.id && (
                    <Hand size={16} className="animate-bounce text-yellow-400" />
                  )}
                </div>

                {/* Hover "POW" Effect */}
                <div className="absolute -right-2 -top-2 bg-yellow-400 text-black text-[10px] font-black px-1 border border-black opacity-0 group-hover:opacity-100 transition-opacity transform rotate-12">
                  READ!
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500 font-mono text-xs">NO DATA FOUND...</div>
          )}
        </div>
      </div>
    </div>
  );
};
