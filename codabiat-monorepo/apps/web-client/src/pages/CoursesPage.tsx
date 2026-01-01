import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Clock, Users, Star, Award, ChevronRight, Search, Filter
} from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: { name: string; avatar?: string };
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  techStack: string[];
  coverImage?: string;
  rating: number;
  enrolledCount: number;
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCourses();
  }, [page, levelFilter, categoryFilter, search]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(levelFilter && { level: levelFilter }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(search && { search }),
      });

      const response = await fetch(`http://localhost:3002/api/courses?${params}`);
      const data = await response.json();

      if (data.success) {
        setCourses(data.courses || data.data || []);
        setTotalPages(data.pagination?.pages || data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: 'bg-green-600 border-green-400 text-green-100',
      intermediate: 'bg-yellow-600 border-yellow-400 text-yellow-100',
      advanced: 'bg-red-600 border-red-400 text-red-100',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-600 border-gray-400';
  };

  const getLevelLabel = (level: string) => {
    const labels = {
      beginner: 'مبتدی',
      intermediate: 'متوسط',
      advanced: 'پیشرفته',
    };
    return labels[level as keyof typeof labels] || level;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 border-b-4 border-cyan-400 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-black mb-4 drop-shadow-[4px_4px_0px_#000]">
            دوره‌های آموزشی
          </h1>
          <p className="text-xl text-gray-300">
            یادگیری ادبیات دیجیتال از صفر تا صد
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border-b-4 border-gray-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="جستجو در دوره‌ها..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pr-12 pl-4 py-3 bg-gray-700 border-2 border-cyan-400 focus:border-cyan-300 outline-none text-white"
              />
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={levelFilter}
                onChange={(e) => {
                  setLevelFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-3 bg-gray-700 border-2 border-cyan-400 focus:border-cyan-300 outline-none text-white"
              >
                <option value="">همه سطح‌ها</option>
                <option value="beginner">مبتدی</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">پیشرفته</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-3 bg-gray-700 border-2 border-cyan-400 focus:border-cyan-300 outline-none text-white"
              >
                <option value="">همه دسته‌ها</option>
                <option value="generative">تولید متن</option>
                <option value="interactive">تعاملی</option>
                <option value="hypertext">ابرمتن</option>
                <option value="code-poetry">شعر کد</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto p-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-400"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-gray-800 border-4 border-cyan-400 p-12 text-center">
            <BookOpen className="mx-auto mb-4 text-gray-600" size={64} />
            <p className="text-xl text-gray-400">دوره‌ای یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course._id}
                to={`/courses/${course._id}`}
                className="group bg-gray-800 border-4 border-cyan-400 hover:border-purple-400 transition-all hover:shadow-[8px_8px_0px_#7c3aed] overflow-hidden"
              >
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-900 to-indigo-900 overflow-hidden">
                  {course.coverImage ? (
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="text-gray-600" size={64} />
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 px-3 py-1 border-2 font-bold text-sm ${getLevelColor(course.level)}`}>
                    {getLevelLabel(course.level)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-black mb-2 line-clamp-2 group-hover:text-cyan-400 transition">
                    {course.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.techStack.slice(0, 3).map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-900 border border-purple-600 text-xs text-purple-300"
                      >
                        {tech}
                      </span>
                    ))}
                    {course.techStack.length > 3 && (
                      <span className="px-2 py-1 bg-gray-700 text-xs text-gray-400">
                        +{course.techStack.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-400" size={16} />
                      <span className="font-bold text-white">{course.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{course.enrolledCount} نفر</span>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center gap-2 pt-4 border-t-2 border-gray-700">
                    {course.instructor.avatar ? (
                      <img
                        src={course.instructor.avatar}
                        alt={course.instructor.name}
                        className="w-8 h-8 rounded-full border-2 border-cyan-400"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center border-2 border-cyan-400 font-bold text-xs">
                        {course.instructor.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm text-gray-300">{course.instructor.name}</span>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 flex items-center justify-between text-cyan-400 font-bold group-hover:text-purple-400 transition">
                    <span>شروع یادگیری</span>
                    <ChevronRight size={20} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && courses.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`px-6 py-3 border-2 font-bold ${
                page === 1
                  ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                  : 'bg-cyan-600 border-cyan-400 hover:bg-cyan-700'
              }`}
            >
              قبلی
            </button>
            <span className="px-6 py-3 bg-gray-800 border-2 border-cyan-400 font-bold">
              صفحه {page} از {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`px-6 py-3 border-2 font-bold ${
                page === totalPages
                  ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                  : 'bg-cyan-600 border-cyan-400 hover:bg-cyan-700'
              }`}
            >
              بعدی
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
