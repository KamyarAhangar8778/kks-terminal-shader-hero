<!-- KKS // README -->
<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=18&duration=2400&pause=900&color=72F7D2&center=true&vCenter=true&width=520&lines=SIGNAL+ACQUIRED...;WELCOME+TO+THE+KKS+TERMINAL;REALTIME+SHADERS.+RETRO+SOUL." alt="KKS terminal intro" />

# KKS // TERMINAL SHADER HERO

**A signal from another terminal.**

*Interactive ASCII · WebGL2 shaders · CRT distortion · Cyberpunk atmosphere*

<br />

[![Next.js](https://img.shields.io/badge/Next.js-15-000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-000?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-000?style=flat-square&logo=typescript&logoColor=3178C6)](https://www.typescriptlang.org/)
[![WebGL2](https://img.shields.io/badge/WebGL2-Realtime%20Graphics-000?style=flat-square&logo=webgl&logoColor=72F7D2)](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext)
[![License: MIT](https://img.shields.io/badge/License-MIT-000?style=flat-square&logo=opensourceinitiative&logoColor=72F7D2)](LICENSE)

<br />

**[Explore the source](https://github.com/KamyarAhangar8778/kks-terminal-shader-hero) · [Report an issue](https://github.com/KamyarAhangar8778/kks-terminal-shader-hero/issues)**

</div>

---

<div align="center">

```text
╭──────────────────────────────────────────────────────────────╮
│  K K S     / /   SIGNAL ONLINE                                │
│                                                              │
│  > rendering glyph field          [██████████] 100%           │
│  > synchronizing wavefront        [██████████] 100%           │
│  > warming up the CRT             [██████████] 100%           │
│                                                              │
│  SYSTEM: WEBGL2     MODE: INTERACTIVE     MOOD: AFTER DARK     │
╰──────────────────────────────────────────────────────────────╯
```

</div>

## The idea

KKS Terminal Shader Hero is a dark, experimental landing experience built around one simple premise: **make the interface feel like a living signal, not a static page.**

A custom ASCII wordmark, real-time shader work, CRT-inspired image treatment, and small responsive interactions combine into a distinct cyberpunk identity for KKS.

## Inside the signal

<table>
<tr>
<td width="50%" valign="top">

### `01 / ASCII FIELD`

A living KKS wordmark and character matrix rendered through custom WebGL2 shader work, including a **Wavefront ASCII Swirl** effect.

</td>
<td width="50%" valign="top">

### `02 / WAVE RESPONSE`

Harmonic wave motion and a reactive **shockwave** interaction add energy without turning every pointer movement into noise.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### `03 / CRT LAYER`

Scanlines, subtle screen curvature, and chromatic separation bring the texture of old displays into a modern browser.

</td>
<td width="50%" valign="top">

### `04 / MOTION SYSTEM`

Parallax, transitions, and a custom cursor give the page movement while keeping the actual content and navigation in focus.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### `05 / FONT ATLAS`

Browser-side font caching helps repeated character-atlas work avoid unnecessary rebuilding.

</td>
<td width="50%" valign="top">

### `06 / CONTACT CHANNEL`

A contact experience wired for Telegram and EmailJS, with a `mailto` fallback path.

</td>
</tr>
</table>

## The stack

<div align="center">

| Layer | Tools |
|:--|:--|
| App framework | **Next.js 15** · App Router |
| UI | **React 19** · TypeScript (strict) |
| Styling | **Tailwind CSS 4** |
| Motion | **Motion** |
| Graphics | **WebGL2** · Three.js · Canvas 2D |
| Icons | Lucide · Tabler Icons |

</div>

## Boot sequence

Requirements: **Node.js 18.18+** and npm.

```bash
# 1. Get the source
git clone https://github.com/KamyarAhangar8778/kks-terminal-shader-hero.git
cd kks-terminal-shader-hero

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open **http://localhost:3000**.

### Production mode

```bash
npm run build
npm run start
```

### Quality checks

```bash
npm run lint
npm run typecheck
npm run format:check
```

> `npm test` is currently a placeholder script; it does not run an automated test suite.

## Project map

```text
app/
  globals.css              Global styling
  layout.tsx               Root layout, metadata, fonts
  page.tsx                 Page composition

components/
  ascii-wordmark/          ASCII wordmark rendering
  hero/                    Canvas, CRT and glitch layers
  portfolio/               Project showcase
  contact/                 Contact form and channel logic
  custom-cursor/           Pointer treatment
  layout/                  Footer and layout components

hooks/                     Interaction and animation hooks
lib/                       Wave math, contact helpers, utilities
types/                     Shared TypeScript types
```

## Before going live

- Configure and verify the Telegram and EmailJS integrations used by the contact form.
- Test WebGL2 support and performance on the target browsers and devices.
- Run a production build and review responsive behavior at real viewport sizes.

## License

Released under the [MIT License](LICENSE).

---

<div align="center">

**KKS — built to feel like a signal from another terminal.**

<sub>LESS UI NOISE. MORE SIGNAL.</sub>

</div>
