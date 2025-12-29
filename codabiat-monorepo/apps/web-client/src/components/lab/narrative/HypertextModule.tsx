import React, { useState, useEffect, useRef } from "react";
import { GitBranch, RotateCcw, Map, MousePointer2, Zap, Skull } from "lucide-react";

// --- Design System Constants ---
const PALETTE = {
  mutantOrange: "#E07000",
  sewerSludge: "#006000",
  bruisedPurple: "#500050",
  sketchWhite: "#FFFFFF",
  inkBlack: "#000000",
  comicYellow: "#FFCC00",
};

// --- Types (UNCHANGED) ---
interface StoryNode {
  id: string;
  text: string;
  audio?: string;
  position: { x: number; y: number };
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
}

// --- Data (UNCHANGED) ---
const storyNodes: Record<string, StoryNode> = {
  start: {
    id: "start",
    text: "شما در مقابل دروازه زنگ‌زده‌ی یک {باغ} قدیمی ایستاده‌اید. هوا بوی کاغذ کاهی و خاک باران‌خوره می‌دهد. روی سردر، چیزی شبیه به یک {آینه} می‌درخشد.",
    position: { x: 50, y: 90 },
  },
  garden: {
    id: "garden",
    text: "باغ انبوه است و بی‌انتها. مسیرها دائم تغییر می‌کنند. سمت راست، صدای {آب} می‌آید. سمت چپ، سایه‌ی یک {عمارت} کلاه‌فرنگی پیداست. حس می‌کنید کسی شما را {تماشا} می‌کند.",
    position: { x: 30, y: 70 },
  },
  mirror: {
    id: "mirror",
    text: "در آینه خیره می‌شوید، اما تصویر خودتان را نمی‌بینید. به جای آن، تصویر پیرمردی را می‌بینید که در {کتابخانه}ای نشسته و می‌نویسد. او سرش را بلند می‌کند و به {شما} لبخند می‌زند.",
    position: { x: 70, y: 70 },
  },
  water: {
    id: "water",
    text: "جوی آب زلال است، اما در کف آن به جای سنگریزه، حروف سربی ریخته شده است. کلمات در آب حل می‌شوند و جمله «{زمان} دایره است» را می‌سازند. دستتان را در آب فرو می‌برید و یک {کلید} پیدا می‌کنید.",
    position: { x: 20, y: 50 },
  },
  mansion: {
    id: "mansion",
    text: "عمارت بوی عود و قدمت می‌دهد. تمام دیوارها از قفسه‌های کتاب پوشیده شده‌اند. کتابی روی میز باز است که عنوانش «داستان {زندگی} شما» است. آیا جرئت دارید آن را {بخوانید}؟",
    position: { x: 40, y: 50 },
  },
  watch: {
    id: "watch",
    text: "برمی‌گردید. هیچکس نیست. اما روی زمین، ردپایی تازه است که از {عمارت} بیرون آمده و به سمت {تاریکی} انتهای باغ رفته است.",
    position: { x: 50, y: 60 },
  },
  library: {
    id: "library",
    text: "پیرمرد قلم را زمین می‌گذارد. می‌گوید: «من تو را نوشتم، یا تو مرا؟» ناگهان دیوارها تبدیل به {باغ} می‌شوند و سقف آسمان شب می‌شود. همه چیز یک {رویا}ست.",
    position: { x: 80, y: 50 },
  },
  you: {
    id: "you",
    text: "به خودتان نگاه می‌کنید. دستانتان جوهری است. شما همان پیرمرد هستید. همیشه بوده‌اید. این داستان پایانی ندارد، مگر اینکه {فراموشی} را انتخاب کنید.",
    position: { x: 75, y: 30 },
  },
  time: {
    id: "time",
    text: "زمان می‌ایستد. قطرات آب در هوا معلق می‌مانند. شما از زمان بیرون می‌پرید و به {آغاز} برمی‌گردید، اما این بار با دانش اینکه همه مسیرها یکی هستند.",
    position: { x: 10, y: 30 },
  },
  key: {
    id: "key",
    text: "کلید زنگ‌زده است. با آن دریچه‌ای مخفی در پای یک درخت سرو را باز می‌کنید. راه پله‌ای مارپیچ به {زیرزمین} می‌رود. صدای همهمه‌ی هزاران نفر از پایین می‌آید.",
    position: { x: 25, y: 30 },
  },
  life: {
    id: "life",
    text: "صفحات کتاب سفیدند. کلمات تنها زمانی ظاهر می‌شوند که شما آن‌ها را می‌خوانید. نوشته شده: «او در باغ ایستاد و {کلید} را یافت...» این که گذشته‌ی شماست! صفحه بعد را {ورق} می‌زنید.",
    position: { x: 45, y: 30 },
  },
  darkness: {
    id: "darkness",
    text: "تاریکی مطلق نیست. ذرات نورانی مثل غبار در هوا معلقند. این‌ها خاطرات فراموش شده‌اند. یکی را می‌گیرید: خاطره‌ی {آینه}.",
    position: { x: 60, y: 40 },
  },
  read: {
    id: "read",
    text: "شما می‌خوانید و همزمان اتفاق می‌افتد. شما نویسنده سرنوشت خود می‌شوید. قلم را برمی‌دارید و می‌نویسید: «و سپس، او بیدار شد.» {پایان}.",
    position: { x: 50, y: 10 },
  },
  dream: {
    id: "dream",
    text: "بیدار می‌شوید. در اتاق خودتان هستید. اما کفی دستانتان بوی خاک باران‌خوره می‌دهد و در جیبتان یک {کلید} سنگینی می‌کند...",
    position: { x: 90, y: 10 },
  },
  forget: {
    id: "forget",
    text: "چشمانتان را می‌بندید. صداها محو می‌شوند. وقتی چشمانتان را باز می‌کنید، دوباره در مقابل دروازه {باغ} ایستاده‌اید، بدون هیچ خاطره‌ای.",
    position: { x: 80, y: 90 },
  },
  basement: {
    id: "basement",
    text: "زیرزمین یک چاپخانه قدیمی است. هزاران نسخه از «شما» در حال چاپ شدن هستند. یکی از نسخه‌ها برمی‌گردد و می‌گوید: «نوبت {من} است.»",
    position: { x: 25, y: 10 },
  },
  turn: {
    id: "turn",
    text: "صفحه بعد هنوز نوشته نشده است. جوهر خیس است. شما باید تصمیم بگیرید: آیا کتاب را {می‌بندید} یا ادامه را {می‌نویسید}؟",
    position: { x: 45, y: 15 },
  },
  start_loop: {
    id: "start",
    text: "",
    position: { x: 50, y: 90 },
  },
  end: {
    id: "end",
    text: "پایان. اما هر پایانی، آغازی دیگر است. [بازنشانی]",
    position: { x: 50, y: 0 },
  },
};

// Map keywords to Node IDs (UNCHANGED)
const linksMap: Record<string, string> = {
  باغ: "garden",
  آینه: "mirror",
  آب: "water",
  عمارت: "mansion",
  تماشا: "watch",
  کتابخانه: "library",
  شما: "you",
  زمان: "time",
  کلید: "key",
  زندگی: "life",
  بخوانید: "read",
  تاریکی: "darkness",
  رویا: "dream",
  فراموشی: "forget",
  آغاز: "start",
  زیرزمین: "basement",
  ورق: "turn",
  پایان: "end",
  من: "you",
  می‌بندید: "end",
  می‌نویسید: "read",
};

// --- Visualization Component (Styled for Sketch/Blueprint Look) ---
const StoryGraph: React.FC<{ history: string[]; activeId: string }> = ({ history, activeId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.parentElement?.clientWidth || 300;
    const h = canvas.parentElement?.clientHeight || 400;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Connections (Rough Pencil Lines)
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // Dashed lines like a plan
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)"; // Ink Black low opacity

    if (history.length > 1) {
      ctx.beginPath();
      const startNode = storyNodes[history[0]];
      if (startNode) ctx.moveTo((startNode.position.x * w) / 100, (startNode.position.y * h) / 100);

      for (let i = 1; i < history.length; i++) {
        const node = storyNodes[history[i]];
        if (node) ctx.lineTo((node.position.x * w) / 100, (node.position.y * h) / 100);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]); // Reset dash

    // 2. Draw Nodes (Ink Dots)
    Object.values(storyNodes).forEach((node) => {
      if (node.id === "end" || node.id === "start_loop") return;

      const x = (node.position.x * w) / 100;
      const y = (node.position.y * h) / 100;
      const isVisited = history.includes(node.id);
      const isActive = node.id === activeId;

      // Active Node Indicator (Target Reticle)
      if (isActive) {
        ctx.strokeStyle = PALETTE.mutantOrange;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.stroke();
        
        // Crosshair
        ctx.beginPath();
        ctx.moveTo(x - 15, y); ctx.lineTo(x + 15, y);
        ctx.moveTo(x, y - 15); ctx.lineTo(x, y + 15);
        ctx.stroke();
      }

      // Core dot
      ctx.fillStyle = isActive ? PALETTE.mutantOrange : isVisited ? "#333" : "#ccc";
      ctx.beginPath();
      ctx.arc(x, y, isActive ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Border for dot
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }, [history, activeId]);

  return <canvas ref={canvasRef} className="absolute inset-0 " />;
};

// --- Typewriter Effect Component (Comic Style) ---
const Typewriter: React.FC<{ text: string; onWordClick: (key: string) => void }> = ({
  text,
  onWordClick,
}) => {
  const [displayedSegments, setDisplayedSegments] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    setDisplayedSegments([]);
    const parts = text.split(/(\{.*?\})/g);

    let currentIndex = 0;

    const processNextPart = () => {
      if (currentIndex >= parts.length) return;

      const part = parts[currentIndex];
      const isLink = part.startsWith("{") && part.endsWith("}");
      const content = isLink ? part.slice(1, -1) : part;

      if (isLink) {
        setDisplayedSegments((prev) => [
          ...prev,
          <button
            key={currentIndex}
            onClick={() => onWordClick(content)}
            className="mx-1 px-1 relative group inline-block font-black text-[#E07000] hover:text-white hover:bg-black transition-none transform hover:-rotate-2 hover:scale-110 border-b-2 border-black border-dashed hover:border-solid"
          >
            <span className="relative z-10">{content}</span>
            {/* Spark Effect on Hover */}
            <span className="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 text-yellow-500 text-xl font-bold  transition-opacity duration-75">
              POW!
            </span>
          </button>,
        ]);
        currentIndex++;
        requestAnimationFrame(processNextPart);
      } else {
        let charIndex = 0;
        const typeChar = () => {
          if (charIndex < content.length) {
            const char = content[charIndex];
            setDisplayedSegments((prev) => {
              const last = prev[prev.length - 1];
              if (typeof last === "string") {
                return [...prev.slice(0, -1), last + char];
              }
              return [...prev, char];
            });
            charIndex++;
            setTimeout(typeChar, 20); // Slightly slower for dramatic effect
          } else {
            currentIndex++;
            processNextPart();
          }
        };
        typeChar();
      }
    };

    processNextPart();
  }, [text]);

  return (
    <p className="text-lg md:text-xl leading-9 text-justify font-mono font-bold text-black tracking-tight">
      {displayedSegments}
      {/* Blinking Cursor Block */}
      <span className="inline-block w-3 h-6 bg-black ml-1 animate-pulse align-middle"></span>
    </p>
  );
};

export const HypertextModule: React.FC = () => {
  const [currentNodeId, setCurrentNodeId] = useState<string>("start");
  const [history, setHistory] = useState<string[]>(["start"]);
  const currentNode = storyNodes[currentNodeId];

  // Animation trigger state
  const [pageTurn, setPageTurn] = useState(false);

  const handleLinkClick = (keyword: string) => {
    // Trigger Page Turn Animation
    setPageTurn(true);
    setTimeout(() => setPageTurn(false), 300);

    if (keyword === "بازنشانی") {
      setCurrentNodeId("start");
      setHistory(["start"]);
      return;
    }

    const nextNodeId = linksMap[keyword];
    if (nextNodeId && storyNodes[nextNodeId]) {
      setCurrentNodeId(nextNodeId);
      setHistory((prev) => [...prev, nextNodeId]);
    }
  };

  return (
    // MAIN CONTAINER: The "Artist's Desk" (Void)
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-[#2a2a2a] relative font-mono select-none">
      
      {/* CSS Pattern for Desk Texture */}
      <div className="absolute inset-0 opacity-10 " 
           style={{ backgroundImage: 'radial-gradient(#555 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Background Graph Layer (Sketchpad) */}
      <div className="absolute inset-0 z-0 opacity-40 md:opacity-100 mix-blend-multiply ">
        <StoryGraph history={history} activeId={currentNodeId} />
      </div>

      {/* Left Panel: The Comic Page */}
      <div className="w-full md:w-2/3 h-full z-10 p-4 md:p-8 flex flex-col justify-center relative">
        
        {/* THE COMIC PANEL CONTAINER */}
        <div className={`
            relative bg-white border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.8)] 
            transition-transform duration-100
            ${pageTurn ? 'scale-[0.98] rotate-1 opacity-80' : 'scale-100 rotate-0'}
        `}>
          
          {/* Panel Header: Narrator Box */}
          <div className="bg-[#FFCC00] border-b-[4px] border-black p-3 flex justify-between items-center">
            <div className="flex items-center gap-2 text-black font-black uppercase tracking-widest text-sm">
              <div className="bg-black text-white p-1 px-2 text-xs transform -skew-x-12">EPISODE 1</div>
              <span>هزارتوی بورخس</span>
            </div>
            <div className="flex gap-1">
               {/* Decorative Dots */}
               <div className="w-2 h-2 bg-black rounded-full"></div>
               <div className="w-2 h-2 bg-black rounded-full"></div>
               <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
          </div>

          {/* Panel Content: The Story */}
          <div className="p-6 md:p-10 min-h-[300px] relative">
            {/* "Mortus Hand" Shadow Effect (Simulated) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-black/10 to-transparent  rounded-bl-full z-0"></div>

            <div className="relative z-10">
              <Typewriter
                key={currentNodeId}
                text={currentNode.text}
                onWordClick={handleLinkClick}
              />
            </div>
          </div>

          {/* Panel Footer: Action Bar */}
          <div className="bg-black p-2 flex justify-between items-center text-white text-xs font-mono border-t-[4px] border-black">
            <div className="flex items-center gap-2 text-[#FFCC00]">
              <Zap size={14} className="fill-current" />
              <span>ACTION_REQUIRED</span>
            </div>
            
            {history.length > 1 && (
              <button
                onClick={() => {
                  const prev = history[history.length - 2];
                  setHistory((h) => h.slice(0, -1));
                  setCurrentNodeId(prev);
                }}
                className="flex items-center gap-2 hover:text-[#E07000] transition-colors uppercase"
              >
                <RotateCcw size={14} /> 
                <span>REWIND_PANEL</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Inventory / Status (Game UI) */}
      <div className="hidden md:flex w-1/3 h-full z-10 flex-col p-8 gap-6 ">
        
        {/* INVENTORY HEADER */}
        <div className="flex justify-end gap-4 pointer-events-auto">
            {/* Slot 1: Node ID */}
            <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 bg-[#FFCC00] border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center">
                    <GitBranch size={24} className="text-black" />
                </div>
                <span className="text-[10px] text-white bg-black px-1 font-bold">NODE</span>
            </div>

            {/* Slot 2: Depth */}
            <div className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 bg-[#FFCC00] border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center font-black text-xl text-black">
                    {history.length}
                </div>
                <span className="text-[10px] text-white bg-black px-1 font-bold">DEPTH</span>
            </div>

            {/* Slot 3: Status */}
            <div className="flex flex-col items-center gap-1">
                <div className={`w-14 h-14 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center ${currentNodeId === 'end' ? 'bg-red-600' : 'bg-gray-300'}`}>
                    <Skull size={24} className="text-black" />
                </div>
                <span className="text-[10px] text-white bg-black px-1 font-bold">STATUS</span>
            </div>
        </div>

        {/* MAP DATA BOX */}
        <div className="mt-auto bg-black/90 border-[3px] border-white p-4 shadow-[8px_8px_0px_0px_#500050]">
          <h3 className="text-[#E07000] font-black text-sm mb-4 flex items-center gap-2 border-b border-gray-700 pb-2 uppercase">
            <Map size={16} /> SEGA_GENESIS_VDP
          </h3>
          <div className="text-xs text-gray-300 space-y-2 font-mono">
            <p className="flex justify-between"><span>ACTIVE_NODE:</span> <span className="text-white">{currentNodeId.toUpperCase()}</span></p>
            <p className="flex justify-between"><span>TOTAL_NODES:</span> <span className="text-white">{Object.keys(storyNodes).length}</span></p>
            <p className="flex justify-between"><span>RENDER_MODE:</span> <span className="text-[#006000]">16-BIT</span></p>
          </div>
        </div>

      </div>
    </div>
  );
};