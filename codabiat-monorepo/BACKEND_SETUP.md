# راهنمای راه‌اندازی Backend - سیستم کدبیات

این راهنما مراحل راه‌اندازی کامل Backend با MongoDB، Authentication و File Upload را شرح می‌دهد.

## 📋 پیش‌نیازها

### 1. نصب MongoDB

#### Windows:
1. از [MongoDB Download Center](https://www.mongodb.com/try/download/community) دانلود کنید
2. نصب کنید و MongoDB را به عنوان سرویس اجرا کنید
3. MongoDB Compass را برای مدیریت گرافیکی نصب کنید (اختیاری)

#### macOS (با Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 2. تأیید نصب MongoDB
```bash
mongosh
```

اگر به shell MongoDB متصل شدید، نصب موفق بوده است. با `exit` خارج شوید.

---

## 🚀 راه‌اندازی پروژه

### 1. کپی فایل‌های Environment

```bash
# در ریشه monorepo
cp apps/api/.env.example apps/api/.env
cp apps/web-client/.env.example apps/web-client/.env
```

### 2. تنظیم متغیرهای محیطی

#### `apps/api/.env`
```env
MONGODB_URI=mongodb://localhost:27017/codabiat
JWT_SECRET=your-super-secret-jwt-key-HERE-generate-a-random-string
NODE_ENV=development
PORT=3002
```

**نکته مهم:** `JWT_SECRET` را تغییر دهید! یک رشته تصادفی امن ایجاد کنید:
```bash
# تولید JWT Secret تصادفی
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### `apps/web-client/.env`
```env
VITE_API_URL=http://localhost:3002
```

### 3. نصب Dependencies

```bash
# در ریشه monorepo
pnpm install
```

### 4. بیلد Packages مشترک

```bash
pnpm run build:packages
```

---

## 🎮 اجرای پروژه

### روش 1: اجرای همزمان (توصیه می‌شود)

```bash
# Terminal 1: API Server
pnpm run dev:api

# Terminal 2: Web Client
pnpm run dev:web
```

### روش 2: اجرای جداگانه

```bash
# فقط API
pnpm --filter @codabiat-monorepo/api dev

# فقط Frontend
pnpm --filter @codabiat-monorepo/web-client dev
```

---

## 🧪 تست Backend

### 1. تست اتصال MongoDB
باز کردن: `http://localhost:3002/api/hello`

باید پیام `"Hello, from API!"` را ببینید.

### 2. ثبت‌نام کاربر جدید

```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

پاسخ:
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. ورود

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type": "application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. ایجاد Artwork (نیاز به Authentication)

```bash
curl -X POST http://localhost:3002/api/artworks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "اثر تجربی من",
    "description": "یک توضیح کوتاه",
    "labModule": "neural",
    "labCategory": "text",
    "content": {
      "text": "متن تولید شده توسط هوش مصنوعی",
      "data": {}
    },
    "tags": ["ai", "generative"],
    "published": true
  }'
```

---

## 📊 ساختار Database

### Collections:

1. **users** - اطلاعات کاربران
   - email, password, name, role
   - xp, level, badges (Gamification)
   - artworksCount, followersCount, following

2. **artworks** - آثار تولید شده در Lab
   - title, description, author
   - labModule, labCategory
   - content (text, html, data)
   - images[], audio[], video
   - likes[], comments[], views
   - published, featured, tags

3. **articles** - مقالات بلاگ
   - title, content (فارسی و انگلیسی)
   - author, category, tags
   - published, viewCount

4. **courses** - دوره‌های آموزشی
   - title, description, level
   - modules[] با lessons[]
   - techStack, category

5. **uploads.files** & **uploads.chunks** - GridFS برای فایل‌ها
   - تصاویر، صداها، ویدیوها

---

## 🔐 سیستم Authentication

### نحوه کار:
1. کاربر ثبت‌نام/ورود می‌کند
2. JWT Token دریافت می‌کند
3. Token در `localStorage` ذخیره می‌شود
4. هر request به API باید header زیر را داشته باشد:
   ```
   Authorization: Bearer <token>
   ```

### استفاده در Frontend:
```typescript
import api from './lib/api';

// ورود
const { user, token } = await api.auth.login(email, password);

// ایجاد artwork
const artwork = await api.artworks.create({
  title: 'عنوان',
  labModule: 'neural',
  labCategory: 'text',
  // ...
});
```

---

## 📁 سیستم File Upload

### محدودیت‌های سایز:
- **تصاویر**: حداکثر 5MB
- **صدا**: حداکثر 20MB
- **ویدیو**: حداکثر 50MB

### فرمت‌های مجاز:
- **تصویر**: JPEG, PNG, GIF, WebP
- **صدا**: MP3, WAV, OGG, WebM
- **ویدیو**: MP4, WebM, OGG

### نحوه آپلود:
```typescript
import api from './lib/api';

const file = document.getElementById('file-input').files[0];
const result = await api.upload.uploadFile(file, 'image');

console.log(result.data.url); // /api/files/<fileId>
console.log(api.upload.getFileUrl(result.data.fileId)); // URL کامل
```

---

## 🎯 سیستم Gamification

### XP Points:
- **ایجاد Artwork**: +10 XP
- **دریافت Like**: +2 XP (به نویسنده)
- **دریافت Comment**: +3 XP (به نویسنده)
- **نوشتن Comment**: +1 XP
- **انتشار Article**: +20 XP

### Level Calculation:
```
Level = floor(XP / 100) + 1
```

مثال:
- 0-99 XP → Level 1
- 100-199 XP → Level 2
- 200-299 XP → Level 3

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - ثبت‌نام
- `POST /api/auth/login` - ورود

### Artworks
- `GET /api/artworks` - لیست آثار (با فیلتر و صفحه‌بندی)
- `GET /api/artworks/:id` - جزئیات یک اثر
- `POST /api/artworks` - ایجاد اثر جدید (نیاز به auth)
- `PUT /api/artworks/:id` - بروزرسانی اثر (فقط مالک)
- `DELETE /api/artworks/:id` - حذف اثر (فقط مالک)
- `POST /api/artworks/:id/like` - لایک/آنلایک
- `POST /api/artworks/:id/comments` - افزودن کامنت

### Upload
- `POST /api/upload` - آپلود فایل (نیاز به auth)
- `GET /api/files/:id` - دریافت فایل
- `DELETE /api/files/:id` - حذف فایل

### Articles
- `GET /api/articles` - لیست مقالات
- `GET /api/articles/:id` - جزئیات مقاله
- `POST /api/articles` - ایجاد مقاله (نیاز به auth)

---

## 🐛 عیب‌یابی

### MongoDB اجرا نمی‌شود
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb
```

### Port 3002 در حال استفاده است
در `apps/api/package.json` پورت را تغییر دهید:
```json
"dev": "next dev -p 3003"
```

### خطای اتصال به Database
1. MongoDB در حال اجراست؟ `mongosh` را تست کنید
2. `MONGODB_URI` در `.env` صحیح است؟
3. Firewall MongoDB را بلاک نکرده؟

### خطای JWT
1. `JWT_SECRET` در `.env` تنظیم شده؟
2. Token منقضی نشده؟ دوباره login کنید

---

## 📚 منابع

- [MongoDB Docs](https://docs.mongodb.com/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [JWT.io](https://jwt.io/)

---

## ✅ Checklist راه‌اندازی

- [ ] MongoDB نصب و در حال اجرا است
- [ ] فایل‌های `.env` ایجاد و تنظیم شده‌اند
- [ ] `JWT_SECRET` به یک مقدار امن تغییر کرده
- [ ] `pnpm install` اجرا شده
- [ ] `pnpm run build:packages` موفق بوده
- [ ] API Server روی `http://localhost:3002` اجرا است
- [ ] Frontend روی `http://localhost:5173` اجرا است
- [ ] ثبت‌نام/ورود کار می‌کند
- [ ] ایجاد Artwork موفق است
- [ ] آپلود فایل کار می‌کند

---

**موفق باشید! 🚀**

برای سوالات و مشکلات، Issue در GitHub ایجاد کنید.
