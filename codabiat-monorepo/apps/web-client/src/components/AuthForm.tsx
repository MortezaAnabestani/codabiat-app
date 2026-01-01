import React, { useState } from "react";
import { Mail, Lock, User, Zap, Skull, ArrowRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { login, register } = useAuth();

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        // Login
        await login(email, password);
        setSuccess("ورود موفقیت‌آمیز! در حال هدایت...");
      } else {
        // Register
        if (!name.trim()) {
          setError("لطفاً نام خود را وارد کنید");
          setLoading(false);
          return;
        }
        await register(name, email, password);
        setSuccess("ثبت‌نام موفقیت‌آمیز! در حال هدایت...");
      }

      // Navigate to dashboard after successful auth
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "خطایی رخ داد. لطفاً دوباره تلاش کنید.");
      setLoading(false);
    }
  };

  return (
    // [1. THE VOID] - پس‌زمینه میز کار طراح
    <div className="w-full flex items-center justify-center p-4 font-mono overflow-hidden relative">
      <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-white/10 rounded-full border-dashed animate-spin-slow"></div>

      {/* [2. THE COMIC PANEL] - کانتینر اصلی */}
      <div className="relative w-full max-w-md group">
        {/* سایه سخت کمیک بوکی */}
        <div className="absolute inset-0 bg-black translate-x-4 translate-y-4 border-2 border-white/20"></div>

        <div className="relative bg-white border-4 border-black p-6 md:p-8 transform transition-transform duration-300 hover:-rotate-1 hover:scale-[1.01]">
          {/* [4. UI MAPPING - INVENTORY SLOTS] - هدر و نویگیشن */}
          <div className="flex justify-between items-start mb-8 border-b-4 border-black pb-4 border-dashed">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic transform -skew-x-12 bg-[#E07000] text-white inline-block px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {isLogin ? "EPISODE 1: LOGIN" : "EPISODE 0: ORIGIN"}
              </h2>
              <p className="text-xs font-bold mt-1 text-gray-600">PAGE 1 OF 3</p>
            </div>

            {/* اسلات‌های اینونتوری برای تغییر حالت */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsLogin(true)}
                className={`w-10 h-10 border-2 border-black flex items-center justify-center transition-all ${
                  isLogin
                    ? "bg-[#FFCC00] translate-y-1 shadow-none"
                    : "bg-gray-200 shadow-[4px_4px_0px_0px_#000] hover:bg-white"
                }`}
                title="Load Game (Login)"
              >
                <Zap size={20} color="black" fill={isLogin ? "black" : "none"} />
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`w-10 h-10 border-2 border-black flex items-center justify-center transition-all ${
                  !isLogin
                    ? "bg-[#FFCC00] translate-y-1 shadow-none"
                    : "bg-gray-200 shadow-[4px_4px_0px_0px_#000] hover:bg-white"
                }`}
                title="New Game (Register)"
              >
                <User size={20} color="black" fill={!isLogin ? "black" : "none"} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* فیلد نام کاربری (فقط در ثبت نام) */}
            {!isLogin && (
              <div className="relative group/input">
                <div className="absolute -top-3 right-2 bg-[#FFCC00] border-2 border-black px-2 text-[10px] font-bold uppercase tracking-widest z-20">
                  HERO NAME
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center ">
                    <User size={18} className="text-black" />
                  </div>
                  <input
                    type="text"
                    className="w-full bg-white border-2 border-black px-10 py-3 text-black font-bold placeholder-gray-400 focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_#E07000] transition-all"
                    placeholder="SKETCH TURNER..."
                    dir="auto"
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* فیلد ایمیل */}
            <div className="relative group/input">
              <div className="absolute -top-3 right-2 bg-[#FFCC00] border-2 border-black px-2 text-[10px] font-bold uppercase tracking-widest z-20">
                COMMLINK ID
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center ">
                  <Mail size={18} className="text-black" />
                </div>
                <input
                  type="email"
                  className="w-full bg-white border-2 border-black px-10 py-3 text-black font-bold placeholder-gray-400 focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_#E07000] transition-all"
                  placeholder="USER@SEGA.NET"
                  dir="ltr"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* فیلد رمز عبور */}
            <div className="relative group/input">
              <div className="absolute -top-3 right-2 bg-[#FFCC00] border-2 border-black px-2 text-[10px] font-bold uppercase tracking-widest z-20">
                SECRET CODE
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center ">
                  <Lock size={18} className="text-black" />
                </div>
                <input
                  type="password"
                  className="w-full bg-white border-2 border-black px-10 py-3 text-black font-bold placeholder-gray-400 focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_#E07000] transition-all"
                  placeholder="********"
                  dir="ltr"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Error/Success Messages */}
            {(error || success) && (
              <div className={`border-2 border-black p-3 flex items-start gap-2 ${
                error ? 'bg-red-100' : 'bg-green-100'
              }`}>
                <AlertCircle size={20} className={error ? 'text-red-600' : 'text-green-600'} />
                <p className={`text-sm font-bold ${error ? 'text-red-800' : 'text-green-800'}`} dir="rtl">
                  {error || success}
                </p>
              </div>
            )}

            {/* [3. THE MORTUS HAND MECHANIC] - دکمه اکشن */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`
                        w-full py-4 px-6 border-4 border-black font-black text-xl uppercase tracking-widest flex items-center justify-center gap-3 transition-all
                        ${
                          loading
                            ? "bg-gray-400 cursor-wait translate-y-1 shadow-none"
                            : "bg-[#006000] text-white shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#E07000] active:translate-y-2 active:shadow-none"
                        }
                    `}
              >
                {loading ? (
                  <>
                    <span className="animate-pulse">DRAWING...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? "ENTER ZONE" : "JOIN RESISTANCE"}</span>
                    {!loading && <ArrowRight size={24} strokeWidth={3} />}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* فوتر کمیک */}
          <div className="mt-8 text-center border-t-2 border-black border-dotted pt-4">
            <p className="text-sm font-bold text-black">
              {isLogin ? "STUCK IN THE PANEL?" : "ALREADY A HERO?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="mr-2 text-[#E07000] hover:text-[#500050] hover:underline decoration-wavy underline-offset-4 transition-colors font-black uppercase"
              >
                {isLogin ? "CREATE NEW SKETCH" : "LOAD SAVE"}
              </button>
            </p>
          </div>

          {/* افکت‌های بصری گوشه صفحه (Page Curl) */}
          <div
            className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-gray-300 to-white border-l border-t border-gray-400 shadow-lg transform origin-bottom-right hover:scale-150 transition-transform cursor-pointer"
            title="Turn Page"
          ></div>

          {/* آیکون جمجمه تزئینی */}
          <div className="absolute -top-6 -left-6 bg-black text-white p-2 rounded-full border-4 border-white transform -rotate-12 z-20">
            <Skull size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
