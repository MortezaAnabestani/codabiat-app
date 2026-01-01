import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  BookOpen, Clock, Award, CheckCircle, PlayCircle,
  Code, Trophy, Download, Lock, Star
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  content: string;
  codeExample?: string;
  duration: number;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: { name: string; avatar?: string };
  level: string;
  techStack: string[];
  modules: Module[];
  coverImage?: string;
  rating: number;
  enrolledCount: number;
}

interface Progress {
  modules: Array<{
    moduleId: string;
    lessons: Array<{ lessonId: string; completed: boolean }>;
  }>;
  overallProgress: number;
  certificateIssued: boolean;
}

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSandbox, setShowSandbox] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchProgress();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/courses/${id}`);
      const data = await response.json();
      if (data.success) {
        setCourse(data.data);
        if (data.data.modules[0]?.lessons[0]) {
          setSelectedLesson(data.data.modules[0].lessons[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `http://localhost:3002/api/courses/progress?courseId=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success && data.progress) {
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const markLessonComplete = async (moduleId: string, lessonId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('لطفاً ابتدا وارد شوید');
        return;
      }

      const response = await fetch('http://localhost:3002/api/courses/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: id, moduleId, lessonId }),
      });

      const data = await response.json();
      if (data.success) {
        setProgress(data.progress);
        if (data.progress.overallProgress === 100) {
          alert('🎉 تبریک! دوره را با موفقیت تکمیل کردید!');
        }
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const isLessonCompleted = (moduleId: string, lessonId: string) => {
    if (!progress) return false;
    const module = progress.modules.find((m) => m.moduleId === moduleId);
    if (!module) return false;
    const lesson = module.lessons.find((l) => l.lessonId === lessonId);
    return lesson?.completed || false;
  };

  const requestCertificate = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3002/api/courses/certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: id }),
      });

      const data = await response.json();
      if (data.success) {
        alert('گواهینامه شما آماده است!');
        setProgress({ ...progress!, certificateIssued: true });
      }
    } catch (error) {
      console.error('Error requesting certificate:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-400"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="min-h-screen bg-gray-900 text-white p-8">دوره یافت نشد</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 border-b-4 border-cyan-400 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-6">
            {course.coverImage && (
              <img
                src={course.coverImage}
                alt={course.title}
                className="w-32 h-32 object-cover border-4 border-cyan-400"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-black mb-2">{course.title}</h1>
              <p className="text-gray-300 mb-4">{course.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Award className="text-yellow-400" size={16} />
                  {course.instructor.name}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="text-yellow-400" size={16} />
                  {course.rating.toFixed(1)}
                </span>
                <span className="px-3 py-1 bg-cyan-600 border-2 border-cyan-400 font-bold">
                  {course.level}
                </span>
              </div>
              {progress && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">پیشرفت شما</span>
                    <span className="text-cyan-400 font-bold">{progress.overallProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 h-4 border-2 border-cyan-400">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                      style={{ width: `${progress.overallProgress}%` }}
                    ></div>
                  </div>
                  {progress.overallProgress === 100 && !progress.certificateIssued && (
                    <button
                      onClick={requestCertificate}
                      className="mt-4 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 border-2 border-yellow-400 font-bold flex items-center gap-2"
                    >
                      <Trophy size={20} />
                      دریافت گواهینامه
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Modules */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 border-4 border-cyan-400 p-4">
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <BookOpen />
                سرفصل‌ها
              </h2>
              <div className="space-y-2">
                {course.modules.map((module) => (
                  <div key={module.id} className="border-2 border-gray-700">
                    <div className="bg-gray-700 p-3 font-bold">{module.title}</div>
                    <div className="divide-y-2 divide-gray-700">
                      {module.lessons.map((lesson) => {
                        const completed = isLessonCompleted(module.id, lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson)}
                            className={`w-full text-right p-3 hover:bg-gray-700 transition flex items-center justify-between ${
                              selectedLesson?.id === lesson.id ? 'bg-cyan-900' : ''
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {completed ? (
                                <CheckCircle className="text-green-400" size={16} />
                              ) : (
                                <PlayCircle className="text-gray-400" size={16} />
                              )}
                              {lesson.title}
                            </span>
                            <span className="text-xs text-gray-400">{lesson.duration} دقیقه</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="space-y-6">
                {/* Lesson Content */}
                <div className="bg-gray-800 border-4 border-cyan-400 p-6">
                  <h2 className="text-2xl font-black mb-4">{selectedLesson.title}</h2>
                  <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                  />
                </div>

                {/* Code Example */}
                {selectedLesson.codeExample && (
                  <div className="bg-gray-800 border-4 border-purple-500 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-black flex items-center gap-2">
                        <Code />
                        مثال کد
                      </h3>
                      <button
                        onClick={() => setShowSandbox(!showSandbox)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 border-2 border-purple-400 font-bold"
                      >
                        {showSandbox ? 'بستن Sandbox' : 'اجرای Sandbox'}
                      </button>
                    </div>
                    <pre className="bg-black p-4 border-2 border-purple-400 overflow-x-auto">
                      <code className="text-green-400">{selectedLesson.codeExample}</code>
                    </pre>
                  </div>
                )}

                {/* Sandbox */}
                {showSandbox && selectedLesson.codeExample && (
                  <div className="bg-gray-800 border-4 border-yellow-500 p-6">
                    <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                      <Code className="text-yellow-400" />
                      Sandbox - کد خود را تمرین کنید
                    </h3>
                    <CodeSandbox code={selectedLesson.codeExample} />
                  </div>
                )}

                {/* Complete Button */}
                <button
                  onClick={() => {
                    const module = course.modules.find((m) =>
                      m.lessons.some((l) => l.id === selectedLesson.id)
                    );
                    if (module) {
                      markLessonComplete(module.id, selectedLesson.id);
                    }
                  }}
                  disabled={isLessonCompleted(
                    course.modules.find((m) => m.lessons.some((l) => l.id === selectedLesson.id))
                      ?.id || '',
                    selectedLesson.id
                  )}
                  className={`w-full py-4 font-black text-lg border-4 ${
                    isLessonCompleted(
                      course.modules.find((m) => m.lessons.some((l) => l.id === selectedLesson.id))
                        ?.id || '',
                      selectedLesson.id
                    )
                      ? 'bg-green-600 border-green-400 cursor-not-allowed'
                      : 'bg-cyan-600 hover:bg-cyan-700 border-cyan-400'
                  }`}
                >
                  {isLessonCompleted(
                    course.modules.find((m) => m.lessons.some((l) => l.id === selectedLesson.id))
                      ?.id || '',
                    selectedLesson.id
                  )
                    ? '✓ تکمیل شد'
                    : 'علامت‌گذاری به عنوان تکمیل شده'}
                </button>
              </div>
            ) : (
              <div className="bg-gray-800 border-4 border-cyan-400 p-12 text-center">
                <Lock className="mx-auto mb-4 text-gray-600" size={64} />
                <p className="text-xl text-gray-400">یک درس را انتخاب کنید</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Code Sandbox Component
const CodeSandbox: React.FC<{ code: string }> = ({ code }) => {
  const [userCode, setUserCode] = useState(code);
  const [output, setOutput] = useState('');

  const runCode = () => {
    try {
      const logs: string[] = [];
      const customConsole = {
        log: (...args: any[]) => logs.push(args.join(' ')),
      };

      // eslint-disable-next-line no-new-func
      const func = new Function('console', userCode);
      func(customConsole);

      setOutput(logs.join('\n') || 'کد با موفقیت اجرا شد!');
    } catch (error: any) {
      setOutput(`❌ خطا: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={userCode}
        onChange={(e) => setUserCode(e.target.value)}
        className="w-full h-64 bg-black text-green-400 p-4 border-2 border-yellow-400 font-mono resize-none"
      />
      <button
        onClick={runCode}
        className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 border-2 border-yellow-400 font-bold"
      >
        ▶ اجرای کد
      </button>
      {output && (
        <div className="bg-black p-4 border-2 border-yellow-400">
          <div className="text-xs text-gray-400 mb-2">خروجی:</div>
          <pre className="text-cyan-400">{output}</pre>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;
