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
} from "lucide-react";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: "tech" | "lit" | "theory" | "core";
  value: number;
}

// Fixed: Explicitly add source and target to the Link interface to avoid "property does not exist" errors
interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  strength: number;
}

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
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d) => (d as Node).value + 20)
      );

    // --- Draw Links ---
    const link = g
      .append("g")
      .attr("stroke", "#1e293b")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(initialData.links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.strength) * 3)
      .attr("class", "transition-all duration-300");

    // --- Draw Nodes ---
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

    // Node Glow Effect
    node
      .append("circle")
      .attr("r", (d) => d.value)
      .attr("fill", (d) => {
        if (d.group === "core") return "#39ff14";
        if (d.group === "tech") return "#00ffff";
        if (d.group === "lit") return "#ff00ff";
        return "#eab308";
      })
      .attr("filter", "url(#glow)")
      .attr("class", "transition-transform group-hover:scale-110 duration-300 shadow-xl");

    // Node Labels
    node
      .append("text")
      .text((d) => d.id)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.value + 15)
      .attr("fill", "#94a3b8")
      .attr("font-size", "12px")
      .attr("font-family", "Vazirmatn")
      .attr("class", " group-hover:fill-white font-bold transition-colors");

    // --- Definition of Effects ---
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // --- Highlight Logic ---
    function highlightConnections(d: Node) {
      const neighbors = new Set();
      initialData.links.forEach((l) => {
        // Fixed: source and target might be strings or Node objects, cast to any to access id
        if ((l.source as any).id === d.id) neighbors.add((l.target as any).id);
        if ((l.target as any).id === d.id) neighbors.add((l.source as any).id);
      });

      node.style("opacity", (n) => (n.id === d.id || neighbors.has(n.id) ? 1 : 0.2));
      link
        .style("stroke", (l) =>
          (l.source as any).id === d.id || (l.target as any).id === d.id ? "#39ff14" : "#1e293b"
        )
        .style("stroke-opacity", (l) =>
          (l.source as any).id === d.id || (l.target as any).id === d.id ? 1 : 0.1
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
    <div className="h-full flex flex-col relative bg-[#050505] overflow-hidden group">
      {/* HUD / Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start ">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-md border border-teal-500/30 p-4 rounded-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400">
                <Network size={20} />
              </div>
              <div>
                <h2 className="text-teal-400 font-display text-xl">خوشه‌بندی عصبی</h2>
                <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                  Semantic_Topology_v8.4
                </p>
              </div>
            </div>

            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                placeholder="جستجو در شبکه..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-white outline-none focus:border-teal-500 transition-all font-sans"
                dir="rtl"
              />
            </div>

            <div className="flex gap-2 text-[10px] font-mono text-gray-400">
              <div className="flex items-center gap-1">
                <Layers size={12} /> NODES: {initialData.nodes.length}
              </div>
              <div className="flex items-center gap-1 border-r border-white/10 pl-2 ml-2">
                <Zap size={12} /> LINKS: {initialData.links.length}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pointer-events-auto items-end">
          <div className="bg-black/80 backdrop-blur-md border border-white/10 p-2 rounded-lg flex flex-col gap-2">
            <button className="p-2 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <Maximize2 size={16} />
            </button>
            <button className="p-2 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <ZoomIn size={16} />
            </button>
            <button className="p-2 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <ZoomOut size={16} />
            </button>
          </div>

          <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-lg text-right">
            <p className="text-[9px] font-mono text-gray-500 uppercase mb-2">Legend</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-end gap-2 text-[10px]">
                <span className="text-gray-400">هسته اصلی</span>
                <div className="w-2 h-2 rounded-full bg-[#39ff14]"></div>
              </div>
              <div className="flex items-center justify-end gap-2 text-[10px]">
                <span className="text-gray-400">تکنولوژی</span>
                <div className="w-2 h-2 rounded-full bg-[#00ffff]"></div>
              </div>
              <div className="flex items-center justify-end gap-2 text-[10px]">
                <span className="text-gray-400">ادبیات</span>
                <div className="w-2 h-2 rounded-full bg-[#ff00ff]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div ref={containerRef} className="w-full h-full relative z-0 cursor-grab active:cursor-grabbing">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Analysis Panel (Slide-in) */}
      {selectedNode && (
        <div className="absolute right-4 bottom-4 w-72 bg-black/90 border border-teal-500/30 rounded-xl p-6 backdrop-blur-xl shadow-2xl animate-in slide-in-from-right duration-500 z-30 pointer-events-auto">
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute top-4 left-4 text-gray-500 hover:text-white transition-colors"
          >
            <Maximize2 size={14} className="rotate-45" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
              <Info size={24} />
            </div>
            <div>
              <h3 className="text-white font-display text-lg">{selectedNode.id}</h3>
              <p className="text-[10px] font-mono text-teal-500 uppercase">{selectedNode.group}_NODE</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-1 uppercase">
                <span>Semantic_Weight</span>
                <span>{selectedNode.value}</span>
              </div>
              <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500"
                  style={{ width: `${(selectedNode.value / 40) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-[10px] font-mono text-gray-500 uppercase mb-2">Linked_Concepts</p>
              <div className="flex flex-wrap gap-2">
                {initialData.links
                  .filter(
                    (l) =>
                      (l.source as any).id === selectedNode.id || (l.target as any).id === selectedNode.id
                  )
                  .map((l, i) => {
                    const neighbor =
                      (l.source as any).id === selectedNode.id ? (l.target as any).id : (l.source as any).id;
                    return (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-[9px] text-teal-400 rounded"
                      >
                        {neighbor}
                      </span>
                    );
                  })}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] rounded transition-all flex items-center justify-center gap-2">
                <Share2 size={12} /> اشتراک تحلیل
              </button>
              <button className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded border border-white/10">
                <Activity size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scanline / Grid Overlays */}
      <div className="absolute inset-0  opacity-[0.03] bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Bottom Status Bar */}
      <div className="absolute bottom-4 left-6  flex items-center gap-4 text-[10px] font-mono text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span>SIMULATION_ACTIVE</span>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={12} />
          <span>ZOOM: {zoomLevel.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
};
