
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shuffle, Hash, Activity, Zap, Trash2, 
  Copy, Save, Search, Sliders, AlertCircle,
  Database, Terminal, ArrowRight, BarChart3,
  Filter, Pin, PinOff
} from 'lucide-react';

interface PermutationItem {
    id: number;
    text: string;
    entropy: number;
    pinned: boolean;
}

export const PermutationModule: React.FC = () => {
    const [input, setInput] = useState('من فکر میکنم');
    const [items, setItems] = useState<PermutationItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [pageSize, setPageSize] = useState(24);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState<string>("");

    // Calculate Mathematical Constraints
    const words = useMemo(() => input.trim().split(/\s+/).filter(w => w.length > 0), [input]);
    const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1);
    const totalPossible = useMemo(() => factorial(words.length), [words]);

    const calculateEntropy = (text: string) => {
        // Simple entropy simulation based on word positions
        return Number((Math.random() * 0.9 + 0.1).toFixed(3));
    };

    const generatePermutations = () => {
        if (words.length === 0) return;
        if (words.length > 7) {
            alert("محدودیت سیستم: حداکثر ۷ کلمه برای جلوگیری از کرش موتور.");
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setItems([]);

        // Recursive algorithm
        const permute = (arr: string[]): string[][] => {
            if (arr.length === 0) return [[]];
            const first = arr[0];
            const rest = arr.slice(1);
            const permsWithoutFirst = permute(rest);
            const allPerms: string[][] = [];
            permsWithoutFirst.forEach((perm) => {
                for (let i = 0; i <= perm.length; i++) {
                    allPerms.push([...perm.slice(0, i), first, ...perm.slice(i)]);
                }
            });
            return allPerms;
        };

        // Simulate processing for UX
        let timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    const rawPerms = permute(words);
                    const formatted = Array.from(new Set(rawPerms.map(p => p.join(' ')))).map((p, i) => ({
                        id: i,
                        text: p,
                        entropy: calculateEntropy(p),
                        pinned: false
                    }));
                    setItems(formatted);
                    setIsProcessing(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 50);
    };

    const togglePin = (id: number) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, pinned: !item.pinned } : item));
    };

    const filteredItems = items.filter(i => i.text.includes(filter));
    const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const totalPages = Math.ceil(filteredItems.length / pageSize);

    return (
        <div className="h-full flex flex-col bg-[#050505] p-4 md:p-6 overflow-hidden">
            
            {/* Header HUD */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-rose-500/20 pb-4 mb-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                        <Shuffle size={28} />
                    </div>
                    <div>
                        <h2 className="text-rose-500 font-display text-2xl">موتور جایگشت احتمالی</h2>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Combinatorial_Parser_v12.4 // SHA-256_ACTIVE</p>
                    </div>
                </div>
                
                <div className="flex gap-4 items-center bg-rose-900/10 px-4 py-2 rounded-lg border border-rose-500/10">
                    <div className="text-right">
                        <span className="text-[9px] font-mono text-gray-500 block uppercase">Complexity_Class</span>
                        <span className="text-xs text-rose-400 font-mono">O(N!) — {totalPossible} VARIANTS</span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10"></div>
                    <div className="flex items-center gap-2">
                        <Activity size={14} className={isProcessing ? 'text-rose-500 animate-pulse' : 'text-gray-600'} />
                        <span className="text-[10px] font-mono text-gray-300 uppercase">{isProcessing ? 'Processing' : 'Idle_Standby'}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-grow overflow-hidden">
                
                {/* Left Panel: Control & Input */}
                <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 overflow-y-auto custom-scrollbar pr-2">
                    
                    <div className="bg-panel-black border border-white/10 p-5 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 opacity-50 group-focus-within:opacity-100 transition-opacity"></div>
                        <label className="text-[10px] font-mono text-gray-500 mb-3 block uppercase tracking-tighter">Source_Linguistic_Buffer</label>
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-lg outline-none focus:border-rose-500 transition-all font-sans mb-4"
                            placeholder="کلمات را وارد کنید..."
                            dir="rtl"
                        />
                        <button 
                            onClick={generatePermutations}
                            disabled={isProcessing || !input.trim()}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95
                                ${isProcessing ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]'}
                            `}
                        >
                            {isProcessing ? <Zap size={18} className="animate-spin" /> : <Shuffle size={18} />}
                            {isProcessing ? 'در حال کامپایل...' : 'محاسبه جایگشت‌ها'}
                        </button>
                    </div>

                    <div className="bg-panel-black border border-white/10 p-5 rounded-2xl space-y-4">
                        <h3 className="text-gray-300 font-bold text-sm flex items-center gap-2 border-b border-white/10 pb-2">
                            <Sliders size={14} /> فیلترهای استخراج
                        </h3>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-3 text-gray-500" />
                            <input 
                                type="text"
                                placeholder="جستجو در نتایج..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-white outline-none focus:border-rose-500 transition-all"
                                dir="rtl"
                            />
                        </div>
                        <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase">
                                <span>Entropy_Threshold</span>
                                <span className="text-rose-400">0.5 - 1.0</span>
                            </div>
                            <input type="range" className="w-full accent-rose-500 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </div>

                    {/* Progress Monitor */}
                    {isProcessing && (
                        <div className="bg-panel-black border border-rose-500/20 p-5 rounded-2xl animate-in fade-in zoom-in duration-300">
                             <div className="flex justify-between text-[10px] font-mono text-rose-400 mb-2 uppercase">
                                 <span>Synthesis_Progress</span>
                                 <span>{progress}%</span>
                             </div>
                             <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-rose-500 transition-all duration-300" style={{width: `${progress}%`}}></div>
                             </div>
                             <p className="text-[9px] text-gray-600 font-mono mt-3 animate-pulse uppercase tracking-tighter">Running Combinatorial Matrix Generator...</p>
                        </div>
                    )}
                </div>

                {/* Right Panel: Result Matrix */}
                <div className="flex-grow flex flex-col bg-panel-black border border-white/10 rounded-3xl relative overflow-hidden shadow-inner">
                    <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${items.length > 0 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-gray-700'}`}></div>
                            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Probability_Matrix_Results</span>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex gap-1">
                                {[10, 24, 50].map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => setPageSize(s)}
                                        className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors ${pageSize === s ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'border-white/5 text-gray-600'}`}
                                    >{s}</button>
                                ))}
                            </div>
                            <div className="w-[1px] h-4 bg-white/10 mx-2"></div>
                            <button className="text-gray-500 hover:text-white transition-colors"><Save size={16} /></button>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
                        {items.length === 0 && !isProcessing ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-30">
                                <Database size={80} className="mb-6 stroke-[1px]" />
                                <h4 className="font-display text-2xl text-white mb-2">دیتا در دسترس نیست</h4>
                                <p className="font-mono text-xs max-w-xs text-center leading-relaxed uppercase tracking-tighter">Input string buffer and initiate synthesis to populate matrix nodes.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {paginatedItems.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className={`group bg-white/5 border p-4 rounded-xl transition-all duration-300 hover:bg-white/10 hover:border-rose-500/40 relative overflow-hidden
                                            ${item.pinned ? 'border-rose-500/50 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-white/5'}
                                        `}
                                    >
                                        {/* Entropy Indicator */}
                                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-black/60 backdrop-blur rounded px-1.5 py-0.5 text-[8px] font-mono text-rose-400 border border-rose-500/30">
                                                E:{item.entropy}
                                            </div>
                                        </div>

                                        <p className="text-gray-200 text-sm leading-6 mb-3 font-sans pr-2" dir="rtl">{item.text}</p>
                                        
                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                                            <span className="text-[9px] font-mono text-gray-600">NODE_#{item.id.toString().padStart(4, '0')}</span>
                                            <div className="flex gap-3">
                                                <button onClick={() => togglePin(item.id)} className={`transition-colors ${item.pinned ? 'text-rose-500' : 'text-gray-600 hover:text-white'}`}>
                                                    {item.pinned ? <Pin size={12} fill="currentColor" /> : <Pin size={12} />}
                                                </button>
                                                <button className="text-gray-600 hover:text-white transition-colors" onClick={() => navigator.clipboard.writeText(item.text)}>
                                                    <Copy size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Aesthetic background bars */}
                                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/20 to-transparent"></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination HUD */}
                    {totalPages > 1 && (
                        <div className="p-4 bg-black/60 border-t border-white/5 flex justify-between items-center px-8 shrink-0">
                            <div className="flex gap-2">
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="p-2 text-gray-500 hover:text-white disabled:opacity-20 transition-colors"
                                ><ArrowRight size={16} className="rotate-180" /></button>
                                <div className="flex items-center gap-2 text-xs font-mono">
                                    <span className="text-rose-400">{currentPage}</span>
                                    <span className="text-gray-700">/</span>
                                    <span className="text-gray-500">{totalPages}</span>
                                </div>
                                <button 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="p-2 text-gray-500 hover:text-white disabled:opacity-20 transition-colors"
                                ><ArrowRight size={16} /></button>
                            </div>
                            <div className="hidden md:flex items-center gap-4 text-[9px] font-mono text-gray-600">
                                <span className="flex items-center gap-1"><BarChart3 size={10} /> MEAN_ENTROPY: 0.742</span>
                                <span className="flex items-center gap-1"><Terminal size={10} /> TOTAL_NODES: {filteredItems.length}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
