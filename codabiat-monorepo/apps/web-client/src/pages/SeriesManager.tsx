import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Series {
  _id: string;
  title: string;
  titleEn?: string;
  description: string;
  slug: string;
  coverImage?: string;
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
}

const SeriesManager: React.FC = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    slug: '',
    coverImage: '',
  });

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/api/articles/series?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setSeries(data.data);
      }
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({ title: '', titleEn: '', description: '', slug: '', coverImage: '' });
    setEditingSeries(null);
    setShowCreateModal(true);
  };

  const openEditModal = (s: Series) => {
    setFormData({
      title: s.title,
      titleEn: s.titleEn || '',
      description: s.description,
      slug: s.slug,
      coverImage: s.coverImage || '',
    });
    setEditingSeries(s);
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const url = editingSeries
        ? `http://localhost:3002/api/articles/series/${editingSeries.slug}`
        : 'http://localhost:3002/api/articles/series';

      const response = await fetch(url, {
        method: editingSeries ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        fetchSeries();
      } else {
        const data = await response.json();
        alert(data.error || 'خطا در ذخیره سری');
      }
    } catch (error) {
      console.error('Error saving series:', error);
      alert('خطا در ذخیره سری');
    }
  };

  const deleteSeries = async (slug: string) => {
    if (!confirm('آیا از حذف این سری مطمئن هستید؟ تمام مقالات از سری خارج می‌شوند.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3002/api/articles/series/${slug}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchSeries();
      }
    } catch (error) {
      console.error('Error deleting series:', error);
    }
  };

  const generateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    setFormData({ ...formData, slug });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 flex items-center justify-center">
        <div className="text-cyan-400 text-2xl">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4"
              style={{
                textShadow: '4px 4px 0px rgba(0,0,0,0.8)',
                WebkitTextStroke: '2px black'
              }}>
            مدیریت سری‌های مقالات
          </h1>
          <div className="flex gap-4">
            <button
              onClick={openCreateModal}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-black text-lg
                       border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                       hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                       transition-all">
              + سری جدید
            </button>
            <button
              onClick={() => navigate('/writer/dashboard')}
              className="px-8 py-3 bg-gray-600 text-white font-black text-lg
                       border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                       hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                       transition-all">
              بازگشت
            </button>
          </div>
        </div>

        {/* Series List */}
        <div className="space-y-4">
          {series.length === 0 ? (
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
              <p className="text-2xl font-bold text-gray-600">هیچ سری‌ای یافت نشد</p>
            </div>
          ) : (
            series.map((s) => (
              <div
                key={s._id}
                className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-black mb-2">{s.title}</h3>
                    {s.titleEn && (
                      <p className="text-lg font-bold text-gray-600 mb-2">{s.titleEn}</p>
                    )}
                    <p className="text-gray-700 mb-3">{s.description}</p>
                    <div className="flex gap-2 mb-2">
                      <span className="px-3 py-1 bg-blue-200 border-2 border-black font-bold text-sm">
                        Slug: {s.slug}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      ایجاد: {new Date(s.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 mr-4">
                    <button
                      onClick={() => navigate(`/series/${s.slug}`)}
                      className="px-4 py-2 bg-cyan-500 text-white font-bold border-2 border-black
                               shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-cyan-600 whitespace-nowrap">
                      مشاهده
                    </button>
                    <button
                      onClick={() => openEditModal(s)}
                      className="px-4 py-2 bg-blue-500 text-white font-bold border-2 border-black
                               shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-600 whitespace-nowrap">
                      ویرایش
                    </button>
                    <button
                      onClick={() => deleteSeries(s.slug)}
                      className="px-4 py-2 bg-red-500 text-white font-bold border-2 border-black
                               shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 whitespace-nowrap">
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-3xl font-black mb-6">
                {editingSeries ? 'ویرایش سری' : 'سری جدید'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-lg font-bold text-black mb-2">عنوان (فارسی) *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (!editingSeries) generateSlug(e.target.value);
                    }}
                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold text-black mb-2">عنوان (انگلیسی)</label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold text-black mb-2">توضیحات *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold text-black mb-2">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 border-4 border-black font-mono focus:outline-none focus:ring-4 focus:ring-cyan-400"
                    required
                    disabled={!!editingSeries}
                  />
                  {editingSeries && (
                    <p className="text-sm text-gray-600 mt-1">Slug قابل تغییر نیست</p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-bold text-black mb-2">تصویر کاور (URL)</label>
                  <input
                    type="text"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-cyan-400"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-black text-lg
                             border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                             hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                             transition-all">
                    ذخیره
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-8 py-3 bg-gray-400 text-black font-black text-lg
                             border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                             hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                             transition-all">
                    لغو
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesManager;
