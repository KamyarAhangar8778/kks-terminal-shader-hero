# Website Conversion & Audit Specifications (KKS Systems)

## Value Propositions

- **Primary Value Prop**: توسعه وب‌سایت، رابط‌های کاربری سفارشی و سیستم‌های تحت وب با تمرکز بر عملکرد سریع، تایپوگرافی تمیز و پیاده‌سازی حرفه‌ای.
- **Supporting Value Props**:
  - اجرای ۶۰ فریم بر ثانیه بدون کندی مرورگر با معماری Web Worker.
  - تایپوگرافی فارسی بهینه‌شده و خوانا روی انواع نمایشگرها.
  - ساختار ماژولار، تمیز و قابل توسعه بر پایه Next.js ۱۵ و Tailwind CSS v۴.

## Conversion Elements

| Element                    | Surface / Section                              | Purpose & Implementation                                                                                                     | Status |
| -------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------ |
| Primary Direct CTA         | Hero Header (`#hud-top-bar`)                   | Jump button `[PROJ_LIST ↓]` directing traffic to active portfolio showcase.                                                  | Active |
| Primary Action Form        | Contact Console (`#contact-inquiry-section`)   | High-density 2-column RTL form for project requirement submission.                                                           | Active |
| Direct Proof Asset         | Showcase Cards (`#portfolio-showcase-section`) | Live clickable links to real deployed projects (`landing.ashkghalam.ir`, `kamyarahangar8778.github.io/Markdown-RTL-Viewer`). | Active |
| Technical Competence Asset | GitHub Remote (`#github-profile-section`)      | Terminal link to source repositories (`github.com/KamyarAhangar8778`).                                                       | Active |

## Objection & Counter-Objection Matrix (The Big 5)

| Category          | Objection                                 | Counter-Objection / Proof in UI                                                    | Status    |
| ----------------- | ----------------------------------------- | ---------------------------------------------------------------------------------- | --------- |
| **Trust**         | آیا نمونه‌کارها واقعی و فعال هستند؟       | لینک‌های زنده با آدرس دامین واقعی و گزارش نسخه (v2.4 STABLE) در کارت‌های پروژه.    | Addressed |
| **Price / Value** | آیا قیمت و کیفیت تناسب دارند؟             | ارائه سیستم اختصاصی و سریع، بدون استفاده از قالب‌های آماده و سنگین.                | Addressed |
| **Fit**           | آیا برای پروژه‌های فارسی و RTL مناسب است؟ | پشتیبانی کامل و اصولی از تایپوگرافی فارسی Vazirmatn و چیدمان استاندارد راست‌به‌چپ. | Addressed |
| **Timing**        | چقدر طول می‌کشد تا پروژه تحویل داده شود؟  | فرم ثبت سفارش شفاف با فیلدهای مشخص موضوع و توضیحات برای برآورد سریع.               | Addressed |
| **Effort**        | روند سفارش پروژه چگونه است؟               | فرآیند ۳ مرحله‌ای ساده: ۱. ثبت موضوع -> ۲. بررسی نیازمندی‌ها -> ۳. تحویل وب‌سایت.  | Addressed |

## Audit Findings

| Issue                                     | Severity (0-4) | Fix Description                                                                       | Status |
| ----------------------------------------- | -------------- | ------------------------------------------------------------------------------------- | ------ |
| Missing direct email copy fallback        | Severity 3     | Added inline email copy button in contact status banner for dead-end mailto clients   | Done   |
| Mobile touch targets < 44px               | Severity 3     | Applied `min-h-[44px]` and touch padding to all interactive controls and links        | Done   |
| Canvas CPU drain when scrolled off-screen | Severity 2     | Attached `IntersectionObserver` to freeze Web Worker canvas loop when out of viewport | Done   |
| Focus ring contrast on dark canvas        | Severity 2     | Configured high-contrast sky-400 focus outline across all interactive elements        | Done   |
