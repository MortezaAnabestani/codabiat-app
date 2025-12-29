
import React, { useState } from 'react';
import { User, Cpu, Award, Zap, Edit3, Save, Shield, Clock, Hash, Code } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  
  // Mock User Data
  const [user, setUser] = useState({
    name: 'سهراب سپهری (دیجیتال)',
    username: 'sohrab_node_01',
    bio: 'به سراغ من اگر می‌آیید، نرم و آهسته بیایید / مبادا که ترک بردارد چینی نازک تنهایی کد.',
    level: 'معمار خیال',
    xp: 4200,
    rank: 4,
    joinDate: '۱۴۰۳/۰۱/۰۱',
    avatarColor: 'bg-neon-pink'
  });

  const [editForm, setEditForm] = useState({ ...user });

  const handleSave = () => {
      setUser(editForm);
      // alert("پروفایل در شبکه ذخیره شد."); // In a real app, this would be an API call
  };

  return (
    <div className="w-full max-w-6xl mx-auto pointer-events-auto">
      
      {/* Profile Header Card */}
      <div className="bg-panel-black border border-white/10 p-6 md:p-8 rounded-2xl relative overflow-hidden mb-8 cyber-clip shadow-2xl">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink via-neon-green to-neon-blue"></div>
         <div className="absolute -right-10 -top-10 w-40 h-40 bg-neon-green/10 rounded-full blur-3xl"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
             {/* Avatar */}
             <div className="relative group">
                 <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full ${user.avatarColor} p-1 shadow-[0_0_20px_rgba(255,255,255,0.2)]`}>
                     <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden relative">
                         <User size={48} className="text-white opacity-80" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                     </div>
                 </div>
                 <div className="absolute bottom-0 right-0 w-8 h-8 bg-black border border-neon-green rounded-full flex items-center justify-center text-neon-green text-xs font-bold shadow-lg">
                     {user.rank}
                 </div>
             </div>

             {/* Info */}
             <div className="flex-grow text-center md:text-right">
                 <h2 className="text-3xl font-display text-white mb-2">{user.name}</h2>
                 <p className="font-mono text-neon-blue text-sm mb-4">@{user.username} // <span className="text-gray-500">USER_ID: 0x92A4</span></p>
                 <p className="text-gray-400 font-light italic max-w-2xl text-sm leading-6">
                     "{user.bio}"
                 </p>
                 
                 {/* XP Bar */}
                 <div className="mt-6 max-w-md">
                     <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                         <span>XP PROGRESS</span>
                         <span>{user.xp} / 5000</span>
                     </div>
                     <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-neon-pink to-neon-blue w-[84%] shadow-[0_0_10px_rgba(255,0,255,0.5)]"></div>
                     </div>
                 </div>
             </div>

             {/* Actions */}
             <div className="flex flex-col gap-2 min-w-[140px]">
                 <button 
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 text-xs font-bold rounded border transition-all flex items-center gap-2 justify-center
                    ${activeTab === 'overview' ? 'bg-neon-green text-black border-neon-green shadow-[0_0_10px_rgba(57,255,20,0.4)]' : 'bg-transparent text-gray-400 border-white/20 hover:border-white hover:text-white'}`}
                 >
                     <Cpu size={14} /> داشبورد
                 </button>
                 <button 
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 text-xs font-bold rounded border transition-all flex items-center gap-2 justify-center
                    ${activeTab === 'settings' ? 'bg-neon-pink text-black border-neon-pink shadow-[0_0_10px_rgba(255,0,255,0.4)]' : 'bg-transparent text-gray-400 border-white/20 hover:border-white hover:text-white'}`}
                 >
                     <Edit3 size={14} /> تنظیمات
                 </button>
             </div>
         </div>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Stats Cards */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <div className="bg-panel-black/60 border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors">
                          <div className="p-3 bg-blue-500/20 rounded text-blue-400"><Code size={24} /></div>
                          <div>
                              <h4 className="text-2xl font-display text-white">۱۲</h4>
                              <p className="text-[10px] font-mono text-gray-500">PROJECTS_COMPLETED</p>
                          </div>
                      </div>
                      <div className="bg-panel-black/60 border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors">
                          <div className="p-3 bg-purple-500/20 rounded text-purple-400"><Award size={24} /></div>
                          <div>
                              <h4 className="text-2xl font-display text-white">۸</h4>
                              <p className="text-[10px] font-mono text-gray-500">BADGES_EARNED</p>
                          </div>
                      </div>
                      <div className="bg-panel-black/60 border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors">
                          <div className="p-3 bg-yellow-500/20 rounded text-yellow-400"><Zap size={24} /></div>
                          <div>
                              <h4 className="text-2xl font-display text-white">۳۵۰</h4>
                              <p className="text-[10px] font-mono text-gray-500">TOKENS_MINED</p>
                          </div>
                      </div>
                      <div className="bg-panel-black/60 border border-white/10 p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors">
                          <div className="p-3 bg-green-500/20 rounded text-green-400"><Clock size={24} /></div>
                          <div>
                              <h4 className="text-2xl font-display text-white">۱۴h</h4>
                              <p className="text-[10px] font-mono text-gray-500">TOTAL_UPTIME</p>
                          </div>
                      </div>
                  </div>

                  {/* Badges Column */}
                  <div className="bg-panel-black/60 border border-white/10 p-6 rounded-xl flex flex-col">
                      <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Shield size={16} className="text-neon-pink" /> نشان‌ها</h3>
                      <div className="space-y-3">
                          <div className="flex items-center gap-3 p-2 bg-white/5 rounded border border-white/5">
                              <div className="w-8 h-8 rounded bg-neon-green/20 flex items-center justify-center text-neon-green"><Award size={16} /></div>
                              <div>
                                  <p className="text-sm text-white">استاد گلیچ</p>
                                  <p className="text-[10px] text-gray-500">ساخت ۵ اثر هنری خطا</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3 p-2 bg-white/5 rounded border border-white/5">
                              <div className="w-8 h-8 rounded bg-neon-blue/20 flex items-center justify-center text-neon-blue"><Code size={16} /></div>
                              <div>
                                  <p className="text-sm text-white">شاعر کد</p>
                                  <p className="text-[10px] text-gray-500">تکمیل دوره مقدماتی</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-3 p-2 border border-dashed border-gray-700 rounded opacity-50">
                              <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-600"><Hash size={16} /></div>
                              <div>
                                  <p className="text-sm text-gray-400">قفل شده</p>
                                  <p className="text-[10px] text-gray-600">؟؟؟</p>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Recent Activity - Full Width */}
                  <div className="md:col-span-3 bg-panel-black/60 border border-white/10 p-6 rounded-xl mt-2">
                      <h3 className="text-white font-bold mb-4 text-sm font-mono tracking-widest text-neon-blue border-b border-white/10 pb-2">RECENT_LOGS</h3>
                      <div className="space-y-4">
                          {[1,2,3].map((_, i) => (
                              <div key={i} className="flex items-center justify-between text-sm group cursor-pointer">
                                  <div className="flex items-center gap-3">
                                      <span className="text-neon-pink font-mono">[{`10:4${i}`}]</span>
                                      <span className="text-gray-300 group-hover:text-white transition-colors">اجرای ماژول {i === 0 ? 'هوش مصنوعی' : i === 1 ? 'فیزیک کلمات' : 'داستان تعاملی'}</span>
                                  </div>
                                  <span className="text-gray-600 text-xs font-mono">COMPLETE</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
              <div className="bg-panel-black/60 border border-white/10 p-8 rounded-xl max-w-2xl mx-auto">
                  <div className="flex flex-col gap-6">
                      <div>
                          <label className="block text-xs font-mono text-neon-green mb-2">DISPLAY_NAME</label>
                          <input 
                            type="text" 
                            value={editForm.name} 
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="w-full bg-black/50 border border-white/20 p-3 rounded text-white focus:border-neon-pink outline-none transition-colors"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-mono text-neon-green mb-2">CODENAME (USERNAME)</label>
                          <input 
                            type="text" 
                            value={editForm.username} 
                            onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                            className="w-full bg-black/50 border border-white/20 p-3 rounded text-white focus:border-neon-pink outline-none transition-colors font-mono"
                            dir="ltr"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-mono text-neon-green mb-2">MANIFESTO (BIO)</label>
                          <textarea 
                            value={editForm.bio} 
                            onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                            className="w-full bg-black/50 border border-white/20 p-3 rounded text-white focus:border-neon-pink outline-none transition-colors h-32"
                          />
                      </div>
                      
                      <div className="pt-4 border-t border-white/10 flex justify-end">
                          <button 
                            onClick={handleSave}
                            className="bg-neon-pink hover:bg-pink-600 text-black font-bold py-2 px-6 rounded flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,0,255,0.4)]"
                          >
                              <Save size={18} /> ذخیره تغییرات
                          </button>
                      </div>
                  </div>
              </div>
          )}
      </div>

    </div>
  );
};

export default Dashboard;
