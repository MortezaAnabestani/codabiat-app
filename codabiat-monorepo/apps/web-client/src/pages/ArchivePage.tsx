import React from "react";
import Archive from "../components/Archive";
import GlitchHeader from "../components/GlitchHeader";

const ArchivePage: React.FC = () => {
  return (
    <div className="pt-20 px-6 md:px-32 relative z-10 ">
      <div className="mb-12 flex items-end justify-between border-b border-white/10 pb-4 pointer-events-auto">
        <GlitchHeader text="آرشیو داده" />
        <span className="font-mono text-xs text-neon-green hidden md:block">ACCESSING DATABASE...</span>
      </div>
      <Archive />
    </div>
  );
};

export default ArchivePage;
