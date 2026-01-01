import React, { useState } from "react";
import { X, Save, Loader2, CheckCircle, Tag, FileText, Type } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { artworksAPI } from "../../lib/api";
import { useNavigate } from "react-router-dom";

interface SaveArtworkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  labModule: string; // e.g., "glitch", "neural", "cut-up"
  labCategory: "narrative" | "text" | "visual" | "bio" | "spatial" | "other";
  content: {
    text?: string;
    html?: string;
    data?: any;
  };
  screenshot?: string; // base64 or URL
}

const SaveArtworkDialog: React.FC<SaveArtworkDialogProps> = ({
  isOpen,
  onClose,
  labModule,
  labCategory,
  content,
  screenshot,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError("برای ذخیره اثر باید وارد شوید");
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    if (!title.trim()) {
      setError("لطفاً عنوان اثر را وارد کنید");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Process tags
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Prepare artwork data
      const artworkData = {
        title: title.trim(),
        description: description.trim() || undefined,
        labModule,
        labCategory,
        content,
        tags: tagArray.length > 0 ? tagArray : undefined,
        published,
        images: screenshot ? [screenshot] : undefined,
      };

      // Create artwork
      const response = await artworksAPI.create(artworkData);

      setSuccess(true);
      setTimeout(() => {
        navigate(`/gallery/${response.data._id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "خطا در ذخیره اثر");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl">
        {/* Shadow */}
        <div className="absolute inset-0 bg-black translate-x-4 translate-y-4 border-2 border-white/20"></div>

        {/* Main Panel */}
        <div className="relative bg-white border-4 border-black p-6 md:p-8 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 border-b-4 border-black pb-4 border-dashed">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic transform -skew-x-12 bg-[#E07000] text-white inline-block px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                SAVE ARTWORK
              </h2>
              <p className="text-xs font-bold mt-2 text-gray-600">
                MODULE: {labModule.toUpperCase()} | CATEGORY: {labCategory.toUpperCase()}
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              className="w-10 h-10 border-2 border-black bg-gray-200 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-[4px_4px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {success ? (
            // Success State
            <div className="text-center py-12">
              <div className="inline-block bg-green-100 border-4 border-green-600 p-6 mb-4">
                <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
                <p className="text-2xl font-black text-green-800" dir="rtl">
                  اثر با موفقیت ذخیره شد!
                </p>
                <p className="text-sm text-gray-600 mt-2" dir="rtl">
                  در حال هدایت به گالری...
                </p>
              </div>
            </div>
          ) : (
            // Form
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="relative">
                <label className="absolute -top-3 right-2 bg-[#FFCC00] border-2 border-black px-2 text-[10px] font-bold uppercase tracking-widest z-20">
                  <Type size={12} className="inline mr-1" />
                  TITLE (عنوان)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border-2 border-black px-4 py-3 text-black font-bold placeholder-gray-400 focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_#E07000] transition-all"
                  placeholder="عنوان اثر خود را وارد کنید..."
                  dir="auto"
                  required
                  disabled={loading}
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1 text-right" dir="rtl">
                  {title.length}/100
                </p>
              </div>

              {/* Description */}
              <div className="relative">
                <label className="absolute -top-3 right-2 bg-[#FFCC00] border-2 border-black px-2 text-[10px] font-bold uppercase tracking-widest z-20">
                  <FileText size={12} className="inline mr-1" />
                  DESCRIPTION (توضیحات)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border-2 border-black px-4 py-3 text-black font-bold placeholder-gray-400 focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_#E07000] transition-all resize-none"
                  placeholder="توضیحات اثر (اختیاری)..."
                  dir="auto"
                  rows={4}
                  disabled={loading}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1 text-right" dir="rtl">
                  {description.length}/500
                </p>
              </div>

              {/* Tags */}
              <div className="relative">
                <label className="absolute -top-3 right-2 bg-[#FFCC00] border-2 border-black px-2 text-[10px] font-bold uppercase tracking-widest z-20">
                  <Tag size={12} className="inline mr-1" />
                  TAGS (برچسب‌ها)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-white border-2 border-black px-4 py-3 text-black font-bold placeholder-gray-400 focus:outline-none focus:bg-yellow-50 focus:shadow-[4px_4px_0px_0px_#E07000] transition-all"
                  placeholder="glitch, experimental, persian (با کاما جدا کنید)"
                  dir="ltr"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1" dir="rtl">
                  برچسب‌ها را با کاما (,) جدا کنید
                </p>
              </div>

              {/* Published Checkbox */}
              <div className="flex items-center gap-3 border-2 border-black p-4 bg-gray-50">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-5 h-5 border-2 border-black"
                  disabled={loading}
                />
                <label htmlFor="published" className="text-sm font-bold text-black cursor-pointer" dir="rtl">
                  انتشار عمومی اثر (در گالری نمایش داده شود)
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="border-2 border-red-600 bg-red-100 p-3 text-red-800 font-bold text-sm" dir="rtl">
                  ⚠️ {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    flex-1 py-3 px-6 border-4 border-black font-black text-lg uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                    ${
                      loading
                        ? "bg-gray-400 cursor-wait translate-y-1 shadow-none"
                        : "bg-[#006000] text-white shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#E07000] active:translate-y-2 active:shadow-none"
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      SAVING...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      SAVE ARTWORK
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-3 border-4 border-black bg-gray-200 font-black text-lg uppercase tracking-widest hover:bg-gray-300 transition-colors shadow-[6px_6px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] active:shadow-none"
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}

          {/* Page Curl Effect */}
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-gray-300 to-white border-l border-t border-gray-400 shadow-lg transform origin-bottom-right"></div>
        </div>
      </div>
    </div>
  );
};

export default SaveArtworkDialog;
