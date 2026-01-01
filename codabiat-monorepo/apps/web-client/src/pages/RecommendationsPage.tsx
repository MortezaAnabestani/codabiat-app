import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Settings, BookOpen, Cpu, Image as ImageIcon, TrendingUp } from 'lucide-react';

interface Recommendation {
  _id: string;
  title: string;
  titleEn?: string;
  excerpt?: string;
  description?: string;
  coverImage?: string;
  _contentType: 'article' | 'course' | 'artwork';
  _recommendationScore: number;
  _metadata: {
    difficulty: string;
    language: string;
    techniques: string[];
    estimatedTime: number;
  };
  author?: { name: string };
  instructor?: { name: string };
  creator?: { name: string };
}

interface UserPreferences {
  favoriteCategories: string[];
  favoriteTechniques: string[];
  preferredLanguage: string;
  difficultyLevel: string;
}

const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [contentType, setContentType] = useState<'all' | 'article' | 'course' | 'artwork'>('all');

  // Preferences form
  const [editPrefs, setEditPrefs] = useState({
    favoriteCategories: [] as string[],
    favoriteTechniques: [] as string[],
    preferredLanguage: 'fa',
    difficultyLevel: 'all',
  });

  useEffect(() => {
    fetchRecommendations();
    fetchPreferences();
  }, [contentType]);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const url = contentType === 'all'
        ? 'http://localhost:3002/api/recommendations'
        : `http://localhost:3002/api/recommendations?type=${contentType}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data);
        if (data.userPreferences) {
          setPreferences(data.userPreferences);
        }
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3002/api/preferences', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setEditPrefs({
          favoriteCategories: data.data.favoriteCategories || [],
          favoriteTechniques: data.data.favoriteTechniques || [],
          preferredLanguage: data.data.preferredLanguage || 'fa',
          difficultyLevel: data.data.difficultyLevel || 'all',
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3002/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editPrefs),
      });

      if (response.ok) {
        setShowPreferences(false);
        fetchRecommendations();
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const toggleCategory = (category: string) => {
    const current = editPrefs.favoriteCategories;
    if (current.includes(category)) {
      setEditPrefs({
        ...editPrefs,
        favoriteCategories: current.filter(c => c !== category),
      });
    } else {
      setEditPrefs({
        ...editPrefs,
        favoriteCategories: [...current, category],
      });
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'article': return <BookOpen size={20} />;
      case 'course': return <Cpu size={20} />;
      case 'artwork': return <ImageIcon size={20} />;
      default: return <Sparkles size={20} />;
    }
  };

  const getContentRoute = (result: Recommendation) => {
    switch (result._contentType) {
      case 'article': return `/articles/${result._id}`;
      case 'course': return `/courses/${result._id}`;
      case 'artwork': return `/gallery/${result._id}`;
      default: return '/';
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
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4"
              style={{
                textShadow: '6px 6px 0px rgba(0,0,0,0.8)',
                WebkitTextStroke: '2px black'
              }}>
            ✨ توصیه‌های هوشمند
          </h1>
          <p className="text-xl text-cyan-300 font-bold mb-4">
            محتوای شخصی‌سازی شده بر اساس علایق شما
          </p>

          <div className="flex gap-4 items-center">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black
                       border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                       hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                       transition-all flex items-center gap-2">
              <Settings size={20} />
              تنظیمات علایق
            </button>

            {/* Content Type Filter */}
            <div className="flex gap-2">
              {(['all', 'article', 'course', 'artwork'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setContentType(type)}
                  className={`px-4 py-3 font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                    contentType === type ? 'bg-yellow-400' : 'bg-white hover:bg-gray-200'
                  }`}>
                  {type === 'all' ? 'همه' :
                   type === 'article' ? 'مقالات' :
                   type === 'course' ? 'دوره‌ها' : 'آثار'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preferences Panel */}
        {showPreferences && (
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
            <h2 className="text-3xl font-black mb-6">تنظیمات علایق شما</h2>

            <div className="space-y-6">
              {/* Favorite Categories */}
              <div>
                <label className="block text-xl font-bold mb-3">دسته‌بندی‌های مورد علاقه</label>
                <div className="flex flex-wrap gap-3">
                  {['generative', 'interactive', 'hypertext', 'code-poetry', 'other'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-4 py-2 font-bold border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                        editPrefs.favoriteCategories.includes(cat) ? 'bg-cyan-400' : 'bg-white'
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-xl font-bold mb-3">زبان ترجیحی</label>
                <select
                  value={editPrefs.preferredLanguage}
                  onChange={(e) => setEditPrefs({ ...editPrefs, preferredLanguage: e.target.value })}
                  className="px-4 py-3 border-4 border-black font-bold">
                  <option value="fa">فارسی</option>
                  <option value="en">انگلیسی</option>
                  <option value="both">هر دو</option>
                </select>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-xl font-bold mb-3">سطح دشواری</label>
                <select
                  value={editPrefs.difficultyLevel}
                  onChange={(e) => setEditPrefs({ ...editPrefs, difficultyLevel: e.target.value })}
                  className="px-4 py-3 border-4 border-black font-bold">
                  <option value="all">همه سطوح</option>
                  <option value="beginner">مبتدی</option>
                  <option value="intermediate">متوسط</option>
                  <option value="advanced">پیشرفته</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={savePreferences}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-black
                           border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                           transition-all">
                  ذخیره
                </button>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="px-8 py-3 bg-gray-400 text-black font-black
                           border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                           transition-all">
                  لغو
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length === 0 ? (
          <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
            <p className="text-3xl font-black text-gray-600 mb-4">
              هنوز توصیه‌ای وجود ندارد
            </p>
            <p className="text-xl text-gray-500 mb-6">
              با تعامل با محتوا و تنظیم علایق خود، توصیه‌های بهتری دریافت کنید
            </p>
            <button
              onClick={() => navigate('/articles')}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black text-lg
                       border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                       hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                       transition-all">
              مرور محتوا
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => {
              const author = rec.author || rec.instructor || rec.creator;
              return (
                <div
                  key={rec._id}
                  onClick={() => navigate(getContentRoute(rec))}
                  className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                           cursor-pointer hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                           hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all p-6">
                  {rec.coverImage && (
                    <img
                      src={rec.coverImage}
                      alt={rec.title}
                      className="w-full h-40 object-cover border-4 border-black mb-4"
                    />
                  )}

                  <div className="flex gap-2 mb-3">
                    <span className={`px-3 py-1 border-2 border-black font-bold text-xs flex items-center gap-1 ${
                      rec._contentType === 'article' ? 'bg-purple-200' :
                      rec._contentType === 'course' ? 'bg-blue-200' : 'bg-pink-200'
                    }`}>
                      {getContentIcon(rec._contentType)}
                      {rec._contentType === 'article' ? 'مقاله' :
                       rec._contentType === 'course' ? 'دوره' : 'اثر'}
                    </span>
                    <span className="px-3 py-1 bg-yellow-200 border-2 border-black font-bold text-xs">
                      {rec._metadata.difficulty === 'beginner' ? 'مبتدی' :
                       rec._metadata.difficulty === 'intermediate' ? 'متوسط' : 'پیشرفته'}
                    </span>
                    <span className="px-3 py-1 bg-green-200 border-2 border-black font-bold text-xs flex items-center gap-1">
                      <TrendingUp size={14} />
                      {Math.round(rec._recommendationScore)}%
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-black mb-2">{rec.title}</h3>
                  {rec.titleEn && (
                    <p className="text-sm font-bold text-gray-500 mb-2">{rec.titleEn}</p>
                  )}
                  <p className="text-gray-700 mb-3 line-clamp-3">
                    {rec.excerpt || rec.description}
                  </p>

                  <div className="flex gap-2 mb-3">
                    <span className="px-2 py-1 bg-cyan-100 border-2 border-black font-bold text-xs">
                      ⏱️ {rec._metadata.estimatedTime} دقیقه
                    </span>
                  </div>

                  {author && (
                    <p className="text-sm font-bold text-gray-600">
                      {rec._contentType === 'course' ? 'مدرس' : 'نویسنده'}: {author.name}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
