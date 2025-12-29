import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Music,
  Activity,
  Zap,
  Play,
  Square,
  Settings2,
  Volume2,
  Wind,
  Repeat,
  Waves,
  Radio,
  Sliders,
  Share2,
  Download,
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

  // --- Audio System Core ---
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

    // Master Chain
    const masterOut = ctx.createGain();
    masterOut.gain.value = 0.5;

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = settings.filterFreq;
    filter.Q.value = settings.filterRes;

    // Delay
    const delay = ctx.createDelay();
    delay.delayTime.value = settings.delayTime;
    const feedback = ctx.createGain();
    feedback.gain.value = settings.delayFeedback;

    delay.connect(feedback);
    feedback.connect(delay);

    // Connections
    masterOut.connect(filter);
    filter.connect(ctx.destination);
    filter.connect(analyzer);

    // Parallel Delay
    filter.connect(delay);
    delay.connect(ctx.destination);

    for (let i = 0; i < chars.length; i++) {
      if (!isActiveRef.current) break;

      const charCode = chars[i].charCodeAt(0);
      // Map char code to a musical frequency (Persian range simulation)
      const freq = 100 + (charCode % 800);
      const duration = 0.4;
      const timeSlot = startTime + i * 0.25;

      const osc = ctx.createOscillator();
      const env = ctx.createGain();

      osc.type = settings.waveType;
      osc.frequency.setValueAtTime(freq, timeSlot);

      // Glissando effect (slight slide)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, timeSlot + duration);

      // ADSR Envelope
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

  // --- Visualizer Loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      const w = canvas.width;
      const h = canvas.height;

      // Translucent clear for motion blur
      ctx.fillStyle = "rgba(5, 5, 5, 0.2)";
      ctx.fillRect(0, 0, w, h);

      if (!analyzerRef.current || !isPlaying) {
        // Draw idle line
        ctx.beginPath();
        ctx.strokeStyle = "rgba(139, 92, 246, 0.2)";
        ctx.lineWidth = 2;
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        return;
      }

      const bufferLength = analyzerRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzerRef.current.getByteTimeDomainData(dataArray);

      ctx.lineWidth = 3;
      ctx.strokeStyle = "#a855f7";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#a855f7";

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
      ctx.shadowBlur = 0;
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  return (
    <div className="h-full flex flex-col p-4 md:p-8 overflow-hidden bg-[#050505]">
      {/* Header / HUD */}
      <div className="flex justify-between items-center border-b border-violet-500/20 pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
            <Music size={28} />
          </div>
          <div>
            <h2 className="text-violet-400 font-display text-3xl">سنتز عصبی کلمات</h2>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              Neural_Sonification_v4.0 // Audio_Engine
            </p>
          </div>
        </div>
        <div className="hidden md:flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-gray-600">SAMPLE_RATE</span>
            <span className="text-xs text-violet-400 font-mono">48000 Hz</span>
          </div>
          <div className="w-[1px] h-8 bg-white/10"></div>
          <div className="flex items-center gap-2 bg-violet-900/20 px-4 py-2 rounded-lg border border-violet-500/20">
            <Radio size={14} className={isPlaying ? "text-red-500 animate-pulse" : "text-gray-500"} />
            <span className="text-[10px] font-mono text-gray-300">
              {isPlaying ? "STREAMING_SIGNAL" : "STANDBY"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-grow overflow-hidden">
        {/* Right Panel: Controls */}
        <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 shrink-0">
          {/* Input Area */}
          <div className="bg-panel-black border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-violet-500 opacity-50 group-focus-within:opacity-100 transition-opacity"></div>
            <label className="text-[10px] font-mono text-gray-500 mb-2 block uppercase tracking-tighter">
              Text_Source_Buffer
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-transparent text-white font-sans text-lg outline-none resize-none h-24"
              placeholder="متنی برای تبدیل به فرکانس بنویسید..."
              dir="rtl"
            />
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
              <span className="text-[9px] text-gray-600 font-mono">CHARS: {text.length}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setText("")}
                  className="text-[9px] text-gray-500 hover:text-white transition-colors uppercase"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Synth Parameters */}
          <div className="bg-panel-black border border-white/10 p-5 rounded-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-gray-300 font-bold text-sm flex items-center gap-2">
                <Sliders size={14} className="text-violet-400" /> پارامترهای صوتی
              </h3>
              <div className="flex gap-1">
                {(["sine", "square", "sawtooth"] as OscillatorType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSettings({ ...settings, waveType: type })}
                    className={`w-6 h-6 flex items-center justify-center rounded border transition-all ${
                      settings.waveType === type
                        ? "bg-violet-500 border-violet-500 text-black"
                        : "border-white/10 text-gray-500 hover:text-white"
                    }`}
                    title={type}
                  >
                    <Waves size={12} />
                  </button>
                ))}
              </div>
            </div>

            {/* ADSR Sliders */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-gray-500 uppercase">
                  <span>Attack</span>
                  <span>{settings.attack}s</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={settings.attack}
                  onChange={(e) => setSettings({ ...settings, attack: Number(e.target.value) })}
                  className="w-full h-1 accent-violet-500"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-gray-500 uppercase">
                  <span>Release</span>
                  <span>{settings.release}s</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="2"
                  step="0.1"
                  value={settings.release}
                  onChange={(e) => setSettings({ ...settings, release: Number(e.target.value) })}
                  className="w-full h-1 accent-violet-500"
                />
              </div>
            </div>

            {/* Filter & Delay */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-violet-300 uppercase">
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
                  className="w-full h-1 accent-violet-500 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-violet-300 uppercase">
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
                  className="w-full h-1 accent-violet-500 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Master Actions */}
          <div className="flex gap-3">
            {isPlaying ? (
              <button
                onClick={stopAudio}
                className="flex-grow py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              >
                <Square size={20} fill="white" /> توقف سیگنال
              </button>
            ) : (
              <button
                onClick={playNeuralSynth}
                className="flex-grow py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                <Play size={20} fill="white" /> آغاز سنتز صدا
              </button>
            )}
            <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all">
              <Download size={20} />
            </button>
          </div>
        </div>

        {/* Left Panel: Visualization */}
        <div className="flex-grow flex flex-col gap-4 overflow-hidden">
          {/* Main Oscilloscope */}
          <div className="flex-grow bg-[#050505] border border-white/10 rounded-3xl relative overflow-hidden flex items-center justify-center">
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:40px_40px] "></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] opacity-60"></div>

            <canvas ref={canvasRef} width={800} height={400} className="w-full h-full relative z-10" />

            {/* Top Left Info */}
            <div className="absolute top-6 left-6 z-20 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-violet-500" />
                <span className="text-xs font-mono text-violet-400 font-bold uppercase tracking-widest">
                  Live_Waveform_Analysis
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-600">INPUT_BUFFER: SYNCED</span>
            </div>

            {/* Watermark/Status */}
            <div className="absolute bottom-6 right-8 z-20 flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-mono text-gray-500 uppercase">Signal_Strength</p>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-1 rounded-full ${
                        isPlaying ? "bg-violet-500 shadow-[0_0_5px_#a855f7]" : "bg-gray-800"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
            <div className="bg-panel-black border border-white/5 p-4 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Waves size={18} />
              </div>
              <div>
                <p className="text-[9px] font-mono text-gray-500 uppercase">Phase_Correlation</p>
                <p className="text-sm font-mono text-white">0.982</p>
              </div>
            </div>
            <div className="bg-panel-black border border-white/5 p-4 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                <Zap size={18} />
              </div>
              <div>
                <p className="text-[9px] font-mono text-gray-500 uppercase">Spectral_Centroid</p>
                <p className="text-sm font-mono text-white">1.42 kHz</p>
              </div>
            </div>
            <div className="bg-panel-black border border-white/5 p-4 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Repeat size={18} />
              </div>
              <div>
                <p className="text-[9px] font-mono text-gray-500 uppercase">Harmonic_Ratio</p>
                <p className="text-sm font-mono text-white">4:1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
