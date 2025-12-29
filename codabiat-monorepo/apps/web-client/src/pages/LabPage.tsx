import React from "react";
import { Lab } from "../components/Lab";
import GlitchHeader from "../components/GlitchHeader";

const LabPage: React.FC = () => {
  return (
    <div className="pt-20 px-6 md:px-32 min-h-screen flex flex-col items-center relative z-10 ">
      <div className="mb-8 text-center pointer-events-auto">
        <GlitchHeader text="آزمایشگاه کُدَبی" subtext="CODABIAT_LAB" />
      </div>
      <Lab />
    </div>
  );
};

export default LabPage;
