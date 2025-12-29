
import { Article, Course } from './types';

export const articles: Article[] = [
  {
    id: '1',
    title: 'زیبایی‌شناسی خطا: گلیچ آرت در وب',
    category: 'Theory',
    excerpt: 'چگونه خطاهای برنامه‌نویسی را به عناصر بصری در طراحی وب تبدیل کنیم؟ بررسی فنی و هنری.',
    date: '۱۴۰۲/۱۲/۱۵',
    tags: ['CSS', 'Glitch', 'Art']
  },
  {
    id: '2',
    title: 'تایپوگرافی مولد با جاوااسکریپت',
    category: 'Programming',
    excerpt: 'ساخت فونت‌هایی که با حرکت موس تغییر شکل می‌دهند. یک رویکرد تعاملی به خط فارسی.',
    date: '۱۴۰۳/۰۱/۱۰',
    tags: ['Canvas', 'Typography', 'Interactive']
  },
  {
    id: '3',
    title: 'ادبیات ارگودیک: وقتی خواننده نویسنده می‌شود',
    category: 'E-Lit',
    excerpt: 'تحلیلی بر آثار تعاملی و غیرخطی در فضای وب فارسی.',
    date: '۱۴۰۳/۰۲/۰۵',
    tags: ['Literature', 'Theory']
  },
   {
    id: '4',
    title: 'مرگ مولف در عصر هوش مصنوعی',
    category: 'Theory',
    excerpt: 'آیا GPT-4 می‌تواند شاعر باشد؟ بررسی فلسفی خلاقیت ماشینی.',
    date: '۱۴۰۳/۰۳/۱۲',
    tags: ['AI', 'Philosophy']
  }
];

export const courses: Course[] = [
  {
    id: 'ts-mastery',
    title: 'تایپ‌اسکریپت: از صفر تا معماری',
    description: 'یادگیری سیستم تایپینگ جاوااسکریپت برای نوشتن کدهای امن و مقیاس‌پذیر. مناسب برای توسعه‌دهندگان فرانت‌اند.',
    level: 'Intermediate',
    icon: 'FileCode',
    techStack: ['TypeScript', 'Node.js'],
    modules: [
      {
        id: 'm1',
        title: 'مبانی تایپ‌ها',
        lessons: [
          {
            id: 'l1',
            title: 'چرا تایپ‌اسکریپت؟',
            content: 'تایپ‌اسکریپت یک سوپراست برای جاوااسکریپت است که استاتیک تایپینگ را به زبان اضافه می‌کند. در این درس با انواع داده‌های پایه آشنا می‌شویم.',
            initialCode: `// یک متغیر با تایپ صریح تعریف کنید
let message: string = "Hello World";
let count: number = 42;

// سعی کنید خط زیر را از کامنت خارج کنید تا خطا را ببینید
// message = 100;

console.log(message, count);`,
            challenge: 'متغیری به نام `isActive` از نوع boolean تعریف کنید و مقدار true به آن بدهید.'
          },
          {
            id: 'l2',
            title: 'اینترفیس‌ها و تایپ‌ها',
            content: 'تفاوت بین interface و type چیست؟ چگونه اشیاء پیچیده را مدل‌سازی کنیم؟',
            initialCode: `interface User {
  id: number;
  username: string;
  email?: string; // اختیاری
}

const newUser: User = {
  id: 1,
  username: "ali_dev"
};

console.log(newUser);`,
            challenge: 'یک اینترفیس برای `Product` بسازید که دارای نام، قیمت و موجودی باشد.'
          }
        ]
      }
    ]
  },
  {
    id: 'react-art',
    title: 'ری‌اکت: مهندسی رابط کاربری',
    description: 'آموزش عمیق کتابخانه React با رویکرد ساخت کامپوننت‌های مدرن و انیمیشن‌دار.',
    level: 'Advanced',
    icon: 'Cpu',
    techStack: ['React', 'Hooks', 'Tailwind'],
    modules: [
      {
        id: 'm1',
        title: 'هوک‌های پیشرفته',
        lessons: [
          {
            id: 'l1',
            title: 'استفاده از useRef',
            content: 'هوک useRef برای دسترسی مستقیم به DOM و یا نگهداری مقادیر بدون رندر مجدد استفاده می‌شود.',
            initialCode: `// شبیه‌سازی منطق useRef در محیط جاوااسکریپت
let renderCount = 0;
const inputRef = { current: null };

function focusInput() {
  console.log("Input Focused via Ref");
  // در محیط واقعی React: inputRef.current.focus();
}

console.log("Component Rendered");`,
            challenge: 'کدی بنویسید که تعداد رندرهای کامپوننت را بشمارد.'
          }
        ]
      }
    ]
  }
];
