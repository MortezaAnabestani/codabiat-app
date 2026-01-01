import React, { useState, useEffect } from 'react';
import { Award, Download, Calendar, CheckCircle, ExternalLink } from 'lucide-react';

interface Certificate {
  _id: string;
  certificateId: string;
  course: {
    title: string;
    coverImage?: string;
  };
  issuedAt: string;
}

const CertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3002/api/courses/certificate', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setCertificates(data.certificates || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCertificate = (cert: Certificate) => {
    // This would generate a PDF in a real implementation
    alert(`دانلود گواهینامه: ${cert.course.title}\nشناسه: ${cert.certificateId}`);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 border-b-4 border-yellow-400 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-black mb-4 drop-shadow-[4px_4px_0px_#000] flex items-center gap-4">
            <Award size={48} />
            گواهینامه‌های من
          </h1>
          <p className="text-xl">
            {certificates.length} گواهینامه کسب شده
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        {certificates.length === 0 ? (
          <div className="bg-gray-800 border-4 border-yellow-400 p-12 text-center">
            <Award className="mx-auto mb-4 text-gray-600" size={64} />
            <h2 className="text-2xl font-black mb-2">هنوز گواهینامه‌ای دریافت نکرده‌اید</h2>
            <p className="text-gray-400 mb-6">
              برای دریافت گواهینامه، یک دوره آموزشی را به پایان برسانید
            </p>
            <a
              href="/courses"
              className="inline-block px-8 py-3 bg-yellow-500 hover:bg-yellow-600 border-2 border-yellow-400 font-bold"
            >
              مشاهده دوره‌ها
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-gray-800 border-4 border-yellow-400 overflow-hidden hover:shadow-[8px_8px_0px_#eab308] transition-all"
              >
                {/* Certificate Preview */}
                <div className="relative h-48 bg-gradient-to-br from-yellow-900 to-orange-900 border-b-4 border-yellow-400 flex items-center justify-center">
                  <div className="text-center">
                    <Award className="mx-auto mb-2 text-yellow-400" size={48} />
                    <p className="text-xs text-yellow-300 font-bold">گواهینامه رسمی</p>
                  </div>
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="text-green-400" size={24} />
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg font-black mb-2 line-clamp-2">
                    {cert.course.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <Calendar size={16} />
                    <span>{formatDate(cert.issuedAt)}</span>
                  </div>

                  <div className="bg-black p-3 border-2 border-yellow-400 mb-4">
                    <p className="text-xs text-gray-400 mb-1">شناسه گواهینامه:</p>
                    <p className="text-xs text-yellow-400 font-mono break-all">
                      {cert.certificateId}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadCertificate(cert)}
                      className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 border-2 border-yellow-400 font-bold flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      دانلود
                    </button>
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 border-2 border-gray-500 font-bold flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={16} />
                      مشاهده
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="bg-white text-black border-8 border-yellow-400 max-w-4xl w-full p-12 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 left-4 px-4 py-2 bg-red-600 text-white border-2 border-red-400 font-bold"
            >
              ✕
            </button>

            {/* Certificate Design */}
            <div className="text-center">
              <div className="border-4 border-yellow-600 p-8">
                <Award className="mx-auto mb-4 text-yellow-600" size={80} />
                <h1 className="text-4xl font-black mb-8">گواهینامه تکمیل دوره</h1>

                <p className="text-xl mb-4">این گواهینامه به</p>
                <p className="text-3xl font-black mb-8 text-purple-900">
                  {JSON.parse(localStorage.getItem('user') || '{}').name || 'کاربر'}
                </p>

                <p className="text-xl mb-4">برای تکمیل موفقیت‌آمیز دوره</p>
                <p className="text-2xl font-black mb-8 text-cyan-900">
                  {selectedCert.course.title}
                </p>

                <p className="text-lg mb-4">اعطا می‌گردد</p>
                <p className="text-sm text-gray-600">
                  تاریخ صدور: {formatDate(selectedCert.issuedAt)}
                </p>

                <div className="mt-8 pt-8 border-t-2 border-gray-300">
                  <p className="text-xs text-gray-500">شناسه تأیید: {selectedCert.certificateId}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => downloadCertificate(selectedCert)}
                className="flex-1 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white border-2 border-yellow-400 font-bold"
              >
                دانلود PDF
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedCert.certificateId);
                  alert('شناسه کپی شد!');
                }}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-600 font-bold"
              >
                کپی شناسه
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
