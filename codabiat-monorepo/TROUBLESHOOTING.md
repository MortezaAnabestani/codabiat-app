# 🔧 راهنمای رفع مشکلات

## ❌ مشکل: `npm run dev` روی برخی سرویس‌ها می‌ماند

### علت:
وقتی همزمان چند سرویس اجرا می‌شوند، ممکن است terminal شما نتواند خروجی همه را به درستی نمایش دهد.

### ✅ راه‌حل‌ها:

#### راه‌حل 1: اجرای جداگانه (ساده‌ترین)

هر سرویس را در یک terminal جداگانه اجرا کنید:

**Terminal 1 - فرانت:**
```bash
npm run dev:web
# باز می‌شود در: http://localhost:3000
```

**Terminal 2 - API:**
```bash
npm run dev:api
# باز می‌شود در: http://localhost:3001
```

**Terminal 3 - ادمین (اختیاری):**
```bash
npm run dev:admin
# باز می‌شود در: http://localhost:4000
```

#### راه‌حل 2: اجرای فقط فرانت و API

اگر فقط به فرانت و API نیاز دارید:
```bash
npm run dev:web-api
```

#### راه‌حل 3: استفاده از `start` برای فرانت

```bash
npm start
```

این فقط فرانت را اجرا می‌کند.

---

## 🐛 مشکلات رایج دیگر

### 1. خطای "Cannot find module"

```bash
npm run reset
rm -rf node_modules package-lock.json
npm install
```

### 2. خطای "Port already in use"

**Windows:**
```bash
# پیدا کردن پروسس روی پورت 3000
netstat -ano | findstr :3000

# کشتن پروسس (جایگزین PID کنید)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# کشتن پروسس روی پورت 3000
lsof -ti:3000 | xargs kill -9
```

یا پورت‌ها را تغییر دهید:
- `apps/web-client/vite.config.mts` - تغییر `port: 3000`
- `apps/admin-dashboard/vite.config.mts` - تغییر `port: 4000`

### 3. خطای MongoDB Connection

```bash
# بررسی وضعیت MongoDB
# Windows:
net start MongoDB

# macOS:
brew services list

# Linux:
sudo systemctl status mongodb
```

اگر MongoDB ندارید، از MongoDB Atlas استفاده کنید:
https://www.mongodb.com/cloud/atlas

### 4. خطای TypeScript

```bash
# Build کردن packages
npm run reset
npx nx build types
npx nx build database
npx nx build auth
```

### 5. خطای ESLint

```bash
# غیرفعال موقت ESLint
npx nx serve web-client --skip-nx-cache
```

یا ESLint را در `apps/web-client/vite.config.mts` غیرفعال کنید.

### 6. Vite نمی‌تواند فایل‌ها را پیدا کند

مطمئن شوید که در دایرکتوری صحیح هستید:
```bash
cd d:/Sefareshat/codabiat-app/codabiat-monorepo
pwd  # باید monorepo root را نشان دهد
```

### 7. Changes اعمال نمی‌شود (Hot Reload کار نمی‌کند)

```bash
# ریستارت سرور با پاک کردن cache
npm run reset
npm run dev:web
```

---

## 🔍 دیباگ کردن

### چک کردن وضعیت Nx

```bash
# نمایش تمام پروژه‌ها
npx nx show projects

# نمایش dependency graph
npx nx graph

# بررسی کانفیگ یک پروژه
npx nx show project web-client
```

### چک کردن پورت‌ها

```bash
# Windows:
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :4000

# macOS/Linux:
lsof -i :3000
lsof -i :3001
lsof -i :4000
```

### لاگ‌های دقیق‌تر

```bash
# اجرا با verbose logging
NX_VERBOSE_LOGGING=true npm run dev:web
```

---

## 💡 توصیه‌ها برای Development

### برای شروع سریع:

1. **فقط فرانت** (اگر backend ندارید):
   ```bash
   npm run dev:web
   ```

2. **فرانت + API** (بدون ادمین):
   ```bash
   npm run dev:web-api
   ```

3. **همه** (در 3 terminal جداگانه):
   ```bash
   # Terminal 1
   npm run dev:web

   # Terminal 2
   npm run dev:api

   # Terminal 3
   npm run dev:admin
   ```

### استفاده از VS Code:

در VS Code می‌توانید چندین terminal باز کنید:
1. `Ctrl+Shift+`` (backtick) - باز کردن terminal
2. `+` کنار نام terminal - terminal جدید
3. هر terminal یک سرویس را اجرا کند

---

## 🆘 هنوز مشکل دارید؟

1. **Nx cache را پاک کنید:**
   ```bash
   npm run reset
   ```

2. **node_modules را دوباره نصب کنید:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build کردن packages:**
   ```bash
   npx nx build types
   npx nx build database
   npx nx build auth
   ```

4. **چک کردن فایل .env:**
   ```bash
   cat .env
   # مطمئن شوید MONGODB_URI و JWT_SECRET تنظیم شده‌اند
   ```

5. **اجرای clean build:**
   ```bash
   npm run reset
   npm run build
   npm run dev:web
   ```

---

## 📝 Tips

- همیشه از **3 terminal جداگانه** برای اجرای سرویس‌ها استفاده کنید (راحت‌تر است)
- اگر فقط روی فرانت کار می‌کنید، نیازی به اجرای API ندارید
- از `Ctrl+C` برای متوقف کردن سرویس‌ها استفاده کنید
- اگر terminal hang شد، آن را ببندید و دوباره باز کنید

**موفق باشید! 🚀**
