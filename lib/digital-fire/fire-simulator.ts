/**
 * @file lib/digital-fire/fire-simulator.ts
 * @description موتور فیزیک شبیه‌سازی انتقال حرارت، زبانه کشیدن شعله‌ها و ذرات اخگر دیجیتال
 */

import { FIRE_HEAT_LEVELS } from './fire-palettes';
import type { EmberParticle } from './types';

const MIN_COLS = 10;
const MIN_ROWS = 8;
const MAX_EMBERS = 40;
const EMBER_SPAWN_HEAT_THRESHOLD = 16;
const EMBER_GLYPHS = ['·', '*', '•', "'", '^', '.', '0', '1'] as const;
const INV_UINT32 = 1 / 4294967296;

/**
 * کلاس مدیریت شبیه‌سازی آتش دیجیتالی با کارایی بالا (Zero Allocation در حلقه رندر)
 */
export class FireSimulator {
  public cols: number;
  public rows: number;
  public heatBuffer: Uint8Array;
  public embers: EmberParticle[] = [];
  public maxHeat: number;

  private sinWave1: Float32Array;
  private cosWave1: Float32Array;
  private sinWave2: Float32Array;
  private cosWave2: Float32Array;
  private sinWave3: Float32Array;
  private cosWave3: Float32Array;
  private fuelBed: Float32Array;
  private rngState = 0x9e3779b9;

  private readonly maxEmbers = MAX_EMBERS;
  private readonly emberPool: EmberParticle[] = Array.from({ length: MAX_EMBERS }, () => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    char: '·',
    life: 0,
    maxLife: 25,
    color: 'rgb(255,250,210)',
  }));

  /**
   * ایجاد نمونه شبیه‌ساز آتش
   *
   * @param {number} cols - تعداد ستون‌های افقی کاراکترها
   * @param {number} rows - تعداد سطرهای عمودی کاراکترها
   * @param {number} maxHeat - حداکثر درجه حرارت (پیش‌فرض ۳۶)
   */
  constructor(cols: number, rows: number, maxHeat: number = FIRE_HEAT_LEVELS) {
    this.cols = Math.max(MIN_COLS, cols);
    this.rows = Math.max(MIN_ROWS, rows);
    this.maxHeat = maxHeat;
    this.heatBuffer = new Uint8Array(this.cols * this.rows);
    this.sinWave1 = new Float32Array(this.cols);
    this.cosWave1 = new Float32Array(this.cols);
    this.sinWave2 = new Float32Array(this.cols);
    this.cosWave2 = new Float32Array(this.cols);
    this.sinWave3 = new Float32Array(this.cols);
    this.cosWave3 = new Float32Array(this.cols);
    this.fuelBed = new Float32Array(this.cols);
    this.precomputeSpatialWaves();
  }

  private precomputeSpatialWaves(): void {
    for (let x = 0; x < this.cols; x++) {
      const a1 = x * 0.14;
      const a2 = x * 0.29 + 0.8;
      const a3 = x * 0.08 + 1.9;
      this.sinWave1[x] = Math.sin(a1);
      this.cosWave1[x] = Math.cos(a1);
      this.sinWave2[x] = Math.sin(a2);
      this.cosWave2[x] = Math.cos(a2);
      this.sinWave3[x] = Math.sin(a3);
      this.cosWave3[x] = Math.cos(a3);
      this.fuelBed[x] = 0.55 + 0.35 * Math.sin(x * 0.19) * Math.cos(x * 0.07);
    }
  }

  /**
   * تغییر ابعاد ماتریس شبیه‌ساز در زمان تغییر اندازه صفحه
   *
   * @param {number} cols - تعداد ستون‌های جدید
   * @param {number} rows - تعداد سطرهای جدید
   */
  public resize(cols: number, rows: number): void {
    const newCols = Math.max(MIN_COLS, cols);
    const newRows = Math.max(MIN_ROWS, rows);
    if (newCols === this.cols && newRows === this.rows) return;

    this.cols = newCols;
    this.rows = newRows;
    this.heatBuffer = new Uint8Array(this.cols * this.rows);
    this.sinWave1 = new Float32Array(this.cols);
    this.cosWave1 = new Float32Array(this.cols);
    this.sinWave2 = new Float32Array(this.cols);
    this.cosWave2 = new Float32Array(this.cols);
    this.sinWave3 = new Float32Array(this.cols);
    this.cosWave3 = new Float32Array(this.cols);
    this.fuelBed = new Float32Array(this.cols);
    this.precomputeSpatialWaves();
    this.embers.length = 0;
  }

  private spawnEmber(
    x: number,
    y: number,
    vx: number,
    vy: number,
    char: string,
    maxLife: number,
    color: string
  ): void {
    const activeCount = this.embers.length;
    if (activeCount >= this.maxEmbers) return;
    const slot = this.emberPool[activeCount];
    if (!slot) return;

    slot.x = x;
    slot.y = y;
    slot.vx = vx;
    slot.vy = vy;
    slot.char = char;
    slot.life = 0;
    slot.maxLife = maxLife;
    slot.color = color;
    this.embers.push(slot);
  }

  /**
   * اعمال گرمای متمرکز بر روی ماتریس (مانند حرکت نشانگر ماوس یا لمس)
   *
   * @param {number} centerCol - ستون مرکزی
   * @param {number} centerRow - سطر مرکزی
   * @param {number} radius - شعاع نفوذ گرما
   * @param {number} intensity - شدت گرمای اعمالی
   */
  public injectHeat(
    centerCol: number,
    centerRow: number,
    radius: number = 3,
    intensity: number = 35
  ): void {
    const minCol = Math.max(0, centerCol - radius);
    const maxCol = Math.min(this.cols - 1, centerCol + radius);
    const minRow = Math.max(0, centerRow - radius);
    const maxRow = Math.min(this.rows - 1, centerRow + radius);
    const radiusSq = radius * radius;
    const invRadius = 1 / Math.max(1, radius);

    for (let r = minRow; r <= maxRow; r++) {
      const dy = r - centerRow;
      const dySq = dy * dy;
      const rowOffset = r * this.cols;
      for (let c = minCol; c <= maxCol; c++) {
        const dx = c - centerCol;
        const distSq = dx * dx + dySq;
        if (distSq <= radiusSq) {
          const dist = Math.sqrt(distSq);
          const idx = rowOffset + c;
          const heatAdd = (intensity * (1 - dist * invRadius)) | 0;
          const current = this.heatBuffer[idx] ?? 0;
          this.heatBuffer[idx] = Math.min(this.maxHeat, current + heatAdd);
        }
      }
    }

    if (this.embers.length < this.maxEmbers && Math.random() < 0.6) {
      this.spawnEmber(
        centerCol,
        centerRow,
        (Math.random() - 0.5) * 1.5,
        -(Math.random() * 1.5 + 0.8),
        Math.random() > 0.5 ? '1' : '0',
        ((Math.random() * 25) | 0) + 20,
        'rgb(255,255,250)'
      );
    }
  }

  /**
   * یک گام اجرای شبیه‌سازی حرکت آتش به سمت بالا به صورت ثابت و پایدار در جای خود
   *
   * @param {number} tick - شماره گام زمانی برای نوسان هارمونیک امواج کف
   * @param {number} wind - ضریب وزش باد افقی (پیش‌فرض ۰)
   */
  public step(tick: number, wind: number = 0): void {
    const { cols, rows, maxHeat, heatBuffer, fuelBed } = this;
    const bottomRowOffset = (rows - 1) * cols;
    const secondBottomRowOffset = bottomRowOffset - cols;
    const maxColIndex = cols - 1;
    let rng = this.rngState | 1;

    // ضرایب زمانی امواج رونده متقابل (Counter-Propagating Traveling Waves) بدون گره ایستا و بدون انحراف خالص
    const t1 = tick * 0.09;
    const t2 = tick * 0.13;
    const t3 = tick * 0.055;
    const sinT1 = Math.sin(t1);
    const cosT1 = Math.cos(t1);
    const sinT2 = Math.sin(t2);
    const cosT2 = Math.cos(t2);
    const sinT3 = Math.sin(t3);
    const cosT3 = Math.cos(t3);

    const { sinWave1, cosWave1, sinWave2, cosWave2, sinWave3, cosWave3 } = this;
    const coreBoostThresh = (maxHeat * 0.72) | 0;
    const hasSecondBottom = rows > 2;

    // ۱. تکامل بستر سوخت متلاطم در کف آتش (ایجاد کانون‌های شعله‌ور بلند و شکاف‌های طبیعی هوا)
    for (let x = 0; x < cols; x++) {
      const leftF = fuelBed[x > 0 ? x - 1 : 0]!;
      const rightF = fuelBed[x < maxColIndex ? x + 1 : maxColIndex]!;
      let f = fuelBed[x]! * 0.82 + (leftF + rightF) * 0.09;

      rng ^= rng << 13;
      rng ^= rng >>> 17;
      rng ^= rng << 5;
      const r = (rng >>> 0) * INV_UINT32;

      if (r < 0.065) {
        // فوران ناگهانی زبانه آتش در کانون‌های محلی
        rng ^= rng << 13;
        rng ^= rng >>> 17;
        rng ^= rng << 5;
        const r2 = (rng >>> 0) * INV_UINT32;
        const boosted = f + 0.42 + r2 * 0.35;
        f = boosted < 1.0 ? boosted : 1.0;
      } else if (r > 0.945) {
        // مکش هوای سرد بین زبانه‌ها برای شکستن حالت خطی شعله گاز
        f *= 0.28;
      } else {
        f = f * 0.96 + 0.025;
      }
      fuelBed[x] = f;

      // ترکیب امواج رونده چپ‌گرد و راست‌گرد (حذف کامل گره‌های ثابت شعله گاز)
      const waveRight = sinWave1[x]! * cosT1 - cosWave1[x]! * sinT1;
      const waveLeft = sinWave2[x]! * cosT2 + cosWave2[x]! * sinT2;
      const waveSlow = cosWave3[x]! * cosT3 - sinWave3[x]! * sinT3;
      const travelingWave = (waveRight * 0.38 + waveLeft * 0.34 + waveSlow * 0.28 + 1.0) * 0.5;

      rng ^= rng << 13;
      rng ^= rng >>> 17;
      rng ^= rng << 5;
      const crackle = (rng >>> 0) * INV_UINT32 * 0.26;
      const rawEnergy = f * 0.62 + travelingWave * 0.34 + crackle;
      // توان غیرخطی برای ایجاد کنتراست بالا بین هسته‌های سفید-طلایی و شکاف‌های تیره
      const shapedEnergy =
        rawEnergy > 0.38 ? (rawEnergy * 1.18 < 1.0 ? rawEnergy * 1.18 : 1.0) : rawEnergy * 0.65;
      const rawCalc = (shapedEnergy * maxHeat) | 0;
      const calculatedHeat = rawCalc > maxHeat ? maxHeat : rawCalc > 2 ? rawCalc : 2;

      heatBuffer[bottomRowOffset + x] = calculatedHeat;
      if (hasSecondBottom) {
        const coreBoost = calculatedHeat > coreBoostThresh ? 0.94 : 0.76;
        rng ^= rng << 13;
        rng ^= rng >>> 17;
        rng ^= rng << 5;
        const subHeat = (calculatedHeat * (coreBoost + (rng >>> 0) * INV_UINT32 * 0.12)) | 0;
        heatBuffer[secondBottomRowOffset + x] = subHeat < maxHeat ? subHeat : maxHeat;
      }
    }

    // ۲. صعود همرفتی تیز و گردابه‌ای (Vortex Advection & Pinching) بدون مات‌شدگی کارتونی
    const upperTipsThreshold = (rows * 0.36) | 0;
    const midFlameThreshold = (rows * 0.7) | 0;
    const roundedWind = wind !== 0 ? Math.round(wind) : 0;
    const buoyantThresh = (maxHeat * 0.68) | 0;
    const pocketThresh = (maxHeat * 0.42) | 0;
    const sustainThresh = (maxHeat * 0.76) | 0;

    for (let y = 1; y < rows; y++) {
      const srcRowOffset = y * cols;
      const dstRowOffset = srcRowOffset - cols;
      const belowRowOffset = y + 1 < rows ? srcRowOffset + cols : srcRowOffset;
      const baseDecay = y < upperTipsThreshold ? 2 : y < midFlameThreshold ? 1 : 0;
      const canSustain = y > upperTipsThreshold;
      // موج برشی گردابه‌ای متقارن در ارتفاع شعله
      const rowSwirlPhase = Math.sin(y * 0.42 - t1 * 1.3) * 0.14;

      for (let x = 0; x < cols; x++) {
        let jitter = roundedWind;
        if (wind === 0) {
          rng ^= rng << 13;
          rng ^= rng >>> 17;
          rng ^= rng << 5;
          const rand = (rng >>> 0) * INV_UINT32 + sinWave2[x]! * rowSwirlPhase;
          if (rand < 0.29) {
            jitter = -1;
          } else if (rand > 0.71) {
            jitter = 1;
          }
        }

        let sampleX = x + jitter;
        if (sampleX < 0) sampleX = 0;
        else if (sampleX > maxColIndex) sampleX = maxColIndex;
        const leftX = x > 0 ? x - 1 : 0;
        const rightX = x < maxColIndex ? x + 1 : maxColIndex;

        const advectedHeat = heatBuffer[srcRowOffset + sampleX]!;
        const centerHeat = heatBuffer[srcRowOffset + x]!;
        const leftHeat = heatBuffer[srcRowOffset + leftX]!;
        const rightHeat = heatBuffer[srcRowOffset + rightX]!;
        const deepHeat = heatBuffer[belowRowOffset + sampleX]!;

        // حفظ تیزی زبانه‌های شعله با غلبه همرفت عمودی بر پخش افقی
        const neighborAvg = (leftHeat + rightHeat) >> 1;
        const buoyantSource =
          advectedHeat > buoyantThresh ? (advectedHeat * 3 + deepHeat) >> 2 : advectedHeat;
        const convectedHeat = (buoyantSource * 5 + centerHeat * 2 + neighborAvg) >> 3;

        if (convectedHeat <= 0) {
          heatBuffer[dstRowOffset + x] = 0;
          continue;
        }

        // خنک‌سازی لبه‌ای (Pinching) برای باریک شدن طبیعی نوک زبانه‌ها و جدا شدن شعله‌های کوچک در بالا
        const diff = leftHeat - rightHeat;
        const shearGradient = diff < 0 ? -diff : diff;
        rng ^= rng << 13;
        rng ^= rng >>> 17;
        rng ^= rng << 5;
        const rPinch = (rng >>> 0) * INV_UINT32;
        const edgePinch = shearGradient > 9 && rPinch < 0.62 ? 2 : shearGradient > 5 ? 1 : 0;

        rng ^= rng << 13;
        rng ^= rng >>> 17;
        rng ^= rng << 5;
        const rCool = (rng >>> 0) * INV_UINT32;
        const pocketCool = convectedHeat < pocketThresh && rCool < 0.68 ? 2 : rCool < 0.52 ? 1 : 0;
        // هسته‌های بسیار داغ با افت کمتر صعود می‌کنند تا زبانه‌های بلند و نامتقارن بسازند
        const coreSustain = canSustain && convectedHeat > sustainThresh ? -1 : 0;

        const totalDecay = baseDecay + pocketCool + edgePinch + coreSustain;
        const nextHeat = convectedHeat - (totalDecay > 0 ? totalDecay : 0);
        heatBuffer[dstRowOffset + x] = nextHeat > 0 ? nextHeat : 0;
      }
    }

    this.rngState = rng;
    // ۳. به‌روزرسانی اخگرها و جرقه‌های صعودکننده با تغییر رنگ حرارتی
    this.updateEmbers(cols, rows);
  }

  private updateEmbers(cols: number, rows: number): void {
    if (this.embers.length < this.maxEmbers && Math.random() < 0.42) {
      const spawnCol = Math.floor(Math.random() * cols);
      const spawnRow = Math.floor(rows * 0.32 + Math.random() * (rows * 0.38));
      const cellHeat = this.heatBuffer[spawnRow * cols + spawnCol] ?? 0;

      if (cellHeat > EMBER_SPAWN_HEAT_THRESHOLD) {
        const glyph = EMBER_GLYPHS[(Math.random() * EMBER_GLYPHS.length) | 0] ?? '·';
        this.spawnEmber(
          spawnCol,
          spawnRow,
          (Math.random() - 0.5) * 0.65,
          -(Math.random() * 0.75 + 0.45),
          glyph,
          Math.floor(Math.random() * 28 + 18),
          'rgb(240,253,250)'
        );
      }
    }

    for (let i = this.embers.length - 1; i >= 0; i--) {
      const ember = this.embers[i];
      if (!ember) continue;
      ember.life++;
      // نوسان آشفته متقارن با میانگین صفر برای صعود طبیعی جرقه‌ها
      ember.x += ember.vx + Math.cos((ember.life + i * 7) * 0.32) * 0.14;
      ember.y += ember.vy;

      // تغییر دمای رنگ جرقه در طول عمر متناسب با تم سایبر-زمردی (سفید یخی -> نعنایی درخشان -> زمردی -> سبز تیره)
      const lifeRatio = ember.life / ember.maxLife;
      if (lifeRatio < 0.25) {
        ember.color = 'rgb(240,253,250)';
      } else if (lifeRatio < 0.55) {
        ember.color = 'rgb(110,231,183)';
      } else if (lifeRatio < 0.8) {
        ember.color = 'rgb(16,185,129)';
      } else {
        ember.color = 'rgb(6,95,70)';
      }

      if (ember.life >= ember.maxLife || ember.y < 0 || ember.x < 0 || ember.x >= cols) {
        const lastIdx = this.embers.length - 1;
        if (i !== lastIdx) {
          const lastEmber = this.embers[lastIdx]!;
          this.embers[i] = lastEmber;
          this.emberPool[i] = lastEmber;
          this.emberPool[lastIdx] = ember;
        }
        this.embers.pop();
      }
    }
  }
}
