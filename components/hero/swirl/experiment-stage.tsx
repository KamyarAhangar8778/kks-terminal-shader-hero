'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { useSwirlStage, type StageConfig, type StageEvents } from './use-swirl-stage';

function normalizePointer(e: PointerEvent): { x: number; y: number } {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
    y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
  };
}

function computePointerSpeed(
  prev: { x: number; y: number } | null,
  next: { x: number; y: number }
): number {
  if (!prev) return 0;
  return Math.min(1, Math.hypot(next.x - prev.x, next.y - prev.y) * 6);
}

export function ExperimentStage({
  config,
  trackPointer = false,
  burstOnClick = false,
  onClick,
  replayKey,
  events,
  children,
}: {
  config: StageConfig;
  trackPointer?: boolean;
  burstOnClick?: boolean;
  onClick?: () => void;
  replayKey?: string | number;
  events?: StageEvents;
  children?: ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cfg = useRef<StageConfig>(config);
  const [failed, setFailed] = useState(false);
  const [painted, setPainted] = useState(false);
  const [inView, setInView] = useState(false);
  const eventsRef = useRef<StageEvents>({});
  const prevPt = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    cfg.current = config;
  }, [config]);

  useEffect(() => {
    eventsRef.current = {
      ...events,
      onFirstFrame: () => {
        setPainted(true);
        events?.onFirstFrame?.();
      },
      onVisible: (v) => {
        setInView(v);
        events?.onVisible?.(v);
      },
    };
  }, [events]);

  const handleFail = useCallback(() => setFailed(true), []);
  const stage = useSwirlStage(canvasRef, cfg, handleFail, eventsRef);

  useEffect(() => {
    if (replayKey !== undefined) stage.current.replay();
  }, [replayKey, stage]);

  const handleMove = (e: PointerEvent) => {
    const p = normalizePointer(e);
    if (trackPointer) stage.current.setPointer(p);
    eventsRef.current.onPointerMove?.(computePointerSpeed(prevPt.current, p));
    prevPt.current = p;
  };

  const handleLeave = () => {
    if (trackPointer) stage.current.setPointer(null);
    prevPt.current = null;
  };

  const handleDown = (e: PointerEvent) => {
    const p = normalizePointer(e);
    if (burstOnClick) stage.current.burst(p.x, p.y);
    eventsRef.current.onPointerDown?.();
    onClick?.();
  };

  const isReady = painted && inView;
  const frameBorderClass = isReady
    ? 'border border-[var(--border-line)] bg-[color-mix(in_srgb,var(--bg-page)_97%,#000)]'
    : 'border border-dashed border-[var(--border-line)] bg-[var(--bg-page)]';
  const cursorClass = burstOnClick ? 'cursor-pointer' : '';

  return (
    <div className={`relative z-10 overflow-hidden rounded-xl ${frameBorderClass}`}>
      {failed ? (
        <div className="flex aspect-[16/9] w-full items-center justify-center px-6 text-center text-[12px] text-[var(--text-tertiary)]">
          WebGL2 unavailable here.
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          style={{ opacity: isReady ? 1 : 0 }}
          className={`block aspect-[16/9] w-full transition-opacity duration-500 ease-[var(--ease-out)] motion-reduce:transition-none ${cursorClass}`}
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
          onPointerDown={handleDown}
        />
      )}
      {children}
    </div>
  );
}
