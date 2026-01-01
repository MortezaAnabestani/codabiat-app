import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Clock, TrendingUp, BookOpen, Cpu, Image as ImageIcon } from 'lucide-react';

interface SearchResult {
  _id: string;
  title: string;
  titleEn?: string;
  excerpt?: string;
  description?: string;
  coverImage?: string;
  _contentType: 'article' | 'course' | 'artwork';
  _metadata: {
    difficulty: string;
    language: string;
    techniques: string[];
    estimatedTime: number;
    qualityScore: number;
    popularityScore: number;
  };
  author?: { name: string; avatar?: string };
  instructor?: { name: string; avatar?: string };
  creator?: { name: string; avatar?: string };
  viewCount?: number;
  likeCount?: number;
}

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);

  // Filters
  const [contentType, setContentType] = useState(searchParams.get('type') || 'all');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '');
  const [language, setLanguage] = useState(searchParams.get('language') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
    fetchSearchHistory();
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const fetchSearchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3002/api/search/history?limit=5', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSearchHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching search history:', error);
    }
  };

  const fetchSuggestions = async (q: string) => {
    try {
      const response = await fetch(`http://localhost:3002/api/search/suggestions?q=${encodeURIComponent(q)}`);
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const performSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: page.toString(),
        limit: '20',
      });

      if (contentType !== 'all') params.append('type', contentType);
      if (difficulty) params.append('difficulty', difficulty);
      if (language) params.append('language', language);
      if (sortBy) params.append('sort', sortBy);

      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`http://localhost:3002/api/search?${params.toString()}`, {
        headers,
      });
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        setTotalPages(data.pagination.totalPages);
        setSearchParams({ q: searchQuery, type: contentType, sort: sortBy });
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const clearHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('http://localhost:3002/api/search/history', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'article': return <BookOpen size={20} />;
      case 'course': return <Cpu size={20} />;
      case 'artwork': return <ImageIcon size={20} />;
      default: return <Search size={20} />;
    }
  };

  const getContentRoute = (result: SearchResult) => {
    switch (result._contentType) {
      case 'article': return `/articles/${result._id}`;
      case 'course': return `/courses/${result._id}`;
      case 'artwork': return `/gallery/${result._id}`;
      default: return '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4"
              style={{
                textShadow: '6px 6px 0px rgba(0,0,0,0.8)',
                WebkitTextStroke: '2px black'
              }}>
            🔍 جستجوی هوشمند
          </h1>
          <p className="text-xl text-cyan-300 font-bold">
            جستجوی پیشرفته در مقالات، دوره‌ها و آثار هنری
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجو کنید..."
                  className="w-full px-6 py-4 border-4 border-black font-bold text-xl focus:outline-none focus:ring-4 focus:ring-cyan-400"
                />
                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-50 max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setQuery(suggestion);
                          performSearch(suggestion);
                        }}
                        className="px-4 py-3 font-bold hover:bg-yellow-300 cursor-pointer border-b-2 border-black last:border-b-0">
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-xl
                         border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                         hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                         transition-all disabled:opacity-50">
                <Search size={24} />
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-4 bg-purple-500 text-white font-black border-4 border-black
                         shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-purple-600">
                <Filter size={24} />
              </button>
            </div>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t-4 border-black grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold mb-2">نوع محتوا</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-4 py-2 border-4 border-black font-bold">
                  <option value="all">همه</option>
                  <option value="article">مقاله</option>
                  <option value="course">دوره</option>
                  <option value="artwork">اثر هنری</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-2">سطح دشواری</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border-4 border-black font-bold">
                  <option value="">همه</option>
                  <option value="beginner">مبتدی</option>
                  <option value="intermediate">متوسط</option>
                  <option value="advanced">پیشرفته</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-2">زبان</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 border-4 border-black font-bold">
                  <option value="">همه</option>
                  <option value="fa">فارسی</option>
                  <option value="en">انگلیسی</option>
                  <option value="both">دوزبانه</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-2">مرتب‌سازی</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border-4 border-black font-bold">
                  <option value="relevance">مرتبط‌ترین</option>
                  <option value="popularity">محبوب‌ترین</option>
                  <option value="recent">جدیدترین</option>
                  <option value="quality">با کیفیت‌ترین</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && !query && (
          <div className="bg-gradient-to-r from-purple-100 to-cyan-100 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-black flex items-center gap-2">
                <Clock size={24} />
                جستجوهای اخیر
              </h3>
              <button
                onClick={clearHistory}
                className="px-4 py-2 bg-red-500 text-white font-bold border-2 border-black
                         shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600">
                پاک کردن
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {searchHistory.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(item.query);
                    performSearch(item.query);
                  }}
                  className="px-4 py-2 bg-white border-2 border-black font-bold hover:bg-yellow-200 transition-colors">
                  {item.query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
            <div className="text-3xl font-black text-gray-600">در حال جستجو...</div>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-xl font-bold text-white">
                {results.length} نتیجه برای "{searchParams.get('q')}"
              </p>
            </div>
            <div className="space-y-4">
              {results.map((result) => {
                const author = result.author || result.instructor || result.creator;
                return (
                  <div
                    key={result._id}
                    onClick={() => navigate(getContentRoute(result))}
                    className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                             cursor-pointer hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                             hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all p-6">
                    <div className="flex gap-6">
                      {result.coverImage && (
                        <img
                          src={result.coverImage}
                          alt={result.title}
                          className="w-48 h-32 object-cover border-4 border-black"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 border-2 border-black font-bold text-sm flex items-center gap-2 ${
                            result._contentType === 'article' ? 'bg-purple-200' :
                            result._contentType === 'course' ? 'bg-blue-200' : 'bg-pink-200'
                          }`}>
                            {getContentIcon(result._contentType)}
                            {result._contentType === 'article' ? 'مقاله' :
                             result._contentType === 'course' ? 'دوره' : 'اثر هنری'}
                          </span>
                          <span className="px-3 py-1 bg-yellow-200 border-2 border-black font-bold text-sm">
                            {result._metadata.difficulty === 'beginner' ? 'مبتدی' :
                             result._metadata.difficulty === 'intermediate' ? 'متوسط' : 'پیشرفته'}
                          </span>
                          <span className="px-3 py-1 bg-cyan-100 border-2 border-black font-bold text-sm">
                            ⏱️ {result._metadata.estimatedTime} دقیقه
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-black mb-2">{result.title}</h3>
                        {result.titleEn && (
                          <p className="text-lg font-bold text-gray-600 mb-2">{result.titleEn}</p>
                        )}
                        <p className="text-gray-700 mb-3 line-clamp-2">
                          {result.excerpt || result.description}
                        </p>
                        {result._metadata.techniques && result._metadata.techniques.length > 0 && (
                          <div className="flex gap-2 flex-wrap mb-2">
                            {result._metadata.techniques.slice(0, 3).map((tech, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 border border-black font-bold text-xs">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                        {author && (
                          <p className="text-sm font-bold text-gray-600">نویسنده: {author.name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPage(p);
                      performSearch();
                    }}
                    className={`px-6 py-3 font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                      p === page ? 'bg-yellow-400' : 'bg-white hover:bg-gray-200'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : query && !loading ? (
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
            <p className="text-3xl font-black text-gray-600 mb-4">
              نتیجه‌ای یافت نشد
            </p>
            <p className="text-xl text-gray-500">
              لطفاً کلمات دیگری را امتحان کنید
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchPage;
