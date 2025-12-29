
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Activity, Users, Database, FileText, 
  BrainCircuit, HardDrive, Zap, Trash2, Edit, Plus,
  Search, BarChart, Server, Globe, Bell, Settings, 
  Cpu, Terminal, Sliders, Save, RefreshCw, Radio,
  ShieldCheck, ShieldX, Key, MessageSquare, BookOpen,
  ChevronRight, Layout, Filter, Download, X, AlertTriangle
} from 'lucide-react';
import { articles as initialArticles, courses as initialCourses } from '../../data';

type AdminTab = 'metrics' | 'content' | 'users' | 'ai_config' | 'logs';
type ContentType = 'articles' | 'courses';

export const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('content');
    const [contentType, setContentType] = useState<ContentType>('articles');
    const [searchTerm, setSearchTerm] = useState("");
    
    // Data States
    const [articles, setArticles] = useState(initialArticles);
    const [courses, setCourses] = useState(initialCourses);
    
    // UI States
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    
    // AI Config State
    const [aiConfig, setAiConfig] = useState({
        temp: 0.9,
        topP: 0.95,
        topK: 64,
        model: 'gemini-3-pro-preview',
        instruction: 'You are an avant-garde Persian electronic literature poet...'
    });

    const [logs, setLogs] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // --- CRUD Logic ---
    const handleAddClick = () => {
        setEditingItem({
            id: Math.random().toString(36).substr(2, 9),
            title: '',
            category: contentType === 'articles' ? 'Programming' : 'Beginner',
            excerpt: '',
            date: new Date().toLocaleDateString('fa-IR'),
            tags: [],
            level: 'Beginner',
            techStack: [],
            description: ''
        });
        setShowForm(true);
    };

    const handleEditClick = (item: any) => {
        setEditingItem({ ...item });
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (contentType === 'articles') {
            setArticles(prev => prev.filter(a => a.id !== id));
        } else {
            setCourses(prev => prev.filter(c => c.id !== id));
        }
        setShowDeleteConfirm(null);
        addLog(`[DATA] Node_${id.slice(0,4)} purged from database`);
    };

    const handleSaveContent = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        setTimeout(() => {
            if (contentType === 'articles') {
                const exists = articles.find(a => a.id === editingItem.id);
                if (exists) {
                    setArticles(prev => prev.map(a => a.id === editingItem.id ? editingItem : a));
                    addLog(`[DATA] Article_${editingItem.id.slice(0,4)} updated`);
                } else {
                    setArticles(prev => [editingItem, ...prev]);
                    addLog(`[DATA] New Article node generated`);
                }
            } else {
                const exists = courses.find(c => c.id === editingItem.id);
                if (exists) {
                    setCourses(prev => prev.map(c => c.id === editingItem.id ? editingItem : c));
                    addLog(`[DATA] Course_${editingItem.id.slice(0,4)} updated`);
                } else {
                    setCourses(prev => [editingItem, ...prev]);
                    addLog(`[DATA] New Course node initialized`);
                }
            }
            setIsSaving(false);
            setShowForm(false);
            setEditingItem(null);
        }, 800);
    };

    const addLog = (msg: string) => {
        setLogs(prev => [msg, ...prev].slice(0, 15));
    };

    // Simulate Live Logs
    useEffect(() => {
        const initialLogs = ["[INFO] ADMIN_CORE_STABLE", "[SYSTEM] CONTENT_MANAGER_READY"];
        setLogs(initialLogs);
    }, []);

    const stats = [
        { label: 'نودهای فعال', value: (articles.length + courses.length).toString(), icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'پالس‌های عصبی', value: '۸۴۹', icon: BrainCircuit, color: 'text-neon-pink', bg: 'bg-neon-pink/10' },
        { label: 'پایگاه داده', value: '۴.۸ GB', icon: HardDrive, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'آپ‌تایم سیستم', value: '۹۹.۹٪', icon: Activity, color: 'text-lime-400', bg: 'bg-lime-500/10' },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-700 pointer-events-auto pb-24 h-full relative">
            
            {/* Form Overlay Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowForm(false)}></div>
                    <form 
                        onSubmit={handleSaveContent}
                        className="relative w-full max-w-2xl bg-panel-black border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                    >
                        <div className="h-1 w-full bg-gradient-to-r from-neon-pink via-neon-blue to-neon-green"></div>
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="text-xl font-display text-white flex items-center gap-3">
                                {editingItem?.id ? <Edit size={20} className="text-neon-blue" /> : <Plus size={20} className="text-neon-green" />}
                                {editingItem?.id ? 'ویرایش نود محتوا' : 'تولید نود جدید'}
                            </h3>
                            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Node_Title</label>
                                    <input 
                                        required
                                        value={editingItem?.title || ''}
                                        onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                                        className="w-full bg-black/50 border border-white/10 p-3 rounded text-white focus:border-neon-blue outline-none transition-all"
                                        placeholder="عنوان را وارد کنید..."
                                        dir="rtl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Category / Level</label>
                                    <select 
                                        value={contentType === 'articles' ? editingItem?.category : editingItem?.level}
                                        onChange={e => setEditingItem({...editingItem, [contentType === 'articles' ? 'category' : 'level']: e.target.value})}
                                        className="w-full bg-black/50 border border-white/10 p-3 rounded text-white focus:border-neon-blue outline-none transition-all"
                                    >
                                        {contentType === 'articles' ? (
                                            <>
                                                <option value="Programming">برنامه‌نویسی</option>
                                                <option value="E-Lit">ادبیات الکترونیک</option>
                                                <option value="Theory">نظریه</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="Beginner">مقدماتی</option>
                                                <option value="Intermediate">متوسط</option>
                                                <option value="Advanced">پیشرفته</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Excerpt / Summary</label>
                                <textarea 
                                    required
                                    value={contentType === 'articles' ? editingItem?.excerpt : editingItem?.description}
                                    onChange={e => setEditingItem({...editingItem, [contentType === 'articles' ? 'excerpt' : 'description']: e.target.value})}
                                    className="w-full bg-black/50 border border-white/10 p-3 rounded text-white focus:border-neon-blue outline-none transition-all h-24"
                                    placeholder="خلاصه‌ای از محتوا..."
                                    dir="rtl"
                                />
                            </div>

                            {contentType === 'articles' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Tags (Comma separated)</label>
                                    <input 
                                        value={editingItem?.tags?.join(', ') || ''}
                                        onChange={e => setEditingItem({...editingItem, tags: e.target.value.split(',').map(t => t.trim())})}
                                        className="w-full bg-black/50 border border-white/10 p-3 rounded text-white focus:border-neon-blue outline-none transition-all font-mono"
                                        placeholder="JS, React, AI..."
                                        dir="ltr"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-white/5 border-t border-white/10 flex justify-end gap-3">
                            <button 
                                type="button" 
                                onClick={() => setShowForm(false)}
                                className="px-6 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
                            >
                                لغو عملیات
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                className="px-8 py-2 bg-neon-blue hover:bg-blue-600 text-black font-bold rounded-lg transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,255,0.3)]"
                            >
                                {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                                ثبت نود در دیتابیس
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm"></div>
                    <div className="relative bg-panel-black border border-red-500/30 p-8 rounded-xl max-w-sm text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-display text-white mb-2">تأیید حذف نهایی</h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">آیا از پاکسازی این نود از هسته مرکزی اطمینان دارید؟ این عملیات غیرقابل بازگشت است.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded text-gray-400 transition-all font-bold text-xs">خیر، انصراف</button>
                            <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded text-white transition-all font-bold text-xs">بله، حذف کن</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Header */}
            <div className="bg-panel-black border border-white/10 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden shrink-0 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-lime-500 to-transparent animate-pulse"></div>
                
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-lime-500/20 rounded-lg text-lime-500 shadow-[0_0_15px_rgba(163,230,53,0.3)]">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-display text-white">اتاق فرمان مرکزی</h2>
                        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Complex_Kinetic_OS // AUTH_LVL:7</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 bg-white/5 p-2 rounded-lg border border-white/10">
                        <div className="text-right">
                            <span className="text-[10px] font-mono text-gray-500 block uppercase">DB_INTEGRITY</span>
                            <div className="w-24 h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-blue-500 w-3/4 shadow-[0_0_8px_#3b82f6]"></div>
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={() => addLog("[SYSTEM] Global Cache Purged")} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-xs transition-all group">
                        <RefreshCw size={14} className="text-lime-500 group-active:rotate-180 transition-transform" />
                        <span className="font-mono">FORCE_SYNC</span>
                    </button>
                </div>
            </div>

            {/* Main Navigation and Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-grow overflow-hidden">
                
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 flex flex-col gap-2 shrink-0">
                    {[
                        { id: 'metrics', label: 'مانیتورینگ', icon: BarChart, color: 'text-blue-400' },
                        { id: 'content', label: 'مدیریت داده', icon: Layout, color: 'text-amber-400' },
                        { id: 'users', label: 'کنترل نودها', icon: Users, color: 'text-purple-400' },
                        { id: 'ai_config', label: 'موتور عصبی', icon: BrainCircuit, color: 'text-neon-pink' },
                        { id: 'logs', label: 'گزارشات', icon: Terminal, color: 'text-lime-400' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as AdminTab)}
                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 group
                                ${activeTab === tab.id 
                                    ? 'bg-white/10 border-white/20 text-white shadow-lg' 
                                    : 'border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'}
                            `}
                        >
                            <tab.icon size={20} className={activeTab === tab.id ? tab.color : 'group-hover:text-white'} />
                            <span className="font-display tracking-wide">{tab.label}</span>
                        </button>
                    ))}
                    
                    <div className="mt-auto p-4 bg-void-black border border-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
                            <span className="text-[10px] font-mono text-gray-600 uppercase">Sys_Health</span>
                            <span className="text-[10px] font-mono text-lime-500">EXCELLENT</span>
                        </div>
                        <div className="space-y-2">
                             <div className="flex justify-between items-center text-[9px] font-mono">
                                 <span className="text-gray-500">DB_LATENCY</span>
                                 <span className="text-blue-400">12ms</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Main Viewport */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                    
                    {/* Metrics View */}
                    {activeTab === 'metrics' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {stats.map((s, i) => (
                                    <div key={i} className="bg-panel-black border border-white/10 p-5 rounded-xl hover:border-white/20 transition-all group relative overflow-hidden">
                                        <div className={`p-2 w-fit rounded-lg ${s.bg} ${s.color} mb-4 group-hover:scale-110 transition-transform`}>
                                            <s.icon size={20} />
                                        </div>
                                        <h4 className="text-2xl font-display text-white">{s.value}</h4>
                                        <p className="text-[10px] font-mono text-gray-500 uppercase mt-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Content View - FULL CRUD */}
                    {activeTab === 'content' && (
                        <div className="bg-panel-black border border-white/10 rounded-xl overflow-hidden flex flex-col animate-in fade-in duration-500">
                            {/* Content Header */}
                            <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                                    <button 
                                        onClick={() => { setContentType('articles'); setShowForm(false); }}
                                        className={`px-4 py-2 text-xs font-bold rounded transition-all flex items-center gap-2
                                        ${contentType === 'articles' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        <FileText size={14} /> مقالات ({articles.length})
                                    </button>
                                    <button 
                                        onClick={() => { setContentType('courses'); setShowForm(false); }}
                                        className={`px-4 py-2 text-xs font-bold rounded transition-all flex items-center gap-2
                                        ${contentType === 'courses' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        <BookOpen size={14} /> دوره‌ها ({courses.length})
                                    </button>
                                </div>

                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="جستجو در پایگاه داده..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs text-white focus:border-amber-500 outline-none transition-all"
                                        dir="rtl"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleAddClick}
                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                    >
                                        <Plus size={16} /> {contentType === 'articles' ? 'مقاله جدید' : 'دوره جدید'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto min-h-[400px]">
                                <table className="w-full text-right">
                                    <thead className="bg-black/40 text-[10px] font-mono text-gray-500 uppercase tracking-widest border-b border-white/10">
                                        <tr>
                                            <th className="px-6 py-4">UUID</th>
                                            <th className="px-6 py-4 text-right">عنوان نود</th>
                                            <th className="px-6 py-4">دسته‌بندی/سطح</th>
                                            <th className="px-6 py-4">آخرین تغییر</th>
                                            <th className="px-6 py-4 text-center">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-sans">
                                        {(contentType === 'articles' ? articles : courses)
                                            .filter(a => a.title.includes(searchTerm))
                                            .map((item: any) => (
                                            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 text-xs font-mono text-gray-600">#{item.id.toString().slice(0, 8)}</td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-white font-bold">{item.title}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                                        contentType === 'articles' 
                                                        ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' 
                                                        : 'text-purple-400 bg-purple-400/10 border-purple-400/20'
                                                    }`}>
                                                        {contentType === 'articles' ? item.category : item.level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs text-gray-500 font-mono">{item.date || '---'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-3 text-gray-500 group-hover:text-white transition-colors">
                                                        <button 
                                                            onClick={() => handleEditClick(item)}
                                                            className="hover:text-amber-400 p-1" 
                                                            title="ویرایش"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => setShowDeleteConfirm(item.id)}
                                                            className="hover:text-red-500 p-1" 
                                                            title="حذف نود"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* AI Config View */}
                    {activeTab === 'ai_config' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                             <div className="lg:col-span-2 flex flex-col gap-6">
                                <div className="bg-panel-black border border-white/10 p-6 rounded-xl flex flex-col gap-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink to-transparent"></div>
                                    <h3 className="text-white font-display text-lg flex items-center gap-2 mb-2">
                                        <BrainCircuit size={20} className="text-neon-pink" /> پارامترهای Gemini
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="flex justify-between text-xs font-mono text-gray-400 mb-2">
                                                <span>TEMPERATURE</span>
                                                <span className="text-neon-pink">{aiConfig.temp}</span>
                                            </div>
                                            <input type="range" min="0" max="2" step="0.1" value={aiConfig.temp} onChange={(e) => setAiConfig({...aiConfig, temp: Number(e.target.value)})} className="w-full accent-neon-pink" />
                                        </div>
                                        <div className="p-3 bg-black/50 border border-neon-pink/30 rounded text-xs text-neon-pink font-mono flex items-center justify-between">
                                            <span>{aiConfig.model}</span>
                                            <Radio size={12} className="animate-pulse" />
                                        </div>
                                    </div>
                                    <button onClick={() => addLog("[AI] Config Synced")} className="w-full py-4 bg-neon-pink text-black font-bold rounded-xl flex items-center justify-center gap-2">
                                        بروزرسانی هسته عصبی
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}

                    {/* Logs View */}
                    {activeTab === 'logs' && (
                        <div className="bg-[#050505] border border-lime-500/20 rounded-xl overflow-hidden flex flex-col h-[600px] animate-in slide-in-from-top-4 duration-500 shadow-2xl relative">
                            <div className="p-3 bg-lime-500/10 border-b border-lime-500/20 flex justify-between items-center px-6 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <Terminal size={14} className="text-lime-500" />
                                    <span className="text-[10px] font-mono text-lime-400 uppercase tracking-widest">Core_OS_Console // Live_Stream</span>
                                </div>
                            </div>
                            <div className="flex-grow p-6 font-mono text-[11px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
                                {logs.map((log, i) => (
                                    <div key={i} className={`flex gap-3 items-start py-0.5 ${log.includes('[DATA]') ? 'text-blue-400' : 'text-lime-500/80'}`}>
                                        <span className="opacity-30 shrink-0 font-bold">{`[${new Date().toLocaleTimeString('en-GB', {hour12: false})}]`}</span>
                                        <span className="break-all tracking-tight">{log}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
