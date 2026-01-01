import React, { useState, useEffect } from "react";
import {
  User,
  Cpu,
  Award,
  Zap,
  Edit3,
  Save,
  Shield,
  Clock,
  Hash,
  Code,
  Skull,
  Hand,
  MousePointer2,
} from "lucide-react";

// --- COMIX ZONE DESIGN SYSTEM CONSTANTS ---
const PALETTE = {
  orange: "#E07000", // Mutant Orange
  green: "#006000", // Sewer Sludge
  purple: "#500050", // Bruised Purple
  yellow: "#FFCC00", // Narrator Box
  white: "#FFFFFF", // Sketch White
  black: "#000000", // Ink Black
};

// --- CUSTOM CSS FOR ANIMATIONS & FONTS ---
const ComixStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Courier+Prime:wght@700&display=swap');

    .font-comic { font-family: 'Bangers', cursive; letter-spacing: 1px; }
    .font-typewriter { font-family: 'Courier Prime', monospace; }
    
    /* The Void Background */
    .bg-artist-desk {
      background-color: #2a2a2a;
      background-image: radial-gradient(${PALETTE.purple} 20%, transparent 20%), radial-gradient(#1a1a1a 20%, transparent 20%);
      background-size: 20px 20px;
      background-position: 0 0, 10px 10px;
    }

    /* Panel Styling */
    .comic-panel {
      background-color: white;
      border: 4px solid black;
      box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
      position: relative;
      transition: transform 0.1s;
    }
    
    /* Hand-drawn Jitter Effect on Hover */
    .comic-panel:hover {
      transform: translate(-2px, -2px);
      box-shadow: 10px 10px 0px 0px ${PALETTE.orange};
    }

    /* Narrator Box (Yellow) */
    .narrator-box {
      background-color: ${PALETTE.yellow};
      border: 3px solid black;
      padding: 4px 8px;
      font-family: 'Bangers', cursive;
      text-transform: uppercase;
      box-shadow: 4px 4px 0px black;
      display: inline-block;
    }

    /* Inventory Slot Button */
    .inventory-slot {
      width: 48px;
      height: 48px;
      background-color: #333;
      border: 3px solid ${PALETTE.yellow};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.1s;
    }
    .inventory-slot.active {
      background-color: ${PALETTE.orange};
      transform: scale(1.1);
      box-shadow: 0 0 10px ${PALETTE.orange};
    }
    .inventory-slot:hover::after {
      content: 'SELECT';
      position: absolute;
      bottom: -20px;
      font-size: 10px;
      background: black;
      color: white;
      padding: 2px;
    }

    /* Mortus Hand Animation */
    @keyframes drawText {
      from { width: 0; }
      to { width: 100%; }
    }
    
    .typing-effect {
      overflow: hidden;
      white-space: nowrap;
      border-right: 4px solid black; /* The Cursor/Pen Tip */
      animation: drawText 2s steps(40, end);
    }
    
    /* Page Turn / Tear Effect */
    .page-tear {
      clip-path: polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%);
    }
  `}</style>
);

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");
  const [showHand, setShowHand] = useState(true); // For the initial "drawing" effect

  // Mock User Data
  const [user, setUser] = useState({
    name: "SOHRAB_NODE_01", // Uppercase for comic style
    realName: "سهراب سپهری (دیجیتال)",
    bio: "IF YOU COME TO ME, COME SOFTLY... LEST YOU CRACK THE FRAGILE CHINA OF MY CODE.",
    level: "ARCHITECT",
    xp: 4200,
    rank: 4,
  });

  const [editForm, setEditForm] = useState({ ...user });

  // Simulate the "Mortus Hand" drawing the page on load
  useEffect(() => {
    const timer = setTimeout(() => setShowHand(false), 2000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleSave = () => {
    // Visual feedback: Screen Flash
    const flash = document.createElement("div");
    flash.className = "fixed inset-0 bg-white z-50 opacity-0 transition-opacity duration-100";
    document.body.appendChild(flash);

    requestAnimationFrame(() => {
      flash.style.opacity = "1";
      setTimeout(() => {
        flash.style.opacity = "0";
        setTimeout(() => flash.remove(), 100);
      }, 100);
    });

    setUser(editForm);
  };

  return (
    <div className="min-h-screen bg-artist-desk p-4 md:p-8 font-sans text-black selection:bg-orange-500 selection:text-white">
      <ComixStyles />

      {/* THE PAGE CONTAINER (The Comic Book Page) */}
      <div className="max-w-5xl mx-auto bg-white min-h-[800px] relative page-tear shadow-2xl border-l-8 border-black">
        {/* --- HEADER SECTION: "THE HERO PANEL" --- */}
        <div className="p-6 border-b-4 border-black grid grid-cols-1 md:grid-cols-12 gap-6 bg-white relative overflow-hidden">
          {/* Background Halftone Pattern for Header */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          ></div>

          {/* AVATAR PANEL (Left) */}
          <div className="md:col-span-3 relative">
            <div className="w-full aspect-square border-4 border-black bg-orange-500 relative overflow-hidden shadow-[4px_4px_0_black]">
              <User
                size={80}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black"
              />
              {/* Rank Badge */}
              <div className="absolute top-0 left-0 bg-black text-white p-1 font-comic text-xl border-r-2 border-b-2 border-white">
                LVL.{user.rank}
              </div>
            </div>
            <div className="mt-2 text-center">
              <span className="narrator-box -rotate-2 text-sm">HERO: {user.level}</span>
            </div>
          </div>

          {/* INFO PANEL (Center) */}
          <div className="md:col-span-6 flex flex-col justify-center z-10">
            <h1 className="text-5xl font-comic text-black mb-2 drop-shadow-[2px_2px_0_rgba(255,204,0,1)]">
              {user.name}
            </h1>

            {/* Speech Bubble for Bio */}
            <div className="relative bg-white border-2 border-black rounded-2xl p-4 mb-4 shadow-[4px_4px_0_#ccc]">
              <div className="absolute -left-3 top-4 w-4 h-4 bg-white border-l-2 border-b-2 border-black transform rotate-45"></div>
              <p className={`font-typewriter text-sm font-bold ${showHand ? "typing-effect" : ""}`}>
                "{user.bio}"
              </p>
            </div>

            {/* XP Bar (Health Bar Style) */}
            <div className="w-full border-4 border-black h-8 relative bg-gray-300">
              <div
                className="h-full bg-[#E07000] border-r-4 border-black"
                style={{ width: `${(user.xp / 5000) * 100}%` }}
              ></div>
              <span className="absolute inset-0 flex items-center justify-center font-comic text-white text-shadow-black tracking-widest">
                XP: {user.xp} / 5000
              </span>
            </div>
          </div>

          {/* INVENTORY / NAV (Right) */}
          <div className="md:col-span-3 flex flex-col items-end gap-4">
            <div className="narrator-box bg-black text-white border-white mb-2">INVENTORY</div>
            <div className="grid grid-cols-3 gap-2">
              {/* Slot 1: Dashboard */}
              <button
                onClick={() => setActiveTab("overview")}
                className={`inventory-slot ${activeTab === "overview" ? "active" : ""}`}
                title="Dashboard"
              >
                <Cpu size={24} color={activeTab === "overview" ? "black" : "white"} />
              </button>

              {/* Slot 2: Settings */}
              <button
                onClick={() => setActiveTab("settings")}
                className={`inventory-slot ${activeTab === "settings" ? "active" : ""}`}
                title="Settings"
              >
                <Edit3 size={24} color={activeTab === "settings" ? "black" : "white"} />
              </button>

              {/* Slot 3: Action (Mock) */}
              <button className="inventory-slot hover:bg-red-600 group">
                <Skull size={24} className="text-white group-hover:animate-bounce" />
              </button>
            </div>
            <div className="mt-4 text-right">
              <p className="font-typewriter text-xs text-gray-500">SEGA GENESIS VDP</p>
              <p className="font-typewriter text-xs text-gray-500">MODE: NTSC</p>
            </div>
          </div>
        </div>

        {/* --- CONTENT AREA: "THE STORY PANELS" --- */}
        <div className="p-8 bg-gray-100 min-h-[500px]">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Panel 1: Stats */}
              <div className="comic-panel p-4 col-span-2 bg-white">
                <div className="absolute -top-3 -left-3 narrator-box bg-[#E07000] text-white">STATS_LOG</div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-3 border-b-2 border-dashed border-gray-300 pb-2">
                    <Code size={32} className="text-[#006000]" />
                    <div>
                      <h4 className="text-3xl font-comic">12</h4>
                      <p className="font-typewriter text-xs">PROJECTS</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border-b-2 border-dashed border-gray-300 pb-2">
                    <Award size={32} className="text-[#500050]" />
                    <div>
                      <h4 className="text-3xl font-comic">8</h4>
                      <p className="font-typewriter text-xs">BADGES</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap size={32} className="text-[#FFCC00]" />
                    <div>
                      <h4 className="text-3xl font-comic">350</h4>
                      <p className="font-typewriter text-xs">TOKENS</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={32} className="text-blue-600" />
                    <div>
                      <h4 className="text-3xl font-comic">14h</h4>
                      <p className="font-typewriter text-xs">UPTIME</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 2: Badges (Vertical Strip) */}
              <div className="comic-panel p-4 bg-[#f0f0f0]">
                <div className="absolute -top-3 -right-3 narrator-box bg-black text-white rotate-2">
                  TROPHIES
                </div>
                <div className="space-y-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 border-2 border-black bg-[#FFCC00] flex items-center justify-center">
                      <Award size={20} />
                    </div>
                    <span className="font-comic text-lg">GLITCH MASTER</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 border-2 border-black bg-[#006000] text-white flex items-center justify-center">
                      <Code size={20} />
                    </div>
                    <span className="font-comic text-lg">CODE POET</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-50 grayscale">
                    <div className="w-10 h-10 border-2 border-black border-dashed flex items-center justify-center">
                      <Hash size={20} />
                    </div>
                    <span className="font-comic text-lg">LOCKED</span>
                  </div>
                </div>
              </div>

              {/* Panel 3: Recent Activity (Full Width Bottom) */}
              <div className="col-span-full comic-panel p-6 mt-4">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white border-2 border-black px-4 py-1 font-comic text-xl z-10">
                  EPISODE 1: RECENT LOGS
                </div>
                <div className="space-y-3 mt-2 font-typewriter text-sm">
                  {[1, 2, 3].map((_, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center border-b border-gray-300 pb-2 hover:bg-yellow-100 transition-colors cursor-pointer px-2"
                    >
                      <span className="text-[#500050] font-bold">10:4{i} PM</span>
                      <span>
                        EXECUTED MODULE: {i === 0 ? "AI_CORE" : i === 1 ? "PHYSICS_ENGINE" : "NARRATIVE_LOOP"}
                      </span>
                      <span className="text-[#006000] font-bold">[SUCCESS]</span>
                    </div>
                  ))}
                </div>
                {/* Sound Effect Visual */}
                <div className="absolute -bottom-4 -right-4 text-6xl font-comic text-red-600 transform -rotate-12 opacity-80 pointer-events-none drop-shadow-[2px_2px_0_black]">
                  CLICK!
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="max-w-2xl mx-auto comic-panel p-8 bg-white rotate-1">
              <div className="absolute -top-5 left-10 narrator-box bg-red-600 text-white text-xl">
                SECRET IDENTITY
              </div>

              <div className="flex flex-col gap-6 mt-4">
                <div className="relative group">
                  <label className="block font-comic text-xl mb-1">CODENAME</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full border-4 border-black p-3 font-typewriter text-lg focus:outline-none focus:shadow-[4px_4px_0_#E07000] transition-shadow"
                  />
                  <MousePointer2 className="absolute right-4 top-10 opacity-0 group-hover:opacity-100 transition-opacity text-black" />
                </div>

                <div>
                  <label className="block font-comic text-xl mb-1">ORIGIN STORY (BIO)</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full border-4 border-black p-3 font-typewriter text-lg h-32 focus:outline-none focus:shadow-[4px_4px_0_#E07000] transition-shadow"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSave}
                    className="bg-[#006000] text-white font-comic text-2xl px-8 py-3 border-4 border-black shadow-[4px_4px_0_black] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2 active:bg-[#004000]"
                  >
                    <Save size={24} /> SAVE GAME
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Page Number */}
        <div className="absolute bottom-2 right-4 font-comic text-gray-400">PAGE 1 / 42</div>
      </div>
    </div>
  );
};

export default Dashboard;
