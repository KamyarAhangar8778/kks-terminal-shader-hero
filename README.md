
<!-- KKS SYSTEMS // SIGNAL OVER NOISE -->

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Kode+Mono&weight=700&size=16&duration=2200&pause=700&color=72F7D2&center=true&vCenter=true&width=650&lines=%5BKKS+SYSTEMS%5D+BOOTING...;SIGNAL+LOCKED.+RENDERER+ONLINE.;REALTIME+SHADERS+%2F+RETRO+SOUL." alt="KKS Systems boot sequence" />

# KKS / TERMINAL SHADER HERO

### NOT JUST A HERO SECTION. A LIVE SIGNAL.

A cyberpunk interface experiment built from **ASCII typography, real-time WebGL2 shaders, CRT artifacts, and reactive motion**.

<br />

<a href="https://kamyarahangar8778.github.io/kks-terminal-shader-hero/"><strong>↗ OPEN LIVE EXPERIENCE</strong></a>
&nbsp;&nbsp;·&nbsp;&nbsp;
<a href="#-boot-the-project">RUN LOCALLY</a>
&nbsp;&nbsp;·&nbsp;&nbsp;
<a href="https://github.com/KamyarAhangar8778/kks-terminal-shader-hero/issues">REPORT A BUG</a>

<br /><br />

[![Next.js](https://img.shields.io/badge/NEXT.JS-15-050505?style=for-the-badge&logo=nextdotjs&logoColor=FFFFFF)](https://nextjs.org/)
[![React](https://img.shields.io/badge/REACT-19-050505?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TYPESCRIPT-STRICT-050505?style=for-the-badge&logo=typescript&logoColor=3178C6)](https://www.typescriptlang.org/)
[![WebGL2](https://img.shields.io/badge/WEBGL2-REALTIME-050505?style=for-the-badge&logo=webgl&logoColor=72F7D2)](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext)
[![MIT](https://img.shields.io/badge/LICENSE-MIT-050505?style=for-the-badge&logo=opensourceinitiative&logoColor=72F7D2)](LICENSE)

<br />

<img src="https://img.shields.io/badge/STATUS-EXPERIMENTAL-101010?style=flat-square&labelColor=101010&color=72F7D2" alt="Experimental project status" />
<img src="https://img.shields.io/badge/BUILT_FOR-THE_BOLD-101010?style=flat-square&labelColor=101010&color=72F7D2" alt="Built for the bold" />

</div>

---

<div align="center">

<pre>
┌──────────────────────────────────────────────────────────────────────┐
│  KKS.SYS  /  VISUAL SUBSYSTEM                              v0.1.0    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ██╗  ██╗██╗  ██╗███████╗                                           │
│   ██║ ██╔╝██║ ██╔╝██╔════╝       ASCII FIELD .......... ACTIVE       │
│   █████╔╝ █████╔╝ ███████╗       SHADER PIPELINE ...... ONLINE       │
│   ██╔═██╗ ██╔═██╗ ╚════██║       CRT POST-PROCESS ..... ENABLED      │
│   ██║  ██╗██║  ██╗███████║       POINTER INPUT ........ LISTENING    │
│   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝                                           │
│                                                                      │
│   [ SIGNAL ACQUIRED ]  [ REALTIME RENDERING ]  [ NO STATIC MOOD ]    │
└──────────────────────────────────────────────────────────────────────┘
</pre>

<sub>FIG. 01 — A terminal-inspired visual system, rendered in the browser.</sub>

</div>

## / 00 — The concept

Most hero sections ask for attention. **This one generates its own atmosphere.**

KKS Terminal Shader Hero turns a portfolio landing page into an interactive visual instrument: a custom ASCII wordmark forms and bends through shader-driven motion, CRT treatments add analog texture, and pointer interactions send energy through the scene.

The result sits somewhere between a developer portfolio, a retro-futurist terminal, and a real-time graphics experiment.

## / 01 — The signal chain

<table>
<tr>
<td width="50%" valign="top">

**01. ASCII / WAVEFRONT**

A custom character field shapes the KKS wordmark with the *Wavefront ASCII Swirl* effect. Typography becomes part of the rendering system—not just text on top of a background.

</td>
<td width="50%" valign="top">

**02. SHADER / RESPONSE**

Harmonic waves and click-triggered shockwaves add a physical sense of response. Interactions are designed to feel deliberate, not like random movement layered over a page.

</td>
</tr>
<tr>
<td width="50%" valign="top">

**03. CRT / SIGNAL DAMAGE**

Scanlines, subtle curvature, flicker, and chromatic separation evoke phosphor displays and analog video artifacts without abandoning a clean modern layout.

</td>
<td width="50%" valign="top">

**04. MOTION / DEPTH**

Parallax, directional transitions, reveal effects, and a custom cursor create depth while the portfolio and contact content remain usable.

</td>
</tr>
<tr>
<td width="50%" valign="top">

**05. TYPE / ATLAS**

Custom font loading and browser-side caching support the character-atlas workflow used by the ASCII renderer.

</td>
<td width="50%" valign="top">

**06. TRANSMISSION / CONTACT**

A contact flow connects Telegram and EmailJS integrations, with a mailto fallback for an alternate route.

</td>
</tr>
</table>

## / 02 — Under the hood

<div align="center">

| SYSTEM | IMPLEMENTATION |
|:--|:--|
| **Application** | Next.js 15 · App Router |
| **Interface** | React 19 · Strict TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Animation** | Motion |
| **Rendering** | WebGL2 · Three.js · Canvas 2D |
| **Iconography** | Lucide · Tabler Icons |

</div>

### Rendering philosophy

<pre>
USER INPUT ──┬── POINTER / CLICK
             │
             ▼
       INTERACTION STATE
             │
             ▼
       WAVE + SHOCKWAVE ───────┐
                               ▼
CHARACTER FIELD ────────► WEBGL2 SHADER PASS
                               │
                               ▼
                      CRT / CHROMATIC LAYERS
                               │
                               ▼
                         LIVE EXPERIENCE
</pre>

<em>Conceptual flow of the visual system; the diagram describes the interaction/rendering idea, not a literal profiler trace.</em>

## / 03 — Boot the project

**Requirements:** Node.js 18.18+ and npm.

<pre><code>git clone https://github.com/KamyarAhangar8778/kks-terminal-shader-hero.git
cd kks-terminal-shader-hero
npm install
npm run dev</code></pre>

Open [http://localhost:3000](http://localhost:3000) and let the signal load.

<details>
<summary><strong>Production build</strong></summary>

<pre><code>npm run build
npm run start</code></pre>

</details>

<details>
<summary><strong>Code quality commands</strong></summary>

<pre><code>npm run lint
npm run typecheck
npm run format:check</code></pre>

Note: npm test is currently a placeholder script, not an automated test suite.

</details>

## / 04 — Source map

<pre>
app/
  globals.css              Global visual language
  layout.tsx               Metadata, fonts, root layout
  page.tsx                 Main experience composition

components/
  ascii-wordmark/          ASCII KKS rendering
  hero/                    WebGL canvas, CRT and glitch layers
  portfolio/               Project showcase
  contact/                 Contact and transmission flow
  custom-cursor/           Custom pointer treatment
  layout/                  Footer and shared layout

hooks/                     Interaction and animation logic
lib/                       Wave math, contact helpers, utilities
types/                     Shared TypeScript contracts
</pre>

## / 05 — Deployment checklist

Before calling the experience production-ready:

- [ ] Configure and verify Telegram and EmailJS contact integrations.
- [ ] Test WebGL2 support, frame pacing, and reduced-motion behavior on target devices.
- [ ] Check mobile layouts and touch interactions; custom cursors are pointer-oriented.
- [ ] Run a production build and test the deployed base path.
- [ ] Confirm all social links and contact routes point to the intended destinations.

## / 06 — Project links

<div align="center">

| CHANNEL | DESTINATION |
|:--|:--|
| **LIVE** | [Open the deployed experience ↗](https://kamyarahangar8778.github.io/kks-terminal-shader-hero/) |
| **SOURCE** | [Browse the repository ↗](https://github.com/KamyarAhangar8778/kks-terminal-shader-hero) |
| **ISSUES** | [Report a problem ↗](https://github.com/KamyarAhangar8778/kks-terminal-shader-hero/issues) |
| **MAINTAINER** | [KKS Systems ↗](https://github.com/KamyarAhangar8778) |

</div>

## / 07 — License

Distributed under the [MIT License](LICENSE).

---

<div align="center">

### KKS SYSTEMS

**LESS UI NOISE. MORE SIGNAL.**

<sub>END OF TRANSMISSION // THANK YOU FOR VISITING.</sub>

<br />

<a href="#kks-terminal-shader-hero">[ BACK TO TOP ↑ ]</a>

</div>
