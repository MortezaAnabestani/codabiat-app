import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Article {
  _id: string;
  title: string;
  titleEn: string;
  excerpt: string;
  category: string;
  published: boolean;
  publishedAt?: string;
  featured: boolean;
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
  readTime: number;
  createdAt: string;
  series?: {
    title: string;
    slug: string;
  };
}

const WriterDashboard: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyArticles();
  }, [filter]);

  const fetchMyArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:3002/api/articles?limit=100';

      if (filter === 'published') {
        url += '&published=true';
      } else if (filter === 'draft') {
        url += '&published=false';
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setArticles(data.data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('آیا از حذف این مقاله مطمئن هستید؟')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3002/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchMyArticles();
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3002/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ published: !currentStatus }),
      });

      if (response.ok) {
        fetchMyArticles();
      }
    } catch (error) {
      console.error('Error updating article:', error);
    }
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4"
              style={{
                textShadow: '4px 4px 0px rgba(0,0,0,0.8)',
                WebkitTextStroke: '2px black'
              }}>
            پنل نویسنده
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/writer/new-article')}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-lg
                       border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                       hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                       transition-all">
              + مقاله جدید
            </button>
            <button
              onClick={() => navigate('/writer/series')}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-lg
                       border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                       hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                       transition-all">
              مدیریت سری‌ها
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          {(['all', 'published', 'draft'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                        transition-all ${
                filter === f
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}>
              {f === 'all' ? 'همه' : f === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
            </button>
          ))}
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {articles.length === 0 ? (
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
              <p className="text-2xl font-bold text-gray-600">هیچ مقاله‌ای یافت نشد</p>
            </div>
          ) : (
            articles.map((article) => (
              <div
                key={article._id}
                className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-black mb-2">{article.title}</h3>
                    {article.titleEn && (
                      <p className="text-lg font-bold text-gray-600 mb-2">{article.titleEn}</p>
                    )}
                    <p className="text-gray-700 mb-3">{article.excerpt}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-purple-200 border-2 border-black font-bold text-sm">
                        {article.category}
                      </span>
                      {article.series && (
                        <span className="px-3 py-1 bg-cyan-200 border-2 border-black font-bold text-sm">
                          سری: {article.series.title}
                        </span>
                      )}
                      {article.featured && (
                        <span className="px-3 py-1 bg-yellow-300 border-2 border-black font-bold text-sm">
                          ⭐ ویژه
                        </span>
                      )}
                      <span className={`px-3 py-1 border-2 border-black font-bold text-sm ${
                        article.published ? 'bg-green-200' : 'bg-red-200'
                      }`}>
                        {article.published ? '✓ منتشر شده' : '✗ پیش‌نویس'}
                      </span>
                    </div>

                    <div className="flex gap-4 text-sm font-bold text-gray-600">
                      <span>👁️ {article.viewCount} بازدید</span>
                      <span>❤️ {article.likeCount} لایک</span>
                      <span>🔖 {article.bookmarkCount} نشان</span>
                      <span>⏱️ {article.readTime} دقیقه</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mr-4">
                    <button
                      onClick={() => navigate(`/writer/edit/${article._id}`)}
                      className="px-4 py-2 bg-blue-500 text-white font-bold border-2 border-black
                               shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-600 whitespace-nowrap">
                      ویرایش
                    </button>
                    <button
                      onClick={() => togglePublish(article._id, article.published)}
                      className={`px-4 py-2 text-white font-bold border-2 border-black
                               shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap ${
                        article.published ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
                      }`}>
                      {article.published ? 'پیش‌نویس کن' : 'انتشار'}
                    </button>
                    <button
                      onClick={() => deleteArticle(article._id)}
                      className="px-4 py-2 bg-red-500 text-white font-bold border-2 border-black
                               shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 whitespace-nowrap">
                      حذف
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  ایجاد: {new Date(article.createdAt).toLocaleDateString('fa-IR')}
                  {article.publishedAt && ` | انتشار: ${new Date(article.publishedAt).toLocaleDateString('fa-IR')}`}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WriterDashboard;
