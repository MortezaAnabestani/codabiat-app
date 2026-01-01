# راهنمای یکپارچه‌سازی Lab Modules با سیستم ذخیره آثار

این راهنما نحوه اضافه کردن قابلیت "Save Artwork" به ماژول‌های Lab را توضیح می‌دهد.

---

## 📋 نمای کلی

با استفاده از کامپوننت `SaveArtworkDialog`، می‌توانید به راحتی قابلیت ذخیره اثر را به هر Lab Module اضافه کنید. این dialog:

- ✅ فرم کامل برای عنوان، توضیحات و تگ‌ها
- ✅ امکان انتخاب انتشار عمومی
- ✅ یکپارچه‌سازی با API Backend
- ✅ مدیریت خطاها و لودینگ
- ✅ هدایت خودکار به صفحه اثر بعد از ذخیره
- ✅ طراحی Comix Zone

---

## 🎯 نمونه کامل: GlitchModule

مشاهده فایل: `apps/web-client/src/components/lab/text/GlitchModule.tsx`

این ماژول به عنوان الگو برای سایر modules استفاده شده است.

---

## 🔧 راهنمای گام به گام

### گام 1: Import کردن Dialog و آیکون Save

```typescript
import { Save } from "lucide-react";
import SaveArtworkDialog from "../SaveArtworkDialog";
```

**نکته**: مسیر relative بسته به محل ماژول متفاوت است:
- از `components/lab/text/` → `"../SaveArtworkDialog"`
- از `components/lab/visual/` → `"../SaveArtworkDialog"`
- از `components/lab/three/` → `"../SaveArtworkDialog"`

---

### گام 2: اضافه کردن State برای Dialog

```typescript
export const YourModule: React.FC = () => {
  // ... state های قبلی
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // ...
}
```

---

### گام 3: اضافه کردن دکمه Save

دکمه را در بخش controls اضافه کنید:

```typescript
{/* Save Artwork Button */}
<button
  onClick={() => setShowSaveDialog(true)}
  disabled={!hasContent}  // فقط وقتی محتوا وجود دارد فعال باشد
  className={`w-full py-4 font-black text-sm uppercase border-4 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center gap-3 transition-all
              ${
                hasContent
                  ? "bg-[#006000] text-white hover:bg-[#007000] active:translate-y-1 active:shadow-none"
                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
              }
          `}
>
  <Save size={20} />
  SAVE_ARTWORK
</button>
```

**نکته**: `hasContent` را با state محتوای ماژول خود جایگزین کنید (مثل `output`, `generatedText`, `imageData` و غیره).

---

### گام 4: اضافه کردن Dialog Component

در انتهای JSX ماژول خود، قبل از بستن div اصلی:

```typescript
return (
  <div className="...">
    {/* محتوای ماژول */}

    {/* Save Artwork Dialog */}
    <SaveArtworkDialog
      isOpen={showSaveDialog}
      onClose={() => setShowSaveDialog(false)}
      labModule="your-module-name"  // نام یونیک ماژول
      labCategory="text"  // یا "narrative", "visual", "bio", "spatial", "other"
      content={{
        text: yourTextOutput,        // متن خروجی (اختیاری)
        html: yourHtmlOutput,         // HTML خروجی (اختیاری)
        data: {                       // داده‌های کامل ماژول
          // همه state ها و تنظیماتی که برای بازسازی اثر لازم است
        },
      }}
      screenshot={yourScreenshot}  // اختیاری: تصویر اثر (base64 یا URL)
    />
  </div>
);
```

---

## 📝 پارامترهای SaveArtworkDialog

### `labModule` (required)
نام یونیک ماژول. باید با نام فایل یا شناسه ماژول مطابقت داشته باشد.

**مثال‌ها**:
- `"glitch"` - برای GlitchModule
- `"neural"` - برای NeuralModule
- `"cut-up"` - برای CutUpModule
- `"3d-text"` - برای TextOrbModule

---

### `labCategory` (required)
دسته‌بندی اصلی ماژول. یکی از این مقادیر:

| Category | توضیح | مثال‌ها |
|----------|-------|---------|
| `"text"` | متن‌محور | Glitch, Cut-up, Permutation |
| `"narrative"` | داستان‌محور | Interactive Fiction, Hypertext |
| `"visual"` | بصری | Algorithmic Calligraphy, Fractal Garden |
| `"bio"` | زیستی/ارگانیک | Bio Synthesis |
| `"spatial"` | فضایی/3D | Blind Owl, Text Orb |
| `"other"` | سایر | - |

---

### `content` (required)
شیء حاوی محتوای اثر:

```typescript
content: {
  text?: string;      // متن ساده خروجی (برای نمایش در gallery)
  html?: string;      // HTML formatted output (برای نمایش rich text)
  data?: any;         // تمام داده‌های لازم برای بازسازی اثر
}
```

#### نکات مهم برای `content.data`:

این فیلد باید **تمام اطلاعات لازم برای بازسازی کامل اثر** را داشته باشد:

```typescript
data: {
  // Input اولیه
  input: yourInputText,

  // تنظیمات
  settings: {
    param1: value1,
    param2: value2,
    // ...
  },

  // حالت/Mode
  mode: currentMode,

  // هر چیز دیگری که برای recreate لازم است
}
```

**مثال از GlitchModule**:
```typescript
data: {
  input: "واقعیت در حال بارگذاری مجدد است",
  settings: {
    entropy: 5,
    clockSpeed: 1,
    shift: 2,
    isBreached: false
  },
  mode: "corruption"
}
```

---

### `screenshot` (optional)
تصویر نمایشی اثر. می‌تواند:
- Base64 string (`data:image/png;base64,...`)
- URL به فایل آپلود شده
- `undefined` (برای ماژول‌های متنی که نیاز به تصویر ندارند)

#### نحوه گرفتن Screenshot:

**برای Canvas-based modules**:
```typescript
const canvas = canvasRef.current;
const screenshot = canvas?.toDataURL('image/png');
```

**برای DOM-based modules** (با html2canvas):
```typescript
import html2canvas from 'html2canvas';

const takeScreenshot = async () => {
  const element = outputRef.current;
  if (element) {
    const canvas = await html2canvas(element);
    return canvas.toDataURL('image/png');
  }
};
```

---

## 🎨 نمونه‌های کامل برای انواع Modules

### 1. Text-based Module (مثل GlitchModule)

```typescript
<SaveArtworkDialog
  isOpen={showSaveDialog}
  onClose={() => setShowSaveDialog(false)}
  labModule="glitch"
  labCategory="text"
  content={{
    text: output,
    html: `<div style="font-size: 4rem; font-weight: 900; text-align: center;">${output}</div>`,
    data: {
      input,
      settings: state,
      mode: state.mode,
    },
  }}
/>
```

---

### 2. Canvas/Visual Module

```typescript
<SaveArtworkDialog
  isOpen={showSaveDialog}
  onClose={() => setShowSaveDialog(false)}
  labModule="fractal-garden"
  labCategory="visual"
  content={{
    text: `Fractal Garden - Iterations: ${iterations}`,
    data: {
      seed: randomSeed,
      iterations,
      colors: colorPalette,
      fractalType,
    },
  }}
  screenshot={canvasRef.current?.toDataURL('image/png')}
/>
```

---

### 3. Three.js / 3D Module

```typescript
<SaveArtworkDialog
  isOpen={showSaveDialog}
  onClose={() => setShowSaveDialog(false)}
  labModule="text-orb"
  labCategory="spatial"
  content={{
    text: inputText,
    data: {
      text: inputText,
      rotation: rotationSpeed,
      scale: orbScale,
      particleCount,
      colorScheme,
    },
  }}
  screenshot={await captureThreeJsScreenshot()}
/>
```

---

### 4. Narrative/Interactive Module

```typescript
<SaveArtworkDialog
  isOpen={showSaveDialog}
  onClose={() => setShowSaveDialog(false)}
  labModule="interactive-fiction"
  labCategory="narrative"
  content={{
    text: storyText,
    html: generateHtmlStory(),
    data: {
      scenes,
      choices,
      currentPath: chosenPath,
      variables: storyVariables,
    },
  }}
/>
```

---

## 🔒 بررسی احراز هویت

Dialog خودش احراز هویت را چک می‌کند. اگر کاربر login نکرده باشد:
1. پیام خطا نمایش داده می‌شود
2. بعد از 2 ثانیه به صفحه `/login` هدایت می‌شود

**شما نیازی به چک دستی ندارید!**

---

## 🎯 بهترین روش‌ها (Best Practices)

### 1. ✅ Disable کردن دکمه Save وقتی محتوا خالی است

```typescript
disabled={!output || output.length === 0}
```

### 2. ✅ ذخیره تمام state برای بازسازی

اطمینان حاصل کنید `content.data` همه چیز لازم را دارد:

```typescript
data: {
  input: allInputs,
  settings: allSettings,
  mode: currentMode,
  // هر چیز دیگری که لازم است
}
```

### 3. ✅ استفاده از HTML برای فرمت‌های پیچیده

اگر خروجی شما styling خاص دارد، از `content.html` استفاده کنید:

```typescript
html: `
  <div style="font-family: monospace; background: black; color: lime; padding: 20px;">
    ${yourFormattedOutput}
  </div>
`
```

### 4. ✅ Screenshot برای ماژول‌های بصری

برای ماژول‌هایی که خروجی بصری دارند، حتماً screenshot بگیرید:

```typescript
const handleSave = () => {
  const screenshot = canvasRef.current?.toDataURL('image/png');
  setScreenshotData(screenshot);
  setShowSaveDialog(true);
};
```

### 5. ✅ تست قبل از Commit

قبل از commit، این موارد را تست کنید:
- [ ] دکمه Save ظاهر می‌شود
- [ ] Dialog باز می‌شود
- [ ] فرم submit می‌شود
- [ ] اثر در Gallery نمایش داده می‌شود
- [ ] همه داده‌ها درست ذخیره شده‌اند

---

## 🐛 Troubleshooting

### مشکل: Dialog باز نمی‌شود

**علت**: فراموش کردن اضافه کردن `showSaveDialog` state

**راه‌حل**:
```typescript
const [showSaveDialog, setShowSaveDialog] = useState(false);
```

---

### مشکل: خطای "Cannot find module SaveArtworkDialog"

**علت**: مسیر import اشتباه است

**راه‌حل**: بسته به محل ماژول خود، مسیر را تنظیم کنید:
- از `text/`: `"../SaveArtworkDialog"`
- از `visual/`: `"../SaveArtworkDialog"`
- از `three/`: `"../SaveArtworkDialog"`
- از `narrative/`: `"../SaveArtworkDialog"`

همه در یک سطح هستند، پس همه `"../SaveArtworkDialog"` می‌شوند.

---

### مشکل: Screenshot سیاه است

**علت**: Canvas هنوز render نشده یا transparent است

**راه‌حل**:
```typescript
// اضافه کردن background به canvas
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);
// سپس rendering اصلی
```

---

### مشکل: داده‌ها درست ذخیره نمی‌شوند

**علت**: `content.data` کامل نیست

**راه‌حل**: همه state های مهم را اضافه کنید:

```typescript
// ❌ ناکافی:
data: { input }

// ✅ کامل:
data: {
  input,
  settings: allSettings,
  mode,
  version: "1.0", // برای compatibility آینده
}
```

---

## 📊 چک‌لیست یکپارچه‌سازی

برای هر ماژول Lab که می‌خواهید قابلیت Save اضافه کنید:

- [ ] Import کردن `SaveArtworkDialog` و آیکون `Save`
- [ ] اضافه کردن `showSaveDialog` state
- [ ] اضافه کردن دکمه "SAVE_ARTWORK"
- [ ] Disable کردن دکمه وقتی محتوا خالی است
- [ ] اضافه کردن `<SaveArtworkDialog>` component
- [ ] تنظیم `labModule` با نام یونیک
- [ ] تنظیم `labCategory` صحیح
- [ ] پر کردن کامل `content.data`
- [ ] اضافه کردن `screenshot` (برای ماژول‌های بصری)
- [ ] تست کامل flow ذخیره اثر

---

## 🎓 مثال‌های بیشتر

### Cut-up Module

```typescript
<SaveArtworkDialog
  isOpen={showSaveDialog}
  onClose={() => setShowSaveDialog(false)}
  labModule="cut-up"
  labCategory="text"
  content={{
    text: cutUpResult.join('\n'),
    html: `<div class="cut-up-output">${cutUpResult.map(line => `<p>${line}</p>`).join('')}</div>`,
    data: {
      originalText: inputText,
      method: cutUpMethod,
      chunkSize,
      randomSeed,
      result: cutUpResult,
    },
  }}
/>
```

### Algorithmic Calligraphy Module

```typescript
<SaveArtworkDialog
  isOpen={showSaveDialog}
  onClose={() => setShowSaveDialog(false)}
  labModule="algorithmic-calligraphy"
  labCategory="visual"
  content={{
    text: arabicText,
    data: {
      text: arabicText,
      algorithm: selectedAlgorithm,
      strokeWidth,
      curvature,
      spacing,
    },
  }}
  screenshot={svgToDataURL(svgRef.current)}
/>
```

---

## 🚀 مراحل بعدی

بعد از یکپارچه‌سازی موفق:

1. **تست در Gallery**: اثر ذخیره شده را در `/gallery` مشاهده کنید
2. **تست Like/Comment**: قابلیت‌های اجتماعی را امتحان کنید
3. **بررسی XP**: از +10 XP برای ایجاد اثر اطمینان حاصل کنید
4. **مستندسازی**: اگر ماژول شما منحصر به فرد است، نکات خاص را document کنید

---

## 📞 کمک و پشتیبانی

اگر مشکلی پیش آمد:
1. مثال GlitchModule را بررسی کنید: `apps/web-client/src/components/lab/text/GlitchModule.tsx`
2. مستندات API را مطالعه کنید: [BACKEND_SETUP.md](./BACKEND_SETUP.md)
3. Issue در GitHub باز کنید

---

**موفق باشید! 🎨✨**
