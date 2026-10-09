# SYSTEM ARCHITECTURE & AI AGENT CODER BLUEPRINT

> **MACHINE CONTEXT**: This document is the definitive architectural specification for AI Agents and LLMs operating on this codebase. Read this before modifying, refactoring, or generating files. Follow all constraints strictly.

---

## 1. SYSTEM TOPOLOGY & DATA PIPELINE

```
+--------------------------------------------------------------------------------------------------+
|                                      HOST APPLICATION SHELL                                      |
|  /app/layout.tsx : Root HTML (lang="fa" dir="rtl"), Vazirmatn & JetBrains Mono, JSON-LD,         |
|                    Pre-hydration ASCII spinner, InitialAppLoader, & CustomCursor                 |
|  /app/page.tsx   : DirectionalTransition wrapper, SkipToContent, scroll restoration reset,       |
|                    mounts HeroSection, PortfolioSection, ContactSection, & Footer                |
|  /lib/app-config.ts : Single Source of Truth (FEATURE_FLAGS, SITE_CONFIG, social & nav tokens)   |
+--------------------------------------------------------------------------------------------------+
        |                         |                              |                        |
        v                         v                              v                        v
+---------------+       +-------------------+          +-------------------+      +----------------+
| HERO LAYER    |       | PORTFOLIO LAYER   |          | CONTACT STUDIO    |      | FOOTER & FIRE  |
| HeroSection   |       | PortfolioSection  |          | ContactSection    |      | Footer.tsx     |
| HeroCompound  |       | - FilterTabs      |          | - Direct Channels |      | - Quick Links  |
| - ShaderCanvas|       | - ProjectCard     |          |   (Telegram/Email)|      | - BackToTop    |
|   (WebGL2     |       |   (Compound)      |          | - Trust Badges    |      | - DigitalFire  |
|    Swirl +    |       | - DetailModal     |          | - ContactForm     |      |   Container &  |
|    CRT Pass)  |       |   (ViewTransition)|          |   (Compound +     |      |   Canvas       |
| - SocialLinks |       | - AsciiWordmark   |          |    Quick Tags)    |      |   (Emerald     |
|   (Top-Left)  |       |   Canvas (GPGPU)  |          | - InquiryProtocol |      |    Unicode)    |
+---------------+       +-------------------+          +-------------------+      +----------------+
        |                         |                                                       |
        v                         v                                                       v
+--------------------------------------------------------------------------------------------------+
|                            CORE ENGINES, SHADERS & PHYSICS LIBRARIES                             |
|  - /components/hero/swirl/*           : WebGL2 ASCII Swirl "Wavefront" shader & CRT post-pass    |
|  - /lib/font-cache.ts                 : Browser Cache Storage API font persistence for shaders   |
|  - /lib/ascii-wordmark/*              : Three.js WebGL/GPGPU particle flow-field wordmark engine |
|  - /lib/digital-fire/fire-simulator.ts: Zero-allocation Uint8Array convective heat & ember sim   |
|  - /lib/inquiry-protocol.ts           : Dual-channel Telegram Bot & EmailJS / mailto dispatcher  |
|  - /components/view-transitions/*     : React 19 ViewTransition & DirectionalTransition bridge   |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. MODULARITY & COMPOUND COMPONENT BOUNDARIES

To maintain clean separation of concerns, React 19 ergonomics, and micro-frontend readiness:

1. **Host Shell (`/app`)**: Provides global routing, error boundaries (`error.tsx`, `global-error.tsx`, `not-found.tsx`), SEO metadata (`robots.ts`, `sitemap.ts`, JSON-LD), and root layout context. Contains zero business logic.
2. **Centralized Configuration (`/lib/app-config.ts` & `/lib/portfolio-data.ts`)**:
   - All feature switches (`FEATURE_FLAGS`), brand strings, social URLs, navigation IDs, and project datasets live in single-source-of-truth modules.
3. **React 19 Compound Components & Dependency-Injectable Contexts (`state`, `actions`, `meta`)**:
   - **Hero (`HeroCompound.tsx`)**: Implements `{ state, actions, meta }` via React 19 `<HeroContext value={...}>` and `use(HeroContext)`, exposing `HeroCompound.Provider`, `Frame`, `BloomFilter`, `Canvas`, `Overlay`, `SocialLinks`, and `Centerpiece`.
   - **Portfolio Section (`PortfolioCompound.tsx`)**: Lifts category filtering and modal inspection state into `Portfolio.StateProvider` / `Portfolio.Provider` (`{ state, actions, meta }`), enabling sibling `PortfolioFilterTabs`, `PortfolioGrid`, and `ProjectDetailModal` to share state without prop drilling.
   - **Portfolio Card (`ProjectCardCompound.tsx` & `ProjectCard.tsx`)**: Uses React 19 `use(ProjectCardContext)` with `{ state, actions, meta }` and provides explicit variant components (`DeployedProjectCard`, `SourceProjectCard`, `ProjectCardOnlineBadge`, `ProjectCardSourceBadge`, `ProjectCardInspectButton`).
   - **Contact Form (`ContactCompound.tsx`, `ContactFields.tsx`, `ContactFormAlerts.tsx`)**: Isolates `useContactForm` state inside `ContactStateProvider`, composes field controls with `ContactFieldShell` (`children` over render props), and exposes explicit alert variants (`ContactErrorAlert`, `ContactSuccessAlert`).
4. **Headless & Off-Main-Thread Engines**:
   - `terminal-engine` + `terminal.worker.ts`: Pure TypeScript simulation running in an `OffscreenCanvas` Web Worker with automatic main-thread fallback.
   - `ascii-wordmark`: Self-contained WebGL GPGPU particle flow-field renderer (`lib/ascii-wordmark/renderer.ts`).
   - `digital-fire`: Pure `Uint8Array` thermal convection and ember particle simulator (`lib/digital-fire/fire-simulator.ts`).

---

## 3. FILE INVENTORY & SINGLE RESPONSIBILITY PRINCIPLE (SRP) MAP

| File Path                                            | Strict Responsibility (Single Purpose)                                    | Max Line Budget | Export Contract                                                   |
| :--------------------------------------------------- | :------------------------------------------------------------------------ | :-------------- | :---------------------------------------------------------------- |
| `/app/layout.tsx`                                    | Root HTML structure, fonts, JSON-LD, pre-hydration & app loaders          | $\le 170$       | `RootLayout`, `metadata`, `viewport`                              |
| `/app/page.tsx`                                      | Top-level route mount with `DirectionalTransition` & scroll reset         | $\le 60$        | `HomePage` (default)                                              |
| `/app/globals.css`                                   | Tailwind v4 theme, fluid rem scale, glass utilities & View Transitions    | $\le 420$       | Global CSS rules                                                  |
| `/components/common/SkipToContent.tsx`               | Accessible keyboard skip-link to `#main-root`                             | $\le 40$        | `SkipToContent`                                                   |
| `/components/common/GeometricBackground.tsx`         | Minimal SVG architectural grid background with subtle parallax            | $\le 90$        | `GeometricBackground`                                             |
| `/components/ui/initial-app-loader.tsx`              | Full-screen initial ASCII line spinner preloader                          | $\le 90$        | `InitialAppLoader`                                                |
| `/components/hero/HeroSection.tsx`                   | Default composed Hero section                                             | $\le 50$        | `HeroSection`                                                     |
| `/components/hero/HeroCompound.tsx`                  | React 19 compound primitives for the Hero section                         | $\le 120$       | `HeroProvider`, `HeroFrame`, `HeroCanvas`, `HeroSocials`          |
| `/components/hero/TerminalShaderCanvas.tsx`          | WebGL2 ASCII Swirl "Wavefront" shader canvas & click shockwave handler    | $\le 130$       | `TerminalShaderCanvas`                                            |
| `/components/hero/HeroSocialLinks.tsx`               | Top-left cybernetic social icon links (GitHub, Telegram, X)               | $\le 90$        | `HeroSocialLinks`                                                 |
| `/components/hero/swirl/use-swirl-stage.ts`          | WebGL2 ASCII Swirl 60FPS render loop, atlas rebuild & CRT pass lifecycle  | $\le 450$       | `useSwirlStage`, `DEFAULT_STAGE`                                  |
| `/components/hero/swirl/vortex-field.ts`             | Zero-allocation typed buffer composition for wavefront/vortex/shockwaves  | $\le 400$       | `composeField`, `makeBuffers`, `makeTarget`                       |
| `/components/hero/swirl/renderer.ts`                 | Instanced WebGL2 glyph renderer and FBO post-processing pipeline          | $\le 220$       | `createRenderer`                                                  |
| `/components/hero/swirl/crt-pass.ts`                 | WebGL2 CRT scanline, barrel curvature, and chromatic aberration shader    | $\le 120$       | `CRT_VERT`, `CRT_FRAG`                                            |
| `/components/hero/swirl/glyph-atlas.ts`              | 2D canvas rasterizer uploading dual-weight ASCII glyph atlas to WebGL2    | $\le 80$        | `buildAtlas`                                                      |
| `/components/custom-cursor/index.tsx`                | Hardware-accelerated pointer crosshair reticle with smooth lerp           | $\le 130$       | `CustomCursor`                                                    |
| `/components/portfolio/PortfolioSection.tsx`         | Composed portfolio showcase mounting `PortfolioCompound` & modal          | $\le 80$        | `PortfolioSection`                                                |
| `/components/portfolio/PortfolioCompound.tsx`        | Lifted state provider (`{ state, actions, meta }`), frame, header & grid  | $\le 270$       | `PortfolioCompound`, `PortfolioProvider`, `usePortfolioContext`   |
| `/components/portfolio/PortfolioFilterTabs.tsx`      | Segmented ARIA filter tabs consuming `PortfolioContext` or props          | $\le 130$       | `PortfolioFilterTabs`                                             |
| `/components/portfolio/ProjectCard.tsx`              | Explicit `DeployedProjectCard` & `SourceProjectCard` variants             | $\le 90$        | `ProjectCard`, `DeployedProjectCard`, `SourceProjectCard`         |
| `/components/portfolio/ProjectCardCompound.tsx`      | Compound project card chassis with `{ state, actions, meta }` context     | $\le 300$       | `ProjectCardCompound`, `ProjectCardFrame`                         |
| `/components/portfolio/ProjectDetailModal.tsx`       | Shared-element morph modal consuming lifted `PortfolioContext`            | $\le 200$       | `ProjectDetailModal`                                              |
| `/components/portfolio/category-utils.ts`            | Maps category IDs to natural Persian labels                               | $\le 80$        | `getCategoryPersianLabel`, `getCategoryShortLabel`                |
| `/components/ascii-wordmark/AsciiWordmarkCanvas.tsx` | React wrapper for WebGL/GPGPU ASCII wordmark particle simulation          | $\le 70$        | `AsciiWordmarkCanvas`                                             |
| `/components/contact/ContactSection.tsx`             | Dual-column contact studio: direct channels, trust badges & form          | $\le 220$       | `ContactSection`                                                  |
| `/components/contact/ContactForm.tsx`                | Composed inquiry form binding `useContactForm` to compound UI             | $\le 80$        | `ContactForm`                                                     |
| `/components/contact/ContactCompound.tsx`            | React 19 compound context, form frame, and submit button                  | $\le 170$       | `Contact`, `ContactProvider`, `useContactContext`                 |
| `/components/contact/ContactFields.tsx`              | Accessible RTL/LTR form inputs and quick subject selector tags            | $\le 250$       | `ContactFirstNameField`, `ContactSubjectField`, etc.              |
| `/components/contact/ContactFormAlerts.tsx`          | Validation error and mailto fallback copy alert banners                   | $\le 120$       | `ContactFormAlerts`                                               |
| `/components/layout/Footer.tsx`                      | Cybernetic footer with quick links, back-to-top, and digital fire         | $\le 140$       | `Footer`                                                          |
| `/components/digital-fire/DigitalFireContainer.tsx`  | Footer wrapper pairing `DigitalFireCanvas` with `CRTScreenOverlay`        | $\le 50$        | `DigitalFireContainer`                                            |
| `/components/digital-fire/DigitalFireCanvas.tsx`     | Interactive 2D canvas rendering Unicode/ASCII thermal fire & embers       | $\le 260$       | `DigitalFireCanvas`                                               |
| `/components/view-transitions/ViewTransition.tsx`    | React 19 `ViewTransition` & `DirectionalTransition` bridge                | $\le 90$        | `ViewTransition`, `DirectionalTransition`, `addTransitionType`    |
| `/hooks/use-app-loaded.ts`                           | Global synchronization store for initial preloader completion             | $\le 60$        | `useAppLoaded`, `markAppLoaded`                                   |
| `/hooks/use-contact-form.ts`                         | Headless state & submission lifecycle hook for the inquiry form           | $\le 130$       | `useContactForm`                                                  |
| `/hooks/use-parallax.ts`                             | Scroll-driven spring parallax hook respecting reduced motion              | $\le 70$        | `useParallax`                                                     |
| `/hooks/use-motion-preference.ts`                    | Reactive `prefers-reduced-motion` media query hook                        | $\le 40$        | `useReducedMotionPreference`                                      |
| `/lib/app-config.ts`                                 | Central source of truth for `FEATURE_FLAGS` and `SITE_CONFIG`             | $\le 220$       | `FEATURE_FLAGS`, `SITE_CONFIG`                                    |
| `/lib/portfolio-data.ts`                             | Project dataset, categories, flags, and filter/count helpers              | $\le 210$       | `SHOWCASE_PROJECTS`, `PORTFOLIO_CATEGORIES`, `PORTFOLIO_FLAGS`    |
| `/lib/motion-tokens.ts`                              | Cubic-bezier easings, duration tokens, and stagger/reveal variants        | $\le 130$       | `MOTION_EASINGS`, `MOTION_DURATIONS`, variants                    |
| `/lib/inquiry-protocol.ts`                           | Contact payload validation, formatting, and multi-channel dispatcher      | $\le 360$       | `dispatchInquiry`, `submitInquiryAsync`, `validateInquiryPayload` |
| `/lib/telegram-dispatcher.ts`                        | Telegram Bot API HTML-formatted inquiry dispatcher                        | $\le 160$       | `sendInquiryToTelegram`, `formatTelegramMessage`                  |
| `/lib/emailjs-dispatcher.ts`                         | Server & browser EmailJS REST API inquiry dispatcher                      | $\le 190$       | `sendInquiryToEmailJS`, `sendInquiryToEmailJSBrowser`             |
| `/lib/font-cache.ts`                                 | Browser Cache Storage API font persistence for WebGL glyph atlases        | $\le 100$       | `ensureFontsCached`, `discoverFontUrls`                           |
| `/lib/color-temperature.ts`                          | Sinusoidal color palette interpolation & lookup table                     | $\le 90$        | `getDynamicColorPalette`                                          |
| `/lib/ascii-wordmark/renderer.ts`                    | Three.js WebGL/GPGPU pipeline for interactive ASCII wordmark              | $\le 350$       | `AsciiWordmarkRenderer`                                           |
| `/lib/digital-fire/fire-simulator.ts`                | Zero-allocation `Uint8Array` thermal fire & ember physics engine          | $\le 210$       | `FireSimulator`                                                   |
| `/lib/digital-fire/fire-palettes.ts`                 | 36-level thermal color gradients (`solar`, `emerald`, `amber`) & charsets | $\le 160$       | `FIRE_PALETTES`, `FIRE_CHAR_SETS`, `FIRE_HEAT_LEVELS`             |
| `/app/api/contact/route.ts`                          | Next.js API Route dispatching inquiries to Telegram & EmailJS in parallel | $\le 90$        | `POST`                                                            |

---

## 4. RUNTIME PERFORMANCE, VIEW TRANSITIONS & UX PROTOCOLS

1. **Optical Glassmorphism & GPU-Accelerated Micro-Motions:**
   - Card and form chassis simulate overhead directional light on dark smoked glass (`bg-gradient-to-b from-zinc-900/80 via-zinc-950/90 to-black/95`, top highlight `border-t-white/30`, inner highlight `inset 0 1px 0 0 rgba(255,255,255,0.14)`, and deep ambient shadow).
   - Hover states modify only GPU-composited properties (`transform-gpu`, `opacity`, `box-shadow`, border colors) with `[contain:paint_layout]` to prevent layout thrashing or sibling repaints.

2. **React 19 View Transitions & Shared-Element Morphing:**
   - `ProjectCardFrame` and `ProjectDetailModal` share `ViewTransition` names (`project-container-${project.id}` with `share="morph"` and `project-title-${project.id}` with `share="text-morph"`).
   - Modal inspection triggers inside `React.useTransition` (`startModalTransition`), enabling smooth hardware-accelerated geometry and typography morphing without raster scaling artifacts.
   - Persistent elements (`custom-cursor`, `main-app-footer`) are isolated in `app/globals.css` via `::view-transition-group(...)` rules so they never flicker during transitions.

3. **Decoupled Parallax vs. Layout Animations:**
   - Scroll-driven parallax (`useParallax`) is applied exclusively to outer section containers (`m.div`), while filterable grid items (`m.li` inside `AnimatePresence mode="popLayout"`) manage `layout="position"` independently to prevent transform matrix conflicts.

4. **Offscreen Canvas Suspension & Below-the-Fold Deferral:**
   - Below-the-fold sections (`#portfolio-showcase-section`, `#contact-inquiry-section`, `#main-app-footer`) apply `content-visibility: auto; contain-intrinsic-size: auto 600px;`.
   - All three canvas engines (`TerminalShaderCanvas`, `AsciiWordmarkCanvas`, and `DigitalFireCanvas`) attach `IntersectionObserver` instances to immediately halt `requestAnimationFrame` loops when scrolled out of the viewport.

5. **Digital Fire Engine (`DigitalFireCanvas` & `FireSimulator`) & Hero Shader Constraints:**
   - Uses a flat `Uint8Array(cols * rows)` heat buffer with 36 thermal levels, 3-wave harmonic base excitation, convective upward cooling with wind jitter, and floating binary (`0`/`1`) ember particles.
   - Renders in the footer with the `emerald` palette and `unicode-shades` (`[' ', '░', '▒', '▓', '█']`) character set.
   - **STRICT RULE (NO HOVER EFFECTS):** Never attach hover / pointer-move (`trail` or `onPointerMove`) effects to either `TerminalShaderCanvas` (Hero Section) or `DigitalFireCanvas` (Footer). Both must remain free of hover distortion.

6. **Accessible Keyboard Navigation & Ergonomic Touch Targets:**
   - `SkipToContent` provides immediate keyboard jump to `#main-root`.
   - `PortfolioFilterTabs` implements `role="tablist"` with `ArrowLeft` / `ArrowRight` roving navigation and horizontal touch scrolling on compact viewports.
   - `ProjectDetailModal` traps `Escape` key dismissal and maintains high-contrast `emerald-400` focus rings across all interactive controls.

---

## 5. LAYER MAP & DEPENDENCY RULE (CLEAN ARCHITECTURE)

Source code dependencies strictly point inward from framework/UI drivers toward pure domain and mathematical rules:

1. **Frameworks & Drivers (`/app`, `/workers`)**: Next.js App Router entry points, metadata, error boundaries, and the `OffscreenCanvas` Web Worker host.
2. **Interface Adapters (`/components`, `/hooks`)**: React 19 Compound Components (`HeroCompound`, `PortfolioCompound`, `ProjectCardCompound`, `ContactCompound`), `ViewTransition` bridges, and headless React hooks (`useContactForm`, `useTerminalWorker`, `useGlitchScramble`, `useAppLoaded`).
3. **Domain & Physics Engines (`/lib`, `/types`)**: Framework-free TypeScript modules (`inquiry-protocol.ts`, `portfolio-data.ts`, `terminal-engine.ts`, `wave-physics.ts`, `shockwave-physics.ts`, `color-temperature.ts`, `glyph-atlas.ts`, `fire-simulator.ts`, `word-points.ts`). Zero imports from `react`, `next`, `components/`, or `hooks/`.

| Violation Check                                   | Location                                         | Fix / Enforcement                                                    | Status            |
| :------------------------------------------------ | :----------------------------------------------- | :------------------------------------------------------------------- | :---------------- |
| Framework imports inside domain/physics modules   | `/lib/**`                                        | Enforced zero `react`/`next` imports across all `/lib` modules       | Closed (Verified) |
| Direct `window.location` coupling in contact form | `lib/inquiry-protocol.ts`                        | Isolated behind `dispatchInquiry` return contract with SSR guard     | Closed (Verified) |
| Sibling state coupling in Portfolio & Contact     | `components/portfolio/*`, `components/contact/*` | Lifted into React 19 Compound Providers (`{ state, actions, meta }`) | Closed (Verified) |

---

## 6. SYSTEM CONTEXT, SIZING & DATA/CONCURRENCY DECISIONS

### System Context & Load Sizing (Phase 8)

- **Delivery Topology**: Stateless Next.js App Router bundle served via CDN/Cloud Run; all simulation and inquiry formatting workloads execute on the client device.
- **Client Frame Budget**: $16.6\text{ms}$ per frame ($60\text{FPS}$).
  - **Terminal Grid**: $\sim 2,800$ cells on mobile/low-end hardware (`dpr` capped at `1.0`, `1.2x` cell size) up to $\sim 8,000$ cells on desktop (`dpr` capped at `2.0`), rendered via $O(1)$ pre-rasterized `OffscreenCanvas` sprite blitting (`ATLAS_CACHE` bounded to 11 quantized steps $\approx 2.2\text{MB}$ total texture memory).
  - **ASCII Wordmark GPGPU**: FBO size $128\times 128$ ($16,384$ particles) on coarse pointers and $200\times 200$ ($40,000$ particles) on desktop at $0.5\times$ composer resolution scale.
  - **Digital Fire**: Flat `Uint8Array` thermal grid ($\sim 3\text{KB}$) + fixed 40-slot pre-allocated ember pool (`0` GC allocations per frame).

### Data & Concurrency Decisions (Phase 9)

- **Cross-Thread State Isolation**: `terminal.worker.ts` owns the transferred `OffscreenCanvas` and cell matrix exclusively once initialized; communication uses unidirectional value messages (`INIT` $\to$ `RESIZE` / `POINTER_MOVE` / `POINTER_DOWN` / `VISIBILITY_CHANGE` $\to$ `CLEANUP`) with zero shared mutable memory races.
- **Hydration & External Store Consistency**: `hooks/use-app-loaded.ts` uses React 19 `useSyncExternalStore` with deterministic server (`false`) and client (`Boolean(window.__kksAppLoaded)`) snapshots to prevent hydration mismatches while coordinating post-loader entrance animations.

### Decision Log

| Date       | Phase       | Architectural Decision                                                                | Rationale                                                                                                        |
| :--------- | :---------- | :------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------- |
| 2026-09-28 | Phase 4 & 5 | React 19 Compound Components with `{ state, actions, meta }` DI contexts              | Decouples UI layout from state hooks and eliminates prop drilling across Hero, Portfolio, and Contact modules    |
| 2026-09-28 | Phase 3 & 8 | Pre-allocated typed buffers (`SINE_LUT`, `shockwavePool`, `emberPool`, `ATLAS_CACHE`) | Eliminates garbage collection pauses during 60FPS canvas rendering                                               |
| 2026-09-28 | Phase 7 & 9 | Worker error isolation (`onerror`/`onmessageerror`) & WebGL context loss recovery     | Ensures GPU sleep or worker failure degrades gracefully without crashing the host application                    |
| 2026-10-06 | Directive   | Explicit No-Test-Files Policy                                                         | Project policy directive removes unit test files; QA is enforced via ESLint, tsc, and Next.js build verification |
