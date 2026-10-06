# Reliability

## Integration-Point Audit

| Dependency                                                                                                                             | Timeout                                                             | Circuit breaker                                                                                                       | Bulkhead                                                           | Retry policy                                                     | Status |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- | ------ |
| WebGL2 ASCII Swirl Hero (`components/hero/swirl/*`)                                                                                    | Immediate WebGL2 context & FBO check (`createRenderer`)             | Graceful fallback `<div id="terminal-shader-fallback">` + `webglcontextlost` listener pausing RAF loop                | Isolated `<canvas>` context & `IntersectionObserver` viewport gate | Automatic `webglcontextrestored` rebuild and loop resumption     | Active |
| WebGL2 GPGPU Wordmark (`lib/ascii-wordmark/renderer.ts`)                                                                               | Immediate FBO capability check (`setupGPGPUPipeline`)               | Graceful `mount(): false` abort + `webglcontextlost` listener pausing RAF loop                                        | Isolated `<canvas>` context & `IntersectionObserver` viewport gate | Automatic `webglcontextrestored` resize and loop resumption      | Active |
| Inquiry Dispatchers (`app/api/contact/route.ts`, `lib/telegram-dispatcher.ts`, `lib/emailjs-dispatcher.ts`, `lib/inquiry-protocol.ts`) | Parallel `Promise.all` API dispatch + synchronous validation (<1ms) | Explicit `response.ok` HTTP status guards + automatic client-side Telegram/EmailJS fallback + manual copy-email alert | Isolated API route & client-side fallback channels                 | Automatic browser-side fallback when server route is unreachable | Active |
| Browser Font Cache (`lib/font-cache.ts`)                                                                                               | Asynchronous `caches.open('kks-font-assets-v1')` check              | Silent `try / catch` fallback when Cache Storage API is unavailable                                                   | Dedicated Cache Storage bucket                                     | Re-validates on subsequent page loads                            | Active |
| Browser Clipboard API (`navigator.clipboard.writeText`)                                                                                | Immediate async Promise resolution                                  | `try / catch` guard around clipboard write                                                                            | Isolated UI component state                                        | Manual text selection (`select-all`) fallback                    | Active |
| Font Asset Loading (`next/font/google`)                                                                                                | Next.js build-time self-hosting (`display: swap`)                   | System monospace/sans fallback stack                                                                                  | Static asset CDN                                                   | Browser HTTP retry                                               | Active |

## Query & Resource Findings

- **60FPS Render Loop Memory**: Zero dynamic heap allocations in `updateGrid`, `renderTerminalGrid`, `sampleWaveField`, `updateShockwaves`, and `FireSimulator.step`.
  - `wave-physics.ts`: Uses a pre-computed `Float32Array(4096)` Sine LUT (`SINE_LUT`) and mutates a single static `WaveSample` record.
  - `shockwave-physics.ts`: Uses a fixed 12-slot ring buffer (`shockwavePool`).
  - `fire-simulator.ts`: Uses a flat `Uint8Array(cols * rows)` thermal buffer and a pre-allocated 40-slot `emberPool` with $O(1)$ swap-and-pop compaction.
  - `glyph-atlas.ts`: Bounds `ATLAS_CACHE` to 11 quantized color-temperature steps (`0..10`) and clears automatically on viewport cell-metric changes.
- **Viewport & Tab Suspension**: All three canvas engines (`TerminalShaderCanvas`, `AsciiWordmarkCanvas`, `DigitalFireCanvas`) attach `IntersectionObserver` and `visibilitychange` listeners to halt `requestAnimationFrame` loops immediately when offscreen or backgrounded.

## Health Checks & Metrics

- **Error Boundaries**: Route-level (`app/error.tsx`), root-level (`app/global-error.tsx`), and 404 (`app/not-found.tsx`) boundaries trap unexpected rendering exceptions and offer immediate state recovery (`reset()`).
- **Dynamic Resolution Scaling (Adaptive Frame Pacing)**: Both `workers/terminal.worker.ts` and `lib/terminal-session.ts` monitor frame deltas (`delta > 22ms`); after 5 consecutive slow frames, `dynamicScaleFactor` steps up (up to `1.6x`) to reduce active cell count and restore 60FPS.

## Deploy vs Release

- **Feature Flags (`lib/app-config.ts`)**: All major visual and behavioral capabilities (`initialLoader`, `customCursor`, `crtEffects`, `backgroundGlitch`, `chromaticAberration`, `asciiWordmark`, `footerHorizon`, `geometricBackgrounds`) are decoupled behind `FEATURE_FLAGS` for instant toggle/rollback without structural code changes.
- **Stateless Static/Container Compatibility**: Zero database or runtime server state dependencies, enabling instant horizontal scaling on Cloud Run or static CDN edge nodes.
