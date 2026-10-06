# Technical Debt

## Debt Ledger

| Item                                                                                       | Location                                                                   | Type             | Risk   | Effort | Priority | Status                                                                                                |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ---------------- | ------ | ------ | -------- | ----------------------------------------------------------------------------------------------------- |
| Per-frame ember object `.push()` and `.splice()` in 60FPS fire loop                        | `lib/digital-fire/fire-simulator.ts`                                       | Performance / GC | Medium | Low    | High     | Resolved (Replaced with pre-allocated 40-slot swap-and-pop ember pool)                                |
| Unhandled WebGL context loss on mobile/GPU sleep                                           | `lib/ascii-wordmark/renderer.ts`                                           | Reliability      | Medium | Low    | High     | Resolved (Added `webglcontextlost` & `webglcontextrestored` lifecycle handlers)                       |
| Unhandled runtime Worker errors after `transferControlToOffscreen`                         | `lib/terminal-session.ts`                                                  | Reliability      | Low    | Low    | Medium   | Resolved (Added `worker.onerror` and `worker.onmessageerror` isolation & teardown)                    |
| Unused legacy loader variants (`Morph`, `Comet`, `Metaballs`, etc. in `loader-shapes.tsx`) | `components/motion/loader-shapes.tsx`                                      | Dead Code        | Low    | Low    | Low      | Logged (Preserved per surgical-changes rule; only `AsciiLineLoader` is mounted in `InitialAppLoader`) |
| Legacy compatibility footer canvas wrappers                                                | `components/layout/FooterDigitalFireCanvas.tsx`, `FooterHorizonCanvas.tsx` | Dead Code        | Low    | Low    | Low      | Logged (Preserved per surgical-changes rule; `Footer.tsx` mounts `DigitalFireContainer` directly)     |

## Smell Inventory

| Smell                                                                  | Location                                                                           | Refactoring                                                                                                                                   | Status |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Dynamic heap allocation in 60FPS `updateEmbers` & `injectHeat`         | `lib/digital-fire/fire-simulator.ts`                                               | Replace Dynamic Allocation with Pre-Allocated Object Pool (`emberPool` + swap-and-pop)                                                        | Done   |
| Magic numbers in terminal grid glitch & spring damping                 | `lib/terminal-engine.ts`                                                           | Replace Magic Number with Symbolic Constant (`GLITCH_CYCLE_MS`, `TARGET_OFFSET_DAMPING`, `SPRING_EQUILIBRIUM_LERP`)                           | Done   |
| Prop drilling across Portfolio filter tabs, grid, and modal            | `components/portfolio/*`                                                           | Lift State into React 19 Compound Provider (`PortfolioStateProvider` with `{ state, actions, meta }`)                                         | Done   |
| Boolean status flags in ProjectCard & ContactForm alerts               | `components/portfolio/ProjectCard.tsx`, `components/contact/ContactFormAlerts.tsx` | Replace Conditional with Explicit Variant Components (`DeployedProjectCard`, `SourceProjectCard`, `ContactErrorAlert`, `ContactSuccessAlert`) | Done   |
| Repeated inline Motion transition objects in `PortfolioGrid`           | `components/portfolio/PortfolioCompound.tsx`                                       | Extract Constant (`GRID_ITEM_TRANSITION`) to keep module under 300-line ceiling                                                               | Done   |
| Tautological assertion (`>= 0` on `Uint8Array`) in fire simulator test | `lib/digital-fire/fire-simulator.test.ts`                                          | Strengthen characterization assertion to verify positive risen heat (`> 0`) and pool bounds                                                   | Done   |

## Sprout / Wrap Register

- **Inquiry Mailto Dispatch (`lib/inquiry-protocol.ts`)**: Wraps browser `window.location.href` navigation behind `dispatchInquiry(data, recipient)` so validation, sanitization, and RFC `mailto:` formatting execute headlessly in unit tests.
- **OffscreenCanvas Worker Session (`lib/terminal-session.ts`)**: Wraps Web Worker creation and `transferControlToOffscreen()` behind `createTerminalSession()`, automatically falling back to main-thread Canvas 2D rendering when `OffscreenCanvas` is unavailable.

## Debt Budget & Broken-Windows Policy

- **Line Ceiling**: Active source modules must remain $\le 300$ lines (hard ceiling 400 lines for self-contained shaders/configs).
- **Zero Untracked Hacks**: No untracked `// TODO`, `// FIXME`, or `@ts-ignore` comments are permitted in `main`; any deferred item must be recorded in the Debt Ledger above.
- **Single-Purpose Commits**: Structural refactorings and behavioral changes are verified against the Vitest safety net before committing.

## Adopted Conventions

1. **Single Responsibility Principle (SRP)**: Every file owns one clear responsibility documented in `ARCHITECTURE.md`.
2. **Zero-Allocation 60FPS Loops**: `terminal-engine.ts`, `wave-physics.ts`, `shockwave-physics.ts`, and `fire-simulator.ts` pre-allocate typed arrays and object pools at startup and mutate in-place during `requestAnimationFrame`.
3. **React 19 Compound Composition**: Complex UI sections expose `{ state, actions, meta }` contexts consumed via React 19 `use()` without `forwardRef` or boolean prop proliferation.
4. **Strict Type Safety**: Zero `any` casts in application code; external/experimental React APIs (`ViewTransition`) use explicit structural interfaces.
