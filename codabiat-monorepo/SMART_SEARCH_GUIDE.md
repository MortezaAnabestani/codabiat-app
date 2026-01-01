# 🔍 دليل نظام البحث الذكي - Smart Search System Guide

## نظرة عامة

تم تطوير نظام بحث ذكي متقدم يشمل:
- ✅ **Full-text Search** - بحث نصي كامل باستخدام MongoDB Text Index
- ✅ **فلترة متقدمة** - فلترة حسب النوع، الصعوبة، اللغة، التقنية
- ✅ **توصيات ذكية** - خوارزمية توصيات مبنية على ML principles
- ✅ **محتوى مرتبط AI-based** - اقتراحات محتوى ذكية
- ✅ **تاريخ البحث** - حفظ وإدارة عمليات البحث السابقة
- ✅ **اقتراحات تلقائية** - auto-suggestions أثناء الكتابة

---

## 🗄️ قاعدة البيانات - Database Models

### 1. SearchHistory Model
**الموقع:** `packages/database/src/lib/models/SearchHistory.ts`

يحفظ سجل عمليات البحث للمستخدمين:
```typescript
{
  user?: ObjectId;           // المستخدم (اختياري للزوار)
  query: string;             // نص البحث
  filters: {
    category?: string;
    difficulty?: string;
    language?: string;
    contentType?: string;    // article, course, artwork
  };
  resultsCount: number;      // عدد النتائج
  clickedResults: ObjectId[]; // المحتوى الذي تم النقر عليه
  createdAt: Date;
}
```

**Indexes:**
- `user + createdAt` - لجلب السجل بسرعة
- `query` (text index) - للبحث في السجل
- `createdAt` - للترتيب الزمني

### 2. UserPreferences Model
**الموقع:** `packages/database/src/lib/models/UserPreferences.ts`

تفضيلات وسلوك المستخدم:
```typescript
{
  user: ObjectId;

  // اهتمامات المستخدم
  favoriteCategories: string[];      // الفئات المفضلة
  favoriteTechniques: string[];      // التقنيات المفضلة
  preferredLanguage: 'fa' | 'en' | 'both';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'all';

  // سجل التفاعل (للتوصيات)
  viewedArticles: ObjectId[];
  viewedCourses: ObjectId[];
  viewedArtworks: ObjectId[];
  completedCourses: ObjectId[];

  // مقاييس التفاعل
  searchKeywords: string[];          // آخر 50 كلمة بحث
  interactionScore: {
    articles: number;
    courses: number;
    lab: number;
    artworks: number;
  };
}
```

### 3. ContentMetadata Model
**الموقع:** `packages/database/src/lib/models/ContentMetadata.ts`

معلومات تعريفية موحدة لجميع أنواع المحتوى:
```typescript
{
  contentId: ObjectId;
  contentType: 'article' | 'course' | 'artwork' | 'lab';

  // تحسين البحث
  searchableText: string;            // نص قابل للبحث موحد
  keywords: string[];
  techniques: string[];

  // التصنيف
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'fa' | 'en' | 'both';
  estimatedTime: number;             // بالدقائق

  // مقاييس الجودة
  qualityScore: number;              // 0-100
  popularityScore: number;           // 0-100
  relevanceScore: number;            // 0-100

  // المحتوى المرتبط
  relatedContent: [{
    contentId: ObjectId;
    contentType: string;
    relevanceScore: number;
  }];

  tags: string[];
}
```

**Indexes:**
- Text index على `searchableText, keywords, tags`
- `contentId + contentType` (unique)
- `contentType + difficulty`
- `contentType + language`
- `popularityScore`, `qualityScore`

---

## 🔌 API Endpoints

### البحث الأساسي

#### `GET /api/search`
البحث المتقدم الموحد عبر جميع أنواع المحتوى

**Query Parameters:**
- `q` - نص البحث (required)
- `type` - نوع المحتوى: `all`, `article`, `course`, `artwork`
- `difficulty` - `beginner`, `intermediate`, `advanced`
- `language` - `fa`, `en`, `both`
- `technique` - تقنية معينة
- `sort` - `relevance`, `popularity`, `recent`, `quality`
- `page` - رقم الصفحة (default: 1)
- `limit` - عدد النتائج (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "...",
      "_contentType": "article",
      "_metadata": {
        "difficulty": "intermediate",
        "language": "fa",
        "techniques": ["generative", "AI"],
        "estimatedTime": 15,
        "qualityScore": 85,
        "popularityScore": 92
      },
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "query": "generative art",
  "filters": { ... }
}
```

**كيف يعمل:**
1. يبحث في `ContentMetadata` باستخدام Text Index
2. يطبق الفلاتر المحددة
3. يرتب النتائج حسب `sort` parameter
4. يجلب المحتوى الفعلي من collections الأصلية
5. يحفظ عملية البحث في `SearchHistory`
6. يحدث `searchKeywords` في `UserPreferences`

---

### تاريخ البحث

#### `GET /api/search/history` (محمي)
جلب سجل بحث المستخدم

**Query Parameters:**
- `limit` - عدد السجلات (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "query": "AI art",
      "filters": { ... },
      "resultsCount": 25,
      "createdAt": "2026-01-01T10:00:00Z"
    }
  ]
}
```

#### `DELETE /api/search/history` (محمي)
حذف سجل البحث

**Query Parameters:**
- `id` - حذف سجل معين (اختياري)
- بدون `id` - حذف كل السجل

---

### الاقتراحات التلقائية

#### `GET /api/search/suggestions`
احصل على اقتراحات بحث بناءً على نص جزئي

**Query Parameters:**
- `q` - النص الجزئي (minimum 2 characters)
- `limit` - عدد الاقتراحات (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    "generative art",
    "generative design",
    "AI art",
    "algorithmic poetry"
  ]
}
```

**مصادر الاقتراحات:**
1. عمليات البحث الشائعة من `SearchHistory`
2. عناوين المقالات والدورات
3. التاجات الشائعة

---

### التوصيات الذكية

#### `GET /api/recommendations` (محمي)
احصل على توصيات شخصية للمستخدم

**Query Parameters:**
- `type` - نوع المحتوى: `all`, `article`, `course`, `artwork`
- `limit` - عدد التوصيات (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "...",
      "_contentType": "course",
      "_recommendationScore": 87.5,
      "_metadata": { ... }
    }
  ],
  "userPreferences": {
    "favoriteCategories": ["generative", "interactive"],
    "favoriteTechniques": ["p5.js", "AI"],
    "preferredLanguage": "fa",
    "difficultyLevel": "intermediate"
  }
}
```

**خوارزمية التوصية:**
```javascript
score = 0;

// Base scores
score += qualityScore * 0.3;
score += popularityScore * 0.2;

// User preference matching
if (matches favoriteCategories) score += 10;
if (matches favoriteTechniques) score += 5 per technique;

// Freshness bonus
if (age < 7 days) score += 15;
else if (age < 30 days) score += 10;
else if (age < 90 days) score += 5;

// Interaction penalty (avoid duplicates)
if (already viewed/bookmarked) score -= 30-50;
```

---

### المحتوى المرتبط

#### `GET /api/recommendations/related`
احصل على محتوى مرتبط بعنصر محدد

**Query Parameters:**
- `contentId` - معرف المحتوى (required)
- `contentType` - نوع المحتوى (required)
- `limit` - عدد العناصر المرتبطة (default: 5)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "...",
      "_contentType": "article",
      "_similarityScore": 78.3,
      "_metadata": { ... }
    }
  ]
}
```

**خوارزمية التشابه:**
```javascript
similarityScore = 0;

// Content similarity
similarityScore += commonTechniques.length * 20;
similarityScore += commonKeywords.length * 15;
similarityScore += commonTags.length * 10;

// Same difficulty bonus
if (same difficulty) similarityScore += 10;

// Content type weighting
if (same type) similarityScore *= 1.7;  // 70% boost
else similarityScore *= 1.3;            // 30% boost

// Quality bonus
similarityScore += qualityScore * 0.2;
similarityScore += popularityScore * 0.1;
```

---

### تفضيلات المستخدم

#### `GET /api/preferences` (محمي)
جلب تفضيلات المستخدم

**Response:**
```json
{
  "success": true,
  "data": {
    "favoriteCategories": ["generative", "interactive"],
    "favoriteTechniques": ["p5.js", "three.js"],
    "preferredLanguage": "fa",
    "difficultyLevel": "intermediate"
  }
}
```

#### `PUT /api/preferences` (محمي)
تحديث تفضيلات المستخدم

**Body:**
```json
{
  "favoriteCategories": ["generative", "code-poetry"],
  "favoriteTechniques": ["AI", "ML"],
  "preferredLanguage": "both",
  "difficultyLevel": "advanced"
}
```

---

## 🎨 صفحات الواجهة الأمامية

### 1. SearchPage (`/search`)
**الموقع:** `apps/web-client/src/pages/SearchPage.tsx`

صفحة البحث المتقدم مع:

**المميزات:**
- 🔍 **مربع بحث ذكي** مع اقتراحات تلقائية
- 🎛️ **فلاتر متقدمة** (نوع، صعوبة، لغة، ترتيب)
- 📜 **تاريخ البحث** - عرض آخر 5 عمليات بحث
- 🎯 **نتائج موحدة** - عرض المقالات والدورات والأعمال معاً
- 📄 **ترقيم** - pagination للنتائج الكثيرة
- 🏷️ **تصنيف النتائج** - أيقونات لكل نوع محتوى

**الاستخدام:**
```
/search?q=AI+art&type=article&difficulty=beginner&sort=popularity
```

### 2. RecommendationsPage (`/recommendations`)
**الموقع:** `apps/web-client/src/pages/RecommendationsPage.tsx`

صفحة التوصيات الشخصية (محمية):

**المميزات:**
- ✨ **توصيات ذكية** بناءً على سلوك المستخدم
- ⚙️ **تنظيمات التفضيلات** - تعديل الاهتمامات والمستوى
- 📊 **درجة التوصية** - عرض نسبة التطابق
- 🎨 **فلترة حسب النوع** - مقالات، دورات، أعمال
- 🎯 **محتوى جديد** - تفضيل المحتوى الحديث

**التفضيلات القابلة للتعديل:**
- الفئات المفضلة (generative, interactive, etc.)
- التقنيات المفضلة
- اللغة الترجيحية (فارسي/إنجليزي/كلاهما)
- مستوى الصعوبة (مبتدئ/متوسط/متقدم/الكل)

---

## 🎯 Routes في App.tsx

تم إضافة Routes التالية:

```typescript
{/* Search & Recommendations Routes */}
<Route path="/search" element={<SearchPage />} />
<Route path="/recommendations" element={<RecommendationsPage />} />
```

---

## 🧭 التكامل مع Navigation

تم إضافة أزرار في شريط التنقل:

```typescript
{/* Search Button */}
<Link to="/search">
  <Search size={20} />
</Link>

{/* Recommendations Button (للمستخدمين المسجلين فقط) */}
{isAuthenticated && (
  <Link to="/recommendations">
    <Sparkles size={20} />
  </Link>
)}
```

---

## 🔄 كيفية إضافة محتوى للبحث

عند إضافة محتوى جديد (مقالة، دورة، عمل فني)، يجب إنشاء `ContentMetadata`:

```typescript
// مثال لمقالة
await ContentMetadata.create({
  contentId: article._id,
  contentType: 'article',
  searchableText: `${article.title} ${article.titleEn} ${article.content} ${article.excerpt}`,
  keywords: article.tags,
  techniques: ['generative', 'AI'], // استخرج من المحتوى
  difficulty: 'intermediate',
  language: article.contentEn ? 'both' : 'fa',
  estimatedTime: article.readTime,
  qualityScore: 70, // احسب بناءً على معايير
  popularityScore: 0, // سيتم تحديثه لاحقاً
  relevanceScore: 50,
  tags: article.tags,
});
```

---

## 📈 تحديث مقاييس المحتوى

يجب تحديث المقاييس دورياً:

```javascript
// مثال: تحديث popularityScore
const updatePopularityScores = async () => {
  const articles = await Article.find();

  for (const article of articles) {
    // احسب النتيجة بناءً على التفاعل
    const score = Math.min(100,
      (article.viewCount * 0.3) +
      (article.likeCount * 2) +
      (article.bookmarkCount * 3)
    );

    await ContentMetadata.findOneAndUpdate(
      { contentId: article._id, contentType: 'article' },
      { popularityScore: score }
    );
  }
};
```

---

## 🎓 أفضل الممارسات

### 1. البحث
- استخدم Text Index للبحث السريع
- احفظ سجل البحث للتحليل
- قدم اقتراحات مفيدة

### 2. التوصيات
- حدّث تفضيلات المستخدم عند كل تفاعل
- تجنب التوصية بمحتوى سبق للمستخدم مشاهدته
- وازن بين التخصيص والتنوع

### 3. الأداء
- استخدم Indexes بشكل صحيح
- Limit النتائج (pagination)
- Cache النتائج الشائعة

### 4. الخصوصية
- السماح بالبحث بدون تسجيل دخول
- عدم حفظ سجل للزوار
- إعطاء خيار حذف السجل

---

## 🚀 تحسينات مستقبلية مقترحة

1. **Elasticsearch Integration**
   - بحث أسرع وأكثر دقة
   - Fuzzy search للأخطاء الإملائية
   - Faceted search

2. **Machine Learning**
   - نموذج توصيات أكثر تطوراً
   - Collaborative filtering
   - Deep learning للتشابه الدلالي

3. **Analytics Dashboard**
   - تحليل اتجاهات البحث
   - الكلمات الأكثر بحثاً
   - معدلات النقر (CTR)

4. **Voice Search**
   - بحث صوتي
   - دعم اللغة العربية

5. **Visual Search**
   - البحث بالصورة للأعمال الفنية
   - Image similarity

6. **Real-time Search**
   - نتائج فورية أثناء الكتابة
   - WebSocket updates

---

## 📊 مقاييس الأداء

### Indexes المطلوبة:
```javascript
// ContentMetadata
db.contentmetadatas.createIndex({ searchableText: "text", keywords: "text", tags: "text" });
db.contentmetadatas.createIndex({ contentId: 1, contentType: 1 }, { unique: true });
db.contentmetadatas.createIndex({ contentType: 1, difficulty: 1 });
db.contentmetadatas.createIndex({ popularityScore: -1 });

// SearchHistory
db.searchhistories.createIndex({ user: 1, createdAt: -1 });
db.searchhistories.createIndex({ query: "text" });

// UserPreferences
db.userpreferences.createIndex({ user: 1 }, { unique: true });
```

---

## 🐛 Troubleshooting

### المشكلة: البحث بطيء
**الحل:**
- تأكد من وجود Text Index
- قلل `limit` في النتائج
- استخدم pagination

### المشكلة: لا توصيات للمستخدم الجديد
**الحل:**
- اعرض محتوى شائع كبداية
- اطلب من المستخدم تحديد اهتماماته
- استخدم Cold start strategy

### المشكلة: نتائج غير دقيقة
**الحل:**
- حسّن `searchableText` في ContentMetadata
- أضف keywords أكثر دقة
- استخدم Stemming للغة العربية

---

## 📞 الدعم

للمزيد من المعلومات:
- API: `apps/api/src/app/api/search/`
- Frontend: `apps/web-client/src/pages/`
- Models: `packages/database/src/lib/models/`

---

**تم التطوير بواسطة:** Claude Sonnet 4.5
**التاريخ:** 2026-01-01
**الإصدار:** 1.0
