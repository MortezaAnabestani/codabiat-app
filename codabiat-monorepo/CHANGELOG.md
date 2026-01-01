# تاریخچه تغییرات - سیستم کدبیات

این فایل تمام تغییرات و بروزرسانی‌های مهم پروژه را ثبت می‌کند.

---

## [v1.1.0] - 2025-12-31

### 🎨 Lab Integration - یکپارچه‌سازی کامل قابلیت ذخیره آثار

**یکپارچه‌سازی کامل 25/25 ماژول Lab با قابلیت ذخیره اثر - 100% ✅**

#### ویژگی‌های جدید:

**SaveArtworkDialog Component**
- **مسیر**: `apps/web-client/src/components/lab/SaveArtworkDialog.tsx`
- Dialog کامل برای ذخیره آثار با:
  - فرم عنوان، توضیحات و تگ‌ها
  - گزینه انتشار عمومی
  - مدیریت خطا و لودینگ
  - یکپارچه‌سازی با artworks API
  - هدایت خودکار به صفحه اثر
  - طراحی Comix Zone

**یکپارچه‌سازی تمام 25 Lab Module:**

**✅ Text Modules (5/5)**
1. GlitchModule - افکت‌های corruption/datamosh/ascii
2. CutUpModule - برش دادایی با فیزیک Matter.js + Canvas screenshot
3. PermutationModule - ترکیبات کلمات
4. GeometricModule - الگوهای هندسی متن
5. CriticalCodeModule - تحلیل کد انتقادی

**✅ Visual Modules (11/11)**
6. AlgorithmicCalligraphyModule - خوشنویسی الگوریتمی (P5.js)
7. SemanticClusterModule - خوشه‌بندی معنایی (D3.js + html2canvas)
8. SonificationModule - صوتی‌سازی متن
9. PoetryExcavationModule - کاوش شعری
10. FractalGardenModule - باغ فراکتال (P5.js)
11. CyberBreachModule - بازی نفوذ سایبری
12. CyberWeaverModule - بافنده سایبری (Canvas)
13. RetroConsoleModule - کنسول رترو
14. BioSynthesisModule - سنتز زیستی (Canvas)
15. AdvancedKineticModule - حرکات پیشرفته (Canvas)
16. CyberIslimiModule - اسلیمی سایبری (P5.js)

**✅ Narrative Modules (4/4)**
17. InteractiveFictionModule - داستان تعاملی با choices و variables
18. HypertextModule - ساختار hypertext با nodes و links
19. DataNarrativeModule - تولید داستان از داده
20. LocativeNarrativeModule - داستان مبتنی بر موقعیت مکانی

**✅ Spatial/3D Modules (2/2)**
21. TextOrbModule - کره متنی 3D (Three.js)
22. BlindOwlModule - بوف کور 3D (Three.js)

**✅ Other Modules (3/3)**
23. PhysicsTextModule - فیزیک متن (Matter.js)
24. NeuralModule - شبکه عصبی برای تولید متن
25. PixelGlitchModule - گلیچ پیکسلی

**مستندات جامع**
- **[LAB_INTEGRATION_GUIDE.md](./LAB_INTEGRATION_GUIDE.md)** - راهنمای گام به گام (528 خط)
- **[LAB_INTEGRATION_STATUS.md](./LAB_INTEGRATION_STATUS.md)** - وضعیت 100% تکمیل

#### بهبودها:

- پشتیبانی از screenshot برای ماژول‌های بصری:
  - Canvas-based: `canvas.toDataURL('image/png')`
  - P5.js: `p5Instance.current.canvas.toDataURL('image/png')`
  - Three.js: `renderer.domElement.toDataURL('image/png')`
  - D3.js: با استفاده از html2canvas
- ذخیره کامل state برای امکان بازسازی اثر
- مدیریت خودکار authentication
- UI/UX همسان با طراحی Comix Zone
- پشتیبانی از html2canvas برای DOM-based modules

---

## [v1.0.0] - 2025-12-31

### 🎉 اولین نسخه کامل Full-Stack

این نسخه شامل یکپارچه‌سازی کامل Backend و Frontend با تمام ویژگی‌های اصلی است.

---

## ✨ ویژگی‌های جدید

### Backend (API)

#### 🔐 سیستم احراز هویت
- **مسیر**: `apps/api/src/app/api/auth/`
- پیاده‌سازی کامل JWT Authentication
- API Endpoints:
  - `POST /api/auth/register` - ثبت‌نام کاربر جدید
  - `POST /api/auth/login` - ورود کاربر
  - `GET /api/auth/me` - دریافت اطلاعات کاربر فعلی
- رمزگذاری رمز عبور با bcryptjs
- مدیریت session با localStorage در فرانت‌اند

#### 🎨 مدیریت آثار هنری (Artworks)
- **مسیر**: `apps/api/src/app/api/artworks/`
- CRUD کامل برای آثار کاربران
- API Endpoints:
  - `GET /api/artworks` - لیست آثار با فیلتر و جستجو
  - `POST /api/artworks` - ایجاد اثر جدید (+10 XP)
  - `GET /api/artworks/:id` - دریافت یک اثر (با افزایش view)
  - `PUT /api/artworks/:id` - ویرایش اثر (فقط مالک)
  - `DELETE /api/artworks/:id` - حذف اثر (فقط مالک)
  - `POST /api/artworks/:id/like` - لایک/آنلایک (+2 XP به نویسنده)
  - `POST /api/artworks/:id/comments` - افزودن نظر (+1 XP به نظردهنده، +3 XP به نویسنده)

#### 📁 سیستم آپلود فایل
- **مسیر**: `apps/api/src/app/api/upload/` و `apps/api/src/app/api/files/`
- استفاده از GridFS برای ذخیره فایل‌های بزرگ در MongoDB
- پشتیبانی از تصاویر، صداها، و ویدیوها
- محدودیت‌های حجم:
  - Images: 5MB (JPEG, PNG, GIF, WebP)
  - Audio: 20MB (MP3, WAV, OGG)
  - Video: 50MB (MP4, WebM)
- Streaming فایل‌ها از GridFS
- API Endpoints:
  - `POST /api/upload` - آپلود فایل
  - `GET /api/files/:id` - دریافت فایل
  - `DELETE /api/files/:id` - حذف فایل

#### 🗃️ مدل‌های دیتابیس
- **مسیر**: `packages/database/src/lib/models/`

**User Model** (`User.ts`):
```typescript
{
  email, password, name, role,
  avatar, bio,
  xp, level,  // Gamification
  badges,
  artworksCount, followersCount, followingCount,
  following,
  preferences: { language, notifications, profilePublic }
}
```
- محاسبه خودکار Level: `level = floor(xp / 100) + 1`
- Hash خودکار رمز عبور قبل از ذخیره

**Artwork Model** (`Artwork.ts`):
```typescript
{
  title, description, author,
  labModule, labCategory,
  content: { text, html, data },
  images[], audio[], video,
  tags[],
  published, featured,
  likes[], views,
  comments: [{ user, text, createdAt }]
}
```

---

### Frontend (Web Client)

#### 🎭 Auth Context
- **مسیر**: `apps/web-client/src/contexts/AuthContext.tsx`
- مدیریت global state احراز هویت
- Auto-load از localStorage
- توابع:
  - `login(email, password)`
  - `register(name, email, password)`
  - `logout()`
  - `updateUser(updates)`

#### 🔌 API Helper Functions
- **مسیر**: `apps/web-client/src/lib/api.ts`
- ماژول‌های API:
  - `authAPI` - احراز هویت
  - `artworksAPI` - مدیریت آثار
  - `articlesAPI` - مقالات
  - `uploadAPI` - آپلود فایل
  - `usersAPI` - مدیریت کاربران
- افزودن خودکار Authorization header
- مدیریت خطا در یک مکان مرکزی

#### 🖼️ صفحه گالری (Gallery Page)
- **مسیر**: `apps/web-client/src/pages/GalleryPage.tsx`
- **Route**: `/gallery`
- ویژگی‌ها:
  - ✅ نمایش تمام آثار منتشر شده
  - ✅ فیلتر بر اساس دسته‌بندی (Narrative, Text, Visual, Bio, Spatial)
  - ✅ مرتب‌سازی (جدیدترین، پربازدیدترین، محبوب‌ترین)
  - ✅ جستجو در عنوان، توضیحات و تگ‌ها
  - ✅ Pagination با 12 کارت در هر صفحه
  - ✅ نمایش اطلاعات نویسنده (نام، سطح، آواتار)
  - ✅ نمایش آمار (لایک، بازدید، کامنت)
  - ✅ طراحی Comix Zone با border های رنگی
  - ✅ Hover effects و انیمیشن‌ها

#### 🎨 صفحه جزئیات اثر (Artwork Detail Page)
- **مسیر**: `apps/web-client/src/pages/ArtworkDetailPage.tsx`
- **Route**: `/gallery/:id`
- ویژگی‌ها:
  - ✅ نمایش کامل اطلاعات اثر
  - ✅ نمایش تصویر/رسانه اثر
  - ✅ نمایش محتوای متنی/HTML
  - ✅ اطلاعات نویسنده با لینک به پروفایل
  - ✅ سیستم لایک با آیکن قلب پر شونده
  - ✅ سیستم کامنت:
    - فرم ارسال نظر
    - محدودیت 500 کاراکتر
    - نمایش تاریخ و نویسنده
    - نیاز به احراز هویت
  - ✅ نمایش تگ‌ها
  - ✅ آمار بازدید، لایک، کامنت
  - ✅ دکمه‌های Edit/Delete (فقط برای مالک)
  - ✅ طراحی Comic Book با border های رنگی

#### 🔐 صفحه احراز هویت (Auth Page)
- **مسیر**: `apps/web-client/src/pages/AuthPage.tsx` و `apps/web-client/src/components/AuthForm.tsx`
- **Route**: `/login`
- ویژگی‌ها:
  - ✅ فرم ورود/ثبت‌نام با طراحی Comix Zone
  - ✅ یکپارچه‌سازی کامل با Backend API
  - ✅ نمایش پیام‌های خطا و موفقیت
  - ✅ Validation فیلدها
  - ✅ Loading state در حین درخواست
  - ✅ هدایت خودکار به Dashboard بعد از ورود موفق
  - ✅ طراحی Comic Panel با سایه‌های سخت

#### 🧭 بروزرسانی Navigation
- **مسیر**: `apps/web-client/src/components/Navigation.tsx`
- اضافه شدن لینک "نمایشگاه" با آیکن Image
- Slot 6 به Gallery اختصاص داده شد
- About به Slot 7 منتقل شد

#### 🎮 بازی Comix Zone
- **مسیر**: `apps/web-client/src/components/ComixZoneGame.tsx`
- ویژگی‌ها:
  - ✅ EmulatorJS برای اجرای ROM سگا جنسیس
  - ✅ نمایش Fullscreen با backdrop شیشه‌ای
  - ✅ انیمیشن Page Tear برای بستن
  - ✅ کنترل‌های سبک Inventory (Help, Reset, Close)
  - ✅ Combat Manual overlay
  - ✅ کلیک روی GIF در Home برای اجرای بازی

---

## 📦 پکیج‌های مشترک (Shared Packages)

### @codabiat/database
- اتصال به MongoDB
- مدل‌های Mongoose:
  - User
  - Artwork
  - Article
- Helper functions برای دیتابیس

### @codabiat/auth
- لاجیک احراز هویت مشترک
- JWT utilities
- Middleware های authentication

### @codabiat/types
- TypeScript interfaces مشترک
- Type definitions برای API

### @codabiat/utils
- توابع کمکی مشترک
- Validators
- Formatters

---

## 🔧 بهبودهای تکنیکی

### Monorepo Structure
- استفاده از pnpm workspaces
- ساختار یکپارچه apps و packages
- Shared dependencies بین پروژه‌ها

### Type Safety
- TypeScript در تمام پروژه
- Type checking کامل
- Shared types بین Frontend و Backend

### Performance
- Pagination برای لیست‌های بزرگ
- Image optimization
- Lazy loading (آماده برای توسعه)
- GridFS streaming برای فایل‌های بزرگ

### Security
- JWT authentication
- Password hashing با bcrypt
- Authorization middleware
- Input validation
- File type validation
- File size limits

---

## 📚 مستندات

سه مستند جامع اضافه شد:

### 1. BACKEND_SETUP.md
- راهنمای نصب MongoDB (Windows, macOS, Linux)
- تنظیم Environment Variables
- ساخت و اجرای Backend
- مستندات API Endpoints
- نمونه‌های curl برای تست
- Troubleshooting

### 2. FRONTEND_INTEGRATION.md
- توضیح AuthContext
- مستندات API Helpers
- راهنمای استفاده از Gallery و Detail pages
- نمونه کدها
- کارهای باقی‌مانده برای آینده

### 3. DEPLOYMENT_GUIDE.md
- راهنمای کامل راه‌اندازی
- دستورات Development و Production
- راهنمای استقرار:
  - VPS با PM2
  - Docker
  - Vercel/Railway/Render
  - Nginx
  - MongoDB Atlas
- رفع مشکلات رایج
- چک‌لیست Production

---

## 🎨 طراحی و UI/UX

### تم رنگی Comix Zone
- **Mutant Orange**: `#E07000` - دکمه‌های اصلی
- **Neon Pink**: `#ec4899` - لینک‌ها و hover
- **Neon Blue**: `#00f0ff` - المان‌های تکمیلی
- **Panel Black**: `#1a1a1a` - background کارت‌ها
- **Void Black**: `#0a0a0a` - input ها
- **FFCC00**: زرد برای highlight ها

### طراحی کامپوننت‌ها
- Border های comic book style
- Shadow effects سخت
- Hover animations
- Loading states با انیمیشن
- Error states با رنگ‌های مشخص
- Comic Panel layouts

---

## 🔄 تغییرات مسیرها (Routes)

### Routes جدید در App.tsx:
```typescript
<Route path="/gallery" element={<GalleryPage />} />
<Route path="/gallery/:id" element={<ArtworkDetailPage />} />
```

### API Routes جدید:
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/artworks
POST   /api/artworks
GET    /api/artworks/:id
PUT    /api/artworks/:id
DELETE /api/artworks/:id
POST   /api/artworks/:id/like
POST   /api/artworks/:id/comments

POST   /api/upload
GET    /api/files/:id
DELETE /api/files/:id

GET    /api/articles
POST   /api/articles
GET    /api/articles/:id

GET    /api/users/:id
PUT    /api/users/me
POST   /api/users/:id/follow
POST   /api/users/:id/unfollow
```

---

## ⚙️ Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/codabiat
JWT_SECRET=<random-secret>
NODE_ENV=development
PORT=3002
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3002
```

---

## 🧪 نحوه تست

### تست Backend:
```bash
# شروع MongoDB
mongod

# اجرای API
cd apps/api
pnpm dev

# تست endpoints
curl http://localhost:3002/api/health
```

### تست Frontend:
```bash
cd apps/web-client
pnpm dev

# باز کردن در مرورگر:
# http://localhost:5173
```

### تست یکپارچه‌سازی:
1. ثبت‌نام کاربر جدید در `/login`
2. ایجاد اثر جدید (از Lab modules - آینده)
3. مشاهده در Gallery
4. لایک و کامنت
5. ویرایش/حذف اثر خود

---

## 🐛 رفع باگ‌ها

- رفع مشکل import در AuthForm
- رفع type errors در API routes
- رفع CORS issues
- بهبود error handling در API calls

---

## 📝 کارهای باقی‌مانده (TODO)

برای نسخه‌های بعدی:

### فاز 2: Lab Integration
- [ ] اضافه کردن دکمه "Save Artwork" به 25 ماژول Lab
- [ ] فرم ذخیره اثر (عنوان، توضیحات، تگ‌ها)
- [ ] Screenshot capture از ماژول
- [ ] ذخیره content و data ماژول
- [ ] هدایت به Gallery بعد از ذخیره

### فاز 3: Dashboard
- [ ] نمایش آثار واقعی کاربر
- [ ] نمایش آمار (XP, Level, Badges)
- [ ] لیست آثار با امکان ویرایش/حذف
- [ ] نمودار فعالیت کاربر

### فاز 4: User Profiles
- [ ] صفحات پروفایل عمومی
- [ ] Follow/Unfollow
- [ ] لیست آثار کاربر
- [ ] نمایش Badges و آمار

### فاز 5: بهبودها
- [ ] Search پیشرفته
- [ ] فیلتر بر اساس تگ و نویسنده
- [ ] Notifications system
- [ ] Admin features (feature کردن آثار، مدیریت محتوا)

---

## 🎯 وضعیت پروژه

**وضعیت فعلی**: ✅ **نسخه 1.0 - آماده برای Development**

پروژه حالا یک سیستم Full-Stack کامل با این ویژگی‌هاست:
- ✅ Backend API با MongoDB
- ✅ Authentication system
- ✅ User profiles با gamification
- ✅ Artwork CRUD
- ✅ File upload با GridFS
- ✅ Gallery با فیلتر و جستجو
- ✅ Like & Comment system
- ✅ مستندات کامل

**آماده برای**: توسعه فازهای بعدی و استقرار در محیط تست

---

## 👥 مشارکت‌کنندگان

- توسعه Backend و Frontend
- طراحی API
- پیاده‌سازی Database models
- مستندنویسی

---

## 📄 لایسنس

این پروژه برای سیستم آموزش و توسعه ادبیات الکترونیک فارسی توسعه داده شده است.

---

**تاریخ انتشار**: 2025-12-31
**نسخه**: 1.0.0
**وضعیت**: Production Ready (Development Phase)

---

## لینک‌های مرتبط

- [راهنمای Backend](./BACKEND_SETUP.md)
- [راهنمای Frontend](./FRONTEND_INTEGRATION.md)
- [راهنمای استقرار](./DEPLOYMENT_GUIDE.md)
