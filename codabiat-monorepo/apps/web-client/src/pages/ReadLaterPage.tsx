import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ReadLaterItem {
  _id: string;
  article: {
    _id: string;
    title: string;
    titleEn?: string;
    excerpt: string;
    category: string;
    coverImage?: string;
    readTime: number;
    author: {
      name: string;
    };
  };
  completed: boolean;
  createdAt: string;
}

const ReadLaterPage: React.FC = () => {
  const [items, setItems] = useState<ReadLaterItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReadLater();
  }, [filter]);

  const fetchReadLater = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      let url = 'http://localhost:3002/api/articles/readlater?limit=100';
      if (filter === 'pending') url += '&completed=false';
      if (filter === 'completed') url += '&completed=true';

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching read later:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompleted = async (articleId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3002/api/articles/readlater', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ articleId, completed: !currentStatus }),
      });
      fetchReadLater();
    } catch (error) {
      console.error('Error toggling completed:', error);
    }
  };

  const removeItem = async (articleId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3002/api/articles/readlater?articleId=${articleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchReadLater();
    } catch (error) {
      console.error('Error removing item:', error);
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4"
              style={{
                textShadow: '4px 4px 0px rgba(0,0,0,0.8)',
                WebkitTextStroke: '2px black'
              }}>
            💾 بعداً بخوانم
          </h1>
          <p className="text-xl text-cyan-300 font-bold mb-4">
            مقالاتی که برای خواندن ذخیره کرده‌اید
          </p>

          {/* Filters */}
          <div className="flex gap-3">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                          transition-all ${
                  filter === f ? 'bg-yellow-400 text-black' : 'bg-white text-black hover:bg-gray-200'
                }`}>
                {f === 'all' ? 'همه' : f === 'pending' ? 'در انتظار' : 'خوانده شده'}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
            <p className="text-3xl font-black text-gray-600 mb-4">
              {filter === 'all'
                ? 'هیچ مقاله‌ای در لیست نیست'
                : filter === 'pending'
                ? 'هیچ مقاله خوانده نشده‌ای ندارید'
                : 'هنوز هیچ مقاله‌ای نخوانده‌اید'}
            </p>
            <button
              onClick={() => navigate('/articles')}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-lg
                       border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                       hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                       transition-all">
              مرور مقالات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <div
                key={item._id}
                className={`border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 ${
                  item.completed ? 'bg-green-50' : 'bg-white'
                }`}>
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/articles/${item.article._id}`)}>
                    {item.article.coverImage && (
                      <img
                        src={item.article.coverImage}
                        alt={item.article.title}
                        className="w-full h-40 object-cover border-4 border-black mb-4"
                      />
                    )}

                    <div className="flex items-start gap-2 mb-2">
                      {item.completed && (
                        <span className="text-2xl">✓</span>
                      )}
                      <h3 className="text-2xl font-black text-black flex-1">
                        {item.article.title}
                      </h3>
                    </div>

                    {item.article.titleEn && (
                      <p className="text-sm font-bold text-gray-500 mb-2">
                        {item.article.titleEn}
                      </p>
                    )}
                    <p className="text-gray-700 mb-3">{item.article.excerpt}</p>

                    <div className="flex gap-2 mb-3">
                      <span className="px-3 py-1 bg-purple-200 border-2 border-black font-bold text-xs">
                        {item.article.category}
                      </span>
                      <span className="px-3 py-1 bg-cyan-100 border-2 border-black font-bold text-xs">
                        ⏱️ {item.article.readTime} دقیقه
                      </span>
                      {item.completed && (
                        <span className="px-3 py-1 bg-green-200 border-2 border-black font-bold text-xs">
                          ✓ خوانده شده
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600">
                      نویسنده: {item.article.author.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      افزوده شده: {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 mr-4">
                    <button
                      onClick={() => toggleCompleted(item.article._id, item.completed)}
                      className={`px-4 py-2 font-bold border-2 border-black text-white
                               shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap ${
                        item.completed
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}>
                      {item.completed ? 'خوانده نشده' : 'خوانده شد'}
                    </button>
                    <button
                      onClick={() => removeItem(item.article._id)}
                      className="px-4 py-2 bg-red-500 text-white font-bold border-2 border-black
                               shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 whitespace-nowrap">
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadLaterPage;
