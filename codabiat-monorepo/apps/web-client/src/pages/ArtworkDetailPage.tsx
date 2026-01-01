import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Eye, MessageSquare, ArrowLeft, Send, Trash2, Edit } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../LanguageContext';

interface Artwork {
  _id: string;
  title: string;
  description?: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    level: number;
    xp: number;
    bio?: string;
  };
  labModule: string;
  labCategory: string;
  content: {
    text?: string;
    html?: string;
    data?: any;
  };
  images?: string[];
  audio?: string[];
  video?: string;
  likes: string[];
  views: number;
  comments: {
    _id: string;
    user: {
      _id: string;
      name: string;
      avatar?: string;
      level: number;
    };
    text: string;
    createdAt: string;
  }[];
  tags: string[];
  createdAt: string;
}

const ArtworkDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { dir } = useLanguage();

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArtwork();
    }
  }, [id]);

  useEffect(() => {
    if (artwork && user) {
      setIsLiked(artwork.likes.includes(user.id));
    }
  }, [artwork, user]);

  const fetchArtwork = async () => {
    try {
      setLoading(true);
      const response = await api.artworks.getById(id!);
      setArtwork(response.data);
    } catch (error) {
      console.error('Failed to fetch artwork:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.artworks.toggleLike(id!);
      setIsLiked(response.liked);

      // Update local state
      if (artwork) {
        const newLikes = response.liked
          ? [...artwork.likes, user!.id]
          : artwork.likes.filter((userId) => userId !== user!.id);

        setArtwork({ ...artwork, likes: newLikes });
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await api.artworks.addComment(id!, commentText);

      // Update local state with new comments
      if (artwork) {
        setArtwork({ ...artwork, comments: response.data });
      }

      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-neon-pink border-t-transparent mb-4"></div>
          <p className="text-gray-400 font-mono">LOADING ARTWORK...</p>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">اثر یافت نشد</p>
          <Link to="/gallery" className="text-neon-pink hover:underline">
            بازگشت به نمایشگاه
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && artwork.author._id === user.id;

  return (
    <div className={`min-h-screen pt-24 px-4 md:px-8 pb-24 ${dir === 'rtl' ? 'font-sans' : 'font-sans-en'}`} dir={dir}>
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link
          to="/gallery"
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-panel-black border border-white/10 rounded-lg text-white hover:border-neon-pink transition-colors"
        >
          <ArrowLeft size={20} />
          <span>بازگشت به نمایشگاه</span>
        </Link>

        {/* Main Content */}
        <div className="bg-panel-black border-2 border-white/20 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 to-black border-b-4 border-neon-pink p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{artwork.title}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 bg-neon-pink/20 border border-neon-pink rounded-full text-neon-pink text-sm font-mono uppercase">
                    {artwork.labModule}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-400 rounded-full text-blue-400 text-sm">
                    {artwork.labCategory}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {isOwner && (
                <div className="flex gap-2">
                  <button className="p-2 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-500 hover:bg-yellow-500 hover:text-black transition-colors">
                    <Edit size={20} />
                  </button>
                  <button className="p-2 bg-red-500/20 border border-red-500 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Author */}
            <Link
              to={`/users/${artwork.author._id}`}
              className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-lg p-3 hover:border-neon-pink transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-pink to-neon-blue flex items-center justify-center text-white font-bold text-lg">
                {artwork.author.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">{artwork.author.name}</p>
                <p className="text-gray-400 text-sm font-mono">
                  Level {artwork.author.level} · {artwork.author.xp} XP
                </p>
              </div>
            </Link>
          </div>

          {/* Media */}
          {artwork.images && artwork.images.length > 0 && (
            <div className="border-b-2 border-white/10">
              <img
                src={api.upload.getFileUrl(artwork.images[0])}
                alt={artwork.title}
                className="w-full max-h-[600px] object-contain bg-black"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 border-b-2 border-white/10">
            {artwork.description && (
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">{artwork.description}</p>
            )}

            {artwork.content.text && (
              <div className="bg-void-black border border-white/10 rounded-lg p-6 font-mono text-sm text-gray-300 whitespace-pre-wrap">
                {artwork.content.text}
              </div>
            )}

            {artwork.content.html && (
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: artwork.content.html }}
              />
            )}

            {/* Tags */}
            {artwork.tags && artwork.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {artwork.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400 text-sm hover:border-neon-pink hover:text-neon-pink transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats & Like */}
          <div className="p-6 bg-black/40 border-b-2 border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-400">
                <Eye size={20} className="text-blue-400" />
                <span className="font-mono">{artwork.views} بازدید</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MessageSquare size={20} className="text-green-400" />
                <span className="font-mono">{artwork.comments.length} نظر</span>
              </div>
            </div>

            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 ${
                isLiked
                  ? 'bg-red-500 text-white border-2 border-red-300'
                  : 'bg-white/5 border-2 border-white/20 text-gray-400 hover:border-red-500 hover:text-red-500'
              }`}
            >
              <Heart size={20} className={isLiked ? 'fill-current' : ''} />
              <span>{artwork.likes.length}</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="p-6">
            <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
              <MessageSquare className="text-green-400" />
              نظرات ({artwork.comments.length})
            </h3>

            {/* Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleComment} className="mb-8">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="نظر خود را بنویسید..."
                  className="w-full bg-void-black border border-white/10 rounded-lg p-4 text-white focus:border-neon-pink outline-none transition-all resize-none"
                  rows={3}
                  maxLength={500}
                  dir="rtl"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-500 text-sm font-mono">{commentText.length}/500</span>
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submittingComment}
                    className="flex items-center gap-2 px-6 py-2 bg-neon-pink text-black rounded-lg font-bold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                    ارسال
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-center">
                برای نظر دادن{' '}
                <Link to="/login" className="underline font-bold">
                  وارد شوید
                </Link>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {artwork.comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">هنوز نظری ثبت نشده است</p>
              ) : (
                artwork.comments.map((comment) => (
                  <div key={comment._id} className="bg-void-black border border-white/10 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {comment.user.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-white font-bold">{comment.user.name}</p>
                            <p className="text-gray-500 text-xs font-mono">
                              Level {comment.user.level} ·{' '}
                              {new Date(comment.createdAt).toLocaleDateString('fa-IR')}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-300 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetailPage;
