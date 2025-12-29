import React, { useState, useEffect, useRef } from "react";
import { MapPin, Hand, Bomb, Skull, PenTool, X } from "lucide-react";
import { generateLocativeContent } from "../../../services/geminiService";

interface NodeLocation {
  id: string;
  lat: number;
  lng: number;
  story: string;
  timestamp: string;
}

export const LocativeNarrativeModule: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [activeNode, setActiveNode] = useState<NodeLocation | null>(null);
  const [nodes, setNodes] = useState<NodeLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Typewriter effect state
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    if (!mapInstance.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([35.6997, 51.338], 13);

      // Using a high contrast, gritty map style if available, or standard dark with CSS filters later
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CartoDB",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      mapInstance.current = map;
      setMapReady(true);

      // Custom "Ink Blot" Icon for Comix Zone style
      const inkIcon = L.divIcon({
        className: "custom-ink-icon",
        html: `<div style="
          background-color: #000; 
          width: 16px; 
          height: 16px; 
          transform: rotate(45deg); 
          border: 2px solid #E07000; 
          box-shadow: 4px 4px 0px #500050;">
        </div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        handleScanLocation(lat, lng, map, inkIcon);
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Typewriter Effect Logic
  useEffect(() => {
    if (activeNode?.story) {
      setDisplayedText("");
      setIsTyping(true);
      let i = 0;
      const text = activeNode.story;
      const speed = 30; // Typing speed

      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText((prev) => prev + text.charAt(i));
          i++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }
  }, [activeNode]);

  const handleScanLocation = async (lat: number, lng: number, map: any, icon: any) => {
    if (loading) return;
    setScanning(true);
    setLoading(true);

    const L = (window as any).L;
    L.marker([lat, lng], { icon: icon }).addTo(map);

    map.flyTo([lat, lng], 15, { duration: 1.0 }); // Faster, snappier camera move

    // Simulate "Drawing" delay
    setTimeout(async () => {
      const coords = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      const story = await generateLocativeContent(coords);

      const newNode: NodeLocation = {
        id: Date.now().toString(),
        lat,
        lng,
        story,
        timestamp: new Date().toLocaleTimeString("fa-IR"),
      };

      setNodes((prev) => [newNode, ...prev]);
      setActiveNode(newNode);
      setLoading(false);
      setScanning(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-[#500050] font-mono">
      {/* --- THE VOID BACKGROUND (Artist's Desk) --- */}
      <div className="absolute inset-0 opacity-10  bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      {/* --- HEADER: INVENTORY SLOTS --- */}
      <div className="flex items-center justify-between p-4 z-20 shrink-0 bg-[#202020] border-b-4 border-black shadow-lg">
        <div className="flex items-center gap-4">
          {/* Slot 1: The Rat (About) */}
          <div className="w-12 h-12 bg-[#FFCC00] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all cursor-pointer group">
            <Skull size={24} className="text-black group-hover:animate-bounce" />
          </div>
          {/* Slot 2: Dynamite (Status) */}
          <div className="w-12 h-12 bg-[#FFCC00] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {scanning ? (
              <Bomb size={24} className="text-red-600 animate-pulse" />
            ) : (
              <MapPin size={24} className="text-black" />
            )}
          </div>

          <div className="ml-2">
            <h2 className="text-[#E07000] text-xl font-black tracking-widest uppercase drop-shadow-[2px_2px_0_#000]">
              SEGA_MAPPER
            </h2>
            <p className="text-[10px] text-white bg-black inline-block px-1">EPISODE 1: TEHRAN</p>
          </div>
        </div>

        <div className="flex gap-2 text-xs font-bold text-white">
          <div className="bg-black px-2 py-1 border-2 border-[#006000]">
            COORD: {activeNode ? `${activeNode.lat.toFixed(2)},${activeNode.lng.toFixed(2)}` : "UNKNOWN"}
          </div>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden relative z-10 p-4 gap-4">
        {/* --- PANEL 1: THE MAP (Main Action) --- */}
        <div className="flex-grow relative h-full w-full">
          {/* Panel Border Effect */}
          <div className="absolute inset-0 border-4 border-black bg-black z-0 transform rotate-1 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]"></div>

          <div className="absolute inset-0 z-10 m-1 border-2 border-white overflow-hidden bg-[#111]">
            <div ref={mapRef} className="w-full h-full grayscale contrast-125" />

            {/* Comic Overlay Text */}
            <div className="absolute top-2 left-2 z-[400] bg-[#FFCC00] border-2 border-black px-2 py-1 transform -rotate-2 shadow-[4px_4px_0_#000]">
              <span className="text-black font-black text-xs">LOCATION: SECTOR 7</span>
            </div>

            {/* Scanning Visuals */}
            {scanning && (
              <div className="absolute inset-0 z-[400] flex items-center justify-center ">
                <div
                  className="absolute text-6xl font-black text-[#E07000] animate-ping opacity-50"
                  style={{ textShadow: "4px 4px 0 #000" }}
                >
                  SCAN!
                </div>
                <div className="w-full h-full border-[20px] border-[#E07000]/20 animate-pulse"></div>
              </div>
            )}
          </div>
        </div>

        {/* --- PANEL 2: NARRATIVE (The "Mortus Hand" Area) --- */}
        {/* Only show if there is an active node or history */}
        <div
          className={`absolute md:relative bottom-4 left-4 right-4 md:bottom-auto md:left-auto md:right-auto md:w-1/3 h-auto md:h-full flex flex-col gap-4 transition-all duration-500 ${
            activeNode ? "translate-x-0" : "translate-x-full md:translate-x-0"
          }`}
        >
          {activeNode && (
            <div className="relative bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000] transform -rotate-1 animate-in slide-in-from-right duration-300">
              {/* Narrator Box (Yellow) */}
              <div className="absolute -top-4 -left-2 bg-[#FFCC00] border-4 border-black px-3 py-1 transform rotate-2 z-20">
                <span className="font-black text-xs tracking-widest">NARRATOR_LOG</span>
              </div>

              {/* Close Button (X) */}
              <button
                onClick={() => setActiveNode(null)}
                className="absolute -top-4 -right-4 bg-red-600 text-white border-4 border-black w-8 h-8 flex items-center justify-center hover:bg-red-700 z-30"
              >
                <X size={16} strokeWidth={4} />
              </button>

              {/* Content Area */}
              <div className="relative min-h-[150px] max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                <div className="mb-4 border-b-2 border-dashed border-gray-400 pb-2">
                  <h3 className="text-xl font-black text-black uppercase leading-none">
                    NODE #{activeNode.id.slice(-4)}
                  </h3>
                  <span className="text-xs text-[#500050] font-bold">{activeNode.timestamp}</span>
                </div>

                {/* Text Generation with Hand Effect */}
                <div className="relative">
                  <p className="text-black text-sm font-bold leading-6 text-justify">
                    {displayedText}
                    {isTyping && <span className="inline-block w-2 h-4 bg-black animate-pulse ml-1">_</span>}
                  </p>

                  {/* The "Mortus Hand" - Visual representation of drawing */}
                  {isTyping && (
                    <div className="absolute -right-4 bottom-0 transition-all duration-100 animate-bounce">
                      <Hand
                        size={48}
                        className="text-black fill-[#FFCC00] drop-shadow-lg transform -rotate-45"
                        strokeWidth={1.5}
                      />
                      <PenTool size={24} className="absolute -top-2 -left-2 text-black fill-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Speech Bubble Tail */}
              <div className="absolute -bottom-4 left-10 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-t-black"></div>
              <div className="absolute -bottom-[13px] left-[42px] w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[16px] border-t-white"></div>
            </div>
          )}

          {/* History List (Mini Panels) */}
          {!activeNode && nodes.length > 0 && (
            <div className="bg-[#006000] border-4 border-black p-2 shadow-[8px_8px_0px_#000] max-h-64 overflow-y-auto">
              <h4 className="text-white font-black text-xs mb-2 uppercase border-b-2 border-black pb-1">
                Previous Issues
              </h4>
              {nodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => {
                    setActiveNode(node);
                    mapInstance.current?.flyTo([node.lat, node.lng], 15);
                  }}
                  className="bg-white border-2 border-black mb-2 p-2 cursor-pointer hover:bg-[#FFCC00] transition-colors flex justify-between items-center group"
                >
                  <span className="text-xs font-bold truncate w-32 group-hover:text-black">
                    {node.story.substring(0, 15)}...
                  </span>
                  <div className="w-2 h-2 bg-black rounded-full group-hover:bg-white"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- INSTRUCTIONS (Floating Text) --- */}
      {nodes.length === 0 && !loading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] ">
          <div className="bg-white border-4 border-black p-4 transform rotate-3 shadow-[8px_8px_0_rgba(0,0,0,0.8)] text-center">
            <h1 className="text-4xl font-black text-[#E07000] drop-shadow-[2px_2px_0_#000] mb-2">ACTION!</h1>
            <p className="font-bold text-black text-sm bg-[#FFCC00] px-2 inline-block">
              CLICK MAP TO START EPISODE
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
