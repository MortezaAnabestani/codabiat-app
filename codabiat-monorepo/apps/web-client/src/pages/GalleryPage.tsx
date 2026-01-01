import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, MessageSquare, Sparkles, Filter, Search } from 'lucide-react';
import api from '../lib/api';
import { useLanguage } from '../LanguageContext';
import GlitchHeader from '../components/GlitchHeader';

interface Artwork {
  _id: string;
  title: string;
  description?: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  labModule: string;
  labCategory: string;
  images?: string[];
  likes: string[];
  views: number;
  commentCount?: number;
  createdAt: string;
  tags: string[];
}

const CATEGORIES = [
  { id: 'all', label: 'همه', labelEn: 'All', color: 'text-neon-pink' },
  { id: 'narrative', label: 'روایتی', labelEn: 'Narrative', color: 'text-blue-400' },
  { id: 'text', label: 'متنی', labelEn: 'Text', color: 'text-green-400' },
  { id: 'visual', label: 'بصری', labelEn: 'Visual', color: 'text-purple-400' },
  { id: 'bio', label: 'زیستی', labelEn: 'Bio', color: 'text-yellow-400' },
  { id: 'spatial', label: 'فضایی', labelEn: 'Spatial', color: 'text-red-400' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'جدیدترین' },
  { value: '-views', label: 'پربازدیدترین' },
  { value: '-likes', label: 'محبوب‌ترین' },
];

const GalleryPage: React.FC = () => {
  const { dir } = useLanguage();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchArtworks();
  }, [selectedCategory, sortBy, page]);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const params: any = {
        published: true,
        page,
        limit: 12,
        sort: sortBy,
      };

      if (selectedCategory !== 'all') {
        params.labCategory = selectedCategory;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.artworks.getAll(params);
      setArtworks(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchArtworks();
  };

  return (
    <div className={`min-h-screen pt-24 px-4 md:px-8 pb-24 ${dir === 'rtl' ? 'font-sans' : 'font-sans-en'}`} dir={dir}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <GlitchHeader text="نمایشگاه آثار" subtext="ARTWORK_GALLERY_V2" />
        <p className="text-center text-gray-400 mt-4 font-mono text-sm">
          آثار تولید شده توسط هنرمندان الکترونیک
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-8 space-y-4">
        {/* Category Filter */}
        <div className="bg-panel-black border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter size={20} className="text-neon-pink" />
            <h3 className="text-white font-bold">دسته‌بندی</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg border-2 transition-all font-bold text-sm ${
                  selectedCategory === cat.id
                    ? `${cat.color} border-current bg-current/10`
                    : 'text-gray-500 border-white/10 hover:border-white/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Sort */}
        <div className="bg-panel-black border border-white/10 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-3 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="جستجو در آثار..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-void-black border border-white/10 rounded-lg py-3 pr-12 pl-4 text-white focus:border-neon-pink outline-none transition-all"
              dir="rtl"
            />
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSortBy(option.value);
                  setPage(1);
                }}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-bold text-sm ${
                  sortBy === option.value
                    ? 'bg-neon-pink/10 border-neon-pink text-neon-pink'
                    : 'border-white/10 text-gray-500 hover:border-white/30'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Artworks Grid */}
      {loading ? (
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-neon-pink border-t-transparent"></div>
          <p className="mt-4 text-gray-400 font-mono">LOADING...</p>
        </div>
      ) : artworks.length === 0 ? (
        <div className="max-w-7xl mx-auto text-center py-20">
          <Sparkles size={64} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">هنوز اثری منتشر نشده است</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => (
              <Link
                key={artwork._id}
                to={`/gallery/${artwork._id}`}
                className="group bg-panel-black border-2 border-white/10 rounded-xl overflow-hidden hover:border-neon-pink transition-all duration-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transform hover:scale-105"
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-purple-900 to-black overflow-hidden">
                  {artwork.images && artwork.images.length > 0 ? (
                    <img
                      src={api.upload.getFileUrl(artwork.images[0])}
                      alt={artwork.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles size={48} className="text-neon-pink/30" />
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-black/80 border border-neon-pink px-3 py-1 rounded-full">
                    <span className="text-xs font-mono text-neon-pink uppercase">
                      {artwork.labModule}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-neon-pink transition-colors">
                    {artwork.title}
                  </h3>

                  {artwork.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {artwork.description}
                    </p>
                  )}

                  {/* Author */}
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-pink to-neon-blue flex items-center justify-center text-white font-bold text-xs">
                      {artwork.author.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-bold">{artwork.author.name}</p>
                      <p className="text-gray-500 text-xs font-mono">Level {artwork.author.level}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <div className="flex items-center gap-1">
                      <Heart size={16} className="text-red-500" />
                      <span>{artwork.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={16} className="text-blue-400" />
                      <span>{artwork.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare size={16} className="text-green-400" />
                      <span>{artwork.commentCount || 0}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {artwork.tags && artwork.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {artwork.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded text-gray-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-panel-black border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-neon-pink transition-colors"
              >
                قبلی
              </button>

              <div className="flex gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all font-bold ${
                        page === pageNum
                          ? 'bg-neon-pink border-neon-pink text-black'
                          : 'border-white/10 text-gray-500 hover:border-white/30'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-panel-black border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-neon-pink transition-colors"
              >
                بعدی
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
