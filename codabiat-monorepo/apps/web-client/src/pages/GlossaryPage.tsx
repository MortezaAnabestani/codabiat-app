import React from "react";
/* Fix: Importing 'Glossary' as a named export because it is exported using 'export const Glossary' in its source file */
import { Glossary } from "../components/Glossary";
import GlitchHeader from "../components/GlitchHeader";

const GlossaryPage: React.FC = () => {
  return (
    <div className="pt-20 px-6 md:px-32 min-h-screen relative z-10 pb-24 flex flex-col">
      <div className="mb-8 pointer-events-auto shrink-0">
        <GlitchHeader text="فرهنگ اصطلاحات" subtext="CYBER_POETICS_LEXICON" />
        <p className="mt-4 text-gray-500 font-mono text-[10px] tracking-[0.2em] uppercase">
          An authoritative database of digital literature and creative coding concepts.
        </p>
      </div>
      <div className="flex-grow">
        <Glossary />
      </div>
    </div>
  );
};

export default GlossaryPage;
