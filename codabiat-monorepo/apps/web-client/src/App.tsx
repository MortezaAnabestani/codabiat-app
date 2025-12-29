import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Background from "./components/Background";
import ArticleReader from "./components/ArticleReader";
import Home from "./components/Home";
import { LanguageProvider } from "./LanguageContext";

// Pages
import LabPage from "./pages/LabPage";
import ArchivePage from "./pages/ArchivePage";
import AboutPage from "./pages/AboutPage";
import LearnPage from "./pages/LearnPage";
import LessonPage from "./pages/LessonPage";
import DashboardPage from "./pages/DashboardPage";
import AuthPage from "./pages/AuthPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import GlossaryPage from "./pages/GlossaryPage";

const App: React.FC = () => {
  return (
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
              <Route path="/" element={<Home />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/lab" element={<LabPage />} />
              <Route path="/glossary" element={<GlossaryPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/learn/:courseId" element={<LessonPage />} />
              <Route path="/learn/:courseId/lesson/:lessonId" element={<LessonPage />} />
              <Route path="/article/:id" element={<ArticleReader />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;
