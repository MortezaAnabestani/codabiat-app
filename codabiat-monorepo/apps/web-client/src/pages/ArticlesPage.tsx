import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Article {
  _id: string;
  title: string;
  titleEn?: string;
  excerpt: string;
  category: string;
  tags: string[];
  coverImage?: string;
  author: {
    name: string;
    avatar?: string;
  };
  series?: {
    title: string;
    slug: string;
  };
  featured: boolean;
  readTime: number;
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
  publishedAt: string;
}

const ArticlesPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featured, setFeatured] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, [category]);

  const fetchArticles = async () => {
    try {
      let url = 'http://localhost:3002/api/articles?published=true&limit=50';
      if (category) url += `&category=${category}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        const allArticles = data.data;
        setFeatured(allArticles.filter((a: Article) => a.featured).slice(0, 3));
        setArticles(allArticles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchArticles();
      return;
    }

    try {
      const url = `http://localhost:3002/api/articles?published=true&search=${encodeURIComponent(search)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setArticles(data.data);
      }
    } catch (error) {
      console.error('Error searching articles:', error);
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
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4"
              style={{
                textShadow: '6px 6px 0px rgba(0,0,0,0.8)',
                WebkitTextStroke: '2px black'
              }}>
            مجله کُداب‌یات
          </h1>
          <p className="text-xl text-cyan-300 font-bold">
            مقالات تخصصی در زمینه هنر دیجیتال و ادبیات الگوریتمی
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="جستجو در مقالات..."
              className="flex-1 px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-cyan-400"
            />
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-lg
                       border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                       hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                       transition-all">
              جستجو
            </button>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-2 font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                category === '' ? 'bg-yellow-400' : 'bg-white'
              }`}>
              همه
            </button>
            {['generative', 'interactive', 'hypertext', 'code-poetry', 'other'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                  category === cat ? 'bg-yellow-400' : 'bg-white'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Articles */}
        {featured.length > 0 && (
          <div className="mb-12">
            <h2 className="text-4xl font-black text-yellow-400 mb-6"
                style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>
              ⭐ مقالات ویژه
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map((article) => (
                <div
                  key={article._id}
                  onClick={() => navigate(`/articles/${article._id}`)}
                  className="bg-gradient-to-br from-yellow-300 to-orange-300 border-4 border-black
                           shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer
                           hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                           transition-all p-6">
                  {article.coverImage && (
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-48 object-cover border-4 border-black mb-4"
                    />
                  )}
                  <h3 className="text-2xl font-black text-black mb-2">{article.title}</h3>
                  <p className="text-gray-800 mb-3">{article.excerpt}</p>
                  <div className="flex gap-2 flex-wrap mb-3">
                    <span className="px-2 py-1 bg-black text-yellow-400 font-bold text-xs">
                      {article.category}
                    </span>
                    {article.series && (
                      <span className="px-2 py-1 bg-purple-600 text-white font-bold text-xs">
                        📚 {article.series.title}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 text-sm font-bold text-gray-700">
                    <span>👁️ {article.viewCount}</span>
                    <span>❤️ {article.likeCount}</span>
                    <span>⏱️ {article.readTime} دقیقه</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Articles */}
        <div>
          <h2 className="text-4xl font-black text-cyan-400 mb-6"
              style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>
            تمام مقالات
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article._id}
                onClick={() => navigate(`/articles/${article._id}`)}
                className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                         cursor-pointer hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                         hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all p-6">
                {article.coverImage && (
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-40 object-cover border-4 border-black mb-4"
                  />
                )}

                <h3 className="text-xl font-black text-black mb-2">{article.title}</h3>
                {article.titleEn && (
                  <p className="text-sm font-bold text-gray-500 mb-2">{article.titleEn}</p>
                )}
                <p className="text-gray-700 mb-3 line-clamp-3">{article.excerpt}</p>

                <div className="flex gap-2 flex-wrap mb-3">
                  <span className="px-2 py-1 bg-purple-200 border-2 border-black font-bold text-xs">
                    {article.category}
                  </span>
                  {article.featured && (
                    <span className="px-2 py-1 bg-yellow-300 border-2 border-black font-bold text-xs">
                      ⭐ ویژه
                    </span>
                  )}
                  {article.series && (
                    <span className="px-2 py-1 bg-cyan-200 border-2 border-black font-bold text-xs">
                      📚 سری
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  {article.author.avatar && (
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="w-8 h-8 rounded-full border-2 border-black"
                    />
                  )}
                  <span className="font-bold text-sm">{article.author.name}</span>
                </div>

                <div className="flex gap-3 text-xs font-bold text-gray-600">
                  <span>👁️ {article.viewCount}</span>
                  <span>❤️ {article.likeCount}</span>
                  <span>🔖 {article.bookmarkCount}</span>
                  <span>⏱️ {article.readTime} دقیقه</span>
                </div>
              </div>
            ))}
          </div>

          {articles.length === 0 && (
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
              <p className="text-2xl font-bold text-gray-600">هیچ مقاله‌ای یافت نشد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticlesPage;
