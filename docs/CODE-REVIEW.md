# Comprehensive Code Review & Quality Audit

> **Review Standard**: Evaluated across 5 fundamental engineering axes according to `.gemini/skills/code-review-and-quality/SKILL.md`.

---

## 1. Context & Scope

- **Subject**: KKS Terminal Shader Hero, Portfolio Showcase, Contact Studio & Digital Fire Engine
- **Tech Stack**: Next.js 15 (App Router), React 19, TypeScript 5.8, Tailwind CSS v4, Motion 12, Three.js WebGL/GPGPU, Vitest 5
- **Purpose**: Conduct an honest, multi-axis audit across Correctness, Readability & Simplicity, Architecture, Security, and Performance; remediate all Critical and Required findings; expand unit test coverage; and document orphaned/dead code per `code-review-and-quality` hygiene rules.

---

## 2. Findings & Remediation Log (Severity-Labeled)

### Axis 1: Correctness

- **Critical:** `lib/inquiry-protocol.ts` — Contact form UI (`ContactFields.tsx` & `DESIGN.md` §4.3) explicitly invites users to enter either an email address or a Telegram handle (`ایمیل یا آیدی تلگرام`, placeholder `example@gmail.com یا @username`), but `validateInquiryPayload` previously validated `userEmail` strictly against `EMAIL_REGEX`, rejecting all `@username` inputs.
  - **Resolution:** Updated `validateInquiryPayload` to accept both RFC-5322 email addresses and valid Telegram handles (`/^@[a-zA-Z0-9_]{5,32}$/`), exported `validateInquiryPayload`, `formatInquiryBody`, and `buildInquiryMailtoUrl` per `ARCHITECTURE.md`, and added unit tests in `lib/inquiry-protocol.test.ts`.
- **Critical:** `components/custom-cursor/hooks/use-cursor-listeners.ts` — In `animate()`, the condition `if (distSq > 0.005 || isLoopRunning)` evaluated to `true` unconditionally because `startLoop()` sets `isLoopRunning = true`. The `else` branch was unreachable dead code, preventing velocity tilt reset and running an infinite 60/120Hz `requestAnimationFrame` loop even when the mouse was stationary or had left the window.
  - **Resolution:** Changed condition to `if (distSq > 0.005)` so the loop terminates cleanly once the cursor settles, and added loop cancellation inside `onPointerLeave`.
- _(Required)_ `components/digital-fire/DigitalFireCanvas.tsx` — Canvas pixel buffer dimensions (`canvas.width` / `canvas.height`) were only set inside the `ResizeObserver` callback rather than immediately upon initialization.
  - **Resolution:** Initialized `canvas.width` and `canvas.height` synchronously before starting the simulation loop.
- _(Required)_ `hooks/use-parallax.ts` & `components/hero/CentralKKSDisplay.tsx` — `ARCHITECTURE.md` (§3) and `DESIGN.md` (§5.3) specify that scroll-driven parallax and glitch bursts must pause when `prefers-reduced-motion: reduce` is enabled, but `useParallax` and `CentralKKSDisplay` did not check `useReducedMotionPreference()`.
  - **Resolution:** Integrated `useReducedMotionPreference()` into `useParallax` and `CentralKKSDisplay` to zero out scroll translation and glitch bursts under reduced motion.
- _(Required)_ `components/portfolio/ProjectDetailModal.tsx` — Opening the modal did not lock `document.body.style.overflow`, allowing background page scroll while inspecting a project.
  - **Resolution:** Added body overflow lock on modal open with automatic restoration on cleanup.
- _(Required)_ `components/hero/swirl/use-swirl-stage.ts`, `lib/emailjs-dispatcher.ts`, `lib/telegram-dispatcher.ts`, `lib/inquiry-protocol.ts` — Added explicit `response.ok` HTTP status verification before reading response bodies (`react-doctor/no-fetch-response-used-without-status-check`), added direct `cancelAnimationFrame(raf)` cleanup and WebGL context loss/restore listeners in `useSwirlStage`, replaced derived-state `useEffect` in `ColorControl` with render-phase state sync, hoisted `MAX_PROMPT_HEIGHT` in `PromptInput`, and added a semantic `sr-only` `<h1>` in `HeroCompound.tsx` for WCAG heading hierarchy.

### Axis 2: Readability & Simplicity

- _(Required)_ `components/common/SkipToContent.tsx`, `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx` — Used legacy English bracket labels (`[404]`, `PAGE_NOT_FOUND // NODE_UNREACHABLE`, `[EXECUTION_FAULT]`, `[CRITICAL_FAILURE]`) and slate/sky colors instead of natural Persian localization and the dark-glass zinc/emerald palette mandated by `DESIGN.md` (§1.1 & §2). Furthermore, `SkipToContent` linked to `#portfolio-showcase-section` instead of `#main-root` as specified in `ARCHITECTURE.md`.
  - **Resolution:** Updated all four files to follow `DESIGN.md` Persian localization and `ARCHITECTURE.md` landmark targets.
- **FYI:** Line budgets across all active application modules strictly conform to the 200–300 line target (`<= 350` max for WebGL renderer and `<= 420` for `app/globals.css`).

### Axis 3: Architecture

- _(Required)_ `lib/terminal-session-listeners.ts` & `lib/shockwave-physics.ts` — Exported function names differed slightly from the `ARCHITECTURE.md` §3 export contract table (`attachSessionListeners` and `sampleShockwaves`).
  - **Resolution:** Exported `attachSessionListeners` and `sampleShockwaves` (alongside `resetShockwaves` for test isolation) to maintain 100% contract parity.

### Axis 4: Security

- _(Required)_ `lib/inquiry-protocol.ts` — Single-line form fields (`firstName`, `lastName`, `websiteSubject`, `userEmail`) lacked upper length bounds and CR/LF control-character sanitization at the validation boundary.
  - **Resolution:** Added `sanitizeSingleLine()` to strip `[\r\n\0]` characters and enforced explicit maximum length limits (`MAX_NAME_LENGTH = 80`, `MAX_SUBJECT_LENGTH = 160`, `MAX_CONTACT_LENGTH = 120`).
- _(Required)_ `workers/terminal.worker.ts` — Hardened worker message boundary validation (`INIT` payload structure and positive dimension clamping).

### Axis 5: Performance

- _(Required)_ `components/digital-fire/DigitalFireCanvas.tsx` — `ctx.createRadialGradient(...)` and string `.replace()` were executed on every 60FPS `requestAnimationFrame` tick (~60 allocations/sec).
  - **Resolution:** Hoisted and cached `cachedGlowGradient` so it is only created on mount and `ResizeObserver` events.
- **Nit:** `components/contact/ContactCompound.tsx` — Wrapped `ContactContext.Provider` value in `useMemo` to prevent unnecessary consumer re-renders.

---

## 3. Dead Code Hygiene Report

Per `.gemini/skills/code-review-and-quality/SKILL.md` (_Dead Code Hygiene_) and `GEMINI.md` (_Surgical Changes: report pre-existing dead code rather than silently deleting files_):

```text
DEAD CODE IDENTIFIED:
- components/layout/FooterDigitalFireCanvas.tsx — superseded by components/digital-fire/DigitalFireCanvas.tsx (0 imports)
- components/layout/FooterHorizonCanvas.tsx — legacy compatibility wrapper for DigitalFireCanvas (0 imports)
- components/motion/loader-shapes.tsx — 9 unused geometric loader variants (Morph, Comet, Scramble, Metaballs, Newton, Helix, Percent, DotMatrix, Dither); InitialAppLoader only uses AsciiLineLoader
→ Safe to remove these?
```

---

## 4. The Review Checklist

### Context

- [x] I understand what this change does and why

### Correctness

- [x] Change matches spec/task requirements (`ARCHITECTURE.md` & `DESIGN.md`)
- [x] Edge cases handled (empty/whitespace inputs, `@username` vs email, reduced motion, zero dimensions)
- [x] Error paths handled (Worker fallback, clipboard fallback, validation error banners)
- [x] Tests cover the change adequately (4 Vitest test files, 19 tests covering fire physics, wave/shockwave/palette physics, portfolio filtering, and inquiry protocol)

### Readability

- [x] Names are clear and consistent
- [x] Logic is straightforward
- [x] No unnecessary complexity

### Architecture

- [x] Follows existing patterns (React 19 Compound Components, headless `lib/` engines)
- [x] No unnecessary coupling or dependencies
- [x] Appropriate abstraction level

### Security

- [x] No secrets in code
- [x] Input validated at boundaries (`validateInquiryPayload`, `sanitizeSingleLine`, Worker message checks)
- [x] No injection vulnerabilities (CR/LF stripped, `encodeURIComponent`, JSON-LD `\u003c` escaping)
- [x] External data sources treated as untrusted

### Performance

- [x] Zero-allocation 60FPS hot loops (`SINE_LUT`, static `shockwavePool`, cached `VIGNETTE_CACHE` & `cachedGlowGradient`)
- [x] Custom cursor RAF loop halts immediately upon settling (`distSq <= 0.005`) or pointer leave
- [x] Offscreen canvases pause via `IntersectionObserver` when scrolled out of view

### Verification

- [x] Tests pass (`npx vitest run` — 4 test suites, 19 tests passing)
- [x] Linter & Typecheck pass (`npm run lint` & `npx tsc --noEmit`)
- [x] Production build succeeds (`npm run build`)

### Verdict

- [x] **Approve** — Ready to merge
