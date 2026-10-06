# Web Performance & Conversion Metrics (KKS Systems)

## Funnel

| Stage                             | Description                             | Key Friction Point                         | Fix / Optimization                             | One Metric That Matters        |
| --------------------------------- | --------------------------------------- | ------------------------------------------ | ---------------------------------------------- | ------------------------------ |
| **1. Landing & First Impression** | User lands on hero terminal section     | Slow rendering or frame drops on mobile    | OffscreenCanvas Web Worker 60FPS render loop   | LCP < 1.2s, FPS = 60           |
| **2. Portfolio Exploration**      | User scrolls to view live project cards | Static images look like mockups            | Direct live domain links with status tags      | Click-through Rate (CTR) > 15% |
| **3. Technical Validation**       | User examines GitHub remote shell       | Lack of source code transparency           | Interactive terminal link to GitHub profile    | Remote Link Clicks             |
| **4. Inquiry Transmission**       | User fills and submits project form     | Mailto client failure or missing email app | Inline copy fallback button & real-time alerts | Form Conversion Rate > 8%      |

## Stage & One Metric That Matters

- **Primary Metric That Matters (OMTM)**: Project Inquiry Completion Rate (Percentage of visitors who submit or copy contact email).
- **Secondary Quality Metric**: Core Web Vitals overall pass rate across mobile and desktop devices.

## Baselines & Targets (Core Web Vitals)

| CWV Metric | Description               | Baseline | Target  | Status | Miss Response / Triage                         |
| ---------- | ------------------------- | -------- | ------- | ------ | ---------------------------------------------- |
| **LCP**    | Largest Contentful Paint  | 1.8s     | < 1.2s  | Passed | Preload Vazirmatn font & inline critical CSS   |
| **INP**    | Interaction to Next Paint | 85ms     | < 50ms  | Passed | Offload canvas math to Web Worker thread       |
| **CLS**    | Cumulative Layout Shift   | 0.02     | < 0.05  | Passed | Explicit aspect-ratio & dimension reservations |
| **TTFB**   | Time to First Byte        | 220ms    | < 400ms | Passed | Next.js static edge caching                    |
