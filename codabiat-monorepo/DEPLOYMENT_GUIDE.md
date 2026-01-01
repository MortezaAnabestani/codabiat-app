# راهنمای راه‌اندازی و استقرار سیستم کدبیات

این مستند راهنمای کامل برای راه‌اندازی، توسعه و استقرار پروژه کدبیات است.

---

## 📋 فهرست مطالب

1. [پیش‌نیازها](#پیش-نیازها)
2. [راه‌اندازی اولیه](#راه-اندازی-اولیه)
3. [راه‌اندازی Backend](#راه-اندازی-backend)
4. [راه‌اندازی Frontend](#راه-اندازی-frontend)
5. [اجرای پروژه](#اجرای-پروژه)
6. [ساختار پروژه](#ساختار-پروژه)
7. [توضیحات تکنولوژی‌ها](#توضیحات-تکنولوژی-ها)
8. [استقرار در Production](#استقرار-در-production)
9. [مشکلات رایج](#مشکلات-رایج)

---

## پیش‌نیازها

قبل از شروع، اطمینان حاصل کنید که موارد زیر نصب شده‌اند:

### نرم‌افزارهای مورد نیاز:

- **Node.js** (نسخه 18 یا بالاتر) - [دانلود](https://nodejs.org)
- **pnpm** (نسخه 8 یا بالاتر) - برای مدیریت monorepo
  ```bash
  npm install -g pnpm
  ```
- **MongoDB** (نسخه 5 یا بالاتر) - [راهنمای نصب](./BACKEND_SETUP.md#نصب-mongodb)

### بررسی نصب:

```bash
node --version    # باید v18+ نمایش دهد
pnpm --version    # باید v8+ نمایش دهد
mongod --version  # باید v5+ نمایش دهد
```

---

## راه‌اندازی اولیه

### 1. کلون کردن پروژه

```bash
git clone <repository-url>
cd codabiat-monorepo
```

### 2. نصب وابستگی‌ها

```bash
pnpm install
```

این دستور تمام وابستگی‌های پروژه را در تمام workspaceها نصب می‌کند.

---

## راه‌اندازی Backend

### 1. نصب و راه‌اندازی MongoDB

برای راهنمای کامل نصب MongoDB، به [BACKEND_SETUP.md](./BACKEND_SETUP.md#نصب-mongodb) مراجعه کنید.

**خلاصه دستورات:**

#### Windows:
```bash
# نصب MongoDB Community Edition از سایت رسمی
# سرویس MongoDB به صورت خودکار اجرا می‌شود
```

#### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu):
```bash
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 2. تنظیم متغیرهای محیطی Backend

```bash
cd apps/api
cp .env.example .env
```

فایل `.env` را ویرایش کنید:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/codabiat

# JWT Secret (یک رشته تصادفی قوی)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Environment
NODE_ENV=development

# API Port
PORT=3002
```

**نکته امنیتی**: برای تولید JWT Secret قوی:

```bash
# در macOS/Linux:
openssl rand -base64 32

# یا در Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. ساخت پکیج‌های مشترک

```bash
# از روت پروژه:
pnpm --filter @codabiat/database build
pnpm --filter @codabiat/auth build
```

---

## راه‌اندازی Frontend

### 1. تنظیم متغیرهای محیطی Frontend

```bash
cd apps/web-client
cp .env.example .env
```

فایل `.env` را ویرایش کنید:

```env
# API Base URL
VITE_API_URL=http://localhost:3002
```

### 2. اضافه کردن ROM بازی Comix Zone (اختیاری)

برای فعال‌سازی ویژگی بازی Comix Zone:

1. فایل ROM بازی (`comix-zone.bin`) را دانلود کنید
2. آن را در مسیر زیر قرار دهید:
   ```
   apps/web-client/public/roms/comix-zone.bin
   ```

**توجه**: استفاده از ROM بازی باید طبق قوانین کپی‌رایت باشد.

---

## اجرای پروژه

### حالت Development

#### روش 1: اجرای همزمان (توصیه می‌شود)

از روت پروژه:

```bash
# اجرای Backend (API)
pnpm --filter @codabiat/api dev

# در ترمینال دیگر، اجرای Frontend
pnpm --filter @codabiat/web-client dev
```

#### روش 2: اجرای جداگانه

**Backend:**
```bash
cd apps/api
pnpm dev
# API در آدرس http://localhost:3002 اجرا می‌شود
```

**Frontend:**
```bash
cd apps/web-client
pnpm dev
# Frontend در آدرس http://localhost:5173 اجرا می‌شود
```

### بررسی سلامت سرویس‌ها

بعد از اجرا:

1. **Backend Health Check:**
   ```bash
   curl http://localhost:3002/api/health
   # باید پاسخ JSON با status: "ok" برگرداند
   ```

2. **MongoDB Connection:**
   ```bash
   mongosh codabiat
   # باید به دیتابیس متصل شود
   ```

3. **Frontend:**
   - مرورگر را به `http://localhost:5173` باز کنید
   - باید صفحه اصلی با انیمیشن Comix Zone نمایش داده شود

---

## ساختار پروژه

```
codabiat-monorepo/
├── apps/
│   ├── api/                      # Backend API (Next.js 15 App Router)
│   │   ├── src/
│   │   │   └── app/
│   │   │       └── api/
│   │   │           ├── auth/     # احراز هویت
│   │   │           ├── artworks/ # مدیریت آثار
│   │   │           ├── articles/ # مقالات
│   │   │           ├── upload/   # آپلود فایل
│   │   │           └── files/    # دریافت فایل از GridFS
│   │   ├── .env                  # متغیرهای محیطی
│   │   └── package.json
│   │
│   ├── web-client/               # Frontend (React 19 + Vite)
│   │   ├── src/
│   │   │   ├── components/       # کامپوننت‌های قابل استفاده مجدد
│   │   │   ├── contexts/         # Context های React
│   │   │   │   └── AuthContext.tsx
│   │   │   ├── lib/
│   │   │   │   └── api.ts        # Helper های API
│   │   │   ├── pages/            # صفحات اصلی
│   │   │   │   ├── GalleryPage.tsx
│   │   │   │   ├── ArtworkDetailPage.tsx
│   │   │   │   ├── AuthPage.tsx
│   │   │   │   └── ...
│   │   │   └── App.tsx           # Router اصلی
│   │   ├── public/
│   │   │   └── roms/             # فایل‌های ROM بازی
│   │   ├── .env                  # متغیرهای محیطی
│   │   └── package.json
│   │
│   └── admin-dashboard/          # داشبورد مدیریت (در حال توسعه)
│
├── packages/
│   ├── auth/                     # پکیج احراز هویت مشترک
│   ├── database/                 # مدل‌های Mongoose
│   │   └── src/lib/models/
│   │       ├── User.ts
│   │       ├── Artwork.ts
│   │       └── Article.ts
│   ├── types/                    # تایپ‌های TypeScript مشترک
│   └── utils/                    # ابزارهای کمکی
│
├── BACKEND_SETUP.md              # راهنمای نصب Backend
├── FRONTEND_INTEGRATION.md       # راهنمای یکپارچه‌سازی Frontend
└── DEPLOYMENT_GUIDE.md           # این فایل
```

---

## توضیحات تکنولوژی‌ها

### Backend Stack

- **Next.js 15 App Router**: برای API routes با ساختار مدرن
- **MongoDB + Mongoose**: دیتابیس NoSQL با ODM
- **GridFS**: ذخیره فایل‌های بزرگ در MongoDB
- **JWT**: احراز هویت با JSON Web Tokens
- **bcryptjs**: هش کردن رمز عبور

### Frontend Stack

- **React 19**: جدیدترین نسخه React با بهبودهای عملکردی
- **Vite**: ابزار build سریع
- **React Router v6**: مسیریابی SPA
- **Tailwind CSS**: فریمورک CSS utility-first
- **Three.js**: گرافیک 3D
- **D3.js**: نمودارها و ویژوالیزیشن
- **EmulatorJS**: اجرای بازی‌های رترو در مرورگر

### Shared Packages

- **@codabiat/auth**: لاجیک احراز هویت مشترک
- **@codabiat/database**: مدل‌های دیتابیس و اتصال
- **@codabiat/types**: تایپ‌های TypeScript
- **@codabiat/utils**: توابع کمکی

---

## استقرار در Production

### 1. آماده‌سازی Backend

```bash
cd apps/api

# تنظیم متغیرهای محیطی Production
nano .env

# تغییر موارد زیر:
NODE_ENV=production
MONGODB_URI=mongodb://<production-server>/codabiat
JWT_SECRET=<strong-random-secret>

# ساخت پروژه
pnpm build

# اجرا
pnpm start
```

### 2. آماده‌سازی Frontend

```bash
cd apps/web-client

# تنظیم متغیرهای محیطی Production
nano .env

# تغییر:
VITE_API_URL=https://api.yourdomain.com

# ساخت پروژه
pnpm build

# فایل‌های نهایی در پوشه dist/
```

### 3. استقرار Backend

**گزینه 1: سرور مستقیم (VPS)**

```bash
# نصب PM2 برای مدیریت پروسس
npm install -g pm2

# اجرا با PM2
cd apps/api
pm2 start npm --name "codabiat-api" -- start
pm2 save
pm2 startup
```

**گزینه 2: Docker**

```dockerfile
# Dockerfile (در apps/api/)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
```

```bash
docker build -t codabiat-api .
docker run -d -p 3002:3002 --env-file .env codabiat-api
```

**گزینه 3: Vercel / Railway / Render**

این پلتفرم‌ها Next.js را به صورت خودکار شناسایی می‌کنند:

1. متغیرهای محیطی را در پنل تنظیم کنید
2. پروژه را push کنید
3. استقرار خودکار انجام می‌شود

### 4. استقرار Frontend

**گزینه 1: Nginx**

```nginx
# /etc/nginx/sites-available/codabiat
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/codabiat/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**گزینه 2: Vercel / Netlify**

```bash
# نصب CLI
npm install -g vercel

# استقرار
cd apps/web-client
vercel --prod
```

**گزینه 3: GitHub Pages**

```bash
# اضافه کردن به package.json:
"homepage": "https://yourusername.github.io/codabiat"

# ساخت و استقرار
pnpm build
pnpm deploy  # اگر gh-pages نصب باشد
```

### 5. تنظیمات MongoDB Production

برای استفاده در production:

**MongoDB Atlas (توصیه می‌شود)**:
1. ساخت حساب در [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. ساخت Cluster جدید
3. کپی Connection String
4. تنظیم در `MONGODB_URI`

**یا MongoDB خودمیزبانی**:
```bash
# نصب MongoDB روی سرور
sudo apt install mongodb-server

# فعال‌سازی authentication
mongo
> use admin
> db.createUser({
    user: "admin",
    pwd: "strongpassword",
    roles: ["root"]
})
> exit

# تنظیم MONGODB_URI:
mongodb://admin:strongpassword@localhost:27017/codabiat?authSource=admin
```

---

## مشکلات رایج

### 1. خطای "Cannot connect to MongoDB"

**علت**: MongoDB در حال اجرا نیست یا Connection String اشتباه است.

**راه‌حل**:
```bash
# بررسی وضعیت MongoDB
sudo systemctl status mongodb  # Linux
brew services list              # macOS
net start MongoDB               # Windows

# راه‌اندازی مجدد
sudo systemctl restart mongodb  # Linux
brew services restart mongodb   # macOS
net stop MongoDB && net start MongoDB  # Windows
```

### 2. خطای "Port 3002 already in use"

**علت**: پروسس دیگری روی پورت 3002 در حال اجرا است.

**راه‌حل**:
```bash
# پیدا کردن و kill کردن پروسس
lsof -ti:3002 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3002   # Windows
```

یا پورت را در `.env` تغییر دهید:
```env
PORT=3003
```

### 3. خطای "Unauthorized" در API

**علت**: Token نامعتبر یا منقضی شده است.

**راه‌حل**:
```javascript
// Clear localStorage و دوباره login کنید
localStorage.clear();
// سپس صفحه login را رفرش کنید
```

### 4. خطای "Module not found" بعد از نصب

**علت**: وابستگی‌های workspace به درستی build نشده‌اند.

**راه‌حل**:
```bash
# Clean و rebuild
pnpm clean
pnpm install
pnpm --filter @codabiat/database build
pnpm --filter @codabiat/auth build
```

### 5. CORS Error

**علت**: Frontend و Backend روی domainهای متفاوت هستند.

**راه‌حل**: در `apps/api/src/middleware.ts` CORS را تنظیم کنید:
```typescript
export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin');

  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', origin || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}
```

### 6. GridFS Upload Failed

**علت**: حجم فایل بیش از حد مجاز یا نوع فایل نامعتبر است.

**راه‌حل**: محدودیت‌های upload را بررسی کنید:
- Images: حداکثر 5MB (JPEG, PNG, GIF, WebP)
- Audio: حداکثر 20MB (MP3, WAV, OGG)
- Video: حداکثر 50MB (MP4, WebM)

---

## چک‌لیست نهایی قبل از Production

- [ ] تمام environment variables در production تنظیم شده‌اند
- [ ] JWT_SECRET قوی و تصادفی است (نه مقدار پیش‌فرض!)
- [ ] MongoDB authentication فعال است
- [ ] Backup strategy برای دیتابیس تعریف شده است
- [ ] HTTPS/SSL certificate نصب شده است
- [ ] Rate limiting برای API فعال است
- [ ] Error monitoring (Sentry, LogRocket) راه‌اندازی شده است
- [ ] Analytics (Google Analytics, Plausible) اضافه شده است
- [ ] Performance testing انجام شده است
- [ ] Security audit انجام شده است (OWASP)
- [ ] Documentation بروز است

---

## لینک‌های مفید

- [مستندات Backend](./BACKEND_SETUP.md)
- [مستندات Frontend Integration](./FRONTEND_INTEGRATION.md)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## تماس و پشتیبانی

برای سوالات یا مشکلات:
- ایجاد Issue در GitHub
- مراجعه به بخش [Troubleshooting](#مشکلات-رایج)
- بررسی مستندات پروژه

---

**آخرین بروزرسانی**: 2025-12-31

موفق باشید! 🚀🎨
