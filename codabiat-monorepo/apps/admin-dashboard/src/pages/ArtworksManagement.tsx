import React, { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import {
  Image as ImageIcon,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  Heart,
  MessageSquare,
  CheckCircle,
  XCircle,
  Star,
} from 'lucide-react';

interface ArtworkData {
  _id: string;
  title: string;
  description?: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  labModule: string;
  labCategory: string;
  content: {
    text?: string;
    html?: string;
    data?: any;
  };
  images?: string[];
  tags: string[];
  published: boolean;
  featured: boolean;
  views: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

const ArtworksManagement: React.FC = () => {
  const [artworks, setArtworks] = useState<ArtworkData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchArtworks = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getArtworks({
        page,
        limit: 12,
        search,
        labCategory: categoryFilter,
        published: publishedFilter,
        featured: featuredFilter,
      });
      setArtworks(data.artworks);
      setTotalPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (error: any) {
      console.error('Error fetching artworks:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, [page, search, categoryFilter, publishedFilter, featuredFilter]);

  const handleTogglePublished = async (artworkId: string, currentStatus: boolean) => {
    try {
      await adminAPI.updateArtwork(artworkId, { published: !currentStatus });
      alert(`اثر ${!currentStatus ? 'منتشر' : 'پیش‌نویس'} شد`);
      fetchArtworks();
    } catch (error: any) {
      alert('خطا: ' + error.message);
    }
  };

  const handleToggleFeatured = async (artworkId: string, currentStatus: boolean) => {
    try {
      await adminAPI.updateArtwork(artworkId, { featured: !currentStatus });
      alert(`اثر ${!currentStatus ? 'به ویژه اضافه' : 'از ویژه حذف'} شد`);
      fetchArtworks();
    } catch (error: any) {
      alert('خطا: ' + error.message);
    }
  };

  const handleDelete = async (artworkId: string, title: string) => {
    if (!confirm(`آیا مطمئنید که می‌خواهید اثر "${title}" را حذف کنید؟`)) {
      return;
    }

    try {
      await adminAPI.deleteArtwork(artworkId);
      alert('اثر با موفقیت حذف شد');
      fetchArtworks();
    } catch (error: any) {
      alert('خطا در حذف اثر: ' + error.message);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      text: 'bg-blue-100 border-blue-600 text-blue-900',
      visual: 'bg-purple-100 border-purple-600 text-purple-900',
      narrative: 'bg-green-100 border-green-600 text-green-900',
      spatial: 'bg-orange-100 border-orange-600 text-orange-900',
      bio: 'bg-pink-100 border-pink-600 text-pink-900',
      other: 'bg-gray-100 border-gray-600 text-gray-900',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
        <div className="flex items-center gap-4">
          <div className="bg-white border-4 border-black p-3">
            <ImageIcon size={32} className="text-purple-600" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-[2px_2px_0px_#000]">
              ARTWORKS MANAGEMENT
            </h1>
            <p className="text-sm font-bold text-yellow-300 tracking-wider">
              مدیریت آثار هنری • {total} اثر
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_#000]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو عنوان، توضیحات، تگ..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 focus:border-purple-600 outline-none font-bold"
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
              className="w-full px-4 py-3 border-2 border-gray-300 focus:border-purple-600 outline-none font-bold bg-white"
            >
              <option value="">همه دسته‌ها</option>
              <option value="text">متن</option>
              <option value="visual">بصری</option>
              <option value="narrative">داستانی</option>
              <option value="spatial">فضایی</option>
              <option value="bio">زیستی</option>
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
              className="w-full px-4 py-3 border-2 border-gray-300 focus:border-purple-600 outline-none font-bold bg-white"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="true">منتشر شده</option>
              <option value="false">پیش‌نویس</option>
            </select>
          </div>
        </div>
      </div>

      {/* Artworks Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-8 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-bold uppercase">LOADING ARTWORKS...</p>
          </div>
        </div>
      ) : artworks.length === 0 ? (
        <div className="bg-white border-4 border-black p-12 text-center shadow-[6px_6px_0px_#000]">
          <ImageIcon size={64} className="text-gray-400 mx-auto mb-4" />
          <p className="text-2xl font-black text-gray-600 uppercase">اثری یافت نشد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <div
              key={artwork._id}
              className="bg-white border-4 border-black shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] hover:-translate-y-1 transition-all overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-purple-200 to-pink-200 border-b-4 border-black flex items-center justify-center overflow-hidden">
                {artwork.images && artwork.images.length > 0 ? (
                  <img
                    src={artwork.images[0]}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={64} className="text-gray-400" />
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Title & Author */}
                <h3 className="text-lg font-black text-gray-900 mb-2 line-clamp-2">
                  {artwork.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  نویسنده: <span className="font-bold">{artwork.author.name}</span>
                </p>

                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 border-2 text-xs font-bold uppercase ${getCategoryBadgeColor(artwork.labCategory)}`}>
                    {artwork.labCategory}
                  </span>
                  {artwork.featured && (
                    <span className="px-2 py-1 bg-yellow-100 border-2 border-yellow-600 text-yellow-900 text-xs font-bold uppercase flex items-center gap-1">
                      <Star size={12} />
                      ویژه
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {artwork.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={14} />
                    {artwork.likeCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    {artwork.commentCount || 0}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTogglePublished(artwork._id, artwork.published)}
                    className={`flex-1 px-3 py-2 border-2 border-black font-bold text-xs transition-colors ${
                      artwork.published
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                    }`}
                    title={artwork.published ? 'پیش‌نویس کن' : 'منتشر کن'}
                  >
                    {artwork.published ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  </button>

                  <button
                    onClick={() => handleToggleFeatured(artwork._id, artwork.featured)}
                    className={`flex-1 px-3 py-2 border-2 border-black font-bold text-xs transition-colors ${
                      artwork.featured
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                    }`}
                    title={artwork.featured ? 'حذف از ویژه' : 'اضافه به ویژه'}
                  >
                    <Star size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(artwork._id, artwork.title)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 border-2 border-black text-white font-bold text-xs transition-colors"
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && artworks.length > 0 && (
        <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_#000] flex items-center justify-between">
          <p className="text-sm font-bold text-gray-700">
            صفحه {page} از {totalPages} • {total} اثر
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
    </div>
  );
};

export default ArtworksManagement;
