import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Bookmark {
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
  createdAt: string;
}

const BookmarksPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:3002/api/articles/bookmark?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setBookmarks(data.data);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (articleId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3002/api/articles/bookmark?articleId=${articleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchBookmarks();
    } catch (error) {
      console.error('Error removing bookmark:', error);
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
            🔖 نشان‌های من
          </h1>
          <p className="text-xl text-cyan-300 font-bold">
            مقالاتی که نشان کرده‌اید
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
            <p className="text-3xl font-black text-gray-600 mb-4">هیچ نشانی وجود ندارد</p>
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
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark._id}
                className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                <div className="flex justify-between items-start mb-4">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/articles/${bookmark.article._id}`)}>
                    {bookmark.article.coverImage && (
                      <img
                        src={bookmark.article.coverImage}
                        alt={bookmark.article.title}
                        className="w-full h-40 object-cover border-4 border-black mb-4"
                      />
                    )}
                    <h3 className="text-2xl font-black text-black mb-2">
                      {bookmark.article.title}
                    </h3>
                    {bookmark.article.titleEn && (
                      <p className="text-sm font-bold text-gray-500 mb-2">
                        {bookmark.article.titleEn}
                      </p>
                    )}
                    <p className="text-gray-700 mb-3">{bookmark.article.excerpt}</p>

                    <div className="flex gap-2 mb-3">
                      <span className="px-3 py-1 bg-purple-200 border-2 border-black font-bold text-xs">
                        {bookmark.article.category}
                      </span>
                      <span className="px-3 py-1 bg-cyan-100 border-2 border-black font-bold text-xs">
                        ⏱️ {bookmark.article.readTime} دقیقه
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      نویسنده: {bookmark.article.author.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      نشان شده: {new Date(bookmark.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>

                  <button
                    onClick={() => removeBookmark(bookmark.article._id)}
                    className="mr-4 px-4 py-2 bg-red-500 text-white font-bold border-2 border-black
                             shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 whitespace-nowrap">
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;
