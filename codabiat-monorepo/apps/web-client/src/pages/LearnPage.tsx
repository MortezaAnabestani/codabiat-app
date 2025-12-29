import React from "react";
import GlitchHeader from "../components/GlitchHeader";
import CourseCard from "../components/learning/CourseCard";
import { courses } from "../data";

const LearnPage: React.FC = () => {
  return (
    <div className="pt-20 px-6 md:px-32 min-h-screen relative z-10  pb-24">
      <div className="mb-12 pointer-events-auto">
        <GlitchHeader text="آکادمی کد" subtext="LEARNING_MODULES" />
        <p className="mt-6 text-gray-400 max-w-2xl text-lg leading-8">
          مسیر یادگیری تعاملی. با انتخاب هر دوره، وارد محیط شبیه‌سازی شده می‌شوید و می‌توانید همزمان با
          مطالعه، کدهای خود را اجرا کنید.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pointer-events-auto">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default LearnPage;
