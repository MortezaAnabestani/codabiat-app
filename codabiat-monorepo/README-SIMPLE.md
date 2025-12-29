# Codabiat Monorepo (بدون Nx - ساده)

> **ساختار ساده با npm workspaces**

## 🏗️ ساختار

```
codabiat-monorepo/
├── apps/
│   ├── web-client/      # فرانت (Vite + React) - Port 3000
│   ├── api/             # سرور (Next.js) - Port 3001
│   └── admin-dashboard/ # ادمین (Vite + React) - Port 4000
│
├── packages/
│   ├── types/          # TypeScript Types
│   ├── database/       # MongoDB Models
│   ├── auth/           # Authentication
│   └── utils/          # Utilities
│
└── package.json        # Root workspace
```

## 🚀 نصب

```bash
cd codabiat-monorepo
npm install
```

## ▶️ اجرا

**هر کدام در یک terminal جداگانه:**

### Terminal 1 - فرانت:
```bash
npm run dev:web
```
➜ http://localhost:3000

### Terminal 2 - API:
```bash
npm run dev:api
```
➜ http://localhost:3001

### Terminal 3 - ادمین:
```bash
npm run dev:admin
```
➜ http://localhost:4000

## 📦 دستورات

| دستور | توضیح |
|-------|-------|
| `npm run dev:web` | اجرای فرانت |
| `npm run dev:api` | اجرای API |
| `npm run dev:admin` | اجرای ادمین |
| `npm start` | میانبر برای dev:web |
| `npm run build` | Build همه |
| `npm run build:web` | Build فرانت |
| `npm run build:api` | Build API |
| `npm run clean` | پاک کردن node_modules و dist |

## ⚙️ Environment Variables

```bash
cp .env.example .env
```

ویرایش `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/codabiat
JWT_SECRET=your-secret-key
VITE_GEMINI_API_KEY=your-api-key
```

## 🔧 چطور کار می‌کند؟

### npm workspaces
پروژه از **npm workspaces** استفاده می‌کند (بدون Nx). این یعنی:

- همه dependencies در root نصب می‌شوند
- packages به صورت symlink به هم وصل‌اند
- هر app و package یک `package.json` مستقل دارد

### Path Aliases
در [tsconfig.base.json](tsconfig.base.json) path aliases تنظیم شده:

```typescript
import { User } from '@codabiat/database';
import { generateToken } from '@codabiat/auth';
import { JWTPayload } from '@codabiat/types';
```

## 📝 افزودن Package جدید

1. فولدر بسازید در `packages/`:
```bash
mkdir packages/my-package
```

2. `package.json` اضافه کنید:
```json
{
  "name": "@codabiat/my-package",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

3. کد بنویسید در `packages/my-package/src/index.ts`

4. استفاده کنید:
```typescript
import { something } from '@codabiat/my-package';
```

## 🆘 مشکلات رایج

### Dependencies پیدا نمی‌شوند:
```bash
rm -rf node_modules
npm install
```

### TypeScript خطا می‌دهد:
مطمئن شوید path در `tsconfig.base.json` اضافه شده.

### Port in use:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

## 📚 ساختار فایل‌ها

### apps/web-client/
```
web-client/
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.tsx
│   └── main.tsx
├── vite.config.mts
└── package.json
```

### apps/api/
```
api/
├── src/app/api/
│   ├── auth/
│   ├── articles/
│   └── courses/
├── next.config.js
└── package.json
```

### packages/database/
```
database/
├── src/
│   ├── lib/
│   │   ├── connection.ts
│   │   └── models/
│   │       ├── User.ts
│   │       ├── Article.ts
│   │       └── Course.ts
│   └── index.ts
└── package.json
```

## 💡 نکات

1. **هیچ build لازم نیست** - packages مستقیماً از `src` import می‌شوند
2. **تغییرات فوری اعمال می‌شوند** - چون از source استفاده می‌شود
3. **ساده و سریع** - بدون پیچیدگی Nx
4. **npm workspaces** - استاندارد npm

---

**خیلی ساده‌تر از Nx! 🎉**
