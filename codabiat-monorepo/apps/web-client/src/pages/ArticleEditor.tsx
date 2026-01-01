import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Series {
  _id: string;
  title: string;
  slug: string;
}

const ArticleEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    excerpt: '',
    content: '',
    contentEn: '',
    category: 'generative',
    tags: '',
    coverImage: '',
    series: '',
    seriesOrder: '',
    readTime: '5',
    featured: false,
  });

  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetchSeries();
    if (isEdit) {
      fetchArticle();
    }
  }, [id]);

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
    }
  };

  const fetchArticle = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3002/api/articles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        const article = data.data.article;
        setFormData({
          title: article.title || '',
          titleEn: article.titleEn || '',
          excerpt: article.excerpt || '',
          content: article.content || '',
          contentEn: article.contentEn || '',
          category: article.category || 'generative',
          tags: article.tags?.join(', ') || '',
          coverImage: article.coverImage || '',
          series: article.series?._id || '',
          seriesOrder: article.seriesOrder?.toString() || '',
          readTime: article.readTime?.toString() || '5',
          featured: article.featured || false,
        });
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        seriesOrder: formData.seriesOrder ? parseInt(formData.seriesOrder) : undefined,
        readTime: parseInt(formData.readTime),
        series: formData.series || undefined,
        published: publish,
      };

      const url = isEdit
        ? `http://localhost:3002/api/articles/${id}`
        : 'http://localhost:3002/api/articles';

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        navigate('/writer/dashboard');
      } else {
        alert('خطا در ذخیره مقاله');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('خطا در ذخیره مقاله');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-cyan-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6"
              style={{
                textShadow: '3px 3px 0px rgba(0,0,0,0.8)',
                WebkitTextStroke: '1px black'
              }}>
            {isEdit ? 'ویرایش مقاله' : 'مقاله جدید'}
          </h1>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setPreview(false)}
              className={`px-4 py-2 font-bold border-2 border-black ${
                !preview ? 'bg-yellow-400' : 'bg-gray-200'
              }`}>
              ویرایش
            </button>
            <button
              onClick={() => setPreview(true)}
              className={`px-4 py-2 font-bold border-2 border-black ${
                preview ? 'bg-yellow-400' : 'bg-gray-200'
              }`}>
              پیش‌نمایش
            </button>
          </div>

          {!preview ? (
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
              {/* Title Persian */}
              <div>
                <label className="block text-lg font-bold text-black mb-2">
                  عنوان (فارسی) *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-cyan-400"
                  required
                />
              </div>

              {/* Title English */}
              <div>
                <label className="block text-lg font-bold text-black mb-2">
                  عنوان (انگلیسی)
                </label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  className="w-full px-4 py-3 border-4 border-black font-bold text-lg focus:outline-none focus:ring-4 focus:ring-cyan-400"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-lg font-bold text-black mb-2">
                  خلاصه (حداکثر 300 کاراکتر) *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  maxLength={300}
                  rows={3}
                  className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-cyan-400"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">{formData.excerpt.length}/300 کاراکتر</p>
              </div>

              {/* Content Persian */}
              <div>
                <label className="block text-lg font-bold text-black mb-2">
                  محتوا (فارسی) *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className="w-full px-4 py-3 border-4 border-black font-mono focus:outline-none focus:ring-4 focus:ring-cyan-400"
                  required
                />
              </div>

              {/* Content English */}
              <div>
                <label className="block text-lg font-bold text-black mb-2">
                  محتوا (انگلیسی)
                </label>
                <textarea
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-3 border-4 border-black font-mono focus:outline-none focus:ring-4 focus:ring-cyan-400"
                />
              </div>

              {/* Category and Read Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-bold text-black mb-2">دسته‌بندی *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-cyan-400"
                    required>
                    <option value="generative">Generative</option>
                    <option value="interactive">Interactive</option>
                    <option value="hypertext">Hypertext</option>
                    <option value="code-poetry">Code Poetry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-bold text-black mb-2">
                    زمان مطالعه (دقیقه)
                  </label>
                  <input
                    type="number"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    min="1"
                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-lg font-bold text-black mb-2">
                  برچسب‌ها (با کاما جدا کنید)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="AI, generative, art"
                  className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-cyan-400"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-lg font-bold text-black mb-2">تصویر کاور (URL)</label>
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-cyan-400"
                />
              </div>

              {/* Series and Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-bold text-black mb-2">سری</label>
                  <select
                    value={formData.series}
                    onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-cyan-400">
                    <option value="">بدون سری</option>
                    {series.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.series && (
                  <div>
                    <label className="block text-lg font-bold text-black mb-2">ترتیب در سری</label>
                    <input
                      type="number"
                      value={formData.seriesOrder}
                      onChange={(e) => setFormData({ ...formData, seriesOrder: e.target.value })}
                      min="1"
                      className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-cyan-400"
                    />
                  </div>
                )}
              </div>

              {/* Featured */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-6 h-6 border-4 border-black"
                  />
                  <span className="text-lg font-bold text-black">مقاله ویژه</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-black text-lg
                           border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                           transition-all disabled:opacity-50">
                  {loading ? 'در حال ذخیره...' : 'ذخیره پیش‌نویس'}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-black text-lg
                           border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                           transition-all disabled:opacity-50">
                  انتشار
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/writer/dashboard')}
                  className="px-8 py-3 bg-gray-400 text-black font-black text-lg
                           border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                           hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]
                           transition-all">
                  لغو
                </button>
              </div>
            </form>
          ) : (
            <div className="prose max-w-none">
              <h1 className="text-3xl font-black">{formData.title}</h1>
              {formData.titleEn && <h2 className="text-2xl font-bold text-gray-600">{formData.titleEn}</h2>}
              {formData.coverImage && (
                <img src={formData.coverImage} alt={formData.title} className="w-full h-64 object-cover border-4 border-black" />
              )}
              <p className="text-xl italic">{formData.excerpt}</p>
              <div className="whitespace-pre-wrap">{formData.content}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;
