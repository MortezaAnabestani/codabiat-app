import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Background from "./components/Background";
import ArticleReader from "./components/ArticleReader";
import Home from "./components/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import { LanguageProvider } from "./LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import LabPage from "./pages/LabPage";
import ArchivePage from "./pages/ArchivePage";
import AboutPage from "./pages/AboutPage";
import LearnPage from "./pages/LearnPage";
import LessonPage from "./pages/LessonPage";
import DashboardPage from "./pages/DashboardPage";
import AuthPage from "./pages/AuthPage";
import GlossaryPage from "./pages/GlossaryPage";
import GalleryPage from "./pages/GalleryPage";
import ArtworkDetailPage from "./pages/ArtworkDetailPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CertificatesPage from "./pages/CertificatesPage";
import ArticlesPage from "./pages/ArticlesPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import BookmarksPage from "./pages/BookmarksPage";
import ReadLaterPage from "./pages/ReadLaterPage";
import SeriesPage from "./pages/SeriesPage";
import WriterDashboard from "./pages/WriterDashboard";
import ArticleEditor from "./pages/ArticleEditor";
import SeriesManager from "./pages/SeriesManager";
import SearchPage from "./pages/SearchPage";
import RecommendationsPage from "./pages/RecommendationsPage";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <HashRouter>
        <div className="min-h-screen bg-deep-purple text-white selection:bg-neon-pink selection:text-white pb-24 overflow-hidden relative">
          {/* Background System */}
          <Background />

          {/* Global Overlays */}
          <div className="scanlines"></div>
          <div className="vignette"></div>

          <Navigation />

          {/* Main container with  to let hover pass through to background */}
          <main className="relative z-10 w-full min-h-screen">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/lab" element={<LabPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/gallery/:id" element={<ArtworkDetailPage />} />
              <Route path="/glossary" element={<GlossaryPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/learn/:courseId" element={<LessonPage />} />
              <Route path="/learn/:courseId/lesson/:lessonId" element={<LessonPage />} />
              <Route path="/article/:id" element={<ArticleReader />} />

              {/* Courses Routes */}
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/certificates" element={<CertificatesPage />} />

              {/* Blog/Articles Routes */}
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/articles/:id" element={<ArticleDetailPage />} />
              <Route path="/series/:slug" element={<SeriesPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/readlater" element={<ReadLaterPage />} />

              {/* Writer/CMS Routes */}
              <Route path="/writer/dashboard" element={<WriterDashboard />} />
              <Route path="/writer/new-article" element={<ArticleEditor />} />
              <Route path="/writer/edit/:id" element={<ArticleEditor />} />
              <Route path="/writer/series" element={<SeriesManager />} />

              {/* Search & Recommendations Routes */}
              <Route path="/search" element={<SearchPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
        </HashRouter>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
