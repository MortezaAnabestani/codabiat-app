# 📚 دليل نظام المدونة - Codabiat Blog System

## نظرة عامة

تم تطوير نظام مدونة متكامل لمنصة Codabiat يتضمن:
- ✅ نظام إدارة محتوى (CMS) للكتّاب
- ✅ نظام السلاسل (Article Series)
- ✅ نظام النشانات (Bookmarks)
- ✅ قائمة "اقرأ لاحقاً" (Read Later)
- ✅ نظام الإعجاب والمشاهدات
- ✅ بحث وفلترة متقدمة

---

## 🗄️ قاعدة البيانات - Database Models

### 1. Article Model
**الموقع:** `packages/database/src/lib/models/Article.ts`

الحقول الجديدة المضافة:
```typescript
excerpt: string;           // ملخص المقالة (حد أقصى 300 حرف)
series?: ObjectId;         // ربط بسلسلة مقالات
seriesOrder?: number;      // ترتيب المقالة في السلسلة
publishedAt?: Date;        // تاريخ النشر
featured: boolean;         // مقالة مميزة
readTime: number;          // وقت القراءة بالدقائق
likeCount: number;         // عدد الإعجابات
bookmarkCount: number;     // عدد النشانات
```

### 2. ArticleSeries Model
**الموقع:** `packages/database/src/lib/models/ArticleSeries.ts`

نموذج جديد لإدارة سلاسل المقالات:
```typescript
{
  title: string;
  titleEn?: string;
  description: string;
  slug: string;            // معرّف فريد للرابط
  coverImage?: string;
  author: ObjectId;
}
```

### 3. Bookmark Model
**الموقع:** `packages/database/src/lib/models/Bookmark.ts`

نظام النشانات:
```typescript
{
  user: ObjectId;
  article: ObjectId;
  createdAt: Date;
}
```
- Index فريد على (user, article) لمنع التكرار

### 4. ReadLater Model
**الموقع:** `packages/database/src/lib/models/ReadLater.ts`

قائمة "اقرأ لاحقاً":
```typescript
{
  user: ObjectId;
  article: ObjectId;
  completed: boolean;      // تم القراءة؟
  createdAt: Date;
}
```

---

## 🔌 API Endpoints

### Articles

#### `GET /api/articles`
جلب قائمة المقالات مع فلترة متقدمة

**Query Parameters:**
- `published=true` - المقالات المنشورة فقط
- `featured=true` - المقالات المميزة
- `category=generative` - فلترة حسب الفئة
- `series=seriesId` - مقالات سلسلة معينة
- `search=keyword` - البحث في العنوان والمحتوى
- `page=1&limit=10` - الترقيم

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### `GET /api/articles/:id`
جلب مقالة واحدة مع المقالات المرتبطة

**Response:**
```json
{
  "success": true,
  "data": {
    "article": {...},
    "relatedArticles": [...]
  }
}
```

#### `POST /api/articles` (محمي)
إنشاء مقالة جديدة

**Body:**
```json
{
  "title": "عنوان المقالة",
  "titleEn": "Article Title",
  "excerpt": "ملخص المقالة...",
  "content": "محتوى المقالة...",
  "contentEn": "English content...",
  "category": "generative",
  "tags": ["AI", "art"],
  "series": "seriesId",
  "seriesOrder": 1,
  "readTime": 10,
  "featured": false
}
```

#### `PUT /api/articles/:id` (محمي)
تحديث مقالة

#### `DELETE /api/articles/:id` (محمي)
حذف مقالة

#### `POST /api/articles/:id/like` (محمي)
إعجاب بمقالة

---

### Bookmarks

#### `GET /api/articles/bookmark` (محمي)
جلب نشانات المستخدم

#### `POST /api/articles/bookmark` (محمي)
إضافة نشان

**Body:**
```json
{
  "articleId": "articleId"
}
```

#### `DELETE /api/articles/bookmark?articleId=xxx` (محمي)
حذف نشان

---

### Read Later

#### `GET /api/articles/readlater` (محمي)
جلب قائمة "اقرأ لاحقاً"

**Query Parameters:**
- `completed=true/false` - فلترة حسب حالة القراءة

#### `POST /api/articles/readlater` (محمي)
إضافة للقائمة

#### `PUT /api/articles/readlater` (محمي)
تحديث حالة القراءة

**Body:**
```json
{
  "articleId": "articleId",
  "completed": true
}
```

#### `DELETE /api/articles/readlater?articleId=xxx` (محمي)
حذف من القائمة

---

### Article Series

#### `GET /api/articles/series`
جلب جميع السلاسل

#### `POST /api/articles/series` (محمي)
إنشاء سلسلة جديدة

**Body:**
```json
{
  "title": "اسم السلسلة",
  "titleEn": "Series Name",
  "description": "وصف السلسلة",
  "slug": "series-slug",
  "coverImage": "url"
}
```

#### `GET /api/articles/series/:slug`
جلب سلسلة مع مقالاتها

#### `PUT /api/articles/series/:slug` (محمي)
تحديث سلسلة

#### `DELETE /api/articles/series/:slug` (محمي)
حذف سلسلة

---

## 🎨 صفحات الواجهة الأمامية

### صفحات عامة

#### 1. ArticlesPage (`/articles`)
**الموقع:** `apps/web-client/src/pages/ArticlesPage.tsx`

صفحة عرض جميع المقالات مع:
- بحث متقدم
- فلترة حسب الفئة
- عرض المقالات المميزة
- معلومات المؤلف والإحصائيات

#### 2. ArticleDetailPage (`/articles/:id`)
**الموقع:** `apps/web-client/src/pages/ArticleDetailPage.tsx`

صفحة عرض مقالة واحدة مع:
- محتوى كامل
- أزرار الإعجاب والنشان والقراءة لاحقاً
- المقالات المرتبطة في نفس السلسلة
- معلومات المؤلف والإحصائيات

#### 3. SeriesPage (`/series/:slug`)
**الموقع:** `apps/web-client/src/pages/SeriesPage.tsx`

صفحة عرض سلسلة مقالات مع:
- معلومات السلسلة
- قائمة المقالات مرتبة
- أرقام الترتيب

#### 4. BookmarksPage (`/bookmarks`)
**الموقع:** `apps/web-client/src/pages/BookmarksPage.tsx`

صفحة نشانات المستخدم (محمية)

#### 5. ReadLaterPage (`/readlater`)
**الموقع:** `apps/web-client/src/pages/ReadLaterPage.tsx`

صفحة قائمة "اقرأ لاحقاً" (محمية) مع:
- فلترة (الكل / في الانتظار / تم القراءة)
- تحديد كـ "تم القراءة"

---

### صفحات CMS (للكتّاب)

#### 1. WriterDashboard (`/writer/dashboard`)
**الموقع:** `apps/web-client/src/pages/WriterDashboard.tsx`

لوحة تحكم الكاتب مع:
- قائمة جميع مقالاته
- فلترة (الكل / منشور / مسودة)
- أزرار النشر/التحرير/الحذف
- إحصائيات (مشاهدات، إعجابات، نشانات)

#### 2. ArticleEditor (`/writer/new-article` & `/writer/edit/:id`)
**الموقع:** `apps/web-client/src/pages/ArticleEditor.tsx`

محرر المقالات مع:
- نموذج كامل لإنشاء/تحرير المقالات
- دعم المحتوى ثنائي اللغة (فارسي/إنجليزي)
- اختيار السلسلة والترتيب
- معاينة مباشرة
- حفظ كمسودة أو نشر مباشرة

#### 3. SeriesManager (`/writer/series`)
**الموقع:** `apps/web-client/src/pages/SeriesManager.tsx`

إدارة السلاسل مع:
- قائمة جميع السلاسل
- إنشاء/تحرير/حذف السلاسل
- إنشاء slug تلقائي

---

## 🎯 Routes في App.tsx

تم إضافة Routes التالية:

```typescript
{/* Blog/Articles Routes */}
<Route path="/articles" element={<ArticlesPage />} />
<Route path="/articles/:id" element={<ArticleDetailPage />} />
<Route path="/series/:slug" element={<SeriesPage />} />
<Route path="/bookmarks" element={<BookmarksPage />} />
<Route path="/readlater" element={<ReadLaterPage />} />

{/* Writer/CMS Routes */}
<Route path="/writer/dashboard" element={<WriterDashboard />} />
<Route path="/writer/new-article" element={<ArticleEditor />} />
<Route path="/writer/edit/:id" element={<ArticleEditor />} />
<Route path="/writer/series" element={<SeriesManager />} />
```

---

## 🔐 المصادقة والصلاحيات

- **Endpoints العامة:** يمكن لأي شخص قراءة المقالات المنشورة
- **Endpoints المحمية:** تتطلب JWT token في header
- **التحقق من الملكية:**
  - الكاتب يمكنه فقط تعديل/حذف مقالاته
  - Admin يمكنه تعديل/حذف جميع المقالات

---

## 🎨 تصميم Comix Zone

جميع الصفحات تتبع نمط Comix Zone:
- حدود سميكة سوداء (border-4)
- ظلال صلبة (shadow-[6px_6px_0px_0px_rgba(0,0,0,1)])
- خطوط عريضة (font-black)
- ألوان زاهية مع تدرجات
- تأثيرات hover مع حركة

---

## 📝 ملاحظات التطوير

### 1. إضافة مقالة جديدة:
1. سجّل الدخول
2. اذهب إلى `/writer/dashboard`
3. اضغط "+ مقاله جدید"
4. املأ النموذج
5. احفظ كمسودة أو انشر مباشرة

### 2. إنشاء سلسلة:
1. اذهب إلى `/writer/series`
2. اضغط "+ سری جدید"
3. املأ المعلومات
4. احفظ
5. عند إنشاء مقالة، اختر السلسلة وحدد الترتيب

### 3. نشر مقالة:
- عند النشر لأول مرة، يتم تعيين `publishedAt` تلقائياً
- يمكن التبديل بين "منشور" و "مسودة" في أي وقت

---

## 🚀 الخطوات التالية المقترحة

1. **نظام التعليقات:** إضافة تعليقات على المقالات
2. **إشعارات:** إشعار المستخدمين بمقالات جديدة في سلاسل متابعة
3. **RSS Feed:** توفير RSS feed للمقالات
4. **Markdown Editor:** محرر Markdown متقدم مع معاينة
5. **تحميل الصور:** نظام رفع صور للكتّاب
6. **Analytics:** لوحة إحصائيات متقدمة للكتّاب
7. **Draft Auto-save:** حفظ تلقائي للمسودات
8. **SEO:** تحسين SEO للمقالات

---

## 📞 الدعم

للمزيد من المعلومات أو المساعدة، راجع:
- الكود المصدري في `apps/api/src/app/api/articles/`
- الصفحات في `apps/web-client/src/pages/`
- النماذج في `packages/database/src/lib/models/`

---

**تم التطوير بواسطة:** Claude Sonnet 4.5
**التاريخ:** 2026-01-01
**الإصدار:** 1.0
