import React, { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import {
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Trash2,
  Edit,
  Trophy,
} from 'lucide-react';

interface UserData {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  xp: number;
  level: number;
  badges: string[];
  artworksCount: number;
  followersCount: number;
  followingCount: number;
  createdAt: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getUsers({
        page,
        limit: 10,
        search,
        role: roleFilter,
      });
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`آیا مطمئنید که می‌خواهید کاربر "${userName}" را حذف کنید؟`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      alert('کاربر با موفقیت حذف شد');
      fetchUsers();
    } catch (error: any) {
      alert('خطا در حذف کاربر: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
        <div className="flex items-center gap-4">
          <div className="bg-white border-4 border-black p-3">
            <Users size={32} className="text-blue-600" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-[2px_2px_0px_#000]">
              USERS MANAGEMENT
            </h1>
            <p className="text-sm font-bold text-yellow-300 tracking-wider">
              مدیریت کاربران سیستم • {total} کاربر
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_#000]">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="جستجو بر اساس نام یا ایمیل..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 focus:border-blue-600 outline-none font-bold"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="md:w-48">
            <div className="relative">
              <Filter
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 focus:border-blue-600 outline-none font-bold appearance-none bg-white"
              >
                <option value="">همه نقش‌ها</option>
                <option value="user">کاربر</option>
                <option value="admin">ادمین</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-bold uppercase">LOADING USERS...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white border-4 border-black p-12 text-center shadow-[6px_6px_0px_#000]">
          <Users size={64} className="text-gray-400 mx-auto mb-4" />
          <p className="text-2xl font-black text-gray-600 uppercase">
            کاربری یافت نشد
          </p>
        </div>
      ) : (
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_#000] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b-4 border-black">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-black text-white uppercase">
                    کاربر
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-black text-white uppercase">
                    نقش
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-black text-white uppercase">
                    سطح
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-black text-white uppercase">
                    آثار
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-black text-white uppercase">
                    تاریخ عضویت
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-black text-white uppercase">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user._id}
                    className={`border-b-2 border-gray-200 hover:bg-gray-50 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-black flex items-center justify-center">
                          <span className="text-white font-black text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 border-2 border-red-600 text-red-900 text-xs font-bold uppercase">
                          <Shield size={14} />
                          ادمین
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 border-2 border-blue-600 text-blue-900 text-xs font-bold uppercase">
                          <User size={14} />
                          کاربر
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-yellow-600" />
                        <span className="font-bold text-gray-900">
                          {user.level}
                        </span>
                        <span className="text-xs text-gray-600">
                          ({user.xp} XP)
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-gray-900">
                        {user.artworksCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 bg-blue-600 border-2 border-black hover:bg-blue-700 transition-colors"
                          title="ویرایش"
                        >
                          <Edit size={16} className="text-white" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id, user.name)}
                          className="p-2 bg-red-600 border-2 border-black hover:bg-red-700 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={16} className="text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-100 border-t-4 border-black p-4 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">
              صفحه {page} از {totalPages} • {total} کاربر
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-4 py-2 border-2 border-black font-bold transition-colors ${
                  page === 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-200'
                }`}
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`px-4 py-2 border-2 border-black font-bold transition-colors ${
                  page === totalPages
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-200'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
