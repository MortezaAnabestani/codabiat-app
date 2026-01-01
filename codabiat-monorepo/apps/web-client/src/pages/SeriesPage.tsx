import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Series {
  _id: string;
  title: string;
  titleEn?: string;
  description: string;
  slug: string;
  coverImage?: string;
  author: {
    name: string;
    avatar?: string;
  };
}

interface Article {
  _id: string;
  title: string;
  titleEn?: string;
  excerpt: string;
  category: string;
  coverImage?: string;
  seriesOrder?: number;
  readTime: number;
  viewCount: number;
  author: {
    name: string;
  };
}

const SeriesPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [series, setSeries] = useState<Series | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchSeries();
    }
  }, [slug]);

  const fetchSeries = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/articles/series/${slug}`);
      const data = await response.json();

      if (data.success) {
        setSeries(data.data.series);
        setArticles(data.data.articles);
      }
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 flex items-center justify-center">
        <div className="text-cyan-400 text-2xl">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 flex items-center justify-center">
        <div className="text-red-400 text-2xl">سری یافت نشد</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Series Header */}
        <div className="bg-gradient-to-r from-cyan-100 to-purple-100 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
          <div className="flex items-center gap-2 text-sm mb-4">
            <button onClick={() => navigate('/articles')} className="text-blue-600 hover:underline font-bold">
              مقالات
            </button>
            <span>/</span>
            <span className="font-bold">سری</span>
          </div>

          <div className="flex gap-8">
            {series.coverImage && (
              <img
                src={series.coverImage}
                alt={series.title}
                className="w-64 h-64 object-cover border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              />
            )}

            <div className="flex-1">
              <h1 className="text-5xl font-black text-black mb-3">{series.title}</h1>
              {series.titleEn && (
                <h2 className="text-3xl font-bold text-gray-700 mb-4">{series.titleEn}</h2>
              )}
              <p className="text-xl text-gray-800 mb-4">{series.description}</p>

              <div className="flex items-center gap-3">
                {series.author.avatar && (
                  <img
                    src={series.author.avatar}
                    alt={series.author.name}
                    className="w-10 h-10 rounded-full border-4 border-black"
                  />
                )}
                <div>
                  <p className="font-black text-lg">{series.author.name}</p>
                  <p className="text-sm text-gray-600">{articles.length} مقاله</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div>
          <h2 className="text-4xl font-black text-cyan-400 mb-6"
              style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>
            📚 مقالات این سری
          </h2>

          {articles.length === 0 ? (
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
              <p className="text-2xl font-bold text-gray-600">
                هنوز مقاله‌ای در این سری منتشر نشده است
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article, index) => (
                <div
                  key={article._id}
                  onClick={() => navigate(`/articles/${article._id}`)}
                  className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                           cursor-pointer hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                           hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all p-6">
                  <div className="flex gap-6">
                    {/* Order Number */}
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 border-4 border-black
                                  flex items-center justify-center">
                      <span className="text-3xl font-black text-white">
                        {article.seriesOrder || index + 1}
                      </span>
                    </div>

                    {/* Cover Image */}
                    {article.coverImage && (
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-48 h-32 object-cover border-4 border-black"
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-black mb-2">{article.title}</h3>
                      {article.titleEn && (
                        <p className="text-lg font-bold text-gray-600 mb-2">{article.titleEn}</p>
                      )}
                      <p className="text-gray-700 mb-3 line-clamp-2">{article.excerpt}</p>

                      <div className="flex gap-2 flex-wrap mb-2">
                        <span className="px-3 py-1 bg-purple-200 border-2 border-black font-bold text-xs">
                          {article.category}
                        </span>
                        <span className="px-3 py-1 bg-cyan-100 border-2 border-black font-bold text-xs">
                          ⏱️ {article.readTime} دقیقه
                        </span>
                        <span className="px-3 py-1 bg-gray-100 border-2 border-black font-bold text-xs">
                          👁️ {article.viewCount} بازدید
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">
                        نویسنده: {article.author.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/articles')}
            className="px-8 py-3 bg-gray-600 text-white font-black text-lg
                     border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                     hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                     transition-all">
            بازگشت به مقالات
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeriesPage;
