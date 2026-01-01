# 🚀 راهنمای سریع شروع - کدبیات

این راهنما برای اجرای سریع پروژه در محیط Development است.

---

## ⚡ شروع سریع (3 دقیقه)

### گام 1️⃣: بررسی پیش‌نیازها

```bash
node --version    # باید v18+ باشد
pnpm --version    # باید v8+ باشد
mongod --version  # باید v5+ باشد
```

اگر نصب نیستند:
- **Node.js**: [nodejs.org](https://nodejs.org)
- **pnpm**: `npm install -g pnpm`
- **MongoDB**: [راهنمای نصب](./BACKEND_SETUP.md#نصب-mongodb)

---

### گام 2️⃣: نصب وابستگی‌ها

```bash
cd codabiat-monorepo
pnpm install
```

---

### گام 3️⃣: راه‌اندازی MongoDB

#### Windows:
```bash
# MongoDB به صورت خودکار سرویس اجرا می‌شود
# بررسی:
net start | findstr MongoDB
```

#### macOS:
```bash
brew services start mongodb-community
```

#### Linux:
```bash
sudo systemctl start mongodb
```

---

### گام 4️⃣: تنظیم Environment Variables

#### Backend:
```bash
cd apps/api
cp .env.example .env
```

فایل `.env` را ویرایش کنید:
```env
MONGODB_URI=mongodb://localhost:27017/codabiat
JWT_SECRET=your-random-secret-here-change-this
NODE_ENV=development
PORT=3002
```

💡 **نکته**: برای تولید JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Frontend:
```bash
cd apps/web-client
cp .env.example .env
```

فایل `.env`:
```env
VITE_API_URL=http://localhost:3002
```

---

### گام 5️⃣: ساخت پکیج‌های مشترک

```bash
# از روت پروژه:
pnpm --filter @codabiat/database build
pnpm --filter @codabiat/auth build
```

---

### گام 6️⃣: اجرا! 🎉

#### ترمینال 1 - Backend:
```bash
cd apps/api
pnpm dev
```

انتظار می‌رود:
```
✓ Ready in 1.5s
▲ Next.js 15.x.x
Local: http://localhost:3002
```

#### ترمینال 2 - Frontend:
```bash
cd apps/web-client
pnpm dev
```

انتظار می‌رود:
```
VITE v5.x.x  ready in 500 ms
➜  Local:   http://localhost:5173/
```

---

## ✅ بررسی سلامت سیستم

### 1. بررسی Backend:
```bash
curl http://localhost:3002/api/health
```

باید پاسخ بدهد:
```json
{"status": "ok"}
```

### 2. بررسی MongoDB:
```bash
mongosh codabiat
```

باید وارد shell شوید:
```
test> show dbs
```

### 3. بررسی Frontend:
مرورگر را باز کنید: [http://localhost:5173](http://localhost:5173)

باید صفحه اصلی با انیمیشن Comix Zone نمایش داده شود.

---

## 🎮 اولین تست کامل

1. **ثبت‌نام کاربر**:
   - به `/login` بروید
   - روی "CREATE NEW SKETCH" کلیک کنید
   - نام، ایمیل و رمز عبور را وارد کنید
   - "JOIN RESISTANCE" را کلیک کنید

2. **مشاهده Gallery**:
   - به `/gallery` بروید
   - فعلاً خالی است (هنوز اثری وجود ندارد)

3. **آزمایش Lab Modules**:
   - به `/lab` بروید
   - یکی از ماژول‌ها را امتحان کنید
   - (قابلیت ذخیره اثر در فاز بعد اضافه می‌شود)

---

## 🎨 ویژگی‌های فعلی

### ✅ آماده:
- سیستم احراز هویت (Login/Register)
- Gallery Page (نمایش آثار)
- Artwork Detail (با Like و Comment)
- آپلود فایل با GridFS
- User profiles با XP و Level
- 25 Lab Module برای ایجاد اثر

### 🚧 در دست توسعه:
- ذخیره آثار از Lab Modules
- Dashboard کاربر
- User Profile Pages
- Notifications
- Admin Features

---

## 📁 ساختار اصلی

```
codabiat-monorepo/
├── apps/
│   ├── api/              # Backend (http://localhost:3002)
│   ├── web-client/       # Frontend (http://localhost:5173)
│   └── admin-dashboard/  # Admin (در آینده)
│
├── packages/
│   ├── auth/             # احراز هویت مشترک
│   ├── database/         # مدل‌های MongoDB
│   ├── types/            # TypeScript types
│   └── utils/            # ابزارهای کمکی
│
└── [مستندات]
    ├── BACKEND_SETUP.md        # راهنمای کامل Backend
    ├── FRONTEND_INTEGRATION.md # راهنمای Frontend
    ├── DEPLOYMENT_GUIDE.md     # راهنمای استقرار
    ├── CHANGELOG.md            # تاریخچه تغییرات
    └── QUICK_START.md          # این فایل
```

---

## 🔧 دستورات مفید

### Development:
```bash
# اجرای Backend
pnpm --filter @codabiat/api dev

# اجرای Frontend
pnpm --filter @codabiat/web-client dev

# Build پکیج‌های مشترک
pnpm --filter @codabiat/database build
```

### Testing:
```bash
# تست API endpoints
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"test","email":"test@test.com","password":"123456"}'
```

### Database:
```bash
# اتصال به MongoDB
mongosh codabiat

# مشاهده collections
show collections

# مشاهده users
db.users.find().pretty()
```

---

## ❓ مشکلات رایج

### MongoDB اجرا نمی‌شود
```bash
# بررسی وضعیت
sudo systemctl status mongodb  # Linux
brew services list              # macOS
```

### Port 3002 قبلاً استفاده شده
```bash
# Kill کردن پروسس
lsof -ti:3002 | xargs kill -9
```

### خطای "Module not found"
```bash
# Clean و rebuild
pnpm clean
pnpm install
pnpm --filter @codabiat/database build
```

---

## 📚 مستندات بیشتر

- **Backend**: [BACKEND_SETUP.md](./BACKEND_SETUP.md) - راهنمای کامل نصب و تنظیم Backend
- **Frontend**: [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) - یکپارچه‌سازی و استفاده از API
- **Deployment**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - راهنمای استقرار در Production
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md) - تاریخچه کامل تغییرات

---

## 🎯 مرحله بعد

بعد از اجرای موفق، پیشنهاد می‌شود:

1. **آشنایی با API**: مستندات [BACKEND_SETUP.md](./BACKEND_SETUP.md#api-endpoints) را بخوانید
2. **آزمایش Lab Modules**: هر 25 ماژول را امتحان کنید
3. **یادگیری API Helpers**: فایل [api.ts](apps/web-client/src/lib/api.ts) را بررسی کنید
4. **مطالعه کد**: کامپوننت‌های Gallery و ArtworkDetail را مطالعه کنید

---

**موفق باشید! 🚀**

اگر مشکلی پیش آمد، به بخش [Troubleshooting در DEPLOYMENT_GUIDE](./DEPLOYMENT_GUIDE.md#مشکلات-رایج) مراجعه کنید.
