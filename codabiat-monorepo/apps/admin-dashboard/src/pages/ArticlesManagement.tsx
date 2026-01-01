import React, { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import {
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
} from 'lucide-react';

interface ArticleData {
  _id: string;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  category: string;
  tags: string[];
  coverImage?: string;
  published: boolean;
  viewCount: number;
  createdAt: string;
}

const ArticlesManagement: React.FC = () => {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Editor modal state
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    content: '',
    contentEn: '',
    category: 'generative',
    tags: '',
    coverImage: '',
    published: false,
  });

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getArticles({
        page,
        limit: 10,
        search,
        category: categoryFilter,
        published: publishedFilter,
      });
      setArticles(data.articles);
      setTotalPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (error: any) {
      console.error('Error fetching articles:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, search, categoryFilter, publishedFilter]);

  const handleCreate = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      titleEn: '',
      content: '',
      contentEn: '',
      category: 'generative',
      tags: '',
      coverImage: '',
      published: false,
    });
    setShowEditor(true);
  };

  const handleEdit = (article: ArticleData) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      titleEn: article.titleEn || '',
      content: article.content,
      contentEn: article.contentEn || '',
      category: article.category,
      tags: article.tags.join(', '),
      coverImage: article.coverImage || '',
      published: article.published,
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    try {
      const data = {
        title: formData.title,
        titleEn: formData.titleEn,
        content: formData.content,
        contentEn: formData.contentEn,
        category: formData.category,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        coverImage: formData.coverImage,
        published: formData.published,
      };

      if (editingArticle) {
        await adminAPI.updateArticle(editingArticle._id, data);
        alert('مقاله با موفقیت ویرایش شد');
      } else {
        await adminAPI.createArticle(data);
        alert('مقاله با موفقیت ایجاد شد');
      }

      setShowEditor(false);
      fetchArticles();
    } catch (error: any) {
      alert('خطا: ' + error.message);
    }
  };

  const handleTogglePublished = async (articleId: string, currentStatus: boolean) => {
    try {
      await adminAPI.updateArticle(articleId, { published: !currentStatus });
      alert(`مقاله ${!currentStatus ? 'منتشر' : 'پیش‌نویس'} شد`);
      fetchArticles();
    } catch (error: any) {
      alert('خطا: ' + error.message);
    }
  };

  const handleDelete = async (articleId: string, title: string) => {
    if (!confirm(`آیا مطمئنید که می‌خواهید مقاله "${title}" را حذف کنید؟`)) {
      return;
    }

    try {
      await adminAPI.deleteArticle(articleId);
      alert('مقاله با موفقیت حذف شد');
      fetchArticles();
    } catch (error: any) {
      alert('خطا در حذف مقاله: ' + error.message);
    }
  };

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      generative: 'تولیدی',
      interactive: 'تعاملی',
      hypertext: 'ابرمتن',
      'code-poetry': 'شعر کد',
      other: 'سایر',
    };
    return categories[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      generative: 'bg-blue-100 border-blue-600 text-blue-900',
      interactive: 'bg-purple-100 border-purple-600 text-purple-900',
      hypertext: 'bg-green-100 border-green-600 text-green-900',
      'code-poetry': 'bg-pink-100 border-pink-600 text-pink-900',
      other: 'bg-gray-100 border-gray-600 text-gray-900',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white border-4 border-black p-3">
              <FileText size={32} className="text-blue-600" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-[2px_2px_0px_#000]">
                ARTICLES MANAGEMENT
              </h1>
              <p className="text-sm font-bold text-yellow-300 tracking-wider">
                مدیریت مقالات • {total} مقاله
              </p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="bg-yellow-400 hover:bg-yellow-500 border-4 border-black px-6 py-3 font-black text-black uppercase shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] transition-all flex items-center gap-2"
          >
            <Plus size={20} strokeWidth={3} />
            مقاله جدید
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_#000]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو عنوان، محتوا، تگ..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 focus:border-blue-600 outline-none font-bold"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 focus:border-blue-600 outline-none font-bold bg-white"
            >
              <option value="">همه دسته‌ها</option>
              <option value="generative">تولیدی</option>
              <option value="interactive">تعاملی</option>
              <option value="hypertext">ابرمتن</option>
              <option value="code-poetry">شعر کد</option>
              <option value="other">سایر</option>
            </select>
          </div>

          {/* Published Filter */}
          <div>
            <select
              value={publishedFilter}
              onChange={(e) => {
                setPublishedFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 focus:border-blue-600 outline-none font-bold bg-white"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="true">منتشر شده</option>
              <option value="false">پیش‌نویس</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-bold uppercase">LOADING ARTICLES...</p>
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white border-4 border-black p-12 text-center shadow-[6px_6px_0px_#000]">
          <FileText size={64} className="text-gray-400 mx-auto mb-4" />
          <p className="text-2xl font-black text-gray-600 uppercase">مقاله‌ای یافت نشد</p>
        </div>
      ) : (
        <div className="bg-white border-4 border-black shadow-[6px_6px_0px_#000] overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-600 border-b-4 border-black">
              <tr>
                <th className="px-4 py-3 text-right font-black text-white uppercase">عنوان</th>
                <th className="px-4 py-3 text-right font-black text-white uppercase">نویسنده</th>
                <th className="px-4 py-3 text-right font-black text-white uppercase">دسته</th>
                <th className="px-4 py-3 text-center font-black text-white uppercase">بازدید</th>
                <th className="px-4 py-3 text-center font-black text-white uppercase">وضعیت</th>
                <th className="px-4 py-3 text-center font-black text-white uppercase">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article, index) => (
                <tr
                  key={article._id}
                  className={`border-b-2 border-gray-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900">{article.title}</div>
                    {article.titleEn && (
                      <div className="text-sm text-gray-500">{article.titleEn}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{article.author.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 border-2 text-xs font-bold uppercase ${getCategoryColor(
                        article.category
                      )}`}
                    >
                      {getCategoryName(article.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-600">
                      <Eye size={14} />
                      <span className="font-bold">{article.viewCount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {article.published ? (
                      <span className="px-2 py-1 bg-green-100 border-2 border-green-600 text-green-900 text-xs font-bold uppercase">
                        منتشر شده
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 border-2 border-gray-600 text-gray-900 text-xs font-bold uppercase">
                        پیش‌نویس
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleTogglePublished(article._id, article.published)}
                        className={`px-3 py-2 border-2 border-black font-bold text-xs transition-colors ${
                          article.published
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                        }`}
                        title={article.published ? 'پیش‌نویس کن' : 'منتشر کن'}
                      >
                        {article.published ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      </button>

                      <button
                        onClick={() => handleEdit(article)}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 border-2 border-black text-white font-bold text-xs transition-colors"
                        title="ویرایش"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(article._id, article.title)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 border-2 border-black text-white font-bold text-xs transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && articles.length > 0 && (
        <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_#000] flex items-center justify-between">
          <p className="text-sm font-bold text-gray-700">
            صفحه {page} از {totalPages} • {total} مقاله
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`px-4 py-2 border-2 border-black font-bold transition-colors ${
                page === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-200'
              }`}
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 border-2 border-black font-bold transition-colors ${
                page === totalPages
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-200'
              }`}
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_#000] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-blue-600 border-b-4 border-black p-4 flex items-center justify-between sticky top-0">
              <h2 className="text-2xl font-black text-white uppercase">
                {editingArticle ? 'ویرایش مقاله' : 'مقاله جدید'}
              </h2>
              <button
                onClick={() => setShowEditor(false)}
                className="bg-white hover:bg-gray-200 border-2 border-black p-2"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block font-bold text-gray-700 mb-2">عنوان (فارسی) *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-blue-600 outline-none font-bold"
                  placeholder="عنوان مقاله..."
                />
              </div>

              {/* Title EN */}
              <div>
                <label className="block font-bold text-gray-700 mb-2">عنوان (English)</label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-blue-600 outline-none"
                  placeholder="Article title..."
                />
              </div>

              {/* Content (Markdown) */}
              <div>
                <label className="block font-bold text-gray-700 mb-2">محتوا (Markdown) *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-blue-600 outline-none font-mono text-sm"
                  placeholder="# عنوان&#10;&#10;محتوای مقاله به زبان فارسی..."
                />
              </div>

              {/* Content EN */}
              <div>
                <label className="block font-bold text-gray-700 mb-2">محتوا (English Markdown)</label>
                <textarea
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-blue-600 outline-none font-mono text-sm"
                  placeholder="# Title&#10;&#10;Article content in English..."
                />
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-2">دسته‌بندی *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:border-blue-600 outline-none font-bold bg-white"
                  >
                    <option value="generative">تولیدی</option>
                    <option value="interactive">تعاملی</option>
                    <option value="hypertext">ابرمتن</option>
                    <option value="code-poetry">شعر کد</option>
                    <option value="other">سایر</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">تگ‌ها (با کاما جدا کنید)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 focus:border-blue-600 outline-none"
                    placeholder="ادبیات, دیجیتال, ..."
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block font-bold text-gray-700 mb-2">تصویر کاور (URL)</label>
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 focus:border-blue-600 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Published */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-5 h-5 border-2 border-black"
                />
                <label htmlFor="published" className="font-bold text-gray-700">
                  مقاله منتشر شود
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 border-t-4 border-black p-4 flex gap-2 justify-end">
              <button
                onClick={() => setShowEditor(false)}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 border-2 border-black font-bold uppercase"
              >
                لغو
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 border-2 border-black text-white font-bold uppercase flex items-center gap-2"
              >
                <Save size={18} />
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlesManagement;
