# Codabiat Monorepo

> **پلتفرم ادبیات الکترونیک فارسی - ساختار مدرن با pnpm workspaces**

## 📦 ساختار

```
codabiat-monorepo/
├── apps/
│   ├── web-client/      # فرانت اصلی (React + Vite) → Port 3000
│   ├── api/             # سرور (Next.js 15) → Port 3001
│   └── admin-dashboard/ # داشبورد ادمین (React + Vite) → Port 4000
│
└── packages/
    ├── types/          # TypeScript Types مشترک
    ├── database/       # MongoDB Models & Schemas
    ├── auth/           # سیستم احراز هویت (JWT)
    └── utils/          # توابع کمکی
```

## 🚀 شروع سریع

### پیش‌نیاز: نصب pnpm
```bash
npm install -g pnpm
```

### 1. نصب
```bash
cd codabiat-monorepo
pnpm install
```

### 2. تنظیم Environment
```bash
cp .env.example .env
```

ویرایش `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/codabiat
JWT_SECRET=your-secret-key
VITE_GEMINI_API_KEY=your-api-key
```

### 3. اجرا

**هر کدام در یک terminal جداگانه:**

```bash
# Terminal 1 - فرانت
pnpm dev:web
# → http://localhost:3000

# Terminal 2 - API (اختیاری)
pnpm dev:api
# → http://localhost:3001

# Terminal 3 - ادمین (اختیاری)
pnpm dev:admin
# → http://localhost:4000
```

یا میانبر:
```bash
pnpm start  # فقط فرانت
```

## 📝 دستورات

| دستور | توضیح |
|-------|-------|
| `pnpm start` | اجرای فرانت (میانبر) |
| `pnpm dev:web` | اجرای فرانت |
| `pnpm dev:api` | اجرای API |
| `pnpm dev:admin` | اجرای ادمین |
| `pnpm build` | Build همه پروژه‌ها |
| `pnpm build:web` | Build فقط فرانت |
| `pnpm build:api` | Build فقط API |
| `pnpm clean` | پاک کردن همه node_modules و dist |

### دستورات پیشرفته pnpm

```bash
# اجرای دستور در یک workspace خاص
pnpm --filter @codabiat-monorepo/web-client dev

# نصب یک package در یک workspace خاص
pnpm --filter @codabiat-monorepo/api add express

# نصب یک package در root
pnpm add -w <package-name>

# به‌روزرسانی تمام dependencies
pnpm update

# نمایش لیست workspaces
pnpm -r exec pwd
```

## 🛠️ تکنولوژی‌ها

- **Frontend**: React 19 + Vite + TypeScript
- **Backend**: Next.js 15 (App Router)
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt
- **3D**: Three.js
- **Viz**: D3.js
- **AI**: Google Gemini API
- **Monorepo**: pnpm workspaces (بدون Nx!)

## 🆘 مشکلات رایج

### صفحه سیاه نشان می‌دهد
مطمئن شوید Console browser را برای خطاها چک کنید (F12)

### Port in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Cannot find module
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 💡 مزایای pnpm

✅ **سریع‌تر** - نصب dependencies سریع‌تر از npm و yarn
✅ **کارآمد** - صرفه‌جویی فضای دیسک با content-addressable storage
✅ **ایمن‌تر** - جلوگیری از phantom dependencies
✅ **ساده** - مشابه npm، یادگیری آسان
✅ **Monorepo** - پشتیبانی عالی از workspaces

## 🆚 مقایسه با ساختار قبلی

| ویژگی | قبل (NX) | حالا (pnpm) |
|-------|----------|-------------|
| سرعت نصب | متوسط | سریع ⚡ |
| حجم node_modules | زیاد | کم 💾 |
| پیچیدگی | زیاد | کم 🎯 |
| قابلیت یادگیری | سخت | آسان 📚 |
| ابزارهای اضافی | بله (NX) | خیر ❌ |  

---

**ساخته شده برای جامعه فارسی‌زبان ❤️**
