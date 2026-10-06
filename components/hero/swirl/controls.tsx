'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { hexToHsl, hslToHex, isHex, normHex, PRESET_SWATCHES } from './color';

const hapticTap = () => {};
const hoverLink = () => {};

const LABEL = 'text-[12px] text-[var(--text-tertiary)]';

export const PG_PREVIEW =
  'relative z-10 overflow-hidden rounded-xl border border-[var(--border-line)] bg-[var(--bg-hover)]';
export const PG_PANEL =
  '-mt-5 flex min-w-0 flex-col gap-4 rounded-b-xl border border-t-0 border-[var(--border-line)] bg-[var(--bg-surface)] p-4 pt-8';

export function SegmentedControl({
  options,
  activeId,
  onPick,
  fill = false,
}: {
  options: { id: string; label: string }[];
  activeId: string;
  onPick: (id: string) => void;

  fill?: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const segRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.id === activeId)
  );

  useLayoutEffect(() => {
    const el = segRefs.current[activeIndex];
    if (!el) return;
    setPill({ x: el.offsetLeft, w: el.offsetWidth });
  }, [activeIndex, options.length]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      const el = segRefs.current[activeIndex];
      if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth });
    });
    ro.observe(row);
    return () => ro.disconnect();
  }, [activeIndex]);

  return (
    <div
      ref={rowRef}
      role="tablist"
      aria-label="Variant"
      className="swirl-tabscroll relative flex h-8 w-full items-stretch gap-0 overflow-x-auto rounded-lg border border-[var(--border-line)] bg-[var(--bg-page)] p-0.5"
    >
      {pill && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0.5 rounded-md border border-[var(--border-line)] bg-[var(--bg-hover)]"
          style={{
            transform: `translateX(${pill.x - 2}px)`,
            width: pill.w,
            transition: 'transform 0.34s var(--ease-out), width 0.34s var(--ease-out)',
          }}
        />
      )}
      {options.map((o, i) => {
        const active = o.id === activeId;
        return (
          <button
            key={o.id}
            ref={(el) => {
              segRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => {
              hapticTap();
              onPick(o.id);
            }}
            onPointerEnter={hoverLink}
            className={`relative z-10 flex items-center justify-center whitespace-nowrap rounded-md px-2 py-1 text-[12px] transition-colors duration-150 ease-[var(--ease-out)] ${
              fill ? 'flex-1 basis-0 [min-width:fit-content]' : 'flex-1'
            } ${
              active
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Select({
  options,
  activeId,
  onPick,
  ariaLabel,
}: {
  options: { id: string; label: string }[];
  activeId: string;
  onPick: (id: string) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const active = options.find((o) => o.id === activeId);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative flex shrink-0">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls="swirl-select-listbox"
        aria-label={ariaLabel}
        onClick={() => {
          hapticTap();
          setOpen((o) => !o);
        }}
        onPointerEnter={hoverLink}
        className="flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-[var(--border-line)] bg-[var(--bg-page)] pl-3 pr-2.5 text-[12px] text-[var(--text-primary)] transition-colors duration-150 ease-[var(--ease-out)] hover:border-[var(--border-ring)]"
      >
        <span className="whitespace-nowrap">{active?.label ?? 'Select'}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden="true"
          className={`shrink-0 text-[var(--text-tertiary)] transition-transform duration-150 ease-[var(--ease-out)] ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="M2 3.5 5 6.5 8 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"

          className="absolute right-0 top-full z-50 mt-2 flex max-h-64 w-full min-w-40 flex-col gap-0.5 overflow-y-auto rounded-xl border border-[var(--border-ring)] bg-[var(--bg-surface)] p-1 shadow-[0_1px_2px_rgba(17,24,39,0.06),0_8px_24px_rgba(17,24,39,0.08)]"
          style={{ animation: 'swirl-pop 0.16s var(--ease-expo)' }}
        >
          {options.map((o) => {
            const isActive = o.id === activeId;
            return (
              <button
                key={o.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  hapticTap();
                  onPick(o.id);
                  setOpen(false);
                }}
                onPointerEnter={hoverLink}
                className={`rounded-md px-2.5 py-1.5 text-left text-[12px] transition-colors duration-150 ease-[var(--ease-out)] ${
                  isActive
                    ? 'bg-[var(--bg-page)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]'
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Slider ---------- */
// Row slider: the whole row is the track (fill grows from the left), label sits
// left + value right, with a thin handle riding the fill edge. Drag anywhere on
// the row, click to snap, or arrow-key when focused.
const CLICK_THRESHOLD = 3; // px — distinguishes a click from a drag

export function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const down = useRef<{ x: number; moved: boolean } | null>(null);

  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const snap = (v: number) => {
    const snapped = Math.round(v / step) * step;
    const clamped = Math.min(Math.max(snapped, min), max);

    return parseFloat(clamped.toPrecision(12));
  };
  const valueFromX = (clientX: number) => {
    const r = rowRef.current!.getBoundingClientRect();
    const t = (clientX - r.left) / r.width;
    return snap(min + t * (max - min));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    down.current = { x: e.clientX, moved: false };
    setDragging(true);
    hapticTap();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !down.current) return;
    if (Math.abs(e.clientX - down.current.x) > CLICK_THRESHOLD) down.current.moved = true;
    onChange(valueFromX(e.clientX));
  };
  const endDrag = (e: React.PointerEvent) => {
    if (!down.current) return;
    if (!down.current.moved) onChange(valueFromX(e.clientX));
    down.current = null;
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(snap(value - step));
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(snap(value + step));
    }
  };

  return (
    <label className="flex min-w-[9rem] flex-1 flex-col">
      <div
        ref={rowRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={hoverLink}
        onKeyDown={onKeyDown}
        className="relative flex h-8 w-full cursor-pointer touch-none select-none items-center overflow-hidden rounded-lg border border-[var(--border-line)] bg-[var(--bg-page)] outline-none ring-[var(--border-ring)] focus-visible:ring-1"
      >
        {}
        <span
          className="pointer-events-none absolute inset-y-0 left-0 bg-[var(--bg-hover)]"
          style={{ width: `${pct}%` }}
        />
        {}
        <span
          className={`pointer-events-none absolute top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[var(--text-primary)] transition-opacity duration-150 ${
            dragging ? 'opacity-90' : 'opacity-40'
          }`}
          style={{ left: `max(3px, calc(${pct}% - 1.5px))` }}
        />
        <span className="pointer-events-none relative z-10 pl-3 text-[12px] text-[var(--text-secondary)]">
          {label}
        </span>
        <span className="pointer-events-none relative z-10 ml-auto mr-3 text-[12px] tabular-nums text-[var(--text-secondary)]">
          {format ? format(value) : value.toFixed(2)}
        </span>
      </div>
    </label>
  );
}

export function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [h, s, l] = hexToHsl(value);
  const [prevValue, setPrevValue] = useState(value);
  const [hexDraft, setHexDraft] = useState(value);

  if (prevValue !== value) {
    setPrevValue(value);
    setHexDraft(value);
  }

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const setHue = (hue: number) => onChange(hslToHex(hue, s || 70, l || 50));

  return (
    <div ref={wrapRef} className="relative flex w-full min-w-0">
      <button
        type="button"
        onClick={() => {
          hapticTap();
          setOpen((o) => !o);
        }}
        onPointerEnter={hoverLink}
        aria-label={`${label}: ${value}`}
        aria-expanded={open}
        className={`group flex h-8 w-full min-w-0 items-center gap-1.5 rounded-lg border border-[var(--border-line)] bg-[var(--bg-page)] px-2.5 transition-colors duration-150 ease-[var(--ease-out)] hover:border-[var(--border-ring)] ${
          label ? '' : 'justify-center'
        }`}
      >
        {label && <span className={`${LABEL} truncate`}>{label}</span>}
        <span
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 rounded-[5px] border border-[var(--border-ring)] transition-transform duration-150 ease-[var(--ease-out)] group-active:scale-[0.96] ${
            label ? 'ml-auto' : ''
          }`}
          style={{ backgroundColor: value }}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-2 flex w-56 flex-col gap-3 rounded-xl border border-[var(--border-ring)] bg-[var(--bg-surface)] p-3 shadow-[0_1px_2px_rgba(17,24,39,0.06),0_8px_24px_rgba(17,24,39,0.08)]"
          style={{ animation: 'swirl-pop 0.16s var(--ease-expo)' }}
        >
          {/* hue slider */}
          <span className="hue-track relative flex h-4 items-center">
            <span
              className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
              style={{ left: `${(h / 360) * 100}%`, backgroundColor: value }}
            />
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={h}
              onChange={(e) => setHue(+e.target.value)}
              onPointerDown={hapticTap}
              aria-label={`${label} hue`}
              className="swirl-range relative z-10 h-4 w-full cursor-pointer appearance-none bg-transparent"
            />
          </span>

          {/* hex field */}
          <input
            type="text"
            value={hexDraft}
            spellCheck={false}
            onChange={(e) => {
              setHexDraft(e.target.value);
              if (isHex(e.target.value)) onChange(normHex(e.target.value));
            }}
            onBlur={() => setHexDraft(value)}
            aria-label={`${label} hex`}
            className="w-full rounded-md border border-[var(--border-line)] bg-[var(--bg-page)] px-2 py-1 font-mono text-[12px] lowercase text-[var(--text-body)] outline-none transition-colors duration-150 focus:border-[var(--border-ring)]"
          />

          {/* preset swatches */}
          <div className="grid grid-cols-5 gap-1.5">
            {PRESET_SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  hapticTap();
                  onChange(c);
                }}
                onPointerEnter={hoverLink}
                aria-label={c}
                className={`h-6 w-full rounded-md border transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.96] ${
                  c.toLowerCase() === value.toLowerCase()
                    ? 'border-[var(--text-primary)]'
                    : 'border-[var(--border-ring)]'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Auto-growing prompt input ---------- */
const MAX_PROMPT_HEIGHT = 132;

export function PromptInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_PROMPT_HEIGHT)}px`;
  }, [value]);

  return (
    <label className="flex flex-col gap-1.5">
      <span className={LABEL}>{label}</span>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPointerEnter={hoverLink}
        spellCheck={false}
        rows={2}
        className="w-full resize-none overflow-y-auto overscroll-none rounded-lg border border-[var(--border-line)] bg-[var(--bg-page)] px-3 py-2 text-[12px] leading-[1.55] text-[var(--text-body)] outline-none transition-colors duration-150 focus:border-[var(--border-ring)]"
        style={{ maxHeight: MAX_PROMPT_HEIGHT } as CSSProperties}
      />
    </label>
  );
}

/* ---------- Ghost button (panel actions) ---------- */
// Matches the Copy button / code-tab pill language: hairline border, anchored
// surface, hover darkens the border (never dissolves into the panel).
export function GhostButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => {
        hapticTap();
        onClick();
      }}
      onPointerEnter={hoverLink}
      className="inline-flex h-7 shrink-0 items-center self-start rounded-lg border border-[var(--border-line)] bg-[var(--bg-surface)] px-3 text-[12px] font-medium text-[var(--text-secondary)] transition-colors duration-150 ease-[var(--ease-out)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-ring)] hover:text-[var(--text-primary)] active:scale-[0.98]"
    >
      {children}
    </button>
  );
}
