export const TRAIL_W = 72;
export const TRAIL_H = 40;

const DEPOSIT_RADIUS = 0.15;
const DEPOSIT_BASE = 0.05;
const DEPOSIT_SPEED = 0.8;
const HEAT_MAX = 0.7;
const DECAY_PER_SEC = 0.025;
const DIFFUSE = 0.12;
const FLOW_BLEND = 0.25;

export interface TrailField {
  heat: Float32Array;
  flowX: Float32Array;
  flowY: Float32Array;
  tmp: Float32Array;
}

export function makeTrailField(): TrailField {
  const n = TRAIL_W * TRAIL_H;
  return {
    heat: new Float32Array(n),
    flowX: new Float32Array(n),
    flowY: new Float32Array(n),
    tmp: new Float32Array(n),
  };
}

export function clearTrail(t: TrailField) {
  t.heat.fill(0);
  t.flowX.fill(0);
  t.flowY.fill(0);
}

const toGX = (nx: number) => ((nx + 1) / 2) * (TRAIL_W - 1);
const toGY = (ny: number) => ((ny + 1) / 2) * (TRAIL_H - 1);

export function depositTrail(
  t: TrailField,
  nx: number,
  ny: number,
  vx: number,
  vy: number,
  dt: number
) {
  const speed = Math.min(3, Math.hypot(vx, vy));
  const amount = (DEPOSIT_BASE + DEPOSIT_SPEED * speed) * dt;
  const dirLen = Math.hypot(vx, vy) || 1;
  const dirX = vx / dirLen;
  const dirY = vy / dirLen;

  const gx = toGX(nx);
  const gy = toGY(ny);
  const rx = DEPOSIT_RADIUS * (TRAIL_W / 2);
  const ry = DEPOSIT_RADIUS * (TRAIL_H / 2);
  const x0 = Math.max(0, Math.floor(gx - rx * 2));
  const x1 = Math.min(TRAIL_W - 1, Math.ceil(gx + rx * 2));
  const y0 = Math.max(0, Math.floor(gy - ry * 2));
  const y1 = Math.min(TRAIL_H - 1, Math.ceil(gy + ry * 2));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const ddx = (x - gx) / rx;
      const ddy = (y - gy) / ry;
      const fall = Math.exp(-(ddx * ddx + ddy * ddy));
      if (fall < 0.01) continue;
      const i = y * TRAIL_W + x;
      t.heat[i] = Math.min(HEAT_MAX, (t.heat[i] ?? 0) + amount * fall);

      const w = FLOW_BLEND * fall;
      const curFx = t.flowX[i] ?? 0;
      const curFy = t.flowY[i] ?? 0;
      t.flowX[i] = curFx + (dirX - curFx) * w;
      t.flowY[i] = curFy + (dirY - curFy) * w;
    }
  }
}

export function stepTrail(t: TrailField, dt: number) {
  const keep = Math.exp(-DECAY_PER_SEC * dt);
  const { heat, tmp } = t;

  for (let y = 0; y < TRAIL_H; y++) {
    for (let x = 0; x < TRAIL_W; x++) {
      const i = y * TRAIL_W + x;
      const center = heat[i] ?? 0;
      const l = x > 0 ? (heat[i - 1] ?? center) : center;
      const rr = x < TRAIL_W - 1 ? (heat[i + 1] ?? center) : center;
      const u = y > 0 ? (heat[i - TRAIL_W] ?? center) : center;
      const d = y < TRAIL_H - 1 ? (heat[i + TRAIL_W] ?? center) : center;
      tmp[i] = (l + rr + u + d) * 0.25;
    }
  }
  for (let i = 0; i < heat.length; i++) {
    const hVal = heat[i] ?? 0;
    const tVal = tmp[i] ?? hVal;
    heat[i] = (hVal + (tVal - hVal) * DIFFUSE) * keep;
  }
}

export function sampleTrail(
  t: TrailField,
  nx: number,
  ny: number,
  out: { heat: number; fx: number; fy: number }
) {
  const gx = toGX(nx);
  const gy = toGY(ny);
  const x0 = Math.max(0, Math.min(TRAIL_W - 1, Math.floor(gx)));
  const y0 = Math.max(0, Math.min(TRAIL_H - 1, Math.floor(gy)));
  const x1 = Math.min(TRAIL_W - 1, x0 + 1);
  const y1 = Math.min(TRAIL_H - 1, y0 + 1);
  const tx = gx - x0;
  const ty = gy - y0;
  const i00 = y0 * TRAIL_W + x0;
  const i10 = y0 * TRAIL_W + x1;
  const i01 = y1 * TRAIL_W + x0;
  const i11 = y1 * TRAIL_W + x1;
  const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
  const bi = (arr: Float32Array) =>
    lerp(lerp(arr[i00] ?? 0, arr[i10] ?? 0, tx), lerp(arr[i01] ?? 0, arr[i11] ?? 0, tx), ty);
  out.heat = bi(t.heat);
  out.fx = bi(t.flowX);
  out.fy = bi(t.flowY);
}
