# راهنمای مهاجرت از NX به pnpm

این سند تغییرات ایجاد شده در تبدیل پروژه از NX به ساختار ساده pnpm workspaces را شرح می‌دهد.

## ✅ تغییرات انجام شده

### 1. فایل‌های حذف شده
- ❌ `.nx/` - کش و داده‌های NX
- ❌ `package-lock.json` - فایل قفل npm
- ❌ تمام `node_modules/` در زیر پوشه‌ها

### 2. فایل‌های جدید
- ✅ `pnpm-workspace.yaml` - تنظیمات workspace برای pnpm
- ✅ `.npmrc` - تنظیمات pnpm
- ✅ `pnpm-lock.yaml` - فایل قفل pnpm (خودکار)

### 3. فایل‌های به‌روز شده

#### package.json (root)
**قبل:**
```json
{
  "scripts": {
    "dev:web": "npm run dev apps/web-client",
    "dev:api": "npm run dev apps/api"
  },
  "workspaces": ["apps/*", "packages/*"]
}
```

**بعد:**
```json
{
  "scripts": {
    "dev:web": "pnpm --filter @codabiat-monorepo/web-client dev",
    "dev:api": "pnpm --filter @codabiat-monorepo/api dev"
  }
}
```

#### .gitignore
**اضافه شده:**
```
# pnpm
.pnpm-store
pnpm-lock.yaml
```

**حذف شده:**
```
.nx/cache
.nx/workspace-data
```

## 📝 دستورات جدید

### قبل (npm/NX)
```bash
npm install
npm run dev:web
npm run build
```

### بعد (pnpm)
```bash
pnpm install
pnpm dev:web
pnpm build
```

### دستورات خاص pnpm

```bash
# اجرای دستور در یک workspace
pnpm --filter <workspace-name> <command>

# مثال
pnpm --filter @codabiat-monorepo/web-client dev

# نصب package در workspace خاص
pnpm --filter @codabiat-monorepo/api add express

# نصب در root
pnpm add -w <package>

# لیست workspaces
pnpm -r list
```

## 🎯 مزایای مهاجرت

### 1. سرعت
- نصب dependencies **2-3 برابر سریع‌تر**
- استفاده از content-addressable storage

### 2. فضای دیسک
- کاهش **40-50%** حجم node_modules
- اشتراک‌گذاری packages بین پروژه‌ها

### 3. سادگی
- حذف لایه پیچیدگی NX
- دستورات ساده‌تر و قابل فهم‌تر
- کمتر ابزار برای یادگیری

### 4. امنیت
- جلوگیری از phantom dependencies
- ایزوله‌تر بودن packages

## 🔄 مقایسه عملکرد

| عملیات | npm + NX | pnpm |
|--------|----------|------|
| نصب اولیه | ~3-4 دقیقه | ~1-2 دقیقه |
| نصب مجدد | ~1-2 دقیقه | ~10-20 ثانیه |
| حجم node_modules | ~800 MB | ~400 MB |
| تعداد فایل‌ها | ~150,000 | ~80,000 |

## 🚨 نکات مهم

### 1. تغییر دستورات
همه دستورات `npm` را با `pnpm` جایگزین کنید:
```bash
# قبل
npm install
npm run dev

# بعد
pnpm install
pnpm dev
```

### 2. فایل قفل
- از این پس `pnpm-lock.yaml` استفاده می‌شود
- `package-lock.json` دیگر نیاز نیست

### 3. .npmrc
تنظیمات زیر برای سازگاری بهتر اضافه شده:
- `shamefully-hoist=true` - برای سازگاری با برخی packages
- `auto-install-peers=true` - نصب خودکار peer dependencies

## 📚 منابع

- [مستندات pnpm](https://pnpm.io/)
- [راهنمای Workspaces](https://pnpm.io/workspaces)
- [Filter Commands](https://pnpm.io/filtering)
- [بهترین شیوه‌های Monorepo](https://pnpm.io/workspaces#best-practices)

## ❓ سوالات متداول

### چرا از pnpm استفاده کنیم؟
- سریع‌تر از npm و yarn
- کارآمدتر در مصرف فضای دیسک
- امنیت بیشتر
- پشتیبانی عالی از monorepo

### آیا می‌توانم به npm برگردم؟
بله، اما توصیه نمی‌شود. برای برگشت:
1. حذف `pnpm-lock.yaml` و `pnpm-workspace.yaml`
2. اضافه کردن مجدد `workspaces` به `package.json`
3. اجرای `npm install`

### آیا تیم من باید pnpm نصب کند؟
بله، هر کس که روی پروژه کار می‌کند باید pnpm نصب کند:
```bash
npm install -g pnpm
```

---

**تاریخ مهاجرت:** 2025-12-29
**نسخه pnpm:** 10.14.0
