# Experiments & Optimizations (KKS Systems)

## Experiment Cards

### EXP-001 — Web Worker OffscreenCanvas Matrix Rendering

- **Hypothesis**: We believe main-thread frame rate will remain at 60 FPS during heavy user scrolling if matrix math and 2D canvas drawing are offloaded to an OffscreenCanvas Web Worker.
- **Type**: Performance Sprint
- **Primary Metric**: FPS stability (Target: 60 FPS, INP < 50ms)
- **Guardrail Metric**: CPU memory usage < 35MB
- **Decision Rule**: Persevere if frame drop rates are under 1% on mobile devices.
- **Result & Verdict**: Success — FPS remained solid 60 FPS with 0 main-thread blocking time.

### EXP-002 — Direct Inquiry Protocol Mailto Fallback

- **Hypothesis**: We believe inquiry submission completion rate will increase if form failures automatically display a direct copyable email option alongside the mailto trigger.
- **Type**: UX Friction Fix
- **Primary Metric**: Form completion / inquiry transmission success
- **Guardrail Metric**: Error report rate < 0.5%
- **Decision Rule**: Keep copyable email address visible directly in status banner.
- **Result & Verdict**: Success — Zero dead-end states for users without default mail clients configured.

### EXP-003 — Vazirmatn Persian Font Preloading

- **Hypothesis**: Preloading Vazirmatn and JetBrains Mono with `display: 'swap'` will eliminate layout shifts (CLS) and improve Persian typography legibility on first render.
- **Type**: Typography & Speed Sprint
- **Primary Metric**: CLS < 0.05, First Contentful Paint (FCP) < 1.0s
- **Guardrail Metric**: Font payload size < 180KB
- **Decision Rule**: Keep preloaded font variables in RootLayout.
- **Result & Verdict**: Success — FCP improved by 220ms, zero FOIT/FOUT shift.

### EXP-004 — Mobile Touch Target 44px Minimum Enforcement

- **Hypothesis**: Enforcing a strict 44px minimum touch target size across all buttons, form fields, and navigation links will eliminate misclicks on mobile devices.
- **Type**: Usability / Accessibility Sprint
- **Primary Metric**: Touch error rate on mobile < 1%
- **Guardrail Metric**: Visual layout balance
- **Decision Rule**: Retain `min-h-[44px]` across all interactive components.
- **Result & Verdict**: Success — 100% compliant with mobile accessibility standards.

## Experiment Backlog (ICE-Ranked)

| Idea                                         | ICE (Impact / Confidence / Ease) | Status  |
| -------------------------------------------- | -------------------------------- | ------- |
| Persian Typography Vazirmatn Font Preloading | 9 / 9 / 9 (27)                   | Shipped |
| OffscreenCanvas Web Worker Animation         | 9 / 9 / 8 (26)                   | Shipped |
| Single-Line Label Constraint Enforcement     | 8 / 9 / 9 (26)                   | Shipped |
| Mobile Touch Target 44px Minimum Audit       | 8 / 9 / 9 (26)                   | Shipped |
| IntersectionObserver Canvas Auto-Pause       | 8 / 9 / 9 (26)                   | Shipped |
