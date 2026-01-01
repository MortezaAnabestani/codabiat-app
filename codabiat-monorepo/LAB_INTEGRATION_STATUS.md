# وضعیت یکپارچه‌سازی Lab Modules

این فایل وضعیت اضافه شدن قابلیت "Save Artwork" به ماژول‌های Lab را ردگیری می‌کند.

---

## 📊 خلاصه وضعیت

- ✅ **کامپوننت اصلی**: SaveArtworkDialog ایجاد شد
- ✅ **مستندات**: [LAB_INTEGRATION_GUIDE.md](./LAB_INTEGRATION_GUIDE.md)
- ✅ **فاز 1 (Text)**: 5/5 ماژول تکمیل شد
- ✅ **فاز 2 (Visual)**: 11/11 ماژول تکمیل شد
- ✅ **فاز 3 (Narrative)**: 4/4 ماژول تکمیل شد
- ✅ **فاز 4 (Spatial/3D)**: 2/2 ماژول تکمیل شد
- ✅ **Other**: 3/3 ماژول تکمیل شد
- 🎉 **پیشرفت کل**: 25/25 ماژول (100%)

---

## 🎯 لیست ماژول‌های Lab

### Text Modules (دسته متن) - ✅ 100% تکمیل

| # | ماژول | وضعیت | یادداشت |
|---|-------|-------|---------|
| 1 | **GlitchModule** | ✅ تکمیل | نمونه اولیه - [مشاهده کد](apps/web-client/src/components/lab/text/GlitchModule.tsx) |
| 2 | **CutUpModule** | ✅ تکمیل | با screenshot از Canvas |
| 3 | **GeometricModule** | ✅ تکمیل | - |
| 4 | **PermutationModule** | ✅ تکمیل | - |
| 5 | **CriticalCodeModule** | ✅ تکمیل | - |

### Visual Modules (دسته بصری) - ✅ 100% تکمیل (11/11)

| # | ماژول | وضعیت | یادداشت |
|---|-------|-------|---------|
| 6 | **AlgorithmicCalligraphyModule** | ✅ تکمیل | با screenshot از P5.js Canvas |
| 7 | **SemanticClusterModule** | ✅ تکمیل | با screenshot از D3 (html2canvas) |
| 8 | **SonificationModule** | ✅ تکمیل | فایل صوتی (بدون screenshot) |
| 9 | **PoetryExcavationModule** | ✅ تکمیل | DOM-based |
| 10 | **FractalGardenModule** | ✅ تکمیل | با screenshot از P5.js Canvas |
| 11 | **CyberBreachModule** | ✅ تکمیل | DOM-based (game) |
| 12 | **CyberWeaverModule** | ✅ تکمیل | با screenshot از Canvas |
| 13 | **RetroConsoleModule** | ✅ تکمیل | DOM-based (بدون screenshot) |
| 14 | **BioSynthesisModule** | ✅ تکمیل | با screenshot از Canvas |
| 15 | **AdvancedKineticModule** | ✅ تکمیل | با screenshot از Canvas |
| 16 | **CyberIslimiModule** | ✅ تکمیل | با screenshot از P5.js Canvas |

### Narrative Modules (دسته داستانی) - ✅ 100% تکمیل (4/4)

| # | ماژول | وضعیت | یادداشت |
|---|-------|-------|---------|
| 17 | **InteractiveFictionModule** | ✅ تکمیل | محتوای HTML پیچیده با choices و variables |
| 18 | **HypertextModule** | ✅ تکمیل | ساختار nodes و links |
| 19 | **DataNarrativeModule** | ✅ تکمیل | داستان از داده |
| 20 | **LocativeNarrativeModule** | ✅ تکمیل | داستان مبتنی بر موقعیت مکانی |

### Three.js / Spatial Modules (دسته فضایی/3D) - ✅ 100% تکمیل (2/2)

| # | ماژول | وضعیت | یادداشت |
|---|-------|-------|---------|
| 21 | **TextOrbModule** | ✅ تکمیل | با screenshot از Three.js renderer |
| 22 | **BlindOwlModule** | ✅ تکمیل | با screenshot از Three.js renderer |

### Other Modules (سایر) - ✅ 100% تکمیل (3/3)

| # | ماژول | وضعیت | یادداشت |
|---|-------|-------|---------|
| 23 | **PhysicsTextModule** | ✅ تکمیل | با screenshot از Canvas (Matter.js) |
| 24 | **NeuralModule** | ✅ تکمیل | متنی (بدون screenshot) |
| 25 | **PixelGlitchModule** | ✅ تکمیل | با screenshot از Canvas |

---

## 🔧 راهنمای سریع اضافه کردن Save Button

برای هر ماژول:

### 1. Import ها
```typescript
import { Save } from "lucide-react";
import SaveArtworkDialog from "../SaveArtworkDialog";
```

### 2. State
```typescript
const [showSaveDialog, setShowSaveDialog] = useState(false);
```

### 3. دکمه
```typescript
<button
  onClick={() => setShowSaveDialog(true)}
  disabled={!output}
  className="w-full py-4 font-black text-sm uppercase border-4 border-black bg-[#006000] text-white..."
>
  <Save size={20} />
  SAVE_ARTWORK
</button>
```

### 4. Dialog
```typescript
<SaveArtworkDialog
  isOpen={showSaveDialog}
  onClose={() => setShowSaveDialog(false)}
  labModule="module-name"
  labCategory="text|visual|narrative|spatial|other"
  content={{ text, html, data }}
  screenshot={optionalScreenshot}
/>
```

**📘 مستندات کامل**: [LAB_INTEGRATION_GUIDE.md](./LAB_INTEGRATION_GUIDE.md)

---

## 📝 نکات مهم برای هر دسته

### Text Modules
- `labCategory`: `"text"`
- معمولاً نیازی به screenshot ندارند
- `content.text` و `content.html` کافی است

### Visual Modules
- `labCategory`: `"visual"`
- **حتماً** screenshot بگیرید:
  - Canvas: `canvas.toDataURL('image/png')`
  - SVG: convert to data URL
  - D3: از html2canvas استفاده کنید

### Narrative Modules
- `labCategory`: `"narrative"`
- `content.html` برای داستان‌های formatted
- `content.data` برای ذخیره choices و variables

### Spatial/3D Modules
- `labCategory`: `"spatial"`
- Screenshot از Three.js scene
- ذخیره camera position و settings در `content.data`

---

## ⚙️ تنظیمات labModule

هر ماژول یک `labModule` یونیک نیاز دارد:

```typescript
// ✅ درست:
labModule: "glitch"
labModule: "cut-up"
labModule: "3d-text-orb"

// ❌ اشتباه:
labModule: "GlitchModule"  // بدون "Module"
labModule: "Glitch_Text"   // بدون underscore
```

**قاعده**: lowercase، با dash برای چند کلمه‌ای، بدون "Module"

---

## 🧪 چک‌لیست تست

برای هر ماژول یکپارچه‌سازی شده، این موارد را تست کنید:

- [ ] دکمه "SAVE_ARTWORK" نمایش داده می‌شود
- [ ] دکمه وقتی محتوا خالی است disabled است
- [ ] کلیک روی دکمه → Dialog باز می‌شود
- [ ] فرم با اطلاعات صحیح پر می‌شود
- [ ] Submit → اثر در دیتابیس ذخیره می‌شود
- [ ] هدایت به `/gallery/:id`
- [ ] اثر در Gallery نمایش داده می‌شود
- [ ] همه داده‌ها (`content.data`) کامل است
- [ ] Screenshot (اگر لازم است) درست است

---

## 📊 پیشرفت به تفکیک دسته

| دسته | تکمیل شده | کل | درصد |
|------|------------|-----|------|
| Text | 5 | 5 | 100% ✅ |
| Visual | 11 | 11 | 100% ✅ |
| Narrative | 4 | 4 | 100% ✅ |
| Spatial | 2 | 2 | 100% ✅ |
| Other | 3 | 3 | 100% ✅ |
| **جمع** | **25** | **25** | **100% 🎉** |

---

## 🎯 اولویت‌بندی پیشنهادی

### فاز 1: Text Modules (اولویت بالا)
این ماژول‌ها ساده‌تر هستند و نیازی به screenshot ندارند:
1. ✅ GlitchModule (تکمیل شده)
2. CutUpModule
3. PermutationModule
4. GeometricModule
5. CriticalCodeModule

### فاز 2: Visual Modules (اولویت متوسط)
این ماژول‌ها نیاز به screenshot دارند:
6. FractalGardenModule
7. AlgorithmicCalligraphyModule
8. PixelGlitchModule
9. CyberIslimiModule
10. RetroConsoleModule

### فاز 3: 3D & Narrative (اولویت پایین‌تر)
این ماژول‌ها پیچیده‌تر هستند:
11. TextOrbModule
12. BlindOwlModule
13. InteractiveFictionModule
14. HypertextModule

---

## 💡 نکات و ترفندها

### Screenshot از Canvas
```typescript
const screenshot = canvasRef.current?.toDataURL('image/png');
```

### Screenshot از SVG
```typescript
const svgToDataURL = (svg: SVGElement) => {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
};
```

### Screenshot از Three.js
```typescript
renderer.render(scene, camera);
const screenshot = renderer.domElement.toDataURL('image/png');
```

### Screenshot از D3 (با html2canvas)
```typescript
import html2canvas from 'html2canvas';

const element = d3ContainerRef.current;
const canvas = await html2canvas(element);
const screenshot = canvas.toDataURL('image/png');
```

---

## 🐛 مشکلات شناخته شده

### Screenshot سیاه از Canvas
**علت**: Canvas transparent است
**راه‌حل**: ابتدا background سفید رسم کنید

### Dialog import error
**علت**: مسیر relative اشتباه
**راه‌حل**: همیشه از `"../SaveArtworkDialog"` استفاده کنید

### Content.data ناقص
**علت**: فراموش کردن بعضی state ها
**راه‌حل**: همه state های لازم برای بازسازی را شامل کنید

---

## 📞 کمک و سوالات

- 📘 راهنمای کامل: [LAB_INTEGRATION_GUIDE.md](./LAB_INTEGRATION_GUIDE.md)
- 🔍 نمونه کد: [GlitchModule.tsx](apps/web-client/src/components/lab/text/GlitchModule.tsx)
- 📖 مستندات API: [BACKEND_SETUP.md](./BACKEND_SETUP.md)

---

**بروزرسانی**: 2025-12-31
**نسخه**: 1.0
**وضعیت**: در حال توسعه
