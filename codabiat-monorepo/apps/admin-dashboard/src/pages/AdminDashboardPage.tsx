import React from "react";
import { AdminDashboard } from "../components/admin/AdminDashboard";
import GlitchHeader from "../components/GlitchHeader";

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="pt-20 px-6 md:px-32 min-h-screen relative z-10  pb-24 flex flex-col">
      <div className="mb-8 pointer-events-auto shrink-0 text-center md:text-right">
        <GlitchHeader text="پنل مدیریت" subtext="CORE_ADMIN_V4" />
      </div>
      <div className="flex-grow overflow-hidden">
        <AdminDashboard />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
