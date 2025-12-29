import React from "react";
import Dashboard from "../components/Dashboard";
import GlitchHeader from "../components/GlitchHeader";

const DashboardPage: React.FC = () => {
  return (
    <div className="pt-20 px-6 md:px-32 min-h-screen relative z-10  pb-24">
      <div className="mb-8 pointer-events-auto">
        <GlitchHeader text="پنل کاربری" subtext="USER_DASHBOARD" />
      </div>
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
