import { FIGLET_FONTS } from './figlet-fonts';

export type FontStyle =
  'slant' | 'standard' | 'ogre' | 'doom' | 'big' | 'speed' | 'stop' | 'subzero' | 'banner';

const BANNER_BITS: Record<string, string[]> = {
  A: ['01110', '10001', '11111', '10001', '10001'],
  B: ['11110', '10001', '11110', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '11110', '10000', '11111'],
  F: ['11111', '10000', '11110', '10000', '10000'],
  G: ['01111', '10000', '10011', '10001', '01111'],
  H: ['10001', '10001', '11111', '10001', '10001'],
  I: ['111', '010', '010', '010', '111'],
  J: ['00111', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '11100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001'],
  O: ['01110', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '11110', '10000', '10000'],
  Q: ['01110', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '11110', '10010', '10001'],
  S: ['01111', '10000', '01110', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10101', '11011', '10001'],
  X: ['10001', '01010', '00100', '01010', '10001'],
  Y: ['10001', '01010', '00100', '00100', '00100'],
  Z: ['11111', '00010', '00100', '01000', '11111'],
  '0': ['01110', '10011', '10101', '11001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '01110'],
  '2': ['11110', '00001', '01110', '10000', '11111'],
  '3': ['11110', '00001', '01110', '00001', '11110'],
  '4': ['10010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '11110'],
  '6': ['01111', '10000', '11110', '10001', '01110'],
  '7': ['11111', '00010', '00100', '01000', '01000'],
  '8': ['01110', '10001', '01110', '10001', '01110'],
  '9': ['01110', '10001', '01111', '00001', '11110'],
  '!': ['1', '1', '1', '0', '1'],
  '?': ['11110', '00001', '00110', '00000', '00100'],
  '.': ['0', '0', '0', '0', '1'],
  '-': ['000', '000', '111', '000', '000'],
  ' ': ['00', '00', '00', '00', '00'],
};

function bitsToOutline(bits: string[]): string[] {
  const h = bits.length;
  const w = Math.max(0, ...bits.map((r) => r.length));
  const on = (r: number, c: number) => r >= 0 && r < h && c >= 0 && c < w && bits[r]?.[c] === '1';
  return bits.map((row, r) => {
    let line = '';
    for (let c = 0; c < w; c++) {
      if (!on(r, c)) {
        line += ' ';
        continue;
      }
      const edge = !on(r - 1, c) || !on(r + 1, c) || !on(r, c - 1) || !on(r, c + 1);
      line += edge ? '█' : ' ';
    }
    return line;
  });
}

const BANNER: Record<string, string[]> = Object.fromEntries(
  Object.entries(BANNER_BITS).map(([k, v]) => [k, bitsToOutline(v)])
);

const TABLES: Record<FontStyle, Record<string, string[]>> = {
  slant: FIGLET_FONTS.slant,
  standard: FIGLET_FONTS.standard,
  ogre: FIGLET_FONTS.ogre,
  doom: FIGLET_FONTS.doom,
  big: FIGLET_FONTS.big,
  speed: FIGLET_FONTS.speed,
  stop: FIGLET_FONTS.stop,
  subzero: FIGLET_FONTS.subzero,
  banner: BANNER,
};

const GAP_COLS: Partial<Record<FontStyle, number>> = { banner: 1 };

function squareGlyph(rows: string[]): string[] {
  const w = Math.max(0, ...rows.map((r) => r.length));
  return rows.map((r) => r.padEnd(w, ' '));
}

function overlapAllowed(
  canvas: string[],
  glyph: string[],
  leftEdge: number,
  minGap: number
): number {
  const gw = Math.max(0, ...glyph.map((r) => r.length));
  let shift = 0;
  for (let s = 1; s <= gw; s++) {
    let collides = false;
    for (let r = 0; r < canvas.length && !collides; r++) {
      const crow = canvas[r] ?? '';
      const grow = glyph[r] ?? '';
      for (let gx = 0; gx < gw; gx++) {
        const gc = grow[gx] ?? ' ';
        if (gc === ' ') continue;
        const cx = leftEdge - s + gx;
        if (cx < 0) continue;

        for (let g = 0; g <= minGap; g++) {
          if ((crow[cx + g] ?? ' ') !== ' ') {
            collides = true;
            break;
          }
        }
        if (collides) break;
      }
    }
    if (collides) break;
    shift = s;
  }
  return shift;
}

export function renderWord(word: string, style: FontStyle): string[] {
  const table = TABLES[style];
  const fallbackGlyph = table[' '] ?? [' '];
  const minGap = GAP_COLS[style] ?? 0;
  const rowCount = fallbackGlyph.length;
  const glyphs = word
    .toUpperCase()
    .split('')
    .map((c) => squareGlyph(table[c] ?? fallbackGlyph));
  if (glyphs.length === 0) return Array.from({ length: rowCount }, () => '');

  let canvas: string[] = Array.from({ length: rowCount }, () => '');
  for (const glyph of glyphs) {
    const gw = Math.max(0, ...glyph.map((r) => r.length));
    const cw = Math.max(0, ...canvas.map((r) => r.length));
    const shift = cw > 0 ? overlapAllowed(canvas, glyph, cw, minGap) : 0;
    const at = cw - shift;
    const next: string[] = [];
    for (let r = 0; r < rowCount; r++) {
      const crow = (canvas[r] ?? '').padEnd(at, ' ');
      const grow = (glyph[r] ?? '').padEnd(gw, ' ');
      let merged = crow.slice(0, at);
      for (let gx = 0; gx < gw; gx++) {
        const cx = at + gx;
        const existing = (canvas[r] ?? '')[cx] ?? ' ';
        const gc = grow[gx];
        merged += gc !== ' ' ? gc : existing;
      }
      next.push(merged);
    }
    canvas = next;
  }
  const w = Math.max(...canvas.map((r) => r.length));
  return canvas.map((r) => r.padEnd(w, ' '));
}
