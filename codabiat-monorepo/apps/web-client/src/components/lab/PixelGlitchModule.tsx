import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Image as ImageIcon,
  Type,
  Download,
  Upload,
  RefreshCw,
  Layers,
  Monitor,
  Sliders,
  Eye,
  Zap,
  Skull,
  Hand,
  Save,
} from "lucide-react";
import SaveArtworkDialog from "./SaveArtworkDialog";

interface GlitchSettings {
  rgbShift: number; // 0 to 50
  fragmentation: number; // 0 to 100 (Slicing intensity)
  scanlines: number; // 0 to 1 (Opacity)
  noise: number; // 0 to 100
  textOverlay: boolean;
  textValue: string;
  blendMode: GlobalCompositeOperation;
}

export const PixelGlitchModule: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [status, setStatus] = useState("READY PLAYER ONE...");
  const [isDragging, setIsDragging] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<GlitchSettings>({
    rgbShift: 0,
    fragmentation: 0,
    scanlines: 0.1,
    noise: 0,
    textOverlay: false,
    textValue: "تصویر یک واژه است",
    blendMode: "difference",
  });

  // Load Image
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.onload = () => {
        setImg(image);
        setStatus("TARGET ACQUIRED!");
      };
      image.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop Handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Render Loop
  const render = useCallback(() => {
    if (!img || !canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Fit Logic
    const containerW = containerRef.current.clientWidth;
    const containerH = containerRef.current.clientHeight;
    const scale = Math.min((containerW - 40) / img.width, (containerH - 40) / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // --- LAYER 1: Base Image (With RGB Shift) ---
    if (settings.rgbShift > 0) {
      // Draw Red
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = "red";
      ctx.globalAlpha = 1;
      ctx.translate(-settings.rgbShift, 0);
      ctx.drawImage(img, 0, 0, w, h);
      // Draw Blue
      ctx.translate(settings.rgbShift * 2, 0);
      ctx.fillStyle = "blue";
      ctx.drawImage(img, 0, 0, w, h);
      // Draw Green (Center)
      ctx.translate(-settings.rgbShift, 0); // Back to center
      ctx.globalCompositeOperation = "multiply"; // Mix back
      ctx.drawImage(img, 0, 0, w, h);
      ctx.restore();

      // Fallback for simple composite if shift is minimal
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.5;
      ctx.drawImage(img, 0, 0, w, h);
      ctx.globalAlpha = 1;
    } else {
      ctx.drawImage(img, 0, 0, w, h);
    }

    // --- LAYER 2: Fragmentation (Slicing) ---
    if (settings.fragmentation > 0) {
      const slices = Math.floor(settings.fragmentation / 2); // Max 50 slices
      for (let i = 0; i < slices; i++) {
        const sliceH = Math.random() * (h / 10) + 2;
        const sliceY = Math.random() * h;
        const offsetX = (Math.random() - 0.5) * (settings.fragmentation * 2);

        ctx.drawImage(
          canvas,
          0,
          sliceY,
          w,
          sliceH, // Source
          offsetX,
          sliceY,
          w,
          sliceH // Dest
        );
      }
    }

    // --- LAYER 3: Noise ---
    if (settings.noise > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = settings.noise / 200; // Max 0.5 opacity
      const noiseCanvas = document.createElement("canvas");
      noiseCanvas.width = 100;
      noiseCanvas.height = 100;
      const nCtx = noiseCanvas.getContext("2d");
      if (nCtx) {
        const imgData = nCtx.createImageData(100, 100);
        for (let i = 0; i < imgData.data.length; i += 4) {
          const val = Math.random() * 255;
          imgData.data[i] = val; // R
          imgData.data[i + 1] = val; // G
          imgData.data[i + 2] = val; // B
          imgData.data[i + 3] = 255;
        }
        nCtx.putImageData(imgData, 0, 0);
        const ptrn = ctx.createPattern(noiseCanvas, "repeat");
        if (ptrn) {
          ctx.fillStyle = ptrn;
          ctx.fillRect(0, 0, w, h);
        }
      }
      ctx.restore();
    }

    // --- LAYER 4: Scanlines ---
    if (settings.scanlines > 0) {
      ctx.save();
      ctx.fillStyle = "#000";
      ctx.globalAlpha = settings.scanlines;
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 2);
      }
      ctx.restore();
    }

    // --- LAYER 5: Text Injection ---
    if (settings.textOverlay) {
      ctx.save();
      ctx.globalCompositeOperation = settings.blendMode;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `bold ${w / 15}px "Courier New", monospace`;
      ctx.fillStyle = "#ffffff";

      // Main Center Text
      ctx.fillText(settings.textValue, w / 2, h / 2);

      // Scattered Characters
      ctx.font = `${w / 30}px "Courier New", monospace`;
      ctx.globalAlpha = 0.6;
      const seed = 5;
      for (let i = 0; i < seed; i++) {
        const x = (Math.sin(i) * 0.5 + 0.5) * w;
        const y = (Math.cos(i) * 0.5 + 0.5) * h;
        ctx.fillText("ERR_MORTUS_" + i, x, y);
      }
      ctx.restore();
    }
  }, [img, settings]);

  // Re-render when settings or image changes
  useEffect(() => {
    render();
  }, [render]);

  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `mutant_art_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    setStatus("PAGE SAVED TO ARCHIVE!");
  };

  const resetSettings = () => {
    setSettings({
      rgbShift: 0,
      fragmentation: 0,
      scanlines: 0.1,
      noise: 0,
      textOverlay: false,
      textValue: "خالی",
      blendMode: "difference",
    });
    setStatus("CANVAS WIPED CLEAN");
  };

  return (
    // THE VOID BACKGROUND
    <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden bg-[#1a1a1a] font-mono relative">
      {/* Background Texture (Artist Desk) */}
      <div className="absolute inset-0 opacity-10  bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-700 via-black to-black"></div>

      {/* HEADER: INVENTORY SLOTS */}
      <div className="flex justify-between items-end mb-6 shrink-0 z-10">
        {/* Left: Title Card */}
        <div className="flex items-center gap-4">
          <div className="bg-[#FFCC00] border-4 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-black font-black text-xl tracking-tighter uppercase italic">MORTUS ENGINE</h2>
          </div>
          <div className="hidden md:block bg-black text-[#E07000] px-3 py-1 text-xs border-2 border-[#E07000]">
            EPISODE 1: THE GLITCH
          </div>
        </div>

        {/* Right: Inventory Slots (Actions) */}
        <div className="flex gap-3 items-center">
          {/* Status Box (Narrator) */}
          <div className="hidden lg:block bg-[#FFCC00] border-2 border-black px-4 py-2 text-xs font-bold text-black uppercase tracking-widest mr-4">
            {status}
          </div>

          {/* Slot 1: Reset (Dynamite) */}
          <button
            onClick={resetSettings}
            className="group relative w-12 h-12 bg-[#500050] border-4 border-black flex items-center justify-center hover:bg-red-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
            title="RESET CANVAS"
          >
            <RefreshCw size={20} className="text-white group-hover:animate-spin" />
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[8px] px-1 border border-black font-bold">
              RST
            </div>
          </button>

          {/* Slot 2: Download (Fist/Power) */}
          <button
            onClick={downloadImage}
            disabled={!img}
            className="group relative w-12 h-12 bg-[#E07000] border-4 border-black flex items-center justify-center hover:bg-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            title="SAVE PAGE"
          >
            <Download size={20} className="text-black group-hover:scale-110 transition-transform" />
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[8px] px-1 border border-black font-bold">
              SAV
            </div>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-grow overflow-hidden z-10">
        {/* LEFT PANEL: TOOLS (Comic Panel Style) */}
        <div className="w-full lg:w-80 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 shrink-0 pb-10">
          {/* Upload Section */}
          <div className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] relative">
            <div className="absolute -top-3 left-4 bg-black text-white px-2 text-xs font-bold uppercase">
              PANEL 1: SOURCE
            </div>
            <label className="flex flex-col gap-2 cursor-pointer group">
              <div className="bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] bg-[#f0f0f0] border-2 border-dashed border-black p-6 flex flex-col items-center justify-center text-black transition-colors group-hover:bg-[#FFCC00]">
                <Upload size={32} className="mb-2 text-black" />
                <span className="text-xs font-black uppercase">DROP INK HERE</span>
              </div>
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
          </div>

          {/* Sliders Section */}
          <div className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] relative space-y-6">
            <div className="absolute -top-3 left-4 bg-black text-white px-2 text-xs font-bold uppercase">
              PANEL 2: DISTORTION
            </div>

            {/* RGB Shift */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-black uppercase">
                <span className="flex items-center gap-1">
                  <Zap size={12} /> COLOR SHIFT
                </span>
                <span className="bg-black text-white px-1">{settings.rgbShift}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={settings.rgbShift}
                onChange={(e) => setSettings({ ...settings, rgbShift: Number(e.target.value) })}
                className="w-full h-4 bg-gray-300 border-2 border-black appearance-none cursor-pointer accent-[#E07000] hover:accent-[#FFCC00]"
              />
            </div>

            {/* Fragmentation */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-black uppercase">
                <span className="flex items-center gap-1">
                  <Layers size={12} /> TEAR PAPER
                </span>
                <span className="bg-black text-white px-1">{settings.fragmentation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.fragmentation}
                onChange={(e) => setSettings({ ...settings, fragmentation: Number(e.target.value) })}
                className="w-full h-4 bg-gray-300 border-2 border-black appearance-none cursor-pointer accent-[#E07000] hover:accent-[#FFCC00]"
              />
            </div>

            {/* Noise */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-black uppercase">
                <span className="flex items-center gap-1">
                  <Skull size={12} /> GRIT
                </span>
                <span className="bg-black text-white px-1">{settings.noise}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.noise}
                onChange={(e) => setSettings({ ...settings, noise: Number(e.target.value) })}
                className="w-full h-4 bg-gray-300 border-2 border-black appearance-none cursor-pointer accent-[#E07000] hover:accent-[#FFCC00]"
              />
            </div>

            {/* Scanlines */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-black uppercase">
                <span className="flex items-center gap-1">
                  <Monitor size={12} /> VDP LINES
                </span>
                <span className="bg-black text-white px-1">{(settings.scanlines * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.scanlines}
                onChange={(e) => setSettings({ ...settings, scanlines: Number(e.target.value) })}
                className="w-full h-4 bg-gray-300 border-2 border-black appearance-none cursor-pointer accent-[#E07000] hover:accent-[#FFCC00]"
              />
            </div>
          </div>

          {/* Text Injection Section */}
          <div className="bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] relative">
            <div className="absolute -top-3 left-4 bg-black text-white px-2 text-xs font-bold uppercase">
              PANEL 3: DIALOGUE
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-black font-bold text-xs flex items-center gap-2 uppercase">
                <Type size={14} /> SPEECH BUBBLE
              </h3>
              <button
                onClick={() => setSettings({ ...settings, textOverlay: !settings.textOverlay })}
                className={`w-10 h-5 border-2 border-black relative transition-colors ${
                  settings.textOverlay ? "bg-[#E07000]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 bg-black transition-all ${
                    settings.textOverlay ? "left-1" : "right-1"
                  }`}
                ></div>
              </button>
            </div>

            {settings.textOverlay && (
              <div className="space-y-3">
                {/* Speech Bubble Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={settings.textValue}
                    onChange={(e) => setSettings({ ...settings, textValue: e.target.value })}
                    className="w-full bg-white border-2 border-black rounded-[50%] px-4 py-3 text-xs text-black font-bold text-center outline-none focus:bg-[#FFCC00] transition-colors"
                    dir="rtl"
                    placeholder="متن..."
                  />
                  {/* Bubble Tail */}
                  <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-r-2 border-b-2 border-black rotate-45 z-0"></div>
                </div>

                <div className="flex gap-2 text-[10px] font-bold uppercase pt-2">
                  <button
                    onClick={() => setSettings({ ...settings, blendMode: "difference" })}
                    className={`px-2 py-1 border-2 border-black ${
                      settings.blendMode === "difference"
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                  >
                    DIFF
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, blendMode: "overlay" })}
                    className={`px-2 py-1 border-2 border-black ${
                      settings.blendMode === "overlay"
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                  >
                    OVER
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Save Artwork Button */}
          <button
            onClick={() => setShowSaveDialog(true)}
            disabled={!img}
            className={`w-full py-3 font-black text-sm uppercase border-4 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2 transition-all
                        ${
                          img
                            ? "bg-[#006000] text-white hover:bg-[#007000] active:translate-y-1 active:shadow-none"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                        }
                    `}
          >
            <Save size={20} />
            SAVE ARTWORK
          </button>
        </div>

        {/* RIGHT PANEL: CANVAS (The Main Page) */}
        <div
          ref={containerRef}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex-grow relative flex items-center justify-center transition-all duration-200
                        ${isDragging ? "bg-[#E07000]" : "bg-[#2a2a2a]"}
                    `}
        >
          {/* The White Page Container */}
          <div className="relative p-1 bg-white border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,0.8)] rotate-1 max-w-full max-h-full overflow-hidden">
            {/* Gutter / Safe Zone */}
            <div className="border-2 border-black m-1 relative bg-white min-w-[300px] min-h-[300px] flex items-center justify-center overflow-hidden">
              {!img ? (
                <div className="text-center text-black z-10 p-10">
                  <div className="w-24 h-24 border-4 border-black flex items-center justify-center mx-auto mb-4 bg-[#FFCC00] animate-bounce">
                    <Hand size={40} />
                  </div>
                  <p className="font-black text-lg mb-1 uppercase tracking-widest">NO SIGNAL</p>
                  <p className="text-xs font-bold bg-black text-white inline-block px-2 py-1">
                    INSERT CARTRIDGE (IMAGE)
                  </p>
                </div>
              ) : (
                <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
              )}

              {/* Overlay HUD Elements (Comic Style) */}
              <div className="absolute top-0 left-0 z-20">
                <div className="bg-[#FFCC00] border-r-2 border-b-2 border-black px-2 py-1 text-[10px] font-black text-black">
                  RES: {canvasRef.current ? `${canvasRef.current.width}x${canvasRef.current.height}` : "0x0"}
                </div>
              </div>

              {/* "POW" Effect on corner */}
              <div className="absolute bottom-2 right-2 z-20 ">
                <div className="text-[10px] font-black text-white bg-red-600 px-2 py-1 border-2 border-black -rotate-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  LIVE FEED
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Artwork Dialog */}
      <SaveArtworkDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        labModule="pixel-glitch"
        labCategory="visual"
        content={{
          text: settings.textOverlay ? settings.textValue : "",
          html: settings.textOverlay
            ? `<div style="font-family: monospace; padding: 20px; direction: rtl;">${settings.textValue}</div>`
            : "",
          data: {
            settings,
            hasImage: !!img,
          },
        }}
        screenshot={canvasRef.current?.toDataURL("image/png")}
      />
    </div>
  );
};
