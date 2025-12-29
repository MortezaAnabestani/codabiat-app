import React, { useState } from 'react';
import { Send, MapPin, Database, Gamepad2, Link as LinkIcon } from 'lucide-react';
import { interactWithStory, generateDataStory, generateLocativeContent, generateHypertextNode } from '../../services/geminiService';

export const InteractiveFictionModule: React.FC = () => {
    const [history, setHistory] = useState("شما در سال ۱۴۵۰ شمسی، در خرابه‌های تهران قدیم بیدار می‌شوید.");
    const [action, setAction] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSend = async () => { if(!action) return; setLoading(true); const res = await interactWithStory(history, action); setHistory(prev => prev + "\n\n> " + action + "\n\n" + res); setAction(""); setLoading(false); };
    return (
        <div className="flex flex-col h-full p-6 gap-4">
             <h2 className="text-purple-400 font-display text-2xl border-b border-white/10 pb-4">داستان تعاملی</h2>
             <div className="flex-grow bg-black/50 p-4 border border-white/10 rounded overflow-auto whitespace-pre-wrap text-gray-300 leading-8" dir="rtl">{history}</div>
             <div className="flex gap-2"><input value={action} onChange={(e) => setAction(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} className="flex-grow bg-black/30 border border-white/10 p-3 text-white outline-none rounded" placeholder="چه می‌کنید؟" dir="rtl" /><button onClick={handleSend} disabled={loading} className="bg-purple-600 text-white px-6 rounded"><Send size={18} /></button></div>
        </div>
    );
};

export const DataNarrativeModule: React.FC = () => {
     const [json, setJson] = useState('{\n  "tehran_temp": 32,\n  "crypto_sentiment": "fear",\n  "hafez_omen": "lost_love"\n}');
     const [story, setStory] = useState("");
     const [loading, setLoading] = useState(false);
     const handleGenerate = async () => { setLoading(true); const res = await generateDataStory(json); setStory(res); setLoading(false); };
     return (
         <div className="flex flex-col h-full p-6 gap-4"><h2 className="text-blue-400 font-display text-2xl border-b border-white/10 pb-4">روایت‌گری داده‌ها</h2><textarea value={json} onChange={(e) => setJson(e.target.value)} className="w-full h-32 bg-black/30 border border-white/10 p-3 text-blue-300 font-mono text-xs outline-none rounded" dir="ltr" /><button onClick={handleGenerate} disabled={loading} className="bg-blue-600 text-white font-bold py-2 rounded">{loading ? '...' : 'روایت'}</button><div className="flex-grow bg-black/50 p-4 border border-white/10 rounded overflow-auto whitespace-pre-wrap text-gray-300 leading-8" dir="rtl">{story}</div></div>
     );
};

export const LocativeNarrativeModule: React.FC = () => {
    const [coords, setCoords] = useState("35.6892, 51.3890");
    const [story, setStory] = useState("");
    const [loading, setLoading] = useState(false);
    const handleLocate = async () => { setLoading(true); const res = await generateLocativeContent(coords); setStory(res); setLoading(false); };
    return (
        <div className="flex flex-col h-full p-6 gap-4"><h2 className="text-red-400 font-display text-2xl border-b border-white/10 pb-4">روایت مکان‌محور</h2><div className="flex gap-2"><input value={coords} onChange={(e) => setCoords(e.target.value)} className="flex-grow bg-black/30 border border-white/10 p-3 text-white font-mono outline-none rounded" /><button onClick={handleLocate} disabled={loading} className="bg-red-600 text-white px-6 rounded"><MapPin size={18} /></button></div><div className="flex-grow bg-black/50 p-4 border border-white/10 rounded overflow-auto whitespace-pre-wrap text-gray-300 leading-8" dir="rtl">{story}</div></div>
    );
};

export const HypertextModule: React.FC = () => {
    const [content, setContent] = useState("در ابتدای کلمه بود، و کلمه در شبکه جاری شد. یکی را انتخاب کن تا مسیر ساخته شود.");
    const [loading, setLoading] = useState(false);
    const handleClick = async (word: string) => { if (word.length < 2) return; setLoading(true); const res = await generateHypertextNode(content, word); setContent(res); setLoading(false); };
    return (
        <div className="flex flex-col h-full p-6 gap-4"><h2 className="text-indigo-400 font-display text-2xl border-b border-white/10 pb-4">داستان فرامتنی</h2><div className="flex-grow bg-black/50 p-6 border border-white/10 rounded overflow-auto leading-loose text-lg text-gray-300 text-justify" dir="rtl">{loading ? <div className="animate-pulse text-center">...</div> : content.split(" ").map((word, i) => (<span key={i} onClick={() => handleClick(word)} className="cursor-pointer hover:text-indigo-400 hover:bg-indigo-900/20 rounded px-1">{word} </span>))}</div></div>
    );
};
