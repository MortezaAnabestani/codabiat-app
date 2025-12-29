import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  Network,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Share2,
  Filter,
  Activity,
  Zap,
  Layers,
  X,
} from "lucide-react";

// --- TYPES ---
interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: "tech" | "lit" | "theory" | "core";
  value: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  strength: number;
}

// --- DATA ---
const initialData: { nodes: Node[]; links: Link[] } = {
  nodes: [
    { id: "ادبیات دیجیتال", group: "core", value: 40 },
    { id: "الگوریتم", group: "tech", value: 25 },
    { id: "شعر نو", group: "lit", value: 22 },
    { id: "هوش مصنوعی", group: "tech", value: 30 },
    { id: "ساختارگرایی", group: "theory", value: 18 },
    { id: "کدنویسی خلاق", group: "tech", value: 28 },
    { id: "بوف کور", group: "lit", value: 20 },
    { id: "هایپرتکست", group: "core", value: 24 },
    { id: "گلیچ آرت", group: "tech", value: 15 },
    { id: "پسا‌مدرنیسم", group: "theory", value: 19 },
    { id: "داده‌کاوی", group: "tech", value: 16 },
    { id: "غزل", group: "lit", value: 14 },
    { id: "نورال نت", group: "tech", value: 22 },
    { id: "پدیدارشناسی", group: "theory", value: 15 },
  ],
  links: [
    { source: "ادبیات دیجیتال", target: "الگوریتم", strength: 0.8 },
    { source: "ادبیات دیجیتال", target: "هایپرتکست", strength: 0.9 },
    { source: "الگوریتم", target: "هوش مصنوعی", strength: 0.7 },
    { source: "هوش مصنوعی", target: "نورال نت", strength: 0.95 },
    { source: "شعر نو", target: "ادبیات دیجیتال", strength: 0.6 },
    { source: "ساختارگرایی", target: "پسا‌مدرنیسم", strength: 0.85 },
    { source: "کدنویسی خلاق", target: "گلیچ آرت", strength: 0.75 },
    { source: "بوف کور", target: "شعر نو", strength: 0.5 },
    { source: "هایپرتکست", target: "ساختارگرایی", strength: 0.65 },
    { source: "پسا‌مدرنیسم", target: "بوف کور", strength: 0.4 },
    { source: "نورال نت", target: "کدنویسی خلاق", strength: 0.7 },
    { source: "داده‌کاوی", target: "هوش مصنوعی", strength: 0.8 },
    { source: "غزل", target: "شعر نو", strength: 0.3 },
    { source: "پدیدارشناسی", target: "ساختارگرایی", strength: 0.7 },
  ],
};

// --- COMIX ZONE PALETTE ---
const PALETTE = {
  orange: "#E07000", // Mutant Orange
  green: "#006000", // Sewer Sludge
  purple: "#500050", // Bruised Purple
  yellow: "#FFCC00", // Narrator Box
  white: "#FFFFFF", // Sketch White
  black: "#000000", // Ink Black
  void: "#1a1a1a", // Artist Desk
};

export const SemanticClusterModule: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    const svg = d3.select(svgRef.current).attr("viewBox", [0, 0, width, height]);

    svg.selectAll("*").remove();

    // --- SEGA STYLE FILTERS (Rough Ink) ---
    const defs = svg.append("defs");

    // Filter for "Hand Drawn" jitter
    const roughFilter = defs.append("filter").attr("id", "roughPaper");
    roughFilter
      .append("feTurbulence")
      .attr("type", "fractalNoise")
      .attr("baseFrequency", "0.04")
      .attr("numOctaves", "5")
      .attr("result", "noise");
    roughFilter
      .append("feDisplacementMap")
      .attr("in", "SourceGraphic")
      .attr("in2", "noise")
      .attr("scale", "3");

    // Filter for "Ink Blot" shadow
    const dropShadow = defs.append("filter").attr("id", "inkShadow");
    dropShadow.append("feGaussianBlur").attr("in", "SourceAlpha").attr("stdDeviation", 2);
    dropShadow.append("feOffset").attr("dx", 3).attr("dy", 3).attr("result", "offsetblur");
    dropShadow.append("feFlood").attr("flood-color", "#000000");
    dropShadow.append("feComposite").attr("in2", "offsetblur").attr("operator", "in");
    const merge = dropShadow.append("feMerge");
    merge.append("feMergeNode");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    const g = svg.append("g");

    // --- Zoom Logic ---
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom as any);

    // --- Simulation Setup ---
    const simulation = d3
      .forceSimulation<Node>(initialData.nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(initialData.links)
          .id((d) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d) => (d as Node).value + 30)
      );

    // --- Draw Links (Sketchy Lines) ---
    const link = g
      .append("g")
      .attr("stroke", PALETTE.black)
      .attr("stroke-opacity", 1)
      .selectAll("line")
      .data(initialData.links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.strength) * 4) // Thicker ink lines
      .attr("filter", "url(#roughPaper)") // Apply jitter
      .attr("class", "transition-all duration-300");

    // --- Draw Nodes (Ink Blots/Paper Cutouts) ---
    const node = g
      .append("g")
      .selectAll("g")
      .data(initialData.nodes)
      .join("g")
      .attr("class", "cursor-pointer group")
      .call(d3.drag<any, any>().on("start", dragstarted).on("drag", dragged).on("end", dragended) as any)
      .on("click", (event, d) => {
        setSelectedNode(d);
        highlightConnections(d);
      });

    // Node Shape (Rough Circle with thick border)
    node
      .append("circle")
      .attr("r", (d) => d.value + 5)
      .attr("fill", (d) => {
        if (d.group === "core") return PALETTE.orange;
        if (d.group === "tech") return PALETTE.green;
        if (d.group === "lit") return PALETTE.purple;
        return PALETTE.yellow;
      })
      .attr("stroke", PALETTE.black)
      .attr("stroke-width", 3)
      .attr("filter", "url(#roughPaper)") // Jittery edges
      .attr("class", "transition-transform group-hover:scale-110 duration-100");

    // Node Labels (Pixel Font)
    node
      .append("text")
      .text((d) => d.id)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.value + 25)
      .attr("fill", PALETTE.black)
      .attr("font-size", "14px")
      .attr("font-family", "'Courier New', monospace") // Fallback to typewriter style
      .attr("font-weight", "bold")
      .style("text-shadow", "2px 2px 0px #FFFFFF") // White outline for readability
      .attr("class", "pointer-events-none uppercase tracking-tighter");

    // --- Highlight Logic ---
    function highlightConnections(d: Node) {
      const neighbors = new Set();
      initialData.links.forEach((l) => {
        if ((l.source as any).id === d.id) neighbors.add((l.target as any).id);
        if ((l.target as any).id === d.id) neighbors.add((l.source as any).id);
      });

      node.style("opacity", (n) => (n.id === d.id || neighbors.has(n.id) ? 1 : 0.3));
      link
        .style("stroke", (l) =>
          (l.source as any).id === d.id || (l.target as any).id === d.id ? PALETTE.orange : PALETTE.black
        )
        .style("stroke-width", (l) =>
          (l.source as any).id === d.id || (l.target as any).id === d.id ? 6 : 2
        );
    }

    // --- Simulation Tick ---
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as any).x)
        .attr("y1", (d) => (d.source as any).y)
        .attr("x2", (d) => (d.target as any).x)
        .attr("y2", (d) => (d.target as any).y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // --- Drag Events ---
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop();
  }, []);

  return (
    // MAIN CONTAINER: The "Void" / Artist's Desk
    <div className="h-full flex flex-col relative bg-[#2a2a2a] overflow-hidden font-mono select-none">
      {/* BACKGROUND TEXTURE: Scattered Pencils/Paper (Simulated via CSS patterns) */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#555 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      ></div>

      {/* --- HUD / INVENTORY HEADER --- */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start pointer-events-none">
        {/* LEFT: Title Card (Narrator Box Style) */}
        <div className="pointer-events-auto transform -rotate-1">
          <div className="bg-[#FFCC00] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 max-w-xs">
            <div className="flex items-center gap-3 border-b-2 border-black pb-2 mb-2">
              <div className="bg-black text-white p-1">
                <Network size={24} />
              </div>
              <div>
                <h2 className="text-black font-black text-xl uppercase tracking-tighter leading-none">
                  خوشه‌بندی عصبی
                </h2>
                <p className="text-xs font-bold text-[#E07000] uppercase">EPISODE 1: TOPOLOGY</p>
              </div>
            </div>

            {/* Search Input (Sketch Style) */}
            <div className="relative">
              <Search size={16} className="absolute left-2 top-2.5 text-black" />
              <input
                type="text"
                placeholder="جستجو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border-2 border-black border-dashed py-1 pl-8 pr-2 text-sm text-black placeholder-gray-500 outline-none focus:bg-[#E07000] focus:text-white transition-colors font-bold"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Inventory Slots (Controls) */}
        <div className="flex flex-col gap-4 pointer-events-auto">
          {/* Slot Group 1: Stats */}
          <div className="flex gap-2">
            <div className="w-12 h-12 bg-black border-2 border-gray-600 flex flex-col items-center justify-center relative group">
              <Layers size={16} className="text-[#FFCC00] mb-1" />
              <span className="text-[#FFCC00] text-[10px] font-bold">{initialData.nodes.length}</span>
              <div className="absolute -bottom-6 bg-white text-black text-[10px] px-1 border border-black opacity-0 group-hover:opacity-100 transition-opacity">
                NODES
              </div>
            </div>
            <div className="w-12 h-12 bg-black border-2 border-gray-600 flex flex-col items-center justify-center relative group">
              <Zap size={16} className="text-[#E07000] mb-1" />
              <span className="text-[#E07000] text-[10px] font-bold">{initialData.links.length}</span>
              <div className="absolute -bottom-6 bg-white text-black text-[10px] px-1 border border-black opacity-0 group-hover:opacity-100 transition-opacity">
                LINKS
              </div>
            </div>
          </div>

          {/* Slot Group 2: Actions */}
          <div className="flex gap-2 justify-end">
            <button className="w-10 h-10 bg-[#FFCC00] border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center text-black">
              <Maximize2 size={18} />
            </button>
            <button className="w-10 h-10 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center text-black">
              <ZoomIn size={18} />
            </button>
            <button className="w-10 h-10 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center text-black">
              <ZoomOut size={18} />
            </button>
          </div>

          {/* Legend (Comic Strip Style) */}
          <div className="bg-white border-4 border-black p-2 transform rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black bg-black text-white px-1 mb-2 inline-block">GUIDE</p>
            <div className="space-y-1">
              <div className="flex items-center justify-end gap-2 text-[10px] font-bold">
                <span className="text-black">هسته</span>
                <div className="w-3 h-3 border border-black bg-[#E07000]"></div>
              </div>
              <div className="flex items-center justify-end gap-2 text-[10px] font-bold">
                <span className="text-black">تکنولوژی</span>
                <div className="w-3 h-3 border border-black bg-[#006000]"></div>
              </div>
              <div className="flex items-center justify-end gap-2 text-[10px] font-bold">
                <span className="text-black">ادبیات</span>
                <div className="w-3 h-3 border border-black bg-[#500050]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CANVAS (The Page) --- */}
      <div
        ref={containerRef}
        className="w-full h-full relative z-0 cursor-grab active:cursor-grabbing bg-[#f0f0f0]"
      >
        {/* Paper Texture Overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          }}
        ></div>
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* --- ANALYSIS PANEL (Comic Panel Overlay) --- */}
      {selectedNode && (
        <div className="absolute right-6 bottom-6 w-80 z-30 pointer-events-auto animate-in slide-in-from-bottom-10 duration-300">
          {/* "POW!" Effect behind the panel */}
          <div className="absolute -top-10 -left-10 text-[#E07000] font-black text-6xl opacity-80 rotate-[-15deg] z-0 drop-shadow-[2px_2px_0px_#000]">
            DATA!
          </div>

          {/* The Panel Itself */}
          <div className="relative bg-white border-[6px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-0 overflow-hidden">
            {/* Header: Narrator Box */}
            <div className="bg-[#FFCC00] border-b-4 border-black p-3 flex justify-between items-start">
              <div>
                <h3 className="text-black font-black text-2xl uppercase leading-none">{selectedNode.id}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase">
                  {selectedNode.group}_CLASS
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-black hover:text-red-600 transition-colors"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            {/* Content: Speech Bubble Style */}
            <div className="p-4 space-y-4 relative">
              {/* Stats Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold text-black mb-1 uppercase">
                  <span>POWER LEVEL</span>
                  <span>{selectedNode.value}</span>
                </div>
                <div className="w-full h-4 border-2 border-black bg-white relative">
                  <div
                    className="h-full bg-[#E07000] border-r-2 border-black"
                    style={{ width: `${(selectedNode.value / 40) * 100}%` }}
                  />
                  {/* Scanlines on bar */}
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[size:4px_4px]"></div>
                </div>
              </div>

              {/* Linked Concepts */}
              <div className="bg-[#f0f0f0] border-2 border-black border-dashed p-3 relative">
                <p className="absolute -top-3 right-2 bg-white px-1 text-[10px] font-bold text-black border border-black">
                  LINKS
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {initialData.links
                    .filter(
                      (l) =>
                        (l.source as any).id === selectedNode.id || (l.target as any).id === selectedNode.id
                    )
                    .map((l, i) => {
                      const neighbor =
                        (l.source as any).id === selectedNode.id
                          ? (l.target as any).id
                          : (l.source as any).id;
                      return (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white border border-black text-[10px] font-bold text-black shadow-[2px_2px_0px_0px_#000]"
                        >
                          {neighbor}
                        </span>
                      );
                    })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-3 bg-[#006000] hover:bg-[#008000] border-2 border-black text-white font-black text-xs shadow-[3px_3px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 uppercase">
                  <Share2 size={14} /> SHARE
                </button>
                <button className="px-4 bg-[#500050] hover:bg-[#700070] border-2 border-black text-white shadow-[3px_3px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all">
                  <Activity size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- STATUS BAR (Bottom Page Tear) --- */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-black flex items-center justify-between px-4 z-20 border-t-4 border-[#E07000]">
        <div className="flex items-center gap-4 text-[10px] font-bold text-[#E07000] font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#00ff00] rounded-none animate-pulse"></div>
            <span>SIMULATION_ONLINE</span>
          </div>
          <div className="flex items-center gap-2 border-l border-[#E07000] pl-4">
            <Filter size={12} />
            <span>ZOOM: {zoomLevel.toFixed(2)}x</span>
          </div>
        </div>
        <div className="text-[10px] text-gray-500 uppercase">SEGA GENESIS VDP EMULATION</div>
      </div>
    </div>
  );
};
