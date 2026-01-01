import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Shield, Lock, Mail } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Comix Zone Style Card */}
        <div className="bg-white border-8 border-black shadow-[12px_12px_0px_#000] transform hover:shadow-[16px_16px_0px_#000] transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 border-b-8 border-black p-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9ImJsYWNrIi8+PC9zdmc+')]"></div>
            <div className="relative flex items-center justify-center gap-3">
              <div className="bg-black border-4 border-white p-3 rotate-3">
                <Shield size={32} className="text-yellow-400" strokeWidth={3} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-[4px_4px_0px_#000]">
                  ADMIN ZONE
                </h1>
                <p className="text-xs font-bold text-yellow-300 tracking-widest">
                  RESTRICTED ACCESS
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-black uppercase text-black mb-2">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Mail size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-4 border-black focus:border-orange-600 outline-none font-bold text-black placeholder-gray-400"
                    placeholder="admin@codabiat.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-black uppercase text-black mb-2">
                  PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-4 border-black focus:border-orange-600 outline-none font-bold text-black"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border-4 border-red-600 p-4">
                  <p className="text-sm font-bold text-red-900 uppercase">
                    ⚠ {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 font-black text-lg uppercase border-4 border-black shadow-[4px_4px_0px_#000] transition-all
                  ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:translate-y-1 active:shadow-none'
                  }
                  text-white`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    AUTHENTICATING...
                  </span>
                ) : (
                  '🔒 ACCESS ADMIN PANEL'
                )}
              </button>
            </form>

            {/* Warning */}
            <div className="mt-6 bg-yellow-100 border-4 border-yellow-600 p-4">
              <p className="text-xs font-bold text-yellow-900 text-center">
                ⚡ AUTHORIZED PERSONNEL ONLY ⚡
              </p>
            </div>
          </div>
        </div>

        {/* Comic Credits */}
        <div className="mt-4 text-center">
          <p className="text-sm font-bold text-white opacity-80 tracking-widest">
            CODABIAT ADMIN SYSTEM v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
