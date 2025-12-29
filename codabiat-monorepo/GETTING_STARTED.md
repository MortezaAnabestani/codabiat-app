# راهنمای شروع سریع

## 🚀 نصب و اجرای اولیه

### مرحله 1: نصب Dependencies

```bash
cd codabiat-monorepo
npm install
```

### مرحله 2: راه‌اندازی MongoDB

اگر MongoDB روی سیستم شما نصب نیست:

**Windows:**
```bash
# با Chocolatey
choco install mongodb

# شروع سرویس
net start MongoDB
```

**macOS:**
```bash
# با Homebrew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

یا از **MongoDB Atlas** (cloud) استفاده کنید:
1. به https://www.mongodb.com/cloud/atlas بروید
2. یک cluster رایگان بسازید
3. Connection string را کپی کنید

### مرحله 3: تنظیم Environment Variables

```bash
cp .env.example .env
```

فایل `.env` را با اطلاعات خود ویرایش کنید:

```env
# اتصال به MongoDB محلی
MONGODB_URI=mongodb://localhost:27017/codabiat

# یا MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/codabiat

# کلید امنیتی JWT (یک رشته تصادفی بلند)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# کلید Gemini API (اختیاری)
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

### مرحله 4: اجرای پروژه

**روش 1: استفاده از npm scripts (ساده‌تر)**
```bash
# اجرای تمام اپلیکیشن‌ها به صورت همزمان
npm run dev

# یا به صورت جداگانه:
npm run dev:web      # http://localhost:3000
npm run dev:api      # http://localhost:3001
npm run dev:admin    # http://localhost:4000
```

**روش 2: استفاده مستقیم از nx با npx**
```bash
npx nx serve web-client       # http://localhost:3000
npx nx serve api              # http://localhost:3001
npx nx serve admin-dashboard  # http://localhost:4000
```

**روش 3: نصب nx به صورت global (اختیاری)**
```bash
npm install -g nx

# سپس می‌توانید مستقیم استفاده کنید:
nx serve web-client
```

## 📱 تست API

### ثبت‌نام کاربر جدید

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "name": "کاربر تست"
  }'
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "کاربر تست",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### ورود کاربر

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

### ایجاد مقاله (با احراز هویت)

```bash
curl -X POST http://localhost:3001/api/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "اولین مقاله من",
    "titleEn": "My First Article",
    "content": "محتوای مقاله به زبان فارسی",
    "contentEn": "Article content in English",
    "category": "generative",
    "tags": ["AI", "ادبیات دیجیتال"]
  }'
```

### دریافت لیست مقالات

```bash
curl http://localhost:3001/api/articles?page=1&limit=10
```

## 🛠️ دستورات مفید

### با npm scripts (ساده‌تر)
```bash
# Build همه پروژه‌ها
npm run build

# Build یک پروژه خاص
npm run build:web
npm run build:api
npm run build:admin

# لینت کردن
npm run lint

# نمایش گراف وابستگی‌ها
npm run graph

# پاک کردن cache
npm run reset
```

### با npx nx (پیشرفته‌تر)
```bash
# نمایش گراف وابستگی‌ها
npx nx graph

# Build یک پروژه خاص
npx nx build web-client

# Build همه پروژه‌ها
npx nx run-many -t build

# لینت کردن کدها
npx nx run-many -t lint

# پاک کردن cache
npx nx reset

# اضافه کردن کامپوننت جدید
npx nx g @nx/react:component Button --project=web-client --directory=src/components
```

## 📂 ساختار پروژه

```
codabiat-monorepo/
├── apps/
│   ├── web-client/          # پورت 3000
│   │   ├── src/
│   │   │   ├── components/  # کامپوننت‌های React
│   │   │   ├── pages/       # صفحات
│   │   │   ├── services/    # سرویس‌ها
│   │   │   ├── App.tsx      # کامپوننت اصلی
│   │   │   └── main.tsx     # Entry point
│   │   └── vite.config.mts
│   │
│   ├── api/                 # پورت 3001
│   │   ├── src/app/api/     # API Routes
│   │   │   ├── auth/        # احراز هویت
│   │   │   ├── articles/    # مقالات
│   │   │   └── courses/     # دوره‌ها
│   │   └── next.config.js
│   │
│   └── admin-dashboard/     # پورت 4000
│       └── src/
│
├── packages/
│   ├── database/            # MongoDB Models
│   │   ├── src/lib/
│   │   │   ├── connection.ts
│   │   │   └── models/
│   │   │       ├── User.ts
│   │   │       ├── Article.ts
│   │   │       └── Course.ts
│   │
│   ├── auth/                # Authentication
│   │   ├── src/lib/
│   │   │   ├── jwt.ts
│   │   │   ├── password.ts
│   │   │   └── middleware.ts
│   │
│   ├── types/               # TypeScript Types
│   └── utils/               # Utilities
│
└── .env                     # Environment variables
```

## 🔍 مشکلات رایج

### خطای "nx: command not found" یا "bash: nx: command not found"

**راه‌حل:**
```bash
# از npm scripts استفاده کنید:
npm run dev:web

# یا از npx استفاده کنید:
npx nx serve web-client

# یا nx را به صورت global نصب کنید:
npm install -g nx
```

### خطای "Cannot connect to MongoDB"

```bash
# بررسی کنید MongoDB در حال اجراست
# Windows:
net start MongoDB

# macOS/Linux:
sudo systemctl status mongodb
```

### خطای "Port already in use"

پورت‌ها را در فایل‌های زیر تغییر دهید:
- `apps/web-client/vite.config.mts` - پورت 3000
- `apps/api/` - پورت 3001 (در nx.json)
- `apps/admin-dashboard/vite.config.mts` - پورت 4000

### خطای Import از Packages

```bash
# پاک کردن cache و rebuild
npm run reset
npx nx build database
npx nx build auth
npx nx build types
```

## 📚 منابع بیشتر

- [مستندات Nx](https://nx.dev)
- [مستندات Next.js](https://nextjs.org/docs)
- [مستندات React](https://react.dev)
- [مستندات MongoDB](https://www.mongodb.com/docs)
- [مستندات Mongoose](https://mongoosejs.com/docs)

## 🆘 دریافت کمک

اگر به مشکلی برخوردید:

1. `npm run reset` را اجرا کنید
2. `node_modules` را حذف و دوباره `npm install` کنید
3. فایل `.env` را بررسی کنید
4. لاگ‌ها را در کنسول چک کنید
5. از `npx nx` یا `npm run` برای اجرای دستورات استفاده کنید

---

**موفق باشید! 🚀**
