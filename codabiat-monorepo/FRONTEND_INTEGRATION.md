# یکپارچ‌سازی Frontend - سیستم کدبیات

این مستند توضیح می‌دهد که چگونه Frontend با Backend یکپارچه شده و چه صفحات و ویژگی‌های جدیدی اضافه شده‌اند.

## ✅ کارهای انجام شده

### 1. Auth Context (مدیریت احراز هویت)

**مسیر**: `apps/web-client/src/contexts/AuthContext.tsx`

**قابلیت‌ها**:
- مدیریت state کاربر در کل اپلیکیشن
- Login/Register/Logout
- Auto-load از localStorage
- Helper functions برای کار با user

**استفاده**:
```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <p>لطفاً وارد شوید</p>;
  }

  return <p>خوش آمدید {user.name}</p>;
}
```

---

### 2. API Helper Functions

**مسیر**: `apps/web-client/src/lib/api.ts`

**ماژول‌ها**:

#### `api.auth`
- `login(email, password)` - ورود
- `register(name, email, password)` - ثبت‌نام
- `logout()` - خروج
- `getCurrentUser()` - دریافت اطلاعات کاربر فعلی
- `isAuthenticated()` - بررسی وضعیت ورود

#### `api.artworks`
- `getAll(params)` - دریافت لیست آثار با فیلتر
- `getById(id)` - دریافت یک اثر
- `create(artwork)` - ایجاد اثر جدید
- `update(id, updates)` - بروزرسانی اثر
- `delete(id)` - حذف اثر
- `toggleLike(id)` - لایک/آنلایک
- `addComment(id, text)` - افزودن نظر

#### `api.upload`
- `uploadFile(file, type)` - آپلود فایل
- `getFileUrl(fileId)` - دریافت URL فایل
- `deleteFile(fileId)` - حذف فایل

#### `api.articles`
- `getAll(params)` - دریافت لیست مقالات
- `getById(id)` - دریافت یک مقاله
- `create(article)` - ایجاد مقاله

---

### 3. Gallery Page (صفحه نمایشگاه آثار)

**مسیر**: `apps/web-client/src/pages/GalleryPage.tsx`
**Route**: `/gallery`

**ویژگی‌ها**:
- ✅ نمایش تمام آثار منتشر شده
- ✅ فیلتر بر اساس دسته‌بندی (Narrative, Text, Visual, Bio, Spatial)
- ✅ مرتب‌سازی (جدیدترین، پربازدیدترین، محبوب‌ترین)
- ✅ جستجو در عنوان، توضیحات و تگ‌ها
- ✅ Pagination (صفحه‌بندی)
- ✅ نمایش اطلاعات نویسنده (نام، Level, Avatar)
- ✅ نمایش آمار (لایک، بازدید، کامنت)
- ✅ Card design با طراحی Comix Zone
- ✅ Hover effects و انیمیشن‌ها

**کامپوننت‌های استفاده شده**:
- GlitchHeader
- لینک به Artwork Detail
- فیلترهای دسته‌بندی با رنگ‌های متفاوت
- Grid responsive

---

### 4. Artwork Detail Page (صفحه جزئیات اثر)

**مسیر**: `apps/web-client/src/pages/ArtworkDetailPage.tsx`
**Route**: `/gallery/:id`

**ویژگی‌ها**:
- ✅ نمایش کامل اطلاعات اثر
- ✅ نمایش تصویر/رسانه اثر
- ✅ نمایش محتوای متنی/HTML
- ✅ اطلاعات نویسنده با لینک به پروفایل
- ✅ سیستم لایک (با آیکن قلب پر شونده)
- ✅ سیستم کامنت:
  - فرم ارسال نظر
  - محدودیت 500 کاراکتر
  - نمایش تاریخ و نویسنده
  - نیاز به احراز هویت
- ✅ نمایش تگ‌ها
- ✅ آمار بازدید، لایک، کامنت
- ✅ دکمه‌های Edit/Delete (فقط برای مالک)
- ✅ طراحی Comic Book با border های رنگی

**تعاملات**:
- کلیک لایک → درخواست به API → بروزرسانی UI
- ارسال کامنت → درخواست به API → اضافه شدن به لیست
- نمایش پیام برای کاربران غیر لاگین

---

### 5. Navigation Update

**تغییرات در Navigation**:
- ✅ اضافه شدن لینک "نمایشگاه" با آیکن Image
- ✅ Slot 6 به Gallery اختصاص داده شد
- ✅ About به Slot 7 منتقل شد

---

### 6. App Router Updates

**Route های جدید اضافه شده به `App.tsx`**:
```typescript
<Route path="/gallery" element={<GalleryPage />} />
<Route path="/gallery/:id" element={<ArtworkDetailPage />} />
```

**Context Providers**:
```typescript
<AuthProvider>
  <LanguageProvider>
    {/* App */}
  </LanguageProvider>
</AuthProvider>
```

---

## 🎮 نحوه استفاده

### ثبت‌نام/ورود
```typescript
import { useAuth } from './contexts/AuthContext';

function LoginForm() {
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      alert('ورود ناموفق بود');
    }
  };
}
```

### نمایش آثار
```typescript
import api from './lib/api';

// دریافت آثار
const response = await api.artworks.getAll({
  labCategory: 'visual',
  published: true,
  page: 1,
  limit: 12,
  sort: '-views'
});

console.log(response.data); // آرایه از آثار
console.log(response.pagination); // اطلاعات صفحه‌بندی
```

### لایک کردن اثر
```typescript
const handleLike = async () => {
  const result = await api.artworks.toggleLike(artworkId);

  if (result.liked) {
    console.log('لایک شد!');
  } else {
    console.log('آنلایک شد');
  }
};
```

### اضافه کردن کامنت
```typescript
const handleComment = async () => {
  const response = await api.artworks.addComment(artworkId, commentText);
  setComments(response.data); // لیست بروز شده کامنت‌ها
};
```

### آپلود فایل
```typescript
const handleUpload = async (file: File) => {
  const result = await api.upload.uploadFile(file, 'image');

  console.log(result.data.url); // /api/files/<fileId>
  console.log(result.data.fileId); // ID فایل

  // استفاده در artwork
  const imageUrl = api.upload.getFileUrl(result.data.fileId);
};
```

---

## 📁 ساختار فایل‌ها

```
apps/web-client/src/
├── contexts/
│   └── AuthContext.tsx          # مدیریت احراز هویت
├── lib/
│   └── api.ts                   # Helper functions برای API
├── pages/
│   ├── GalleryPage.tsx          # صفحه نمایشگاه
│   ├── ArtworkDetailPage.tsx   # صفحه جزئیات اثر
│   ├── AuthPage.tsx             # صفحه ورود/ثبت‌نام (باید بروز شود)
│   └── ...
├── components/
│   ├── Navigation.tsx           # منوی اصلی (بروز شده)
│   └── ...
└── App.tsx                      # Router اصلی (بروز شده)
```

---

## 🚧 کارهای باقی‌مانده (برای مرحله بعد)

### 1. ~~**یکپارچ‌سازی Auth Page**~~ ✅
- ✅ بروزرسانی `AuthPage.tsx` برای استفاده از `api.auth`
- ✅ اضافه کردن error handling
- ✅ نمایش پیام‌های موفقیت/خطا

### 2. **یکپارچ‌سازی Lab Modules** (در حال انجام)
- ✅ کامپوننت `SaveArtworkDialog` ایجاد شد
- ✅ نمونه پیاده‌سازی در `GlitchModule`
- ✅ مستندات کامل: [LAB_INTEGRATION_GUIDE.md](./LAB_INTEGRATION_GUIDE.md)
- ⏳ اضافه کردن به 24 ماژول دیگر (می‌تواند توسط توسعه‌دهنده انجام شود)

### 3. **بروزرسانی Dashboard**
- نمایش آثار کاربر
- نمایش آمار واقعی (XP, Level, Badges)
- لیست آثار با امکان ویرایش/حذف
- نمودار فعالیت کاربر

### 4. **User Profile Page**
- نمایش پروفایل کاربران دیگر
- لیست آثار کاربر
- Follow/Unfollow
- نمایش آمار و Badges

### 5. **Search & Filter Enhancements**
- جستجوی پیشرفته‌تر
- فیلتر بر اساس تگ‌ها
- فیلتر بر اساس نویسنده
- Sort options بیشتر

### 6. **Notifications System**
- اعلان برای لایک‌ها
- اعلان برای کامنت‌ها
- اعلان برای فالوشدن

### 7. **Admin Features**
- Feature کردن آثار
- حذف/تعلیق کاربران
- مدیریت محتوا
- Dashboard آماری

---

## 🎨 طراحی و استایل

### تم رنگی (Comix Zone Inspired):
- **Mutant Orange**: `#E07000` - برای دکمه‌های اصلی
- **Neon Pink**: `#ec4899` - برای لینک‌ها و hover states
- **Neon Blue**: `#00f0ff` - برای المان‌های تکمیلی
- **Panel Black**: `#1a1a1a` - برای background کارت‌ها
- **Void Black**: `#0a0a0a` - برای input ها

### کامپوننت‌های مشترک:
- Border های comic book style
- Shadow effects
- Hover animations
- Loading states
- Error states

---

## 🐛 نکات مهم

### Authentication
- Token در `localStorage` با کلید `auth_token` ذخیره می‌شود
- User object در `localStorage` با کلید `user` ذخیره می‌شود
- هر request خودکار header `Authorization: Bearer <token>` را اضافه می‌کند

### Error Handling
- همه API calls در try-catch هستند
- خطاها در console.error نمایش داده می‌شوند
- باید UI feedback برای خطاها اضافه شود

### Performance
- تصاویر از GridFS با URL مستقیم لود می‌شوند
- Pagination برای لیست‌های بزرگ
- Lazy loading برای تصاویر (قابل بهبود)

---

## ✅ Checklist آماده‌سازی Production

- [ ] Environment variables تنظیم شوند
- [ ] Error boundaries اضافه شوند
- [ ] Loading states بهبود یابند
- [ ] SEO meta tags اضافه شوند
- [ ] Analytics integration
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Accessibility improvements
- [ ] Mobile responsiveness testing
- [ ] Cross-browser testing

---

**موفق باشید! 🚀**

برای سوالات، به [BACKEND_SETUP.md](./BACKEND_SETUP.md) مراجعه کنید.
