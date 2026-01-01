import React, { useEffect, useState } from 'react';
import { Users, Image, FileText, TrendingUp, Eye, Heart, MessageSquare } from 'lucide-react';
import { adminAPI } from '../lib/api';

interface Stats {
  totalUsers: number;
  totalArtworks: number;
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  recentUsers: number;
  recentArtworks: number;
}

const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalArtworks: 0,
    totalArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    recentUsers: 0,
    recentArtworks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminAPI.getStats();
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'کاربران',
      value: stats.totalUsers,
      change: `+${stats.recentUsers} این هفته`,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-600',
    },
    {
      title: 'آثار هنری',
      value: stats.totalArtworks,
      change: `+${stats.recentArtworks} این هفته`,
      icon: Image,
      color: 'from-purple-500 to-purple-600',
      borderColor: 'border-purple-600',
    },
    {
      title: 'مقالات',
      value: stats.totalArticles,
      change: 'فعال',
      icon: FileText,
      color: 'from-green-500 to-green-600',
      borderColor: 'border-green-600',
    },
    {
      title: 'بازدیدها',
      value: stats.totalViews.toLocaleString(),
      change: 'کل',
      icon: Eye,
      color: 'from-orange-500 to-orange-600',
      borderColor: 'border-orange-600',
    },
    {
      title: 'لایک‌ها',
      value: stats.totalLikes.toLocaleString(),
      change: 'کل',
      icon: Heart,
      color: 'from-red-500 to-red-600',
      borderColor: 'border-red-600',
    },
    {
      title: 'نظرات',
      value: stats.totalComments.toLocaleString(),
      change: 'کل',
      icon: MessageSquare,
      color: 'from-yellow-500 to-yellow-600',
      borderColor: 'border-yellow-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-8 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-bold uppercase tracking-widest">LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
        <div className="flex items-center gap-4">
          <div className="bg-white border-4 border-black p-3">
            <TrendingUp size={32} className="text-orange-600" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-[2px_2px_0px_#000]">
              DASHBOARD OVERVIEW
            </h1>
            <p className="text-sm font-bold text-yellow-300 tracking-wider">
              آمار سیستم کدبیات
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${card.color} border-4 ${card.borderColor} p-6 shadow-[6px_6px_0px_#000] transform hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#000] transition-all`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-white/80 uppercase tracking-wide">
                  {card.title}
                </p>
                <p className="text-4xl font-black text-white mt-2 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
                  {card.value}
                </p>
              </div>
              <div className="bg-white/20 border-2 border-white p-3">
                <card.icon size={28} className="text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="bg-black/20 border-2 border-white/30 px-3 py-1 inline-block">
              <p className="text-xs font-bold text-white uppercase">{card.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_#000]">
          <div className="bg-blue-600 border-b-4 border-black p-4">
            <h2 className="text-xl font-black text-white uppercase">
              کاربران جدید
            </h2>
          </div>
          <div className="p-4">
            <p className="text-gray-600 text-sm">
              در حال توسعه... لیست کاربران جدید نمایش داده خواهد شد.
            </p>
          </div>
        </div>

        {/* Recent Artworks */}
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_#000]">
          <div className="bg-purple-600 border-b-4 border-black p-4">
            <h2 className="text-xl font-black text-white uppercase">
              آثار جدید
            </h2>
          </div>
          <div className="p-4">
            <p className="text-gray-600 text-sm">
              در حال توسعه... لیست آثار جدید نمایش داده خواهد شد.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
