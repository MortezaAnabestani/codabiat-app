import React, { useState, useEffect, useRef } from 'react';
import { Scissors } from 'lucide-react';
import { analyzeCriticalCode } from '../../services/geminiService';

export const CutUpModule: React.FC = () => {
    const [text, setText] = useState('جهان دیجیتال در امتداد رگ‌های فیبر نوری نفس می‌کشد');
    const [fragments, setFragments] = useState<string[]>([]);
    const shuffle = () => {
        if (!text) return;
        const words = text.split(/\s+/).filter(w => w.length > 0);
        for (let i = words.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [words[i], words[j]] = [words[j], words[i]];
        }
        setFragments(words);
    };
    return (
        <div className="h-full flex flex-col p-6 overflow-y-auto">
            <div className="flex flex-col gap-4 flex-grow h-full">
                <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full h-32 bg-black/50 border border-white/10 p-4 text-white focus:border-neon-blue outline-none" placeholder="متن..." dir="rtl" />
                <button onClick={shuffle} className="self-end bg-neon-blue text-black px-6 py-2 font-bold hover:bg-white transition-colors flex items-center gap-2"><Scissors size={18} /> برش و ترکیب</button>
                <div className="flex-grow bg-[#111] border-2 border-dashed border-white/10 p-6 relative overflow-hidden overflow-y-auto custom-scrollbar">
                    <div className="flex flex-wrap gap-3 content-start justify-center min-h-full">
                        {fragments.map((word, idx) => (
                            <span key={idx} className="bg-white text-black px-3 py-1 font-serif text-lg rotate-1 hover:rotate-0 hover:scale-110 transition-transform cursor-move shadow-lg select-none" style={{ transform: `rotate(${Math.random() * 6 - 3}deg)` }}>{word}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const GlitchModule: React.FC = () => {
    const [input, setInput] = useState('واقعیت مجازی');
    const [intensity, setIntensity] = useState(5);
    const [output, setOutput] = useState('');
    useEffect(() => {
        const chars = input.split('');
        const corrupted = chars.map(char => {
            if (char === ' ') return ' ';
            let result = char;
            const amount = Math.floor((intensity / 10) * 5); 
            for (let i = 0; i < amount; i++) {
                result += String.fromCharCode(0x0300 + Math.random() * 100);
            }
            return result;
        }).join('');
        setOutput(corrupted);
    }, [input, intensity]);
    return (
        <div className="h-full flex flex-col p-6 overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-8 h-full">
                <div className="flex flex-col gap-6 justify-center">
                    <div><label className="text-xs font-mono text-neon-green mb-2 block">SOURCE</label><input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="w-full bg-transparent border-b-2 border-white/20 p-2 text-2xl text-white focus:border-neon-green outline-none text-center" dir="auto" /></div>
                    <div><label className="text-xs font-mono text-neon-green mb-2 flex justify-between"><span>CORRUPTION</span><span>{intensity * 10}%</span></label><input type="range" min="0" max="20" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neon-green" /></div>
                </div>
                <div className="bg-black border border-neon-green/30 relative flex items-center justify-center overflow-hidden"><p className="text-4xl md:text-6xl text-center text-white break-words p-4 relative z-10 drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]">{output}</p></div>
            </div>
        </div>
    );
};

export const GeometricModule: React.FC = () => {
    const [text, setText] = useState('مارپیچ کلمات در فضای تهی');
    const [gap, setGap] = useState(15);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fbbf24'; ctx.font = '24px "Vazirmatn"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const centerX = canvas.width / 2; const centerY = canvas.height / 2;
        let angle = 0; let radius = 20;
        ctx.save(); ctx.translate(centerX, centerY);
        const cleanText = text.replace(/\s+/g, ' '); 
        for (let i = 0; i < cleanText.length; i++) {
            const char = cleanText[i];
            ctx.save();
            const x = Math.cos(angle) * radius; const y = Math.sin(angle) * radius;
            ctx.translate(x, y); ctx.rotate(angle + Math.PI / 2); 
            ctx.fillText(char, 0, 0); ctx.restore();
            const charWidth = ctx.measureText(char).width;
            angle += (charWidth + 5) / radius; radius += (gap / 20); 
        }
        ctx.restore();
    }, [text, gap]);
    return (
        <div className="h-full flex flex-col p-6 overflow-hidden">
             <div className="flex gap-4 mb-4 items-end">
                <div className="flex-grow"><input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full bg-black/50 border-b border-yellow-400/50 p-2 text-white outline-none" dir="rtl" /></div>
                <div className="w-32"><input type="range" min="5" max="50" value={gap} onChange={(e) => setGap(Number(e.target.value))} className="w-full accent-yellow-400" /></div>
             </div>
             <div className="flex-grow bg-[#050505] border border-white/10 relative rounded-lg overflow-hidden flex items-center justify-center"><canvas ref={canvasRef} width={800} height={600} className="max-w-full max-h-full" /></div>
        </div>
    );
};

export const PermutationModule: React.FC = () => {
    const [input, setInput] = useState('من فکر میکنم');
    const [permutations, setPermutations] = useState<string[]>([]);
    const generate = () => {
        const words = input.trim().split(/\s+/);
        if (words.length > 6) { setPermutations(["Too many words (Max 6)"]); return; }
        const permute = (arr: string[]): string[][] => {
            if (arr.length === 0) return [[]];
            const first = arr[0]; const rest = arr.slice(1);
            const permsWithoutFirst = permute(rest);
            const allPerms: string[][] = [];
            permsWithoutFirst.forEach((perm) => {
                for (let i = 0; i <= perm.length; i++) {
                    allPerms.push([...perm.slice(0, i), first, ...perm.slice(i)]);
                }
            });
            return allPerms;
        };
        const perms = permute(words);
        setPermutations(Array.from(new Set(perms.map(p => p.join(' ')))));
    };
    return (
        <div className="h-full flex flex-col p-6 overflow-hidden">
             <div className="flex gap-4 mb-6"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="flex-grow bg-black/50 border border-white/20 p-3 text-white rounded outline-none" dir="rtl" /><button onClick={generate} className="bg-red-500 text-black font-bold px-6 rounded">تولید</button></div>
             <div className="flex-grow bg-[#080808] border border-white/10 rounded overflow-y-auto custom-scrollbar p-4 relative">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{permutations.map((p, i) => (<div key={i} className="bg-white/5 p-2 rounded text-center text-gray-300 border border-transparent hover:border-red-500/30 text-sm">{p}</div>))}</div>
             </div>
        </div>
    );
};

export const CriticalCodeModule: React.FC = () => {
    const [code, setCode] = useState("");
    const [analysis, setAnalysis] = useState("");
    const [loading, setLoading] = useState(false);
    const handleAnalyze = async () => { setLoading(true); const res = await analyzeCriticalCode(code); setAnalysis(res); setLoading(false); };
    return (
        <div className="flex flex-col h-full p-6 gap-4">
             <h2 className="text-emerald-400 font-display text-2xl border-b border-white/10 pb-4">مطالعات انتقادی کد</h2>
             <textarea value={code} onChange={(e) => setCode(e.target.value)} className="w-full h-48 bg-black/30 border border-white/10 p-3 text-emerald-400 font-mono text-sm outline-none rounded" placeholder="// Code snippet here..." dir="ltr" />
             <button onClick={handleAnalyze} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded disabled:opacity-50">واکاوی ایدئولوژیک</button>
             <div className="flex-grow bg-black/50 p-4 border border-white/10 rounded overflow-auto whitespace-pre-wrap text-gray-300 leading-8" dir="rtl">{analysis}</div>
        </div>
    );
};
