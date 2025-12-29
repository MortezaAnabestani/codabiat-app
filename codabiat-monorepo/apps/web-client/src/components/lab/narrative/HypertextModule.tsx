import React, { useState, useEffect, useRef } from "react";
import { GitBranch, RotateCcw, Map, MousePointer2 } from "lucide-react";

// --- Types ---
interface StoryNode {
  id: string;
  text: string; // The raw text containing {keyword} syntax
  audio?: string; // Optional ambient sound trigger
  position: { x: number; y: number }; // For the visual graph
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
}

// --- Data: The Garden of Forking Paths (Persian Adaptation) ---
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
    position: { x: 80, y: 90 }, // Loops back visually near start
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
    id: "start", // Logic to handle looping back to start ID
    text: "",
    position: { x: 50, y: 90 },
  },
  end: {
    id: "end",
    text: "پایان. اما هر پایانی، آغازی دیگر است. [بازنشانی]",
    position: { x: 50, y: 0 },
  },
};

// Map keywords to Node IDs
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

// --- Visualization Component (Constellation Graph) ---
const StoryGraph: React.FC<{ history: string[]; activeId: string }> = ({ history, activeId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Setup scaling
    const w = canvas.parentElement?.clientWidth || 300;
    const h = canvas.parentElement?.clientHeight || 400;
    canvas.width = w;
    canvas.height = h;

    // Draw Logic
    ctx.clearRect(0, 0, w, h);

    // 1. Draw Connections (Lines)
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(99, 102, 241, 0.2)"; // Indigo low opacity

    // Draw lines between history points
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

    // 2. Draw Nodes
    Object.values(storyNodes).forEach((node) => {
      if (node.id === "end" || node.id === "start_loop") return;

      const x = (node.position.x * w) / 100;
      const y = (node.position.y * h) / 100;
      const isVisited = history.includes(node.id);
      const isActive = node.id === activeId;

      // Glow for active
      if (isActive) {
        const gradient = ctx.createRadialGradient(x, y, 2, x, y, 15);
        gradient.addColorStop(0, "rgba(168, 85, 247, 0.8)");
        gradient.addColorStop(1, "rgba(168, 85, 247, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core dot
      ctx.fillStyle = isActive ? "#fff" : isVisited ? "#a855f7" : "#333";
      ctx.beginPath();
      ctx.arc(x, y, isActive ? 4 : 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [history, activeId]);

  return <canvas ref={canvasRef} className="absolute inset-0 " />;
};

// --- Typewriter Effect Component ---
const Typewriter: React.FC<{ text: string; onWordClick: (key: string) => void }> = ({
  text,
  onWordClick,
}) => {
  const [displayedSegments, setDisplayedSegments] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    setDisplayedSegments([]);
    const parts = text.split(/(\{.*?\})/g); // Split by {keyword}

    let currentIndex = 0;

    const processNextPart = () => {
      if (currentIndex >= parts.length) return;

      const part = parts[currentIndex];
      const isLink = part.startsWith("{") && part.endsWith("}");
      const content = isLink ? part.slice(1, -1) : part;

      if (isLink) {
        // Render link immediately or with a different effect
        setDisplayedSegments((prev) => [
          ...prev,
          <button
            key={currentIndex}
            onClick={() => onWordClick(content)}
            className="mx-1 text-indigo-400 border-b border-indigo-500/50 hover:text-white hover:bg-indigo-600/20 hover:border-transparent transition-all px-1 rounded animate-pulse cursor-pointer"
          >
            {content}
          </button>,
        ]);
        currentIndex++;
        requestAnimationFrame(processNextPart);
      } else {
        // Typewriter effect for plain text
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
            setTimeout(typeChar, 15); // Typing speed
          } else {
            currentIndex++;
            processNextPart();
          }
        };
        typeChar();
      }
    };

    processNextPart();
  }, [text]); // Re-run when full text changes

  return (
    <p className="text-xl md:text-2xl leading-10 text-justify font-light text-gray-200">
      {displayedSegments}
    </p>
  );
};

export const HypertextModule: React.FC = () => {
  const [currentNodeId, setCurrentNodeId] = useState<string>("start");
  const [history, setHistory] = useState<string[]>(["start"]);
  const currentNode = storyNodes[currentNodeId];

  const handleLinkClick = (keyword: string) => {
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
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-[#080808] relative">
      {/* Background Graph Layer (Desktop) */}
      <div className="absolute inset-0 z-0 opacity-30 md:opacity-100">
        <StoryGraph history={history} activeId={currentNodeId} />
      </div>

      {/* Left Panel: Narrative Area */}
      <div className="w-full md:w-2/3 h-full z-10 p-6 md:p-12 flex flex-col justify-center relative ">
        <div className="pointer-events-auto bg-black/60 backdrop-blur-md p-8 border border-white/10 rounded-2xl shadow-2xl max-w-2xl mx-auto md:mx-0">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <GitBranch size={20} />
              <span className="font-display text-lg">هزارتوی بورخس</span>
            </div>
            <div className="flex gap-2 text-xs font-mono text-gray-500">
              <span>NODE_ID: {currentNodeId.toUpperCase()}</span>
              <span>DEPTH: {history.length}</span>
            </div>
          </div>

          <div className="min-h-[150px]">
            <Typewriter
              key={currentNodeId} // Force re-render on node change to restart effect
              text={currentNode.text}
              onWordClick={handleLinkClick}
            />
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500 font-mono">
            <div className="flex items-center gap-2">
              <MousePointer2 size={12} className="animate-bounce" />
              <span>SELECT_HIGHLIGHTED_WORDS</span>
            </div>
            {history.length > 1 && (
              <button
                onClick={() => {
                  const prev = history[history.length - 2];
                  setHistory((h) => h.slice(0, -1));
                  setCurrentNodeId(prev);
                }}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <RotateCcw size={12} /> UNDO
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Map/Status (Visual only, interactions handled by graph) */}
      <div className="hidden md:flex w-1/3 h-full z-10 flex-col justify-end p-8 ">
        <div className="bg-black/80 border border-indigo-500/30 p-4 rounded-xl backdrop-blur mb-8">
          <h3 className="text-indigo-400 font-mono text-sm mb-2 flex items-center gap-2">
            <Map size={14} /> NARRATIVE_TOPOLOGY
          </h3>
          <div className="text-[10px] text-gray-400 space-y-1">
            <p>GRAPH_NODES: {Object.keys(storyNodes).length}</p>
            <p>PATHS_EXPLORED: {history.length}</p>
            <p>CURRENT_STATE: {currentNodeId === "end" ? "TERMINATED" : "ACTIVE"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
