# Improve Code Quality Plan

## Context

- **Date Started**: 2026-09-03 (Updated: 2026-09-28)
- **App Core Purpose**: Interactive 60FPS dark terminal shader canvas, 3D WebGL/GPGPU ASCII wordmark, digital thermal fire simulation, portfolio showcase with React 19 View Transitions, and Persian inquiry dispatch studio (`KKS`).
- **Stack**: Next.js 15 (App Router), React 19 (Compound Components, `use()`, `ViewTransition`), TypeScript 5.9, Tailwind CSS v4, Three.js (GPGPU), Motion 12, Vitest.
- **Starting Modules**: `components/hero/swirl/*`, `lib/font-cache.ts`, `lib/inquiry-protocol.ts`, `lib/emailjs-dispatcher.ts`, `lib/telegram-dispatcher.ts`, `lib/color-temperature.ts`, `lib/portfolio-data.ts`, `lib/digital-fire/fire-simulator.ts`, `lib/ascii-wordmark/word-points.ts`.
- **Production Status**: Active public web application (static/edge-ready client-side rendering with WebGL2 & Canvas 2D pipelines).

## Phase Status

| Phase                              | Skill                      | Status                                                       | Artifact                         | Date       |
| ---------------------------------- | -------------------------- | ------------------------------------------------------------ | -------------------------------- | ---------- |
| 1 — Build the safety net           | working-with-legacy-code   | done                                                         | TESTING.md + TECH-DEBT.md (GATE) | 2026-09-28 |
| 2 — Make the code readable         | clean-code                 | done                                                         | TECH-DEBT.md                     | 2026-09-28 |
| 3 — Apply named refactorings       | refactoring-patterns       | done                                                         | TECH-DEBT.md                     | 2026-09-28 |
| 4 — Reduce complexity              | software-design-philosophy | done                                                         | TECH-DEBT.md                     | 2026-09-28 |
| 5 — Draw the architecture boundary | clean-architecture         | done                                                         | ARCHITECTURE.md                  | 2026-09-28 |
| 6 — Lock in the habits             | pragmatic-programmer       | done                                                         | TECH-DEBT.md                     | 2026-09-28 |
| 7 — Make it survive production     | release-it                 | done                                                         | RELIABILITY.md                   | 2026-09-28 |
| 8 — Size for real load             | system-design              | done                                                         | ARCHITECTURE.md + RELIABILITY.md | 2026-09-28 |
| 9 — Get the data layer right       | ddia-systems               | done                                                         | ARCHITECTURE.md                  | 2026-09-28 |
| Optional — Domain language         | domain-driven-design       | skipped: Single bounded context (portfolio & inquiry studio) | ARCHITECTURE.md                  | 2026-09-28 |

Statuses: pending · in-progress · awaiting-evidence · done · deferred: <reason> · skipped: <reason>

## Key Decisions

| Date       | Phase       | Decision                                                                                                                                                                                                | Rationale                                                                                                     |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 2026-09-28 | Phase 1     | Pin all pure domain, physics, fire simulation, portfolio filtering, and wordmark sampling modules in `lib/**/*.test.ts`                                                                                 | Establish a deterministic Vitest safety net (26 unit tests across 5 suites) before structural changes         |
| 2026-09-28 | Phase 2 & 3 | Replace per-frame `.push()` / `.splice()` ember allocations in `FireSimulator` with a pre-allocated swap-and-pop object pool (`MAX_EMBERS = 40`) and extract symbolic constants in `terminal-engine.ts` | Eliminate garbage collection pauses in 60FPS render loops and clarify physical constants                      |
| 2026-09-28 | Phase 4     | Consolidate UI sections into React 19 Compound Components (`HeroCompound`, `PortfolioCompound`, `ProjectCardCompound`, `ContactCompound`) with `{ state, actions, meta }` contracts                     | Hide state/transition machinery behind clean declarative interfaces and keep files within the 300-line budget |
| 2026-09-28 | Phase 5     | Enforce strict unidirectional dependency flow: `app/*` -> `components/*` -> `hooks/*` -> `lib/*` -> `types/*`                                                                                           | Ensure core physics engines and inquiry protocols have zero React or Next.js imports                          |
| 2026-09-28 | Phase 6     | Centralize feature switches, brand metadata, and portfolio dataset in `lib/app-config.ts` and `lib/portfolio-data.ts`                                                                                   | Prevent knowledge duplication across RTL/LTR UI layers and enforce Broken-Windows policy                      |
| 2026-09-28 | Phase 7     | Add runtime `worker.onerror` / `worker.onmessageerror` isolation in `terminal-session.ts` and `webglcontextlost` / `webglcontextrestored` recovery in `ascii-wordmark/renderer.ts`                      | Prevent crashed workers or evicted mobile WebGL contexts from breaking the host page                          |
| 2026-09-28 | Phase 8     | Bound `ATLAS_CACHE` to 11 quantized temperature steps (`0..10`), cap mobile DPR (`1.0-1.5`), and pause offscreen canvases via `IntersectionObserver`                                                    | Guarantee <16.6ms frame times and bounded GPU/RAM footprint across desktop and low-end mobile devices         |
| 2026-09-28 | Phase 9     | Synchronize preloader state via `useSyncExternalStore` (`use-app-loaded.ts`) and enforce idempotent worker message ordering (`INIT` -> `RESIZE` -> `VISIBILITY_CHANGE` -> `CLEANUP`)                    | Eliminate hydration tearing and main-thread/worker race conditions                                            |

## Next Actions

- [x] Pin pure domain and simulation modules with Vitest characterization suites (`lib/inquiry-protocol.test.ts`, `lib/portfolio-data.test.ts`, `lib/terminal-physics.test.ts`, `lib/digital-fire/fire-simulator.test.ts`, `lib/ascii-wordmark/word-points.test.ts`)
- [x] Refactor `FireSimulator` to zero-allocation swap-and-pop ember pool
- [x] Harden `terminal-session.ts` and `ascii-wordmark/renderer.ts` against worker panics and WebGL context loss
- [x] Verify all active source modules stay within the 300-line ceiling
- [x] Run `lint`, `tsc --noEmit`, `vitest run`, and `compile_applet`
