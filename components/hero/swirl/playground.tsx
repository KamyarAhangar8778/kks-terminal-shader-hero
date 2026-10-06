'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Slider, ColorControl, SegmentedControl, GhostButton } from './controls';
import { useSwirlStage, DEFAULT_STAGE, type StageConfig } from './use-swirl-stage';
import { VARIANTS, type Variant } from './resolver';
import { DEFAULT_TEXT } from './default-text';
import { SwirlExperiments } from './experiments';

function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">{children}</h2>
      {action}
    </div>
  );
}

const FALLBACK_VARIANT: Variant = VARIANTS[0] ?? {
  id: 'arlan',
  label: 'Arlan',
  rows: [],
  ink: '#d8d8d8',
  logo: '#ffffff',
  bg: '#0c0c0d',
  zoom: 0.62,
};

export function SwirlPlayground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [variantId, setVariantId] = useState(FALLBACK_VARIANT.id);
  const [ink, setInk] = useState(FALLBACK_VARIANT.ink);
  const [logoColor, setLogoColor] = useState(FALLBACK_VARIANT.logo);
  const [bg, setBg] = useState(FALLBACK_VARIANT.bg);
  const [rows, setRows] = useState<string[]>(FALLBACK_VARIANT.rows);
  const [scanlines, setScanlines] = useState(0.4);
  const [aberration, setAberration] = useState(1);
  const [curvature, setCurvature] = useState(1);
  const [zoom, setZoom] = useState(FALLBACK_VARIANT.zoom);
  const [failed, setFailed] = useState(false);

  const cfg = useRef<StageConfig>({
    ...DEFAULT_STAGE,
    rows,
    inkStops: [ink],
    logoColor,
    bg,
    text: DEFAULT_TEXT,
    scanlines,
    aberration,
    curvature,
    zoom,
  });
  useEffect(() => {
    cfg.current = {
      ...DEFAULT_STAGE,
      rows,
      inkStops: [ink],
      logoColor,
      bg,
      text: DEFAULT_TEXT,
      scanlines,
      aberration,
      curvature,
      zoom,
    };
  }, [rows, ink, logoColor, bg, scanlines, aberration, curvature, zoom]);

  const stage = useSwirlStage(canvasRef, cfg, () => setFailed(true));

  const pickVariant = (id: string) => {
    const v = VARIANTS.find((x) => x.id === id) ?? FALLBACK_VARIANT;
    setVariantId(v.id);
    setInk(v.ink);
    setLogoColor(v.logo);
    setBg(v.bg);
    setRows(v.rows);
    setZoom(v.zoom);
    stage.current.replay();
  };

  return (
    <>
      <section className="flex min-w-0 flex-col gap-3">
        <SectionLabel
          action={
            !failed && <GhostButton onClick={() => stage.current.replay()}>Replay</GhostButton>
          }
        >
          Implementation
        </SectionLabel>

        <div
          className="relative z-10 overflow-hidden rounded-xl border border-[var(--border-line)]"
          style={{ backgroundColor: bg }}
        >
          {failed ? (
            <div className="flex aspect-[16/10] w-full items-center justify-center px-6 text-center text-[13px] text-[var(--text-tertiary)]">
              Your browser doesn&apos;t support WebGL2, so the live playground can&apos;t run here.
            </div>
          ) : (
            <canvas ref={canvasRef} className="block aspect-[16/10] w-full" />
          )}
        </div>

        {!failed && (
          <div className="-mt-5 flex min-w-0 flex-col gap-3 rounded-b-xl border border-t-0 border-[var(--border-line)] bg-[var(--bg-surface)] p-3 pt-5">
            <div className="grid grid-cols-1 items-center gap-x-4 gap-y-3 sm:grid-cols-2">
              <SegmentedControl
                options={VARIANTS.map((v) => ({ id: v.id, label: v.label }))}
                activeId={variantId}
                onPick={pickVariant}
              />
              <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-0.5">
                <ColorControl label="Letters" value={ink} onChange={setInk} />
                <ColorControl label="Logo" value={logoColor} onChange={setLogoColor} />
                <ColorControl label="Background" value={bg} onChange={setBg} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
              <Slider
                label="Zoom"
                value={zoom}
                min={0.5}
                max={1.6}
                format={(v) => v.toFixed(2) + 'x'}
                onChange={setZoom}
              />
              <Slider
                label="Scanlines"
                value={scanlines}
                min={0}
                max={1}
                format={(v) => (v * 100).toFixed(0) + '%'}
                onChange={setScanlines}
              />
              <Slider
                label="Aberration"
                value={aberration}
                min={0}
                max={3}
                onChange={setAberration}
              />
              <Slider
                label="Curvature"
                value={curvature}
                min={0}
                max={1}
                format={(v) => (v * 100).toFixed(0) + '%'}
                onChange={setCurvature}
              />
            </div>
          </div>
        )}
      </section>

      <SwirlExperiments />
    </>
  );
}
