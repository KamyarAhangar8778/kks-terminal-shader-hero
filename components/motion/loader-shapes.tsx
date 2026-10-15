'use client';

/**
 * @file components/motion/loader-shapes.tsx
 * @description Advanced mathematical & geometric sub-animations for the motion loader.
 */

import React, { useEffect, useState, useId } from 'react';
import { m } from 'motion/react';
import { EASE_IN_OUT } from '@/lib/ease';
import { PartProps } from './loader-types';

/**
 * Generate sampled path for smooth SVG morphing.
 */
function morphPath(radiusFn: (angle: number) => number, samples = 60, cx = 50, cy = 50): string {
  const pts: string[] = [];
  for (let i = 0; i < samples; i++) {
    const a = (i * 2 * Math.PI) / samples - Math.PI / 2;
    const r = radiusFn(a);
    const x = (cx + r * Math.cos(a)).toFixed(2);
    const y = (cy + r * Math.sin(a)).toFixed(2);
    pts.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  return `${pts.join(' ')} Z`;
}

function ngonRadius(a: number, n: number, r = 38): number {
  const segment = (2 * Math.PI) / n;
  const local = Math.abs(((a + Math.PI / 2 + segment / 2) % segment) - segment / 2);
  return (r * Math.cos(Math.PI / n)) / Math.cos(local);
}

let cachedMorphData: { firstPath: string; seq: string[] } | null = null;

function getMorphData(): { firstPath: string; seq: string[] } {
  if (!cachedMorphData) {
    const paths = [
      morphPath(() => 38),
      morphPath((a) => ngonRadius(a, 3)),
      morphPath((a) => ngonRadius(a, 4)),
    ];
    cachedMorphData = {
      firstPath: paths[0]!,
      seq: [...paths.flatMap((p) => [p, p]), paths[0]!],
    };
  }
  return cachedMorphData;
}

const MORPH_ROT = [0, 0, 72, 72, 144, 144, 216, 216, 288, 288, 360];
const MORPH_SCALE = [1, 1, 0.88, 0.88, 1, 1, 0.88, 0.88, 1, 1, 1];

export function Morph({ size, speed, reduce }: PartProps): React.JSX.Element {
  const stroke = Math.max(2, size * 0.08);
  const { firstPath, seq } = getMorphData();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img">
      <title>Loading</title>
      <m.path
        d={firstPath}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={
          reduce
            ? { opacity: [0.4, 1, 0.4] }
            : {
                d: seq,
                rotate: MORPH_ROT,
                scale: MORPH_SCALE,
              }
        }
        transition={{
          duration: speed * 3.2,
          ease: EASE_IN_OUT,
          repeat: Infinity,
        }}
        style={{ transformOrigin: '50px 50px' }}
      />
    </svg>
  );
}

export function Comet({ size, speed, reduce }: PartProps): React.JSX.Element {
  const dots = 8;
  const r = size * 0.38;
  return (
    <span className="relative inline-block" style={{ width: size, height: size }}>
      <m.span
        className="block h-full w-full"
        animate={reduce ? { opacity: [0.4, 1, 0.4] } : { rotate: 360 }}
        transition={
          reduce
            ? { duration: speed, ease: EASE_IN_OUT, repeat: Infinity }
            : { duration: speed, ease: 'linear', repeat: Infinity }
        }
      >
        {Array.from({ length: dots }, (_, i) => {
          const sz = Math.max(2, size * (0.18 - i * 0.018));
          return (
            <span
              key={`comet-dot-${i}`}
              className="absolute top-1/2 left-1/2 rounded-full bg-current"
              style={{
                width: sz,
                height: sz,
                marginLeft: -sz / 2,
                marginTop: -sz / 2,
                opacity: 1 - i * 0.16,
                transform: `rotate(${-i * 15}deg) translateY(${-r}px)`,
              }}
            />
          );
        })}
      </m.span>
    </span>
  );
}

const SCRAMBLE_TARGET = 'LOADING';
const SCRAMBLE_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/*#@';

export function Scramble({ size, speed, reduce }: PartProps): React.JSX.Element {
  const [text, setText] = useState(SCRAMBLE_TARGET);

  useEffect(() => {
    if (reduce) return;
    let tick = 0;
    const total = SCRAMBLE_TARGET.length + 4;
    const id = setInterval(
      () => {
        const reveal = tick % total;
        let s = '';
        for (let i = 0; i < SCRAMBLE_TARGET.length; i++) {
          s +=
            i < reveal
              ? SCRAMBLE_TARGET[i]
              : SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)];
        }
        setText(s);
        tick++;
      },
      (speed / SCRAMBLE_TARGET.length) * 1000 * 0.55
    );

    return () => clearInterval(id);
  }, [speed, reduce]);

  return (
    <span
      className="font-mono font-medium tracking-[0.2em] tabular-nums"
      style={{ fontSize: size * 0.42 }}
    >
      {reduce ? SCRAMBLE_TARGET : text}
    </span>
  );
}

export function Metaballs({ size, speed, reduce }: PartProps): React.JSX.Element {
  const rawId = useId();
  const id = rawId.replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img">
      <title>Loading</title>
      <defs>
        <filter id={id}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
          <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
        </filter>
      </defs>
      <g filter={`url(#${id})`} fill="currentColor">
        <m.circle
          cy="50"
          r="15"
          animate={reduce ? { opacity: [0.4, 1, 0.4] } : { cx: [30, 70, 30] }}
          transition={{ duration: speed * 1.6, ease: EASE_IN_OUT, repeat: Infinity }}
          cx={reduce ? 40 : 30}
        />
        <m.circle
          cy="50"
          r="15"
          animate={reduce ? { opacity: [0.4, 1, 0.4] } : { cx: [70, 30, 70] }}
          transition={{ duration: speed * 1.6, ease: EASE_IN_OUT, repeat: Infinity }}
          cx={reduce ? 60 : 70}
        />
      </g>
    </svg>
  );
}

const NEWTON_BALLS = [0, 1, 2, 3, 4];

export function Newton({ size, speed, reduce }: PartProps): React.JSX.Element {
  const d = size * 0.2;
  const out = d * 1.1;
  const moves: Record<number, { x: number[]; times: number[] }> = {
    0: { x: [0, -out, 0, 0], times: [0, 0.28, 0.5, 1] },
    4: { x: [0, 0, out, 0], times: [0, 0.5, 0.78, 1] },
  };

  return (
    <span className="flex items-center justify-center" style={{ height: d }}>
      {NEWTON_BALLS.map((i) => {
        const move = moves[i];
        return (
          <m.span
            key={i}
            className="rounded-full bg-current"
            style={{ width: d, height: d }}
            animate={reduce || !move ? undefined : { x: move.x }}
            transition={
              reduce || !move
                ? undefined
                : {
                    duration: speed * 1.5,
                    ease: EASE_IN_OUT,
                    repeat: Infinity,
                    times: move.times,
                  }
            }
          />
        );
      })}
    </span>
  );
}

export function Helix({ size, speed, reduce }: PartProps): React.JSX.Element {
  const rows = 7;
  const dot = size * 0.14;
  const amp = size * 0.32;

  return (
    <span className="relative inline-block" style={{ width: size, height: size }}>
      {Array.from({ length: rows }, (_, r) => {
        const top = (r / (rows - 1)) * (size - dot);
        const delay = (r / rows) * speed;
        return (
          <span key={`row-${top}`}>
            <m.span
              className="absolute rounded-full bg-current"
              style={{ width: dot, height: dot, left: size / 2 - dot / 2, top }}
              animate={
                reduce
                  ? { opacity: [0.4, 1, 0.4] }
                  : {
                      x: [amp, -amp, amp],
                      scale: [1, 0.5, 1],
                      opacity: [1, 0.45, 1],
                    }
              }
              transition={{
                duration: speed,
                ease: EASE_IN_OUT,
                repeat: Infinity,
                delay,
              }}
            />
            <m.span
              className="absolute rounded-full bg-current"
              style={{ width: dot, height: dot, left: size / 2 - dot / 2, top }}
              animate={
                reduce
                  ? { opacity: [0.4, 1, 0.4] }
                  : {
                      x: [-amp, amp, -amp],
                      scale: [0.5, 1, 0.5],
                      opacity: [0.45, 1, 0.45],
                    }
              }
              transition={{
                duration: speed,
                ease: EASE_IN_OUT,
                repeat: Infinity,
                delay,
              }}
            />
          </span>
        );
      })}
    </span>
  );
}

export function Percent({ size, speed, reduce }: PartProps): React.JSX.Element {
  const [p, setP] = useState(0);

  useEffect(() => {
    const dur = (reduce ? speed * 2 : speed) * 1000;
    const start = { t: 0 };
    const tickMs = 40;
    const id = setInterval(() => {
      start.t += tickMs;
      const next = Math.min(100, Math.round((start.t / dur) * 100));
      setP(next);
      if (next >= 100) start.t = 0;
    }, tickMs);

    return () => clearInterval(id);
  }, [speed, reduce]);

  return (
    <span className="flex flex-col items-center" style={{ gap: size * 0.14, width: size * 1.4 }}>
      <span
        className="font-mono font-medium tabular-nums"
        style={{ fontSize: size * 0.42, lineHeight: 1 }}
      >
        {p}%
      </span>
      <span
        className="w-full overflow-hidden rounded-full bg-current/15"
        style={{ height: Math.max(3, size * 0.1) }}
      >
        <span className="block h-full rounded-full bg-current" style={{ width: `${p}%` }} />
      </span>
    </span>
  );
}

export function DotMatrix({ size, speed, reduce }: PartProps): React.JSX.Element {
  const n = 3;
  const gap = size * 0.14;
  const dot = (size - gap * (n - 1)) / n;
  const cells = Array.from({ length: n * n }, (_, idx) => idx);

  return (
    <span
      className="grid"
      style={{
        gap,
        gridTemplateColumns: `repeat(${n}, ${dot}px)`,
      }}
    >
      {cells.map((idx) => {
        const x = idx % n;
        const y = Math.floor(idx / n);
        const delay = ((x + y) / (2 * (n - 1))) * speed;
        return (
          <m.span
            key={idx}
            className="rounded-full bg-current"
            style={{ width: dot, height: dot }}
            animate={
              reduce ? { opacity: [0.3, 1, 0.3] } : { opacity: [0.2, 1, 0.2], scale: [0.7, 1, 0.7] }
            }
            transition={{
              duration: speed,
              ease: EASE_IN_OUT,
              repeat: Infinity,
              delay,
            }}
          />
        );
      })}
    </span>
  );
}

const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

export function Dither({ size, speed, reduce }: PartProps): React.JSX.Element {
  const n = 4;
  const gap = Math.max(1, size * 0.05);
  const cell = (size - gap * (n - 1)) / n;

  return (
    <span className="grid" style={{ gap, gridTemplateColumns: `repeat(${n}, ${cell}px)` }}>
      {BAYER_4.map((order) => (
        <m.span
          key={`dither-${order}`}
          className="bg-current"
          style={{ width: cell, height: cell }}
          animate={reduce ? { opacity: [0.3, 1, 0.3] } : { opacity: [0.1, 1, 0.1] }}
          transition={{
            duration: speed,
            ease: EASE_IN_OUT,
            repeat: Infinity,
            delay: (order / BAYER_4.length) * speed,
          }}
        />
      ))}
    </span>
  );
}
