import React, { useEffect, useState } from 'react';
import { adminAPI } from '../lib/api';
import {
  MessageSquare,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

interface CommentData {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  targetType: 'artwork' | 'article';
  targetId: {
    _id: string;
    title: string;
  };
  approved: boolean;
  spam: boolean;
  createdAt: string;
}

const CommentsModeration: React.FC = () => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [approvedFilter, setApprovedFilter] = useState('');
  const [spamFilter, setSpamFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getComments({
        page,
        limit: 15,
        search,
        targetType: typeFilter,
        approved: approvedFilter,
        spam: spamFilter,
      });
      setComments(data.comments);
      setTotalPages(data.pagination.pages);
      setTotal(data.pagination.total);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page, search, typeFilter, approvedFilter, spamFilter]);

  const handleToggleApproved = async (commentId: string, currentStatus: boolean) => {
    try {
      await adminAPI.updateComment(commentId, { approved: !currentStatus });
      alert(`نظر ${!currentStatus ? 'تایید' : 'رد'} شد`);
      fetchComments();
    } catch (error: any) {
      alert('خطا: ' + error.message);
    }
  };

  const handleToggleSpam = async (commentId: string, currentStatus: boolean) => {
    try {
      await adminAPI.updateComment(commentId, { spam: !currentStatus });
      alert(`نظر ${!currentStatus ? 'به عنوان spam علامت‌گذاری' : 'از spam خارج'} شد`);
      fetchComments();
    } catch (error: any) {
      alert('خطا: ' + error.message);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('آیا مطمئنید که می‌خواهید این نظر را حذف کنید؟')) {
      return;
    }

    try {
      await adminAPI.deleteComment(commentId);
      alert('نظر با موفقیت حذف شد');
      fetchComments();
    } catch (error: any) {
      alert('خطا در حذف نظر: ' + error.message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
        <div className="flex items-center gap-4">
          <div className="bg-white border-4 border-black p-3">
            <MessageSquare size={32} className="text-orange-600" strokeWidth={3} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-[2px_2px_0px_#000]">
              COMMENTS MODERATION
            </h1>
            <p className="text-sm font-bold text-yellow-300 tracking-wider">
              مدیریت نظرات • {total} نظر
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_#000]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو محتوای نظر..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 focus:border-orange-600 outline-none font-bold"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 focus:border-orange-600 outline-none font-bold bg-white"
            >
              <option value="">همه انواع</option>
              <option value="artwork">آثار هنری</option>
              <option value="article">مقالات</option>
            </select>
          </div>

          {/* Approved Filter */}
          <div>
            <select
              value={approvedFilter}
              onChange={(e) => {
                setApprovedFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 focus:border-orange-600 outline-none font-bold bg-white"
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="true">تایید شده</option>
              <option value="false">در انتظار تایید</option>
            </select>
          </div>

          {/* Spam Filter */}
          <div>
            <select
              value={spamFilter}
              onChange={(e) => {
                setSpamFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 focus:border-orange-600 outline-none font-bold bg-white"
            >
              <option value="">همه</option>
              <option value="false">عادی</option>
              <option value="true">Spam</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-8 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-bold uppercase">LOADING COMMENTS...</p>
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-white border-4 border-black p-12 text-center shadow-[6px_6px_0px_#000]">
          <MessageSquare size={64} className="text-gray-400 mx-auto mb-4" />
          <p className="text-2xl font-black text-gray-600 uppercase">نظری یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className={`bg-white border-4 border-black shadow-[6px_6px_0px_#000] hover:shadow-[8px_8px_0px_#000] transition-all ${
                comment.spam ? 'bg-red-50' : ''
              }`}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Author Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-red-200 border-2 border-black flex items-center justify-center font-black text-gray-700">
                      {comment.author.avatar ? (
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        comment.author.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Author Info */}
                    <div>
                      <p className="font-bold text-gray-900">{comment.author.name}</p>
                      <p className="text-xs text-gray-500">{comment.author.email}</p>
                      <p className="text-xs text-gray-400">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    {comment.spam && (
                      <span className="px-2 py-1 bg-red-100 border-2 border-red-600 text-red-900 text-xs font-bold uppercase flex items-center gap-1">
                        <AlertTriangle size={12} />
                        SPAM
                      </span>
                    )}
                    {comment.approved ? (
                      <span className="px-2 py-1 bg-green-100 border-2 border-green-600 text-green-900 text-xs font-bold uppercase">
                        تایید شده
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 border-2 border-yellow-600 text-yellow-900 text-xs font-bold uppercase">
                        در انتظار
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment Content */}
                <div className="mb-3 p-3 bg-gray-50 border-2 border-gray-200">
                  <p className="text-gray-800 leading-relaxed">{comment.content}</p>
                </div>

                {/* Target Info */}
                <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
                  {comment.targetType === 'artwork' ? (
                    <>
                      <ImageIcon size={16} />
                      <span>نظر روی اثر:</span>
                    </>
                  ) : (
                    <>
                      <FileText size={16} />
                      <span>نظر روی مقاله:</span>
                    </>
                  )}
                  <span className="font-bold">{comment.targetId?.title || 'نامشخص'}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t-2 border-gray-200">
                  <button
                    onClick={() => handleToggleApproved(comment._id, comment.approved)}
                    className={`flex-1 px-4 py-2 border-2 border-black font-bold text-sm transition-colors ${
                      comment.approved
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    }`}
                    title={comment.approved ? 'رد کردن' : 'تایید کردن'}
                  >
                    {comment.approved ? (
                      <>
                        <XCircle size={16} className="inline mr-2" />
                        رد کن
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} className="inline mr-2" />
                        تایید کن
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleSpam(comment._id, comment.spam)}
                    className={`flex-1 px-4 py-2 border-2 border-black font-bold text-sm transition-colors ${
                      comment.spam
                        ? 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                    title={comment.spam ? 'برداشتن از Spam' : 'علامت‌گذاری به عنوان Spam'}
                  >
                    <AlertTriangle size={16} className="inline mr-2" />
                    {comment.spam ? 'نه Spam' : 'Spam'}
                  </button>

                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 border-2 border-black text-white font-bold text-sm transition-colors"
                    title="حذف"
                  >
                    <Trash2 size={16} className="inline mr-2" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && comments.length > 0 && (
        <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_#000] flex items-center justify-between">
          <p className="text-sm font-bold text-gray-700">
            صفحه {page} از {totalPages} • {total} نظر
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

export default CommentsModeration;
