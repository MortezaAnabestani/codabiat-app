import React from "react";
import { Link } from "react-router-dom";
import { articles } from "../data";

// استایل‌های کمکی برای ایجاد حس دست‌ساز و پیکسلی
const comicPanelStyle =
  "relative bg-white border-4 border-black p-6 transition-all duration-200 ease-out hover:-translate-y-2 hover:rotate-1";
const hardShadow = "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_#E07000]";
const narratorBox =
  "bg-[#FFCC00] border-2 border-black px-2 py-1 text-black font-bold uppercase tracking-widest text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";

const Archive: React.FC = () => {
  return (
    // [1. VISUAL FIDELITY] The "Void" Background - میز کار هنرمند (تیره و خشن)
    <div
      className="relative min-h-screen bg-[#2a1a2a] p-8 overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(#500050 1px, transparent 1px), radial-gradient(#500050 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 10px 10px",
      }}
    >
      {/* عناصر تزئینی پس‌زمینه - مداد و پاک‌کن فرضی */}
      <div className="absolute top-10 right-10 text-[#500050] opacity-20 font-black text-9xl rotate-12 select-none ">
        EPISODE 1
      </div>

      {/* [1. VISUAL FIDELITY] The "Gutter" - فاصله سفید بین پنل‌ها */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 pb-24">
        {articles.map((article, index) => (
          <Link
            key={article.id}
            to={`/article/${article.id}`}
            // [1. VISUAL FIDELITY] Panel Borders - خطوط ضخیم جوهری و اعوجاج جزئی
            className={`group ${comicPanelStyle} ${hardShadow} block`}
            style={{
              // ایجاد کمی بی‌نظمی در چیدمان برای حس دست‌ساز بودن
              transform: index % 2 === 0 ? "rotate(-1deg)" : "rotate(1deg)",
            }}
          >
            {/* [4. UI MAPPING] Narrator Boxes - متادیتا در جعبه‌های زرد */}
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={narratorBox}>{article.category}</div>
              <div className="bg-white border-2 border-black px-2 py-1 text-xs font-mono font-bold text-gray-600 rotate-2">
                DATE: {article.date}
              </div>
            </div>

            {/* عنوان مقاله - استایل کمیک بوک */}
            <h3
              className="text-3xl font-black text-black mb-4 uppercase leading-tight group-hover:text-[#E07000] transition-colors"
              style={{ textShadow: "2px 2px 0px #ddd" }}
            >
              {article.title}
            </h3>

            {/* خلاصه متن - فونت ماشین تحریر */}
            <p className="text-black font-mono text-sm leading-6 mb-8 border-l-4 border-[#E07000] pl-4 bg-gray-50 py-2">
              {article.excerpt}
            </p>

            {/* فوتر کارت - تگ‌ها و دکمه اکشن */}
            <div className="flex items-center justify-between border-t-2 border-dashed border-gray-300 pt-4">
              <div className="flex gap-2 flex-wrap">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold text-gray-500 bg-gray-200 px-1 border border-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* [7. INTERACTION LOGIC] دکمه ورق زدن */}
              <div className="flex items-center gap-2 text-black font-black font-mono text-sm group-hover:scale-110 transition-transform">
                <span className="uppercase">Turn Page</span>
                {/* آیکون مشت پیکسلی یا فلش */}
                <div className="w-6 h-6 bg-black flex items-center justify-center text-white clip-polygon">
                  ➜
                </div>
              </div>
            </div>

            {/* [4. UI MAPPING] Sound Effects - افکت صوتی پشت لایه */}
            <div
              className="absolute -bottom-4 -right-4 text-6xl font-black text-[#E07000] opacity-0 group-hover:opacity-100 transition-opacity duration-100 rotate-[-15deg]  z-20"
              style={{ textShadow: "3px 3px 0px #000" }}
            >
              POW!
            </div>

            {/* گوشه تا شده کاغذ */}
            <div
              className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-gray-300 to-white border-l border-t border-gray-400"
              style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
            ></div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Archive;
