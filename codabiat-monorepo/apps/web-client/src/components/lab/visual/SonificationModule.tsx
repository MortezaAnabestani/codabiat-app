import React, { useState, useRef, useEffect } from "react";
import {
  Music,
  Activity,
  Zap,
  Play,
  Square,
  Sliders,
  Download,
  Hand,
  Skull,
  Bomb,
  Radio,
  Waves,
  Repeat,
} from "lucide-react";

interface SynthSettings {
  waveType: OscillatorType;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  filterFreq: number;
  filterRes: number;
  delayTime: number;
  delayFeedback: number;
}

export const SonificationModule: React.FC = () => {
  const [text, setText] = useState("نوسانِ کلمات در خلأ");
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<SynthSettings>({
    waveType: "sine",
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.8,
    filterFreq: 2000,
    filterRes: 1,
    delayTime: 0.3,
    delayFeedback: 0.4,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);
  const isActiveRef = useRef(false);

  // --- Audio System Core (UNCHANGED LOGIC) ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyzerRef.current = audioCtxRef.current.createAnalyser();
      analyzerRef.current.fftSize = 2048;
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const playNeuralSynth = async () => {
    initAudio();
    const ctx = audioCtxRef.current!;
    const analyzer = analyzerRef.current!;

    setIsPlaying(true);
    isActiveRef.current = true;

    const chars = text.split("");
    let startTime = ctx.currentTime;

    const masterOut = ctx.createGain();
    masterOut.gain.value = 0.5;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = settings.filterFreq;
    filter.Q.value = settings.filterRes;

    const delay = ctx.createDelay();
    delay.delayTime.value = settings.delayTime;
    const feedback = ctx.createGain();
    feedback.gain.value = settings.delayFeedback;

    delay.connect(feedback);
    feedback.connect(delay);

    masterOut.connect(filter);
    filter.connect(ctx.destination);
    filter.connect(analyzer);

    filter.connect(delay);
    delay.connect(ctx.destination);

    for (let i = 0; i < chars.length; i++) {
      if (!isActiveRef.current) break;

      const charCode = chars[i].charCodeAt(0);
      const freq = 100 + (charCode % 800);
      const duration = 0.4;
      const timeSlot = startTime + i * 0.25;

      const osc = ctx.createOscillator();
      const env = ctx.createGain();

      osc.type = settings.waveType;
      osc.frequency.setValueAtTime(freq, timeSlot);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, timeSlot + duration);

      env.gain.setValueAtTime(0, timeSlot);
      env.gain.linearRampToValueAtTime(1, timeSlot + settings.attack);
      env.gain.linearRampToValueAtTime(settings.sustain, timeSlot + settings.attack + settings.decay);
      env.gain.setValueAtTime(settings.sustain, timeSlot + duration);
      env.gain.exponentialRampToValueAtTime(0.001, timeSlot + duration + settings.release);

      osc.connect(env);
      env.connect(masterOut);

      osc.start(timeSlot);
      osc.stop(timeSlot + duration + settings.release);
    }

    setTimeout(() => {
      if (isActiveRef.current) setIsPlaying(false);
    }, chars.length * 250 + 1000);
  };

  const stopAudio = () => {
    isActiveRef.current = false;
    setIsPlaying(false);
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  // --- Visualizer Loop (STYLED FOR COMIX ZONE) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      const w = canvas.width;
      const h = canvas.height;

      // Background: Dark "Ink" fill
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, w, h);

      // Grid Lines (Comic Halftone effect simulation)
      ctx.strokeStyle = "rgba(80, 0, 80, 0.3)"; // Bruised Purple lines
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < w; i += 40) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
      }
      for (let j = 0; j < h; j += 40) {
        ctx.moveTo(0, j);
        ctx.lineTo(w, j);
      }
      ctx.stroke();

      if (!analyzerRef.current || !isPlaying) {
        // Idle Line: Flatline style
        ctx.beginPath();
        ctx.strokeStyle = "#555";
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        return;
      }

      const bufferLength = analyzerRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzerRef.current.getByteTimeDomainData(dataArray);

      // Waveform Style: "Mutant Orange" Energy
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#E07000"; // Primary Brand Color
      ctx.shadowBlur = 0; // No soft glow, hard edges for comic style

      // Add a second outline for "Ink" effect
      ctx.beginPath();
      const sliceWidth = w / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * h) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(w, h / 2);
      ctx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  return (
    // [1. VISUAL FIDELITY] The "Void" Background (Artist's Desk)
    <div className="h-full flex flex-col p-4 md:p-8 overflow-hidden bg-[#222] relative font-mono">
      {/* Texture Overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(#555 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      ></div>

      {/* [4. UI MAPPING] Header / Inventory Slots */}
      <div className="flex justify-between items-end mb-6 shrink-0 z-10">
        {/* Narrator Box */}
        <div className="bg-[#FFCC00] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 transform -rotate-1">
          <h2 className="text-black font-black text-2xl uppercase tracking-tighter flex items-center gap-2">
            <Music size={24} className="text-black" />
            EPISODE 1: SONIFICATION
          </h2>
          <p className="text-xs font-bold text-black/80 uppercase">SEGA_GENESIS_VDP // AUDIO_ENGINE</p>
        </div>

        {/* Inventory System (Controls) */}
        <div className="flex gap-2 items-end">
          {/* Slot 1: Status */}
          <div className="hidden md:flex flex-col items-center">
            <div className="bg-black text-[#E07000] text-[10px] px-2 py-1 mb-1 font-bold border border-[#E07000]">
              STATUS
            </div>
            <div
              className={`w-12 h-12 border-4 border-black bg-gray-800 flex items-center justify-center ${
                isPlaying ? "animate-pulse bg-[#500050]" : ""
              }`}
            >
              <Radio size={24} className={isPlaying ? "text-[#E07000]" : "text-gray-500"} />
            </div>
          </div>

          {/* Slot 2: Action (Play/Stop) */}
          <div
            className="flex flex-col items-center group cursor-pointer"
            onClick={isPlaying ? stopAudio : playNeuralSynth}
          >
            <div className="bg-black text-white text-[10px] px-2 py-1 mb-1 font-bold group-hover:text-[#FFCC00] transition-colors">
              ACTION
            </div>
            <div className="w-16 h-16 border-4 border-black bg-[#E07000] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center active:translate-y-1 active:shadow-none transition-all">
              {isPlaying ? (
                <Bomb size={32} className="text-black animate-bounce" />
              ) : (
                <Hand size={32} className="text-black" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Comic Page Layout */}
      <div className="flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden z-10">
        {/* [PANEL 1] Left: Controls & Input */}
        <div className="w-full lg:w-96 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 shrink-0">
          {/* Speech Bubble Input */}
          <div className="relative">
            <div className="bg-white border-4 border-black rounded-[2rem] rounded-br-none p-6 shadow-[8px_8px_0px_0px_rgba(80,0,80,1)]">
              <label className="text-xs font-black text-black mb-2 block uppercase bg-[#FFCC00] inline-block px-2 border-2 border-black transform -rotate-2">
                DIALOGUE INPUT
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-transparent text-black font-bold text-lg outline-none resize-none h-24 placeholder-gray-400"
                placeholder="متن را وارد کنید..."
                dir="rtl"
                style={{ fontFamily: "monospace" }}
              />
              <div className="flex justify-between items-center mt-2 border-t-2 border-dashed border-gray-300 pt-2">
                <span className="text-[10px] font-black text-gray-500">CHARS: {text.length}</span>
                <button
                  onClick={() => setText("")}
                  className="text-xs font-bold text-red-600 hover:underline uppercase"
                >
                  ERASE
                </button>
              </div>
            </div>
            {/* Bubble Tail */}
            <div className="absolute -bottom-4 right-8 w-8 h-8 bg-white border-r-4 border-b-4 border-black transform rotate-45"></div>
          </div>

          {/* Control Panel Box */}
          <div className="bg-[#006000] border-4 border-black p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="bg-[#111] border-2 border-black p-4 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-[#006000] pb-2">
                <h3 className="text-[#E07000] font-black text-sm flex items-center gap-2 uppercase">
                  <Sliders size={16} /> SYNTH_PARAMS
                </h3>
                <div className="flex gap-1">
                  {(["sine", "square", "sawtooth"] as OscillatorType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSettings({ ...settings, waveType: type })}
                      className={`w-8 h-8 flex items-center justify-center border-2 transition-all ${
                        settings.waveType === type
                          ? "bg-[#E07000] border-black text-black"
                          : "bg-[#222] border-gray-600 text-gray-500 hover:border-white"
                      }`}
                      title={type}
                    >
                      <Waves size={14} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Retro Sliders */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  {
                    label: "Attack",
                    val: settings.attack,
                    set: (v: number) => setSettings({ ...settings, attack: v }),
                    min: 0.01,
                    max: 1,
                    step: 0.01,
                  },
                  {
                    label: "Release",
                    val: settings.release,
                    set: (v: number) => setSettings({ ...settings, release: v }),
                    min: 0.01,
                    max: 2,
                    step: 0.1,
                  },
                ].map((ctrl) => (
                  <div key={ctrl.label} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-[#00FF00] uppercase">
                      <span>{ctrl.label}</span>
                      <span className="bg-[#006000] px-1 text-white">{ctrl.val}s</span>
                    </div>
                    <input
                      type="range"
                      min={ctrl.min}
                      max={ctrl.max}
                      step={ctrl.step}
                      value={ctrl.val}
                      onChange={(e) => ctrl.set(Number(e.target.value))}
                      className="w-full h-4 appearance-none bg-[#333] border-2 border-black rounded-none slider-thumb-retro"
                      style={{ accentColor: "#E07000" }}
                    />
                  </div>
                ))}
              </div>

              {/* Filter Knobs Simulation */}
              <div className="space-y-4 pt-2 border-t-2 border-[#006000] border-dashed">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-[#E07000] uppercase">
                    <span>Low-Pass Filter</span>
                    <span>{settings.filterFreq}Hz</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="10000"
                    step="100"
                    value={settings.filterFreq}
                    onChange={(e) => setSettings({ ...settings, filterFreq: Number(e.target.value) })}
                    className="w-full h-4 appearance-none bg-[#333] border-2 border-black"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-[#E07000] uppercase">
                    <span>Feedback Delay</span>
                    <span>{Math.floor(settings.delayFeedback * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.8"
                    step="0.05"
                    value={settings.delayFeedback}
                    onChange={(e) => setSettings({ ...settings, delayFeedback: Number(e.target.value) })}
                    className="w-full h-4 appearance-none bg-[#333] border-2 border-black"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* [PANEL 2] Right: Visualization (The Main Frame) */}
        <div className="flex-grow flex flex-col gap-4 overflow-hidden">
          {/* Main Oscilloscope Frame */}
          <div className="flex-grow bg-black border-4 border-black relative overflow-hidden flex items-center justify-center shadow-[8px_8px_0px_0px_#500050]">
            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#E07000] z-20"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#E07000] z-20"></div>

            <canvas ref={canvasRef} width={800} height={400} className="w-full h-full relative z-10" />

            {/* Onomatopoeia Effect (Behind content) */}
            {isPlaying && (
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[100px] font-black text-white opacity-10 pointer-events-none select-none rotate-12 z-0"
                style={{ textShadow: "4px 4px 0 #000" }}
              >
                ZAP!
              </div>
            )}

            {/* Top Left Info Tag */}
            <div className="absolute top-4 left-4 z-20 bg-black border-2 border-white px-2 py-1 transform -rotate-2">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-[#E07000]" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">LIVE_FEED</span>
              </div>
            </div>

            {/* Signal Strength Bars */}
            <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end">
              <p className="text-[9px] font-bold text-[#006000] bg-black px-1 mb-1">SIGNAL</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-6 border border-black ${isPlaying ? "bg-[#E07000]" : "bg-[#333]"}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Metrics (Caption Boxes) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
            {[
              { icon: Waves, label: "Phase", val: "0.982", color: "text-blue-400" },
              { icon: Zap, label: "Centroid", val: "1.42 kHz", color: "text-[#E07000]" },
              { icon: Repeat, label: "Harmonic", val: "4:1", color: "text-[#00FF00]" },
            ].map((metric, idx) => (
              <div
                key={idx}
                className="bg-white border-4 border-black p-2 flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]"
              >
                <div className="bg-black p-1 text-white">
                  <metric.icon size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase">{metric.label}</p>
                  <p className="text-sm font-black text-black">{metric.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS for custom scrollbar and range inputs to match style */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #111; border-left: 2px solid #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E07000; border: 2px solid #000; }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 16px;
            width: 16px;
            background: #E07000;
            border: 2px solid black;
            cursor: pointer;
            margin-top: -6px;
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            background: #000;
        }
      `}</style>
    </div>
  );
};
