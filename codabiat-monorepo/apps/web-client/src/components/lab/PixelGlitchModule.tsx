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
} from "lucide-react";

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
  const [status, setStatus] = useState("SYSTEM_IDLE // WAITING_FOR_INPUT");
  const [isDragging, setIsDragging] = useState(false);

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
        setStatus("IMAGE_BUFFERED // READY_FOR_DISTORTION");
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

      // Fallback for simple composite if shift is minimal, just draw normal to keep clarity
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

        // Copy a slice from the canvas itself (destructive editing simulation)
        // Note: Getting ImageData is slow, using drawImage with params is faster
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
      // Create noise pattern roughly
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
      ctx.font = `bold ${w / 15}px "Vazirmatn"`;
      ctx.fillStyle = "#ffffff";

      // Main Center Text
      ctx.fillText(settings.textValue, w / 2, h / 2);

      // Scattered Characters
      ctx.font = `${w / 30}px "Fira Code"`;
      ctx.globalAlpha = 0.6;
      const seed = 5; // Fixed seed simulation
      for (let i = 0; i < seed; i++) {
        const x = (Math.sin(i) * 0.5 + 0.5) * w;
        const y = (Math.cos(i) * 0.5 + 0.5) * h;
        ctx.fillText("ERR_NVRAM_" + i, x, y);
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
    link.download = `distorted_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    setStatus("EXPORT_COMPLETE // FILE_SAVED");
  };

  return (
    <div className="h-full flex flex-col p-2 md:p-6 overflow-hidden">
      {/* Header Status Bar */}
      <div className="flex justify-between items-center border-b border-fuchsia-500/20 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-fuchsia-500/10 rounded-lg text-fuchsia-400">
            <ImageIcon size={24} />
          </div>
          <div>
            <h2 className="text-fuchsia-400 font-display text-2xl">موتور اعوجاج</h2>
            <p className="text-[10px] font-mono text-gray-500">DISTORTION_ENGINE // V.2.0</p>
          </div>
        </div>
        <div className="hidden md:flex gap-4 font-mono text-xs text-fuchsia-500/70 bg-fuchsia-900/10 px-4 py-2 rounded border border-fuchsia-500/10">
          <span>STATUS: {status}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden">
        {/* Left Panel: Controls */}
        <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 shrink-0">
          {/* Upload Section */}
          <div className="bg-panel-black border border-white/10 p-4 rounded-xl">
            <label className="flex flex-col gap-2 cursor-pointer group">
              <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 transition-colors group-hover:border-fuchsia-500/50 group-hover:text-fuchsia-400">
                <Upload size={24} className="mb-2" />
                <span className="text-xs font-mono">UPLOAD_SOURCE</span>
              </div>
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
          </div>

          {/* Sliders Section */}
          <div className="bg-panel-black border border-white/10 p-4 rounded-xl space-y-6">
            <h3 className="text-gray-300 font-bold text-sm flex items-center gap-2 border-b border-white/10 pb-2">
              <Sliders size={14} /> پارامترهای تخریب
            </h3>

            {/* RGB Shift */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-fuchsia-300">
                <span>CHROMATIC_SHIFT</span>
                <span>{settings.rgbShift}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={settings.rgbShift}
                onChange={(e) => setSettings({ ...settings, rgbShift: Number(e.target.value) })}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
              />
            </div>

            {/* Fragmentation */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-neon-blue">
                <span>DATA_FRAGMENTATION</span>
                <span>{settings.fragmentation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.fragmentation}
                onChange={(e) => setSettings({ ...settings, fragmentation: Number(e.target.value) })}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neon-blue"
              />
            </div>

            {/* Noise */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-gray-400">
                <span>SIGNAL_NOISE</span>
                <span>{settings.noise}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.noise}
                onChange={(e) => setSettings({ ...settings, noise: Number(e.target.value) })}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500"
              />
            </div>

            {/* Scanlines */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-gray-400">
                <span>CRT_SCANLINES</span>
                <span>{(settings.scanlines * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.scanlines}
                onChange={(e) => setSettings({ ...settings, scanlines: Number(e.target.value) })}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500"
              />
            </div>
          </div>

          {/* Text Injection Section */}
          <div className="bg-panel-black border border-white/10 p-4 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-gray-300 font-bold text-sm flex items-center gap-2">
                <Type size={14} /> تزریق متن
              </h3>
              <button
                onClick={() => setSettings({ ...settings, textOverlay: !settings.textOverlay })}
                className={`w-8 h-4 rounded-full relative transition-colors ${
                  settings.textOverlay ? "bg-fuchsia-600" : "bg-gray-700"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                    settings.textOverlay ? "left-1" : "right-1"
                  }`}
                ></div>
              </button>
            </div>

            {settings.textOverlay && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                <input
                  type="text"
                  value={settings.textValue}
                  onChange={(e) => setSettings({ ...settings, textValue: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded px-2 py-2 text-xs text-white outline-none focus:border-fuchsia-500"
                  dir="rtl"
                  placeholder="متن خود را بنویسید..."
                />
                <div className="flex gap-2 text-[10px] font-mono text-gray-500">
                  <button
                    onClick={() => setSettings({ ...settings, blendMode: "difference" })}
                    className={`px-2 py-1 rounded border ${
                      settings.blendMode === "difference"
                        ? "border-fuchsia-500 text-fuchsia-400"
                        : "border-white/10"
                    }`}
                  >
                    DIFFERENCE
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, blendMode: "overlay" })}
                    className={`px-2 py-1 rounded border ${
                      settings.blendMode === "overlay"
                        ? "border-fuchsia-500 text-fuchsia-400"
                        : "border-white/10"
                    }`}
                  >
                    OVERLAY
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSettings({
                  rgbShift: 0,
                  fragmentation: 0,
                  scanlines: 0.1,
                  noise: 0,
                  textOverlay: false,
                  textValue: "خالی",
                  blendMode: "difference",
                });
                setStatus("SETTINGS_RESET");
              }}
              className="p-3 rounded-lg bg-red-900/20 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              title="Reset"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={downloadImage}
              disabled={!img}
              className="flex-grow py-3 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} /> دریافت خروجی
            </button>
          </div>
        </div>

        {/* Right Panel: Canvas Viewport */}
        <div
          ref={containerRef}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex-grow bg-[#050505] border-2 rounded-xl relative overflow-hidden flex items-center justify-center transition-colors
                        ${isDragging ? "border-fuchsia-500 bg-fuchsia-900/10" : "border-white/10"}
                    `}
        >
          {/* Background Grid */}
          <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] "></div>

          {!img ? (
            <div className="text-center text-gray-600 z-10 ">
              <div className="w-20 h-20 border-2 border-dashed border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Monitor size={32} />
              </div>
              <p className="font-mono text-sm mb-1">NO_SOURCE_DETECTED</p>
              <p className="text-xs opacity-50">DRAG & DROP IMAGE HERE</p>
            </div>
          ) : (
            <canvas ref={canvasRef} className="max-w-full max-h-full shadow-2xl z-10" />
          )}

          {/* Overlay HUD Elements */}
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <div className="bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-fuchsia-500 border border-fuchsia-500/30">
              RES: {canvasRef.current ? `${canvasRef.current.width}x${canvasRef.current.height}` : "0x0"}
            </div>
          </div>
          <div className="absolute bottom-4 right-4 z-20">
            <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500 bg-black/50 px-2 rounded">
              <Eye size={10} /> PREVIEW_MODE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
