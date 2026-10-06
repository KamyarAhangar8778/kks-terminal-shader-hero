# Design System & UX Audit (KKS Systems)

## Design Direction

- **Archetype**: Cybernetic Terminal / High-Density Phosphor Matrix (Deep Tech & Retro-Futurism).
- **Personality**: Precise, mathematical, responsive, clean.
- **Signature Moment**: Offscreen Web Worker 2D canvas with 3D harmonic wave math and click shockwave impulses.

## Typography

- **Display Font Stack**: `"SF Mono", "Fira Code", ui-monospace, Menlo, Consolas, monospace`
- **Persian Body Font**: `Vazirmatn` (Weights: 400, 500, 600, 700, 800)
- **Code & Telemetry Font**: `JetBrains Mono`
- **Scale Ratio**: 1.25 (Major Third)
- **Line Height**: 1.5–1.7 for Persian body text, 1.1–1.25 for display headings.
- **Measure Constraint**: Constrained to 65–75ch for optimal reading comfort.
- **Loading Strategy**: Next.js Google Fonts preloaded with `display: 'swap'` and zero layout shift.

## Tokens

- **Canvas Deep**: `#07090e` / `rgb(7, 9, 14)` (<5% saturation)
- **Chassis Enclosure**: `#0b0f17`
- **Grid Dark**: `#1e293b`
- **Glyph Muted**: `#475569`
- **Glyph Medium**: `#94a3b8`
- **Glyph Bright**: `#e2e8f0`
- **Accent Cyan**: `#38bdf8`
- **Accent Ice**: `#67e8f9`
- **Accent Violet**: `#a78bfa`
- **Spacing Scale**: 4px / 8px / 12px / 16px / 24px / 32px / 48px / 64px

## Components

| Component              | Decision                                                              | Status |
| ---------------------- | --------------------------------------------------------------------- | ------ |
| `TerminalShaderCanvas` | Render 60FPS matrix off-main-thread via OffscreenCanvas Web Worker    | Done   |
| `CentralKKSDisplay`    | Periodic character scramble glitch with chromatic aberration split    | Done   |
| `ProjectCard`          | High-density terminal project card with live status & tags            | Done   |
| `ContactForm`          | RTL-aligned 2-column input matrix with mailto fallback protocol       | Done   |
| `CustomTerminalCursor` | Hardware-accelerated laser crosshair reticle with smooth lerp physics | Done   |

## UX Audit Findings (Nielsen Heuristics & Norman Gulfs)

| Issue                         | Heuristic / Norman Gulf               | Severity (0-4) | Fix                                                                         | Status |
| ----------------------------- | ------------------------------------- | -------------- | --------------------------------------------------------------------------- | ------ |
| Form submit raw mailto fail   | Error Prevention / Gulf of Execution  | Severity 3     | Added client validation & fallback copy button for email transmission       | Done   |
| Small touch targets on mobile | Flexibility & Efficiency / Affordance | Severity 3     | Enforced min-height 44px and touch target padding across all controls       | Done   |
| Canvas rendering off-screen   | Performance Efficiency                | Severity 2     | Connected IntersectionObserver to freeze canvas animation when scrolled out | Done   |
| Keyboard focus visibility     | Accessibility / Signifiers            | Severity 2     | Added high-contrast sky-400 focus rings across all interactive controls     | Done   |

## Microinteraction Inventory

| Interaction          | Trigger / Rules / Feedback / Loops       | Fix                                                           | Status |
| -------------------- | ---------------------------------------- | ------------------------------------------------------------- | ------ |
| Reticle Hover        | Pointer movement on interactive elements | Scales reticle from 18px to 28px with sky-400 accent glow     | Done   |
| Canvas Click Impulse | `pointerdown` on terminal section        | Triggers kinetic shockwave pulse across cell grid             | Done   |
| Glitch Scramble      | Random timer (3200ms-5800ms)             | 650ms burst of character scrambling with RGB chromatic split  | Done   |
| Form Transmission    | `submit` button click                    | Shows `[ TRANSMITTING... ]` pulse with disabled loading state | Done   |
