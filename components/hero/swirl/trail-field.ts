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
  hasHeat: boolean;
}

export function makeTrailField(): TrailField {
  const n = TRAIL_W * TRAIL_H;
  return {
    heat: new Float32Array(n),
    flowX: new Float32Array(n),
    flowY: new Float32Array(n),
    tmp: new Float32Array(n),
    hasHeat: false,
  };
}

export function clearTrail(t: TrailField) {
  t.heat.fill(0);
  t.flowX.fill(0);
  t.flowY.fill(0);
  t.hasHeat = false;
}

const SCALE_GX = (TRAIL_W - 1) * 0.5;
const SCALE_GY = (TRAIL_H - 1) * 0.5;
const toGX = (nx: number) => (nx + 1) * SCALE_GX;
const toGY = (ny: number) => (ny + 1) * SCALE_GY;

export function depositTrail(
  t: TrailField,
  nx: number,
  ny: number,
  vx: number,
  vy: number,
  dt: number
) {
  const rawSpeed = Math.hypot(vx, vy);
  const speed = rawSpeed < 3 ? rawSpeed : 3;
  const amount = (DEPOSIT_BASE + DEPOSIT_SPEED * speed) * dt;
  const invLen = rawSpeed > 0 ? 1 / rawSpeed : 0;
  const dirX = vx * invLen;
  const dirY = vy * invLen;

  const gx = toGX(nx);
  const gy = toGY(ny);
  const rx = DEPOSIT_RADIUS * (TRAIL_W * 0.5);
  const ry = DEPOSIT_RADIUS * (TRAIL_H * 0.5);
  const invRx = 1 / rx;
  const invRy = 1 / ry;
  const x0 = Math.max(0, Math.floor(gx - rx * 2));
  const x1 = Math.min(TRAIL_W - 1, Math.ceil(gx + rx * 2));
  const y0 = Math.max(0, Math.floor(gy - ry * 2));
  const y1 = Math.min(TRAIL_H - 1, Math.ceil(gy + ry * 2));
  const { heat, flowX, flowY } = t;

  for (let y = y0; y <= y1; y++) {
    const ddy = (y - gy) * invRy;
    const ddySq = ddy * ddy;
    const rowOff = y * TRAIL_W;
    for (let x = x0; x <= x1; x++) {
      const ddx = (x - gx) * invRx;
      const distSq = ddx * ddx + ddySq;
      if (distSq > 4.6) continue;
      const fall = Math.exp(-distSq);
      const i = rowOff + x;
      const nextHeat = heat[i]! + amount * fall;
      heat[i] = nextHeat < HEAT_MAX ? nextHeat : HEAT_MAX;

      const w = FLOW_BLEND * fall;
      const curFx = flowX[i]!;
      const curFy = flowY[i]!;
      flowX[i] = curFx + (dirX - curFx) * w;
      flowY[i] = curFy + (dirY - curFy) * w;
    }
  }
  t.hasHeat = true;
}

export function stepTrail(t: TrailField, dt: number) {
  if (!t.hasHeat) return;
  const keep = Math.exp(-DECAY_PER_SEC * dt);
  const { heat, tmp } = t;
  const maxCol = TRAIL_W - 1;
  const maxRow = TRAIL_H - 1;

  for (let y = 0; y < TRAIL_H; y++) {
    const rowOff = y * TRAIL_W;
    const upOff = y > 0 ? rowOff - TRAIL_W : rowOff;
    const dnOff = y < maxRow ? rowOff + TRAIL_W : rowOff;
    for (let x = 0; x < TRAIL_W; x++) {
      const i = rowOff + x;
      const l = x > 0 ? heat[i - 1]! : heat[i]!;
      const rr = x < maxCol ? heat[i + 1]! : heat[i]!;
      const u = heat[upOff + x]!;
      const d = heat[dnOff + x]!;
      tmp[i] = (l + rr + u + d) * 0.25;
    }
  }

  let maxH = 0;
  const len = heat.length;
  for (let i = 0; i < len; i++) {
    const hVal = heat[i]!;
    const nextH = (hVal + (tmp[i]! - hVal) * DIFFUSE) * keep;
    heat[i] = nextH;
    if (nextH > maxH) maxH = nextH;
  }
  if (maxH < 0.0005) {
    clearTrail(t);
  }
}

export function sampleTrail(
  t: TrailField,
  nx: number,
  ny: number,
  out: { heat: number; fx: number; fy: number }
) {
  if (!t.hasHeat) {
    out.heat = 0;
    out.fx = 0;
    out.fy = 0;
    return;
  }
  const gx = (nx + 1) * SCALE_GX;
  const gy = (ny + 1) * SCALE_GY;
  let x0 = gx | 0;
  let y0 = gy | 0;
  if (x0 < 0) x0 = 0;
  else if (x0 >= TRAIL_W) x0 = TRAIL_W - 1;
  if (y0 < 0) y0 = 0;
  else if (y0 >= TRAIL_H) y0 = TRAIL_H - 1;

  const x1 = x0 + 1 < TRAIL_W ? x0 + 1 : TRAIL_W - 1;
  const y1 = y0 + 1 < TRAIL_H ? y0 + 1 : TRAIL_H - 1;
  const tx = gx - x0;
  const ty = gy - y0;
  const r0 = y0 * TRAIL_W;
  const r1 = y1 * TRAIL_W;
  const i00 = r0 + x0;
  const i10 = r0 + x1;
  const i01 = r1 + x0;
  const i11 = r1 + x1;

  const { heat, flowX, flowY } = t;
  const h00 = heat[i00]!;
  const h10 = heat[i10]!;
  const h01 = heat[i01]!;
  const h11 = heat[i11]!;
  if (h00 + h10 + h01 + h11 <= 0.0004) {
    out.heat = 0;
    out.fx = 0;
    out.fy = 0;
    return;
  }

  const hTop = h00 + (h10 - h00) * tx;
  const hBot = h01 + (h11 - h01) * tx;
  out.heat = hTop + (hBot - hTop) * ty;

  const fx00 = flowX[i00]!;
  const fxTop = fx00 + (flowX[i10]! - fx00) * tx;
  const fx01 = flowX[i01]!;
  const fxBot = fx01 + (flowX[i11]! - fx01) * tx;
  out.fx = fxTop + (fxBot - fxTop) * ty;

  const fy00 = flowY[i00]!;
  const fyTop = fy00 + (flowY[i10]! - fy00) * tx;
  const fy01 = flowY[i01]!;
  const fyBot = fy01 + (flowY[i11]! - fy01) * tx;
  out.fy = fyTop + (fyBot - fyTop) * ty;
}
