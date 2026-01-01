import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Article {
  _id: string;
  title: string;
  titleEn?: string;
  excerpt: string;
  content: string;
  contentEn?: string;
  category: string;
  tags: string[];
  coverImage?: string;
  author: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  series?: {
    _id: string;
    title: string;
    slug: string;
    description: string;
  };
  featured: boolean;
  readTime: number;
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
  publishedAt: string;
}

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReadLater, setIsReadLater] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArticle();
      checkBookmarkStatus();
      checkReadLaterStatus();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/articles/${id}`);
      const data = await response.json();

      if (data.success) {
        setArticle(data.data.article);
        setRelatedArticles(data.data.relatedArticles || []);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBookmarkStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3002/api/articles/bookmark', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        const bookmarked = data.data.some((b: any) => b.article._id === id);
        setIsBookmarked(bookmarked);
      }
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const checkReadLaterStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3002/api/articles/readlater', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        const inList = data.data.some((r: any) => r.article._id === id);
        setIsReadLater(inList);
      }
    } catch (error) {
      console.error('Error checking read later:', error);
    }
  };

  const toggleBookmark = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('لطفاً ابتدا وارد شوید');
      navigate('/login');
      return;
    }

    try {
      if (isBookmarked) {
        await fetch(`http://localhost:3002/api/articles/bookmark?articleId=${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsBookmarked(false);
      } else {
        await fetch('http://localhost:3002/api/articles/bookmark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ articleId: id }),
        });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const toggleReadLater = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('لطفاً ابتدا وارد شوید');
      navigate('/login');
      return;
    }

    try {
      if (isReadLater) {
        await fetch(`http://localhost:3002/api/articles/readlater?articleId=${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsReadLater(false);
      } else {
        await fetch('http://localhost:3002/api/articles/readlater', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ articleId: id }),
        });
        setIsReadLater(true);
      }
    } catch (error) {
      console.error('Error toggling read later:', error);
    }
  };

  const likeArticle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('لطفاً ابتدا وارد شوید');
      navigate('/login');
      return;
    }

    try {
      await fetch(`http://localhost:3002/api/articles/${id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchArticle();
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 flex items-center justify-center">
        <div className="text-cyan-400 text-2xl">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 flex items-center justify-center">
        <div className="text-red-400 text-2xl">مقاله یافت نشد</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Article Header */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
          {/* Breadcrumbs */}
          <div className="flex gap-2 text-sm mb-4">
            <button onClick={() => navigate('/articles')} className="text-blue-600 hover:underline font-bold">
              مقالات
            </button>
            {article.series && (
              <>
                <span>/</span>
                <button
                  onClick={() => navigate(`/series/${article.series!.slug}`)}
                  className="text-blue-600 hover:underline font-bold">
                  {article.series.title}
                </button>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-5xl font-black text-black mb-3">{article.title}</h1>
          {article.titleEn && (
            <h2 className="text-3xl font-bold text-gray-600 mb-4">{article.titleEn}</h2>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 mb-4">
            {article.author.avatar && (
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-12 h-12 rounded-full border-4 border-black"
              />
            )}
            <div>
              <p className="font-black text-lg">{article.author.name}</p>
              <p className="text-sm text-gray-600">
                {new Date(article.publishedAt).toLocaleDateString('fa-IR')}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-2 flex-wrap mb-4">
            <span className="px-3 py-1 bg-purple-200 border-2 border-black font-bold">
              {article.category}
            </span>
            {article.featured && (
              <span className="px-3 py-1 bg-yellow-300 border-2 border-black font-bold">
                ⭐ ویژه
              </span>
            )}
            {article.tags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 bg-cyan-100 border-2 border-black font-bold text-sm">
                #{tag}
              </span>
            ))}
          </div>

          {/* Stats and Actions */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-4 text-sm font-bold text-gray-600">
              <span>👁️ {article.viewCount} بازدید</span>
              <span>❤️ {article.likeCount} لایک</span>
              <span>🔖 {article.bookmarkCount} نشان</span>
              <span>⏱️ {article.readTime} دقیقه مطالعه</span>
            </div>

            <div className="flex gap-2 mr-auto">
              <button
                onClick={likeArticle}
                className="px-4 py-2 bg-red-500 text-white font-bold border-2 border-black
                         shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600">
                ❤️ لایک
              </button>
              <button
                onClick={toggleBookmark}
                className={`px-4 py-2 font-bold border-2 border-black text-white
                         shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  isBookmarked ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500 hover:bg-gray-600'
                }`}>
                🔖 {isBookmarked ? 'نشان شده' : 'نشان کردن'}
              </button>
              <button
                onClick={toggleReadLater}
                className={`px-4 py-2 font-bold border-2 border-black text-white
                         shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  isReadLater ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
                }`}>
                💾 {isReadLater ? 'در لیست' : 'بعداً بخوانم'}
              </button>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {article.coverImage && (
          <div className="mb-8">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-96 object-cover border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>
        )}

        {/* Content */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
          <div className="prose max-w-none">
            <p className="text-xl font-bold italic mb-6">{article.excerpt}</p>
            <div className="whitespace-pre-wrap text-lg leading-relaxed">{article.content}</div>
            {article.contentEn && (
              <div className="mt-8 pt-8 border-t-4 border-black">
                <h3 className="text-2xl font-black mb-4">English Version</h3>
                <div className="whitespace-pre-wrap text-lg leading-relaxed">{article.contentEn}</div>
              </div>
            )}
          </div>
        </div>

        {/* Related Articles in Series */}
        {relatedArticles.length > 0 && (
          <div className="bg-gradient-to-r from-cyan-100 to-purple-100 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
            <h3 className="text-3xl font-black mb-4">مقالات مرتبط در این سری</h3>
            <div className="space-y-3">
              {relatedArticles.map((related) => (
                <div
                  key={related._id}
                  onClick={() => navigate(`/articles/${related._id}`)}
                  className="bg-white border-2 border-black p-4 cursor-pointer hover:bg-yellow-50 transition-colors">
                  <h4 className="text-lg font-black mb-1">{related.title}</h4>
                  <p className="text-sm text-gray-700">{related.excerpt}</p>
                </div>
              ))}
            </div>
            {article.series && (
              <button
                onClick={() => navigate(`/series/${article.series!.slug}`)}
                className="mt-4 px-6 py-2 bg-purple-500 text-white font-bold border-2 border-black
                         shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-purple-600">
                مشاهده تمام مقالات سری
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetailPage;
