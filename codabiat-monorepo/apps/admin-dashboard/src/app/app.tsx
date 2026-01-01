import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from '../contexts/AdminAuthContext';
import AdminLogin from '../components/AdminLogin';
import AdminLayout from '../components/AdminLayout';
import DashboardOverview from '../pages/DashboardOverview';
import UsersManagement from '../pages/UsersManagement';
import ArtworksManagement from '../pages/ArtworksManagement';
import ArticlesManagement from '../pages/ArticlesManagement';
import CommentsModeration from '../pages/CommentsModeration';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-8 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-bold uppercase tracking-widest">LOADING...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={<AdminLogin />} />

      {/* Protected Admin Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <DashboardOverview />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <UsersManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/artworks"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <ArtworksManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/articles"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <ArticlesManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/comments"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <CommentsModeration />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <div className="text-white text-2xl font-bold">Settings (Coming Soon)</div>
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Main App Component
export function App() {
  return (
    <AdminAuthProvider>
      <AppRoutes />
    </AdminAuthProvider>
  );
}

export default App;
