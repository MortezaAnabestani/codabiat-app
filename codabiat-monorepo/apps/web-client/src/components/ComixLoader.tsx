import React from "react";

interface ComixLoaderProps {
  text?: string;
}

export const ComixLoader: React.FC<ComixLoaderProps> = ({ text = "LOADING..." }) => {
  return (
    <div className="fixed inset-0 z-[300] bg-black flex items-center justify-center">
      {/* Comic Panel Frame */}
      <div className="relative">
        {/* Main Panel */}
        <div className="bg-white border-8 border-black p-8 shadow-[12px_12px_0px_rgba(0,0,0,1)] transform rotate-1">
          {/* GIF Container with Comic Border */}
          <div className="relative border-4 border-black bg-yellow-400 p-2">
            <img
              src="/gifs/comix_zone_1.gif"
              alt="Loading"
              className="w-64 h-64 object-cover"
              style={{ imageRendering: "pixelated" }}
            />

            {/* Speed Lines Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,transparent_45%,rgba(255,255,255,0.8)_50%,transparent_55%,transparent_100%)] animate-[slide_1s_linear_infinite]"></div>
          </div>

          {/* Loading Text with Comic Font */}
          <div className="mt-4 text-center">
            <h2 className="text-4xl font-black text-black tracking-tighter italic transform -skew-x-12">
              {text}
            </h2>
            {/* Dots Animation */}
            <div className="flex justify-center gap-2 mt-2">
              <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        </div>

        {/* Comic Effect Bubbles */}
        <div className="absolute -top-8 -right-8 bg-yellow-400 border-4 border-black px-4 py-2 rounded-full shadow-[4px_4px_0px_rgba(0,0,0,1)] transform rotate-12">
          <span className="font-black text-xl text-black">POW!</span>
        </div>
      </div>

      <style>{`
        @keyframes slide {
          from { background-position: 0 0; }
          to { background-position: 100px 0; }
        }
      `}</style>
    </div>
  );
};
