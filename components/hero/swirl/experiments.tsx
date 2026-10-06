'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { SegmentedControl, Slider, ColorControl, GhostButton } from './controls';
import { ExperimentStage } from './experiment-stage';
import { DEFAULT_STAGE, type StageConfig, type StageEvents } from './use-swirl-stage';
import type { WavePattern } from './vortex-field';
import { DEFAULT_TEXT } from './default-text';
import { renderWord, type FontStyle } from './block-font';

function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">{children}</h2>
      {action}
    </div>
  );
}

const swirlFormation = () => {};
const swirlChurn = () => ({ stop: () => {} });
const swirlMove = (speed?: number) => {
  void speed;
};
const swirlClick = () => {};

const BASE: StageConfig = {
  ...DEFAULT_STAGE,
  inkStops: ['#d8d8d8'],
  logoColor: '#ffffff',
  bg: '#0c0c0d',
  rows: undefined,
  word: 'ARLAN',
  style: 'slant',
  text: DEFAULT_TEXT,
  zoom: 0.62,
};

function Experiment({
  title,
  action,
  children,
}: {
  title: string;

  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

// Control panel that tucks under the canvas, matching the main playground panel.
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mt-5 flex min-w-0 flex-col gap-3 rounded-b-xl border border-t-0 border-[var(--border-line)] bg-[var(--bg-surface)] p-3 pt-5">
      {children}
    </div>
  );
}

const STYLES: { id: FontStyle; label: string }[] = [
  { id: 'slant', label: 'Slant' },
  { id: 'standard', label: 'Standard' },
  { id: 'ogre', label: 'Ogre' },
  { id: 'doom', label: 'Doom' },
  { id: 'big', label: 'Big' },
  { id: 'speed', label: 'Speed' },
  { id: 'stop', label: 'Stop' },
  { id: 'subzero', label: 'Sub-Zero' },
  { id: 'banner', label: 'Banner' },
];

const STYLE_ZOOM: Partial<Record<FontStyle, number>> = {
  subzero: 0.42,
  big: 0.46,
  doom: 0.46,
  stop: 0.46,
  speed: 0.46,
};

const THEMES = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
];

const FONT_ACCENT: Record<FontStyle, [string, string]> = {
  slant: ['#e7e3da', '#ffffff'],
  standard: ['#8fd0ff', '#eaf6ff'],
  ogre: ['#7fe3a3', '#e9fff0'],
  doom: ['#ff7a6e', '#ffeae7'],
  big: ['#9b8cff', '#efeaff'],
  speed: ['#ffd166', '#fff6e0'],
  stop: ['#ff9ed2', '#ffeaf6'],
  subzero: ['#5fe0e0', '#e6ffff'],
  banner: ['#c2f06b', '#f4ffe0'],
};

function LogoGenerator() {
  const [word, setWord] = useState('MINERVA');
  const [style, setStyle] = useState<FontStyle>('slant');
  const [theme, setTheme] = useState('dark');
  const light = theme === 'light';
  const [accent, logoAccent] = FONT_ACCENT[style];
  const cfg: StageConfig = {
    ...BASE,
    rows: renderWord(word || ' ', style),
    zoom: STYLE_ZOOM[style] ?? 0.5,

    bg: light ? '#fcfcfc' : '#0a0a0c',
    inkStops: [light ? '#9a9a9a' : accent],
    logoColor: light ? '#1b1b1b' : logoAccent,
  };

  return (
    <Experiment title="Type your own logo">
      <ExperimentStage config={cfg} />
      <Panel>
        <div className="flex items-stretch gap-2">
          <input
            value={word}
            onChange={(e) => setWord(e.target.value.slice(0, 14))}
            spellCheck={false}
            aria-label="Logo word"
            placeholder="type a word"
            className="h-8 min-w-0 flex-1 rounded-lg border border-[var(--border-line)] bg-[var(--bg-page)] px-3 text-[13px] uppercase tracking-wide text-[var(--text-body)] outline-none transition-colors duration-150 focus:border-[var(--border-ring)]"
          />
          <div className="w-44 shrink-0">
            <SegmentedControl options={THEMES} activeId={theme} onPick={setTheme} />
          </div>
        </div>
        <SegmentedControl
          options={STYLES}
          activeId={style}
          onPick={(id) => setStyle(id as FontStyle)}
          fill
        />
      </Panel>
    </Experiment>
  );
}

function SoundSwirl() {
  const cfg: StageConfig = {
    ...BASE,
    word: 'SOUND',
    zoom: 0.62,
    inkStops: ['#cfe0ff'],
    logoColor: '#ffffff',
    bg: '#070a12',
  };

  const churn = useRef<{ stop: () => void } | null>(null);
  const reduced = useRef(false);
  useEffect(() => {
    reduced.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => churn.current?.stop();
  }, []);

  const restartChurn = () => {
    churn.current?.stop();
    churn.current = reduced.current ? null : swirlChurn();
  };

  const events: StageEvents = useMemo(
    () => ({
      onFormationStart: () => {
        if (!reduced.current) swirlFormation();
      },
      onVisible: (visible) => {
        if (visible && !reduced.current) {
          if (!churn.current) churn.current = swirlChurn();
        } else {
          churn.current?.stop();
          churn.current = null;
        }
      },

      onPointerMove: (speed) => {
        if (!reduced.current) swirlMove(speed);
      },

      onPointerDown: () => {
        if (!reduced.current) swirlClick();
      },
    }),
    []
  );

  const [replay, setReplay] = useState(0);
  const onReplay = () => {
    setReplay((n) => n + 1);
    restartChurn();
  };

  return (
    <Experiment
      title="The same swirl, with sound"
      action={<GhostButton onClick={onReplay}>Replay</GhostButton>}
    >
      <ExperimentStage config={cfg} events={events} replayKey={replay} trackPointer burstOnClick />
    </Experiment>
  );
}

/* ---------- 3. Cursor trail ---------- */
function CursorTrail() {
  // its own warm-coral palette; dragging lights a hot white-gold trail that
  // churns the soup into the vortex and lingers
  const cfg: StageConfig = {
    ...BASE,
    trail: true,
    trailStrength: 1.6,
    trailFlare: '#fff1c2',
    word: 'TRACE',
    zoom: 0.62,
    inkStops: ['#ff7a55'],
    logoColor: '#fff0ea',
    bg: '#160604',
  };
  return (
    <Experiment title="Drag a trail through the letters">
      <ExperimentStage config={cfg} trackPointer />
    </Experiment>
  );
}

/* ---------- 4. Flowing multi-stop gradient ---------- */
// Default is ONE color living through its own shades: a single hue ramped from
// deep to bright and back, so it reads as a rich, breathing teal rather than a
// rainbow. The per-letter drift + speed brightness already baked into the field
// turn that one hue into something with real depth.
const MONO_RAMP_STOPS = [
  { id: 'stop-1', label: '1', color: '#0a3d3a' },
  { id: 'stop-2', label: '2', color: '#13807a' },
  { id: 'stop-3', label: '3', color: '#2fd4c4' },
  { id: 'stop-4', label: '4', color: '#9ff5ec' },
  { id: 'stop-5', label: '5', color: '#13807a' },
];

function GradientInk() {
  const [stops, setStops] = useState(MONO_RAMP_STOPS);
  const [angle, setAngle] = useState(0.4);
  const [flow, setFlow] = useState(0.06);

  const setStop = (id: string, color: string) =>
    setStops((prev) => prev.map((item) => (item.id === id ? { ...item, color } : item)));

  const cfg: StageConfig = {
    ...BASE,
    word: 'FLOW',
    zoom: 0.55,
    gradient: true,
    inkStops: stops.map((s) => s.color),
    gradientAngle: angle * Math.PI * 2,
    gradientFlow: flow,
    bg: '#08080b',
  };

  return (
    <Experiment title="Letters that flow through colors">
      <ExperimentStage config={cfg} />
      <Panel>
        <div className="grid grid-cols-5 gap-1">
          {stops.map((stop) => (
            <ColorControl
              key={stop.id}
              label={stop.label}
              value={stop.color}
              onChange={(v) => setStop(stop.id, v)}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
          <Slider
            label="Angle"
            value={angle}
            min={0}
            max={1}
            format={(v) => (v * 360).toFixed(0) + '°'}
            onChange={setAngle}
          />
          <Slider
            label="Flow"
            value={flow}
            min={0}
            max={0.4}
            format={(v) => (v * 100).toFixed(0) + '%'}
            onChange={setFlow}
          />
        </div>
      </Panel>
    </Experiment>
  );
}

/* ---------- 5. Shockwaves + sustained wave patterns ---------- */
const PATTERNS = [
  { id: 'wavefront', label: 'Wavefront' },
  { id: 'ripples', label: 'Ripples' },
  { id: 'flow', label: 'Flow' },
  { id: 'cloth', label: 'Cloth' },
];

// Each pattern gets its own bold palette so switching feels like a mood change.
const WAVE_PALETTE: Record<WavePattern, { ink: string; logo: string; bg: string }> = {
  wavefront: { ink: '#7fb8ff', logo: '#eaf3ff', bg: '#040a1a' }, // ocean blue
  ripples: { ink: '#4fe3d0', logo: '#e6fffb', bg: '#021414' }, // teal
  flow: { ink: '#d98cff', logo: '#f7ebff', bg: '#10031a' }, // magenta / violet
  cloth: { ink: '#ffc266', logo: '#fff4e0', bg: '#1a0f02' },
};

function ClickShock() {
  const [turbulence, setTurbulence] = useState(0.35);
  const [pattern, setPattern] = useState<WavePattern>('wavefront');
  const pal = WAVE_PALETTE[pattern];
  const cfg: StageConfig = {
    ...BASE,
    shock: true,
    turbulence,
    wavePattern: pattern,
    word: 'WAVES',
    zoom: 0.62,
    inkStops: [pal.ink],
    logoColor: pal.logo,
    bg: pal.bg,
  };
  return (
    <Experiment title="Click for a wave, or leave it churning">
      <ExperimentStage config={cfg} burstOnClick replayKey={pattern} />
      <Panel>
        <SegmentedControl
          options={PATTERNS}
          activeId={pattern}
          onPick={(id) => setPattern(id as WavePattern)}
        />
        <Slider
          label="Strength"
          value={turbulence}
          min={0}
          max={1}
          format={(v) => (v * 100).toFixed(0) + '%'}
          onChange={setTurbulence}
        />
      </Panel>
    </Experiment>
  );
}

export function SwirlExperiments() {
  return (
    <section className="mt-12 flex min-w-0 flex-col gap-6">
      <SectionLabel>Experiments</SectionLabel>
      <p className="-mt-3 text-[15px] leading-[1.7] text-[var(--text-secondary)]">
        A few things I added on top, just to see how far the same idea would go.
      </p>
      {}
      <div className="flex min-w-0 flex-col [&>*:not(:first-child)]:mt-14 [&>*:not(:first-child)]:border-t [&>*:not(:first-child)]:border-[var(--border-line)] [&>*:not(:first-child)]:pt-14">
        <LogoGenerator />
        <SoundSwirl />
        <CursorTrail />
        <GradientInk />
        <ClickShock />
      </div>
    </section>
  );
}
