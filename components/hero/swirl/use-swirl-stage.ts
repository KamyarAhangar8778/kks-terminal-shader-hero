import { useEffect, useRef, type RefObject } from 'react';
import { buildAtlas, type GlyphAtlas } from './glyph-atlas';
import { createRenderer, type Renderer } from './renderer';
import { hexToRgb01 } from './color';
import {
  composeField,
  makeBuffers,
  makeTarget,
  type FieldBuffers,
  type FieldGrid,
  type InkMode,
  type InkPaint,
  type Shock,
  type Target,
  type WavePattern,
} from './vortex-field';
import { depositTrail, makeTrailField, stepTrail } from './trail-field';
import { renderWord, type FontStyle } from './block-font';

export interface StageConfig {
  rows?: string[];
  word?: string;
  style?: FontStyle;
  inkStops: string[];
  logoColor: string;
  gradient: boolean;
  gradientAngle: number;
  gradientFlow: number;
  gradientMode?: InkMode;
  bg: string;
  text: string;
  scanlines: number;
  aberration: number;
  curvature: number;
  zoom: number;
  trail: boolean;
  trailStrength?: number;
  trailFlare?: string;
  shock: boolean;
  turbulence: number;
  wavePattern: WavePattern;
}

export const DEFAULT_STAGE: Omit<
  StageConfig,
  'rows' | 'word' | 'style' | 'bg' | 'zoom' | 'inkStops' | 'logoColor'
> = {
  gradient: false,
  gradientAngle: 0,
  gradientFlow: 0,
  text: '',
  scanlines: 0.4,
  aberration: 1,
  curvature: 1,
  trail: false,
  shock: false,
  turbulence: 0,
  wavePattern: 'wavefront',
};

const BASE_ROWS = 22;
const VEL_SMOOTH = 5.0;
const SHOCK_LIFE = 2.4;

export interface StageHandle {
  replay: () => void;
  setPointer: (p: { x: number; y: number } | null) => void;
  burst: (x: number, y: number) => void;
}

function resolveTarget(c: StageConfig): Target {
  if (c.rows && c.rows.length) return makeTarget(c.rows);
  return makeTarget(renderWord(c.word ?? ' ', c.style ?? 'slant'));
}

function targetKey(c: StageConfig): string {
  return c.rows ? 'rows:' + c.rows.join('|') : `word:${c.word}:${c.style}`;
}

export interface StageEvents {
  onFormationStart?: () => void;
  onSettle?: () => void;
  onVisible?: (visible: boolean) => void;
  onFirstFrame?: () => void;
  onPointerMove?: (speed: number) => void;
  onPointerDown?: () => void;
}

export function useSwirlStage(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  cfgRef: RefObject<StageConfig>,
  onFail: () => void,
  eventsRef?: RefObject<StageEvents>
): RefObject<StageHandle> {
  const handle = useRef<StageHandle>({ replay: () => {}, setPointer: () => {}, burst: () => {} });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const r: Renderer | null = createRenderer(canvas);
    if (!r) {
      onFail();
      return;
    }
    const { gl } = r;
    const { round, max, floor } = Math;

    const glyphs: string[] = [];
    const lookup: Record<string, number> = Object.create(null);
    const addGlyph = (cc: string) => {
      if (lookup[cc] !== undefined) return;
      lookup[cc] = glyphs.length;
      glyphs.push(cc);
    };

    for (let code = 32; code <= 126; code++) addGlyph(String.fromCharCode(code));
    for (const cc of '█▓') addGlyph(cc);
    addGlyph(' ');
    const spaceSlot = lookup[' '] ?? 0;
    const slotOf = (cc: string, weight: number) => {
      const i = lookup[cc];
      return weight * glyphs.length + (i === undefined ? spaceSlot : i);
    };

    let source: string[] = cfgRef.current.text.split('\n').map((e) => e.replace(/\t/g, '    '));
    let lastText = cfgRef.current.text;

    let target: Target = resolveTarget(cfgRef.current);
    let lastTargetKey = targetKey(cfgRef.current);
    let lastZoom = cfgRef.current.zoom;

    let atlas: GlyphAtlas | null = null;
    let grid: FieldGrid | null = null;
    let buffers: FieldBuffers | null = null;
    let lastCw = -1;
    let lastCh = -1;
    let sizeDirty = true;

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        sizeDirty = true;
      });
      ro.observe(canvas);
    }

    let visible = true;
    let io: IntersectionObserver | null = null;

    const pointer = { x: 0, y: 0, active: false };
    const trail = makeTrailField();
    let velX = 0;
    let velY = 0;
    let prevPx = 0;
    let prevPy = 0;
    let havePrev = false;
    const shocks: Shock[] = [];

    let cachedStopsKey = '';
    let cachedStopsRgb: [number, number, number][] = [[1, 1, 1]];
    let cachedBgHex = '';
    let cachedBgRgb: [number, number, number] = [0, 0, 0];
    let cachedLogoHex = '';
    let cachedLogoRgb: [number, number, number] = [1, 1, 1];
    let cachedFlareHex = '';
    let cachedFlareRgb: [number, number, number] | undefined = undefined;

    function rebuild(cw: number, ch: number) {
      const c = cfgRef.current;
      const targetWidth = target.rows[0]?.length ?? 27;
      const rows = max(8, round(BASE_ROWS / max(0.3, c.zoom)));
      let inkSize = max(8, round(ch / rows));
      const minColsNeeded = targetWidth + (cw < ch ? 8 : 4);
      const approxAdvance = inkSize * 0.6;
      if (cw / approxAdvance < minColsNeeded) {
        inkSize = max(8, floor(cw / (minColsNeeded * 0.6)));
      }

      atlas = buildAtlas(gl, r!.glyphTex, r!.scratch, glyphs, inkSize);
      const gridRows = max(target.rows.length, Math.ceil(ch / atlas.inkSize) + 1);
      const contentH = gridRows * atlas.inkSize;
      const cols = floor(cw / atlas.advance);
      grid = {
        cols,
        rows: gridRows,
        inkSize: atlas.inkSize,
        vOffset: round((ch - contentH) / 2),
        targetX: max(0, round((cols - (target.rows[0]?.length ?? 0)) / 2)),
        targetY: max(0, round((gridRows - target.rows.length) / 2)),
      };
      const targetCells = target.rows.length * (target.rows[0]?.length ?? 0);
      buffers = makeBuffers(gridRows * cols + targetCells * 2);
      r!.allocCells(buffers);
      r!.resizeTargets(cw, ch);
    }

    let startTime = 0;
    let prevTime = 0;
    let raf = 0;
    let settled = false;
    let firstFramePainted = false;

    const FORMATION_SETTLE_SEC = 1.8;

    function startLoop() {
      if (raf !== 0) return;
      prevTime = 0;
      raf = requestAnimationFrame(frame);
    }
    function stopLoop() {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    handle.current = {
      replay: () => {
        startTime = 0;
      },
      setPointer: (p) => {
        if (p) {
          pointer.x = p.x;
          pointer.y = p.y;
          pointer.active = true;
        } else {
          pointer.active = false;
        }
      },
      burst: (x, y) => {
        shocks.push({ x, y, age: 0 });
        if (shocks.length > 4) shocks.shift();
      },
    };

    function frame(time: number) {
      const c = cfgRef.current;
      if (c.text !== lastText) {
        lastText = c.text;
        source = c.text.split('\n').map((e) => e.replace(/\t/g, '    '));
        sizeDirty = true;
        lastCw = -1;
      }
      const tk = targetKey(c);
      if (tk !== lastTargetKey) {
        lastTargetKey = tk;
        target = resolveTarget(c);
        sizeDirty = true;
        lastCw = -1;
        startTime = 0;
      }
      if (c.zoom !== lastZoom) {
        lastZoom = c.zoom;
        sizeDirty = true;
        lastCw = -1;
      }

      if (sizeDirty || lastCw <= 0 || lastCh <= 0) {
        const layoutW = canvas!.clientWidth || canvas!.getBoundingClientRect().width;
        const layoutH = canvas!.clientHeight || canvas!.getBoundingClientRect().height;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cw = round(layoutW * dpr);
        const ch = round(layoutH * dpr);
        if (cw > 0 && ch > 0) {
          sizeDirty = false;
          if (cw !== lastCw || ch !== lastCh) {
            rebuild(cw, ch);
            lastCw = cw;
            lastCh = ch;
          }
        }
      }

      const cw = lastCw;
      const ch = lastCh;

      if (grid && atlas && buffers && cw > 0 && ch > 0) {
        if (startTime === 0) {
          startTime = time;
          settled = false;
          eventsRef?.current?.onFormationStart?.();
        }
        if (prevTime === 0) prevTime = time;
        const elapsed = time - startTime;
        const dt = Math.min(0.05, Math.max(0.001, (time - prevTime) / 1000));
        prevTime = time;

        if (!settled && elapsed * 0.001 >= FORMATION_SETTLE_SEC) {
          settled = true;
          eventsRef?.current?.onSettle?.();
        }

        if (c.trail) {
          if (pointer.active) {
            const vSp = 1 - Math.exp(-VEL_SMOOTH * dt);
            if (havePrev) {
              const instVx = (pointer.x - prevPx) / dt;
              const instVy = (pointer.y - prevPy) / dt;
              velX += (instVx - velX) * vSp;
              velY += (instVy - velY) * vSp;
            }
            prevPx = pointer.x;
            prevPy = pointer.y;
            havePrev = true;
            depositTrail(trail, pointer.x, pointer.y, velX, velY, dt);
          } else {
            havePrev = false;
            velX *= 1 - (1 - Math.exp(-VEL_SMOOTH * dt));
            velY *= 1 - (1 - Math.exp(-VEL_SMOOTH * dt));
          }
          stepTrail(trail, dt);
        }

        if (shocks.length) {
          for (let i = 0; i < shocks.length; i++) {
            const sh = shocks[i];
            if (sh) sh.age += dt;
          }
          for (let i = shocks.length - 1; i >= 0; i--) {
            const sh = shocks[i];
            if (sh && sh.age > SHOCK_LIFE) shocks.splice(i, 1);
          }
        }

        const stopsKey = (c.gradient ? c.inkStops : c.inkStops.slice(0, 1)).join(',');
        if (stopsKey !== cachedStopsKey) {
          cachedStopsKey = stopsKey;
          const parsed = (c.gradient ? c.inkStops : c.inkStops.slice(0, 1)).map(hexToRgb01);
          cachedStopsRgb = parsed.length ? (parsed as [number, number, number][]) : [[1, 1, 1]];
        }
        if (c.bg !== cachedBgHex) {
          cachedBgHex = c.bg;
          cachedBgRgb = hexToRgb01(c.bg);
        }
        if (c.logoColor !== cachedLogoHex) {
          cachedLogoHex = c.logoColor;
          cachedLogoRgb = hexToRgb01(c.logoColor);
        }
        const flareHex = c.trailFlare ?? '';
        if (flareHex !== cachedFlareHex) {
          cachedFlareHex = flareHex;
          cachedFlareRgb = flareHex ? hexToRgb01(flareHex) : undefined;
        }

        const paint: InkPaint = {
          stops: cachedStopsRgb,
          angle: c.gradientAngle,
          flow: c.gradient ? elapsed * 0.001 * c.gradientFlow : 0,
          gradient: c.gradient && cachedStopsRgb.length > 1,
          mode: c.gradientMode ?? 'rows',
        };
        const bg = cachedBgRgb;
        const count = composeField({
          grid,
          atlas,
          buffers,
          source: source.length ? source : [''],
          target,
          elapsed,
          paint,
          logo: cachedLogoRgb,
          slotOf,
          trail: c.trail ? trail : undefined,
          trailStrength: c.trailStrength,
          trailFlare: cachedFlareRgb,
          shocks: c.shock && shocks.length ? shocks : undefined,
          turbulence: c.turbulence,
          wavePattern: c.wavePattern,
        });
        r!.drawField(count, grid, buffers, bg);
        r!.drawCrt(elapsed * 0.001, cw, ch, {
          scanline: c.scanlines,
          aberration: c.aberration,
          curvature: c.curvature,
          bg,
        });
        if (!firstFramePainted) {
          firstFramePainted = true;
          eventsRef?.current?.onFirstFrame?.();
        }
      }
      raf = 0;
      if (visible) raf = requestAnimationFrame(frame);
    }

    let cancelled = false;
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) {
          sizeDirty = true;
          lastCw = -1;
          lastCh = -1;
        }
      });
    }

    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        ([entry]) => {
          const nowVisible = entry?.isIntersecting ?? false;
          if (nowVisible && !visible) {
            visible = true;
            prevTime = 0;
            startLoop();
            eventsRef?.current?.onVisible?.(true);
          } else if (!nowVisible && visible) {
            visible = false;
            stopLoop();
            eventsRef?.current?.onVisible?.(false);
          }
        },
        { threshold: 0, rootMargin: '0px' }
      );
      io.observe(canvas);
      startLoop();
    } else {
      startLoop();
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else if (visible) {
        prevTime = 0;
        startLoop();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange, { passive: true });

    const onContextLost = (e: Event) => {
      e.preventDefault();
      stopLoop();
    };
    const onContextRestored = () => {
      sizeDirty = true;
      lastCw = -1;
      lastCh = -1;
      if (visible) startLoop();
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stopLoop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      ro?.disconnect();
      io?.disconnect();
      r.dispose();
    };
  }, [canvasRef, cfgRef, eventsRef, onFail]);

  return handle;
}
