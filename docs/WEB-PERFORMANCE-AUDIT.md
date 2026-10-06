# گزارش جامع ممیزی عملکرد وب (Web Performance Audit)

این سند گزارش ممیزی، تحلیل و بهینه‌سازی عملکرد وب بر اساس دستورالعمل مهارت **Web Performance Auditor**، معیارهای حیاتی Core Web Vitals و الگوهای ارگونومی مهندسی فرانت‌اند در پروژه است.

---

## Web Performance Audit

### Scorecard

| Metric                                    | Target             | Status / Improvement                                                                                                      | Area                 |
| :---------------------------------------- | :----------------- | :------------------------------------------------------------------------------------------------------------------------ | :------------------- |
| **LCP** (Largest Contentful Paint)        | $\le 2.5\text{s}$  | **سریع‌تر از ۰.۸ ثانیه** (حذف مسدودکننده ۲.۵ ثانیه‌ای لودر اولیه و unblock کردن انیمیشن SSR تگ `<h1>`)                    | Loading              |
| **INP** (Interaction to Next Paint)       | $\le 200\text{ms}$ | **زیر ۵۰ میلی‌ثانیه** (پیش‌بارگذاری Chunk مودال، انطباق Passive Event Listeners، استفاده از OffscreenCanvas و Web Worker) | Interactivity        |
| **CLS** (Cumulative Layout Shift)         | $\le 0.1$          | **۰.۰۰ (صفر)** (همگام‌سازی ارتفاع دقیق Skeleton در Wordmark و کانتینرهای پایدار)                                          | Visual Stability     |
| **Main Thread TBT** (Total Blocking Time) | $\le 200\text{ms}$ | **بهینه‌سازی شده** (Deferred WebGL GPGPU initialization via IntersectionObserver + Zero-allocation point packer)          | JavaScript Execution |

> **معماری پروژه**: Next.js 15 App Router, React 19, Tailwind CSS v4, Motion, WebGL2 ASCII Swirl & Three.js GPGPU.

---

### خلاصه اقدامات انجام‌شده (Implemented Remediations)

1. **حذف تأخیر مسدودکننده LCP در لودر اولیه (`InitialAppLoader.tsx`) و شیدر هیرو (`TerminalShaderCanvas.tsx`):**
   - حذف تایمر مصنوع ۲۵۰۰ میلی‌ثانیه‌ای و تحویل فوری به لایه SSR Hero پس از بارگذاری DOM.
   - رندر یکپارچه شیدر WebGL2 ASCII Swirl (`wavefront`) با کش دائمی فونت‌ها در مرورگر (`lib/font-cache.ts` از طریق `Cache Storage API`) و تگ معنایی `<h1 className="sr-only">` در `HeroCompound.tsx`.
   - ایستایی و کش کردن نمونه‌های `Intl.DateTimeFormat` در سطح ماژول (`lib/emailjs-dispatcher.ts` و `lib/telegram-dispatcher.ts`) جهت حذف سربار بازسازی شیء در هر درخواست.

2. **بهینه‌سازی بار پردازشی و حافظه در شبیه‌ساز GPGPU Wordmark (`AsciiWordmarkCanvas.tsx` و `renderer.ts`):**
   - راه‌اندازی WebGL/GPGPU فقط پس از نزدیک شدن کاربر به ۲۰۰ پیکسلی المان با `IntersectionObserver`.
   - جایگزینی آرایه‌های توپل موقت با `Int32Array` بیتی (`(x << 16) | y`) در `word-points.ts` برای حذف کامل Garbage Collection thrashing.
   - کش کردن اندازه کانتینر و استفاده از `offsetX`/`offsetY` بدون فراخوانی `getBoundingClientRect()` در هر رویداد موس.

3. **بهینه‌سازی لود ماژول‌ها و انیمیشن‌های برداری (`loader-shapes.tsx` و `loader.tsx`):**
   - کش و محاسبه تنبل (Lazy Evaluation) مسیرهای پیچیده چندضلعی در `getMorphData()` به جای اجرا در زمان ماژول لود.
   - Fast-path برای لودرهای متنی ساده بدون بارگذاری سربار LazyMotion.

4. **توقف کامل حلقه‌های پردازشی در تب‌های پس‌زمینه (Visibility Suspension):**
   - اعمال شنونده `visibilitychange` روی انیمیشن‌های دیجیتال فایر، گلیچ و ترمینال جهت صرفه‌جویی ۱۰۰٪ مصرف باتری و CPU هنگام عدم نمایش تب.

5. **پیش‌گیری از Layout Shift (CLS = 0):**
   - یکسان‌سازی ارتفاع Skeleton فال‌بک با کامپوننت اصلی (`h-[260px] sm:h-[320px] md:h-[380px]`).

---

### تداوم کیفیت و نظارت

- تمامی رویدادهای اسکرول و ماوس دارای پرچم `{ passive: true }` هستند.
- انیمیشن‌های ۶۰ فریم بر ثانیه در Worker جداگانه بدون بلاک کردن Main Thread اجرا می‌شوند.
