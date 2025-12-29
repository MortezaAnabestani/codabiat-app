# 🚀 شروع سریع (Quick Start)

## 3 مرحله برای اجرا:

### 1️⃣ نصب Dependencies
```bash
cd codabiat-monorepo
npm install
```

### 2️⃣ تنظیم Environment Variables
```bash
cp .env.example .env
```

ویرایش فایل `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/codabiat
JWT_SECRET=your-secret-key-here
```

### 3️⃣ اجرا

**⚠️ مهم: هر سرویس را در یک terminal جداگانه اجرا کنید**

**Terminal 1 - فرانت (اصلی):**
```bash
npm run dev:web
# باز می‌شود در: http://localhost:3000
```

**Terminal 2 - API (اختیاری):**
```bash
npm run dev:api
# باز می‌شود در: http://localhost:3001
```

**Terminal 3 - ادمین (اختیاری):**
```bash
npm run dev:admin
# باز می‌شود در: http://localhost:4000
```

یا اگر می‌خواهید همه را همزمان اجرا کنید:
```bash
npm run dev
# ولی ممکن است terminal شما hang کند - در این صورت از روش بالا استفاده کنید
```

---

## ⚠️ نکات مهم:

### اگر خطای "nx: command not found" گرفتید:
✅ **از `npm run` استفاده کنید** (نه `nx` مستقیم)

```bash
# ❌ اشتباه:
nx serve web-client

# ✅ درست:
npm run dev:web

# یا:
npx nx serve web-client
```

### اگر MongoDB ندارید:
دو گزینه دارید:

**گزینه 1: نصب محلی**
```bash
# Windows (با Chocolatey):
choco install mongodb

# macOS:
brew install mongodb-community
brew services start mongodb-community
```

**گزینه 2: استفاده از MongoDB Atlas (Cloud - رایگان)**
1. به https://www.mongodb.com/cloud/atlas بروید
2. یک cluster رایگان بسازید
3. Connection string را در `.env` قرار دهید

---

## 📋 دستورات کاربردی:

```bash
# اجرای همه
npm run dev

# Build کردن
npm run build

# لینت کردن
npm run lint

# نمایش گراف پروژه
npm run graph

# پاک کردن cache
npm run reset
```

---

## 🆘 مشکل دارید؟

### اگر `npm run dev` hang می‌کند:
✅ **هر سرویس را در terminal جداگانه اجرا کنید:**
```bash
# Terminal 1
npm run dev:web

# Terminal 2
npm run dev:api
```

### مشکلات دیگر:
1. مطمئن شوید MongoDB در حال اجراست
2. فایل `.env` را چک کنید
3. این دستورات را اجرا کنید:
```bash
npm run reset
rm -rf node_modules
npm install
```

4. [راهنمای کامل مشکلات](TROUBLESHOOTING.md) را مطالعه کنید
5. [راهنمای شروع](GETTING_STARTED.md) را ببینید

---

**همین! شما آماده‌اید! 🎉**
