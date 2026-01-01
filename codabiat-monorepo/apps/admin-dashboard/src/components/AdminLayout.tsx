import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import {
  LayoutDashboard,
  Users,
  Image,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'orange' },
    { path: '/users', icon: Users, label: 'کاربران', color: 'blue' },
    { path: '/artworks', icon: Image, label: 'آثار', color: 'purple' },
    { path: '/articles', icon: FileText, label: 'مقالات', color: 'green' },
    { path: '/comments', icon: MessageSquare, label: 'نظرات', color: 'yellow' },
    { path: '/settings', icon: Settings, label: 'تنظیمات', color: 'gray' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Top Header */}
      <header className="bg-black border-b-4 border-orange-600 shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          {/* Logo + Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-orange-600 border-2 border-white hover:bg-orange-700 transition-colors"
            >
              {isSidebarOpen ? (
                <X size={24} className="text-white" strokeWidth={3} />
              ) : (
                <Menu size={24} className="text-white" strokeWidth={3} />
              )}
            </button>

            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="bg-orange-600 border-4 border-white p-2">
                <Shield size={28} className="text-black" strokeWidth={3} />
              </div>
              <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tight">
                  CODABIAT ADMIN
                </h1>
                <p className="text-[10px] font-bold text-orange-400 tracking-widest">
                  CONTROL PANEL
                </p>
              </div>
            </Link>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-white">{admin?.name}</p>
              <p className="text-xs text-orange-400 uppercase">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 border-2 border-white hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <LogOut size={18} className="text-white" />
              <span className="hidden md:inline text-sm font-bold text-white uppercase">
                خروج
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'w-64' : 'w-0'
          } transition-all duration-300 overflow-hidden bg-black border-r-4 border-orange-600 min-h-screen`}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 p-3 border-4 transition-all
                    ${
                      isActive
                        ? 'bg-orange-600 border-white translate-x-2'
                        : 'bg-gray-800 border-gray-700 hover:border-orange-600 hover:translate-x-1'
                    }`}
                >
                  <div
                    className={`p-2 ${
                      isActive ? 'bg-white' : 'bg-gray-700'
                    } border-2 border-black`}
                  >
                    <item.icon
                      size={20}
                      className={isActive ? 'text-orange-600' : 'text-white'}
                      strokeWidth={2.5}
                    />
                  </div>
                  <span
                    className={`font-bold text-sm uppercase ${
                      isActive ? 'text-white' : 'text-gray-300'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
