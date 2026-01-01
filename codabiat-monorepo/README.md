# 🎨 کدبیات - پلتفرم ادبیات الکترونیک فارسی

> **سیستم جامع آموزش و توسعه ادبیات الکترونیک با معماری Monorepo مدرن**

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js)](https://nextjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-5+-47A248?logo=mongodb)](https://www.mongodb.com)
[![pnpm](https://img.shields.io/badge/pnpm-8+-F69220?logo=pnpm)](https://pnpm.io)

---

## 📖 درباره پروژه

**کدبیات** یک پلتفرم فول‌استک برای آموزش و توسعه ادبیات الکترونیک فارسی است که شامل:

- 🧪 **25+ ماژول Lab** برای تجربه و خلق آثار ادبی دیجیتال
- 📚 **سیستم آموزشی** با دوره‌ها و مقالات
- 🖼️ **گالری آثار** برای نمایش و اشتراک‌گذاری
- 👤 **پروفایل کاربری** با سیستم امتیازدهی و سطح‌بندی
- 💬 **تعامل اجتماعی** با لایک، کامنت و دنبال کردن
- 🎮 **تجربه بصری منحصر به فرد** با طراحی Comix Zone

---

## 🚀 شروع سریع

### پیش‌نیازها

- **Node.js** v18+ ([دانلود](https://nodejs.org))
- **pnpm** v8+ (`npm install -g pnpm`)
- **MongoDB** v5+ ([راهنمای نصب](./BACKEND_SETUP.md#نصب-mongodb))

### نصب و راه‌اندازی

```bash
# کلون پروژه
git clone <repository-url>
cd codabiat-monorepo

# نصب وابستگی‌ها
pnpm install

# تنظیم environment variables
cd apps/api && cp .env.example .env
cd ../web-client && cp .env.example .env

# ساخت پکیج‌های مشترک
pnpm --filter @codabiat/database build
pnpm --filter @codabiat/auth build

# اجرا (در دو ترمینال جداگانه)
pnpm --filter @codabiat/api dev       # Backend: http://localhost:3002
pnpm --filter @codabiat/web-client dev # Frontend: http://localhost:5173
```

**📘 راهنمای کامل**: [QUICK_START.md](./QUICK_START.md)

---

## 📦 ساختار پروژه

```
codabiat-monorepo/
├── apps/
│   ├── api/              # Backend API (Next.js 15)
│   │   ├── src/app/api/
│   │   │   ├── auth/     # احراز هویت (JWT)
│   │   │   ├── artworks/ # مدیریت آثار
│   │   │   ├── articles/ # مقالات
│   │   │   ├── upload/   # آپلود فایل
│   │   │   └── files/    # GridFS
│   │   └── .env
│   │
│   ├── web-client/       # Frontend (React 19 + Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── contexts/  # AuthContext
│   │   │   ├── lib/       # API helpers
│   │   │   ├── pages/
│   │   │   │   ├── GalleryPage.tsx
│   │   │   │   ├── ArtworkDetailPage.tsx
│   │   │   │   ├── LabPage.tsx
│   │   │   │   └── ...
│   │   │   └── App.tsx
│   │   └── .env
│   │
│   └── admin-dashboard/  # داشبورد مدیریت
│
├── packages/
│   ├── auth/             # احراز هویت مشترک
│   ├── database/         # مدل‌های Mongoose
│   │   └── src/lib/models/
│   │       ├── User.ts
│   │       ├── Artwork.ts
│   │       └── Article.ts
│   ├── types/            # TypeScript types
│   └── utils/            # توابع کمکی
│
└── [مستندات]
    ├── README.md               # این فایل
    ├── QUICK_START.md          # شروع سریع
    ├── BACKEND_SETUP.md        # راهنمای Backend
    ├── FRONTEND_INTEGRATION.md # راهنمای Frontend
    ├── DEPLOYMENT_GUIDE.md     # راهنمای استقرار
    └── CHANGELOG.md            # تاریخچه تغییرات
```

---

## 🛠️ تکنولوژی‌ها

### Backend
- **Next.js 15** - App Router برای API
- **MongoDB + Mongoose** - دیتابیس NoSQL
- **GridFS** - ذخیره فایل‌های بزرگ
- **JWT + bcryptjs** - احراز هویت امن
- **TypeScript** - Type safety

### Frontend
- **React 19** - جدیدترین نسخه
- **Vite** - Build tool سریع
- **React Router v6** - مسیریابی
- **Tailwind CSS** - Styling
- **Three.js** - گرافیک 3D
- **D3.js** - ویژوالیزیشن
- **EmulatorJS** - اجرای بازی‌های رترو

### DevOps
- **pnpm Workspaces** - Monorepo
- **TypeScript** - در تمام پروژه
- **ESLint + Prettier** - کیفیت کد

---

## ✨ ویژگی‌ها

### ✅ پیاده‌سازی شده

#### 🔐 سیستم احراز هویت
- ثبت‌نام و ورود با JWT
- مدیریت session
- پروفایل کاربری

#### 🎨 سیستم آثار هنری
- CRUD کامل برای آثار
- آپلود تصویر، صدا و ویدیو
- لایک و کامنت
- نمایش در گالری
- فیلتر و جستجو
- Pagination

#### 🧪 Lab Modules
- 25+ ماژول برای خلق آثار:
  - Neural Network Narrative
  - Cut-up Machine
  - Glitch Text
  - 3D Text Sculptor
  - Particle Poetry
  - و بسیاری دیگر...

#### 👤 پروفایل کاربر
- سیستم XP و Level (`Level = floor(XP / 100) + 1`)
- Badges و نشان‌ها
- آمار آثار و فعالیت
- Follow/Unfollow

#### 🖼️ گالری
- نمایش آثار با طراحی Comix Zone
- فیلتر بر اساس دسته‌بندی
- مرتب‌سازی (جدیدترین، محبوب‌ترین، پربازدیدترین)
- جستجو در عنوان، توضیحات و تگ‌ها

### 🚧 در دست توسعه

- [x] **ذخیره آثار از Lab Modules** - `SaveArtworkDialog` ایجاد شد، نمونه در GlitchModule ([راهنما](./LAB_INTEGRATION_GUIDE.md))
- [ ] Dashboard کاربر با آمار واقعی
- [ ] صفحات پروفایل عمومی
- [ ] سیستم اعلانات
- [ ] ویژگی‌های Admin

---

## 📝 دستورات

### Development

```bash
# اجرای Backend
pnpm --filter @codabiat/api dev

# اجرای Frontend
pnpm --filter @codabiat/web-client dev

# اجرای Admin Dashboard
pnpm --filter @codabiat/admin-dashboard dev
```

### Build

```bash
# Build تمام پروژه‌ها
pnpm build

# Build یک پروژه خاص
pnpm --filter @codabiat/api build
pnpm --filter @codabiat/web-client build
```

### Maintenance

```bash
# پاک‌سازی کامل
pnpm clean

# نصب مجدد
pnpm install

# بروزرسانی dependencies
pnpm update
```

---

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/register  # ثبت‌نام
POST   /api/auth/login     # ورود
GET    /api/auth/me        # اطلاعات کاربر
```

### Artworks
```
GET    /api/artworks           # لیست آثار
POST   /api/artworks           # ایجاد اثر (+10 XP)
GET    /api/artworks/:id       # دریافت اثر
PUT    /api/artworks/:id       # ویرایش اثر
DELETE /api/artworks/:id       # حذف اثر
POST   /api/artworks/:id/like  # لایک/آنلایک (+2 XP)
POST   /api/artworks/:id/comments  # افزودن نظر (+1/+3 XP)
```

### File Upload
```
POST   /api/upload      # آپلود فایل
GET    /api/files/:id   # دریافت فایل
DELETE /api/files/:id   # حذف فایل
```

**📘 مستندات کامل API**: [BACKEND_SETUP.md](./BACKEND_SETUP.md#api-endpoints)

---

## 📚 مستندات

| فایل | توضیح |
|------|-------|
| [QUICK_START.md](./QUICK_START.md) | راهنمای سریع شروع (3 دقیقه) |
| [BACKEND_SETUP.md](./BACKEND_SETUP.md) | نصب MongoDB، تنظیم Backend، API docs |
| [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) | یکپارچه‌سازی Frontend با Backend |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | راهنمای استقرار در Production |
| [CHANGELOG.md](./CHANGELOG.md) | تاریخچه کامل تغییرات |

---

## 🧪 تست

### تست Backend
```bash
# Health check
curl http://localhost:3002/api/health

# ثبت‌نام
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'
```

### تست Frontend
1. مرورگر را باز کنید: `http://localhost:5173`
2. به `/login` بروید و ثبت‌نام کنید
3. به `/gallery` بروید
4. یکی از Lab modules را امتحان کنید

---

## 🐛 مشکلات رایج

### MongoDB اجرا نمی‌شود
```bash
# بررسی وضعیت
sudo systemctl status mongodb  # Linux
brew services list              # macOS
net start MongoDB               # Windows

# راه‌اندازی
sudo systemctl start mongodb    # Linux
brew services start mongodb     # macOS
net start MongoDB               # Windows
```

### Port در حال استفاده است
```bash
# پیدا کردن و kill کردن پروسس
lsof -ti:3002 | xargs kill -9   # macOS/Linux
netstat -ano | findstr :3002    # Windows
```

### خطای Module not found
```bash
pnpm clean
pnpm install
pnpm --filter @codabiat/database build
pnpm --filter @codabiat/auth build
```

**📘 راهنمای کامل Troubleshooting**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#مشکلات-رایج)

---

## 🎯 Roadmap

### نسخه 1.0 (فعلی) ✅
- [x] Backend API کامل
- [x] Authentication با JWT
- [x] Gallery و Artwork Detail
- [x] Like و Comment
- [x] File Upload با GridFS
- [x] 25 Lab Module

### نسخه 1.1 (بعدی)
- [ ] ذخیره آثار از Lab
- [ ] Dashboard کاربر
- [ ] User Profile Pages
- [ ] Search پیشرفته

### نسخه 1.2
- [ ] Notifications
- [ ] Follow System
- [ ] Admin Panel
- [ ] Analytics

### نسخه 2.0
- [ ] Real-time collaboration
- [ ] WebRTC برای voice/video
- [ ] PWA Support
- [ ] Mobile App

---

## 💡 مزایای معماری Monorepo

✅ **کد مشترک**: پکیج‌های shared بین Frontend و Backend
✅ **Type Safety**: TypeScript types یکسان در همه جا
✅ **Refactoring آسان**: تغییرات در یک مکان
✅ **Deploy مستقل**: هر app به صورت جداگانه
✅ **Developer Experience**: یک `pnpm install` برای همه چیز

---

## 🤝 مشارکت

این پروژه open-source است و از مشارکت شما استقبال می‌کنیم!

### نحوه مشارکت:
1. Fork کنید
2. یک branch جدید بسازید (`git checkout -b feature/amazing-feature`)
3. تغییرات را commit کنید (`git commit -m 'Add amazing feature'`)
4. Push کنید (`git push origin feature/amazing-feature`)
5. Pull Request ایجاد کنید

---

## 📄 لایسنس

این پروژه برای جامعه ادبیات الکترونیک فارسی توسعه داده شده است.

---

## 👥 تیم

توسعه‌دهنده: کدبیات
تکنولوژی: React, Next.js, MongoDB, TypeScript
طراحی: الهام از Comix Zone (Sega Genesis)

---

## 🔗 لینک‌های مفید

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React 19 Docs](https://react.dev)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Tailwind CSS](https://tailwindcss.com)

---

## 📞 پشتیبانی

- 📖 مستندات: همین مخزن
- 🐛 گزارش باگ: GitHub Issues
- 💬 سوالات: Discussions

---

<div align="center">

**ساخته شده با ❤️ برای جامعه فارسی‌زبان**

🎨 **کدبیات** - *جایی که کد به ادبیات تبدیل می‌شود*

[![Made with React](https://img.shields.io/badge/Made%20with-React-61dafb)](https://react.dev)
[![Powered by MongoDB](https://img.shields.io/badge/Powered%20by-MongoDB-47A248)](https://www.mongodb.com)
[![Built with TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-3178c6)](https://www.typescriptlang.org/)

**[شروع کنید](./QUICK_START.md)** • **[مستندات](./BACKEND_SETUP.md)** • **[Changelog](./CHANGELOG.md)**

</div>
