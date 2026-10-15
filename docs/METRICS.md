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

## Initial Baseline vs. Secondary Post-Optimization Benchmarks

| Subsystem / Metric                                                                   | Initial Benchmark (Baseline)         | Secondary Benchmark (Post-Optimization) | Improvement (%)                               |
| ------------------------------------------------------------------------------------ | ------------------------------------ | --------------------------------------- | --------------------------------------------- |
| **Hero Swirl 60FPS Engine (`composeField` + `stepTrail`, 600 frames @ 180×80)**      | `1047.62 ms` (`1.746 ms/frame`)      | `751.75 ms` (`1.253 ms/frame`)          | **-28.24% CPU time** (**+39.35% throughput**) |
| **Digital Fire Engine (`FireSimulator` + `DigitalFireCanvas`, 600 frames @ 220×26)** | `228.02 ms` (`0.380 ms/frame`)       | `147.53 ms` (`0.246 ms/frame`)          | **-35.30% CPU time** (**+54.56% throughput**) |
| **Digital Fire Canvas2D Context State Switches (600 frames)**                        | `1,586,434 switches` (`2,644/frame`) | `24,000 switches` (`40/frame`)          | **-98.49% driver state switches**             |
| **Swirl Color & Shader Uniform Pipeline (100,000 calls)**                            | `56.38 ms`                           | `18.71 ms`                              | **-66.81% execution time** (**3.01× faster**) |
| **Custom Kinematic Cursor Target Detection (200,000 calls)**                         | `12.18 ms`                           | `5.74 ms`                               | **-52.87% execution time** (**2.12× faster**) |
| **Critical Root Layout JS Chunk (`app/layout-*.js`)**                                | `18,078 B` (`18.08 KB`)              | `10,302 B` (`10.30 KB`)                 | **-43.01% bundle size**                       |
| **Critical Home Page JS Chunk (`app/page-*.js`)**                                    | `123,533 B` (`123.53 KB`)            | `95,563 B` (`95.56 KB`)                 | **-22.64% bundle size**                       |
| **Total Critical Entry JS (`layout` + `page`)**                                      | `141,611 B` (`141.61 KB`)            | `105,865 B` (`105.87 KB`)               | **-25.24% critical JS**                       |
| **React Doctor Health Score**                                                        | `100 / 100`                          | `100 / 100` (`0` errors, `0` warnings)  | **100% Optimal**                              |
